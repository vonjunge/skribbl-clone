# Start Server Script
# Run this in one terminal to start the backend server

Write-Host "🎮 Starting Game Server..." -ForegroundColor Cyan
Write-Host ""

Set-Location server

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencies not installed!" -ForegroundColor Yellow
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Installation failed!" -ForegroundColor Red
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}

Write-Host "🚀 Starting server on port 3001..." -ForegroundColor Green
npm start
