package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {
    private String city;
    private String state;
    private String country = "India";
    private String address;
    private Double latitude;
    private Double longitude;

    public Location(String city, String country, String address) {
        this.city = city;
        this.country = country;
        this.address = address;
    }
}
