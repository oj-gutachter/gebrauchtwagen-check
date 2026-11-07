package de.ojgutachter.device;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.CancellationSignal;
import android.os.Looper;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(
    name = "OjDevice",
    permissions = { @Permission(strings = { Manifest.permission.ACCESS_COARSE_LOCATION }, alias = "coarseLocation") }
)
public class OjDevicePlugin extends Plugin {
    private static final String ALIAS = "coarseLocation";

    @PluginMethod
    public void openSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.fromParts("package", getContext().getPackageName(), null));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void openExternal(PluginCall call) {
        String url = call.getString("url");
        if (url == null || !isAllowed(url)) {
            call.reject("Adresse nicht erlaubt.");
            return;
        }
        String lower = url.toLowerCase(Locale.ROOT);
        Intent intent = lower.startsWith("tel:")
            ? new Intent(Intent.ACTION_DIAL, Uri.parse(url))
            : new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException error) {
            call.reject("Keine App kann diese Adresse öffnen.");
        }
    }

    @PluginMethod
    public void checkLocation(PluginCall call) {
        JSObject result = new JSObject();
        result.put("location", locationState());
        call.resolve(result);
    }

    @PluginMethod
    public void requestLocation(PluginCall call) {
        if ("granted".equals(locationState())) {
            resolveState(call, "granted");
            return;
        }
        if (!"prompt".equals(locationState())) {
            resolveState(call, locationState());
            return;
        }
        requestPermissionForAlias(ALIAS, call, "locationPermissionCallback");
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        resolveState(call, locationState());
    }

    @PluginMethod
    public void getCoarseLocation(PluginCall call) {
        if (!"granted".equals(locationState())) {
            call.reject("Standort nicht erlaubt.");
            return;
        }
        LocationManager manager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        if (manager == null) {
            call.reject("Standort nicht verfügbar.");
            return;
        }
        String provider = providerFor(manager);
        if (provider == null) {
            call.reject("Standort nicht verfügbar.");
            return;
        }
        AtomicBoolean done = new AtomicBoolean(false);
        Runnable finishEmpty = () -> {
            if (done.compareAndSet(false, true)) call.reject("Standort nicht verfügbar.");
        };
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                CancellationSignal signal = new CancellationSignal();
                manager.getCurrentLocation(provider, signal, ContextCompat.getMainExecutor(getContext()), location -> deliver(call, done, location, manager, provider));
                mainHandler().postDelayed(() -> {
                    if (!done.get()) signal.cancel();
                    finishEmpty.run();
                }, 8000);
            } else {
                LocationListener listener = new LocationListener() {
                    @Override
                    public void onLocationChanged(Location location) {
                        manager.removeUpdates(this);
                        deliver(call, done, location, manager, provider);
                    }
                };
                manager.requestSingleUpdate(provider, listener, Looper.getMainLooper());
                mainHandler().postDelayed(() -> {
                    manager.removeUpdates(listener);
                    finishEmpty.run();
                }, 8000);
            }
        } catch (SecurityException error) {
            call.reject("Standort nicht erlaubt.");
        }
    }

    private void deliver(PluginCall call, AtomicBoolean done, Location location, LocationManager manager, String provider) {
        if (location == null) {
            try { location = manager.getLastKnownLocation(provider); } catch (SecurityException ignored) { location = null; }
        }
        if (location == null || !done.compareAndSet(false, true)) return;
        JSObject result = new JSObject();
        result.put("latitude", location.getLatitude());
        result.put("longitude", location.getLongitude());
        result.put("accuracy", location.hasAccuracy() ? location.getAccuracy() : -1);
        call.resolve(result);
    }

    private String providerFor(LocationManager manager) {
        if (Build.VERSION.SDK_INT >= 31 && manager.getAllProviders().contains(LocationManager.FUSED_PROVIDER)) {
            return LocationManager.FUSED_PROVIDER;
        }
        if (manager.getAllProviders().contains(LocationManager.NETWORK_PROVIDER)) return LocationManager.NETWORK_PROVIDER;
        if (manager.getAllProviders().contains(LocationManager.PASSIVE_PROVIDER)) return LocationManager.PASSIVE_PROVIDER;
        return null;
    }

    private android.os.Handler mainHandler() {
        return new android.os.Handler(Looper.getMainLooper());
    }

    private void resolveState(PluginCall call, String state) {
        JSObject result = new JSObject();
        result.put("location", state);
        call.resolve(result);
    }

    private String locationState() {
        Context context = getContext();
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            return "granted";
        }
        PermissionState state = getPermissionState(ALIAS);
        if (state == PermissionState.DENIED) return "denied";
        if (state == PermissionState.PROMPT_WITH_RATIONALE) return "prompt-with-rationale";
        return "prompt";
    }

    private boolean isAllowed(String url) {
        String lower = url.toLowerCase(Locale.ROOT);
        return lower.startsWith("https://") || lower.startsWith("http://") || lower.startsWith("tel:") || lower.startsWith("geo:") || lower.startsWith("maps:");
    }
}
