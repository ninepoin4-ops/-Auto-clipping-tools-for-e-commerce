@echo off
setlocal
set PORT=3000
set HOST=127.0.0.1
set URL=http://%HOST%:%PORT%

cls
echo ========================================================
echo       Beat-CC Local Server Launcher
echo ========================================================
echo.

:: Check for Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "%~dp0node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo [INFO] Starting Beat CC...
echo [INFO] Opening browser at %URL%...
echo.
echo Press Ctrl+C to stop the server.
echo.

:: Open browser automatically
start %URL%

:: Start Vite dev server in foreground (so user can see logs and stop with Ctrl+C)
cd /d "%~dp0"
npm run dev

:: Keep window open after exit
pause
