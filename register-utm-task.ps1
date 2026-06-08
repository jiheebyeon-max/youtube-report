# Windows 작업 스케줄러에 매일 10/14/18시 utm-data.js 자동 갱신 등록
# 한 번만 실행: PowerShell에서 ./register-utm-task.ps1
# 해제: Unregister-ScheduledTask -TaskName "UTM Referrer Refresh" -Confirm:$false

$ErrorActionPreference = "Stop"

$taskName = "UTM Referrer Refresh"
$scriptPath = Join-Path $PSScriptRoot "refresh-utm.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: refresh-utm.ps1 not found at $scriptPath" -ForegroundColor Red
    exit 1
}

# 기존 동일 이름 작업 있으면 제거
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" `
    -WorkingDirectory $PSScriptRoot

# referrer 데이터는 천천히 누적됨 → 하루 3회면 충분 (promo는 5회)
$trigger = @(
    New-ScheduledTaskTrigger -Daily -At "10:00"
    New-ScheduledTaskTrigger -Daily -At "14:00"
    New-ScheduledTaskTrigger -Daily -At "18:00"
)

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -WakeToRun `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Amplitude의 gp:initial_referring_domain = youtube.com 기반 유입 유저 수를 매일 자동 수집해서 utm-data.js 갱신" | Out-Null

Write-Host ""
Write-Host "✅ 작업 등록 완료: '$taskName'" -ForegroundColor Green
Write-Host "   매일 10:00 / 14:00 / 18:00 자동 실행 (3회)"
Write-Host "   스크립트: $scriptPath"
Write-Host ""
Write-Host "확인:    Get-ScheduledTask -TaskName '$taskName'"
Write-Host "수동 실행: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "해제:    Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
