# CWYT26 추천코드 전환 데이터를 Supabase에서 가져와 promo-data.js로 갱신
# 사용법: PowerShell에서 ./refresh-promo.ps1

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

# 부모 폴더의 .mcp.json 에서 토큰 읽기
$mcpPath = Join-Path (Split-Path $PSScriptRoot -Parent) ".mcp.json"
if (-not (Test-Path $mcpPath)) {
    Write-Host "ERROR: .mcp.json not found at $mcpPath" -ForegroundColor Red
    exit 1
}
$mcp = Get-Content -Raw -Path $mcpPath | ConvertFrom-Json
$token = $mcp.mcpServers.supabase.args[3]

$projectRef = "snzrcpgggjkugeadyxll"
$base = "https://api.supabase.com/v1/projects/$projectRef/database/query"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Invoke-SupabaseQuery($body) {
    $tmp = [System.IO.Path]::GetTempFileName()
    [System.IO.File]::WriteAllText($tmp, $body, $utf8NoBom)
    try {
        return & curl.exe -s -X POST -H "Authorization: Bearer $token" -H "Content-Type: application/json" $base "--data-binary" "@$tmp"
    } finally {
        Remove-Item $tmp -ErrorAction SilentlyContinue
    }
}

# 1) 코드 메타
$metaQuery = '{"query":"SELECT pc.code, pc.individual_discount_rate, pc.corp_discount_rate, pc.status, p.business_name AS partner FROM promotion_codes pc LEFT JOIN partners p ON p.id = pc.partner_id WHERE pc.code = ''CWYT26'' LIMIT 1;"}'

# 2) 일별 사용 (계약/결제)
$dailyQuery = '{"query":"SELECT (c.created_at AT TIME ZONE ''Asia/Seoul'')::date::text AS day, COUNT(*) AS contracts, COUNT(c.initial_paid_at) AS paid FROM contracts c JOIN promotion_codes pc ON pc.id = c.promotion_code_id WHERE pc.code = ''CWYT26'' GROUP BY day ORDER BY day;"}'

Write-Host "Fetching CWYT26 metadata..." -ForegroundColor Cyan
$metaRaw = Invoke-SupabaseQuery $metaQuery
Write-Host "Fetching daily usage..." -ForegroundColor Cyan
$dailyRaw = Invoke-SupabaseQuery $dailyQuery

if ($metaRaw -match '^\s*\{\s*"message"') { Write-Host "ERROR: $metaRaw" -ForegroundColor Red; exit 1 }
if ($dailyRaw -match '^\s*\{\s*"message"') { Write-Host "ERROR: $dailyRaw" -ForegroundColor Red; exit 1 }

$meta = ($metaRaw | ConvertFrom-Json)[0]
$daily = $dailyRaw | ConvertFrom-Json

$totalContracts = ($daily | Measure-Object -Property contracts -Sum).Sum
$totalPaid = ($daily | Measure-Object -Property paid -Sum).Sum
$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$content = "// CWYT26 YouTube 추천코드 전환 데이터 (Supabase live)`n" +
           "// refresh: ./refresh-promo.ps1`n" +
           "window.PROMO_CWYT26 = {`n" +
           "  fetchedAt: `"$now`",`n" +
           "  code: `"$($meta.code)`",`n" +
           "  partner: `"$($meta.partner)`",`n" +
           "  status: `"$($meta.status)`",`n" +
           "  discount: { individual: $($meta.individual_discount_rate), corp: $($meta.corp_discount_rate) },`n" +
           "  total: { contracts: $totalContracts, paid: $totalPaid },`n" +
           "  daily: $dailyRaw`n" +
           "};`n"

$outPath = Join-Path $PSScriptRoot "promo-data.js"
[System.IO.File]::WriteAllText($outPath, $content, $utf8NoBom)

Write-Host ""
Write-Host "✅ promo-data.js refreshed" -ForegroundColor Green
Write-Host "   Time:     $now"
Write-Host "   Code:     $($meta.code) ($($meta.partner))"
Write-Host "   Total:    $totalContracts contracts / $totalPaid paid"
Write-Host "   Days:     $($daily.Count) days of data"
