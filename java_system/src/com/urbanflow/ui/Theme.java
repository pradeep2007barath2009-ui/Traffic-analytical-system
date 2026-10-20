package com.urbanflow.ui;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

/**
 * Tactical OLED design theme specifying military and aerospace color palettes,
 * crisp typography, and rendering hints for hardware-accelerated Java2D drawing.
 */
public final class Theme {

    private Theme() {}

    // Surface & Border Colors
    public static final Color BG_DARK = new Color(9, 13, 22);
    public static final Color BG_PANEL = new Color(15, 23, 42);
    public static final Color BG_CARD = new Color(30, 41, 59);
    public static final Color BORDER_SUBTLE = new Color(51, 65, 85);
    public static final Color BORDER_ACTIVE = new Color(6, 182, 212);

    // Roadway & Markings
    public static final Color ROAD_ASPHALT = new Color(26, 32, 44);
    public static final Color ROAD_CURB = new Color(45, 55, 72);
    public static final Color ROAD_LANE_DASH = new Color(248, 250, 252, 160);
    public static final Color ROAD_CENTER_DOUBLE = new Color(251, 191, 36);
    public static final Color ZEBRA_STRIPE = new Color(255, 255, 255, 230);
    public static final Color STOP_BAR = new Color(255, 255, 255, 240);
    public static final Color SIDEWALK = new Color(20, 26, 36);

    // Dynamic Signal Colors
    public static final Color SIGNAL_RED_ON = new Color(239, 68, 68);
    public static final Color SIGNAL_RED_OFF = new Color(69, 20, 20);
    public static final Color SIGNAL_AMBER_ON = new Color(245, 158, 11);
    public static final Color SIGNAL_AMBER_OFF = new Color(75, 48, 10);
    public static final Color SIGNAL_GREEN_ON = new Color(16, 185, 129);
    public static final Color SIGNAL_GREEN_OFF = new Color(10, 55, 40);

    // Typography & Accents
    public static final Color TEXT_PRIMARY = new Color(248, 250, 252);
    public static final Color TEXT_SECONDARY = new Color(148, 163, 184);
    public static final Color TEXT_MUTED = new Color(100, 116, 139);
    public static final Color ACCENT_CYAN = new Color(6, 182, 212);
    public static final Color ACCENT_EMERALD = new Color(16, 185, 129);
    public static final Color ACCENT_AMBER = new Color(245, 158, 11);
    public static final Color ACCENT_CRIMSON = new Color(239, 68, 68);

    // Lighting effects
    public static final Color HEADLIGHT_GLOW = new Color(255, 255, 220, 60);
    public static final Color BRAKELIGHT_GLOW = new Color(239, 68, 68, 210);
    public static final Color SIREN_BLUE = new Color(59, 130, 246, 220);
    public static final Color SIREN_RED = new Color(239, 68, 68, 220);

    // Fonts
    public static final Font FONT_HEADER = new Font("SansSerif", Font.BOLD, 15);
    public static final Font FONT_TITLE = new Font("SansSerif", Font.BOLD, 13);
    public static final Font FONT_BODY = new Font("SansSerif", Font.PLAIN, 12);
    public static final Font FONT_MONO = new Font("Monospaced", Font.BOLD, 12);
    public static final Font FONT_MONO_SMALL = new Font("Monospaced", Font.BOLD, 10);
    public static final Font FONT_TINY = new Font("Monospaced", Font.PLAIN, 9);

    public static void applyHighQualityRendering(Graphics2D g2) {
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);
    }
}
