@echo off
chcp 65001 >nul
title Push Update → GitHub Pages

cd /d "%~dp0"

echo.
echo  ==============================
echo   Dashboard Outbound — Deploy
echo  ==============================
echo.

git add index.html components\ lib\ scripts\ styles\

for /f "tokens=1-6 delims=/: " %%a in ("%date% %time%") do (
  set "MSG=Update %%c-%%b-%%a %%d:%%e"
)

git commit -m "%MSG%"

if %errorlevel% == 0 (
  echo.
  echo  กำลัง push ขึ้น GitHub...
  git push origin main
  if %errorlevel% == 0 (
    echo.
    echo  สำเร็จ! GitHub Pages จะอัพเดทใน 1-2 นาที
  ) else (
    echo.
    echo  Push ไม่ได้ — ตรวจสอบ internet หรือ credentials
  )
) else (
  echo.
  echo  ไม่มีการเปลี่ยนแปลง หรือ commit ไม่ได้
)

echo.
pause
