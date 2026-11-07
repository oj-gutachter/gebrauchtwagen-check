/* Native shell only. In the browser this file sets OjNativeCalendar.isNative to false and returns.
   It does not change calendar downloads, checklist items, backup files, or reminders. */
(function () {
  'use strict';
  function detectNative() {
    try {
      return !!(window.Capacitor && typeof Capacitor.isNativePlatform === 'function' && Capacitor.isNativePlatform());
    } catch (error) {
      return false;
    }
  }
  if (!detectNative()) {
    window.OjNativeCalendar = {isNative: false};
    return;
  }

  // Published office only. Address and numbers match app.js CONTACT and https://www.oj-gutachter.de
  // (Büro: Mo–Fr 09:00–18:00, Sa 10:00–14:00, Notdienst 0176 21468719). No other office is listed.
  // Coordinates: OpenStreetMap Nominatim, 2026-11-07, OSM way 54848767,
  // "62, Meißener Straße, 44139 Dortmund" → 51.5018362, 7.4694031. Used only on device to compute distance.
  const OFFICE = {lat: 51.5018362, lon: 7.4694031};
  const DISMISS_KEY = 'oj-gebrauchtwagen-check.expertHint.dismissed.v1';
  const NEARBY_QUERY = 'Kfz-Sachverständiger';
  const BATTERY_TESTS = [
    {id: 'aviloo', key: 'battery.testAviloo', href: 'https://aviloo.com/de/aviloo-private'},
    {id: 'tuev', key: 'battery.testTuev', href: 'https://www.tuev-nord.de/de/dienstleistungen/pruefung-und-gutachten/onboard-car-diagnosis/fahrzeugdiagnose-fuer-privatkunden/batteriecheck-fuer-privatkunden/'},
    {id: 'dekra', key: 'battery.testDekra', href: 'https://www.dekra.de/de/batterie-schnelltest/'}
  ];
  const plugins = {};
  let pendingCalendarItem = null;
  let sessionDistanceKm = null;
  let locationBusy = false;

  function plugin(name) {
    if (plugins[name]) return plugins[name];
    const ready = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins[name];
    if (ready) {
      plugins[name] = Capacitor.Plugins[name];
      return plugins[name];
    }
    if (window.Capacitor && typeof Capacitor.registerPlugin === 'function') {
      plugins[name] = Capacitor.registerPlugin(name);
      return plugins[name];
    }
    throw new Error('Plugin fehlt: ' + name);
  }
  function dismissed() {
    try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch (error) { return false; }
  }
  function platform() {
    return Capacitor.getPlatform ? Capacitor.getPlatform() : 'android';
  }
  function triggerToMinutes(trigger) {
    const match = /^-P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(String(trigger || ''));
    if (!match) return null;
    const total = Number(match[1] || 0) * 1440 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
    return total > 0 ? total : null;
  }
  function reminderMinutesFor(item) {
    const ics = createCalendar(item);
    const minutes = [];
    ics.split(/\r?\n/).forEach(line => {
      const match = /^TRIGGER:(.+)$/.exec(line.trim());
      if (!match) return;
      const value = triggerToMinutes(match[1]);
      if (value) minutes.push(value);
    });
    return minutes.slice(0, 2);
  }
  function nativeEventOptions(item) {
    const brand = 'OJ Gebrauchtwagen-Check';
    const title = String(item.title).includes(brand) ? String(item.title) : `${item.title} · ${brand}`;
    const notes = `${item.description || ''}\n\n${brand} · OJ Gutachter`;
    const [year, month, day] = item.date.split('-').map(Number);
    const timed = /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time || '');
    let startDate;
    let endDate;
    let isAllDay;
    if (timed) {
      const [hour, minute] = item.time.split(':').map(Number);
      startDate = new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
      endDate = startDate + 60 * 60 * 1000;
      isAllDay = false;
    } else {
      startDate = new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
      endDate = new Date(year, month - 1, day + 1, 0, 0, 0, 0).getTime();
      isAllDay = true;
    }
    const reminders = reminderMinutesFor(item);
    const options = {title, notes, startDate, endDate, isAllDay};
    if (reminders[0]) options.firstReminderMinutes = reminders[0];
    if (reminders[1]) options.secondReminderMinutes = reminders[1];
    return options;
  }
  async function createWithFallback(calendar, item) {
    const options = nativeEventOptions(item);
    try {
      return await calendar.createEvent(options);
    } catch (error) {
      const made = await calendar.createCalendar({name: tr('calendarName'), color: '#5D0C0D'});
      return calendar.createEvent(Object.assign({}, options, {calendarId: made && made.id}));
    }
  }
  function showCalendarDialog(item, mode) {
    pendingCalendarItem = item;
    const box = document.getElementById('calendarDialog');
    if (!box) {
      showToast(tr(mode === 'failed' ? 'calendarNativeSaveFailedText' : 'calendarNativeDeniedText'));
      return;
    }
    const failed = mode === 'failed';
    box.innerHTML = `<h2 id="calendarDialogTitle">${escapeHtml(tr(failed ? 'calendarNativeSaveFailed' : 'calendarNativeDeniedTitle'))}</h2><p id="calendarDialogText">${escapeHtml(tr(failed ? 'calendarNativeSaveFailedText' : 'calendarNativeDeniedText'))}</p>${failed ? '' : `<button type="button" class="button button-primary button-full" data-native-calendar="settings">${escapeHtml(tr('calendarNativeOpenSettings'))}</button>`}<button type="button" class="button button-secondary button-full" data-native-calendar="share">${escapeHtml(tr('calendarNativeShareFile'))}</button><button type="button" class="button button-secondary button-full" data-native-calendar="save">${escapeHtml(tr('calendarNativeSaveFile'))}</button><button type="button" class="button button-text button-full" data-calendar-dialog="close">${escapeHtml(tr('cancel'))}</button>`;
    if (!box.open) box.showModal();
    (box.querySelector('[data-native-calendar]') || box.querySelector('button'))?.focus();
  }
  async function saveNativeCalendar(key) {
    const item = typeof calendarItemByKey === 'function' ? calendarItemByKey(key) : null;
    if (!item) {
      showToast(key === 'besichtigung' ? tr('appointment.missingDate') : tr('saveValidDateFirst'));
      if (key === 'besichtigung') document.getElementById('appointmentDate')?.focus();
      return null;
    }
    try {
      const calendar = plugin('Calendar');
      const status = await calendar.checkPermissions();
      let write = status && status.writeCalendar;
      if (write === 'prompt') {
        const next = await calendar.requestPermissions({permissions: ['writeCalendar']});
        write = next && next.writeCalendar;
      }
      if (write !== 'granted') {
        showCalendarDialog(item, 'denied');
        return null;
      }
      const created = await createWithFallback(calendar, item);
      showToast(tr('calendarNativeSaved'));
      window.__lastNativeCalendar = {id: created && created.id, key: item.key, title: item.title};
      return created;
    } catch (error) {
      showCalendarDialog(item, 'failed');
      return null;
    }
  }
  async function writeIcs(item) {
    const ics = createCalendar(item);
    const path = `OJ-${item.key}-${item.date}.ics`;
    const filesystem = plugin('Filesystem');
    await filesystem.writeFile({path, data: ics, directory: 'CACHE', encoding: 'utf8'});
    const file = await filesystem.getUri({path, directory: 'CACHE'});
    return {path, uri: file && file.uri};
  }
  async function shareIcs(item) {
    const file = await writeIcs(item);
    await plugin('Share').share({title: file.path, files: [file.uri], dialogTitle: tr('calendarNativeShareFile')});
  }
  async function saveIcs(item) {
    await writeIcs(item);
    showToast(tr('calendarNativeFileSaved'));
  }
  async function openExternal(url) {
    if (!url) return;
    try {
      await plugin('OjDevice').openExternal({url});
    } catch (error) {
      if (/^https?:|^tel:/i.test(url)) window.location.assign(url);
    }
  }
  async function openSettings() {
    try { await plugin('OjDevice').openSettings(); } catch (error) { showToast(tr('calendarNativeDeniedText')); }
  }
  function routeUrl() {
    const address = encodeURIComponent(CONTACT.address);
    return platform() === 'ios'
      ? `http://maps.apple.com/?daddr=${address}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  }
  function nearbyUrl() {
    const query = encodeURIComponent(NEARBY_QUERY);
    return platform() === 'ios' ? `http://maps.apple.com/?q=${query}` : `geo:0,0?q=${query}`;
  }
  function distanceKm(lat1, lon1, lat2, lon2) {
    const p = Math.PI / 180;
    const a = Math.sin((lat2 - lat1) * p / 2) ** 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * Math.sin((lon2 - lon1) * p / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  function formatDistance(km) {
    if (km < 1) return tr('expertHintDistanceNear');
    const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
    const text = rounded.toLocaleString(typeof locale === 'function' ? locale() : 'de-DE');
    return tr('expertHintDistance', {km: text});
  }
  function showLocationDenied() {
    const box = document.querySelector('[data-expert-denied]');
    if (!box) {
      showToast(tr('expertHintDeniedText'));
      return;
    }
    box.hidden = false;
  }
  async function readDistance() {
    let fix = null;
    try { fix = await plugin('OjDevice').getCoarseLocation(); } catch (error) { fix = null; }
    const node = document.querySelector('[data-expert-distance]');
    if (!fix || typeof fix.latitude !== 'number' || typeof fix.longitude !== 'number') {
      if (node) {
        node.hidden = false;
        node.textContent = tr('expertHintNoFix');
      }
      return;
    }
    sessionDistanceKm = distanceKm(fix.latitude, fix.longitude, OFFICE.lat, OFFICE.lon);
    if (node) {
      node.hidden = false;
      node.textContent = formatDistance(sessionDistanceKm);
    }
  }
  async function showDistance() {
    if (locationBusy) return;
    locationBusy = true;
    try {
      const device = plugin('OjDevice');
      const status = await device.checkLocation();
      let state = status && status.location;
      if (state === 'prompt') {
        const next = await device.requestLocation();
        state = next && next.location;
      }
      if (state === 'granted') {
        await readDistance();
        return;
      }
      showLocationDenied();
    } catch (error) {
      showLocationDenied();
    } finally {
      locationBusy = false;
    }
  }
  function expertHintHtml() {
    if (dismissed()) return '';
    const distance = sessionDistanceKm === null ? '' : formatDistance(sessionDistanceKm);
    return `<aside class="expert-hint" data-expert-hint><p class="eyebrow">${escapeHtml(tr('expertHintEyebrow'))}</p><h2>${escapeHtml(tr('expertHintTitle'))}</h2><p>${escapeHtml(tr('expertHintText'))}</p><p class="expert-office" lang="de"><strong>OJ Gutachter · Larry O. Johnson</strong><br><span dir="ltr">${escapeHtml(CONTACT.address)}</span></p><p class="expert-hours">${escapeHtml(tr('expertHintHours'))}</p><div class="expert-actions"><a class="button button-secondary button-full" href="${CONTACT.landlineLink}" data-expert-action="external">${escapeHtml(tr('expertHintCallLandline'))} <bdi dir="ltr">${escapeHtml(CONTACT.landlineDisplay)}</bdi></a><a class="button button-secondary button-full" href="${CONTACT.phoneLink}" data-expert-action="external">${escapeHtml(tr('expertHintCallMobile'))} <bdi dir="ltr">${escapeHtml(CONTACT.phoneDisplay)}</bdi></a><a class="button button-secondary button-full" href="${CONTACT.website}" data-expert-action="external">${escapeHtml(tr('expertHintWeb'))}</a><button type="button" class="button button-secondary button-full" data-expert-action="route">${escapeHtml(tr('expertHintRoute'))}</button><button type="button" class="button button-secondary button-full" data-expert-action="distance">${escapeHtml(tr('expertHintDistanceButton'))}</button><button type="button" class="button button-secondary button-full" data-expert-action="nearby">${escapeHtml(tr('expertHintNear'))}</button></div><p class="expert-distance" data-expert-distance ${distance ? '' : 'hidden'}>${distance ? escapeHtml(distance) : ''}</p><div class="expert-denied" data-expert-denied hidden><h3>${escapeHtml(tr('expertHintDeniedTitle'))}</h3><p>${escapeHtml(tr('expertHintDeniedText'))}</p><button type="button" class="button button-primary button-full" data-expert-action="settings">${escapeHtml(tr('expertHintOpenSettings'))}</button><button type="button" class="button button-secondary button-full" data-expert-action="nearby">${escapeHtml(tr('expertHintMapsWithoutLocation'))}</button></div><button type="button" class="button button-text button-full expert-dismiss" data-expert-action="dismiss">${escapeHtml(tr('expertHintDismiss'))}</button></aside>`;
  }
  function batteryApplies() {
    return state.drivetrain === 'electric' || state.drivetrain === 'hybrid';
  }
  function batteryRecord() {
    return normalizeBattery(state.battery);
  }
  function certificateIsOld(iso) {
    if (typeof isValidIsoDate !== 'function' || !isValidIsoDate(iso)) return false;
    const [year, month, day] = iso.split('-').map(Number);
    const then = new Date(year, month - 1, day);
    const limit = new Date();
    limit.setHours(0, 0, 0, 0);
    limit.setMonth(limit.getMonth() - 6);
    return then < limit;
  }
  function formatNumber(value) {
    return (Math.round(value * 10) / 10).toLocaleString(typeof locale === 'function' ? locale() : 'de-DE');
  }
  function formatIso(iso) {
    if (!iso) return tr('battery.notEntered');
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(typeof locale === 'function' ? locale() : 'de-DE');
  }
  function batteryLinks() {
    return `<div class="battery-tests"><p class="battery-tests-title">${escapeHtml(tr('battery.testsTitle'))}</p><p>${escapeHtml(tr('battery.testsText'))}</p>${BATTERY_TESTS.map(test => `<a class="button button-secondary button-full" data-battery-link="${test.id}" href="${test.href}">${escapeHtml(tr(test.key))}</a>`).join('')}</div>`;
  }
  function batterySohBlock() {
    const record = batteryRecord();
    const old = certificateIsOld(record.certificateDate);
    const sohValue = typeof record.soh === 'number' ? String(record.soh) : '';
    return `<fieldset class="battery-fields"><legend>${escapeHtml(tr('battery.sectionTitle'))}</legend><p class="battery-ask">${escapeHtml(tr('battery.askSeller'))}</p><label for="battery-soh">${escapeHtml(tr('battery.sohLabel'))}<input id="battery-soh" type="number" inputmode="decimal" min="0" max="100" step="0.1" data-battery-field="soh" value="${escapeHtml(sohValue)}"></label><label for="battery-date">${escapeHtml(tr('battery.dateLabel'))}<input id="battery-date" type="date" data-battery-field="certificateDate" value="${escapeHtml(record.certificateDate)}"></label><p class="battery-date-hint" data-battery-hint ${old ? '' : 'hidden'}>${old ? escapeHtml(tr('battery.dateOld')) : ''}</p></fieldset>`;
  }
  function batteryWarrantyBlock() {
    const record = batteryRecord();
    return `<fieldset class="battery-fields"><legend>${escapeHtml(tr('battery.warrantyLabel'))}</legend><label for="battery-warranty-text">${escapeHtml(tr('battery.warrantyRemaining'))}<input id="battery-warranty-text" type="text" maxlength="80" data-battery-field="warrantyText" value="${escapeHtml(record.warrantyText)}" autocomplete="off"></label><label for="battery-warranty-km">${escapeHtml(tr('battery.warrantyKm'))}<input id="battery-warranty-km" type="text" inputmode="numeric" maxlength="40" data-battery-field="warrantyKm" value="${escapeHtml(record.warrantyKm)}" autocomplete="off"></label><label for="battery-warranty-years">${escapeHtml(tr('battery.warrantyYears'))}<input id="battery-warranty-years" type="text" inputmode="numeric" maxlength="40" data-battery-field="warrantyYears" value="${escapeHtml(record.warrantyYears)}" autocomplete="off"></label><label for="battery-warranty-conditions">${escapeHtml(tr('battery.warrantyConditions'))}<textarea id="battery-warranty-conditions" maxlength="500" rows="3" data-battery-field="warrantyConditions">${escapeHtml(record.warrantyConditions)}</textarea></label></fieldset>`;
  }
  function batteryFieldsHtml(point) {
    if (!point || !point.step || !batteryApplies()) return '';
    if (point.step.id === 'ev' && point.itemIndex === 0) return batterySohBlock() + batteryLinks();
    if (point.step.id === 'ev' && point.itemIndex === 1) return batteryWarrantyBlock();
    if (point.step.id === 'hy' && point.itemIndex === 0) return batterySohBlock() + batteryWarrantyBlock() + batteryLinks();
    return '';
  }
  function batteryFactsHtml(record) {
    const old = certificateIsOld(record.certificateDate);
    const rows = [
      [tr('battery.sohLabel'), typeof record.soh === 'number' ? tr('battery.sohValue', {n: formatNumber(record.soh)}) : tr('battery.notEntered')],
      [tr('battery.dateLabel'), record.certificateDate ? formatIso(record.certificateDate) : tr('battery.notEntered')],
      [tr('battery.warrantyRemaining'), record.warrantyText || tr('battery.notEntered')],
      [tr('battery.warrantyKm'), record.warrantyKm || tr('battery.notEntered')],
      [tr('battery.warrantyYears'), record.warrantyYears || tr('battery.notEntered')],
      [tr('battery.warrantyConditions'), record.warrantyConditions || tr('battery.notEntered')]
    ];
    return `<dl class="battery-facts">${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>${old ? `<p class="battery-date-hint">${escapeHtml(tr('battery.dateOld'))}</p>` : ''}`;
  }
  function batterySummaryHtml() {
    if (!batteryApplies()) return '';
    return `<section class="battery-record" aria-labelledby="batterySummaryTitle"><h2 id="batterySummaryTitle">${escapeHtml(tr('battery.sectionTitle'))}</h2>${batteryFactsHtml(batteryRecord())}${batteryLinks()}</section>`;
  }
  function batteryPrintHtml() {
    if (!batteryApplies()) return '';
    return `<section class="print-battery"><h2>${escapeHtml(tr('battery.sectionTitle'))}</h2>${batteryFactsHtml(batteryRecord())}<p class="print-battery-links">${BATTERY_TESTS.map(test => `${escapeHtml(tr(test.key))}: ${escapeHtml(test.href)}`).join('<br>')}</p></section>`;
  }
  function refreshCertificateHint() {
    const record = batteryRecord();
    const old = certificateIsOld(record.certificateDate);
    document.querySelectorAll('[data-battery-hint]').forEach(node => {
      node.hidden = !old;
      node.textContent = old ? tr('battery.dateOld') : '';
    });
  }
  function onBatteryInput(event) {
    const input = event.target.closest ? event.target.closest('[data-battery-field]') : null;
    if (!input) return;
    const field = input.dataset.batteryField;
    const record = Object.assign(emptyBattery(), state.battery || {});
    if (field === 'soh') {
      if (input.value === '') record.soh = null;
      else {
        const number = Number(String(input.value).replace(',', '.'));
        if (!Number.isFinite(number) || number < 0 || number > 100) return;
        record.soh = Math.round(number * 10) / 10;
      }
    } else if (field === 'certificateDate') {
      record.certificateDate = typeof isValidIsoDate === 'function' && isValidIsoDate(input.value) ? input.value : '';
    } else if (field === 'warrantyConditions') {
      record.warrantyConditions = String(input.value).slice(0, 500);
    } else if (field === 'warrantyText' || field === 'warrantyKm' || field === 'warrantyYears') {
      record[field] = String(input.value).slice(0, field === 'warrantyText' ? 80 : 40);
    } else return;
    state.battery = normalizeBattery(record);
    if (typeof save === 'function') save();
    if (field === 'certificateDate') refreshCertificateHint();
  }
  async function onExpertAction(action, href) {
    if (action === 'dismiss') {
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch (error) {}
      document.querySelectorAll('.expert-hint').forEach(node => node.remove());
      return;
    }
    if (action === 'external') return openExternal(href);
    if (action === 'route') return openExternal(routeUrl());
    if (action === 'nearby') return openExternal(nearbyUrl());
    if (action === 'settings') return openSettings();
    if (action === 'distance') return showDistance();
  }
  document.addEventListener('click', event => {
    const batteryLink = event.target.closest && event.target.closest('[data-battery-link]');
    if (batteryLink) {
      event.preventDefault();
      openExternal(batteryLink.href);
      return;
    }
    const expert = event.target.closest && event.target.closest('[data-expert-action]');
    if (expert) {
      event.preventDefault();
      onExpertAction(expert.dataset.expertAction, expert.getAttribute('href'));
      return;
    }
    const nativeCal = event.target.closest && event.target.closest('[data-native-calendar]');
    if (!nativeCal || !pendingCalendarItem) return;
    event.preventDefault();
    const action = nativeCal.dataset.nativeCalendar;
    const item = pendingCalendarItem;
    if (action === 'settings') openSettings();
    else if (action === 'share') shareIcs(item).catch(() => showToast(tr('calendarNativeSaveFailedText')));
    else if (action === 'save') saveIcs(item).catch(() => { try { downloadIcs(item); } catch (error) { showToast(tr('calendarNativeSaveFailedText')); } });
  });
  document.addEventListener('input', onBatteryInput);
  document.addEventListener('change', onBatteryInput);

  window.OjNativeCalendar = {
    isNative: true,
    save: saveNativeCalendar,
    expertHintHtml,
    batteryFieldsHtml,
    batterySummaryHtml,
    batteryPrintHtml
  };
})();
