package com.urbanflow.server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import com.urbanflow.engine.TrafficSimulator;
import com.urbanflow.model.SignalPhase;
import com.urbanflow.model.Violation;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.Executors;

/**
 * Embedded HTTP server utilizing standard Java SE com.sun.net.httpserver,
 * exposing REST endpoints for live telemetry, metrics, and remote signal actuation.
 */
public class JavaTrafficServer {

    private final TrafficSimulator simulator;
    private final int port;
    private HttpServer server;

    public JavaTrafficServer(TrafficSimulator simulator, int port) {
        this.simulator = simulator;
        this.port = port;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

        server.createContext("/api/status", new StatusHandler());
        server.createContext("/api/metrics", new MetricsHandler());
        server.createContext("/api/violations", new ViolationsHandler());
        server.createContext("/api/pedestrian/crossing", new PedestrianCrossingHandler());
        server.createContext("/api/corridor/preempt", new CorridorPreemptHandler());

        server.start();
        System.out.println("[URBANFLOW] Embedded Java HTTP Server listening at http://localhost:" + port);
    }

    public void stop() {
        if (server != null) {
            server.stop(1);
            System.out.println("[URBANFLOW] Embedded Java HTTP Server stopped.");
        }
    }

    private void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            SignalPhase phase = simulator.getSignalController().getCurrentPhase();
            int countdown = simulator.getSignalController().getCountdownSeconds();
            int vCount = simulator.getMetrics().getActiveVehiclesCount();
            int pCount = simulator.getMetrics().getActivePedestriansCount();

            String json = String.format(
                    "{\"status\":\"ONLINE\",\"phase\":\"%s\",\"countdown\":%d,\"active_vehicles\":%d,\"active_pedestrians\":%d,\"paused\":%b}",
                    phase.getLabel(), countdown, vCount, pCount, simulator.isPaused()
            );
            sendJsonResponse(exchange, 200, json);
        }
    }

    private class MetricsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            int flow = simulator.getMetrics().getThroughputPerMinute();
            double wait = simulator.getMetrics().getAverageWaitSeconds();
            int safety = simulator.getMetrics().getSafetyScore();
            int cleared = simulator.getMetrics().getTotalVehiclesCleared();
            int spawned = simulator.getMetrics().getTotalVehiclesSpawned();
            int vios = simulator.getMetrics().getTotalViolations();

            String json = String.format(
                    "{\"throughput_per_min\":%d,\"average_wait_sec\":%.2f,\"safety_score\":%d,\"vehicles_cleared\":%d,\"vehicles_spawned\":%d,\"total_violations\":%d}",
                    flow, wait, safety, cleared, spawned, vios
            );
            sendJsonResponse(exchange, 200, json);
        }
    }

    private class ViolationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<Violation> list = simulator.getViolations();
            StringBuilder sb = new StringBuilder();
            sb.append("[");
            for (int i = 0; i < list.size(); i++) {
                Violation v = list.get(i);
                sb.append(String.format(
                        "{\"id\":\"%s\",\"timestamp\":\"%s\",\"vehicle_id\":\"%s\",\"license_plate\":\"%s\",\"infraction\":\"%s\",\"speed\":%.1f,\"fine\":%d,\"status\":\"%s\"}",
                        v.getId(), v.getTimestamp(), v.getVehicleId(), v.getLicensePlate(), v.getType().displayName, v.getSpeedKmh(), v.getFineAmount(), v.getStatus()
                ));
                if (i < list.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    private class PedestrianCrossingHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            simulator.triggerPedestrianCrossing();
            String json = "{\"status\":\"ACTUATED\",\"phase\":\"PEDESTRIAN_ALL_RED\",\"message\":\"Pedestrian walk cycle triggered. All vehicle approaches halting.\"}";
            sendJsonResponse(exchange, 200, json);
        }
    }

    private class CorridorPreemptHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            simulator.triggerEmergencyAmbulance();
            String json = "{\"status\":\"PREEMPTED\",\"phase\":\"EMERGENCY_PREEMPTION\",\"message\":\"Emergency corridor granted to approaching ambulance.\"}";
            sendJsonResponse(exchange, 200, json);
        }
    }
}
