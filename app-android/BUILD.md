# Android-APK bauen

Capacitor-Wrapper um die Live-PWA (`server.url` in `capacitor.config.json` zeigt auf
https://elat85.github.io/bennets-spielewelt/). Die App lädt also immer die aktuelle
Web-Version — ein Web-Update braucht **kein** neues APK.

## Toolchain (einmalig, liegt außerhalb des Repos)

| Was | Pfad |
|---|---|
| JDK 21 (Temurin) | `C:\Users\SE\android-tools\jdk\jdk-21.0.11+10` |
| Android SDK | `C:\Users\SE\android-tools\sdk` (platform-tools, android-34/36, build-tools 34/35) |
| Release-Keystore | `C:\Users\SE\android-tools\bennet-release.jks` (Alias `bennet`, gültig bis 2053) |
| Passwörter | `android\keystore.properties` (gitignored) |

**Wichtig:** JDK 17 reicht für Capacitor 8 **nicht** — der Build bricht mit
`invalid source release: 21` ab.

**Keystore sichern!** Ohne `bennet-release.jks` + Passwort lässt sich später kein
Update installieren (Android verweigert APKs mit anderer Signatur) und keine
Play-Store-Veröffentlichung fortführen.

## Bauen

```
powershell -ExecutionPolicy Bypass -File app-android\build-apk.ps1
```

Oder von Hand aus `app-android\android`:

```
$env:JAVA_HOME="C:\Users\SE\android-tools\jdk\jdk-21.0.11+10"
$env:ANDROID_HOME="C:\Users\SE\android-tools\sdk"
.\gradlew.bat assembleRelease
```

Ergebnis: `android\app\build\outputs\apk\release\app-release.apk` (~5 MB).

## Aufs Tablet

- **Per USB:** `C:\Users\SE\android-tools\sdk\platform-tools\adb.exe install -r <apk>`
  (Entwickleroptionen + USB-Debugging auf dem Tablet aktivieren).
- **Per Download:** APK als GitHub-Release hochladen, auf dem Tablet im Browser laden,
  „Installation aus unbekannten Quellen" für den Browser erlauben.

Danach in **Samsung Kids → Eltern-Bereich → Apps hinzufügen** freischalten.

## Neue APK-Version

`versionCode` **und** `versionName` in `android\app\build.gradle` hochzählen, sonst
verweigert Android das Update. Nur nötig, wenn sich am nativen Wrapper etwas ändert
(Icon, Name, Orientierung) — nicht bei Web-Updates.

## Angepasst gegenüber `npx cap add android`

- `AndroidManifest.xml`: `screenOrientation="sensorLandscape"`
- `styles.xml`: Vollbild (`windowFullscreen`) + `windowLayoutInDisplayCutoutMode=shortEdges`
- Launcher-Icons + Splash aus `icons/icon-512.png` generiert (alle Dichten, adaptive Icon,
  Hintergrundfarbe `#40C9EB`)
- `app\build.gradle`: Release-Signing über `keystore.properties`
