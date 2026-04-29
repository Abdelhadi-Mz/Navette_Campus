package com.example.navettecampus.models;

import com.google.gson.annotations.SerializedName;

public class StatusRequest {
    @SerializedName("status")
    private String status;

    public StatusRequest(String status) {
        this.status = status;
    }
}
