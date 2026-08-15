package com.hotelreservation.controller;

import com.hotelreservation.dto.ReviewRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.Review;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    // Public: Get reviews for a room
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Review>> getReviewsForRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(reviewService.getReviewsForRoom(roomId));
    }

    // Authenticated: Create a review
    @PostMapping
    public ResponseEntity<Review> createReview(@Valid @RequestBody ReviewRequest request) {
        String userId = currentUser().getId();
        return ResponseEntity.ok(reviewService.createReview(userId, request));
    }

    // Authenticated/Admin: Delete a review
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        User user = currentUser();
        boolean isAdmin = "ADMIN".equals(user.getRole());
        reviewService.deleteReview(id, user.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED));
    }
}
