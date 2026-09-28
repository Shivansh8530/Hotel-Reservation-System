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

                                // Additional Rooms:
                                com.hotelreservation.model.Room r5 = new com.hotelreservation.model.Room();
                                r5.setHotelId(savedH1.getId());
                                r5.setRoomNumber("103");
                                r5.setRoomType("VILLA");
                                r5.setDescription("Exclusive over-water private villa sanctuary featuring uninterrupted Arabian Sea panoramas, sun terrace, and dedicated evening turn-down.");
                                r5.setPricePerNight(18500.0);
                                r5.setCapacity(4);
                                r5.setAmenities(java.util.List.of("Private Infinity Pool", "Oceanfront Deck", "Outdoor Rain Shower", "Personal Butler", "Complimentary Champagne"));
                                r5.setImageUrl("https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80");
                                r5.setAvailable(true);
                                roomRepository.save(r5);

                                com.hotelreservation.model.Room r6 = new com.hotelreservation.model.Room();
                                r6.setHotelId(savedH1.getId());
                                r6.setRoomNumber("104");
                                r6.setRoomType("EXECUTIVE");
                                r6.setDescription("Sophisticated coastal executive sanctuary with elevated panoramic balcony, high-speed optic fiber, and designer marble bathroom.");
                                r6.setPricePerNight(8999.0);
                                r6.setCapacity(2);
                                r6.setAmenities(java.util.List.of("Sunset Balcony", "Smart Workstation", "Espresso Bar", "King Bed", "Whirlpool Tub"));
                                r6.setImageUrl("https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80");
                                r6.setAvailable(true);
                                roomRepository.save(r6);

                                com.hotelreservation.model.Room r7 = new com.hotelreservation.model.Room();
                                r7.setHotelId(savedH2.getId());
                                r7.setRoomNumber("202");
                                r7.setRoomType("DELUXE");
                                r7.setDescription("Immaculate heritage chamber showcasing authentic Rajasthani arches, private seating niche overlooking the fountain courtyard.");
                                r7.setPricePerNight(6900.0);
                                r7.setCapacity(2);
                                r7.setAmenities(java.util.List.of("Courtyard Balcony", "Carved Teak Bed", "Hand-painted Frescoes", "Free Wi-Fi", "Artisan Tea Set"));
                                r7.setImageUrl("https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80");
                                r7.setAvailable(true);
                                roomRepository.save(r7);

                                com.hotelreservation.model.Room r8 = new com.hotelreservation.model.Room();
                                r8.setHotelId(savedH2.getId());
                                r8.setRoomNumber("203");
                                r8.setRoomType("VILLA");
                                r8.setDescription("The Maharaja Royal Pavilion offering decadent privacy, secluded courtyard garden, marble whirlpool bath, and vintage chandelier.");
                                r8.setPricePerNight(14500.0);
                                r8.setCapacity(4);
                                r8.setAmenities(java.util.List.of("Private Courtyard Jacuzzi", "Royal Dining Chamber", "Antique Four-Poster Bed", "Palace Garden View"));
                                r8.setImageUrl("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80");
                                r8.setAvailable(true);
                                roomRepository.save(r8);

                                com.hotelreservation.model.Room r9 = new com.hotelreservation.model.Room();
                                r9.setHotelId(savedH3.getId());
                                r9.setRoomNumber("302");
                                r9.setRoomType("SUITE");
                                r9.setDescription("Skyline alpine chalet suite elevated among ancient deodars, featuring hand-carved cedar beams, glass-front wood stove, and star-gazing deck.");
                                r9.setPricePerNight(7800.0);
                                r9.setCapacity(3);
                                r9.setAmenities(java.util.List.of("Himalayan View Balcony", "Stone Fireplace", "Cedar Jacuzzi", "Heated Floors", "Organic Breakfast"));
                                r9.setImageUrl("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80");
                                r9.setAvailable(true);
                                roomRepository.save(r9);

                                com.hotelreservation.model.Room r10 = new com.hotelreservation.model.Room();
                                r10.setHotelId(savedH3.getId());
                                r10.setRoomNumber("303");
                                r10.setRoomType("DELUXE");
                                r10.setDescription("Sun-drenched alpine haven with panoramic snow-capped ridge outlooks, private timber veranda, and handcrafted wool throws.");
                                r10.setPricePerNight(5600.0);
                                r10.setCapacity(2);
                                r10.setAmenities(java.util.List.of("Valley View", "Scandinavian Wood Stove", "Plush Down Duvet", "Artisanal Coffee Bar"));
                                r10.setImageUrl("https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80");
                                r10.setAvailable(true);
                                roomRepository.save(r10);

                                System.out.println("Seeded initial internal hotels with 10 associated rooms.");
                        }
                };
        }
}
