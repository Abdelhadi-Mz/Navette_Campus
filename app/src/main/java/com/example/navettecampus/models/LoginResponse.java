package com.example.navettecampus.models;

import com.google.gson.annotations.SerializedName;

public class LoginResponse {
    @SerializedName("token")
    private String token;

    @SerializedName("shuttle")
    private Shuttle shuttle;

    public String getToken() { return token; }
    public Shuttle getShuttle() { return shuttle; }
}
