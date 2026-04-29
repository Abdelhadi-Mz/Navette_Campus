package com.example.navettecampus.models;

import com.google.gson.annotations.SerializedName;

public class Shuttle {
    @SerializedName("id")
    private int id;

    @SerializedName("name")
    private String name;

    @SerializedName("driver_name")
    private String driverName;

    @SerializedName("plate_number")
    private String plateNumber;

    @SerializedName("capacity")
    private int capacity;

    @SerializedName("status")
    private String status;

    public int getId() { return id; }
    public String getName() { return name; }
    public String getDriverName() { return driverName; }
    public String getPlateNumber() { return plateNumber; }
    public int getCapacity() { return capacity; }
    public String getStatus() { return status; }
}
