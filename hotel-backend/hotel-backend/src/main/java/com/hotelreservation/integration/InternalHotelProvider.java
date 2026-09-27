package com.hotelreservation.integration;

import com.hotelreservation.dto.HotelDTO;
import com.hotelreservation.dto.HotelSearchRequest;
import com.hotelreservation.model.Hotel;
import com.hotelreservation.model.Price;
import com.hotelreservation.model.Room;
import com.hotelreservation.repository.HotelRepository;
import com.hotelreservation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class InternalHotelProvider implements HotelProvider {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    @Override
    public String getProviderName() {
        return "INTERNAL";
    }

    @Override
    public List<HotelDTO> searchHotels(HotelSearchRequest request) {
        List<Hotel> hotels;

        if (request.getDestination() != null && !request.getDestination().trim().isEmpty()) {
            hotels = hotelRepository.searchByNameOrCity(request.getDestination().trim());
        } else {
            hotels = hotelRepository.findAll();
        }

        return hotels.stream()
                .filter(h -> "INTERNAL".equalsIgnoreCase(h.getSource()) || h.getSource() == null)
                .map(this::toDTO)
                .toList();
    }

    @Override
    public Optional<HotelDTO> getHotelDetails(String hotelId) {
        return hotelRepository.findById(hotelId).map(this::toDTOWithRooms);
    }

    public HotelDTO toDTO(Hotel hotel) {
        List<Room> rooms = roomRepository.findByHotelId(hotel.getId());
        Price effectivePrice = resolveStartingPrice(hotel, rooms);

        return HotelDTO.builder()
                .id(hotel.getId())
                .source("INTERNAL")
                .providerLabel("StayEase Direct")
                .externalId(null)
                .name(hotel.getName())
                .description(hotel.getDescription())
                .propertyType(hotel.getPropertyType())
                .location(hotel.getLocation())
                .rating(hotel.getRating())
                .reviewCount(hotel.getReviewCount())
                .images(hotel.getImages() != null ? hotel.getImages() : List.of())
                .amenities(hotel.getAmenities() != null ? hotel.getAmenities() : List.of())
                .price(effectivePrice)
                .featured(hotel.isFeatured())
                .bookingUrl(null)
                .sourceUrl(null)
                .rooms(rooms)
                .build();
    }

    private HotelDTO toDTOWithRooms(Hotel hotel) {
        List<Room> rooms = roomRepository.findByHotelId(hotel.getId());
        HotelDTO dto = toDTO(hotel);
        dto.setRooms(rooms);
        return dto;
    }

    private Price resolveStartingPrice(Hotel hotel, List<Room> rooms) {
        if (rooms != null && !rooms.isEmpty()) {
            double minRoomPrice = rooms.stream()
                    .mapToDouble(Room::getPricePerNight)
                    .min()
                    .orElse(hotel.getPrice() != null ? hotel.getPrice().getAmount() : 3500.0);
            return new Price(minRoomPrice, "INR", false);
        }
        return hotel.getPrice() != null ? hotel.getPrice() : new Price(3500.0, "INR", false);
    }
}
