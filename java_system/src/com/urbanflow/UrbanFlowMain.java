package com.urbanflow;

import com.urbanflow.engine.AdaptiveSignalController;
import com.urbanflow.engine.TrafficSimulator;
import com.urbanflow.server.JavaTrafficServer;
import com.urbanflow.ui.UrbanFlowWindow;

import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import java.io.IOException;

/**
 * Master entry point for the UrbanFlow Traffic Analytical System.
 * Launches the 60 FPS hardware-accelerated Java2D command center and embedded REST server.
 */
public class UrbanFlowMain {

    public static void main(String[] args) {
        boolean headless = false;
        int port = 8000;

        for (String arg : args) {
            if ("--headless".equalsIgnoreCase(arg) || "--server-only".equalsIgnoreCase(arg)) {
                headless = true;
            } else if (arg.startsWith("--port=")) {
                try {
                    port = Integer.parseInt(arg.substring(7));
                } catch (NumberFormatException ignored) {}
            }
        }

        System.out.println("=================================================");
        System.out.println("  UrbanFlow AI Traffic Operations Command Center ");
        System.out.println("  Standard Java SE 26 Native Architecture        ");
        System.out.println("=================================================");

        // 1. Initialize Simulation Engine
        AdaptiveSignalController signalController = new AdaptiveSignalController();
        TrafficSimulator simulator = new TrafficSimulator(signalController);

        // 2. Start Embedded Java REST Server
        try {
            JavaTrafficServer server = new JavaTrafficServer(simulator, port);
            server.start();
        } catch (IOException e) {
            System.err.println("[WARN] Could not bind embedded HTTP server on port " + port + ": " + e.getMessage());
        }

        // 3. Launch Desktop GUI or Headless Simulation Loop
        if (!headless) {
            System.out.println("[URBANFLOW] Launching hardware-accelerated Desktop GUI...");
            try {
                System.setProperty("sun.java2d.d3d", "true");
                System.setProperty("sun.java2d.opengl", "false");
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception ignored) {}

            SwingUtilities.invokeLater(() -> {
                UrbanFlowWindow window = new UrbanFlowWindow(simulator);
                window.setVisible(true);
            });
        } else {
            System.out.println("[URBANFLOW] Running in headless mode at 60 FPS update rate...");
            long lastTime = System.nanoTime();
            while (true) {
                long now = System.nanoTime();
                double dt = (now - lastTime) / 1_000_000_000.0;
                lastTime = now;
                simulator.update(Math.min(0.05, dt));
                try {
                    Thread.sleep(16);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
}
