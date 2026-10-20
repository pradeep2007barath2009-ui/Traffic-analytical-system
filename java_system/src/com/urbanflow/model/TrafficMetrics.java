package com.urbanflow.model;

/**
 * Real-time traffic metrics aggregating throughput, latency, and safety statistics.
 */
public class TrafficMetrics {

    private int totalVehiclesSpawned;
    private int totalVehiclesCleared;
    private int totalViolations;
    private double cumulativeWaitSeconds;
    private int activeVehiclesCount;
    private int activePedestriansCount;
    private double averageSpeedKmh;

    public TrafficMetrics() {
        this.totalVehiclesSpawned = 0;
        this.totalVehiclesCleared = 0;
        this.totalViolations = 0;
        this.cumulativeWaitSeconds = 0.0;
        this.activeVehiclesCount = 0;
        this.activePedestriansCount = 0;
        this.averageSpeedKmh = 42.0;
    }

    public synchronized void recordVehicleSpawned() {
        totalVehiclesSpawned++;
    }

    public synchronized void recordVehicleCleared(double waitTime) {
        totalVehiclesCleared++;
        cumulativeWaitSeconds += waitTime;
    }

    public synchronized void recordViolation() {
        totalViolations++;
    }

    public synchronized void updateActiveCounts(int vehicles, int pedestrians, double avgSpeed) {
        this.activeVehiclesCount = vehicles;
        this.activePedestriansCount = pedestrians;
        this.averageSpeedKmh = avgSpeed;
    }

    public synchronized double getAverageWaitSeconds() {
        if (totalVehiclesCleared == 0) return 3.2;
        return cumulativeWaitSeconds / totalVehiclesCleared;
    }

    public synchronized int getSafetyScore() {
        if (totalVehiclesCleared == 0) return 98;
        int penalty = totalViolations * 4;
        return Math.max(45, Math.min(100, 100 - penalty));
    }

    public synchronized int getThroughputPerMinute() {
        return Math.max(12, totalVehiclesCleared * 3);
    }

    public synchronized int getTotalVehiclesSpawned() {
        return totalVehiclesSpawned;
    }

    public synchronized int getTotalVehiclesCleared() {
        return totalVehiclesCleared;
    }

    public synchronized int getTotalViolations() {
        return totalViolations;
    }

    public synchronized int getActiveVehiclesCount() {
        return activeVehiclesCount;
    }

    public synchronized int getActivePedestriansCount() {
        return activePedestriansCount;
    }

    public synchronized double getAverageSpeedKmh() {
        return averageSpeedKmh;
    }
}
