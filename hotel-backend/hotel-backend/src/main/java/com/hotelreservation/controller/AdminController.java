package com.hotelreservation.controller;

import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.dto.SignupRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        // Exclude passwords from response
        List<UserResponse> users = userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getPhone()))
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createAdminUser(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("An account with this email already exists", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole("ADMIN");

        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UserResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(),
                        saved.getPhone()));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable String id,
            @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (!"ADMIN".equals(request.getRole()) && !"USER".equals(request.getRole())) {
            throw new ApiException("Invalid role. Must be 'ADMIN' or 'USER'", HttpStatus.BAD_REQUEST);
        }

        user.setRole(request.getRole());
        User saved = userRepository.save(user);

        return ResponseEntity.ok(
                new UserResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(), saved.getPhone()));
    }

    @Data
    public static class RoleUpdateRequest {
        private String role;
    }

    @Data
    public static class UserResponse {

        private final String id;
        private final String name;
        private final String email;
        private final String role;
        private final String phone;
    }
}
