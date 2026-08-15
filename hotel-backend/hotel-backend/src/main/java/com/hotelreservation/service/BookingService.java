package com.hotelreservation.service;

import com.hotelreservation.dto.BookingRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.Booking;
import com.hotelreservation.model.Room;
import com.hotelreservation.repository.BookingRepository;
import com.hotelreservation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public Booking createBooking(String userId, BookingRequest request) {
        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new ApiException("Check-out date must be after check-in date", HttpStatus.BAD_REQUEST);
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));

        boolean overlaps = bookingRepository.findByRoomId(room.getId()).stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .anyMatch(b -> request.getCheckIn().isBefore(b.getCheckOut())
                        && request.getCheckOut().isAfter(b.getCheckIn()));

        if (overlaps) {
            throw new ApiException("Room is already booked for these dates", HttpStatus.CONFLICT);
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        double totalPrice = nights * room.getPricePerNight();

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setRoomId(room.getId());
        booking.setCheckIn(request.getCheckIn());
        booking.setCheckOut(request.getCheckOut());
        booking.setTotalPrice(totalPrice);
        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsForUser(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking cancelBooking(String bookingId, String userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));

        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new ApiException("You can only cancel your own bookings", HttpStatus.FORBIDDEN);
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }
}
