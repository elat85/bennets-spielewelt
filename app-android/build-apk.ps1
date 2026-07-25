# Baut das signierte Release-APK von "Bennets Spielewelt".
# Details siehe BUILD.md
$ErrorActionPreference = "Stop"

$env:JAVA_HOME        = "C:\Users\SE\android-tools\jdk\jdk-21.0.11+10"
$env:ANDROID_HOME     = "C:\Users\SE\android-tools\sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH             = "$env:JAVA_HOME\bin;$env:PATH"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $root "android")

.\gradlew.bat assembleRelease
if ($LASTEXITCODE -ne 0) { throw "Gradle-Build fehlgeschlagen" }

$apk = Join-Path $root "android\app\build\outputs\apk\release\app-release.apk"
$ziel = Join-Path $root "BennetsSpielewelt-1.1.apk"
Copy-Item $apk $ziel -Force

Write-Output ""
Write-Output "APK fertig: $ziel"
Write-Output ("Groesse: {0:N1} MB" -f ((Get-Item $ziel).Length / 1MB))
