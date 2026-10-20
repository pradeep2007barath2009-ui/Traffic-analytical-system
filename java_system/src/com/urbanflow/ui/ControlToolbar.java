package com.urbanflow.ui;

import com.urbanflow.engine.TrafficSimulator;
import com.urbanflow.model.Vehicle;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.FlowLayout;

/**
 * Tactical command toolbar hosting primary scenario triggers, emergency priority,
 * pedestrian walk actuation, and live throughput meters.
 */
public class ControlToolbar extends JPanel {

    private final TrafficSimulator simulator;
    private final JLabel metricsLabel;
    private final JButton pauseBtn;

    public ControlToolbar(TrafficSimulator simulator) {
        this.simulator = simulator;

        setLayout(new BorderLayout());
        setBackground(Theme.BG_PANEL);
        setBorder(BorderFactory.createMatteBorder(0, 0, 1, 0, Theme.BORDER_SUBTLE));

        // Left Branding & Metrics
        JPanel leftPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 14, 10));
        leftPanel.setBackground(Theme.BG_PANEL);

        JLabel logo = new JLabel("URBANFLOW AI  ::  TRAFFIC OPERATIONS CENTER");
        logo.setFont(Theme.FONT_HEADER);
        logo.setForeground(Theme.TEXT_PRIMARY);

        metricsLabel = new JLabel("ACTIVE: 0 VEH | PED: 0 | THROUGHPUT: 0/MIN | AVG WAIT: 0.0s");
        metricsLabel.setFont(Theme.FONT_MONO);
        metricsLabel.setForeground(Theme.ACCENT_CYAN);

        leftPanel.add(logo);
        leftPanel.add(metricsLabel);
        add(leftPanel, BorderLayout.WEST);

        // Right Action Buttons
        JPanel rightPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 8));
        rightPanel.setBackground(Theme.BG_PANEL);

        JButton ambBtn = createStyledButton("EMERGENCY AMBULANCE (A)", Theme.ACCENT_CRIMSON);
        ambBtn.addActionListener(e -> simulator.triggerEmergencyAmbulance());

        JButton pedBtn = createStyledButton("PEDESTRIAN CROSSING (P)", Theme.ACCENT_AMBER);
        pedBtn.addActionListener(e -> simulator.triggerPedestrianCrossing());

        JButton spawnBtn = createStyledButton("SPAWN VEHICLE", Theme.ACCENT_CYAN);
        spawnBtn.addActionListener(e -> simulator.spawnVehicle("SOUTH", Vehicle.VehicleType.CAR));

        pauseBtn = createStyledButton("PAUSE / PLAY", new Color(71, 85, 105));
        pauseBtn.addActionListener(e -> {
            simulator.togglePause();
            pauseBtn.setText(simulator.isPaused() ? "RESUME" : "PAUSE");
        });

        rightPanel.add(ambBtn);
        rightPanel.add(pedBtn);
        rightPanel.add(spawnBtn);
        rightPanel.add(pauseBtn);
        add(rightPanel, BorderLayout.EAST);
    }

    private JButton createStyledButton(String text, Color bg) {
        JButton btn = new JButton(text);
        btn.setFont(Theme.FONT_TITLE);
        btn.setForeground(Color.WHITE);
        btn.setBackground(bg);
        btn.setFocusPainted(false);
        btn.setBorder(BorderFactory.createEmptyBorder(6, 14, 6, 14));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        return btn;
    }

    public void updateMetrics() {
        int vCount = simulator.getMetrics().getActiveVehiclesCount();
        int pCount = simulator.getMetrics().getActivePedestriansCount();
        int flow = simulator.getMetrics().getThroughputPerMinute();
        double wait = simulator.getMetrics().getAverageWaitSeconds();

        metricsLabel.setText(String.format("ACTIVE: %d VEH  |  PED: %d  |  FLOW: %d/MIN  |  WAIT: %.1fs",
                vCount, pCount, flow, wait));
    }
}
