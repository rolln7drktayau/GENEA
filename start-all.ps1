$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $repoRoot "server"
$clientDir = Join-Path $repoRoot "client"
$runtimePath = Join-Path $repoRoot ".genea-runtime.json"

function Stop-ProcessSafely {
    param(
        [int]$ProcessId,
        [string]$Label
    )

    if ($ProcessId -le 0) {
        return
    }

    try {
        $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped stale $Label process (PID $ProcessId)."
        }
    } catch {
        # Ignore stale cleanup errors.
    }
}

function Stop-StaleRun {
    if (-not (Test-Path $runtimePath)) {
        return
    }

    try {
        $runtimeState = Get-Content -Path $runtimePath -Raw | ConvertFrom-Json
    } catch {
        Remove-Item -Path $runtimePath -Force -ErrorAction SilentlyContinue
        return
    }

    $clientShellPid = 0
    if ($null -ne $runtimeState.clientShellPid) {
        $clientShellPid = [int]$runtimeState.clientShellPid
    }

    $serverShellPid = 0
    if ($null -ne $runtimeState.serverShellPid) {
        $serverShellPid = [int]$runtimeState.serverShellPid
    }

    $mongoShellPid = 0
    if ($null -ne $runtimeState.mongoShellPid) {
        $mongoShellPid = [int]$runtimeState.mongoShellPid
    }

    Stop-ProcessSafely -ProcessId $clientShellPid -Label "client shell"
    Stop-ProcessSafely -ProcessId $serverShellPid -Label "server shell"
    Stop-ProcessSafely -ProcessId $mongoShellPid -Label "mongo shell"

    Remove-Item -Path $runtimePath -Force -ErrorAction SilentlyContinue
}

function Save-RuntimeState {
    param(
        [Parameter(Mandatory = $true)]
        [int]$BackendPort,
        [Parameter(Mandatory = $true)]
        [int]$ServerShellPid,
        [Parameter(Mandatory = $true)]
        [int]$ClientShellPid,
        [int]$MongoShellPid = 0
    )

    $state = [ordered]@{
        backendPort = $BackendPort
        serverShellPid = $ServerShellPid
        clientShellPid = $ClientShellPid
        mongoShellPid = $MongoShellPid
        startedAt = (Get-Date).ToString("o")
    }

    $state | ConvertTo-Json | Set-Content -Path $runtimePath -Encoding ASCII
}

function Ensure-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path $env:JAVA_HOME)) {
        return $true
    }

    $userJavaHome = [Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
    if ($userJavaHome -and (Test-Path $userJavaHome)) {
        $env:JAVA_HOME = $userJavaHome
        return $true
    }

    try {
        $detectedJavaHome = ((java -XshowSettings:properties -version 2>&1 | Select-String 'java.home').Line -replace '.*=\s*', '').Trim()
        if ($detectedJavaHome -and (Test-Path $detectedJavaHome)) {
            [Environment]::SetEnvironmentVariable("JAVA_HOME", $detectedJavaHome, "User")
            $env:JAVA_HOME = $detectedJavaHome
            Write-Host "JAVA_HOME auto-configured to: $detectedJavaHome"
            return $true
        }
    } catch {
        # Warning below.
    }

    Write-Warning "JAVA_HOME is missing and could not be auto-detected. Configure JAVA_HOME to your JDK path."
    return $false
}

function Test-MongoDbPort {
    try {
        $tcp = Test-NetConnection -ComputerName "localhost" -Port 27017 -WarningAction SilentlyContinue
        return [bool]$tcp.TcpTestSucceeded
    } catch {
        return $false
    }
}

function Test-PortAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port
    )

    $listener = $null
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        return $true
    } catch {
        return $false
    } finally {
        if ($listener) {
            $listener.Stop()
        }
    }
}

function Get-FreePort {
    param(
        [int]$PreferredPort = 8080
    )

    if (Test-PortAvailable -Port $PreferredPort) {
        return $PreferredPort
    }

    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $port = $listener.LocalEndpoint.Port
    $listener.Stop()
    return $port
}

