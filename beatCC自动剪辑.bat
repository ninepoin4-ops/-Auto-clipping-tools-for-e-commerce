@echo off
setlocal
chcp 65001 >nul

:: Configuration
set PORT=8000
set HOST=localhost
set URL=http://%HOST%:%PORT%

cls
echo ========================================================
echo       Beat-CC Local Server Launcher
echo ========================================================
echo.

:: Check for Python
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Python environment detected.
    echo [INFO] Starting Python HTTP Server on port %PORT%...
    echo [INFO] Opening default browser to %URL%...
    
    :: Open browser (non-blocking)
    start "" "%URL%"
    
    :: Start Server
    python -m http.server %PORT%
    
    goto :End
)

:: Check for Python3 (sometimes named python3 on windows if installed via some methods, though usually python)
python3 --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Python3 detected.
    echo [INFO] Starting Python HTTP Server on port %PORT%...
    echo [INFO] Opening default browser to %URL%...
    
    start "" "%URL%"
    python3 -m http.server %PORT%
    goto :End
)

:: Fallback: Check for Node.js (just in case, though user prioritized Python)
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Node.js environment detected.
    echo [INFO] Attempting to start via npx http-server...
    echo [INFO] Opening default browser to %URL%...
    
    start "" "%URL%"
    call npx http-server -p %PORT% -c-1
    goto :End
)

:: If nothing found
echo [ERROR] No suitable runtime found!
echo.
echo To run this project, you need a local web server.
echo Please install one of the following:
echo   1. Python (Recommended): https://www.python.org/downloads/
echo   2. Node.js: https://nodejs.org/
echo.
echo After installation, restart this script.
echo.
pause

:End
endlocal
