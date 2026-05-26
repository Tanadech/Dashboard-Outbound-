[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$host.UI.RawUI.WindowTitle = "Push Update -> GitHub Pages"

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "  =============================="
Write-Host "   Dashboard Outbound - Deploy  "
Write-Host "  =============================="
Write-Host ""

git add index.html components\ lib\ scripts\ styles\

$date = Get-Date -Format "yyyy-MM-dd HH:mm"
$msg  = "Update $date"

git commit -m $msg

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  กำลัง push ขึ้น GitHub..." -ForegroundColor Cyan
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  สำเร็จ! GitHub Pages จะอัพเดทใน 1-2 นาที" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  Push ไม่ได้ - ตรวจสอบ internet หรือ credentials" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "  ไม่มีการเปลี่ยนแปลง หรือ commit ไม่ได้" -ForegroundColor Yellow
}

Write-Host ""
