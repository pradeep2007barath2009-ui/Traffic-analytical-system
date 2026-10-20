package com.urbanflow.model;

import java.awt.Color;

/**
 * Vehicle model with physics, braking behavior, emergency siren indicators,
 * and pedestrian crosswalk yielding capabilities.
 */
public class Vehicle {

    public enum VehicleType {
        CAR(32, 18, 48.0, new Color(59, 130, 246)),
        BUS(52, 22, 38.0, new Color(245, 158, 11)),
        TRUCK(46, 20, 36.0, new Color(139, 92, 246)),
        AMBULANCE(36, 18, 62.0, new Color(239, 68, 68));

        public final double length;
        public final double width;
        public final double maxSpeedKmh;
        public final Color defaultColor;

        VehicleType(double length, double width, double maxSpeedKmh, Color defaultColor) {
            this.length = length;
            this.width = width;
            this.maxSpeedKmh = maxSpeedKmh;
            this.defaultColor = defaultColor;
        }
    }

    private final String id;
    private final VehicleType type;
    private final String approach; // NORTH, SOUTH, EAST, WEST
    private final String targetTurn; // STRAIGHT, LEFT, RIGHT
    private final String licensePlate;

    private double x;
    private double y;
    private double speedKmh;
    private double targetSpeedKmh;
    private boolean braking;
    private boolean stoppedForPedestrian;
    private boolean stoppedForSignal;
    private boolean cleared;
    private double waitingTimeSeconds;
    private int sirenTick = 0;

    public Vehicle(String id, VehicleType type, String approach, String targetTurn,
                   double startX, double startY, String licensePlate) {
        this.id = id;
        this.type = type;
        this.approach = approach;
        this.targetTurn = targetTurn;
        this.x = startX;
        this.y = startY;
        this.licensePlate = licensePlate;
        this.speedKmh = type.maxSpeedKmh * (0.85 + Math.random() * 0.15);
        this.targetSpeedKmh = this.speedKmh;
        this.braking = false;
        this.stoppedForPedestrian = false;
        this.stoppedForSignal = false;
        this.cleared = false;
        this.waitingTimeSeconds = 0.0;
    }

    public void update(double dtSeconds) {
        if (type == VehicleType.AMBULANCE) {
            sirenTick = (sirenTick + 1) % 30;
        }

        // Adjust speed toward target speed with realistic acceleration/deceleration
        if (speedKmh < targetSpeedKmh) {
            double accel = (type == VehicleType.AMBULANCE) ? 22.0 : 15.0; // km/h per sec
            speedKmh = Math.min(targetSpeedKmh, speedKmh + accel * dtSeconds);
            braking = false;
        } else if (speedKmh > targetSpeedKmh) {
            double decel = 32.0; // km/h per sec
            speedKmh = Math.max(targetSpeedKmh, speedKmh - decel * dtSeconds);
            braking = true;
        } else {
            braking = false;
        }

        if (speedKmh < 1.0) {
            speedKmh = 0.0;
            waitingTimeSeconds += dtSeconds;
        }

        // Convert km/h to canvas pixels per second: 1 km/h = approx 2.2 pixels/sec
        double pxPerSecond = speedKmh * 2.2;
        double displacement = pxPerSecond * dtSeconds;

        switch (approach) {
            case "SOUTH": // moving North (up)
                y -= displacement;
                break;
            case "NORTH": // moving South (down)
                y += displacement;
                break;
            case "WEST": // moving East (right)
                x += displacement;
                break;
            case "EAST": // moving West (left)
                x -= displacement;
                break;
        }
    }

    public void stopForPedestrian() {
        this.targetSpeedKmh = 0.0;
        this.stoppedForPedestrian = true;
        this.braking = true;
    }

    public void stopForSignal() {
        this.targetSpeedKmh = 0.0;
        this.stoppedForSignal = true;
        this.braking = true;
    }

    public void resumeSpeed() {
        this.targetSpeedKmh = type.maxSpeedKmh;
        this.stoppedForPedestrian = false;
        this.stoppedForSignal = false;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public VehicleType getType() {
        return type;
    }

    public String getApproach() {
        return approach;
    }

    public String getTargetTurn() {
        return targetTurn;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getSpeedKmh() {
        return speedKmh;
    }

    public void setSpeedKmh(double speedKmh) {
        this.speedKmh = speedKmh;
    }

    public double getTargetSpeedKmh() {
        return targetSpeedKmh;
    }

    public void setTargetSpeedKmh(double targetSpeedKmh) {
        this.targetSpeedKmh = targetSpeedKmh;
    }

    public boolean isBraking() {
        return braking;
    }

    public boolean isStoppedForPedestrian() {
        return stoppedForPedestrian;
    }

    public boolean isStoppedForSignal() {
        return stoppedForSignal;
    }

    public boolean isCleared() {
        return cleared;
    }

    public void setCleared(boolean cleared) {
        this.cleared = cleared;
    }

    public double getWaitingTimeSeconds() {
        return waitingTimeSeconds;
    }

    public int getSirenTick() {
        return sirenTick;
    }

    public boolean isAmbulance() {
        return type == VehicleType.AMBULANCE;
    }
}
