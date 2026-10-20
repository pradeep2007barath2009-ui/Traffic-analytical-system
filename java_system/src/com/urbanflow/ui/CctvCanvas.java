package com.urbanflow.ui;

import com.urbanflow.engine.TrafficSimulator;
import com.urbanflow.engine.VisionEngine;
import com.urbanflow.model.Violation;

import javax.swing.JPanel;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * High-tech CCTV Optical Surveillance HUD rendering synthetic camera frames,
 * object tracking reticles, AI bounding boxes, speed radar indicators, and scanlines.
 */
public class CctvCanvas extends JPanel {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss.SS");

    private final TrafficSimulator simulator;
    private final VisionEngine visionEngine;
    private int frameCounter = 0;

    public CctvCanvas(TrafficSimulator simulator) {
        this.simulator = simulator;
        this.visionEngine = new VisionEngine(simulator);
        setPreferredSize(new Dimension(500, 600));
        setBackground(new Color(6, 10, 16));
        setDoubleBuffered(true);
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        Theme.applyHighQualityRendering(g2);
        frameCounter++;

        int w = getWidth();
        int h = getHeight();

        // 1. Dark camera background with subtle synthetic road backdrop
        drawBackdrop(g2, w, h);

        // 2. Optical Computer Vision Detections (Bounding Boxes & Labels)
        drawDetections(g2, w, h);

        // 3. Tactical HUD Overlay (Corner brackets, crosshairs, telemetry)
        drawHud(g2, w, h);

        // 4. Subtle Scanlines
        drawScanlines(g2, w, h);

        // 5. Active Violation Banner
        drawViolationAlert(g2, w, h);
    }

    private void drawBackdrop(Graphics2D g2, int w, int h) {
        // Dark slate backdrop
        g2.setColor(new Color(11, 15, 23));
        g2.fillRect(0, 0, w, h);

        // Surveillance camera perspective guidelines
        g2.setColor(new Color(30, 41, 59, 120));
        g2.setStroke(new BasicStroke(1.0f));

        // Vanishing perspective lines
        int vpX = w / 2;
        int vpY = (int) (h * 0.25);

        g2.drawLine(vpX - 40, vpY, 0, h);
        g2.drawLine(vpX + 40, vpY, w, h);
        g2.drawLine(vpX - 100, vpY, 0, (int) (h * 0.7));
        g2.drawLine(vpX + 100, vpY, w, (int) (h * 0.7));

        // Horizontal depth intervals
        for (int y = (int) (h * 0.35); y < h; y += 45) {
            g2.drawLine(0, y, w, y);
        }

        // Lens vignette
        g2.setColor(new Color(0, 0, 0, 70));
        g2.drawRect(2, 2, w - 4, h - 4);
    }

    private void drawDetections(Graphics2D g2, int w, int h) {
        List<VisionEngine.DetectionBox> boxes = visionEngine.generateDetections(w, h);

        for (VisionEngine.DetectionBox b : boxes) {
            // Draw Target Bounding Box
            g2.setColor(b.color);
            g2.setStroke(new BasicStroke(1.5f));
            g2.drawRect(b.x, b.y, b.width, b.height);

            // Corner target brackets
            int arm = 6;
            g2.setStroke(new BasicStroke(2.2f));
            // Top-left
            g2.drawLine(b.x, b.y, b.x + arm, b.y);
            g2.drawLine(b.x, b.y, b.x, b.y + arm);
            // Top-right
            g2.drawLine(b.x + b.width, b.y, b.x + b.width - arm, b.y);
            g2.drawLine(b.x + b.width, b.y, b.x + b.width, b.y + arm);
            // Bottom-left
            g2.drawLine(b.x, b.y + b.height, b.x + arm, b.y + b.height);
            g2.drawLine(b.x, b.y + b.height, b.x, b.y + b.height - arm);
            // Bottom-right
            g2.drawLine(b.x + b.width, b.y + b.height, b.x + b.width - arm, b.y + b.height);
            g2.drawLine(b.x + b.width, b.y + b.height, b.x + b.width, b.y + b.height - arm);

            // Center target reticle
            int cx = b.x + b.width / 2;
            int cy = b.y + b.height / 2;
            g2.setStroke(new BasicStroke(1.0f));
            g2.drawLine(cx - 4, cy, cx + 4, cy);
            g2.drawLine(cx, cy - 4, cx, cy + 4);

            // Bounding Box Header Tag
            g2.setFont(Theme.FONT_TINY);
            String labelText = String.format("%s %.0f%% [%s]", b.label, b.confidence * 100.0, b.speedTag);
            int tagWidth = g2.getFontMetrics().stringWidth(labelText) + 8;

            g2.setColor(new Color(15, 23, 42, 220));
            g2.fillRect(b.x, Math.max(0, b.y - 14), tagWidth, 14);
            g2.setColor(b.color);
            g2.drawRect(b.x, Math.max(0, b.y - 14), tagWidth, 14);
            g2.drawString(labelText, b.x + 4, Math.max(10, b.y - 3));
        }
    }

