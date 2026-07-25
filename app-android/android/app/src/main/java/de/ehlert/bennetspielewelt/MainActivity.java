package de.ehlert.bennetspielewelt;

import android.os.Bundle;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * Kiosk-artiges Vollbild: Status- und Navigationsleiste sind weg, damit die
 * Spielflaeche den ganzen Schirm bekommt und Bennet nicht versehentlich
 * rausnavigiert. Wischen von der Kante zeigt die Leisten kurz an
 * (BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE) und blendet sie wieder aus.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Nach Dialogen, App-Wechsel oder Kanten-Wisch wieder zumachen.
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        // App zeichnet bis unter die Leisten -> die WebView bekommt echte
        // safe-area-insets, die das CSS per env(safe-area-inset-*) auswertet.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
