package com.hotelreservation.dto;

import com.hotelreservation.model.Location;
import com.hotelreservation.model.Price;
import com.hotelreservation.model.Room;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {

    private String id;
    private String source;          // "INTERNAL", "BOOKING", "EXPEDIA"
    private String providerLabel;   // e.g. "Direct Partner", "Available via Booking.com", "Available via Expedia"
    private String externalId;

    private String name;
    private String description;
    private String propertyType;    // "Hotel", "Resort", "Villa", "Apartment"

    private Location location;

    private double rating;
    private int reviewCount;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    private Price price;            // Base or lowest nightly rate

    private boolean featured;

    private String bookingUrl;
    private String sourceUrl;

    @Builder.Default
    private List<Room> rooms = new ArrayList<>(); // Available or associated rooms
}
