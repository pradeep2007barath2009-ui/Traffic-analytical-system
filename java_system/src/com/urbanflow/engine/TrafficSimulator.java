package com.urbanflow.engine;

import com.urbanflow.model.Pedestrian;
import com.urbanflow.model.SignalPhase;
import com.urbanflow.model.TrafficMetrics;
import com.urbanflow.model.Vehicle;
import com.urbanflow.model.Violation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * High-performance 60 FPS physics engine handling multi-lane vehicle dynamics,
 * Intelligent Driver Model (IDM) following gaps, stop line adherence,
 * pedestrian crosswalk safety yielding, and traffic violation detection.
 */
public class TrafficSimulator {

    public interface ViolationListener {
        void onViolationLogged(Violation violation);
    }

    private final AdaptiveSignalController signalController;
    private final TrafficMetrics metrics;
    private final List<Vehicle> vehicles;
    private final List<Pedestrian> pedestrians;
    private final List<Violation> violations;
    private final List<ViolationListener> listeners;
    private final Random random;

    private boolean paused;
    private double spawnTimerSeconds;
    private double spawnIntervalSeconds;
    private int vehicleSequence;
    private int pedestrianSequence;
    private int violationSequence;

    // Fixed geometry constants
    public static final double STOP_LINE_SOUTH = 430.0;
    public static final double STOP_LINE_NORTH = 170.0;
    public static final double STOP_LINE_WEST = 170.0;
    public static final double STOP_LINE_EAST = 430.0;

    public TrafficSimulator(AdaptiveSignalController signalController) {
        this.signalController = signalController;
        this.metrics = new TrafficMetrics();
        this.vehicles = new CopyOnWriteArrayList<>();
        this.pedestrians = new CopyOnWriteArrayList<>();
        this.violations = new CopyOnWriteArrayList<>();
        this.listeners = new CopyOnWriteArrayList<>();
        this.random = new Random();

        this.paused = false;
        this.spawnTimerSeconds = 0.0;
        this.spawnIntervalSeconds = 1.8;
        this.vehicleSequence = 100;
        this.pedestrianSequence = 10;
        this.violationSequence = 500;

        // Pre-populate with a few initial vehicles
        spawnInitialVehicles();
    }

    public void addViolationListener(ViolationListener listener) {
        listeners.add(listener);
    }

    private void spawnInitialVehicles() {
        spawnVehicle("SOUTH", Vehicle.VehicleType.CAR);
        spawnVehicle("NORTH", Vehicle.VehicleType.CAR);
        spawnVehicle("WEST", Vehicle.VehicleType.BUS);
        spawnVehicle("EAST", Vehicle.VehicleType.CAR);
    }

    public synchronized void update(double dtSeconds) {
        if (paused) return;

        signalController.update(dtSeconds);

        // Vehicle spawning logic
        spawnTimerSeconds += dtSeconds;
        if (spawnTimerSeconds >= spawnIntervalSeconds) {
            spawnTimerSeconds = 0.0;
            if (vehicles.size() < 16) {
                String[] approaches = {"SOUTH", "NORTH", "WEST", "EAST"};
                String approach = approaches[random.nextInt(approaches.length)];
                Vehicle.VehicleType type = Vehicle.VehicleType.CAR;
                double roll = random.nextDouble();
                if (roll < 0.15) type = Vehicle.VehicleType.BUS;
                else if (roll < 0.28) type = Vehicle.VehicleType.TRUCK;

                spawnVehicle(approach, type);
            }
        }

        SignalPhase currentPhase = signalController.getCurrentPhase();

        // Update pedestrians
        List<Pedestrian> activePeds = new ArrayList<>();
        for (Pedestrian ped : pedestrians) {
            ped.update(dtSeconds);
            if (!ped.isCleared()) {
                activePeds.add(ped);
            }
        }
        pedestrians.clear();
        pedestrians.addAll(activePeds);

        // Update vehicles and enforce stop line / pedestrian yield physics
        List<Vehicle> remainingVehicles = new ArrayList<>();
        double totalSpeed = 0.0;

        for (Vehicle vehicle : vehicles) {
            applySignalAndPedestrianRules(vehicle, currentPhase);
            applyCarFollowingGap(vehicle);

            vehicle.update(dtSeconds);
            totalSpeed += vehicle.getSpeedKmh();

            // Check if vehicle has exited the map
            boolean outOfBounds = false;
            switch (vehicle.getApproach()) {
                case "SOUTH":
                    if (vehicle.getY() < -80.0) outOfBounds = true;
                    break;
                case "NORTH":
                    if (vehicle.getY() > 680.0) outOfBounds = true;
                    break;
                case "WEST":
                    if (vehicle.getX() > 680.0) outOfBounds = true;
                    break;
                case "EAST":
                    if (vehicle.getX() < -80.0) outOfBounds = true;
                    break;
            }

            if (outOfBounds) {
                vehicle.setCleared(true);
                metrics.recordVehicleCleared(vehicle.getWaitingTimeSeconds());
            } else {
                remainingVehicles.add(vehicle);
            }
        }

        vehicles.clear();
        vehicles.addAll(remainingVehicles);

        double avgSpeed = remainingVehicles.isEmpty() ? 40.0 : totalSpeed / remainingVehicles.size();
        metrics.updateActiveCounts(remainingVehicles.size(), pedestrians.size(), avgSpeed);
    }

