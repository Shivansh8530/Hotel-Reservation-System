package com.hotelreservation.config;

import com.hotelreservation.model.User;
import com.hotelreservation.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "chauhanshivansh85@gmail.com";

            // Check if admin already exists
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setName("Super Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("Shivansh")); // Default password
                admin.setPhone("1234567890");
                admin.setRole("ADMIN");

                userRepository.save(admin);
                System.out.println("Default admin created: " + adminEmail + " / admin123");
            } else {
                System.out.println("Admin user already exists. Skipping seeder.");
            }
        };
    }
}
