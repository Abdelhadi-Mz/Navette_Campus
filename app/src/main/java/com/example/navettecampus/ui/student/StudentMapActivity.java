package com.example.navettecampus.ui.student;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.animation.AnimationUtils;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import com.example.navettecampus.R;
import com.example.navettecampus.ThemeManager;
import com.example.navettecampus.api.RetrofitClient;
import com.example.navettecampus.models.Position;
import com.example.navettecampus.models.Stop;
import com.example.navettecampus.utils.GeoUtils;
import com.example.navettecampus.utils.MapConfig;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.material.bottomsheet.BottomSheetBehavior;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.google.android.material.snackbar.Snackbar;
import org.osmdroid.api.IMapController;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Marker;
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider;
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class StudentMapActivity extends AppCompatActivity {

    private static final int LOCATION_PERMISSION_REQUEST = 2001;
    private static final long REFRESH_INTERVAL = 5000;
    private static final double CAMPUS_LAT = 31.6295;
    private static final double CAMPUS_LNG = -7.9811;

    private MapView mapView;
    private LinearLayout layoutShuttles, layoutStops, layoutEmpty;
    private LinearProgressIndicator progressBar;
    private TextView tvLastUpdate;
    private View liveIndicator;
    private Handler refreshHandler = new Handler();
    private Runnable refreshRunnable;
    private List<Marker> shuttleMarkers = new ArrayList<>();
    private List<Stop> allStops = new ArrayList<>();
    private boolean stopsLoaded = false;

    // Student location
    private FusedLocationProviderClient fusedLocationClient;
    private double studentLat = 0;
    private double studentLng = 0;
    private boolean hasStudentLocation = false;
    private MyLocationNewOverlay locationOverlay;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ThemeManager.applySavedTheme(this);
        super.onCreate(savedInstanceState);
        MapConfig.init(this);
        setContentView(R.layout.activity_student_map);

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        initViews();
        setupMap();
        setupBottomSheet();
        requestLocationPermission();
        loadStops();
        startAutoRefresh();

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());
        findViewById(R.id.btnRefresh).setOnClickListener(v -> {
            fetchShuttles();
            liveIndicator.startAnimation(
                    AnimationUtils.loadAnimation(this, R.anim.pulse));
        });
    }

    private void initViews() {
        mapView = findViewById(R.id.mapView);
        layoutShuttles = findViewById(R.id.layoutShuttles);
        layoutStops = findViewById(R.id.layoutStops);
        layoutEmpty = findViewById(R.id.layoutEmpty);
        progressBar = findViewById(R.id.progressBar);
        tvLastUpdate = findViewById(R.id.tvLastUpdate);
        liveIndicator = findViewById(R.id.liveIndicator);
    }

    private void setupMap() {
        mapView.setTileSource(TileSourceFactory.MAPNIK);
        mapView.setMultiTouchControls(true);
        mapView.setBuiltInZoomControls(false);

        IMapController controller = mapView.getController();
        controller.setZoom(16.0);
        controller.setCenter(new GeoPoint(CAMPUS_LAT, CAMPUS_LNG));


    }

    private void setupBottomSheet() {
        View bottomSheet = findViewById(R.id.bottomSheet);
        BottomSheetBehavior<View> behavior =
                BottomSheetBehavior.from(bottomSheet);
        behavior.setPeekHeight((int) (
                getResources().getDisplayMetrics().heightPixels * 0.45));
        behavior.setState(BottomSheetBehavior.STATE_COLLAPSED);
    }

    // ── LOCATION ──────────────────────────────────────────────

    private void requestLocationPermission() {
        if (ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            getStudentLocation();
            showLocationOnMap();
        } else {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    LOCATION_PERMISSION_REQUEST);
        }
    }

    private void getStudentLocation() {
        if (ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) return;

        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(this, location -> {
                    if (location != null) {
                        studentLat = location.getLatitude();
                        studentLng = location.getLongitude();
                        hasStudentLocation = true;

                        // Refresh shuttle cards with real ETA
                        fetchShuttles();

                        Snackbar.make(
                                findViewById(R.id.bottomSheet),
                                "📍 Position trouvée — ETA calculé!",
                                Snackbar.LENGTH_SHORT).show();
                    } else {
                        Snackbar.make(
                                findViewById(R.id.bottomSheet),
                                "Position GPS non disponible",
                                Snackbar.LENGTH_SHORT).show();
                    }
                });
    }

    private void showLocationOnMap() {
        locationOverlay = new MyLocationNewOverlay(
                new GpsMyLocationProvider(this), mapView);
        locationOverlay.enableMyLocation();
        locationOverlay.enableFollowLocation();
        mapView.getOverlays().add(locationOverlay);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode,
                permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST) {
            if (grantResults.length > 0
                    && grantResults[0]
                    == PackageManager.PERMISSION_GRANTED) {
                getStudentLocation();
                showLocationOnMap();
            } else {
                Snackbar.make(
                        findViewById(R.id.bottomSheet),
                        "ETA approximatif — permission GPS refusée",
                        Snackbar.LENGTH_LONG).show();
            }
        }
    }

    // ── AUTO REFRESH ──────────────────────────────────────────

    private void startAutoRefresh() {
        refreshRunnable = new Runnable() {
            @Override
            public void run() {
                fetchShuttles();
                refreshHandler.postDelayed(this, REFRESH_INTERVAL);
            }
        };
        refreshHandler.post(refreshRunnable);
    }

    // ── SHUTTLES ──────────────────────────────────────────────

    private void fetchShuttles() {
        RetrofitClient.getService().getLatestPositions()
                .enqueue(new Callback<List<Position>>() {
                    @Override
                    public void onResponse(Call<List<Position>> call,
                                           Response<List<Position>> response) {
                        progressBar.setVisibility(View.GONE);
                        if (response.isSuccessful()
                                && response.body() != null) {
                            List<Position> positions = response.body();
                            updateShuttleMarkers(positions);
                            updateShuttleCards(positions);
                            updateLastUpdateTime();
                            liveIndicator.startAnimation(
                                    AnimationUtils.loadAnimation(
                                            StudentMapActivity.this,
                                            R.anim.pulse));
                        }
                    }

                    @Override
                    public void onFailure(Call<List<Position>> call,
                                          Throwable t) {
                        progressBar.setVisibility(View.GONE);
                    }
                });
    }

    private void updateShuttleMarkers(List<Position> positions) {
        for (Marker m : shuttleMarkers) {
            mapView.getOverlays().remove(m);
        }
        shuttleMarkers.clear();

        for (Position pos : positions) {
            if (pos.getLatitude() == 0
                    && pos.getLongitude() == 0) continue;

            Marker marker = new Marker(mapView);
            marker.setPosition(new GeoPoint(
                    pos.getLatitude(), pos.getLongitude()));
            marker.setTitle(pos.getShuttleName());
            marker.setSnippet("🚌 " + pos.getDriverName()
                    + "\n⚡ " + (int) pos.getSpeedKmh() + " km/h");
            marker.setIcon(getDrawable(R.drawable.ic_driver));
            marker.setAnchor(Marker.ANCHOR_CENTER,
                    Marker.ANCHOR_CENTER);

            shuttleMarkers.add(marker);
            mapView.getOverlays().add(marker);
        }
        mapView.invalidate();
    }

    private void updateShuttleCards(List<Position> positions) {
        layoutShuttles.removeAllViews();

        if (positions.isEmpty()) {
            layoutEmpty.setVisibility(View.VISIBLE);
            return;
        }
        layoutEmpty.setVisibility(View.GONE);

        for (Position pos : positions) {
            View card = LayoutInflater.from(this)
                    .inflate(R.layout.item_shuttle_student,
                            layoutShuttles, false);

            TextView tvName =
                    card.findViewById(R.id.tvShuttleName);
            TextView tvStatus =
                    card.findViewById(R.id.tvStatus);
            TextView tvDriver =
                    card.findViewById(R.id.tvDriver);
            TextView tvEta =
                    card.findViewById(R.id.tvEta);
            View statusDot =
                    card.findViewById(R.id.statusDot);

            tvName.setText(pos.getShuttleName());
            tvDriver.setText(pos.getDriverName());


            if (pos.getTripStatus().equals("active")) {
                tvStatus.setText("En service");
                statusDot.setBackgroundResource(
                        R.drawable.shape_circle_success);
                card.setBackground(getDrawable(
                        R.drawable.shuttle_card_active));

                // ── REAL ETA CALCULATION ──
                int eta = computeRealEta(pos);
                if (eta > 0) {
                    tvEta.setText(String.valueOf(eta));
                } else {
                    tvEta.setText("~2");
                }

            } else {
                tvStatus.setText("En pause");
                statusDot.setBackgroundResource(
                        R.drawable.shape_circle_warning);
                card.setBackground(getDrawable(
                        R.drawable.shuttle_card_pause));
                tvEta.setText("--");
            }

            // Click → center map on shuttle
            card.setOnClickListener(v -> {
                if (pos.getLatitude() != 0) {
                    mapView.getController().animateTo(
                            new GeoPoint(pos.getLatitude(),
                                    pos.getLongitude()));
                    mapView.getController().setZoom(17.0);
                }
            });

            layoutShuttles.addView(card);
        }
    }

    private int computeRealEta(Position pos) {
        if (allStops.isEmpty()) {
            // No stops loaded yet — fallback to speed estimate
            float speed = pos.getSpeedKmh();
            if (speed < 5) speed = 15;
            return Math.max(1, (int) (0.5f / speed * 60));
        }

        if (hasStudentLocation) {
            // Find nearest stop to the STUDENT
            Stop nearestToStudent = GeoUtils.nearestStop(
                    studentLat, studentLng, allStops);

            if (nearestToStudent != null) {
                // Calculate distance from SHUTTLE to student's stop
                return GeoUtils.calculateEta(
                        pos.getLatitude(),
                        pos.getLongitude(),
                        nearestToStudent.getLatitude(),
                        nearestToStudent.getLongitude(),
                        pos.getSpeedKmh()
                );
            }
        }

        // No student location — use nearest stop to SHUTTLE
        Stop nearestToShuttle = GeoUtils.nearestStop(
                pos.getLatitude(), pos.getLongitude(), allStops);

        if (nearestToShuttle != null) {
            return GeoUtils.calculateEta(
                    pos.getLatitude(),
                    pos.getLongitude(),
                    nearestToShuttle.getLatitude(),
                    nearestToShuttle.getLongitude(),
                    pos.getSpeedKmh()
            );
        }

        return 5; // default fallback
    }

    // ── STOPS ─────────────────────────────────────────────────

    private void loadStops() {
        if (stopsLoaded) return;

        RetrofitClient.getService().getAllStops()
                .enqueue(new Callback<List<Stop>>() {
                    @Override
                    public void onResponse(Call<List<Stop>> call,
                                           Response<List<Stop>> response) {
                        if (response.isSuccessful()
                                && response.body() != null) {
                            stopsLoaded = true;
                            allStops = response.body();
                            addStopMarkers(allStops);
                            addStopCards(allStops);
                        }
                    }

                    @Override
                    public void onFailure(Call<List<Stop>> call,
                                          Throwable t) {}
                });
    }

    private void addStopMarkers(List<Stop> stops) {
        for (Stop stop : stops) {
            if (!stop.isActive()) continue;

            Marker marker = new Marker(mapView);
            marker.setPosition(new GeoPoint(
                    stop.getLatitude(), stop.getLongitude()));
            marker.setTitle(stop.getName());
            marker.setSnippet("Arrêt #" + stop.getStopOrder());
            marker.setIcon(getDrawable(R.drawable.ic_location));
            marker.setAnchor(Marker.ANCHOR_CENTER,
                    Marker.ANCHOR_BOTTOM);
            mapView.getOverlays().add(marker);
        }
        mapView.invalidate();
    }

    private void addStopCards(List<Stop> stops) {
        layoutStops.removeAllViews();

        for (Stop stop : stops) {
            if (!stop.isActive()) continue;

            View item = LayoutInflater.from(this)
                    .inflate(R.layout.item_stop_student,
                            layoutStops, false);

            TextView tvOrder = item.findViewById(R.id.tvOrder);
            TextView tvName = item.findViewById(R.id.tvStopName);
            TextView tvDesc = item.findViewById(R.id.tvStopDesc);

            tvOrder.setText(String.valueOf(stop.getStopOrder()));
            tvName.setText(stop.getName());

            if (stop.getDescription() != null
                    && !stop.getDescription().isEmpty()) {
                tvDesc.setText(stop.getDescription());
                tvDesc.setVisibility(View.VISIBLE);
            }

            // Click → center map on stop
            item.setOnClickListener(v -> {
                mapView.getController().animateTo(
                        new GeoPoint(stop.getLatitude(),
                                stop.getLongitude()));
                mapView.getController().setZoom(17.0);
            });

            layoutStops.addView(item);
        }
    }

    private void updateLastUpdateTime() {
        String time = new SimpleDateFormat("HH:mm:ss",
                Locale.getDefault()).format(new Date());
        tvLastUpdate.setText("Mis à jour " + time);
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();
        if (locationOverlay != null) {
            locationOverlay.enableMyLocation();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
        if (locationOverlay != null) {
            locationOverlay.disableMyLocation();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        refreshHandler.removeCallbacks(refreshRunnable);
        mapView.onDetach();
    }
}