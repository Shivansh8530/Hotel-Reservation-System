package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password; // stored as a BCrypt hash, never plain text
    private String role; // "USER" or "ADMIN"
    private String phone;
    private String resetToken;
    private java.time.LocalDateTime resetTokenExpiry;

    public boolean isOwnerOrSuperAdmin() {
        return "OWNER".equalsIgnoreCase(this.role)
                || "SUPER_ADMIN".equalsIgnoreCase(this.role)
                || "Owner".equalsIgnoreCase(this.role);
    }

    public boolean isAdminOrOwner() {
        return isOwnerOrSuperAdmin() || "ADMIN".equalsIgnoreCase(this.role);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordDTO {
        private String email;
        private String newPassword;
        private String token;
    }
}
