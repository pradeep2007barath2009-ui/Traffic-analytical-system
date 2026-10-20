package com.urbanflow.model;

/**
 * Pedestrian model for crosswalk navigation, animation, and vehicle yield interactions.
 */
public class Pedestrian {

    public enum State {
        WAITING,
        CROSSING,
        CLEARED
    }

    private final String id;
    private final String approach; // NORTH, SOUTH, EAST, WEST
    private double x;
    private double y;
    private final double startX;
    private final double startY;
    private final double targetX;
    private final double targetY;
    private final double speedKmh;
    private State state;
    private double progress; // 0.0 to 1.0
    private int stepCounter;

    public Pedestrian(String id, String approach, double startX, double startY, double targetX, double targetY) {
        this.id = id;
        this.approach = approach;
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.x = startX;
        this.y = startY;
        this.speedKmh = 4.2 + Math.random() * 0.9; // walking speed between 4.2 and 5.1 km/h
        this.state = State.WAITING;
        this.progress = 0.0;
        this.stepCounter = 0;
    }

    public void startCrossing() {
        if (state == State.WAITING) {
            state = State.CROSSING;
        }
    }

    public void update(double dtSeconds) {
        if (state != State.CROSSING) {
            return;
        }

        stepCounter++;

        // Total distance in pixels
        double totalDist = Math.hypot(targetX - startX, targetY - startY);
        if (totalDist <= 0.0) {
            state = State.CLEARED;
            return;
        }

        // 1 km/h = approx 2.2 px/s
        double pxSpeed = speedKmh * 2.2;
        double step = (pxSpeed * dtSeconds) / totalDist;
        progress = Math.min(1.0, progress + step);

        x = startX + (targetX - startX) * progress;
        y = startY + (targetY - startY) * progress;

        if (progress >= 1.0) {
            state = State.CLEARED;
        }
    }

    public String getId() {
        return id;
    }

    public String getApproach() {
        return approach;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getSpeedKmh() {
        return speedKmh;
    }

    public State getState() {
        return state;
    }

    public double getProgress() {
        return progress;
    }

    public int getStepCounter() {
        return stepCounter;
    }

    public boolean isCrossing() {
        return state == State.CROSSING;
    }

    public boolean isCleared() {
        return state == State.CLEARED;
    }
}
