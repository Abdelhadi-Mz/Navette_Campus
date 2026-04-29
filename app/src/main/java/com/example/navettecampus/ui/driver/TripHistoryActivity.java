package com.example.navettecampus.ui.driver;

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.navettecampus.R;
import com.example.navettecampus.ThemeManager;
import com.example.navettecampus.api.RetrofitClient;
import com.example.navettecampus.models.TripResponse;
import com.example.navettecampus.utils.SessionManager;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;

public class TripHistoryActivity extends AppCompatActivity {

    private RecyclerView rvHistory;
    private TripHistoryAdapter adapter;
    private LinearProgressIndicator progressBar;
    private TextView tvEmpty;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ThemeManager.applySavedTheme(this);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_trip_history);

        sessionManager = new SessionManager(this);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        toolbar.setNavigationOnClickListener(v -> finish());

        progressBar = findViewById(R.id.progressBar);
        tvEmpty = findViewById(R.id.tvEmpty);
        rvHistory = findViewById(R.id.rvHistory);

        adapter = new TripHistoryAdapter(this, new ArrayList<>(), trip ->
                new androidx.appcompat.app.AlertDialog.Builder(this)
                        .setTitle("Tournée #" + trip.getTripId())
                        .setMessage(
                                "Statut: " + trip.getStatus() + "\n" +
                                        "Démarré: " + trip.getStartedAt()
                                        .substring(0, 16).replace("T", " à ") + "\n" +
                                        "Terminé: " + (trip.getEndedAt() != null
                                        && !trip.getEndedAt().equals("null")
                                        ? trip.getEndedAt().substring(0, 16).replace("T", " à ")
                                        : "En cours") + "\n" +
                                        "Positions GPS: " + trip.getPositionCount()
                        )
                        .setPositiveButton("OK", null)
                        .show()
        );

        rvHistory.setLayoutManager(new LinearLayoutManager(this));
        rvHistory.setAdapter(adapter);

        loadHistory();
    }

    private void loadHistory() {
        progressBar.setVisibility(View.VISIBLE);
        tvEmpty.setVisibility(View.GONE);

        RetrofitClient.getService()
                .getShuttleTripHistory(sessionManager.getShuttleId())
                .enqueue(new Callback<List<TripResponse>>() {
                    @Override
                    public void onResponse(Call<List<TripResponse>> call,
                                           Response<List<TripResponse>> response) {
                        progressBar.setVisibility(View.GONE);
                        if (response.isSuccessful() && response.body() != null) {
                            List<TripResponse> trips = response.body();
                            if (trips.isEmpty()) {
                                tvEmpty.setVisibility(View.VISIBLE);
                            } else {
                                adapter.updateData(trips);
                            }
                        } else {
                            tvEmpty.setText("Erreur chargement");
                            tvEmpty.setVisibility(View.VISIBLE);
                        }
                    }

                    @Override
                    public void onFailure(Call<List<TripResponse>> call, Throwable t) {
                        progressBar.setVisibility(View.GONE);
                        tvEmpty.setText("Erreur réseau");
                        tvEmpty.setVisibility(View.VISIBLE);
                    }
                });
    }
}