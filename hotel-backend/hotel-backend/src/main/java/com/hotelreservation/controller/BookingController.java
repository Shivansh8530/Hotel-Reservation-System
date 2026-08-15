package com.hotelreservation.controller;

import com.hotelreservation.dto.BookingRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.Booking;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest request) {
        String userId = currentUser().getId();
        return ResponseEntity.ok(bookingService.createBooking(userId, request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Booking>> getMyBookings() {
        String userId = currentUser().getId();
        return ResponseEntity.ok(bookingService.getBookingsForUser(userId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable String id) {
        User user = currentUser();
        boolean isAdmin = "ADMIN".equals(user.getRole());
        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getId(), isAdmin));
    }

    // Admin-only (enforced in SecurityConfig via /api/admin/** is separate;
    // here we double-check role in code for defense in depth)
    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        User user = currentUser();
        if (!"ADMIN".equals(user.getRole())) {
            throw new ApiException("Admin access required", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED));
    }
}
