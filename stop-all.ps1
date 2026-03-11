$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtimePath = Join-Path $repoRoot ".genea-runtime.json"

function Stop-ProcessSafely {
    param(
        [int]$Pid,
        [string]$Label
    )

    if ($Pid -le 0) {
        return
    }

    try {
        $process = Get-Process -Id $Pid -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $Pid -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped $Label process (PID $Pid)."
        }
    } catch {
        # Ignore process-stop errors.
    }
}

function Stop-PortListeners {
    param(
        [int[]]$Ports
    )

    foreach ($port in $Ports) {
        if ($port -le 0) {
            continue
        }

        try {
            $pids = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty OwningProcess -Unique

            foreach ($pid in $pids) {
                Stop-ProcessSafely -Pid $pid -Label "listener on port $port"
            }
        } catch {
            # Ignore lookup errors for unavailable ports.
        }
    }
}

$backendPort = 8080

if (Test-Path $runtimePath) {
    try {
        $runtime = Get-Content -Path $runtimePath -Raw | ConvertFrom-Json
        if ($null -ne $runtime.backendPort) {
            $backendPort = [int]$runtime.backendPort
        }

        $clientShellPid = 0
        if ($null -ne $runtime.clientShellPid) {
            $clientShellPid = [int]$runtime.clientShellPid
        }

        $serverShellPid = 0
        if ($null -ne $runtime.serverShellPid) {
            $serverShellPid = [int]$runtime.serverShellPid
        }

        $mongoShellPid = 0
        if ($null -ne $runtime.mongoShellPid) {
            $mongoShellPid = [int]$runtime.mongoShellPid
        }

        Stop-ProcessSafely -Pid $clientShellPid -Label "client shell"
        Stop-ProcessSafely -Pid $serverShellPid -Label "server shell"
        Stop-ProcessSafely -Pid $mongoShellPid -Label "mongo shell"
    } catch {
        Write-Warning "Could not parse $runtimePath, fallback by killing listeners on known ports."
    } finally {
        Remove-Item -Path $runtimePath -Force -ErrorAction SilentlyContinue
    }
}

Stop-PortListeners -Ports @($backendPort, 4200)

Write-Host "GENEA stop command completed."
