$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $repoRoot "server"
$clientDir = Join-Path $repoRoot "client"

function Test-MongoDbPort {
    try {
        $tcp = Test-NetConnection -ComputerName "localhost" -Port 27017 -WarningAction SilentlyContinue
        return [bool]$tcp.TcpTestSucceeded
    } catch {
        return $false
    }
}

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

if (-not (Test-MongoDbPort)) {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -ne "Running") {
        Write-Host "Starting MongoDB service..."
        Start-Service -Name "MongoDB"
        Start-Sleep -Seconds 3
    }
}

if (-not (Test-MongoDbPort)) {
    Write-Warning "MongoDB is not reachable on localhost:27017. Start MongoDB before logging in."
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
