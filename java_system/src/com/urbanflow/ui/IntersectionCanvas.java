package com.urbanflow.ui;

import com.urbanflow.engine.AdaptiveSignalController;
import com.urbanflow.engine.TrafficSimulator;
import com.urbanflow.model.Pedestrian;
import com.urbanflow.model.SignalPhase;
import com.urbanflow.model.Vehicle;

import javax.swing.JPanel;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Polygon;
import java.awt.geom.AffineTransform;
import java.awt.geom.RoundRectangle2D;

/**
 * High-fidelity 4-way intersection visualizer utilizing hardware-accelerated Java2D,
 * realistic asphalt textures, zebra crosswalks, glowing signal heads,
 * dynamic headlights, illuminated brake lights, and animated pedestrians.
 */
public class IntersectionCanvas extends JPanel {

    private final TrafficSimulator simulator;

    public IntersectionCanvas(TrafficSimulator simulator) {
        this.simulator = simulator;
        setPreferredSize(new Dimension(600, 600));
        setBackground(Theme.BG_DARK);
        setDoubleBuffered(true);
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        Theme.applyHighQualityRendering(g2);

        int w = getWidth();
        int h = getHeight();

        // Calculate scaling based on reference 600x600 size
        double scale = Math.min(w / 600.0, h / 600.0);
        int offsetX = (int) ((w - 600.0 * scale) / 2.0);
        int offsetY = (int) ((h - 600.0 * scale) / 2.0);

        AffineTransform origTransform = g2.getTransform();
        g2.translate(offsetX, offsetY);
        g2.scale(scale, scale);

        // 1. Draw Background Grid & Terrain
        drawTerrain(g2);

        // 2. Draw Roadways & Sidewalks
        drawRoadNetwork(g2);

        // 3. Draw Crosswalks & Stop Bars
        drawCrosswalksAndBars(g2);

        // 4. Draw Traffic Signals
        drawSignalHeads(g2);

        // 5. Draw Animated Vehicles
        drawVehicles(g2);

        // 6. Draw Animated Pedestrians
        drawPedestrians(g2);

        // 7. Draw HUD Overlay
        drawHudOverlay(g2);

        g2.setTransform(origTransform);
    }

    private void drawTerrain(Graphics2D g2) {
        g2.setColor(Theme.BG_DARK);
        g2.fillRect(0, 0, 600, 600);

        // Subtle tactical grid
        g2.setColor(new Color(255, 255, 255, 8));
        g2.setStroke(new BasicStroke(1.0f));
        for (int i = 0; i <= 600; i += 40) {
            g2.drawLine(i, 0, i, 600);
            g2.drawLine(0, i, 600, i);
        }

        // Sidewalk corner blocks
        g2.setColor(Theme.SIDEWALK);
        g2.fillRoundRect(20, 20, 195, 195, 12, 12);
        g2.fillRoundRect(385, 20, 195, 195, 12, 12);
        g2.fillRoundRect(20, 385, 195, 195, 12, 12);
        g2.fillRoundRect(385, 385, 195, 195, 12, 12);

        // Sidewalk curb outlines
        g2.setColor(Theme.ROAD_CURB);
        g2.setStroke(new BasicStroke(2.0f));
        g2.drawRoundRect(20, 20, 195, 195, 12, 12);
        g2.drawRoundRect(385, 20, 195, 195, 12, 12);
        g2.drawRoundRect(20, 385, 195, 195, 12, 12);
        g2.drawRoundRect(385, 385, 195, 195, 12, 12);
    }

    private void drawRoadNetwork(Graphics2D g2) {
        // North-South asphalt strip
        g2.setColor(Theme.ROAD_ASPHALT);
        g2.fillRect(215, 0, 170, 600);

        // East-West asphalt strip
        g2.fillRect(0, 215, 600, 170);

        // Center intersection box
        g2.setColor(new Color(32, 40, 54));
        g2.fillRect(215, 215, 170, 170);

        // Double yellow center divider lines
        g2.setColor(Theme.ROAD_CENTER_DOUBLE);
        g2.setStroke(new BasicStroke(2.0f));

        // North-South center lines
        g2.drawLine(298, 0, 298, 170);
        g2.drawLine(302, 0, 302, 170);
        g2.drawLine(298, 430, 298, 600);
        g2.drawLine(302, 430, 302, 600);

        // East-West center lines
        g2.drawLine(0, 298, 170, 298);
        g2.drawLine(0, 302, 170, 302);
        g2.drawLine(430, 298, 600, 298);
        g2.drawLine(430, 302, 600, 302);

        // Dashed white lane dividers
        g2.setColor(Theme.ROAD_LANE_DASH);
        float[] dashPattern = {12.0f, 10.0f};
        g2.setStroke(new BasicStroke(1.5f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 10.0f, dashPattern, 0.0f));

        g2.drawLine(255, 0, 255, 170);
        g2.drawLine(345, 0, 345, 170);
        g2.drawLine(255, 430, 255, 600);
        g2.drawLine(345, 430, 345, 600);

        g2.drawLine(0, 255, 170, 255);
        g2.drawLine(0, 345, 170, 345);
        g2.drawLine(430, 255, 600, 255);
        g2.drawLine(430, 345, 600, 345);
    }

