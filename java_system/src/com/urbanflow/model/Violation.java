package com.urbanflow.model;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * Traffic violation record with license plate attribution, fine valuation, and timestamps.
 */
public class Violation {

    public enum Type {
        RED_LIGHT_RUN("Red Light Run", 250, "CRITICAL"),
        SPEEDING("Speed Limit Exceeded", 150, "WARNING"),
        FAILURE_TO_YIELD_PEDESTRIAN("Failure to Yield to Pedestrian", 300, "SEVERE");

        public final String displayName;
        public final int defaultFine;
        public final String severity;

        Type(String displayName, int defaultFine, String severity) {
            this.displayName = displayName;
            this.defaultFine = defaultFine;
            this.severity = severity;
        }
    }

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final String id;
    private final String timestamp;
    private final String vehicleId;
    private final String licensePlate;
    private final Type type;
    private final double speedKmh;
    private final int fineAmount;
    private String status;

    public Violation(String id, String vehicleId, String licensePlate, Type type, double speedKmh) {
        this.id = id;
        this.timestamp = LocalTime.now().format(TIME_FORMATTER);
        this.vehicleId = vehicleId;
        this.licensePlate = licensePlate;
        this.type = type;
        this.speedKmh = speedKmh;
        this.fineAmount = type.defaultFine;
        this.status = "CITATION ISSUED";
    }

    public String getId() {
        return id;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public Type getType() {
        return type;
    }

    public double getSpeedKmh() {
        return speedKmh;
    }

    public int getFineAmount() {
        return fineAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
