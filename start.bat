@echo off
rem Starts RectoVerso on Windows: installs or updates what is needed, starts the
rem backend and the site in two windows, then opens the site in the browser.
rem Double-click this file. To stop the application, close the two windows.
setlocal
cd /d "%~dp0"

where py >nul 2>&1 || (
  echo Python is missing: install Python 3.11 or later from python.org.
  goto :failed
)
where npm >nul 2>&1 || (
  echo Node.js is missing: install the LTS version from nodejs.org, then restart the computer.
  goto :failed
)

if not exist "backend\.venv\Scripts\python.exe" (
  echo First start: creating the Python environment...
  py -3 -m venv backend\.venv || goto :failed
)
echo Checking the backend dependencies...
backend\.venv\Scripts\python -m pip install --quiet --disable-pip-version-check -r backend\requirements-dev.txt || goto :failed

echo Checking the site dependencies...
pushd frontend
call npm install --silent --no-fund --no-audit
if errorlevel 1 (
  popd
  goto :failed
)
popd

start "RectoVerso backend" /d "%~dp0backend" cmd /k .venv\Scripts\python -m uvicorn app.main:app --reload
start "RectoVerso site" /d "%~dp0frontend" cmd /k npm run dev

echo RectoVerso is starting: the site opens in the browser in a few seconds.
timeout /t 6 /nobreak >nul
if not defined RECTOVERSO_NO_BROWSER start "" http://localhost:5173
exit /b 0

:failed
echo.
echo RectoVerso could not start: see the message above.
pause
exit /b 1
