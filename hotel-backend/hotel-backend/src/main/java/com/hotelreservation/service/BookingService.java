package com.hotelreservation.service;

import com.hotelreservation.dto.BookingRequest;
import com.hotelreservation.dto.RescheduleBookingRequest;
import com.hotelreservation.exception.ApiException;
import com.hotelreservation.model.Booking;
import com.hotelreservation.model.Room;
import com.hotelreservation.repository.BookingRepository;
import com.hotelreservation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final ConcurrentHashMap<String, Object> roomLocks = new ConcurrentHashMap<>();

    public Booking createBooking(String userId, BookingRequest request) {
        if (userId == null || userId.isBlank()) {
            throw new ApiException("Authentication required: Invalid user reference", HttpStatus.UNAUTHORIZED);
        }

        if (request == null) {
            throw new ApiException("Booking details are required", HttpStatus.BAD_REQUEST);
        }

        if (request.getRoomId() == null || request.getRoomId().isBlank()) {
            throw new ApiException("Room ID is required", HttpStatus.BAD_REQUEST);
        }

        if (request.getCheckIn() == null || request.getCheckOut() == null) {
            throw new ApiException("Check-in and check-out dates are required", HttpStatus.BAD_REQUEST);
        }

        // Allow for up to 1-day timezone skew between client and cloud server
        if (request.getCheckIn().isBefore(LocalDate.now().minusDays(1))) {
            throw new ApiException("Check-in date cannot be in the past", HttpStatus.BAD_REQUEST);
        }

        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new ApiException("Check-out date must be strictly after check-in date", HttpStatus.BAD_REQUEST);
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0) {
            throw new ApiException("Reservation must be for at least 1 night", HttpStatus.BAD_REQUEST);
        }

        if (nights > 30) {
            throw new ApiException("Maximum reservation duration is 30 nights", HttpStatus.BAD_REQUEST);
        }

        Room room = roomRepository.findById(request.getRoomId().trim())
                .orElseThrow(() -> new ApiException("Selected room does not exist", HttpStatus.NOT_FOUND));

        if (!room.isAvailable()) {
            throw new ApiException("This sanctuary room is currently marked unavailable for bookings", HttpStatus.BAD_REQUEST);
        }

        // Synchronize on room ID to prevent concurrent double-booking race condition
        Object lock = roomLocks.computeIfAbsent(room.getId(), k -> new Object());
        synchronized (lock) {
            List<Booking> existingBookings = bookingRepository.findByRoomId(room.getId());
            boolean overlaps = existingBookings != null && existingBookings.stream()
                    .filter(b -> b != null && b.getStatus() != null && "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                    .filter(b -> b.getCheckIn() != null && b.getCheckOut() != null)
                    .anyMatch(b -> request.getCheckIn().isBefore(b.getCheckOut())
                            && request.getCheckOut().isAfter(b.getCheckIn()));

            if (overlaps) {
                throw new ApiException("The room is already reserved for the selected dates. Please choose different dates.", HttpStatus.CONFLICT);
            }

            double rate = Math.max(0.0, room.getPricePerNight());
            double totalPrice = nights * rate;

            Booking booking = new Booking();
            booking.setUserId(userId.trim());
            booking.setRoomId(room.getId());
            booking.setCheckIn(request.getCheckIn());
            booking.setCheckOut(request.getCheckOut());
            booking.setTotalPrice(totalPrice);
            booking.setStatus("CONFIRMED");

            log.info("Creating booking for room {} from {} to {} by user {}", room.getId(), request.getCheckIn(), request.getCheckOut(), userId);
            return bookingRepository.save(booking);
        }
    }

    public List<Booking> getBookingsForUser(String userId) {
        if (userId == null || userId.isBlank()) {
            return Collections.emptyList();
        }
        return bookingRepository.findByUserId(userId.trim());
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(String bookingId) {
        if (bookingId == null || bookingId.isBlank()) {
            throw new ApiException("Booking ID is required", HttpStatus.BAD_REQUEST);
        }
        return bookingRepository.findById(bookingId.trim())
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));
    }

    public Booking cancelBooking(String bookingId, String userId, boolean isAdmin) {
        if (bookingId == null || bookingId.isBlank()) {
            throw new ApiException("Booking ID is required", HttpStatus.BAD_REQUEST);
        }

        Booking booking = bookingRepository.findById(bookingId.trim())
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        if (!isAdmin && (booking.getUserId() == null || !booking.getUserId().equals(userId))) {
            throw new ApiException("You can only cancel your own bookings", HttpStatus.FORBIDDEN);
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new ApiException("This reservation is already cancelled", HttpStatus.BAD_REQUEST);
        }

        if (!isAdmin && booking.getCheckIn() != null && booking.getCheckIn().isBefore(LocalDate.now())) {
            throw new ApiException("Cannot cancel a reservation that has already started or passed", HttpStatus.BAD_REQUEST);
        }

        booking.setStatus("CANCELLED");
        log.info("Reservation {} cancelled by user {} (admin: {})", bookingId, userId, isAdmin);
        return bookingRepository.save(booking);
    }

    public Booking rescheduleBooking(String bookingId, String userId, boolean isAdmin, RescheduleBookingRequest request) {
        if (bookingId == null || bookingId.isBlank()) {
            throw new ApiException("Booking ID is required", HttpStatus.BAD_REQUEST);
        }

        if (request == null) {
            throw new ApiException("New reservation dates are required", HttpStatus.BAD_REQUEST);
        }

        if (request.getCheckIn() == null || request.getCheckOut() == null) {
            throw new ApiException("Check-in and check-out dates are required", HttpStatus.BAD_REQUEST);
        }

        if (request.getCheckIn().isBefore(LocalDate.now().minusDays(1))) {
            throw new ApiException("Check-in date cannot be in the past", HttpStatus.BAD_REQUEST);
        }

        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new ApiException("Check-out date must be strictly after check-in date", HttpStatus.BAD_REQUEST);
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0) {
            throw new ApiException("Reservation must be for at least 1 night", HttpStatus.BAD_REQUEST);
        }

        if (nights > 30) {
            throw new ApiException("Maximum reservation duration is 30 nights", HttpStatus.BAD_REQUEST);
        }

        Booking booking = bookingRepository.findById(bookingId.trim())
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        if (!isAdmin && (booking.getUserId() == null || !booking.getUserId().equals(userId))) {
            throw new ApiException("You can only reschedule your own bookings", HttpStatus.FORBIDDEN);
        }

        if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            throw new ApiException("Only confirmed reservations can be rescheduled", HttpStatus.BAD_REQUEST);
        }

        if (booking.getRoomId() == null || booking.getRoomId().isBlank()) {
            throw new ApiException("Associated room is invalid", HttpStatus.BAD_REQUEST);
        }

        Room room = roomRepository.findById(booking.getRoomId().trim())
                .orElseThrow(() -> new ApiException("Associated room not found", HttpStatus.NOT_FOUND));

        if (!room.isAvailable()) {
            throw new ApiException("This sanctuary room is currently marked unavailable", HttpStatus.BAD_REQUEST);
        }

        Object lock = roomLocks.computeIfAbsent(room.getId(), k -> new Object());
        synchronized (lock) {
            List<Booking> existingBookings = bookingRepository.findByRoomId(room.getId());
            boolean overlaps = existingBookings != null && existingBookings.stream()
                    .filter(b -> b != null && b.getId() != null && !b.getId().equals(booking.getId()))
                    .filter(b -> b.getStatus() != null && "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                    .filter(b -> b.getCheckIn() != null && b.getCheckOut() != null)
                    .anyMatch(b -> request.getCheckIn().isBefore(b.getCheckOut())
                            && request.getCheckOut().isAfter(b.getCheckIn()));

            if (overlaps) {
                throw new ApiException("The room is not available for the requested new dates. Please choose different dates.", HttpStatus.CONFLICT);
            }

            double rate = Math.max(0.0, room.getPricePerNight());
            double newTotalPrice = nights * rate;

            booking.setCheckIn(request.getCheckIn());
            booking.setCheckOut(request.getCheckOut());
            booking.setTotalPrice(newTotalPrice);

            log.info("Reservation {} rescheduled to {} - {} by user {}", bookingId, request.getCheckIn(), request.getCheckOut(), userId);
            return bookingRepository.save(booking);
        }
    }
}
