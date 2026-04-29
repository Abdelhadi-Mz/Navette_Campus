package com.example.navettecampus.utils;

import android.content.Context;
import android.content.SharedPreferences;
import com.example.navettecampus.api.RetrofitClient;

public class SessionManager {

    private static final String PREFS_NAME = "navette_session";
    private static final String KEY_TOKEN = "token";
    private static final String KEY_SHUTTLE_ID = "shuttle_id";
    private static final String KEY_SHUTTLE_NAME = "shuttle_name";
    private static final String KEY_DRIVER_NAME = "driver_name";
    private static final String KEY_TRIP_ID = "trip_id";

    private SharedPreferences prefs;

    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public void saveSession(String token, int shuttleId, String shuttleName, String driverName) {
        prefs.edit()
                .putString(KEY_TOKEN, token)
                .putInt(KEY_SHUTTLE_ID, shuttleId)
                .putString(KEY_SHUTTLE_NAME, shuttleName)
                .putString(KEY_DRIVER_NAME, driverName)
                .apply();
        RetrofitClient.setToken(token);
    }

    public void saveActiveTripId(int tripId) {
        prefs.edit().putInt(KEY_TRIP_ID, tripId).apply();
    }

    public void clearActiveTripId() {
        prefs.edit().remove(KEY_TRIP_ID).apply();
    }

    public void clearSession() {
        prefs.edit().clear().apply();
        RetrofitClient.clearToken();
    }

    public boolean isLoggedIn() {
        return prefs.getString(KEY_TOKEN, null) != null;
    }

    public String getToken() { return prefs.getString(KEY_TOKEN, null); }
    public int getShuttleId() { return prefs.getInt(KEY_SHUTTLE_ID, -1); }
    public String getShuttleName() { return prefs.getString(KEY_SHUTTLE_NAME, ""); }
    public String getDriverName() { return prefs.getString(KEY_DRIVER_NAME, ""); }
    public int getActiveTripId() { return prefs.getInt(KEY_TRIP_ID, -1); }
}
