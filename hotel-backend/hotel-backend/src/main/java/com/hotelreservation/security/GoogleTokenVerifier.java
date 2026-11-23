package com.hotelreservation.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotelreservation.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.PublicKey;
import java.security.Signature;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class GoogleTokenVerifier {

    private static final String FIREBASE_CERT_URL =
            "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
    private static final String GOOGLE_TOKENINFO_URL =
            "https://oauth2.googleapis.com/tokeninfo?id_token=";
    private static final String EXPECTED_PROJECT_ID = "hotel-resevation-8080";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, PublicKey> cachedPublicKeys = new ConcurrentHashMap<>();
    private long cacheExpiry = 0;

    public record VerifiedGoogleUser(String email, String name, String uid) {}

    public VerifiedGoogleUser verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new ApiException("Authentication failed: Missing ID token", HttpStatus.UNAUTHORIZED);
        }

        try {
            // Attempt 1: Verify as Firebase ID token (JWT with Google x509 cert)
            VerifiedGoogleUser user = verifyFirebaseIdToken(idToken);
            if (user != null) {
                return user;
            }
        } catch (Exception e) {
            log.warn("Firebase token signature verification returned: {}", e.getMessage());
        }

        try {
            // Attempt 2: Verify via Google's OAuth2 tokeninfo endpoint
            VerifiedGoogleUser user = verifyViaGoogleTokenInfo(idToken);
            if (user != null) {
                return user;
            }
        } catch (Exception e) {
            log.warn("Google tokeninfo verification returned: {}", e.getMessage());
        }

        throw new ApiException("Google authentication failed: ID token is invalid, expired, or untrusted.", HttpStatus.UNAUTHORIZED);
    }

    private VerifiedGoogleUser verifyFirebaseIdToken(String idToken) throws Exception {
        String[] parts = idToken.split("\\.");
        if (parts.length != 3) {
            return null;
        }

        String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
        JsonNode headerNode = objectMapper.readTree(headerJson);
        String kid = headerNode.path("kid").asText(null);
        if (kid == null) {
            return null;
        }

        PublicKey publicKey = getPublicKey(kid);
        if (publicKey == null) {
            return null;
        }

        // Verify cryptographic signature (SHA256withRSA)
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initVerify(publicKey);
        signature.update((parts[0] + "." + parts[1]).getBytes(StandardCharsets.UTF_8));
        byte[] sigBytes = Base64.getUrlDecoder().decode(parts[2]);
        if (!signature.verify(sigBytes)) {
            log.warn("Invalid signature for kid {}", kid);
            return null;
        }

        // Verify claims
        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        JsonNode payload = objectMapper.readTree(payloadJson);

        long exp = payload.path("exp").asLong(0);
        long now = System.currentTimeMillis() / 1000;
        if (exp < now) {
            log.warn("Firebase token expired at {} (now {})", exp, now);
            return null;
        }

        String aud = payload.path("aud").asText("");
        if (!EXPECTED_PROJECT_ID.equals(aud)) {
            log.warn("Audience mismatch: expected {}, got {}", EXPECTED_PROJECT_ID, aud);
            return null;
        }

        String iss = payload.path("iss").asText("");
        if (!("https://securetoken.google.com/" + EXPECTED_PROJECT_ID).equals(iss)) {
            log.warn("Issuer mismatch: got {}", iss);
            return null;
        }

        String email = payload.path("email").asText(null);
        if (email == null || email.isBlank()) {
            return null;
        }

        boolean emailVerified = payload.path("email_verified").asBoolean(false);
        if (!emailVerified) {
            log.warn("Email {} is not verified in Google account", email);
            return null;
        }

        String name = payload.path("name").asText(email.split("@")[0]);
        String uid = payload.path("sub").asText("");

        return new VerifiedGoogleUser(email, name, uid);
    }

    private VerifiedGoogleUser verifyViaGoogleTokenInfo(String idToken) {
        try {
            String response = restTemplate.getForObject(GOOGLE_TOKENINFO_URL + idToken, String.class);
            if (response == null) return null;

            JsonNode node = objectMapper.readTree(response);
            if (node.has("error")) {
                return null;
            }

            String email = node.path("email").asText(null);
            boolean emailVerified = node.path("email_verified").asBoolean(false)
                    || "true".equalsIgnoreCase(node.path("email_verified").asText());

            if (email != null && !email.isBlank() && emailVerified) {
                String name = node.path("name").asText(email.split("@")[0]);
                String sub = node.path("sub").asText("");
                return new VerifiedGoogleUser(email, name, sub);
            }
        } catch (Exception e) {
            log.debug("Tokeninfo lookup failed: {}", e.getMessage());
        }
        return null;
    }

    private synchronized PublicKey getPublicKey(String kid) {
        if (System.currentTimeMillis() > cacheExpiry || !cachedPublicKeys.containsKey(kid)) {
            refreshPublicKeys();
        }
        return cachedPublicKeys.get(kid);
    }

    private void refreshPublicKeys() {
        try {
            String json = restTemplate.getForObject(FIREBASE_CERT_URL, String.class);
            if (json == null) return;

            JsonNode root = objectMapper.readTree(json);
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            cachedPublicKeys.clear();

            root.fields().forEachRemaining(entry -> {
                try {
                    String certPem = entry.getValue().asText();
                    ByteArrayInputStream bais = new ByteArrayInputStream(certPem.getBytes(StandardCharsets.UTF_8));
                    X509Certificate cert = (X509Certificate) cf.generateCertificate(bais);
                    cachedPublicKeys.put(entry.getKey(), cert.getPublicKey());
                } catch (Exception ex) {
                    log.error("Failed to parse cert for kid {}: {}", entry.getKey(), ex.getMessage());
                }
            });

            cacheExpiry = System.currentTimeMillis() + (6 * 3600 * 1000); // 6 hour cache
        } catch (Exception e) {
            log.error("Failed to fetch Google public keys: {}", e.getMessage());
        }
    }
}
