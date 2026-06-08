# Windows 작업 스케줄러에 매일 아침 10시 1회 자동 갱신 등록
# 한 번만 실행: PowerShell에서 ./register-youtube-task.ps1
# 해제: Unregister-ScheduledTask -TaskName "YouTube Report Refresh" -Confirm:$false

$ErrorActionPreference = "Stop"

$taskName = "YouTube Report Refresh"
$scriptPath = Join-Path $PSScriptRoot "refresh-youtube.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: refresh-youtube.ps1 not found at $scriptPath" -ForegroundColor Red
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

$trigger = New-ScheduledTaskTrigger -Daily -At "10:00"

# 노트북이 절전 모드여도 깨워서 실행, 배터리에서도 실행
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
    -Description "코워크시티 YouTube 채널 통계를 매일 아침 10:00에 자동 수집해서 대시보드 갱신" | Out-Null

Write-Host ""
Write-Host "✅ 작업 등록 완료: '$taskName'" -ForegroundColor Green
Write-Host "   매일 아침 10:00 자동 실행 (1회)"
Write-Host "   스크립트: $scriptPath"
Write-Host ""
Write-Host "확인:    Get-ScheduledTask -TaskName '$taskName'"
Write-Host "수동 실행: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "해제:    Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
