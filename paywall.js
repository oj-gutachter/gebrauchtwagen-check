/* Kauf-Grundlage nur für die native App. Bei PAYWALL_ENABLED === false passiert hier nichts Sichtbares:
   kein Store-Start, kein Knopf, kein „Pro“. Im Browser ist der Schalter ebenfalls wirkungslos. */
(function () {
  'use strict';
  const productId = typeof PRO_PRODUCT_ID === 'string' ? PRO_PRODUCT_ID : 'de.ojgutachter.gebrauchtwagencheck.pro';
  const laterFeatures = ['pdf', 'battery'];
  let owned = false;
  let ready = false;

  function flagOn() {
    return typeof PAYWALL_ENABLED !== 'undefined' && PAYWALL_ENABLED === true;
  }
  function nativeApp() {
    try {
      return !!(window.Capacitor && typeof Capacitor.isNativePlatform === 'function' && Capacitor.isNativePlatform());
    } catch (error) {
      return false;
    }
  }
  function active() {
    return flagOn() && nativeApp();
  }
  function storeApi() {
    return window.CdvPurchase && CdvPurchase.store ? CdvPurchase.store : null;
  }
  function refreshOwned() {
    const store = storeApi();
    owned = !!(store && typeof store.owned === 'function' && store.owned(productId));
    const node = document.querySelector('[data-paywall-status]');
    if (node) node.textContent = tr(owned ? 'paywall.owned' : 'paywall.text');
    const buy = document.querySelector('[data-paywall-action="buy"]');
    if (buy) buy.hidden = owned;
  }
  function isUnlocked(feature) {
    if (!active()) return true;
    if (feature && !laterFeatures.includes(feature)) return true;
    return owned;
  }
  function requiresPurchase(feature) {
    return active() && laterFeatures.includes(feature) && !owned;
  }
  async function restore() {
    if (!active()) return {ok: false, skipped: true};
    const store = storeApi();
    if (!store) return {ok: false, skipped: true};
    const error = await store.restorePurchases();
    refreshOwned();
    return {ok: !error, owned};
  }
  async function buy() {
    const store = storeApi();
    if (!store) return;
    const product = typeof store.get === 'function' ? store.get(productId) : null;
    const offer = product && typeof product.getOffer === 'function' ? product.getOffer() : null;
    if (!offer) {
      showToast(tr('paywall.notFound'));
      return;
    }
    const error = await offer.order();
    if (error) showToast(tr('paywall.failed'));
  }
  function paywallHtml() {
    return `<section class="paywall-card" data-paywall><p class="eyebrow">${escapeHtml(tr('paywall.productName'))}</p><h2>${escapeHtml(tr('paywall.title'))}</h2><p data-paywall-status>${escapeHtml(tr('paywall.text'))}</p><button type="button" class="button button-primary button-full" data-paywall-action="buy">${escapeHtml(tr('paywall.buy'))}</button><button type="button" class="button button-secondary button-full" data-paywall-action="restore">${escapeHtml(tr('paywall.restore'))}</button></section>`;
  }
  function mount() {
    const host = document.getElementById('app');
    if (!host || host.querySelector('[data-paywall]')) return;
    host.insertAdjacentHTML('beforeend', paywallHtml());
    refreshOwned();
  }
  function setupStore() {
    const purchase = window.CdvPurchase;
    if (!purchase || !purchase.store) {
      document.addEventListener('deviceready', setupStore, {once: true});
      return;
    }
    if (setupStore.done) return;
    setupStore.done = true;
    const {store, ProductType, Platform} = purchase;
    store.register([
      {id: productId, type: ProductType.NON_CONSUMABLE, platform: Platform.GOOGLE_PLAY},
      {id: productId, type: ProductType.NON_CONSUMABLE, platform: Platform.APPLE_APPSTORE}
    ]);
    store.when().approved(transaction => {
      if (transaction && typeof transaction.finish === 'function') transaction.finish();
    }).receiptUpdated(() => refreshOwned());
    const platforms = [];
    const platform = Capacitor.getPlatform ? Capacitor.getPlatform() : '';
    if (platform === 'android') platforms.push(Platform.GOOGLE_PLAY);
    if (platform === 'ios') platforms.push(Platform.APPLE_APPSTORE);
    store.initialize(platforms).then(() => {
      ready = true;
      refreshOwned();
    }).catch(() => showToast(tr('paywall.failed')));
  }
  window.OjPaywall = {enabled: active(), productId, isUnlocked, requiresPurchase, restore};
  if (!active()) return;
  let started = false;
  function start() {
    if (started) return;
    started = true;
    setupStore();
    mount();
    const host = document.getElementById('app');
    if (host) new MutationObserver(() => mount()).observe(host, {childList: true});
  }
  document.addEventListener('click', event => {
    const button = event.target.closest && event.target.closest('[data-paywall-action]');
    if (!button) return;
    event.preventDefault();
    if (button.dataset.paywallAction === 'buy') buy();
    else restore().then(result => showToast(tr(result && result.owned ? 'paywall.owned' : 'paywall.restored')));
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
