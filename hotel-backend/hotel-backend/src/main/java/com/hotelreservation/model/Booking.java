package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    private String userId;
    private String roomId;

    private LocalDate checkIn;
    private LocalDate checkOut;

    private double totalPrice;
    private String status; // "CONFIRMED", "CANCELLED", "COMPLETED"

    private LocalDateTime createdAt = LocalDateTime.now();
}
