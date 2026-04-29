package com.example.navettecampus.utils;

import android.content.Context;
import android.preference.PreferenceManager;
import org.osmdroid.config.Configuration;

public class MapConfig {
    public static void init(Context context) {
        Configuration.getInstance().load(
                context,
                PreferenceManager.getDefaultSharedPreferences(context)
        );
        Configuration.getInstance().setUserAgentValue(
                context.getPackageName());
    }
}
