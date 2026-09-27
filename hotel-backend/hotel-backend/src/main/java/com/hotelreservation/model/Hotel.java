package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    private String id;

    // "INTERNAL", "BOOKING", "EXPEDIA"
    private String source = "INTERNAL";

    // Optional provider-specific ID (for external hotels)
    private String externalId;

    private String name;
    private String description;
    private String propertyType = "Hotel"; // Hotel, Resort, Villa, Apartment, Heritage

    private Location location;

    private double rating = 4.5;
    private int reviewCount = 0;

    private List<String> images = new ArrayList<>();
    private List<String> amenities = new ArrayList<>();

    // Base starting price per night
    private Price price;

    private boolean featured = false;

    // Optional external booking URL (for partner inventory)
    private String bookingUrl;
    private String sourceUrl;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
