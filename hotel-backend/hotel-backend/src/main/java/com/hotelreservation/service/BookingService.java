package com.hotelreservation.service;

import com.hotelreservation.dto.BookingRequest;
import com.hotelreservation.dto.RescheduleBookingRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.Booking;
import com.hotelreservation.model.Room;
import com.hotelreservation.repository.BookingRepository;
import com.hotelreservation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final ConcurrentHashMap<String, Object> roomLocks = new ConcurrentHashMap<>();

    public Booking createBooking(String userId, BookingRequest request) {
        if (request.getCheckIn().isBefore(LocalDate.now())) {
            throw new ApiException("Check-in date cannot be in the past", HttpStatus.BAD_REQUEST);
        }

        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new ApiException("Check-out date must be after check-in date", HttpStatus.BAD_REQUEST);
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights > 30) {
            throw new ApiException("Maximum reservation duration is 30 nights", HttpStatus.BAD_REQUEST);
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));

        if (!room.isAvailable()) {
            throw new ApiException("This sanctuary room is currently unavailable for booking", HttpStatus.BAD_REQUEST);
        }

        // Synchronize room-level lock to prevent double-booking race condition
        Object lock = roomLocks.computeIfAbsent(room.getId(), k -> new Object());
        synchronized (lock) {
            boolean overlaps = bookingRepository.findByRoomId(room.getId()).stream()
                    .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                    .anyMatch(b -> request.getCheckIn().isBefore(b.getCheckOut())
                            && request.getCheckOut().isAfter(b.getCheckIn()));

            if (overlaps) {
                throw new ApiException("Room is already booked for these dates. Please choose different dates.", HttpStatus.CONFLICT);
            }

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

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new ApiException("This reservation is already cancelled", HttpStatus.BAD_REQUEST);
        }

        if (!isAdmin && booking.getCheckIn().isBefore(LocalDate.now())) {
            throw new ApiException("Cannot cancel a reservation that has already started or passed", HttpStatus.BAD_REQUEST);
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    public Booking rescheduleBooking(String bookingId, String userId, boolean isAdmin, RescheduleBookingRequest request) {
        if (request.getCheckIn().isBefore(LocalDate.now())) {
            throw new ApiException("Check-in date cannot be in the past", HttpStatus.BAD_REQUEST);
        }

        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new ApiException("Check-out date must be after check-in date", HttpStatus.BAD_REQUEST);
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights > 30) {
            throw new ApiException("Maximum reservation duration is 30 nights", HttpStatus.BAD_REQUEST);
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));

        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new ApiException("You can only reschedule your own bookings", HttpStatus.FORBIDDEN);
        }

        if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            throw new ApiException("Only confirmed bookings can be rescheduled", HttpStatus.BAD_REQUEST);
        }

        Room room = roomRepository.findById(booking.getRoomId())
                .orElseThrow(() -> new ApiException("Associated room not found", HttpStatus.NOT_FOUND));

        if (!room.isAvailable()) {
            throw new ApiException("This sanctuary room is currently marked unavailable", HttpStatus.BAD_REQUEST);
        }

        Object lock = roomLocks.computeIfAbsent(room.getId(), k -> new Object());
        synchronized (lock) {
            boolean overlaps = bookingRepository.findByRoomId(room.getId()).stream()
                    .filter(b -> !b.getId().equals(booking.getId()))
                    .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                    .anyMatch(b -> request.getCheckIn().isBefore(b.getCheckOut())
                            && request.getCheckOut().isAfter(b.getCheckIn()));

            if (overlaps) {
                throw new ApiException("The room is not available for the requested new dates. Please choose different dates.", HttpStatus.CONFLICT);
            }

            double newTotalPrice = nights * room.getPricePerNight();

            booking.setCheckIn(request.getCheckIn());
            booking.setCheckOut(request.getCheckOut());
            booking.setTotalPrice(newTotalPrice);

            return bookingRepository.save(booking);
        }
    }
}
