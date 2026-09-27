package com.hotelreservation.integration;

import com.hotelreservation.dto.HotelDTO;
import com.hotelreservation.dto.HotelSearchRequest;
import com.hotelreservation.model.Location;
import com.hotelreservation.model.Price;
import com.hotelreservation.model.Room;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Simulates verified external partner inventory (Booking.com & Expedia sandbox simulation)
 * without scraping or contacting unofficial endpoints.
 */
@Component
public class MockExternalHotelProvider implements HotelProvider {

    private final List<HotelDTO> mockInventory = new ArrayList<>();

    public MockExternalHotelProvider() {
        initMockInventory();
    }

    @Override
    public String getProviderName() {
        return "EXTERNAL_MOCK";
    }

    @Override
    public List<HotelDTO> searchHotels(HotelSearchRequest request) {
        String dest = request.getDestination() != null ? request.getDestination().trim().toLowerCase() : "";

        return mockInventory.stream()
                .filter(h -> {
                    if (dest.isEmpty()) return true;
                    String city = h.getLocation().getCity().toLowerCase();
                    String name = h.getName().toLowerCase();
                    return city.contains(dest) || dest.contains(city) || name.contains(dest);
                })
                .toList();
    }

    @Override
    public Optional<HotelDTO> getHotelDetails(String hotelId) {
        return mockInventory.stream()
                .filter(h -> h.getId().equals(hotelId))
                .findFirst();
    }

