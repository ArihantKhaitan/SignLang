@echo off
title SignLang AI

echo =============================================
echo   SignLang AI - Full Sign Language System
echo =============================================
echo.
echo Starting backend (Flask + MediaPipe)...
start "SignLang Backend" cmd /k "cd /d "%~dp0backend" && C:\Users\ariha\AppData\Local\Programs\Python\Python313\python.exe app.py"

echo Waiting for backend to initialise...
timeout /t 3 /nobreak >nul

echo Starting frontend (Vite dev server)...
start "SignLang Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =============================================
echo   App ready at:  http://localhost:3010
echo   Backend API:   http://localhost:8001
echo =============================================
echo.
pause
