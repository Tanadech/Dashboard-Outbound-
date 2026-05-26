@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -Command ^
  "$dt = Get-Date -Format 'yyyy-MM-dd HH:mm';" ^
  "git add .;" ^
  "git commit -m \"update $dt\";" ^
  "git push;" ^
  "Write-Host '';" ^
  "Write-Host 'Upload complete! Web will update in 1-2 min' -ForegroundColor Green;" ^
  "Write-Host 'Press Enter to close...';" ^
  "Read-Host"
