package com.hotelreservation.controller;

import com.hotelreservation.dto.SignupRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.AdminLog;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.service.AdminLogService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminLogService adminLogService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        // Exclude passwords from response, surface owner/super admin flag
        List<UserResponse> users = userRepository.findAll().stream()
                .map(u -> new UserResponse(
                        u.getId(),
                        u.getName(),
                        u.getEmail(),
                        u.getRole(),
                        u.getPhone(),
                        u.isOwnerOrSuperAdmin()))
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createAdminUser(@Valid @RequestBody SignupRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser == null || !currentUser.isOwnerOrSuperAdmin()) {
            throw new ApiException("Access denied. Only the Owner/Super Admin can create or invite new admins.",
                    HttpStatus.FORBIDDEN);
        }

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

        adminLogService.log(
                currentUser,
                "INVITED_ADMIN",
                "USER",
                saved.getId(),
                String.format("Created new Admin account for '%s' (%s)", saved.getName(), saved.getEmail()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UserResponse(
                        saved.getId(),
                        saved.getName(),
                        saved.getEmail(),
                        saved.getRole(),
                        saved.getPhone(),
                        saved.isOwnerOrSuperAdmin()));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable String id,
            @RequestBody RoleUpdateRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser == null || !currentUser.isOwnerOrSuperAdmin()) {
            throw new ApiException("Access denied. Only the Owner/Super Admin can promote or demote users.",
                    HttpStatus.FORBIDDEN);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (user.isOwnerOrSuperAdmin()) {
            throw new ApiException("The Owner/Super Admin account cannot be modified or demoted.",
                    HttpStatus.BAD_REQUEST);
        }

        if (!"ADMIN".equalsIgnoreCase(request.getRole()) && !"USER".equalsIgnoreCase(request.getRole())) {
            throw new ApiException("Invalid role. Must be 'ADMIN' or 'USER'", HttpStatus.BAD_REQUEST);
        }

        String normalizedRole = request.getRole().toUpperCase();
        String previousRole = user.getRole();
        user.setRole(normalizedRole);
        User saved = userRepository.save(user);

        String action = "ADMIN".equalsIgnoreCase(normalizedRole) ? "PROMOTED_USER" : "DEMOTED_USER";
        adminLogService.log(
                currentUser,
                action,
                "USER",
                saved.getId(),
                String.format("%s user '%s' (%s) from %s to %s",
                        action.startsWith("PROMOTE") ? "Promoted" : "Demoted",
                        saved.getName(),
                        saved.getEmail(),
                        previousRole != null ? previousRole : "USER",
                        normalizedRole));

        return ResponseEntity.ok(
                new UserResponse(
                        saved.getId(),
                        saved.getName(),
                        saved.getEmail(),
                        saved.getRole(),
                        saved.getPhone(),
                        saved.isOwnerOrSuperAdmin()));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AdminLog>> getAdminLogs() {
        return ResponseEntity.ok(adminLogService.getAllLogs());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
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
        private final boolean isOwner;
    }
}