    private void drawCrosswalksAndBars(Graphics2D g2) {
        // Stop Bars (Solid White lines before crosswalks)
        g2.setColor(Theme.STOP_BAR);
        g2.setStroke(new BasicStroke(5.0f, BasicStroke.CAP_SQUARE, BasicStroke.JOIN_MITER));

        // South stop bar (y = 430)
        g2.drawLine(304, 430, 385, 430);
        // North stop bar (y = 170)
        g2.drawLine(215, 170, 296, 170);
        // West stop bar (x = 170)
        g2.drawLine(170, 304, 170, 385);
        // East stop bar (x = 430)
        g2.drawLine(430, 215, 430, 296);

        // Zebra Stripes
        g2.setColor(Theme.ZEBRA_STRIPE);
        g2.setStroke(new BasicStroke(6.0f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL));

        // South crosswalk (y: 395 to 415, x: 220 to 380)
        for (int x = 224; x <= 376; x += 14) {
            g2.drawLine(x, 395, x, 415);
        }

        // North crosswalk (y: 185 to 205, x: 220 to 380)
        for (int x = 224; x <= 376; x += 14) {
            g2.drawLine(x, 185, x, 205);
        }

        // West crosswalk (x: 185 to 205, y: 220 to 380)
        for (int y = 224; y <= 376; y += 14) {
            g2.drawLine(185, y, 205, y);
        }

        // East crosswalk (x: 395 to 415, y: 220 to 380)
        for (int y = 224; y <= 376; y += 14) {
            g2.drawLine(395, y, 415, y);
        }
    }

    private void drawSignalHeads(Graphics2D g2) {
        AdaptiveSignalController controller = simulator.getSignalController();
        SignalPhase phase = controller.getCurrentPhase();

        boolean nsGreen = phase.isNsGreen();
        boolean nsYellow = (phase == SignalPhase.NORTH_SOUTH_YELLOW);
        boolean ewGreen = phase.isEwGreen();
        boolean ewYellow = (phase == SignalPhase.EAST_WEST_YELLOW);
        boolean pedWalk = phase.isPedestrianActive();

        // 1. Southbound Signal Head (top right of North approach: x=392, y=140)
        drawSignalBox(g2, 392, 140, !nsGreen && !nsYellow, nsYellow, nsGreen);

        // 2. Northbound Signal Head (bottom left of South approach: x=190, y=435)
        drawSignalBox(g2, 190, 435, !nsGreen && !nsYellow, nsYellow, nsGreen);

        // 3. Eastbound Signal Head (top left of West approach: x=140, y=190)
        drawSignalBox(g2, 140, 190, !ewGreen && !ewYellow, ewYellow, ewGreen);

        // 4. Westbound Signal Head (bottom right of East approach: x=435, y=392)
        drawSignalBox(g2, 435, 392, !ewGreen && !ewYellow, ewYellow, ewGreen);

        // Pedestrian Signal Indicators on Sidewalk Corners
        drawPedestrianHead(g2, 190, 395, pedWalk);
        drawPedestrianHead(g2, 395, 185, pedWalk);
    }

    private void drawSignalBox(Graphics2D g2, int x, int y, boolean redOn, boolean amberOn, boolean greenOn) {
        // Enclosure box
        g2.setColor(new Color(15, 20, 28));
        g2.fillRoundRect(x, y, 18, 44, 6, 6);
        g2.setColor(Theme.ROAD_CURB);
        g2.setStroke(new BasicStroke(1.2f));
        g2.drawRoundRect(x, y, 18, 44, 6, 6);

        // Red Lens
        g2.setColor(redOn ? Theme.SIGNAL_RED_ON : Theme.SIGNAL_RED_OFF);
        g2.fillOval(x + 4, y + 4, 10, 10);
        if (redOn) {
            g2.setColor(new Color(239, 68, 68, 80));
            g2.fillOval(x + 1, y + 1, 16, 16);
        }

        // Amber Lens
        g2.setColor(amberOn ? Theme.SIGNAL_AMBER_ON : Theme.SIGNAL_AMBER_OFF);
        g2.fillOval(x + 4, y + 17, 10, 10);
        if (amberOn) {
            g2.setColor(new Color(245, 158, 11, 80));
            g2.fillOval(x + 1, y + 14, 16, 16);
        }

        // Green Lens
        g2.setColor(greenOn ? Theme.SIGNAL_GREEN_ON : Theme.SIGNAL_GREEN_OFF);
        g2.fillOval(x + 4, y + 30, 10, 10);
        if (greenOn) {
            g2.setColor(new Color(16, 185, 129, 80));
            g2.fillOval(x + 1, y + 27, 16, 16);
        }
    }

