"""
UrbanFlow AI - System Entry Point
Run with: python backend/main.py
"""

import uvicorn
import os
import sys

# Ensure project root is in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    print("=" * 60)
    print("[*] UrbanFlow AI - Smart Traffic Operations System Starting")
    print("[+] Real-time Computer Vision + Adaptive Signals + TOC Dashboard")
    print("[+] API Server: http://localhost:8000")
    print("[+] Video Stream: http://localhost:8000/api/video/feed")
    print("[+] WebSocket Telemetry: ws://localhost:8000/ws/telemetry")
    print("=" * 60)
    uvicorn.run("backend.api.server:app", host="0.0.0.0", port=8000, reload=False)

