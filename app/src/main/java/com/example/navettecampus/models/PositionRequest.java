package com.example.navettecampus.models;

import com.google.gson.annotations.SerializedName;

public class PositionRequest {
    @SerializedName("latitude")
    private double latitude;

    @SerializedName("longitude")
    private double longitude;

    @SerializedName("speed_kmh")
    private float speedKmh;

    public PositionRequest(double latitude, double longitude, float speedKmh) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.speedKmh = speedKmh;
    }
}
