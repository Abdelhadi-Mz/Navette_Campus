package com.example.navettecampus.models;

import com.google.gson.annotations.SerializedName;

public class LoginRequest {
    @SerializedName("shuttle_id")
    private int shuttleId;

    @SerializedName("pin")
    private String pin;

    public LoginRequest(int shuttleId, String pin) {
        this.shuttleId = shuttleId;
        this.pin = pin;
    }
}