    private void applySignalAndPedestrianRules(Vehicle v, SignalPhase phase) {
        boolean isNsApproach = "SOUTH".equals(v.getApproach()) || "NORTH".equals(v.getApproach());
        boolean hasGreenSignal = isNsApproach ? phase.isNsGreen() : phase.isEwGreen();

        if (phase.isEmergencyActive() && v.isAmbulance()) {
            hasGreenSignal = true; // Emergency vehicle always has green priority
        }

        // Check pedestrian crosswalk presence on this approach
        boolean pedestrianCrossingThisApproach = false;
        for (Pedestrian ped : pedestrians) {
            if (ped.isCrossing() && ped.getApproach().equals(v.getApproach())) {
                pedestrianCrossingThisApproach = true;
                break;
            }
        }

        // Calculate distance to stop line
        double distToStop = getDistanceToStopLine(v);

        // Rule 1: Pedestrian safety stop (Highest Priority)
        // If a pedestrian is crossing and vehicle is approaching stop line, force full stop
        if (pedestrianCrossingThisApproach && distToStop > 0.0 && distToStop < 160.0) {
            v.stopForPedestrian();
            // Check for violation if vehicle breaches stop line during pedestrian crossing
            if (distToStop < 15.0 && v.getSpeedKmh() > 10.0) {
                checkAndRecordViolation(v, Violation.Type.FAILURE_TO_YIELD_PEDESTRIAN);
            }
            return;
        }

        // Rule 2: Signal obedience
        if (!hasGreenSignal) {
            // Light is RED or YELLOW or PEDESTRIAN_ALL_RED
            if (distToStop > 0.0 && distToStop < 140.0) {
                v.stopForSignal();
                // Check if vehicle runs the red light
                if (distToStop < 10.0 && v.getSpeedKmh() > 20.0 && !v.isAmbulance()) {
                    checkAndRecordViolation(v, Violation.Type.RED_LIGHT_RUN);
                }
                return;
            }
        }

        // Rule 3: Speeding violation check
        if (v.getSpeedKmh() > 54.0 && !v.isAmbulance() && random.nextDouble() < 0.01) {
            checkAndRecordViolation(v, Violation.Type.SPEEDING);
        }

        // If no stops are required, resume target cruising speed
        v.resumeSpeed();
    }

    private double getDistanceToStopLine(Vehicle v) {
        switch (v.getApproach()) {
            case "SOUTH": // moving up towards STOP_LINE_SOUTH (430)
                return v.getY() - STOP_LINE_SOUTH;
            case "NORTH": // moving down towards STOP_LINE_NORTH (170)
                return STOP_LINE_NORTH - v.getY();
            case "WEST": // moving right towards STOP_LINE_WEST (170)
                return STOP_LINE_WEST - v.getX();
            case "EAST": // moving left towards STOP_LINE_EAST (430)
                return v.getX() - STOP_LINE_EAST;
            default:
                return 999.0;
        }
    }

    private void applyCarFollowingGap(Vehicle vehicle) {
        // Find closest vehicle ahead in the same approach
        Vehicle leadVehicle = null;
        double minDistance = Double.MAX_VALUE;

        for (Vehicle other : vehicles) {
            if (other == vehicle || !other.getApproach().equals(vehicle.getApproach())) {
                continue;
            }

            double gap = calculateGap(vehicle, other);
            if (gap > 0.0 && gap < minDistance) {
                minDistance = gap;
                leadVehicle = other;
            }
        }

        if (leadVehicle != null && minDistance < 55.0) {
            // Too close to lead vehicle: brake and match or go below lead vehicle speed
            double safeTarget = Math.min(leadVehicle.getSpeedKmh() * 0.9, vehicle.getTargetSpeedKmh());
            vehicle.setTargetSpeedKmh(Math.max(0.0, safeTarget));
            if (minDistance < 35.0) {
                vehicle.setTargetSpeedKmh(0.0);
            }
        }
    }

