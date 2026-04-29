package com.example.navettecampus.models;

import com.google.gson.annotations.SerializedName;

public class Trip {
    @SerializedName("trip_id")
    private int tripId;

    @SerializedName("shuttle_id")
    private int shuttleId;

    @SerializedName("shuttle_name")
    private String shuttleName;

    @SerializedName("driver_name")
    private String driverName;

    @SerializedName("trip_status")
    private String status;

    @SerializedName("started_at")
    private String startedAt;

    @SerializedName("latitude")
    private double latitude;

    @SerializedName("longitude")
    private double longitude;

    @SerializedName("delay_minutes")
    private int delayMinutes;

    public int getTripId() { return tripId; }
    public int getShuttleId() { return shuttleId; }
    public String getShuttleName() { return shuttleName; }
    public String getDriverName() { return driverName; }
    public String getStatus() { return status; }
    public String getStartedAt() { return startedAt; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public int getDelayMinutes() { return delayMinutes; }
}
