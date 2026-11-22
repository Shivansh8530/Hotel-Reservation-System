package com.hotelreservation.controller;

import com.hotelreservation.dto.HotelDTO;
import com.hotelreservation.dto.HotelRequest;
import com.hotelreservation.dto.HotelSearchRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.service.AdminLogService;
import com.hotelreservation.service.HotelSearchService;
import com.hotelreservation.service.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelSearchService hotelSearchService;
    private final HotelService hotelService;
    private final UserRepository userRepository;
    private final AdminLogService adminLogService;

    /**
     * Public: Get hotels list. Supports ?featured=true for landing page showcase.
     */
    @GetMapping
    public ResponseEntity<List<HotelDTO>> getHotels(
            @RequestParam(required = false, defaultValue = "false") boolean featured) {
        if (featured) {
            return ResponseEntity.ok(hotelService.getFeaturedHotels());
        }
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    /**
     * Public: Unified aggregator search across internal and partner hotel
     * providers.
     */
    @GetMapping("/search")
    public ResponseEntity<List<HotelDTO>> searchHotels(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) Integer rooms,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String sort) {

        HotelSearchRequest request = HotelSearchRequest.builder()
                .destination(destination)
                .checkIn(checkIn)
                .checkOut(checkOut)
                .guests(guests)
                .rooms(rooms)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minRating(minRating)
                .amenities(amenities)
                .propertyType(propertyType)
                .source(source)
                .sort(sort)
                .build();

        return ResponseEntity.ok(hotelSearchService.search(request));
    }

    /**
     * Public: Get hotel details by ID (works for internal and aggregated external
     * hotels).
     */
    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> getHotelById(@PathVariable String id) {
        HotelDTO hotel = hotelSearchService.getHotelDetails(id)
                .orElseThrow(() -> new ApiException("Hotel not found with ID: " + id, HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(hotel);
    }

    // ==========================================
    // ADMIN ENDPOINTS (Secured via SecurityConfig)
    // ==========================================

    @PostMapping
    public ResponseEntity<HotelDTO> createHotel(@Valid @RequestBody HotelRequest request) {
        HotelDTO created = hotelService.createHotel(request);
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            adminLogService.log(
                    currentUser,
                    "CREATED_HOTEL",
                    "HOTEL",
                    created.getId(),
                    String.format("Created hotel property '%s' (%s, %s)", created.getName(), created.getPropertyType(),
                            created.getLocation() != null ? created.getLocation().getCity() : "India"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HotelDTO> updateHotel(@PathVariable String id, @Valid @RequestBody HotelRequest request) {
        HotelDTO updated = hotelService.updateHotel(id, request);
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            adminLogService.log(
                    currentUser,
                    "UPDATED_HOTEL",
                    "HOTEL",
                    id,
                    String.format("Updated hotel property '%s'", updated.getName()));
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable String id) {
        String hotelName = id;
        try {
            var existing = hotelSearchService.getHotelDetails(id);
            if (existing.isPresent()) {
                hotelName = existing.get().getName();
            }
        } catch (Exception ignored) {
        }

        hotelService.deleteHotel(id);

        User currentUser = getCurrentUser();
        if (currentUser != null) {
            adminLogService.log(
                    currentUser,
                    "DELETED_HOTEL",
                    "HOTEL",
                    id,
                    String.format("Deleted hotel property '%s' (ID: %s)", hotelName, id));
        }
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}
