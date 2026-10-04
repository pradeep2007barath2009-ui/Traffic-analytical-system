@echo off
echo ========================================================
echo Launching UrbanFlow AI - Unified Traffic Analytical System
echo ========================================================
start "UrbanFlow Backend" cmd /k "python backend/main.py"
timeout /t 2 > nul
start "UrbanFlow Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 > nul
start http://localhost:5173
echo System initialized! Opening http://localhost:5173...