function Get-MongoServiceBinaryPath {
    try {
        $service = Get-CimInstance Win32_Service -Filter "Name='MongoDB'"
        if (-not $service -or -not $service.PathName) {
            return $null
        }

        if ($service.PathName -match '"([^"]*mongod\.exe)"') {
            return $Matches[1]
        }

        if ($service.PathName -match '([^\s]+mongod\.exe)') {
            return $Matches[1]
        }

        return $null
    } catch {
        return $null
    }
}

function Get-MongodPath {
    $fromService = Get-MongoServiceBinaryPath
    if ($fromService -and (Test-Path $fromService)) {
        return $fromService
    }

    $candidates = @(
        "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

function Start-MongoDb {
    if (Test-MongoDbPort) {
        Write-Host "MongoDB already running on localhost:27017."
        return 0
    }

    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -ne "Running") {
        Write-Host "Starting MongoDB service..."
        Start-Service -Name "MongoDB"
        Start-Sleep -Seconds 3
    }

    if (Test-MongoDbPort) {
        Write-Host "MongoDB service started."
        return 0
    }

    $mongodPath = Get-MongodPath
    if (-not $mongodPath) {
        Write-Warning "mongod.exe not found. Install MongoDB Community Edition or add mongod to PATH."
        return 0
    }

    $localDbPath = Join-Path $repoRoot ".mongo-data"
    if (-not (Test-Path $localDbPath)) {
        New-Item -ItemType Directory -Path $localDbPath | Out-Null
    }

    Write-Host "Starting mongod process from script..."
    $mongoShell = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "& '$mongodPath' --dbpath '$localDbPath' --bind_ip 127.0.0.1 --port 27017"
    ) -PassThru

    Start-Sleep -Seconds 3

    if (Test-MongoDbPort) {
        Write-Host "mongod process started on localhost:27017."
    } else {
        Write-Warning "MongoDB still not reachable on localhost:27017."
    }

    return $mongoShell.Id
}

function Write-ClientProxyConfig {
    param(
        [Parameter(Mandatory = $true)]
        [int]$BackendPort
    )

    $proxyPath = Join-Path $clientDir "proxy.auto.conf.json"
    $proxyConfig = @"
{
  "/api": {
    "target": "http://localhost:$BackendPort",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "warn"
  }
}
"@

    Set-Content -Path $proxyPath -Value $proxyConfig -Encoding ASCII
    return $proxyPath
}

if (-not (Test-Path $serverDir)) {
    throw "Missing directory: $serverDir"
}

if (-not (Test-Path $clientDir)) {
    throw "Missing directory: $clientDir"
}

Stop-StaleRun
Ensure-JavaHome | Out-Null

if (-not (Test-Path (Join-Path $clientDir "node_modules"))) {
    Write-Host "Installing client dependencies..."
    & npm --prefix $clientDir install
}

$mongoShellPid = Start-MongoDb

$backendPort = Get-FreePort -PreferredPort 8080
if ($backendPort -ne 8080) {
    Write-Warning "Port 8080 is already in use. Backend will start on port $backendPort."
}

$proxyPath = Write-ClientProxyConfig -BackendPort $backendPort

$serverShell = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$serverDir'; `$env:SERVER_PORT='$backendPort'; .\mvnw.cmd spring-boot:run"
) -PassThru

$clientShell = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$clientDir'; npm run start:auto"
) -PassThru

Save-RuntimeState -BackendPort $backendPort -ServerShellPid $serverShell.Id -ClientShellPid $clientShell.Id -MongoShellPid $mongoShellPid

Write-Host "GENEA startup launched."
Write-Host "Backend: http://localhost:$backendPort"
Write-Host "Frontend: http://localhost:4200"
Write-Host "Angular proxy config: $proxyPath"
Write-Host "Use .\stop-all.cmd to stop generated shells and free ports."
