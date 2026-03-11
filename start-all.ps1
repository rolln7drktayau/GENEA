$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $repoRoot "server"
$clientDir = Join-Path $repoRoot "client"

if (-not (Test-Path $serverDir)) {
    throw "Missing directory: $serverDir"
}

if (-not (Test-Path $clientDir)) {
    throw "Missing directory: $clientDir"
}

if (-not (Test-Path (Join-Path $clientDir "node_modules"))) {
    Write-Host "Installing client dependencies..."
    & npm --prefix $clientDir install
}

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$serverDir'; .\mvnw.cmd spring-boot:run"
)

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$clientDir'; npm start"
)

Write-Host "GENEA startup launched."
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:4200"
