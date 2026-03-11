param(
    [switch]$NoServe
)

$ErrorActionPreference = "Stop"

$clientDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $clientDir
$runtimePath = Join-Path $repoRoot ".genea-runtime.json"
$proxyPath = Join-Path $clientDir "proxy.auto.conf.json"

function Test-BackendHttp {
    param(
        [int]$Port
    )

    if ($Port -le 0) {
        return $false
    }

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/actuator" -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    } catch {
        return $false
    }
}

function Get-PortFromRuntime {
    if (-not (Test-Path $runtimePath)) {
        return $null
    }

    try {
        $runtime = Get-Content -Path $runtimePath -Raw | ConvertFrom-Json
        if ($null -ne $runtime.backendPort) {
            return [int]$runtime.backendPort
        }
    } catch {
        return $null
    }

    return $null
}

function Get-PortFromProxyConfig {
    if (-not (Test-Path $proxyPath)) {
        return $null
    }

    try {
        $proxy = Get-Content -Path $proxyPath -Raw | ConvertFrom-Json
        if ($proxy."/api" -and $proxy."/api".target) {
            $target = [string]$proxy."/api".target
            if ($target -match ":(\d+)$") {
                return [int]$Matches[1]
            }
        }
    } catch {
        return $null
    }

    return $null
}

function Get-JavaListeningPorts {
    $ports = @()
    try {
        $javaPids = Get-Process java -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id
        if (-not $javaPids) {
            return $ports
        }

        $javaPorts = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
            Where-Object { $_.OwningProcess -in $javaPids } |
            Select-Object -ExpandProperty LocalPort -Unique

        if ($javaPorts) {
            $ports = $javaPorts
        }
    } catch {
        return @()
    }

    return $ports
}

function Write-ProxyConfig {
    param(
        [int]$BackendPort
    )

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
}

$candidatePorts = New-Object System.Collections.Generic.List[int]

$runtimePort = Get-PortFromRuntime
if ($runtimePort) { $candidatePorts.Add($runtimePort) }

$proxyPort = Get-PortFromProxyConfig
if ($proxyPort) { $candidatePorts.Add($proxyPort) }

$candidatePorts.Add(8080)

foreach ($javaPort in (Get-JavaListeningPorts)) {
    $candidatePorts.Add([int]$javaPort)
}

$uniqueCandidates = $candidatePorts | Select-Object -Unique
$selectedPort = $null

foreach ($port in $uniqueCandidates) {
    if (Test-BackendHttp -Port $port) {
        $selectedPort = [int]$port
        break
    }
}

if (-not $selectedPort) {
    $selectedPort = if ($proxyPort) { [int]$proxyPort } else { 8080 }
    Write-Warning "No reachable backend detected. Keeping fallback port $selectedPort in proxy."
} else {
    Write-Host "Detected backend on port $selectedPort."
}

Write-ProxyConfig -BackendPort $selectedPort
Write-Host "Updated proxy config: $proxyPath"

if ($NoServe) {
    return
}

Set-Location $clientDir
& npm run ng -- serve --proxy-config proxy.auto.conf.json
