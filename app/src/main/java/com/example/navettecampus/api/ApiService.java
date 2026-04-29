package com.example.navettecampus.api;

import com.example.navettecampus.models.LoginRequest;
import com.example.navettecampus.models.LoginResponse;
import com.example.navettecampus.models.Position;
import com.example.navettecampus.models.PositionRequest;
import com.example.navettecampus.models.Shuttle;
import com.example.navettecampus.models.Stop;
import com.example.navettecampus.models.Trip;
import com.example.navettecampus.models.TripResponse;
import com.example.navettecampus.models.StatusRequest;

import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface ApiService {

    // Auth
    @POST("auth/driver")
    Call<LoginResponse> driverLogin(@Body LoginRequest request);

    // Shuttles
    @GET("shuttles")
    Call<List<Shuttle>> getAllShuttles();

    @GET("shuttles/active")
    Call<List<Shuttle>> getActiveShuttles();

    // Stops
    @GET("stops")
    Call<List<Stop>> getAllStops();

    // Trips
    @POST("trips/start")
    Call<TripResponse> startTrip();

    @PUT("trips/{id}/status")
    Call<TripResponse> updateTripStatus(
            @Path("id") int tripId,
            @Body StatusRequest request
    );

    @GET("trips/active")
    Call<List<Trip>> getActiveTrips();

    // Positions
    @POST("positions")
    Call<Void> sendPosition(@Body PositionRequest request);

    @GET("positions/latest")
    Call<List<Position>> getLatestPositions();
    @GET("trips/shuttle/{shuttle_id}/active")
    Call<TripResponse> getShuttleActiveTrip(@Path("shuttle_id") int shuttleId);
    @GET("positions/trip/{id}")
    Call<TripResponse> getTripPositions(@Path("id") int tripId);
    @GET("trips/shuttle/{shuttle_id}/history")
    Call<List<TripResponse>> getShuttleTripHistory(@Path("shuttle_id") int shuttleId);
}
