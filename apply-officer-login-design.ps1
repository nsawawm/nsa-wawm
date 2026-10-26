$ErrorActionPreference = "Stop"

$indexPath = Join-Path $PSScriptRoot "index.html"

if (-not (Test-Path -LiteralPath $indexPath)) {
    throw "index.html was not found in: $PSScriptRoot"
}

$html = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8

$cssFile = Join-Path $PSScriptRoot "officer-login-design.css"
if (-not (Test-Path -LiteralPath $cssFile)) {
    throw "officer-login-design.css was not found in: $PSScriptRoot"
}

$start = "<!-- OFFICER LOGIN DESIGN START -->"
$end   = "<!-- OFFICER LOGIN DESIGN END -->"

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $PSScriptRoot "index.html.backup-login-design-$stamp"
Copy-Item -LiteralPath $indexPath -Destination $backup -Force

$block = Get-Content -LiteralPath $cssFile -Raw -Encoding UTF8

if ($html.Contains($start) -and $html.Contains($end)) {
    $pattern = '(?s)<!-- OFFICER LOGIN DESIGN START -->.*?<!-- OFFICER LOGIN DESIGN END -->'
    $html = [regex]::Replace(
        $html,
        $pattern,
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($m)
            $block
        },
        1
    )
}
else {
    if (-not $html.Contains("</head>")) {
        throw "index.html does not contain </head>."
    }
    $html = $html.Replace("</head>", "`r`n$block`r`n</head>")
}

Set-Content -LiteralPath $indexPath -Value $html -Encoding UTF8

Write-Host ""
Write-Host "Officer home design applied successfully." -ForegroundColor Green
Write-Host "Backup created:" -ForegroundColor Cyan
Write-Host $backup -ForegroundColor White
Write-Host ""
Write-Host "Authentication, routing, QR scanning, service selection, and existing JavaScript were left intact." -ForegroundColor Yellow
Write-Host "Refresh http://localhost:8000/index.html and test the Officer Portal." -ForegroundColor Cyan