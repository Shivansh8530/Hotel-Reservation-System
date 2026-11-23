package com.hotelreservation.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@stayease.com}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("StayEase - Password Reset Request");
                message.setText(
                        "Hello,\n\n" +
                        "A request was received to reset the password for your StayEase account.\n\n" +
                        "Click the link below to set a new password:\n" +
                        resetLink + "\n\n" +
                        "This link will expire in 15 minutes.\n" +
                        "If you did not request this, please ignore this email.\n\n" +
                        "Warm regards,\n" +
                        "The StayEase Sanctuary Team"
                );
                mailSender.send(message);
                log.info("Password reset email sent to {}", toEmail);
                return;
            } catch (Exception e) {
                log.error("Failed to send email via SMTP to {}: {}", toEmail, e.getMessage());
            }
        }

        // Clean fallback logging when SMTP is not provisioned
        log.info("[EmailService] No SMTP server configured or delivery failed. Password reset link for {}: {}", toEmail, resetLink);
    }
}
