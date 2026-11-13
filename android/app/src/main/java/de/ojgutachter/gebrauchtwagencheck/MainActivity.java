package de.ojgutachter.gebrauchtwagencheck;

import android.content.res.Configuration;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        applySystemFontScale();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applySystemFontScale();
    }

    /** WebView text does not follow the system font size unless text zoom is set. */
    private void applySystemFontScale() {
        if (getBridge() == null) return;
        WebView webView = getBridge().getWebView();
        if (webView == null) return;
        float scale = getResources().getConfiguration().fontScale;
        if (scale <= 0f) scale = 1f;
        webView.getSettings().setTextZoom(Math.round(scale * 100f));
    }
}
