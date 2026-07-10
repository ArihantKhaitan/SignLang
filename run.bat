@echo off
title SignLang AI

echo =============================================
echo   SignLang AI - Sign Language in the Browser
echo =============================================
echo.
echo Starting app (everything runs in the browser)...
start "SignLang" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =============================================
echo   App ready at:  http://localhost:3010
echo =============================================
echo.
pause
