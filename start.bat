@echo off
title VikingViewer
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js ble ikke funnet. Installer Node.js eller kontroller PATH.
  pause
  exit /b 1
)

echo.
echo Kontrollerer tilkoblingene til Viking Scoring...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0connect-drives.ps1"
if errorlevel 1 (
  echo.
  echo ADVARSEL: Se nettverksmeldingene over. Serveren starter likevel.
)

echo Starter VikingViewer...

start "" /B node "%~dp0server.js"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/settings"

echo.
echo VikingViewer kjoerer.
echo Lukk dette vinduet for å stoppe serveren.
pause >nul
