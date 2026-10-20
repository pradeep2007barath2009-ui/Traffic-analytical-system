package com.urbanflow.ui;

import com.urbanflow.engine.TrafficSimulator;
import com.urbanflow.model.Vehicle;

import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.JSplitPane;
import javax.swing.KeyStroke;
import javax.swing.Timer;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import javax.swing.AbstractAction;
import javax.swing.JComponent;

/**
 * Main application window integrating the 4-way intersection simulation canvas,
 * synthetic CCTV surveillance HUD, command toolbar, and violation ledger.
 */
public class UrbanFlowWindow extends JFrame {

    private final TrafficSimulator simulator;
    private final IntersectionCanvas intersectionCanvas;
    private final CctvCanvas cctvCanvas;
    private final ViolationLedgerPanel violationPanel;
    private final ControlToolbar toolbar;
    private final Timer loopTimer;

    public UrbanFlowWindow(TrafficSimulator simulator) {
        super("UrbanFlow AI - Advanced Traffic Analytics & Operations Command Center");
        this.simulator = simulator;

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(1200, 820));
        setPreferredSize(new Dimension(1380, 880));
        getContentPane().setBackground(Theme.BG_DARK);
        setLayout(new BorderLayout());

        // 1. Top Command Toolbar
        toolbar = new ControlToolbar(simulator);
        add(toolbar, BorderLayout.NORTH);

        // 2. Center Split View (Intersection Visualizer + CCTV Viewfinder)
        intersectionCanvas = new IntersectionCanvas(simulator);
        cctvCanvas = new CctvCanvas(simulator);

        JSplitPane splitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, intersectionCanvas, cctvCanvas);
        splitPane.setResizeWeight(0.55);
        splitPane.setDividerSize(4);
        splitPane.setBorder(null);
        splitPane.setBackground(Theme.BG_DARK);

        JPanel centerPanel = new JPanel(new BorderLayout());
        centerPanel.setBackground(Theme.BG_DARK);
        centerPanel.add(splitPane, BorderLayout.CENTER);
        add(centerPanel, BorderLayout.CENTER);

        // 3. Bottom Violation Ledger Table
        violationPanel = new ViolationLedgerPanel(simulator);
        add(violationPanel, BorderLayout.SOUTH);

        // 4. Keyboard Shortcuts
        setupKeyboardShortcuts();

        // 5. 60 FPS Render & Physics Loop
        loopTimer = new Timer(16, (ActionEvent e) -> {
            simulator.update(0.016);
            intersectionCanvas.repaint();
            cctvCanvas.repaint();
            toolbar.updateMetrics();
        });
        loopTimer.start();

        pack();
        setLocationRelativeTo(null);
    }

    private void setupKeyboardShortcuts() {
        JComponent root = getRootPane();

        // Key 'A': Emergency Ambulance Preemption
        root.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(
                KeyStroke.getKeyStroke(KeyEvent.VK_A, 0), "triggerAmbulance");
        root.getActionMap().put("triggerAmbulance", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                simulator.triggerEmergencyAmbulance();
            }
        });

        // Key 'P': Pedestrian Crossing Request
        root.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(
                KeyStroke.getKeyStroke(KeyEvent.VK_P, 0), "triggerPedestrian");
        root.getActionMap().put("triggerPedestrian", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                simulator.triggerPedestrianCrossing();
            }
        });

        // Key 'SPACE': Pause / Resume
        root.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(
                KeyStroke.getKeyStroke(KeyEvent.VK_SPACE, 0), "togglePause");
        root.getActionMap().put("togglePause", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                simulator.togglePause();
            }
        });

        // Key 'S': Spawn Car
        root.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(
                KeyStroke.getKeyStroke(KeyEvent.VK_S, 0), "spawnVehicle");
        root.getActionMap().put("spawnVehicle", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                simulator.spawnVehicle("SOUTH", Vehicle.VehicleType.CAR);
            }
        });
    }

    @Override
    public void dispose() {
        if (loopTimer != null && loopTimer.isRunning()) {
            loopTimer.stop();
        }
        super.dispose();
    }
}
