@echo off
echo =========================================================================
echo Data-Driven Optimization of Delivery Logistics in Supply Chain
echo Starting FastAPI Backend (Port 8000)...
echo =========================================================================
cd /d "%~dp0backend"
"C:\Users\Mohammad Naeem\AppData\Local\Programs\Python\Python313\python.exe" run_backend.py
pause
