@echo off
setlocal

echo ===================================================
echo   Launching UrbanFlow Java Command Center GUI
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

echo Starting UrbanFlow GUI with hardware acceleration...
java -Dsun.java2d.d3d=true -Dsun.java2d.opengl=false -cp java_system\bin com.urbanflow.UrbanFlowMain %*
