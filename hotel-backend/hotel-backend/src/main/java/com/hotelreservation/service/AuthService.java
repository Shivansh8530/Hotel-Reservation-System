package com.hotelreservation.service;

import com.hotelreservation.dto.AuthResponse;
import com.hotelreservation.dto.LoginRequest;
import com.hotelreservation.dto.SignupRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.security.GoogleTokenVerifier;
import com.hotelreservation.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final EmailService emailService;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("An account with this email already exists", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole("USER"); // every signup is a regular user; admins are promoted directly in the DB

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId(), saved.getRole());

        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public void forgotPassword(com.hotelreservation.dto.ForgotPasswordRequest request) {
        java.util.Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // OWASP best practice: do not leak whether an account exists
            log.info("Password reset requested for unregistered email: {}", request.getEmail());
            return;
        }

        User user = userOpt.get();
        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15)); // 15 mins expiry
        userRepository.save(user);

        String resetLink = "https://hotel-resevation-8080.web.app/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    public void resetPassword(com.hotelreservation.dto.ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new ApiException("Invalid or expired reset token", HttpStatus.BAD_REQUEST));

        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new ApiException("Reset token has expired", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    public AuthResponse googleLogin(com.hotelreservation.dto.GoogleAuthRequest request) {
        // Authenticate cryptographically using Google ID Token
        GoogleTokenVerifier.VerifiedGoogleUser verifiedUser = googleTokenVerifier.verify(request.getIdToken());
        String email = verifiedUser.email();

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            String name = (request.getName() != null && !request.getName().isBlank())
                    ? request.getName()
                    : verifiedUser.name();
            newUser.setName(name);
            newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            newUser.setRole("USER");
            return userRepository.save(newUser);
        });

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