    private double calculateGap(Vehicle rear, Vehicle front) {
        switch (rear.getApproach()) {
            case "SOUTH":
                return rear.getY() - front.getY();
            case "NORTH":
                return front.getY() - rear.getY();
            case "WEST":
                return front.getX() - rear.getX();
            case "EAST":
                return rear.getX() - front.getX();
            default:
                return -1.0;
        }
    }

    private void checkAndRecordViolation(Vehicle vehicle, Violation.Type type) {
        // Prevent duplicate citations within short period
        for (Violation existing : violations) {
            if (existing.getVehicleId().equals(vehicle.getId()) && existing.getType() == type) {
                return;
            }
        }

        violationSequence++;
        String vioId = "VIO-" + violationSequence;
        Violation violation = new Violation(vioId, vehicle.getId(), vehicle.getLicensePlate(), type, vehicle.getSpeedKmh());
        violations.add(0, violation);
        metrics.recordViolation();

        for (ViolationListener listener : listeners) {
            listener.onViolationLogged(violation);
        }
    }

    public synchronized void spawnVehicle(String approach, Vehicle.VehicleType type) {
        vehicleSequence++;
        String id = (type == Vehicle.VehicleType.AMBULANCE) ? "AMB-" + (vehicleSequence % 100) : "V-" + vehicleSequence;
        String plate = generateLicensePlate();

        double startX = 300.0;
        double startY = 300.0;

        switch (approach) {
            case "SOUTH":
                startX = 338.0;
                startY = 630.0;
                break;
            case "NORTH":
                startX = 262.0;
                startY = -30.0;
                break;
            case "WEST":
                startX = -30.0;
                startY = 338.0;
                break;
            case "EAST":
                startX = 630.0;
                startY = 262.0;
                break;
        }

        Vehicle v = new Vehicle(id, type, approach, "STRAIGHT", startX, startY, plate);
        vehicles.add(v);
        metrics.recordVehicleSpawned();
    }

    public synchronized void triggerPedestrianCrossing() {
        signalController.requestPedestrianCrossing();

        pedestrianSequence++;
        String p1Id = "P-" + pedestrianSequence;
        pedestrianSequence++;
        String p2Id = "P-" + pedestrianSequence;

        // South crosswalk pedestrians (traverse from sidewalk to sidewalk across y=405)
        Pedestrian ped1 = new Pedestrian(p1Id, "SOUTH", 205.0, 405.0, 395.0, 405.0);
        Pedestrian ped2 = new Pedestrian(p2Id, "NORTH", 395.0, 195.0, 205.0, 195.0);

        ped1.startCrossing();
        ped2.startCrossing();

        pedestrians.add(ped1);
        pedestrians.add(ped2);
    }

    public synchronized void triggerEmergencyAmbulance() {
        signalController.triggerEmergencyPreemption();
        // Spawn emergency ambulance on South corridor heading North
        spawnVehicle("SOUTH", Vehicle.VehicleType.AMBULANCE);
    }

    private String generateLicensePlate() {
        String[] regions = {"CA", "TX", "NY", "FL", "WA", "IL"};
        String reg = regions[random.nextInt(regions.length)];
        int num1 = 10 + random.nextInt(90);
        char c1 = (char) ('A' + random.nextInt(26));
        char c2 = (char) ('A' + random.nextInt(26));
        int num2 = 1000 + random.nextInt(9000);
        return reg + "-" + num1 + c1 + c2 + "-" + num2;
    }

    // Controls
    public void togglePause() {
        this.paused = !this.paused;
    }

    public boolean isPaused() {
        return paused;
    }

    public void setSpawnIntervalSeconds(double interval) {
        this.spawnIntervalSeconds = Math.max(0.6, interval);
    }

    public AdaptiveSignalController getSignalController() {
        return signalController;
    }

    public TrafficMetrics getMetrics() {
        return metrics;
    }

    public List<Vehicle> getVehicles() {
        return Collections.unmodifiableList(vehicles);
    }

    public List<Pedestrian> getPedestrians() {
        return Collections.unmodifiableList(pedestrians);
    }

    public List<Violation> getViolations() {
        return Collections.unmodifiableList(violations);
    }
}
