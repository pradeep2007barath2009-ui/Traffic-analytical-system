# generate_ui_figures.py
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

assets_dir = r"c:\Traffic analytical system\doc_assets"
os.makedirs(assets_dir, exist_ok=True)

# 1. Figure 5.3: CCTV Surveillance HUD
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=200)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')

# Road intersection from CCTV perspective
ax.fill([1, 9, 9, 1], [3.2, 3.2, 5.8, 5.8], color='#1e293b')
ax.fill([3.8, 6.2, 6.2, 3.8], [0.5, 0.5, 8.5, 8.5], color='#1e293b')

# Dashed centerlines
ax.plot([1, 3.8], [4.5, 4.5], color='#facc15', linestyle='--', linewidth=1.5)
ax.plot([6.2, 9], [4.5, 4.5], color='#facc15', linestyle='--', linewidth=1.5)
ax.plot([5, 5], [0.5, 3.2], color='#facc15', linestyle='--', linewidth=1.5)
ax.plot([5, 5], [5.8, 8.5], color='#facc15', linestyle='--', linewidth=1.5)

# Zebra markings
for y in np.linspace(3.4, 5.6, 6):
    ax.add_patch(patches.Rectangle((3.4, y), 0.35, 0.18, color='#e2e8f0', alpha=0.9))
    ax.add_patch(patches.Rectangle((6.25, y), 0.35, 0.18, color='#e2e8f0', alpha=0.9))

# Vehicles with bounding boxes & radar overlays
# Car 1
ax.add_patch(patches.Rectangle((2.0, 4.7), 0.9, 0.5, color='#3b82f6', alpha=0.9))
bb1 = patches.Rectangle((1.9, 4.6), 1.1, 0.7, fill=False, edgecolor='#10b981', linewidth=1.8, linestyle='-')
ax.add_patch(bb1)
ax.text(1.9, 5.4, "CAR #104 | 46.2 km/h [98.4%]", color='#10b981', fontsize=8, fontweight='bold', fontfamily='monospace')

# Bus 1
ax.add_patch(patches.Rectangle((7.0, 3.5), 1.4, 0.6, color='#f59e0b', alpha=0.9))
bb2 = patches.Rectangle((6.9, 3.4), 1.6, 0.8, fill=False, edgecolor='#10b981', linewidth=1.8)
ax.add_patch(bb2)
ax.text(6.9, 4.3, "BUS #022 | 38.5 km/h [97.1%]", color='#10b981', fontsize=8, fontweight='bold', fontfamily='monospace')

# Speeding Car 2
ax.add_patch(patches.Rectangle((5.2, 6.8), 0.5, 0.9, color='#ec4899', alpha=0.9))
bb3 = patches.Rectangle((5.1, 6.7), 0.7, 1.1, fill=False, edgecolor='#ef4444', linewidth=2.0)
ax.add_patch(bb3)
ax.text(5.1, 7.9, "CAR #108 | 58.4 km/h [SPEEDING!]", color='#ef4444', fontsize=8, fontweight='bold', fontfamily='monospace')

# HUD Header & Grid Overlay
ax.text(0.3, 8.8, "[LIVE] CCTV CAM-01: INTERSECTION NORTH ARTERIAL | 60 FPS", color='#38bdf8', fontsize=10, fontweight='bold', fontfamily='monospace')
ax.text(0.3, 8.4, "OPTICAL RADAR: ACTIVE | BOUNDING-BOX TRACKER: LOCKED | RESOLUTION: 1920x1080", color='#94a3b8', fontsize=8, fontfamily='monospace')
ax.text(6.8, 8.8, "TIMESTAMP: 2026-10-23 14:32:05 IST", color='#94a3b8', fontsize=8, fontfamily='monospace')

# Compass / Crosshair
ax.plot([4.9, 5.1], [4.5, 4.5], color='#38bdf8', linewidth=1)
ax.plot([5.0, 5.0], [4.4, 4.6], color='#38bdf8', linewidth=1)
ax.set_xlim(0, 10)
ax.set_ylim(0, 9.2)
ax.axis('off')
plt.tight_layout()
plt.savefig(os.path.join(assets_dir, "fig_cctv_hud.png"), facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
plt.close()

# 2. Figure 5.4: Pedestrian Crosswalk Safety Hold in Action
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=200)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')

# Pavement
ax.fill([1, 9, 9, 1], [3.0, 3.0, 6.0, 6.0], color='#1e293b')
ax.fill([3.8, 6.2, 6.2, 3.8], [0.5, 0.5, 8.5, 8.5], color='#1e293b')

