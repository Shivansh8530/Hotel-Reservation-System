package com.hotelreservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {
    private String idToken;
    private String email;
    private String name;
    private String photoUrl;
}

