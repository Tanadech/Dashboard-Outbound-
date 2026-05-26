@echo off
cd /d "%~dp0"

:: ============================================================
::  แก้ไข path ไฟล์ Excel ด้านล่างนี้ครั้งเดียว แล้วใช้ได้เลย
:: ============================================================
SET EXCEL_PATH=C:\Users\WIN11\Desktop\Work\09 Report Outbound 008\DATA PT\Transaction Outbound Report.xlsx

:: ============================================================

echo.
echo ===== R008 Dashboard — อัปเดตข้อมูล =====
echo.

:: ติดตั้ง dependencies ถ้าครั้งแรก
if not exist node_modules (
  echo กำลังติดตั้ง dependencies ครั้งแรก...
  npm install --silent
  echo ติดตั้งเสร็จ
  echo.
)

:: แปลง Excel → data/data.json
powershell -ExecutionPolicy Bypass -Command ^
  "node convert.js '%EXCEL_PATH%'; if ($LASTEXITCODE -ne 0) { Write-Host 'แปลงไฟล์ไม่สำเร็จ กด Enter เพื่อปิด' -ForegroundColor Red; Read-Host; exit 1 }"

if errorlevel 1 goto :end

echo.
echo กำลัง push ขึ้น GitHub...
powershell -ExecutionPolicy Bypass -Command ^
  "$dt = Get-Date -Format 'yyyy-MM-dd HH:mm';" ^
  "git add data/data.json;" ^
  "git commit -m \"data: update $dt\";" ^
  "git push;" ^
  "Write-Host '';" ^
  "Write-Host 'อัปเดตสำเร็จ! เว็บจะอัปเดตใน 1-2 นาที' -ForegroundColor Green;" ^
  "Write-Host 'กด Enter เพื่อปิด...';" ^
  "Read-Host"

:end
