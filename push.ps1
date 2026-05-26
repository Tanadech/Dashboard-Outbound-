$host.UI.RawUI.WindowTitle = "Push Update -> GitHub Pages"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "  =============================="
Write-Host "   Dashboard Outbound - Deploy  "
Write-Host "  =============================="
Write-Host ""

git add index.html components\ lib\ scripts\ styles\

$date = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Update $date"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  Pushing to GitHub..." -ForegroundColor Cyan
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  Done! GitHub Pages will update in ~1-2 min." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  Push failed. Check internet / credentials." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "  Nothing new to commit." -ForegroundColor Yellow
}

Write-Host ""
