import Capacitor
import CoreLocation
import UIKit
import WebKit

@objc(OjDevicePlugin)
public class OjDevicePlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate, WKNavigationDelegate {
    public let identifier = "OjDevicePlugin"
    public let jsName = "OjDevice"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openExternal", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkLocation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestLocation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCoarseLocation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "printHtml", returnType: CAPPluginReturnPromise)
    ]

    // Capacitor 8 runs plugin methods on a background queue with no run loop.
    // CLLocationManager delivers callbacks on the thread that created it, and
    // reading authorizationStatus off that thread can hang the call forever.
    // The manager is therefore created and used only on the main thread.
    private var manager: CLLocationManager?
    private var retainedCalls: [CAPPluginCall] = []
    private var permissionCall: CAPPluginCall?
    private var locationCall: CAPPluginCall?
    private var locationTimeout: DispatchWorkItem?
    private var printWebView: WKWebView?
    private var printCall: CAPPluginCall?
    private var printJobName = "OJ Gebrauchtwagen-Check"
    private var printStarted = false

    public override func load() {
        DispatchQueue.main.async { [weak self] in
            _ = self?.locationManagerOnMain()
        }
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
        retain(call)
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            let name = self.statusName()
            self.release(call)
            call.resolve(["location": name])
        }
    }

    @objc func requestLocation(_ call: CAPPluginCall) {
        retain(call)
        let servicesOn = CLLocationManager.locationServicesEnabled()
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            let name = self.statusName()
            if name != "prompt" {
                self.release(call)
                call.resolve(["location": name])
                return
            }
            if !servicesOn {
                self.release(call)
                call.resolve(["location": "denied"])
                return
            }
            self.permissionCall = call
            self.locationManagerOnMain().requestWhenInUseAuthorization()
        }
    }

    @objc func getCoarseLocation(_ call: CAPPluginCall) {
        retain(call)
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            guard self.statusName() == "granted" else {
                self.release(call)
                call.reject("Standort nicht erlaubt.")
                return
            }
            self.locationCall = call
            self.armLocationTimeout(for: call)
            self.locationManagerOnMain().requestLocation()
        }
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        guard let call = permissionCall else { return }
        let name = statusName()
        if name == "prompt" { return }
        permissionCall = nil
        release(call)
        call.resolve(["location": name])
    }

    public func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        locationManagerDidChangeAuthorization(manager)
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let call = locationCall else { return }
        guard let location = locations.last, location.horizontalAccuracy >= 0 else {
            finishLocation(call) { call.reject("Standort nicht verfügbar.") }
            return
        }
        finishLocation(call) {
            call.resolve([
                "latitude": location.coordinate.latitude,
                "longitude": location.coordinate.longitude,
                "accuracy": location.horizontalAccuracy
            ])
        }
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        guard let call = locationCall else { return }
        let denied = (error as NSError).code == CLError.denied.rawValue
        finishLocation(call) {
            call.reject(denied ? "Standort nicht erlaubt." : "Standort nicht verfügbar.")
        }
    }

    private func locationManagerOnMain() -> CLLocationManager {
        if let manager { return manager }
        let created = CLLocationManager()
        created.delegate = self
        created.desiredAccuracy = kCLLocationAccuracyKilometer
        manager = created
        return created
    }

    private func armLocationTimeout(for call: CAPPluginCall) {
        locationTimeout?.cancel()
        let work = DispatchWorkItem { [weak self] in
            guard let self, let pending = self.locationCall, pending === call else { return }
            self.finishLocation(call) { call.reject("Standort nicht verfügbar.") }
        }
        locationTimeout = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 12, execute: work)
    }

    private func finishLocation(_ call: CAPPluginCall, _ body: () -> Void) {
        locationTimeout?.cancel()
        locationTimeout = nil
        if locationCall === call { locationCall = nil }
        release(call)
        body()
    }

    private func retain(_ call: CAPPluginCall) {
        retainedCalls.append(call)
    }

    private func release(_ call: CAPPluginCall) {
        retainedCalls.removeAll { $0 === call }
    }

    private func currentStatus() -> CLAuthorizationStatus {
        if #available(iOS 14.0, *) {
            return locationManagerOnMain().authorizationStatus
        }
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

    @objc func printHtml(_ call: CAPPluginCall) {
        guard let html = call.getString("html"), !html.isEmpty else {
            call.reject("Nichts zu drucken.")
            return
        }
        let job = call.getString("jobName")?.trimmingCharacters(in: .whitespacesAndNewlines)
        retain(call)
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.beginPrint(html: html, jobName: (job?.isEmpty == false ? job! : "OJ Gebrauchtwagen-Check"), call: call)
        }
    }

    private func beginPrint(html: String, jobName: String, call: CAPPluginCall) {
        cleanupPrintView()
        printStarted = false
        printCall = call
        printJobName = jobName
        guard let host = bridge?.viewController?.view else {
            finishPrint(call, message: "Druck nicht verfügbar.")
            return
        }
        let web = WKWebView(frame: CGRect(x: -2400, y: 0, width: 595, height: 842))
        web.navigationDelegate = self
        web.isUserInteractionEnabled = false
        web.backgroundColor = .white
        host.addSubview(web)
        printWebView = web
        web.loadHTMLString(html, baseURL: bridge?.webView?.url)
        DispatchQueue.main.asyncAfter(deadline: .now() + 8) { [weak self] in
            guard let self, let pending = self.printCall, pending === call, !self.printStarted else { return }
            self.finishPrint(call, message: "Druck nicht verfügbar.")
        }
    }

    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard webView === printWebView, let call = printCall, !printStarted else { return }
        printStarted = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { [weak self] in
            self?.presentPreparedPrint(call)
        }
    }

    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        guard webView === printWebView, let call = printCall else { return }
        finishPrint(call, message: "Druck nicht verfügbar.")
    }

    public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        guard webView === printWebView, let call = printCall else { return }
        finishPrint(call, message: "Druck nicht verfügbar.")
    }

    private func presentPreparedPrint(_ call: CAPPluginCall) {
        guard let webView = printWebView else {
            finishPrint(call, message: "Druck nicht verfügbar.")
            return
        }
        let controller = UIPrintInteractionController.shared
        let info = UIPrintInfo(dictionary: nil)
        info.outputType = .general
        info.jobName = printJobName
        info.orientation = .portrait
        controller.printInfo = info
        let formatter = webView.viewPrintFormatter()
        formatter.perPageContentInsets = .zero
        let renderer = UIPrintPageRenderer()
        renderer.addPrintFormatter(formatter, startingAtPageAt: 0)
        let paper = CGRect(x: 0, y: 0, width: 595.2, height: 841.8)
        let printable = paper.inset(by: UIEdgeInsets(top: 42, left: 42, bottom: 62, right: 42))
        renderer.setValue(NSValue(cgRect: paper), forKey: "paperRect")
        renderer.setValue(NSValue(cgRect: printable), forKey: "printableRect")
        if renderer.numberOfPages > 0 {
            controller.printPageRenderer = renderer
            let presented: Bool
            if UIDevice.current.userInterfaceIdiom == .pad, let view = bridge?.viewController?.view {
                presented = controller.present(from: view.bounds, in: view, animated: true) { _, _, error in
                    self.finishPrint(call, message: error == nil ? nil : "Druck nicht verfügbar.")
                }
            } else {
                presented = controller.present(animated: true) { _, _, error in
                    self.finishPrint(call, message: error == nil ? nil : "Druck nicht verfügbar.")
                }
            }
            if presented { return }
        }
        sharePrintPdf(from: webView, call: call)
    }

    private func sharePrintPdf(from webView: WKWebView, call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            let config = WKPDFConfiguration()
            let size = webView.scrollView.contentSize
            if size.width > 1, size.height > 1 {
                config.rect = CGRect(origin: .zero, size: size)
            }
            webView.createPDF(configuration: config) { [weak self] result in
                DispatchQueue.main.async {
                    guard let self else { return }
                    switch result {
                    case .success(let data) where !data.isEmpty:
                        self.presentShare(data: data, call: call)
                    default:
                        self.finishPrint(call, message: "Druck nicht verfügbar.")
                    }
                }
            }
        } else {
            finishPrint(call, message: "Druck nicht verfügbar.")
        }
    }

    private func presentShare(data: Data, call: CAPPluginCall) {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("OJ-Gebrauchtwagen-Check.pdf")
        do {
            try data.write(to: url, options: .atomic)
        } catch {
            finishPrint(call, message: "Druck nicht verfügbar.")
            return
        }
        let activity = UIActivityViewController(activityItems: [url], applicationActivities: nil)
        if let pop = activity.popoverPresentationController, let view = bridge?.viewController?.view {
            pop.sourceView = view
            pop.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.maxY - 20, width: 1, height: 1)
        }
        activity.completionWithItemsHandler = { [weak self] _, _, _, _ in
            self?.finishPrint(call, message: nil)
        }
        guard let presenter = bridge?.viewController else {
            finishPrint(call, message: "Druck nicht verfügbar.")
            return
        }
        presenter.present(activity, animated: true)
    }

    private func finishPrint(_ call: CAPPluginCall, message: String?) {
        guard printCall === call else { return }
        printCall = nil
        printStarted = true
        UIPrintInteractionController.shared.printPageRenderer = nil
        release(call)
        if let message = message {
            call.reject(message)
        } else {
            call.resolve()
        }
        let web = printWebView
        printWebView = nil
        // The print spooler can still draw the page after the dialog closes.
        DispatchQueue.main.asyncAfter(deadline: .now() + 20) {
            web?.navigationDelegate = nil
            web?.removeFromSuperview()
        }
    }

    private func cleanupPrintView() {
        printWebView?.navigationDelegate = nil
        printWebView?.removeFromSuperview()
        printWebView = nil
    }
}