# Red Stop Lines
ax.plot([3.5, 3.5], [3.0, 6.0], color='#ef4444', linewidth=4, label='Stop Line')
ax.plot([6.5, 6.5], [3.0, 6.0], color='#ef4444', linewidth=4)

# Pedestrian Zebra Crossing (highlighted in gold)
for y in np.linspace(3.2, 5.8, 8):
    ax.add_patch(patches.Rectangle((3.65, y), 0.4, 0.16, color='#fef08a', alpha=0.9))

# Pedestrian walking across zebra corridor
ax.plot(3.85, 4.6, marker='o', markersize=14, color='#38bdf8', markeredgecolor='#ffffff', markeredgewidth=2)
ax.text(4.0, 4.5, "PEDESTRIAN IN ROADWAY\n(Crossing Speed: 1.2 m/s)", color='#38bdf8', fontsize=8.5, fontweight='bold')

# Stopped Vehicles Behind Stop Line
ax.add_patch(patches.Rectangle((2.1, 4.7), 1.1, 0.55, color='#3b82f6', alpha=0.9))
ax.text(2.1, 5.35, "CAR #098 [HALTED 0.0 km/h]\nv_lead = 0.0 (IDM Stop Barrier)", color='#f87171', fontsize=8, fontfamily='monospace')

ax.add_patch(patches.Rectangle((0.7, 4.7), 1.1, 0.55, color='#64748b', alpha=0.9))
ax.text(0.7, 5.35, "CAR #099 [QUEUED]", color='#94a3b8', fontsize=7.5, fontfamily='monospace')

# Signal Head Status
ax.add_patch(patches.Rectangle((3.2, 6.2), 0.8, 2.0, color='#020617', edgecolor='#475569', linewidth=1.5))
ax.plot(3.6, 7.7, marker='o', markersize=12, color='#ef4444') # RED
ax.plot(3.6, 7.2, marker='o', markersize=12, color='#334155') # YELLOW OFF
ax.plot(3.6, 6.7, marker='o', markersize=12, color='#334155') # GREEN OFF
ax.text(4.2, 7.6, "ALL-RED SAFETY HOLD: ACTIVE\nAll vehicular green phases suppressed\nMandatory stop line rule enforced", color='#ef4444', fontsize=9, fontweight='bold')

ax.set_xlim(0, 10)
ax.set_ylim(0, 9)
ax.axis('off')
plt.tight_layout()
plt.savefig(os.path.join(assets_dir, "fig_pedestrian_hold.png"), facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
plt.close()

# 3. Figure 5.5: Emergency Ambulance Priority Green Wave Corridor
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=200)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')

# Pavement
ax.fill([1, 9, 9, 1], [3.2, 3.2, 5.8, 5.8], color='#1e293b')
ax.fill([3.8, 6.2, 6.2, 3.8], [0.5, 0.5, 8.5, 8.5], color='#1e293b')

# Priority Corridor Highlight (Green glow)
ax.fill([1, 9, 9, 1], [4.5, 4.5, 5.8, 5.8], color='#065f46', alpha=0.35)

# Ambulance Entity
ax.add_patch(patches.Rectangle((2.2, 4.7), 1.2, 0.55, color='#ffffff', edgecolor='#ef4444', linewidth=2))
ax.text(2.35, 4.9, "AMBULANCE", color='#ef4444', fontsize=8, fontweight='bold')
# Strobe light halo
ax.plot(2.8, 5.4, marker='*', markersize=16, color='#ef4444')
ax.text(1.7, 5.5, "EMERGENCY PREEMPTION ACTIVE\nApproach Speed: 52.0 km/h | siren=TRUE", color='#38bdf8', fontsize=8.5, fontweight='bold', fontfamily='monospace')

# Green Wave Signal indication
ax.add_patch(patches.Rectangle((3.2, 6.2), 0.8, 2.0, color='#020617', edgecolor='#475569', linewidth=1.5))
ax.plot(3.6, 7.7, marker='o', markersize=12, color='#334155') # RED OFF
ax.plot(3.6, 7.2, marker='o', markersize=12, color='#334155') # YELLOW OFF
ax.plot(3.6, 6.7, marker='o', markersize=12, color='#10b981') # GREEN ON
ax.text(4.2, 6.7, "PRIORITY GREEN WAVE LOCKED\nConflicting corridors held at RED\nDownstream queues cleared in advance", color='#10b981', fontsize=9, fontweight='bold')

# Opposing corridor stopped
ax.add_patch(patches.Rectangle((4.3, 1.2), 0.55, 1.0, color='#3b82f6', alpha=0.8))
ax.text(5.0, 1.6, "HELD AT RED (Opposing Phase)", color='#f87171', fontsize=8, fontfamily='monospace')

