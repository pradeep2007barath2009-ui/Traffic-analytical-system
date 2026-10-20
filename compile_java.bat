@echo off

echo ===================================================
echo   Compiling UrbanFlow Java Traffic Analytical System
echo ===================================================

if not exist "java_system\bin" mkdir "java_system\bin"

echo Compiling Java sources with javac...
javac -d java_system\bin -sourcepath java_system\src java_system\src\com\urbanflow\UrbanFlowMain.java

if errorlevel 1 (
    echo [ERROR] Compilation failed.
    exit /b 1
)

echo [SUCCESS] Compilation successful! Classes compiled to java_system\bin
exit /b 0
