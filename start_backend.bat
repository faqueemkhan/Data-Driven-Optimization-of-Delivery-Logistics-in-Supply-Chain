@echo off
echo =========================================================================
echo Data-Driven Optimization of Delivery Logistics in Supply Chain
echo Starting FastAPI Backend (Port 8000)...
echo =========================================================================
cd /d "%~dp0backend"
python run_backend.py
pause
