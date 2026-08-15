package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    private String id;

    private String roomNumber;
    private String roomType;      // e.g. "Single", "Double", "Suite"
    private double pricePerNight;
    private int capacity;
    private List<String> amenities;
    private String description;
    private boolean available = true;
    private String imageUrl;
}