    private void drawPedestrianHead(Graphics2D g2, int x, int y, boolean walk) {
        g2.setColor(new Color(15, 20, 28));
        g2.fillRoundRect(x, y, 16, 26, 4, 4);
        g2.setColor(Theme.ROAD_CURB);
        g2.setStroke(new BasicStroke(1.0f));
        g2.drawRoundRect(x, y, 16, 26, 4, 4);

        if (walk) {
            // Illuminated Walking Figure (Green)
            g2.setColor(Theme.ACCENT_EMERALD);
            g2.fillOval(x + 5, y + 3, 5, 5);
            g2.drawLine(x + 7, y + 8, x + 7, y + 16);
            g2.drawLine(x + 7, y + 16, x + 4, y + 22);
            g2.drawLine(x + 7, y + 16, x + 10, y + 22);
        } else {
            // Don't Walk Hand Symbol (Red)
            g2.setColor(Theme.ACCENT_CRIMSON);
            g2.fillRect(x + 5, y + 5, 6, 8);
            g2.fillRect(x + 5, y + 15, 6, 4);
        }
    }

    private void drawVehicles(Graphics2D g2) {
        for (Vehicle v : simulator.getVehicles()) {
            double vx = v.getX();
            double vy = v.getY();
            double vw = v.getType().width;
            double vl = v.getType().length;

            AffineTransform vTrans = g2.getTransform();
            g2.translate(vx, vy);

            // Rotate according to travel direction
            double angleRad = 0.0;
            switch (v.getApproach()) {
                case "SOUTH": // Moving up (heading 0 or -PI/2)
                    angleRad = 0.0;
                    break;
                case "NORTH": // Moving down
                    angleRad = Math.PI;
                    break;
                case "WEST": // Moving right
                    angleRad = Math.PI / 2.0;
                    break;
                case "EAST": // Moving left
                    angleRad = -Math.PI / 2.0;
                    break;
            }
            g2.rotate(angleRad);

            // Headlight beams projecting forward (-Y direction in local coordinates)
            Polygon beamLeft = new Polygon();
            beamLeft.addPoint((int) (-vw / 2.0 + 2), (int) (-vl / 2.0));
            beamLeft.addPoint((int) (-vw / 2.0 - 12), (int) (-vl / 2.0 - 55));
            beamLeft.addPoint((int) (-vw / 2.0 + 4), (int) (-vl / 2.0 - 55));
            g2.setColor(Theme.HEADLIGHT_GLOW);
            g2.fillPolygon(beamLeft);

            Polygon beamRight = new Polygon();
            beamRight.addPoint((int) (vw / 2.0 - 2), (int) (-vl / 2.0));
            beamRight.addPoint((int) (vw / 2.0 - 4), (int) (-vl / 2.0 - 55));
            beamRight.addPoint((int) (vw / 2.0 + 12), (int) (-vl / 2.0 - 55));
            g2.fillPolygon(beamRight);

            // Vehicle Body Chassis
            RoundRectangle2D body = new RoundRectangle2D.Double(-vw / 2.0, -vl / 2.0, vw, vl, 6, 6);
            g2.setColor(v.getType().defaultColor);
            g2.fill(body);

            // Roof and windows
            g2.setColor(new Color(15, 23, 42, 200));
            g2.fillRoundRect((int) (-vw / 2.0 + 2), (int) (-vl / 2.0 + 6), (int) (vw - 4), (int) (vl - 14), 4, 4);

            // Windshield
            g2.setColor(new Color(186, 230, 253, 180));
            g2.fillRect((int) (-vw / 2.0 + 3), (int) (-vl / 2.0 + 7), (int) (vw - 6), 5);

            // Taillights / Brakelights (+Y direction in local coordinates)
            if (v.isBraking() || v.isStoppedForPedestrian() || v.isStoppedForSignal()) {
                // Intense glowing brake halo
                g2.setColor(Theme.BRAKELIGHT_GLOW);
                g2.fillOval((int) (-vw / 2.0 - 2), (int) (vl / 2.0 - 4), 8, 8);
                g2.fillOval((int) (vw / 2.0 - 6), (int) (vl / 2.0 - 4), 8, 8);
                g2.setColor(Color.WHITE);
                g2.fillOval((int) (-vw / 2.0), (int) (vl / 2.0 - 2), 4, 4);
                g2.fillOval((int) (vw / 2.0 - 4), (int) (vl / 2.0 - 2), 4, 4);
            } else {
                g2.setColor(new Color(185, 28, 28));
                g2.fillRect((int) (-vw / 2.0 + 2), (int) (vl / 2.0 - 3), 4, 2);
                g2.fillRect((int) (vw / 2.0 - 6), (int) (vl / 2.0 - 3), 4, 2);
            }

            // Ambulance Flashing Siren Lights
            if (v.isAmbulance()) {
                boolean flash = (v.getSirenTick() < 15);
                g2.setColor(flash ? Theme.SIREN_RED : Theme.SIREN_BLUE);
                g2.fillOval(-4, -4, 8, 8);
                g2.setColor(flash ? new Color(239, 68, 68, 100) : new Color(59, 130, 246, 100));
                g2.fillOval(-8, -8, 16, 16);
            }

            // Headlight bulbs
            g2.setColor(Color.WHITE);
            g2.fillRect((int) (-vw / 2.0 + 2), (int) (-vl / 2.0 + 1), 3, 2);
            g2.fillRect((int) (vw / 2.0 - 5), (int) (-vl / 2.0 + 1), 3, 2);

            g2.setTransform(vTrans);

            // Draw vehicle ID and speed badge floating above
            g2.setFont(Theme.FONT_TINY);
            g2.setColor(Theme.TEXT_SECONDARY);
            String label = String.format("%s | %.0f km/h", v.getId(), v.getSpeedKmh());
            g2.drawString(label, (int) (vx - 22), (int) (vy - 20));
        }
    }

