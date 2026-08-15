package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String roomId;

    private int rating; // 1 to 5
    private String title;
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}
