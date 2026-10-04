"""
UrbanFlow AI - Camera and Sensor Input Configuration

Edit this file to connect physical cameras, IP streams, or recorded traffic video.
"""

import os

# ==============================================================================
# REAL CAMERA / SENSOR SOURCE CONFIGURATION
# ==============================================================================
# Options:
#   0                                                -> Integrated Laptop Webcam / Primary USB Camera
#   1                                                -> Secondary USB Webcam
#   "rtsp://admin:password@192.168.1.50:554/stream1" -> IP Camera / CCTV RTSP Feed
#   "http://192.168.1.15:8080/video"                 -> Mobile Phone Camera (via IP Webcam app)
#   "data/traffic_sample.mp4"                        -> Recorded MP4/AVI Traffic Video
#   None                                             -> Built-in Synthetic CV Simulation
#
# Can also be set via environment variable: set CAMERA_SOURCE=0
# ==============================================================================

# Read environment variable if set
ENV_SOURCE = os.environ.get("CAMERA_SOURCE", None)
if ENV_SOURCE is not None and ENV_SOURCE.isdigit():
    ENV_SOURCE = int(ENV_SOURCE)

# Set CAMERA_SOURCE to 0 for your local webcam, or your RTSP stream URL
CAMERA_SOURCE = ENV_SOURCE if ENV_SOURCE is not None else None

# Calibration parameters for real cameras
SPEED_CALIBRATION_FACTOR = 2.8 # Scale pixel velocity to km/h
STOP_LINE_Y_RATIO = 0.58       # Stop line position (fraction of frame height)
MIN_CONTOUR_AREA = 800         # Minimum contour size to detect as vehicle
