package com.example.navettecampus.ui.driver;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.navettecampus.R;
import com.example.navettecampus.models.TripResponse;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class TripHistoryAdapter extends
        RecyclerView.Adapter<TripHistoryAdapter.ViewHolder> {

    private List<TripResponse> trips;
    private Context context;
    private OnTripClickListener listener;

    public TripHistoryAdapter(Context context, List<TripResponse> trips,
                              OnTripClickListener listener) {
        this.context = context;
        this.trips = trips;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context)
                .inflate(R.layout.item_trip_history, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        TripResponse trip = trips.get(position);

        View statusDot = holder.itemView.findViewById(R.id.statusDot);
        if (trip.getStatus().equals("finished")) {
            holder.tvStatus.setText("Terminée");
            holder.tvStatus.setTextColor(context.getColor(R.color.success));
            statusDot.setBackgroundResource(R.drawable.shape_circle_success);
        } else if (trip.getStatus().equals("pause")) {
            holder.tvStatus.setText("En pause");
            holder.tvStatus.setTextColor(context.getColor(R.color.warning));
            statusDot.setBackgroundResource(R.drawable.shape_circle_warning);
        } else {
            holder.tvStatus.setText("Active");
            holder.tvStatus.setTextColor(context.getColor(R.color.success));
            statusDot.setBackgroundResource(R.drawable.shape_circle_success);
        }

        try {
            String date = trip.getStartedAt().substring(0, 10);
            String time = trip.getStartedAt().substring(11, 16);
            holder.tvDate.setText(date + "  " + time);
        } catch (Exception e) {
            holder.tvDate.setText(trip.getStartedAt());
        }

        holder.tvPositions.setText(trip.getPositionCount() + " pts GPS");

        if (trip.getEndedAt() != null && !trip.getEndedAt().isEmpty()
                && !trip.getEndedAt().equals("null")) {
            holder.tvDuration.setText(calculateDuration(
                    trip.getStartedAt(), trip.getEndedAt()));
        } else {
            holder.tvDuration.setText("En cours");
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onTripClick(trip);
        });
    }

    @Override
    public int getItemCount() {
        return trips.size();
    }

    private String calculateDuration(String start, String end) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(
                    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            Date startDate = sdf.parse(start);
            Date endDate = sdf.parse(end);
            long diff = (endDate.getTime() - startDate.getTime()) / 1000 / 60;
            if (diff < 60) return diff + " min";
            return (diff / 60) + "h " + (diff % 60) + "min";
        } catch (Exception e) {
            return "--";
        }
    }

    public void updateData(List<TripResponse> newTrips) {
        this.trips = newTrips;
        notifyDataSetChanged();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvStatus, tvDate, tvDuration, tvPositions;

        ViewHolder(View itemView) {
            super(itemView);
            tvStatus = itemView.findViewById(R.id.tvHistoryStatus);
            tvDate = itemView.findViewById(R.id.tvHistoryDate);
            tvDuration = itemView.findViewById(R.id.tvHistoryDuration);
            tvPositions = itemView.findViewById(R.id.tvHistoryPositions);
        }
    }

    public interface OnTripClickListener {
        void onTripClick(TripResponse trip);
    }
}
