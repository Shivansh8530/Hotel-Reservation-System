package com.hotelreservation.repository;

import com.hotelreservation.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByRoomId(String roomId);
    List<Review> findByUserId(String userId);
}
