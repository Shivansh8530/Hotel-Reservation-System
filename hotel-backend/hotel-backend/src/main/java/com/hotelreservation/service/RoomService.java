package com.hotelreservation.service;

import com.hotelreservation.dto.RoomRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.Booking;
import com.hotelreservation.model.Room;
import com.hotelreservation.repository.BookingRepository;
import com.hotelreservation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Returns rooms that are marked available AND have no overlapping confirmed
     * booking for the requested date range.
     */
    public List<Room> searchAvailableRooms(LocalDate checkIn, LocalDate checkOut) {
        List<Room> candidateRooms = roomRepository.findByAvailableTrue();

        return candidateRooms.stream()
                .filter(room -> isRoomFreeForDates(room.getId(), checkIn, checkOut))
                .toList();
    }

    private boolean isRoomFreeForDates(String roomId, LocalDate checkIn, LocalDate checkOut) {
        List<Booking> existingBookings = bookingRepository.findByRoomId(roomId);

        return existingBookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .noneMatch(b -> checkIn.isBefore(b.getCheckOut()) && checkOut.isAfter(b.getCheckIn()));
    }

    public Room createRoom(RoomRequest request) {
        Room room = new Room();
        mapRequestToRoom(request, room);
        return roomRepository.save(room);
    }

    public Room updateRoom(String id, RoomRequest request) {
        Room room = getRoomById(id);
        mapRequestToRoom(request, room);
        return roomRepository.save(room);
    }

    public void deleteRoom(String id) {
        if (!roomRepository.existsById(id)) {
            throw new ApiException("Room not found", HttpStatus.NOT_FOUND);
        }
        roomRepository.deleteById(id);
    }

    private void mapRequestToRoom(RoomRequest request, Room room) {
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity());
        room.setAmenities(request.getAmenities());
        room.setDescription(request.getDescription());
        room.setImageUrl(request.getImageUrl());
        room.setAvailable(request.isAvailable());
    }
}
