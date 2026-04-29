package com.example.navettecampus.ui.driver;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.os.Handler;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.AnimationUtils;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.navettecampus.R;
import com.example.navettecampus.ThemeManager;
import com.example.navettecampus.api.RetrofitClient;
import com.example.navettecampus.models.PositionRequest;
import com.example.navettecampus.models.StatusRequest;
import com.example.navettecampus.models.Stop;
import com.example.navettecampus.models.TripResponse;
import com.example.navettecampus.utils.SessionManager;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.google.android.material.snackbar.Snackbar;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class DriverDashboardActivity extends AppCompatActivity {

    private static final int LOCATION_PERMISSION_REQUEST = 1001;
    private static final long GPS_INTERVAL = 8000;

    private TextView tvDriverName, tvShuttleName, tvTripStatus;
    private TextView tvSpeed, tvPositionCount, tvDistance;
    private TextView tvDuration, tvNextStop, tvEta;
    private View pulseDot, layoutMetrics, cardNextStop;
    private MaterialCardView cardHero;
    private ExtendedFloatingActionButton fabStart;
    private MaterialButton btnPauseTrip, btnResumeTrip, btnFinishTrip;
    private LinearProgressIndicator gpsProgressBar;
    private RecyclerView rvHistory;
    private TripHistoryAdapter historyAdapter;

    private SessionManager sessionManager;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private Handler durationHandler = new Handler();
    private Runnable durationRunnable;
    private long tripStartTime = 0;
    private float totalDistance = 0f;
    private Location lastLocation = null;

    private int currentTripId = -1;
    private String currentTripStatus = "";
    private int positionCount = 0;
    private boolean isTracking = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ThemeManager.applySavedTheme(this);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_driver_dashboard);

        sessionManager = new SessionManager(this);
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        initViews();
        setupToolbar();
        setupButtons();
        setupRecyclerView();

        tvDriverName.setText(sessionManager.getDriverName());
        tvShuttleName.setText(sessionManager.getShuttleName());

        fetchCurrentTripStatus();
    }

    private void initViews() {
        tvDriverName = findViewById(R.id.tvDriverName);
        tvShuttleName = findViewById(R.id.tvShuttleName);
        tvTripStatus = findViewById(R.id.tvTripStatus);
        tvSpeed = findViewById(R.id.tvSpeed);
        tvPositionCount = findViewById(R.id.tvPositionCount);
        tvDistance = findViewById(R.id.tvDistance);
        tvDuration = findViewById(R.id.tvDuration);
        tvNextStop = findViewById(R.id.tvNextStop);
        tvEta = findViewById(R.id.tvEta);
        pulseDot = findViewById(R.id.pulseDot);
        layoutMetrics = findViewById(R.id.layoutMetrics);
        cardNextStop = findViewById(R.id.cardNextStop);
        cardHero = findViewById(R.id.cardHero);
        fabStart = findViewById(R.id.fabStart);
        btnPauseTrip = findViewById(R.id.btnPauseTrip);
        btnResumeTrip = findViewById(R.id.btnResumeTrip);
        btnFinishTrip = findViewById(R.id.btnFinishTrip);
        gpsProgressBar = findViewById(R.id.gpsProgressBar);
        rvHistory = findViewById(R.id.rvHistory);
    }

    private void setupToolbar() {
        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
    }

    private void setupRecyclerView() {
        historyAdapter = new TripHistoryAdapter(this, new ArrayList<>(), trip ->
                startActivity(new Intent(this, TripHistoryActivity.class)));
        rvHistory.setLayoutManager(new LinearLayoutManager(this));
        rvHistory.setAdapter(historyAdapter);
        rvHistory.setNestedScrollingEnabled(false);
    }

    private void setupButtons() {
        fabStart.setOnClickListener(v -> startTrip());
        btnPauseTrip.setOnClickListener(v -> updateStatus("pause"));
        btnResumeTrip.setOnClickListener(v -> updateStatus("active"));
        btnFinishTrip.setOnClickListener(v -> confirmFinishTrip());
        findViewById(R.id.btnViewAll).setOnClickListener(v ->
                startActivity(new Intent(this, TripHistoryActivity.class)));
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_driver, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == R.id.action_logout) {
            logout();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private void fetchCurrentTripStatus() {
        gpsProgressBar.setVisibility(View.VISIBLE);
        int shuttleId = sessionManager.getShuttleId();

        RetrofitClient.getService().getShuttleActiveTrip(shuttleId)
                .enqueue(new Callback<TripResponse>() {
                    @Override
                    public void onResponse(Call<TripResponse> call,
                                           Response<TripResponse> response) {
                        gpsProgressBar.setVisibility(View.GONE);
                        if (response.isSuccessful() && response.body() != null) {
                            TripResponse trip = response.body();
                            currentTripId = trip.getTripId();
                            currentTripStatus = trip.getStatus();
                            sessionManager.saveActiveTripId(currentTripId);
                            tripStartTime = System.currentTimeMillis();

                            runOnUiThread(() -> {
                                updateUIForActiveTrip();
                                updateStatusUI(currentTripStatus);
                                if (currentTripStatus.equals("active")) {
                                    startLocationTracking();
                                    startDurationCounter();
                                }
                            });
                        } else {
                            currentTripId = -1;
                            sessionManager.clearActiveTripId();
                            runOnUiThread(() -> updateUIForNoTrip());
                        }
                        loadTripHistory();
                    }

                    @Override
                    public void onFailure(Call<TripResponse> call, Throwable t) {
                        gpsProgressBar.setVisibility(View.GONE);
                        currentTripId = sessionManager.getActiveTripId();
                        if (currentTripId != -1) {
                            runOnUiThread(() -> {
                                updateUIForActiveTrip();
                                updateStatusUI("active");
                            });
                        } else {
                            runOnUiThread(() -> updateUIForNoTrip());
                        }
                        loadTripHistory();
                    }
                });
    }

    private void startTrip() {
        vibrate();
        fabStart.setEnabled(false);
        fabStart.setText("Démarrage...");

        RetrofitClient.getService().startTrip().enqueue(new Callback<TripResponse>() {
            @Override
            public void onResponse(Call<TripResponse> call,
                                   Response<TripResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    currentTripId = response.body().getTripId();
                    currentTripStatus = "active";
                    sessionManager.saveActiveTripId(currentTripId);
                    positionCount = 0;
                    totalDistance = 0f;
                    lastLocation = null;
                    tripStartTime = System.currentTimeMillis();

                    updateUIForActiveTrip();
                    updateStatusUI("active");
                    startLocationTracking();
                    startDurationCounter();
                    loadNearestStop();

                    Snackbar.make(findViewById(R.id.nestedScrollView),
                            "Tournée démarrée!", Snackbar.LENGTH_SHORT).show();
                } else {
                    fabStart.setEnabled(true);
                    fabStart.setText(getString(R.string.start_trip));
                    Snackbar.make(findViewById(R.id.nestedScrollView),
                            "Impossible de démarrer la tournée",
                            Snackbar.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<TripResponse> call, Throwable t) {
                fabStart.setEnabled(true);
                fabStart.setText(getString(R.string.start_trip));
                Snackbar.make(findViewById(R.id.nestedScrollView),
                        getString(R.string.error_network),
                        Snackbar.LENGTH_SHORT).show();
            }
        });
    }

    private void updateStatus(String status) {
        if (currentTripId == -1) return;
        vibrate();

        RetrofitClient.getService().updateTripStatus(currentTripId,
                new StatusRequest(status)).enqueue(new Callback<TripResponse>() {
            @Override
            public void onResponse(Call<TripResponse> call,
                                   Response<TripResponse> response) {
                if (response.isSuccessful()) {
                    currentTripStatus = status;
                    updateStatusUI(status);
                    if (status.equals("pause")) {
                        stopLocationTracking();
                        stopDurationCounter();
                        pulseDot.clearAnimation();
                        Snackbar.make(findViewById(R.id.nestedScrollView),
                                "Tournée en pause", Snackbar.LENGTH_SHORT).show();
                    } else if (status.equals("active")) {
                        startLocationTracking();
                        startDurationCounter();
                        Snackbar.make(findViewById(R.id.nestedScrollView),
                                "Tournée reprise", Snackbar.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(Call<TripResponse> call, Throwable t) {
                Snackbar.make(findViewById(R.id.nestedScrollView),
                        getString(R.string.error_network),
                        Snackbar.LENGTH_SHORT).show();
            }
        });
    }

    private void confirmFinishTrip() {
        new AlertDialog.Builder(this)
                .setTitle("Terminer la tournée")
                .setMessage("Êtes-vous sûr de vouloir terminer cette tournée?")
                .setPositiveButton("Terminer", (dialog, which) -> finishTrip())
                .setNegativeButton("Annuler", null)
                .show();
    }

    private void finishTrip() {
        if (currentTripId == -1) {
            updateUIForNoTrip();
            return;
        }
        vibrate();

        RetrofitClient.getService().updateTripStatus(currentTripId,
                new StatusRequest("finished")).enqueue(new Callback<TripResponse>() {
            @Override
            public void onResponse(Call<TripResponse> call,
                                   Response<TripResponse> response) {
                stopLocationTracking();
                stopDurationCounter();
                currentTripId = -1;
                currentTripStatus = "";
                sessionManager.clearActiveTripId();
                positionCount = 0;
                totalDistance = 0f;
                updateUIForNoTrip();
                loadTripHistory();
                Snackbar.make(findViewById(R.id.nestedScrollView),
                        "Tournée terminée!", Snackbar.LENGTH_LONG).show();
            }

            @Override
            public void onFailure(Call<TripResponse> call, Throwable t) {
                Snackbar.make(findViewById(R.id.nestedScrollView),
                        getString(R.string.error_network),
                        Snackbar.LENGTH_SHORT).show();
            }
        });
    }

    private void startDurationCounter() {
        stopDurationCounter();
        tvDuration.setVisibility(View.VISIBLE);

        durationRunnable = new Runnable() {
            @Override
            public void run() {
                long elapsed = System.currentTimeMillis() - tripStartTime;
                long hours = elapsed / 3600000;
                long minutes = (elapsed % 3600000) / 60000;
                long seconds = (elapsed % 60000) / 1000;
                tvDuration.setText(String.format(Locale.getDefault(),
                        "%02d:%02d:%02d", hours, minutes, seconds));
                durationHandler.postDelayed(this, 1000);
            }
        };
        durationHandler.post(durationRunnable);
    }

    private void stopDurationCounter() {
        if (durationRunnable != null) {
            durationHandler.removeCallbacks(durationRunnable);
        }
    }

    private void startPulseAnimation() {
        pulseDot.startAnimation(
                AnimationUtils.loadAnimation(this, R.anim.pulse));
    }

    private void loadNearestStop() {
        RetrofitClient.getService().getAllStops().enqueue(new Callback<List<Stop>>() {
            @Override
            public void onResponse(Call<List<Stop>> call,
                                   Response<List<Stop>> response) {
                if (response.isSuccessful() && response.body() != null
                        && !response.body().isEmpty()) {
                    cardNextStop.setVisibility(View.VISIBLE);
                    tvNextStop.setText(response.body().get(0).getName());
                    tvEta.setText("~5");
                }
            }

            @Override
            public void onFailure(Call<List<Stop>> call, Throwable t) {}
        });
    }

    private void startLocationTracking() {
        if (ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    LOCATION_PERMISSION_REQUEST);
            return;
        }

        isTracking = true;
        gpsProgressBar.setVisibility(View.VISIBLE);

        LocationRequest locationRequest = new LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY, GPS_INTERVAL)
                .setMinUpdateIntervalMillis(GPS_INTERVAL)
                .build();

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(@NonNull LocationResult locationResult) {
                Location location = locationResult.getLastLocation();
                if (location != null && isTracking) {
                    gpsProgressBar.setVisibility(View.GONE);
                    sendPosition(location);
                }
            }
        };

        fusedLocationClient.requestLocationUpdates(
                locationRequest, locationCallback, null);
    }

    private void stopLocationTracking() {
        isTracking = false;
        gpsProgressBar.setVisibility(View.GONE);
        if (locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }
    }

    private void sendPosition(Location location) {
        double lat = location.getLatitude();
        double lng = location.getLongitude();
        float speed = location.getSpeed() * 3.6f;

        if (lastLocation != null) {
            float distance = lastLocation.distanceTo(location);
            totalDistance += distance / 1000f;
            tvDistance.setText(String.format(Locale.getDefault(),
                    "%.1f", totalDistance));
        }
        lastLocation = location;

        tvSpeed.setText(String.format(Locale.getDefault(), "%.0f", speed));
        positionCount++;
        tvPositionCount.setText(String.valueOf(positionCount));
        startPulseAnimation();

        PositionRequest request = new PositionRequest(lat, lng, speed);
        RetrofitClient.getService().sendPosition(request)
                .enqueue(new Callback<Void>() {
                    @Override
                    public void onResponse(Call<Void> call, Response<Void> response) {}

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                        pulseDot.clearAnimation();
                    }
                });
    }

    private void updateUIForActiveTrip() {
        layoutMetrics.setVisibility(View.VISIBLE);
        fabStart.setVisibility(View.GONE);
        btnFinishTrip.setVisibility(View.VISIBLE);
    }

    private void updateUIForNoTrip() {
        layoutMetrics.setVisibility(View.GONE);
        cardNextStop.setVisibility(View.GONE);
        tvDuration.setVisibility(View.GONE);
        fabStart.setVisibility(View.VISIBLE);
        fabStart.setEnabled(true);
        fabStart.setText(getString(R.string.start_trip));
        btnPauseTrip.setVisibility(View.GONE);
        btnResumeTrip.setVisibility(View.GONE);
        btnFinishTrip.setVisibility(View.GONE);
        tvTripStatus.setText("Hors service");
        pulseDot.clearAnimation();
        pulseDot.setBackgroundResource(R.drawable.shape_circle_muted);
    }

    private void updateStatusUI(String status) {
        switch (status) {
            case "active":
                tvTripStatus.setText("En tournée");
                pulseDot.setBackgroundResource(R.drawable.shape_circle_success);
                startPulseAnimation();
                btnPauseTrip.setVisibility(View.VISIBLE);
                btnResumeTrip.setVisibility(View.GONE);
                break;
            case "pause":
                tvTripStatus.setText("En pause");
                pulseDot.setBackgroundResource(R.drawable.shape_circle_warning);
                pulseDot.clearAnimation();
                btnPauseTrip.setVisibility(View.GONE);
                btnResumeTrip.setVisibility(View.VISIBLE);
                break;
        }
    }


    private void loadTripHistory() {
        int shuttleId = sessionManager.getShuttleId();
        RetrofitClient.getService().getShuttleTripHistory(shuttleId)
                .enqueue(new Callback<List<TripResponse>>() {
                    @Override
                    public void onResponse(Call<List<TripResponse>> call,
                                           Response<List<TripResponse>> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            runOnUiThread(() ->
                                    historyAdapter.updateData(response.body()));
                        }
                    }

                    @Override
                    public void onFailure(Call<List<TripResponse>> call, Throwable t) {}
                });
    }

    private void vibrate() {
        try {
            Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                vibrator.vibrate(VibrationEffect.createOneShot(
                        50, VibrationEffect.DEFAULT_AMPLITUDE));
            }
        } catch (Exception e) {
            // ignore
        }
    }

    private void logout() {
        new AlertDialog.Builder(this)
                .setTitle("Déconnexion")
                .setMessage(currentTripId != -1
                        ? "Vous avez une tournée active. Forcer la déconnexion?"
                        : "Voulez-vous vous déconnecter?")
                .setPositiveButton("Déconnecter", (dialog, which) -> {
                    stopLocationTracking();
                    stopDurationCounter();
                    sessionManager.clearSession();
                    startActivity(new Intent(this, DriverLoginActivity.class));
                    finish();
                })
                .setNegativeButton("Annuler", null)
                .show();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST
                && grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startLocationTracking();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopLocationTracking();
        stopDurationCounter();
    }
}