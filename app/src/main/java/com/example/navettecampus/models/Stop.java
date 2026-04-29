package com.example.navettecampus.models;

import com.google.gson.annotations.SerializedName;

public class Stop {
    @SerializedName("id")
    private int id;

    @SerializedName("name")
    private String name;

    @SerializedName("latitude")
    private double latitude;

    @SerializedName("longitude")
    private double longitude;

    @SerializedName("stop_order")
    private int stopOrder;

    @SerializedName("description")
    private String description;

    @SerializedName("is_active")
    private int isActive;



    public int getId() { return id; }
    public String getName() { return name; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public int getStopOrder() { return stopOrder; }
    public String getDescription() { return description; }
    public boolean isActive() { return isActive == 1; }
}
