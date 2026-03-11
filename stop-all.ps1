$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
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
            Write-Host "Stopped $Label process (PID $ProcessId)."
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

            foreach ($owningProcessId in $pids) {
                Stop-ProcessSafely -ProcessId $owningProcessId -Label "listener on port $port"
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

        Stop-ProcessSafely -ProcessId $clientShellPid -Label "client shell"
        Stop-ProcessSafely -ProcessId $serverShellPid -Label "server shell"
        Stop-ProcessSafely -ProcessId $mongoShellPid -Label "mongo shell"
    } catch {
        Write-Warning "Could not parse $runtimePath, fallback by killing listeners on known ports."
    } finally {
        Remove-Item -Path $runtimePath -Force -ErrorAction SilentlyContinue
    }
}

Stop-PortListeners -Ports @($backendPort, 4200)

Write-Host "GENEA stop command completed."
