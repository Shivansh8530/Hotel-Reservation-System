package com.hotelreservation.repository;

import com.hotelreservation.model.AdminLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminLogRepository extends MongoRepository<AdminLog, String> {
    List<AdminLog> findAllByOrderByTimestampDesc();
}

