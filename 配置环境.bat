@echo off
setlocal EnableExtensions

cd /d "%~dp0"

set "PY_DIR=%~dp0runtime\python"
set "PY_EXE=%PY_DIR%\python.exe"

echo ========================================================
echo   BeatCC Setup (run once)
echo ========================================================
echo.

if exist "%PY_EXE%" (
  echo [OK] Portable Python already exists:
  echo      %PY_EXE%
  goto :Verify
)

echo [INFO] Portable Python not found. Downloading embeddable Python...
echo [INFO] Source: python.org (internet required)
echo.

set "PY_VER=3.12.8"
set "PY_ZIP=python-%PY_VER%-embed-amd64.zip"
set "PY_URL=https://www.python.org/ftp/python/%PY_VER%/%PY_ZIP%"
set "TMP_DIR=%~dp0runtime\_tmp"
set "ZIP_PATH=%TMP_DIR%\%PY_ZIP%"

if not exist "%TMP_DIR%" mkdir "%TMP_DIR%" >nul 2>&1
if not exist "%~dp0runtime" mkdir "%~dp0runtime" >nul 2>&1

echo [INFO] Downloading:
echo      %PY_URL%
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ProgressPreference='SilentlyContinue';" ^
  "New-Item -ItemType Directory -Force -Path '%TMP_DIR%' | Out-Null;" ^
  "Invoke-WebRequest -UseBasicParsing -Uri '%PY_URL%' -OutFile '%ZIP_PATH%';"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Download failed.
  echo         Please check your network, or manually download and place it here:
  echo         %ZIP_PATH%
  echo.
  pause
  exit /b 1
)

echo [INFO] Extracting to:
echo      %PY_DIR%
if exist "%PY_DIR%" rmdir /s /q "%PY_DIR%" >nul 2>&1
mkdir "%PY_DIR%" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Expand-Archive -Force -LiteralPath '%ZIP_PATH%' -DestinationPath '%PY_DIR%';"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Extract failed. Ensure PowerShell is available.
  echo.
  pause
  exit /b 1
)

echo [OK] Portable Python is ready.

:Verify
echo.
echo [INFO] Verifying Python stdlib...
"%PY_EXE%" -c "import http.server, socketserver; print('OK')"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Python verify failed. Delete runtime\python and rerun this script.
  echo.
  pause
  exit /b 1
)

set "FF_DIR=%~dp0runtime\ffmpeg"
set "FF_EXE=%FF_DIR%\ffmpeg.exe"

echo.
if exist "%FF_EXE%" (
  echo [OK] ffmpeg already exists:
  echo      %FF_EXE%
  goto :Done
)

echo [INFO] ffmpeg not found. Downloading ffmpeg for MP4 conversion...
echo [INFO] Source: gyan.dev (internet required)
echo.

set "FF_ZIP=ffmpeg-release-essentials.zip"
set "FF_URL=https://www.gyan.dev/ffmpeg/builds/%FF_ZIP%"
set "FF_TMP=%~dp0runtime\_tmp"
set "FF_ZIP_PATH=%FF_TMP%\%FF_ZIP%"
set "FF_EXTRACT=%FF_DIR%\_extract"

if not exist "%FF_TMP%" mkdir "%FF_TMP%" >nul 2>&1
if not exist "%FF_DIR%" mkdir "%FF_DIR%" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ProgressPreference='SilentlyContinue';" ^
  "Invoke-WebRequest -UseBasicParsing -Uri '%FF_URL%' -OutFile '%FF_ZIP_PATH%';"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [WARN] ffmpeg download failed. MP4 download will fallback to WebM.
  goto :Done
)

if exist "%FF_EXTRACT%" rmdir /s /q "%FF_EXTRACT%" >nul 2>&1
mkdir "%FF_EXTRACT%" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Expand-Archive -Force -LiteralPath '%FF_ZIP_PATH%' -DestinationPath '%FF_EXTRACT%';" ^
  "$exe=(Get-ChildItem -LiteralPath '%FF_EXTRACT%' -Recurse -Filter ffmpeg.exe | Select-Object -First 1).FullName;" ^
  "if(-not $exe){ throw 'ffmpeg.exe not found in archive' };" ^
  "Copy-Item -Force -LiteralPath $exe -Destination '%FF_EXE%';"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [WARN] ffmpeg setup failed. MP4 download will fallback to WebM.
  goto :Done
)

echo [OK] ffmpeg is ready:
echo      %FF_EXE%

:Done
echo.
echo [OK] Setup completed. You can close this window now.
echo.
pause

