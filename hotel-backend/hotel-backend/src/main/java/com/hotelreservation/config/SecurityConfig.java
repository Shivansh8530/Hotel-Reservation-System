package com.hotelreservation.config;

import com.hotelreservation.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000,https://hotel-resevation-8080.web.app,https://hotel-resevation-8080.firebaseapp.com}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

                        // Admin-only endpoints
                        .requestMatchers(HttpMethod.POST, "/api/rooms/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_OWNER", "ROLE_SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_OWNER", "ROLE_SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_OWNER", "ROLE_SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/hotels/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_OWNER", "ROLE_SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/hotels/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_OWNER", "ROLE_SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/hotels/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_OWNER", "ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/admin/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_OWNER", "ROLE_SUPER_ADMIN")

                        // Everything else needs a valid JWT
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
