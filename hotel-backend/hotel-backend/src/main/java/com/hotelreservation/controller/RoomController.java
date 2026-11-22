package com.hotelreservation.controller;

import com.hotelreservation.dto.RoomRequest;
import com.hotelreservation.model.Room;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.service.AdminLogService;
import com.hotelreservation.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final UserRepository userRepository;
    private final AdminLogService adminLogService;

    // Public: list all rooms, or search available rooms by date range
    @GetMapping
    public ResponseEntity<List<Room>> getRooms(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        if (checkIn != null && checkOut != null) {
            return ResponseEntity.ok(roomService.searchAvailableRooms(checkIn, checkOut));
        }
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoom(@PathVariable String id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Room>> getRoomsByHotel(@PathVariable String hotelId) {
        return ResponseEntity.ok(roomService.getRoomsByHotel(hotelId));
    }

    // Admin-only (enforced in SecurityConfig)
    @PostMapping
    public ResponseEntity<Room> createRoom(@Valid @RequestBody RoomRequest request) {
        Room created = roomService.createRoom(request);
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            adminLogService.log(
                    currentUser,
                    "CREATED_ROOM",
                    "ROOM",
                    created.getId(),
                    String.format("Added room unit %s (%s, ₹%.0f/night)", created.getRoomNumber(), created.getRoomType(), created.getPricePerNight())
            );
        }
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable String id, @Valid @RequestBody RoomRequest request) {
        Room updated = roomService.updateRoom(id, request);
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            adminLogService.log(
                    currentUser,
                    "UPDATED_ROOM",
                    "ROOM",
                    updated.getId(),
                    String.format("Updated room unit %s (%s, ₹%.0f/night)", updated.getRoomNumber(), updated.getRoomType(), updated.getPricePerNight())
            );
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        Room existing = null;
        try {
            existing = roomService.getRoomById(id);
        } catch (Exception ignored) {}

        roomService.deleteRoom(id);

        User currentUser = getCurrentUser();
        if (currentUser != null) {
            String roomDesc = existing != null ? "Room " + existing.getRoomNumber() : "ID " + id;
            adminLogService.log(
                    currentUser,
                    "DELETED_ROOM",
                    "ROOM",
                    id,
                    String.format("Deleted room unit (%s)", roomDesc)
            );
        }
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}
