package com.hotelreservation.service;

import com.hotelreservation.dto.ReviewRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.Review;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.ReviewRepository;
import com.hotelreservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public List<Review> getReviewsForRoom(String roomId) {
        return reviewRepository.findByRoomId(roomId);
    }

    public Review createReview(String userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Review review = new Review();
        review.setUserId(userId);
        review.setUserName(user.getName()); // Save name for easy display
        review.setRoomId(request.getRoomId());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());

        return reviewRepository.save(review);
    }

    public void deleteReview(String id, String userId, boolean isAdmin) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ApiException("Review not found", HttpStatus.NOT_FOUND));

        if (!isAdmin && !review.getUserId().equals(userId)) {
            throw new ApiException("You can only delete your own reviews", HttpStatus.FORBIDDEN);
        }

        reviewRepository.deleteById(id);
    }
}
