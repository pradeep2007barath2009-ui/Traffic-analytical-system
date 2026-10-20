package com.urbanflow.ui;

import com.urbanflow.engine.TrafficSimulator;
import com.urbanflow.model.Violation;

import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.util.List;

/**
 * Tactical dark-mode Violation Ledger panel displaying live traffic infractions,
 * severity classifications, citations, and revenue metrics.
 */
public class ViolationLedgerPanel extends JPanel implements TrafficSimulator.ViolationListener {

    private final TrafficSimulator simulator;
    private final DefaultTableModel tableModel;
    private final JTable table;
    private final JLabel headerStatsLabel;

    public ViolationLedgerPanel(TrafficSimulator simulator) {
        this.simulator = simulator;
        this.simulator.addViolationListener(this);

        setLayout(new BorderLayout());
        setBackground(Theme.BG_PANEL);
        setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Theme.BORDER_SUBTLE));
        setPreferredSize(new Dimension(1100, 180));

        // Header with metrics
        JPanel topPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 16, 8));
        topPanel.setBackground(Theme.BG_PANEL);

        JLabel titleLabel = new JLabel("TRAFFIC CITATIONS & VIOLATION LEDGER");
        titleLabel.setFont(Theme.FONT_TITLE);
        titleLabel.setForeground(Theme.TEXT_PRIMARY);

        headerStatsLabel = new JLabel("TOTAL INCIDENTS: 0  |  FINES LEVIED: $0  |  CORRIDOR INTEGRITY: 98%");
        headerStatsLabel.setFont(Theme.FONT_MONO);
        headerStatsLabel.setForeground(Theme.ACCENT_CYAN);

        topPanel.add(titleLabel);
        topPanel.add(headerStatsLabel);
        add(topPanel, BorderLayout.NORTH);

        // Table setup
        String[] columns = {"ID", "TIMESTAMP", "VEHICLE ID", "LICENSE PLATE", "INFRACTION TYPE", "SPEED", "FINE", "STATUS"};
        tableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        table = new JTable(tableModel);
        table.setBackground(Theme.BG_CARD);
        table.setForeground(Theme.TEXT_PRIMARY);
        table.setGridColor(Theme.BORDER_SUBTLE);
        table.setRowHeight(24);
        table.setFont(Theme.FONT_BODY);
        table.getTableHeader().setBackground(new Color(20, 28, 45));
        table.getTableHeader().setForeground(Theme.TEXT_SECONDARY);
        table.getTableHeader().setFont(Theme.FONT_TITLE);
        table.setShowGrid(true);

        // Custom renderer for badges and color accents
        table.setDefaultRenderer(Object.class, new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(JTable t, Object val, boolean isSel, boolean hasFocus, int row, int col) {
                Component c = super.getTableCellRendererComponent(t, val, isSel, hasFocus, row, col);
                setBackground(row % 2 == 0 ? Theme.BG_CARD : new Color(24, 34, 52));
                setForeground(Theme.TEXT_PRIMARY);

                if (col == 4) { // Infraction type
                    String text = String.valueOf(val);
                    if (text.contains("Pedestrian")) {
                        setForeground(new Color(244, 63, 94)); // Rose
                    } else if (text.contains("Red Light")) {
                        setForeground(Theme.ACCENT_CRIMSON);
                    } else {
                        setForeground(Theme.ACCENT_AMBER);
                    }
                } else if (col == 6) { // Fine
                    setForeground(Theme.ACCENT_EMERALD);
                } else if (col == 3) { // Plate
                    setFont(Theme.FONT_MONO_SMALL);
                    setForeground(Theme.ACCENT_CYAN);
                }
                return c;
            }
        });

        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.getViewport().setBackground(Theme.BG_CARD);
        scrollPane.setBorder(BorderFactory.createEmptyBorder());
        add(scrollPane, BorderLayout.CENTER);

        refreshData();
    }

    public synchronized void refreshData() {
        List<Violation> list = simulator.getViolations();
        tableModel.setRowCount(0);

        int totalFines = 0;
        for (Violation v : list) {
            totalFines += v.getFineAmount();
            tableModel.addRow(new Object[]{
                    v.getId(),
                    v.getTimestamp(),
                    v.getVehicleId(),
                    v.getLicensePlate(),
                    v.getType().displayName,
                    String.format("%.1f km/h", v.getSpeedKmh()),
                    "$" + v.getFineAmount(),
                    v.getStatus()
            });
        }

        headerStatsLabel.setText(String.format("TOTAL INCIDENTS: %d  |  FINES LEVIED: $%d  |  SAFETY SCORE: %d%%",
                list.size(), totalFines, simulator.getMetrics().getSafetyScore()));
    }

    @Override
    public void onViolationLogged(Violation violation) {
        refreshData();
    }
}
