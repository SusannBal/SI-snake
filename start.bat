@echo off
setlocal
set "PROJECT_ROOT=%~dp0"
echo ========================================================
echo          INICIANDO CYBERSNAKE (FastAPI + TypeScript)
echo ========================================================
start "Snake Backend" cmd /k "cd /d ""%PROJECT_ROOT%backend"" && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 2 /nobreak > nul
start "Snake Frontend" cmd /k "cd /d ""%PROJECT_ROOT%frontend"" && npm.cmd run dev -- --host 0.0.0.0"
timeout /t 2 /nobreak > nul
echo.
echo Frontend: http://localhost:5174
echo API:      http://localhost:8001/api/health
echo Monitor:  http://localhost:8001/api/traffic
echo.
start http://localhost:5174
endlocal

