# Builds a phone-ready debug APK whose API base points at this machine's LAN
# address (VITE_API_URL), so a phone on the same Wi-Fi can reach the backend.
# Usage:  powershell -ExecutionPolicy Bypass -File .\build-apk.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# gradlew needs a real JDK (17+; Capacitor 7 compiles with 21). The machine
# JAVA_HOME may be stale, so fall back to a JDK in ~/.jdks when needed.
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\javac.exe")) {
    $jdk = Get-ChildItem "$env:USERPROFILE\.jdks" -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path "$($_.FullName)\bin\javac.exe" } |
        Sort-Object Name -Descending | Select-Object -First 1
    if ($jdk) { $env:JAVA_HOME = $jdk.FullName; "Using JAVA_HOME=$env:JAVA_HOME" }
}

# Prefer the usual home-network ranges; fall back to any routable address.
$ips = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }
$ip = ($ips | Where-Object IPAddress -like "192.168.*" | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = ($ips | Where-Object IPAddress -like "10.*" | Select-Object -First 1).IPAddress }
if (-not $ip) { $ip = ($ips | Select-Object -First 1).IPAddress }
if (-not $ip) { throw "No LAN IPv4 address found." }

if (-not (Test-NetConnection $ip -Port 4000 -WarningAction SilentlyContinue).TcpTestSucceeded) {
    Write-Warning "Backend is not reachable on http://${ip}:4000 - the app will not load data. Start it first: cd backend && npm start"
}

$env:VITE_API_URL = "http://${ip}:4000"
"Building web assets for $env:VITE_API_URL ..."
npm run build
npx cap sync android

"Building APK ..."
Push-Location android
try { .\gradlew.bat assembleDebug } finally { Pop-Location }

$apk = Join-Path $PSScriptRoot "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) { throw "APK build failed - see errors above." }
"`nAPK ready: $apk"
"Install on a phone: adb install `"$apk`" (or copy the file over and open it)."
