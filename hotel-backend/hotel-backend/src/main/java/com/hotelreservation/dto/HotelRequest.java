package com.hotelreservation.dto;

import com.hotelreservation.model.Location;
import com.hotelreservation.model.Price;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class HotelRequest {

    @NotBlank(message = "Hotel name is required")
    private String name;

    private String description;
    private String propertyType = "Hotel";

    @NotNull(message = "Location is required")
    private Location location;

    private double rating = 4.5;
    private int reviewCount = 0;

    private List<String> images;
    private List<String> amenities;

    private Price price;

    private boolean featured = false;
    private String source = "INTERNAL";
    private String bookingUrl;
}
