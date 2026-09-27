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
        public CommandLineRunner seedData(
                        UserRepository userRepository,
                        com.hotelreservation.repository.HotelRepository hotelRepository,
                        com.hotelreservation.repository.RoomRepository roomRepository,
                        PasswordEncoder passwordEncoder) {
                return args -> {
                        String adminEmail = "admin@gmail.com";
                        String defaultPassword = "admin123";

                        // 1. Seed Admin
                        if (!userRepository.existsByEmail(adminEmail)) {
                                User admin = new User();
                                admin.setName("Super Admin");
                                admin.setEmail(adminEmail);
                                admin.setPassword(passwordEncoder.encode(defaultPassword));
                                admin.setPhone("1234567890");
                                admin.setRole("ADMIN");

                                userRepository.save(admin);
                                System.out.println("Default admin created: " + adminEmail + " / " + defaultPassword);
                        }

                        // 2. Seed Initial Internal Hotels if empty
                        if (hotelRepository.count() == 0) {
                                // Hotel 1: Goa
                                com.hotelreservation.model.Hotel h1 = new com.hotelreservation.model.Hotel();
                                h1.setName("The Grand Azure Beach Resort");
                                h1.setDescription(
                                                "Premier coastal sanctuary nestled on the pristine sands of South Goa. Features beachfront infinity pools, private ocean access, organic Ayurvedic wellness spa, and sunset cabanas.");
                                h1.setPropertyType("Resort");
                                h1.setLocation(new com.hotelreservation.model.Location("Goa", "India",
                                                "Candolim Beach Road, North Goa 403515"));
                                h1.setRating(4.85);
                                h1.setReviewCount(342);
                                h1.setPrice(new com.hotelreservation.model.Price(6499.0, "INR", false));
                                h1.setFeatured(true);
                                h1.setImages(java.util.List.of(
                                                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                                                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                                                "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"));
                                h1.setAmenities(java.util.List.of("Free WiFi", "Swimming Pool", "Private Beach",
                                                "Spa & Wellness",
                                                "Breakfast Included", "Free Parking"));
                                com.hotelreservation.model.Hotel savedH1 = hotelRepository.save(h1);

                                // Room for Hotel 1
                                com.hotelreservation.model.Room r1 = new com.hotelreservation.model.Room();
                                r1.setHotelId(savedH1.getId());
                                r1.setRoomNumber("101");
                                r1.setRoomType("DELUXE");
                                r1.setDescription(
                                                "Spacious ocean-facing room with teak wood furnishings, king bed, and private marble balcony.");
                                r1.setPricePerNight(6499.0);
                                r1.setCapacity(2);
                                r1.setAmenities(
                                                java.util.List.of("King Bed", "Ocean View", "Free Wi-Fi",
                                                                "Rainfall Shower", "Mini Bar"));
                                r1.setImageUrl(
                                                "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80");
                                r1.setAvailable(true);
                                roomRepository.save(r1);

                                com.hotelreservation.model.Room r2 = new com.hotelreservation.model.Room();
                                r2.setHotelId(savedH1.getId());
                                r2.setRoomNumber("102");
                                r2.setRoomType("SUITE");
                                r2.setDescription(
                                                "Luxury beachfront villa suite with private sundeck, soaking tub, and dedicated butler service.");
                                r2.setPricePerNight(11500.0);
                                r2.setCapacity(3);
                                r2.setAmenities(java.util.List.of("Super King Bed", "Living Room", "Soaking Tub",
                                                "Butler Service",
                                                "Free Breakfast"));
                                r2.setImageUrl(
                                                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80");
                                r2.setAvailable(true);
                                roomRepository.save(r2);

                                // Hotel 2: Jaipur
                                com.hotelreservation.model.Hotel h2 = new com.hotelreservation.model.Hotel();
                                h2.setName("The Royal Haveli Palace");
                                h2.setDescription(
                                                "Restored 19th-century royal heritage haveli in the historic heart of the Pink City. Intricately carved stone courtyards, traditional folk performances, and rooftop sunset dining.");
                                h2.setPropertyType("Heritage");
                                h2.setLocation(new com.hotelreservation.model.Location("Jaipur", "India",
                                                "Amer Road, Near Jal Mahal, Jaipur 302002"));
                                h2.setRating(4.9);
                                h2.setReviewCount(280);
                                h2.setPrice(new com.hotelreservation.model.Price(8200.0, "INR", false));
                                h2.setFeatured(true);
                                h2.setImages(java.util.List.of(
                                                "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
                                                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"));
                                h2.setAmenities(java.util.List.of("Heritage Courtyard", "Rooftop Pool", "Fine Dining",
                                                "Airport Shuttle", "Free WiFi", "Royal Spa"));
                                com.hotelreservation.model.Hotel savedH2 = hotelRepository.save(h2);

                                com.hotelreservation.model.Room r3 = new com.hotelreservation.model.Room();
                                r3.setHotelId(savedH2.getId());
                                r3.setRoomNumber("201");
                                r3.setRoomType("SUITE");
                                r3.setDescription(
                                                "Regal Rajput suite with antique jharokha window, king bed, and artisanal silk draperies.");
                                r3.setPricePerNight(8200.0);
                                r3.setCapacity(2);
                                r3.setAmenities(java.util.List.of("King Bed", "Courtyard View", "Handcrafted Decor",
                                                "Free Wi-Fi"));
                                r3.setImageUrl(
                                                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80");
                                r3.setAvailable(true);
                                roomRepository.save(r3);

                                // Hotel 3: Manali
                                com.hotelreservation.model.Hotel h3 = new com.hotelreservation.model.Hotel();
                                h3.setName("Whispering Pines Alpine Chalet");
                                h3.setDescription(
                                                "Serene wooden chalet nestled high above the Beas River with panoramic Himalayan peak views, private cedar balconies, and crackling pine-log fireplaces.");
                                h3.setPropertyType("Villa");
                                h3.setLocation(
                                                new com.hotelreservation.model.Location("Manali", "India",
                                                                "Log Huts Area, Old Manali 175131"));
                                h3.setRating(4.78);
                                h3.setReviewCount(195);
                                h3.setPrice(new com.hotelreservation.model.Price(4800.0, "INR", false));
                                h3.setFeatured(false);
                                h3.setImages(java.util.List.of(
                                                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                                                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"));
                                h3.setAmenities(java.util.List.of("Mountain View", "Fireplace", "Bonfire Nights",
                                                "Free Breakfast",
                                                "Free WiFi", "Pet Friendly"));
                                com.hotelreservation.model.Hotel savedH3 = hotelRepository.save(h3);

                                com.hotelreservation.model.Room r4 = new com.hotelreservation.model.Room();
                                r4.setHotelId(savedH3.getId());
                                r4.setRoomNumber("301");
                                r4.setRoomType("STANDARD");
                                r4.setDescription("Cozy alpine pine-wood room with valley views and heated blankets.");
                                r4.setPricePerNight(4800.0);
                                r4.setCapacity(2);
                                r4.setAmenities(java.util.List.of("Queen Bed", "Mountain View", "Fireplace",
                                                "High-speed Wi-Fi"));
                                r4.setImageUrl(
                                                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80");
                                r4.setAvailable(true);
                                roomRepository.save(r4);

                                System.out.println("Seeded 3 initial internal hotels with associated rooms.");
                        }
                };
        }
}
