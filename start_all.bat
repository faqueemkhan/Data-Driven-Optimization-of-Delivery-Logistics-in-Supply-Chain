@echo off
echo =========================================================================
echo Data-Driven Optimization of Delivery Logistics in Supply Chain
echo Launching Backend and Frontend in separate windows...
echo =========================================================================

start "Logistics Backend [FastAPI]" cmd /k "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "Logistics Frontend [Vite React]" cmd /k "%~dp0start_frontend.bat"

echo.
echo Both services are starting:
echo  - Backend API: http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)
echo  - Frontend Dashboard: http://localhost:5173
echo =========================================================================
