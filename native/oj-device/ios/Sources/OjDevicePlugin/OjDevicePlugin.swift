import Capacitor
import CoreLocation
import UIKit

@objc(OjDevicePlugin)
public class OjDevicePlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "OjDevicePlugin"
    public let jsName = "OjDevice"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openExternal", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkLocation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestLocation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCoarseLocation", returnType: CAPPluginReturnPromise)
    ]

    private let manager = CLLocationManager()
    private var permissionCall: CAPPluginCall?
    private var locationCall: CAPPluginCall?

    public override func load() {
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyKilometer
    }

    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let url = URL(string: UIApplication.openSettingsURLString) else {
                call.reject("Einstellungen konnten nicht geöffnet werden.")
                return
            }
            UIApplication.shared.open(url, options: [:]) { ok in
                if ok { call.resolve() } else { call.reject("Einstellungen konnten nicht geöffnet werden.") }
            }
        }
    }

    @objc func openExternal(_ call: CAPPluginCall) {
        guard let raw = call.getString("url"), let url = URL(string: raw), let scheme = url.scheme?.lowercased(),
              ["http", "https", "tel", "geo", "maps"].contains(scheme) else {
            call.reject("Adresse nicht erlaubt.")
            return
        }
        DispatchQueue.main.async {
            UIApplication.shared.open(url, options: [:]) { ok in
                if ok { call.resolve() } else { call.reject("Keine App kann diese Adresse öffnen.") }
            }
        }
    }

    @objc func checkLocation(_ call: CAPPluginCall) {
        call.resolve(["location": statusName()])
    }

    @objc func requestLocation(_ call: CAPPluginCall) {
        let name = statusName()
        if name != "prompt" {
            call.resolve(["location": name])
            return
        }
        permissionCall = call
        DispatchQueue.main.async {
            self.manager.requestWhenInUseAuthorization()
        }
    }

    @objc func getCoarseLocation(_ call: CAPPluginCall) {
        let name = statusName()
        guard name == "granted" else {
            call.reject("Standort nicht erlaubt.")
            return
        }
        locationCall = call
        DispatchQueue.main.async {
            self.manager.requestLocation()
        }
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        guard let call = permissionCall else { return }
        let name = statusName()
        if name == "prompt" { return }
        permissionCall = nil
        call.resolve(["location": name])
    }

    public func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        locationManagerDidChangeAuthorization(manager)
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let call = locationCall else { return }
        locationCall = nil
        guard let location = locations.last else {
            call.reject("Standort nicht verfügbar.")
            return
        }
        call.resolve([
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy
        ])
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        guard let call = locationCall else { return }
        locationCall = nil
        call.reject("Standort nicht verfügbar.")
    }

    private func currentStatus() -> CLAuthorizationStatus {
        if #available(iOS 14.0, *) { return manager.authorizationStatus }
        return CLLocationManager.authorizationStatus()
    }

    private func statusName() -> String {
        switch currentStatus() {
        case .authorizedAlways, .authorizedWhenInUse:
            return "granted"
        case .denied:
            return "denied"
        case .restricted:
            return "restricted"
        case .notDetermined:
            return "prompt"
        @unknown default:
            return "prompt"
        }
    }
}
