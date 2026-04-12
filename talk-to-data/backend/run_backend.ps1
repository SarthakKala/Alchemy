# Run from backend/: immediate console output, then unbuffered Python (see stderr lines from app.main).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Write-Host ""
Write-Host "Starting Talk-to-Data API (uvicorn)..." -ForegroundColor Cyan
Write-Host "Tip: The first import on Windows can take 1–3+ minutes (antivirus scanning the venv). Wait for 'Application startup complete' or 'Uvicorn running'." -ForegroundColor DarkGray
Write-Host ""
& .\venv\Scripts\python.exe -u -m uvicorn app.main:app --host 127.0.0.1 --port 8000
