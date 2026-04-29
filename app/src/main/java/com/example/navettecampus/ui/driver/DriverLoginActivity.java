package com.example.navettecampus.ui.driver;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.example.navettecampus.R;
import com.example.navettecampus.ThemeManager;
import com.example.navettecampus.api.RetrofitClient;
import com.example.navettecampus.models.LoginRequest;
import com.example.navettecampus.models.LoginResponse;
import com.example.navettecampus.utils.SessionManager;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DriverLoginActivity extends AppCompatActivity {

    private TextInputEditText etShuttleId, etPin;
    private TextView tvError;
    private MaterialButton btnLogin;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ThemeManager.applySavedTheme(this);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_driver_login);

        sessionManager = new SessionManager(this);



        etShuttleId = findViewById(R.id.etShuttleId);
        etPin = findViewById(R.id.etPin);
        tvError = findViewById(R.id.tvError);
        btnLogin = findViewById(R.id.btnLogin);
        MaterialButton btnBack = findViewById(R.id.btnBack);

        btnLogin.setOnClickListener(v -> attemptLogin());
        btnBack.setOnClickListener(v -> finish());
    }

    private void attemptLogin() {
        String shuttleIdStr = etShuttleId.getText().toString().trim();
        String pin = etPin.getText().toString().trim();

        // Validation
        if (shuttleIdStr.isEmpty()) {
            showError("Veuillez entrer l'ID de la navette");
            return;
        }
        if (pin.isEmpty()) {
            showError("Veuillez entrer votre PIN");
            return;
        }

        int shuttleId;
        try {
            shuttleId = Integer.parseInt(shuttleIdStr);
        } catch (NumberFormatException e) {
            showError("ID navette invalide");
            return;
        }

        // Show loading
        btnLogin.setEnabled(false);
        btnLogin.setText("Connexion...");
        hideError();

        // API call
        LoginRequest request = new LoginRequest(shuttleId, pin);
        RetrofitClient.getService().driverLogin(request).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                btnLogin.setEnabled(true);
                btnLogin.setText(getString(R.string.login));

                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse data = response.body();
                    sessionManager.saveSession(
                            data.getToken(),
                            data.getShuttle().getId(),
                            data.getShuttle().getName(),
                            data.getShuttle().getDriverName()
                    );
                    goToDashboard();
                } else {
                    showError(getString(R.string.error_invalid_credentials));
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                btnLogin.setEnabled(true);
                btnLogin.setText(getString(R.string.login));
                showError(getString(R.string.error_network));
            }
        });
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    private void hideError() {
        tvError.setVisibility(View.GONE);
    }

    private void goToDashboard() {
        startActivity(new Intent(this, DriverDashboardActivity.class));
        finish();
    }
}
