package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "admin_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLog {

    @Id
    private String id;

    private String adminId;
    private String adminEmail;
    private String adminName;
    private String adminRole;

    private String action; // e.g. "PROMOTED_USER", "DEMOTED_USER", "INVITED_ADMIN", "CREATED_ROOM", "UPDATED_ROOM", "DELETED_ROOM", "CREATED_HOTEL", "UPDATED_HOTEL", "DELETED_HOTEL", "CANCELLED_BOOKING"
    private String entityType; // e.g. "USER", "ROOM", "HOTEL", "BOOKING"
    private String entityId;
    private String details;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}

