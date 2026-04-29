package com.example.navettecampus.models;

import com.google.gson.annotations.SerializedName;

public class TripResponse {
    @SerializedName("message")
    private String message;

    @SerializedName("trip_id")
    private int tripId;

    @SerializedName("id")
    private int id;

    @SerializedName("status")
    private String status;

    @SerializedName("started_at")
    private String startedAt;

    @SerializedName("ended_at")
    private String endedAt;

    @SerializedName("delay_minutes")
    private int delayMinutes;

    @SerializedName("position_count")
    private int positionCount;

    public String getMessage() { return message; }
    public int getTripId() { return tripId > 0 ? tripId : id; }
    public String getStatus() { return status; }
    public String getStartedAt() { return startedAt; }
    public String getEndedAt() { return endedAt; }
    public int getDelayMinutes() { return delayMinutes; }
    public int getPositionCount() { return positionCount; }
}
