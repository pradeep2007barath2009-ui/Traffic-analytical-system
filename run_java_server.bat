@echo off
setlocal

echo ===================================================
echo   Launching UrbanFlow Java REST API Server (Headless)
echo ===================================================

where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] java runtime was not found in PATH.
    exit /b 1
)

if not exist "java_system\bin\com\urbanflow\UrbanFlowMain.class" (
    echo [INFO] Binaries not found. Running compiler first...
    call compile_java.bat
    if %errorlevel% neq 0 exit /b 1
)

echo Starting UrbanFlow Headless Server on port 8000...
java -cp java_system\bin com.urbanflow.UrbanFlowMain --headless --port=8000 %*
