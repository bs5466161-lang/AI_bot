@echo off
echo ==========================================
echo Starting AI Chat Ecosystem...
echo ==========================================

:: Start n8n in a separate window
echo [1/2] Launching n8n Backend...
start "n8n Backend" cmd /c "n8n"

:: Wait a moment for n8n to initialize
timeout /t 3 /nobreak > nul

:: Start the Frontend
echo [2/2] Launching AI Bot Frontend...
cd ai_bot
start "AI Bot Frontend" cmd /c "npm run dev"

echo ==========================================
echo All systems are starting! 
echo Frontend: http://localhost:5173 (or similar)
echo n8n: http://localhost:5678
echo ==========================================
pause