    private void drawPedestrians(Graphics2D g2) {
        for (Pedestrian p : simulator.getPedestrians()) {
            if (!p.isCrossing()) continue;

            int px = (int) p.getX();
            int py = (int) p.getY();

            // Safety Halo ring around crossing pedestrian
            g2.setColor(new Color(245, 158, 11, 70));
            g2.fillOval(px - 14, py - 14, 28, 28);
            g2.setColor(Theme.ACCENT_AMBER);
            g2.setStroke(new BasicStroke(1.2f));
            g2.drawOval(px - 14, py - 14, 28, 28);

            // Pedestrian body (head, torso, legs)
            // Head
            g2.setColor(new Color(254, 243, 199));
            g2.fillOval(px - 3, py - 8, 6, 6);

            // Torso (Cyan/Teal shirt)
            g2.setColor(Theme.ACCENT_CYAN);
            g2.fillRect(px - 4, py - 2, 8, 7);

            // Walking leg animation based on stepCounter
            int legOffset = (p.getStepCounter() % 10 < 5) ? 3 : -3;
            g2.setColor(new Color(15, 23, 42));
            g2.setStroke(new BasicStroke(2.0f));
            g2.drawLine(px - 2, py + 5, px - 2 + legOffset, py + 11);
            g2.drawLine(px + 2, py + 5, px + 2 - legOffset, py + 11);

            // Pedestrian tag
            g2.setFont(Theme.FONT_TINY);
            g2.setColor(Theme.ACCENT_AMBER);
            g2.drawString(p.getId(), px - 12, py - 16);
        }
    }

    private void drawHudOverlay(Graphics2D g2) {
        // Top Left Status Badge
        g2.setColor(new Color(15, 23, 42, 210));
        g2.fillRoundRect(12, 12, 230, 32, 6, 6);
        g2.setColor(Theme.BORDER_SUBTLE);
        g2.setStroke(new BasicStroke(1.0f));
        g2.drawRoundRect(12, 12, 230, 32, 6, 6);

        AdaptiveSignalController controller = simulator.getSignalController();
        SignalPhase phase = controller.getCurrentPhase();
        int countdown = controller.getCountdownSeconds();

        g2.setFont(Theme.FONT_MONO);
        if (phase.isEmergencyActive()) {
            g2.setColor(Theme.ACCENT_CRIMSON);
            g2.drawString("EMERGENCY WAVE [" + countdown + "s]", 22, 33);
        } else if (phase.isPedestrianActive()) {
            g2.setColor(Theme.ACCENT_AMBER);
            g2.drawString("PEDESTRIAN CLEAR [" + countdown + "s]", 22, 33);
        } else {
            g2.setColor(phase.isNsGreen() || phase.isEwGreen() ? Theme.ACCENT_EMERALD : Theme.ACCENT_AMBER);
            g2.drawString(phase.getLabel() + " [" + countdown + "s]", 22, 33);
        }

        // Compass Rose (Top Right)
        int cx = 560;
        int cy = 30;
        g2.setColor(Theme.TEXT_MUTED);
        g2.drawOval(cx - 14, cy - 14, 28, 28);
        g2.setColor(Theme.ACCENT_CYAN);
        g2.drawLine(cx, cy, cx, cy - 12);
        g2.setFont(new Font("SansSerif", Font.BOLD, 9));
        g2.drawString("N", cx - 3, cy - 13);
    }
}
