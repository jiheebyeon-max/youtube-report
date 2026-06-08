# Amplitude Dashboard REST API로 referrer = youtube.com 유저 수 가져와 utm-data.js 갱신
# 사용법: PowerShell에서 ./refresh-utm.ps1
# 작업 스케줄러 등록: ./register-utm-task.ps1

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

$logDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

$timestamp = Get-Date -Format "yyyy-MM-dd"
$logFile = Join-Path $logDir "utm-$timestamp.log"

$startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
"[$startedAt] === refresh-utm start ===" | Tee-Object -FilePath $logFile -Append

try {
    & node fetch-amplitude-referrer.js 2>&1 | Tee-Object -FilePath $logFile -Append
    if ($LASTEXITCODE -ne 0) {
        throw "node fetch-amplitude-referrer.js exited with code $LASTEXITCODE"
    }
    $finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "[$finishedAt] === refresh-utm done ===" | Tee-Object -FilePath $logFile -Append
} catch {
    "[ERROR] $($_.Exception.Message)" | Tee-Object -FilePath $logFile -Append
    exit 1
}
