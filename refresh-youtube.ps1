# YouTube Data API로 채널 통계 + 최근 영상 가져와 youtube-data.js 갱신
# 사용법: PowerShell에서 ./refresh-youtube.ps1
# 작업 스케줄러 등록: register-youtube-task.ps1 (옆 파일) 참고

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

$logDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

$timestamp = Get-Date -Format "yyyy-MM-dd"
$logFile = Join-Path $logDir "youtube-$timestamp.log"

$startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
"[$startedAt] === refresh-youtube start ===" | Tee-Object -FilePath $logFile -Append

try {
    & node fetch-youtube.js 2>&1 | Tee-Object -FilePath $logFile -Append
    if ($LASTEXITCODE -ne 0) {
        throw "node fetch-youtube.js exited with code $LASTEXITCODE"
    }
    $finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "[$finishedAt] === refresh-youtube done ===" | Tee-Object -FilePath $logFile -Append
} catch {
    $err = $_.Exception.Message
    "[ERROR] $err" | Tee-Object -FilePath $logFile -Append
    exit 1
}
