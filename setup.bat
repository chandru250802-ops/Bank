@echo off
REM Setup script for Windows
REM Run as Administrator

echo.
echo ========================================
echo   Bank Management System - Setup (Windows)
echo ========================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH.
    echo.
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo Make sure to add PostgreSQL to your PATH during installation.
    echo.
    pause
    exit /b 1
)

echo [✓] PostgreSQL found

REM Check if CMake is installed
where cmake >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: CMake is not installed or not in PATH.
    echo.
    echo Please install CMake from: https://cmake.org/download/
    echo.
    pause
    exit /b 1
)

echo [✓] CMake found

REM Get PostgreSQL password
echo.
echo PostgreSQL Setup:
echo ==================
set /p PG_PASSWORD="Enter PostgreSQL password (default 'postgres'): "
if "%PG_PASSWORD%"=="" set PG_PASSWORD=postgres

REM Create database
echo.
echo Creating database...

psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE bank_management;" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Database created
) else (
    echo [!] Database may already exist (this is fine)
)

REM Apply schema
psql -U postgres -h 127.0.0.1 -d bank_management -f sql\schema.sql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Schema applied
) else (
    echo ERROR: Failed to apply schema
    pause
    exit /b 1
)

REM Update connection string in main.cpp
echo.
echo Updating database connection string...

REM Note: This is optional - you can manually update the connection string in main.cpp
REM Currently it uses: "dbname=bank_management user=postgres password=root host=127.0.0.1"

REM Build C++ server
echo.
echo Building C++ server...
echo This may take a few minutes...

cd server
if not exist build mkdir build
cd build

cmake .. -G "Visual Studio 16 2019"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: CMake configuration failed
    pause
    exit /b 1
)

cmake --build . --config Release
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

cd ..\..

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To run the application:
echo.
echo 1. Open Command Prompt 1:
echo    cd server\build
echo    Release\BankServer.exe
echo.
echo 2. Open Command Prompt 2:
echo    cd public
echo    python -m http.server 8000
echo.
echo 3. Open browser and visit:
echo    http://127.0.0.1:8000
echo.
echo Note: Make sure PostgreSQL is running before starting the server!
echo.
pause
