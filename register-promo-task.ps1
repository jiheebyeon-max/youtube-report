# Windows 작업 스케줄러에 매일 10/12/14/16/18시 promo-data.js 자동 갱신 등록
# 한 번만 실행: PowerShell에서 ./register-promo-task.ps1
# 해제: Unregister-ScheduledTask -TaskName "Promo Code Refresh" -Confirm:$false

$ErrorActionPreference = "Stop"

$taskName = "Promo Code Refresh"
$scriptPath = Join-Path $PSScriptRoot "refresh-promo.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: refresh-promo.ps1 not found at $scriptPath" -ForegroundColor Red
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

$trigger = @(
    New-ScheduledTaskTrigger -Daily -At "10:00"
    New-ScheduledTaskTrigger -Daily -At "12:00"
    New-ScheduledTaskTrigger -Daily -At "14:00"
    New-ScheduledTaskTrigger -Daily -At "16:00"
    New-ScheduledTaskTrigger -Daily -At "18:00"
)

# 절전 모드여도 깨워 실행, 배터리에서도 실행
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
    -Description "코워크시티 CWYT26 추천코드 사용/결제 데이터를 매일 10:00에 Supabase에서 자동 수집해서 promo-data.js 갱신" | Out-Null

Write-Host ""
Write-Host "✅ 작업 등록 완료: '$taskName'" -ForegroundColor Green
Write-Host "   매일 10/12/14/16/18시 자동 실행 (총 5회)"
Write-Host "   스크립트: $scriptPath"
Write-Host ""
Write-Host "확인:    Get-ScheduledTask -TaskName '$taskName'"
Write-Host "수동 실행: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "해제:    Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
