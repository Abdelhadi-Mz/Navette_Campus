package com.example.navettecampus.ui.welcome;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.splashscreen.SplashScreen;
import com.example.navettecampus.R;
import com.example.navettecampus.ThemeManager;
import com.example.navettecampus.ui.driver.DriverLoginActivity;
import com.example.navettecampus.ui.student.StudentMapActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.switchmaterial.SwitchMaterial;

public class WelcomeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Install splash screen FIRST
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);

        // Apply saved theme
        ThemeManager.applySavedTheme(this);

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_welcome);

        MaterialButton btnStudent = findViewById(R.id.btnStudent);
        MaterialButton btnDriver = findViewById(R.id.btnDriver);
        SwitchMaterial switchTheme = findViewById(R.id.switchTheme);
        View bottomCard = findViewById(R.id.bottomCard);
        View layoutTop = findViewById(R.id.layoutTop);

        // Set switch state
        int savedTheme = ThemeManager.getSavedTheme(this);
        switchTheme.setChecked(savedTheme == ThemeManager.MODE_DARK);

        // Entrance animations
        animateEntrance(layoutTop, bottomCard);

        // Theme toggle
        switchTheme.setOnCheckedChangeListener((buttonView, isChecked) -> {
            int mode = isChecked ? ThemeManager.MODE_DARK : ThemeManager.MODE_LIGHT;
            ThemeManager.saveTheme(this, mode);
            ThemeManager.applyTheme(mode);
        });

        // Student button
        btnStudent.setOnClickListener(v -> {
            startActivity(new Intent(this, StudentMapActivity.class));
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        });

        // Driver button
        btnDriver.setOnClickListener(v -> {
            startActivity(new Intent(this, DriverLoginActivity.class));
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        });
    }

    private void animateEntrance(View topView, View bottomCard) {
        // Top section slides down from above
        topView.setTranslationY(-100f);
        topView.setAlpha(0f);

        // Bottom card slides up from below
        bottomCard.setTranslationY(300f);
        bottomCard.setAlpha(0f);

        // Animate top
        ObjectAnimator topY = ObjectAnimator.ofFloat(topView, "translationY", -100f, 0f);
        ObjectAnimator topAlpha = ObjectAnimator.ofFloat(topView, "alpha", 0f, 1f);
        topY.setDuration(600);
        topAlpha.setDuration(600);
        topY.setInterpolator(new DecelerateInterpolator());

        // Animate bottom
        ObjectAnimator bottomY = ObjectAnimator.ofFloat(bottomCard, "translationY", 300f, 0f);
        ObjectAnimator bottomAlpha = ObjectAnimator.ofFloat(bottomCard, "alpha", 0f, 1f);
        bottomY.setDuration(700);
        bottomAlpha.setDuration(700);
        bottomY.setInterpolator(new DecelerateInterpolator());
        bottomY.setStartDelay(200);
        bottomAlpha.setStartDelay(200);

        // Play together
        AnimatorSet set = new AnimatorSet();
        set.playTogether(topY, topAlpha, bottomY, bottomAlpha);
        set.start();
    }
}