    private void initMockInventory() {
        // --- 1. Booking.com Partner in Goa ---
        mockInventory.add(HotelDTO.builder()
                .id("booking_goa_101")
                .source("BOOKING")
                .providerLabel("Available via Booking.com")
                .externalId("bk_77812")
                .name("Taj Exotica Resort & Spa, Goa")
                .description("Spread across 56 acres of lush gardens along Benaulim beach. Features Mediterranean architecture, golf course, private plunge pools, and award-winning beachfront dining.")
                .propertyType("Resort")
                .location(new Location("Goa", "India", "Calwaddo, Benaulim, Salcete, South Goa 403716"))
                .rating(4.9)
                .reviewCount(1420)
                .images(List.of(
                        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
                ))
                .amenities(List.of("Free WiFi", "Private Beach", "Swimming Pool", "Spa & Wellness", "Golf Course", "Airport Shuttle", "Breakfast Included"))
                .price(new Price(16500.0, "INR", false))
                .featured(true)
                .bookingUrl("https://example.com/partner/booking/taj-exotica-goa")
                .sourceUrl("https://example.com/partner/booking/taj-exotica-goa")
                .rooms(createMockPartnerRooms("booking_goa_101", 16500.0, "Villa Suite with Plunge Pool"))
                .build());

        // --- 2. Expedia Partner in Mumbai ---
        mockInventory.add(HotelDTO.builder()
                .id("expedia_mum_102")
                .source("EXPEDIA")
                .providerLabel("Available via Expedia")
                .externalId("exp_99182")
                .name("The St. Regis Mumbai")
                .description("Towering over Lower Parel, offering refined luxury with bespoke butler service, panoramic views of the Arabian Sea, an infinity rooftop pool, and 9 signature dining establishments.")
                .propertyType("Hotel")
                .location(new Location("Mumbai", "India", "462 Senapati Bapat Marg, Lower Parel, Mumbai 400013"))
                .rating(4.8)
                .reviewCount(890)
                .images(List.of(
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
                ))
                .amenities(List.of("Free WiFi", "Infinity Pool", "24/7 Butler Service", "Fitness Center", "Valet Parking", "Cocktail Lounge"))
                .price(new Price(19800.0, "INR", false))
                .featured(true)
                .bookingUrl("https://example.com/partner/expedia/st-regis-mumbai")
                .sourceUrl("https://example.com/partner/expedia/st-regis-mumbai")
                .rooms(createMockPartnerRooms("expedia_mum_102", 19800.0, "Grand Deluxe Sea View Room"))
                .build());

        // --- 3. Booking.com Partner in Jaipur ---
        mockInventory.add(HotelDTO.builder()
                .id("booking_jpr_103")
                .source("BOOKING")
                .providerLabel("Available via Booking.com")
                .externalId("bk_33104")
                .name("Rambagh Palace Heritage Grand")
                .description("Former residence of the Maharaja of Jaipur. Built in 1835, offering majestic marble corridors, ornamental gardens, peacocks on the lawns, and regal Rajasthani hospitality.")
                .propertyType("Heritage")
                .location(new Location("Jaipur", "India", "Bhawani Singh Road, Rambagh, Jaipur 302005"))
                .rating(4.95)
                .reviewCount(1150)
                .images(List.of(
                        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"
                ))
                .amenities(List.of("Palace Grounds", "Indoor & Outdoor Pools", "Jiva Grande Spa", "Vintage Car Rides", "Fine Dining", "Breakfast Included"))
                .price(new Price(32000.0, "INR", false))
                .featured(true)
                .bookingUrl("https://example.com/partner/booking/rambagh-palace")
                .sourceUrl("https://example.com/partner/booking/rambagh-palace")
                .rooms(createMockPartnerRooms("booking_jpr_103", 32000.0, "Palace Room with Courtyard View"))
                .build());

        // --- 4. Expedia Partner in Manali ---
        mockInventory.add(HotelDTO.builder()
                .id("expedia_man_104")
                .source("EXPEDIA")
                .providerLabel("Available via Expedia")
                .externalId("exp_44120")
                .name("Solang Valley Cedar Resort")
                .description("Nestled amidst ancient deodar forests with dramatic vistas of snow-capped Himalayan peaks. Features heated stone fireplaces, private balconies, and adventure concierge.")
                .propertyType("Resort")
                .location(new Location("Manali", "India", "Solang Valley Road, Vashist, Manali 175131"))
                .rating(4.7)
                .reviewCount(540)
                .images(List.of(
                        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80"
                ))
                .amenities(List.of("Mountain View", "Fireplace Lounge", "Ski Storage", "Heated Rooms", "Buffet Breakfast", "Free Parking"))
                .price(new Price(8500.0, "INR", false))
                .featured(false)
                .bookingUrl("https://example.com/partner/expedia/solang-valley-resort")
                .sourceUrl("https://example.com/partner/expedia/solang-valley-resort")
                .rooms(createMockPartnerRooms("expedia_man_104", 8500.0, "Alpine Cedar Chalet"))
                .build());

        // --- 5. Booking.com Partner in Bengaluru ---
        mockInventory.add(HotelDTO.builder()
                .id("booking_blr_105")
                .source("BOOKING")
                .providerLabel("Available via Booking.com")
                .externalId("bk_88190")
                .name("The Leela Palace Bengaluru")
                .description("Standout Art Deco palace architecture inspired by the Royal Palace of Mysore. Set across nine acres of cascading waterfalls, arched colonnades, and century-old gardens.")
                .propertyType("Hotel")
                .location(new Location("Bengaluru", "India", "23 HAL Old Airport Road, Kodihalli, Bengaluru 560008"))
                .rating(4.85)
                .reviewCount(960)
                .images(List.of(
                        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
                ))
                .amenities(List.of("Free WiFi", "Royal Spa", "Outdoor Lagoon Pool", "4 Restaurants", "Business Center", "Airport Limousine"))
                .price(new Price(14500.0, "INR", false))
                .featured(false)
                .bookingUrl("https://example.com/partner/booking/leela-palace-bengaluru")
                .sourceUrl("https://example.com/partner/booking/leela-palace-bengaluru")
                .rooms(createMockPartnerRooms("booking_blr_105", 14500.0, "Royal Premier Room"))
                .build());
    }

    private List<Room> createMockPartnerRooms(String hotelId, double basePrice, String mainRoomTitle) {
        List<Room> rooms = new ArrayList<>();
        Room r1 = new Room();
        r1.setId(hotelId + "_r1");
        r1.setHotelId(hotelId);
        r1.setRoomNumber("101");
        r1.setRoomType("DELUXE");
        r1.setDescription("Standard King room with luxury bath and high-speed Wi-Fi.");
        r1.setPricePerNight(basePrice);
        r1.setCapacity(2);
        r1.setAmenities(List.of("King Bed", "High-speed Wi-Fi", "Espresso Machine", "Rainfall Shower"));
        r1.setAvailable(true);
        r1.setImageUrl("https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80");
        rooms.add(r1);

        Room r2 = new Room();
        r2.setId(hotelId + "_r2");
        r2.setHotelId(hotelId);
        r2.setRoomNumber("201");
        r2.setRoomType("SUITE");
        r2.setDescription("Spacious suite with separate living area, panoramic balcony, and soaking tub.");
        r2.setPricePerNight(basePrice * 1.5);
        r2.setCapacity(3);
        r2.setAmenities(List.of("King Bed + Daybed", "Scenic Balcony", "Soaking Tub", "Complimentary Breakfast"));
        r2.setAvailable(true);
        r2.setImageUrl("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80");
        rooms.add(r2);

        return rooms;
    }
}
