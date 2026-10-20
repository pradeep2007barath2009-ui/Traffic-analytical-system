package com.urbanflow.engine;

import com.urbanflow.model.SignalPhase;

/**
 * Adaptive signal controller managing phase cycling, pedestrian walk requests,
 * and emergency priority green corridor preemption.
 */
public class AdaptiveSignalController {

    private SignalPhase currentPhase;
    private double phaseTimeRemainingSeconds;
    private boolean pedestrianRequested;
    private boolean emergencyActive;
    private double defaultGreenDuration = 12.0;
    private double defaultYellowDuration = 3.0;
    private double pedestrianWalkDuration = 9.0;
    private double emergencyDuration = 8.0;

    public AdaptiveSignalController() {
        this.currentPhase = SignalPhase.NORTH_SOUTH_GREEN;
        this.phaseTimeRemainingSeconds = defaultGreenDuration;
        this.pedestrianRequested = false;
        this.emergencyActive = false;
    }

    public synchronized void update(double dtSeconds) {
        phaseTimeRemainingSeconds -= dtSeconds;

        if (phaseTimeRemainingSeconds <= 0.0) {
            advancePhase();
        }
    }

    private void advancePhase() {
        if (emergencyActive) {
            // End emergency mode and return to standard North-South flow
            emergencyActive = false;
            currentPhase = SignalPhase.NORTH_SOUTH_GREEN;
            phaseTimeRemainingSeconds = defaultGreenDuration;
            return;
        }

        if (pedestrianRequested && currentPhase != SignalPhase.PEDESTRIAN_ALL_RED) {
            // Transition directly to all-red pedestrian walk phase
            pedestrianRequested = false;
            currentPhase = SignalPhase.PEDESTRIAN_ALL_RED;
            phaseTimeRemainingSeconds = pedestrianWalkDuration;
            return;
        }

        switch (currentPhase) {
            case NORTH_SOUTH_GREEN:
                currentPhase = SignalPhase.NORTH_SOUTH_YELLOW;
                phaseTimeRemainingSeconds = defaultYellowDuration;
                break;
            case NORTH_SOUTH_YELLOW:
                if (pedestrianRequested) {
                    pedestrianRequested = false;
                    currentPhase = SignalPhase.PEDESTRIAN_ALL_RED;
                    phaseTimeRemainingSeconds = pedestrianWalkDuration;
                } else {
                    currentPhase = SignalPhase.EAST_WEST_GREEN;
                    phaseTimeRemainingSeconds = defaultGreenDuration;
                }
                break;
            case EAST_WEST_GREEN:
                currentPhase = SignalPhase.EAST_WEST_YELLOW;
                phaseTimeRemainingSeconds = defaultYellowDuration;
                break;
            case EAST_WEST_YELLOW:
            case PEDESTRIAN_ALL_RED:
            case EMERGENCY_PREEMPTION:
            default:
                currentPhase = SignalPhase.NORTH_SOUTH_GREEN;
                phaseTimeRemainingSeconds = defaultGreenDuration;
                break;
        }
    }

    public synchronized void requestPedestrianCrossing() {
        if (currentPhase == SignalPhase.PEDESTRIAN_ALL_RED) {
            return; // Already active
        }
        pedestrianRequested = true;
        // If currently in a green phase with plenty of time, shorten to speed up change
        if (phaseTimeRemainingSeconds > 2.0 &&
            (currentPhase == SignalPhase.NORTH_SOUTH_GREEN || currentPhase == SignalPhase.EAST_WEST_GREEN)) {
            phaseTimeRemainingSeconds = 2.0;
        }
    }

    public synchronized void triggerEmergencyPreemption() {
        emergencyActive = true;
        currentPhase = SignalPhase.EMERGENCY_PREEMPTION;
        phaseTimeRemainingSeconds = emergencyDuration;
    }

    public synchronized SignalPhase getCurrentPhase() {
        return currentPhase;
    }

    public synchronized double getPhaseTimeRemainingSeconds() {
        return Math.max(0.0, phaseTimeRemainingSeconds);
    }

    public synchronized int getCountdownSeconds() {
        return (int) Math.ceil(Math.max(0.0, phaseTimeRemainingSeconds));
    }

    public synchronized boolean isPedestrianCrossingActive() {
        return currentPhase == SignalPhase.PEDESTRIAN_ALL_RED;
    }

    public synchronized boolean isEmergencyCorridorActive() {
        return currentPhase == SignalPhase.EMERGENCY_PREEMPTION;
    }
}
