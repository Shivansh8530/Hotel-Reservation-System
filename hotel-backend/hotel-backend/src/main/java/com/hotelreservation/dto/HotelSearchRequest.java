package com.hotelreservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelSearchRequest {

    private String destination;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkIn;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkOut;

    private Integer guests;
    private Integer rooms;

    private Double minPrice;
    private Double maxPrice;
    private Double minRating;

    private List<String> amenities;
    private String propertyType;

    // Filter by source if requested ("ALL", "INTERNAL", "BOOKING", "EXPEDIA")
    private String source;

    // "recommended", "price_asc", "price_desc", "rating_desc"
    private String sort;
}
