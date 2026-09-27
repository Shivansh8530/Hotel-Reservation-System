package com.hotelreservation.integration;

import com.hotelreservation.dto.HotelDTO;
import com.hotelreservation.dto.HotelSearchRequest;

import java.util.List;
import java.util.Optional;

public interface HotelProvider {

    /**
     * Unique identifier for the provider (e.g. "INTERNAL", "BOOKING", "EXPEDIA")
     */
    String getProviderName();

    /**
     * Search hotels matching user criteria and return normalized HotelDTOs.
     */
    List<HotelDTO> searchHotels(HotelSearchRequest request);

    /**
     * Get detailed information for a specific hotel by ID.
     */
    Optional<HotelDTO> getHotelDetails(String hotelId);

    /**
     * Whether this provider is currently enabled in system configuration.
     */
    default boolean isEnabled() {
        return true;
    }
}
