package com.urbanflow.engine;

import com.urbanflow.model.Pedestrian;
import com.urbanflow.model.Vehicle;

import java.awt.Color;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Optical Vision Engine generating synthetic CCTV computer vision telemetry,
 * bounding box target trackers, speed radar tags, and confidence scores.
 */
public class VisionEngine {

    public static class DetectionBox {
        public final String label;
        public final double confidence;
        public final int x;
        public final int y;
        public final int width;
        public final int height;
        public final String speedTag;
        public final Color color;
        public final boolean isPedestrian;

        public DetectionBox(String label, double confidence, int x, int y, int width, int height,
                            String speedTag, Color color, boolean isPedestrian) {
            this.label = label;
            this.confidence = confidence;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.speedTag = speedTag;
            this.color = color;
            this.isPedestrian = isPedestrian;
        }
    }

    private final TrafficSimulator simulator;

    public VisionEngine(TrafficSimulator simulator) {
        this.simulator = simulator;
    }

    /**
     * Projects active simulation entities into optical camera viewfinder coordinates.
     */
    public List<DetectionBox> generateDetections(int canvasWidth, int canvasHeight) {
        List<DetectionBox> detections = new ArrayList<>();

        double scaleX = canvasWidth / 600.0;
        double scaleY = canvasHeight / 600.0;

        // Process Vehicles
        for (Vehicle v : simulator.getVehicles()) {
            int bx = (int) ((v.getX() - v.getType().width) * scaleX);
            int by = (int) ((v.getY() - v.getType().length / 2.0) * scaleY);
            int bw = (int) (v.getType().width * 2.0 * scaleX);
            int bh = (int) (v.getType().length * scaleY);

            // Keep within canvas
            if (bx + bw < 0 || bx > canvasWidth || by + bh < 0 || by > canvasHeight) {
                continue;
            }

            Color tagColor = v.isAmbulance() ? new Color(239, 68, 68) : new Color(6, 182, 212);
            String label = v.isAmbulance() ? "EMERGENCY_AMB" : v.getType().name();
            double conf = 0.94 + (Math.abs(v.getId().hashCode()) % 50) / 1000.0;
            String speed = String.format("%.1f km/h", v.getSpeedKmh());

            detections.add(new DetectionBox(label, conf, bx, by, bw, bh, speed, tagColor, false));
        }

        // Process Pedestrians
        for (Pedestrian p : simulator.getPedestrians()) {
            if (!p.isCrossing()) continue;

            int bx = (int) ((p.getX() - 10) * scaleX);
            int by = (int) ((p.getY() - 14) * scaleY);
            int bw = (int) (20 * scaleX);
            int bh = (int) (28 * scaleY);

            Color tagColor = new Color(245, 158, 11); // Amber for pedestrian target
            double conf = 0.91 + (Math.abs(p.getId().hashCode()) % 80) / 1000.0;
            String speed = String.format("%.1f km/h", p.getSpeedKmh());

            detections.add(new DetectionBox("PEDESTRIAN", conf, bx, by, bw, bh, speed, tagColor, true));
        }

        return Collections.unmodifiableList(detections);
    }
}
