$root = Split-Path -Parent $PSScriptRoot

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$root'; npm run dev:backend"
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$root'; npm run dev:frontend"
)

Write-Host "Backend: http://localhost:4000"
Write-Host "Frontend: http://localhost:3000"
