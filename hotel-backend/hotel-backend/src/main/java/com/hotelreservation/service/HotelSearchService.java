package com.hotelreservation.service;

import com.hotelreservation.dto.HotelDTO;
import com.hotelreservation.dto.HotelSearchRequest;
import com.hotelreservation.integration.HotelProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelSearchService {

    private final List<HotelProvider> providers;

    /**
     * Unified hotel search aggregating internal inventory and external partner providers.
     */
    public List<HotelDTO> search(HotelSearchRequest request) {
        List<HotelDTO> combined = new ArrayList<>();

        for (HotelProvider provider : providers) {
            if (provider.isEnabled()) {
                try {
                    List<HotelDTO> providerHotels = provider.searchHotels(request);
                    if (providerHotels != null) {
                        combined.addAll(providerHotels);
                    }
                } catch (Exception e) {
                    System.err.println("Provider " + provider.getProviderName() + " search failed: " + e.getMessage());
                }
            }
        }

        return applyFiltersAndSort(combined, request);
    }

    /**
     * Fetch hotel details across all registered providers.
     */
    public Optional<HotelDTO> getHotelDetails(String hotelId) {
        for (HotelProvider provider : providers) {
            Optional<HotelDTO> details = provider.getHotelDetails(hotelId);
            if (details.isPresent()) {
                return details;
            }
        }
        return Optional.empty();
    }

    private List<HotelDTO> applyFiltersAndSort(List<HotelDTO> hotels, HotelSearchRequest request) {
        return hotels.stream()
                .filter(h -> filterBySource(h, request.getSource()))
                .filter(h -> filterByPrice(h, request.getMinPrice(), request.getMaxPrice()))
                .filter(h -> filterByRating(h, request.getMinRating()))
                .filter(h -> filterByPropertyType(h, request.getPropertyType()))
                .filter(h -> filterByAmenities(h, request.getAmenities()))
                .sorted(getComparator(request.getSort()))
                .collect(Collectors.toList());
    }

    private boolean filterBySource(HotelDTO hotel, String requestedSource) {
        if (requestedSource == null || requestedSource.trim().isEmpty() || "ALL".equalsIgnoreCase(requestedSource)) {
            return true;
        }
        return requestedSource.equalsIgnoreCase(hotel.getSource());
    }

    private boolean filterByPrice(HotelDTO hotel, Double minPrice, Double maxPrice) {
        if (hotel.getPrice() == null) return true;
        double amount = hotel.getPrice().getAmount();
        if (minPrice != null && amount < minPrice) return false;
        if (maxPrice != null && amount > maxPrice) return false;
        return true;
    }

    private boolean filterByRating(HotelDTO hotel, Double minRating) {
        if (minRating == null) return true;
        return hotel.getRating() >= minRating;
    }

    private boolean filterByPropertyType(HotelDTO hotel, String propertyType) {
        if (propertyType == null || propertyType.trim().isEmpty() || "ALL".equalsIgnoreCase(propertyType)) {
            return true;
        }
        return propertyType.equalsIgnoreCase(hotel.getPropertyType());
    }

    private boolean filterByAmenities(HotelDTO hotel, List<String> requestedAmenities) {
        if (requestedAmenities == null || requestedAmenities.isEmpty()) {
            return true;
        }
        if (hotel.getAmenities() == null || hotel.getAmenities().isEmpty()) {
            return false;
        }
        List<String> hotelAmenitiesLower = hotel.getAmenities().stream()
                .map(String::toLowerCase)
                .toList();

        // Hotel should match all requested amenities
        return requestedAmenities.stream()
                .allMatch(req -> hotelAmenitiesLower.stream().anyMatch(ha -> ha.contains(req.toLowerCase())));
    }

    private Comparator<HotelDTO> getComparator(String sort) {
        if (sort == null) return defaultComparator();

        return switch (sort.toLowerCase()) {
            case "price_asc" -> Comparator.comparingDouble(h -> h.getPrice() != null ? h.getPrice().getAmount() : Double.MAX_VALUE);
            case "price_desc" -> Comparator.comparingDouble((HotelDTO h) -> h.getPrice() != null ? h.getPrice().getAmount() : 0.0).reversed();
            case "rating_desc" -> Comparator.comparingDouble(HotelDTO::getRating).reversed();
            default -> defaultComparator();
        };
    }

    private Comparator<HotelDTO> defaultComparator() {
        // Featured hotels first, then highest rating & review count
        return (h1, h2) -> {
            if (h1.isFeatured() != h2.isFeatured()) {
                return h1.isFeatured() ? -1 : 1;
            }
            double score1 = h1.getRating() * Math.log10(Math.max(10, h1.getReviewCount()));
            double score2 = h2.getRating() * Math.log10(Math.max(10, h2.getReviewCount()));
            return Double.compare(score2, score1);
        };
    }
}
