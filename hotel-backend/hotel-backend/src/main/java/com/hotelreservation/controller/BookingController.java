package com.hotelreservation.controller;

import com.hotelreservation.dto.BookingRequest;
import com.hotelreservation.dto.RescheduleBookingRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.Booking;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.service.AdminLogService;
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
    private final AdminLogService adminLogService;

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
        boolean isAdmin = user.isAdminOrOwner();
        Booking cancelled = bookingService.cancelBooking(id, user.getId(), isAdmin);

        if (isAdmin) {
            adminLogService.log(
                    user,
                    "CANCELLED_BOOKING",
                    "BOOKING",
                    id,
                    String.format("Admin cancelled booking reference %s", id)
            );
        }

        return ResponseEntity.ok(cancelled);
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Booking> rescheduleBooking(
            @PathVariable String id,
            @Valid @RequestBody RescheduleBookingRequest request) {
        User user = currentUser();
        boolean isAdmin = user.isAdminOrOwner();
        Booking rescheduled = bookingService.rescheduleBooking(id, user.getId(), isAdmin, request);

        if (isAdmin) {
            adminLogService.log(
                    user,
                    "RESCHEDULED_BOOKING",
                    "BOOKING",
                    id,
                    String.format("Rescheduled booking reference %s to %s - %s (Total: ₹%.0f)",
                            id, rescheduled.getCheckIn(), rescheduled.getCheckOut(), rescheduled.getTotalPrice())
            );
        }

        return ResponseEntity.ok(rescheduled);
    }

    // Admin-only (enforced in SecurityConfig via /api/admin/** is separate;
    // here we double-check role in code for defense in depth)
    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        User user = currentUser();
        if (!user.isAdminOrOwner()) {
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
