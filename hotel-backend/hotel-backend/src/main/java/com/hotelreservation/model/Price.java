package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Price {
    private double amount;
    private String currency = "INR";
    private boolean taxesIncluded = false;

    public Price(double amount) {
        this.amount = amount;
        this.currency = "INR";
        this.taxesIncluded = false;
    }
}
