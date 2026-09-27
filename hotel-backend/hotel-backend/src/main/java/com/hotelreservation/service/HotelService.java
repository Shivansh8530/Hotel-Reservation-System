package com.hotelreservation.service;

import com.hotelreservation.dto.HotelDTO;
import com.hotelreservation.dto.HotelRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.integration.InternalHotelProvider;
import com.hotelreservation.model.Hotel;
import com.hotelreservation.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final InternalHotelProvider internalHotelProvider;

    public List<HotelDTO> getAllHotels() {
        return hotelRepository.findAll().stream()
                .map(internalHotelProvider::toDTO)
                .toList();
    }

    public List<HotelDTO> getFeaturedHotels() {
        List<Hotel> featured = hotelRepository.findByFeaturedTrue();
        if (featured.isEmpty()) {
            featured = hotelRepository.findAll().stream().limit(6).toList();
        }
        return featured.stream()
                .map(internalHotelProvider::toDTO)
                .toList();
    }

    public Hotel getHotelById(String id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ApiException("Hotel not found with id: " + id, HttpStatus.NOT_FOUND));
    }

    public HotelDTO createHotel(HotelRequest request) {
        Hotel hotel = new Hotel();
        mapRequestToHotel(request, hotel);
        hotel.setCreatedAt(LocalDateTime.now());
        hotel.setUpdatedAt(LocalDateTime.now());
        Hotel saved = hotelRepository.save(hotel);
        return internalHotelProvider.toDTO(saved);
    }

    public HotelDTO updateHotel(String id, HotelRequest request) {
        Hotel hotel = getHotelById(id);
        mapRequestToHotel(request, hotel);
        hotel.setUpdatedAt(LocalDateTime.now());
        Hotel saved = hotelRepository.save(hotel);
        return internalHotelProvider.toDTO(saved);
    }

    public void deleteHotel(String id) {
        if (!hotelRepository.existsById(id)) {
            throw new ApiException("Hotel not found with id: " + id, HttpStatus.NOT_FOUND);
        }
        hotelRepository.deleteById(id);
    }

    private void mapRequestToHotel(HotelRequest request, Hotel hotel) {
        hotel.setName(request.getName());
        hotel.setDescription(request.getDescription());
        hotel.setPropertyType(request.getPropertyType() != null ? request.getPropertyType() : "Hotel");
        hotel.setLocation(request.getLocation());
        hotel.setRating(request.getRating());
        hotel.setReviewCount(request.getReviewCount());
        hotel.setImages(request.getImages() != null ? request.getImages() : List.of());
        hotel.setAmenities(request.getAmenities() != null ? request.getAmenities() : List.of());
        hotel.setPrice(request.getPrice());
        hotel.setFeatured(request.isFeatured());
        hotel.setSource(request.getSource() != null ? request.getSource() : "INTERNAL");
        hotel.setBookingUrl(request.getBookingUrl());
    }
}
