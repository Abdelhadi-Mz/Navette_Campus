package com.example.navettecampus.models;

import com.google.gson.annotations.SerializedName;

public class Position {
    @SerializedName("shuttle_id")
    private int shuttleId;

    @SerializedName("shuttle_name")
    private String shuttleName;

    @SerializedName("driver_name")
    private String driverName;

    @SerializedName("trip_id")
    private int tripId;

    @SerializedName("trip_status")
    private String tripStatus;

    @SerializedName("latitude")
    private double latitude;

    @SerializedName("longitude")
    private double longitude;

    @SerializedName("speed_kmh")
    private float speedKmh;

    @SerializedName("delay_minutes")
    private int delayMinutes;

    @SerializedName("recorded_at")
    private String recordedAt;

    public int getShuttleId() { return shuttleId; }
    public String getShuttleName() { return shuttleName; }
    public String getDriverName() { return driverName; }
    public int getTripId() { return tripId; }
    public String getTripStatus() { return tripStatus; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public float getSpeedKmh() { return speedKmh; }
    public int getDelayMinutes() { return delayMinutes; }
    public String getRecordedAt() { return recordedAt; }
}
