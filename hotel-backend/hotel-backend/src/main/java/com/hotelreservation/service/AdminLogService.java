package com.hotelreservation.service;

import com.hotelreservation.model.AdminLog;
import com.hotelreservation.model.User;
import com.hotelreservation.repository.AdminLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminLogService {

    private final AdminLogRepository adminLogRepository;

    public void log(User admin, String action, String entityType, String entityId, String details) {
        try {
            AdminLog log = AdminLog.builder()
                    .adminId(admin != null ? admin.getId() : "SYSTEM")
                    .adminEmail(admin != null ? admin.getEmail() : "system")
                    .adminName(admin != null ? admin.getName() : "System")
                    .adminRole(admin != null ? admin.getRole() : "SYSTEM")
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();
            adminLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to persist admin log: " + e.getMessage());
        }
    }

    public List<AdminLog> getAllLogs() {
        return adminLogRepository.findAllByOrderByTimestampDesc();
    }
}

