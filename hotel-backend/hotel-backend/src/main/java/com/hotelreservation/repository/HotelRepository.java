package com.hotelreservation.repository;

import com.hotelreservation.model.Hotel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface HotelRepository extends MongoRepository<Hotel, String> {

    List<Hotel> findByFeaturedTrue();

    List<Hotel> findBySource(String source);

    @Query("{ 'location.city': { $regex: ?0, $options: 'i' } }")
    List<Hotel> findByCityRegex(String city);

    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'location.city': { $regex: ?0, $options: 'i' } }, { 'location.address': { $regex: ?0, $options: 'i' } } ] }")
    List<Hotel> searchByNameOrCity(String query);
}