ax.set_xlim(0, 10)
ax.set_ylim(0, 9)
ax.axis('off')
plt.tight_layout()
plt.savefig(os.path.join(assets_dir, "fig_emergency_wave.png"), facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
plt.close()

# 4. Figure 5.6: Electronic Violation Ledger Panel
fig, ax = plt.subplots(figsize=(10, 5.0), dpi=200)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')

# Table container
ax.add_patch(patches.FancyBboxPatch((0.5, 0.5), 9.0, 4.0, boxstyle="round,pad=0.1", fc='#1e293b', ec='#334155', lw=1.5))
ax.text(0.8, 4.15, "ELECTRONIC VIOLATION AUDIT LEDGER (E-CHALLAN) - REAL TIME", color='#38bdf8', fontsize=11, fontweight='bold')
ax.text(6.8, 4.15, "TOTAL FINES: $3,450 | COUNT: 18", color='#10b981', fontsize=10, fontweight='bold')

headers = ["ID", "TIMESTAMP", "LICENSE PLATE", "VEHICLE", "SPEED", "OFFENSE TYPE", "FINE ($)", "STATUS"]
xs = [0.8, 1.3, 2.6, 4.0, 4.9, 5.8, 7.5, 8.4]
for h, x in zip(headers, xs):
    ax.text(x, 3.65, h, color='#94a3b8', fontsize=8, fontweight='bold', fontfamily='monospace')

ax.plot([0.7, 9.3], [3.5, 3.5], color='#475569', lw=1)

rows = [
    ("001", "14:12:04", "TN-01-AB-108", "CAR", "58.4 km/h", "SPEEDING (>50)", "$100", "ISSUED"),
    ("002", "14:15:32", "TN-02-CD-419", "TRUCK", "34.1 km/h", "RED LIGHT RUN", "$250", "ISSUED"),
    ("003", "14:18:19", "TN-09-EF-902", "CAR", "48.0 km/h", "CROSSWALK YIELD", "$300", "ISSUED"),
    ("004", "14:21:40", "TN-01-GH-312", "BUS", "54.2 km/h", "SPEEDING (>50)", "$100", "ISSUED"),
    ("005", "14:25:11", "TN-05-JK-554", "CAR", "41.0 km/h", "RED LIGHT RUN", "$250", "ISSUED"),
    ("006", "14:28:55", "TN-03-LM-771", "CAR", "62.1 km/h", "SPEEDING (>50)", "$100", "ISSUED")
]

ys = [3.1, 2.6, 2.1, 1.6, 1.1, 0.6]
for r, y in zip(rows, ys):
    for val, x in zip(r, xs):
        col = '#ef4444' if 'SPEEDING' in val or 'RED' in val or 'YIELD' in val else ('#10b981' if 'ISSUED' in val else '#f8fafc')
        ax.text(x, y, val, color=col, fontsize=8, fontfamily='monospace')

ax.set_xlim(0, 10)
ax.set_ylim(0, 4.8)
ax.axis('off')
plt.tight_layout()
plt.savefig(os.path.join(assets_dir, "fig_violation_ledger.png"), facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
plt.close()

# 5. Figure 5.8: REST API JSON Telemetry Endpoint Response
fig, ax = plt.subplots(figsize=(10, 4.8), dpi=200)
ax.set_facecolor('#020617')
fig.patch.set_facecolor('#020617')

json_text = """GET /api/metrics HTTP/1.1
Host: localhost:8080
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8
Access-Control-Allow-Origin: *
Cache-Control: no-cache

{
  "systemStatus": "OPERATIONAL_60FPS",
  "activePhase": "PHASE_0_NORTH_SOUTH",
  "signalState": "GREEN",
  "elapsedGreenSec": 24.6,
  "allocatedGreenSec": 38.0,
  "queueNorthSouth": 6,
  "queueEastWest": 14,
  "pedestrianHoldActive": false,
  "emergencyPreemptionActive": false,
  "totalVehicleThroughput": 412,
  "averageDelaySec": 30.1,
  "totalViolationsLogged": 18,
  "jvmHeapMemoryUsedMB": 84.2,
  "fps": 60.0
}"""

ax.text(0.05, 0.95, json_text, color='#38bdf8', fontsize=8.5, fontfamily='monospace', verticalalignment='top')
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')
plt.tight_layout()
plt.savefig(os.path.join(assets_dir, "fig_rest_api.png"), facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
plt.close()

print("Generated all 5 supplementary UI figures in doc_assets successfully.")
