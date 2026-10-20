package com.urbanflow.model;

/**
 * SignalPhase represents the active traffic light state across the 4-way intersection.
 */
public enum SignalPhase {
    NORTH_SOUTH_GREEN("NS GREEN", "North-South Corridor Green", true, false, false, false),
    NORTH_SOUTH_YELLOW("NS YELLOW", "North-South Corridor Yellow", false, false, false, false),
    EAST_WEST_GREEN("EW GREEN", "East-West Corridor Green", false, true, false, false),
    EAST_WEST_YELLOW("EW YELLOW", "East-West Corridor Yellow", false, false, false, false),
    PEDESTRIAN_ALL_RED("PEDESTRIAN WALK", "All Approaches Red (Pedestrians Crossing)", false, false, true, false),
    EMERGENCY_PREEMPTION("EMERGENCY WAVE", "Priority Green Corridor for Emergency Vehicle", false, false, false, true);

    private final String label;
    private final String description;
    private final boolean nsGreen;
    private final boolean ewGreen;
    private final boolean pedestrianActive;
    private final boolean emergencyActive;

    SignalPhase(String label, String description, boolean nsGreen, boolean ewGreen,
                boolean pedestrianActive, boolean emergencyActive) {
        this.label = label;
        this.description = description;
        this.nsGreen = nsGreen;
        this.ewGreen = ewGreen;
        this.pedestrianActive = pedestrianActive;
        this.emergencyActive = emergencyActive;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public boolean isNsGreen() {
        return nsGreen;
    }

    public boolean isEwGreen() {
        return ewGreen;
    }

    public boolean isPedestrianActive() {
        return pedestrianActive;
    }

    public boolean isEmergencyActive() {
        return emergencyActive;
    }
}