    private void drawHud(Graphics2D g2, int w, int h) {
        // Camera ID & Telemetry Bar (Top)
        g2.setColor(new Color(15, 23, 42, 200));
        g2.fillRect(10, 10, w - 20, 30);
        g2.setColor(Theme.BORDER_SUBTLE);
        g2.setStroke(new BasicStroke(1.0f));
        g2.drawRect(10, 10, w - 20, 30);

        // Blinking Red Recording Dot
        if ((frameCounter / 25) % 2 == 0) {
            g2.setColor(Theme.ACCENT_CRIMSON);
            g2.fillOval(20, 20, 10, 10);
        }
        g2.setFont(Theme.FONT_MONO);
        g2.setColor(Theme.TEXT_PRIMARY);
        g2.drawString("REC  CAM-04 | SOUTH APPROACH", 38, 29);

        // Live Clock
        String now = LocalTime.now().format(TIME_FORMAT);
        g2.setColor(Theme.ACCENT_CYAN);
        g2.drawString(now, w - 120, 29);

        // Crosshairs in Center of View
        int midX = w / 2;
        int midY = h / 2;
        g2.setColor(new Color(6, 182, 212, 100));
        g2.setStroke(new BasicStroke(1.0f));
        g2.drawLine(midX - 20, midY, midX - 6, midY);
        g2.drawLine(midX + 6, midY, midX + 20, midY);
        g2.drawLine(midX, midY - 20, midX, midY - 6);
        g2.drawLine(midX, midY + 6, midX, midY + 20);
        g2.drawOval(midX - 10, midY - 10, 20, 20);

        // Bottom Telemetry Bar
        g2.setColor(new Color(15, 23, 42, 200));
        g2.fillRect(10, h - 34, w - 20, 24);
        g2.setColor(Theme.BORDER_SUBTLE);
        g2.drawRect(10, h - 34, w - 20, 24);

        g2.setFont(Theme.FONT_TINY);
        g2.setColor(Theme.TEXT_SECONDARY);
        String telemetry = String.format("OPTICAL FLOW: ACTIVE | DETECTIONS: %d | FPS: 60.0 | ISO 400",
                simulator.getVehicles().size() + simulator.getPedestrians().size());
        g2.drawString(telemetry, 20, h - 18);
    }

    private void drawScanlines(Graphics2D g2, int w, int h) {
        g2.setColor(new Color(0, 0, 0, 25));
        g2.setStroke(new BasicStroke(1.0f));
        for (int y = 0; y < h; y += 4) {
            g2.drawLine(0, y, w, y);
        }
    }

    private void drawViolationAlert(Graphics2D g2, int w, int h) {
        List<Violation> list = simulator.getViolations();
        if (list.isEmpty()) return;

        Violation latest = list.get(0);
        // Show banner if violation is recent (first 100 frames)
        if (frameCounter % 120 < 70) {
            g2.setColor(new Color(239, 68, 68, 220));
            g2.fillRect(10, 48, w - 20, 26);
            g2.setColor(Color.WHITE);
            g2.setFont(Theme.FONT_MONO);
            String alert = String.format("ALERT: %s | %s [%.0f km/h]",
                    latest.getType().displayName, latest.getLicensePlate(), latest.getSpeedKmh());
            g2.drawString(alert, 20, 66);
        }
    }
}
