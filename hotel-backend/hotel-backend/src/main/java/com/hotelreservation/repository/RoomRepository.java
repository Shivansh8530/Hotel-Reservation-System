package com.hotelreservation.repository;

import com.hotelreservation.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RoomRepository extends MongoRepository<Room, String> {
    List<Room> findByAvailableTrue();
    List<Room> findByRoomType(String roomType);
    List<Room> findByHotelId(String hotelId);
    List<Room> findByHotelIdAndAvailableTrue(String hotelId);
}
