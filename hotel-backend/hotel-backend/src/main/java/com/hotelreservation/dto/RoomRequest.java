package com.hotelreservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class RoomRequest {

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotBlank(message = "Room type is required")
    private String roomType;

    @Positive(message = "Price must be greater than 0")
    private double pricePerNight;

    @Positive(message = "Capacity must be greater than 0")
    private int capacity;

    private List<String> amenities;
    private String description;
    private String imageUrl;
    private boolean available = true;
}
