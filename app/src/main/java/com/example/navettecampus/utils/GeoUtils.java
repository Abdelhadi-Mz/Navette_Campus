package com.example.navettecampus.utils;

import com.example.navettecampus.models.Stop;
import java.util.List;

public class GeoUtils {

    // Haversine formula — calculates distance between two GPS points in km
    public static double distanceKm(double lat1, double lng1,
                                    double lat2, double lng2) {
        final int EARTH_RADIUS = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    // Find nearest stop to a given location
    public static Stop nearestStop(double userLat, double userLng,
                                   List<Stop> stops) {
        Stop nearest = null;
        double minDistance = Double.MAX_VALUE;

        for (Stop stop : stops) {
            double distance = distanceKm(
                    userLat, userLng,
                    stop.getLatitude(), stop.getLongitude()
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearest = stop;
            }
        }
        return nearest;
    }

    // Calculate ETA in minutes
    // shuttle position → student's nearest stop
    public static int calculateEta(double shuttleLat, double shuttleLng,
                                   double stopLat, double stopLng,
                                   float speedKmh) {
        double distanceKm = distanceKm(
                shuttleLat, shuttleLng, stopLat, stopLng);

        // Use minimum speed of 10 km/h to avoid infinite ETA
        float effectiveSpeed = Math.max(speedKmh, 10f);

        double timeHours = distanceKm / effectiveSpeed;
        int minutes = (int) Math.ceil(timeHours * 60);

        // Cap at 60 minutes max
        return Math.min(minutes, 60);
    }
}
