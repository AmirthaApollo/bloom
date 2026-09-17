/* ============================================================
   Bloom · Cart
   Depends on products.js, app.js
   ============================================================ */

(function () {
  'use strict';

  const KEY = 'bloom_cart_v1';
  const COUPON_KEY = 'bloom_coupon_v1';
  const FREE_SHIP_THRESHOLD = 4999;
  const FIXED_DELIVERY = 499;

  let state = { items: [], coupon: null };

  function load() {
    try { state.items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { state.items = []; }
    try { state.coupon = JSON.parse(localStorage.getItem(COUPON_KEY) || 'null'); } catch (e) { state.coupon = null; }
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify(state.items));
    if (state.coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(state.coupon));
    else localStorage.removeItem(COUPON_KEY);
  }
  load();

  const Cart = {
    items: () => state.items.slice(),
    coupon: () => state.coupon,

    count() {
      return state.items.reduce((n, it) => n + it.qty, 0);
    },

    lineKey(id, size, color) {
      return [id, size || '', color || ''].join('__');
    },

    add(id, qty, size, color) {
      const p = window.getProduct(id);
      if (!p) return false;
      if (window.MP && MP.isSold(id)) { App.toast('Sorry, that item has already been sold.', 'error'); return false; }
      qty = Math.max(1, parseInt(qty || 1, 10));
      const key = Cart.lineKey(id, size, color);
      const hit = state.items.find(it => it.key === key);
      if (hit) hit.qty += qty;
      else state.items.unshift({ key, id, qty, size: size || '', color: color || '' });
      save();
      Cart.updateBadges();
      try { if (window.Cart && window.Cart.onChange) window.Cart.onChange(); } catch (e) {}
      return true;
    },

    setQty(key, qty) {
      qty = Math.max(1, parseInt(qty || 1, 10));
      const it = state.items.find(i => i.key === key);
      if (!it) return;
      it.qty = qty;
      save();
      Cart.updateBadges();
      try { if (window.Cart && window.Cart.onChange) window.Cart.onChange(); } catch (e) {}
    },

    remove(key) {
      state.items = state.items.filter(i => i.key !== key);
      save();
      Cart.updateBadges();
      try { if (window.Cart && window.Cart.onChange) window.Cart.onChange(); } catch (e) {}
    },

    clear() {
      state.items = [];
      save();
      Cart.updateBadges();
      try { if (window.Cart && window.Cart.onChange) window.Cart.onChange(); } catch (e) {}
    },

    findKeyFor(id, size, color) { return Cart.lineKey(id, size, color); },

    linePrice(it) {
      const p = window.getProduct(it.id);
      return p ? p.price : 0;
    },
    lineTotal(it) { return Cart.linePrice(it) * it.qty; },
    has(id) { return state.items.some(i => i.id === id); },

    subtotal() {
      return state.items.reduce((s, it) => s + Cart.lineTotal(it), 0);
    },

    validateCoupon(code) {
      code = (code || '').trim().toUpperCase();
      if (!code) return { ok: false, msg: 'Enter a coupon code.' };
      const meta = window.COUPONS[code];
      if (!meta) return { ok: false, msg: 'That code isn’t valid. Try FLEUR10.' };
      if (meta.minSpend && Cart.subtotal() < meta.minSpend)
        return { ok: false, msg: `Need ${App.money(meta.minSpend)} subtotal for this code.` };
      return { ok: true, meta };
    },

    applyCoupon(code) {
      const r = Cart.validateCoupon(code);
      if (!r.ok) return r;
      state.coupon = { code, ...r.meta, label: r.meta.label };
      save();
      return { ok: true, msg: `Coupon ${state.coupon.code} applied.` };
    },

    removeCoupon() {
      state.coupon = null;
      save();
    },

    discountAmount() {
      const c = state.coupon;
      if (!c) return 0;
      const sub = Cart.subtotal();
      if (!c.minSpend || sub >= c.minSpend) {
        if (c.kind === 'percent') return sub * c.value / 100;
      }
      return 0;
    },

    deliveryFee() {
      const sub = Cart.subtotal();
      if (state.coupon && state.coupon.kind === 'shipping') return 0;
      if (sub >= FREE_SHIP_THRESHOLD) return 0;
      return FIXED_DELIVERY;
    },

    total() {
      return Math.max(0, Cart.subtotal() - Cart.discountAmount() + Cart.deliveryFee());
    },

    updateBadges() {
      document.querySelectorAll('.count-badge[data-bag]').forEach(b => {
        const n = Cart.count();
        b.textContent = n;
        b.style.display = n ? '' : 'none';
      });
    },

    /* ---------- UI actions ---------- */
    addFromUI(id, btnEl) {
      const p = window.getProduct(id);
      if (!p) return;
      if (!Cart.add(id, 1)) return;
      const unit = p;
      const name = `${unit.brand} · ${unit.name}`;
      Cart.notifyAdded(name, unit.images[0], 1);
      Cart.announceCartOpen();
      if (btnEl) { btnEl.classList.add('added'); btnEl.innerHTML = 'Added'; setTimeout(() => { btnEl.classList.remove('added'); btnEl.innerHTML = 'Add to bag'; }, 1400); }
    },

    notifyAdded(name, imgSrc, qty) {
      const freeNote = Cart.deliveryFee() === 0 ? '<small>You’ve unlocked free delivery</small>' : '';
      App.toastHTML(`
        <img src="${imgSrc}" alt="" class="toast-thumb">
        <span><b>Added to your bag</b>${App.esc(name)}${freeNote}</span>`);
    },

    buyNow(id) {
      const p = window.getProduct(id);
      if (!p) return;
      if (window.MP && MP.isSold(id)) { App.toast('Sorry, that item has already been sold.', 'error'); return; }
      const key = Cart.lineKey(id, null, null);
      const hit = state.items.find(i => i.key === key);
      if (hit) Cart.setQty(key, hit.qty + 1);
      else { Cart.add(id, 1, null, null); }
      location.href = 'checkout.html';
    },

    announceCartOpen() {
      setTimeout(() => { const d = document.querySelector('.cart-drawer'); const v = document.querySelector('.drawer-veil'); if (d && v) { v.classList.add('open'); d.classList.add('open'); document.body.classList.add('drawer-open'); } }, 300);
    },

    closeDrawer() {
      const d = document.querySelector('.cart-drawer');
      const v = document.querySelector('.drawer-veil');
      if (d) d.classList.remove('open');
      if (v) v.classList.remove('open');
      document.body.classList.remove('drawer-open');
    },

    initDrawer(drawer, veil) {
      if (!drawer || !veil) return;
      drawer.querySelector('.drawer-close') && drawer.querySelector('.drawer-close').addEventListener('click', Cart.closeDrawer);
      veil.addEventListener('click', Cart.closeDrawer);
      this.onChange = () => {
        try { Cart.refreshDrawer(drawer); } catch (e) {}
        if (typeof Cart.refreshCartPage === 'function') { try { Cart.refreshCartPage(); } catch (e) {} }
      };
      try { Cart.refreshDrawer(drawer); } catch (e) {}
    },

    refreshDrawer(drawer) {
      if (!drawer) return;
      const body = drawer.querySelector('.drawer-body');
      const foot = drawer.querySelector('.drawer-foot');
      const items = state.items;
      if (!body) return;
      if (!items.length) {
        body.innerHTML = `<div class="drawer-empty"><img src="https://picsum.photos/seed/emptybag/120/120" alt="" style="width:90px;height:90px;border-radius:50%;opacity:.9"><p style="margin-top:12px">Your bag is feeling light.</p></div>`;
        foot.innerHTML = `<div class="row"><button class="btn btn-primary btn-sm" data-view-link="shop.html">Start browsing</button></div>`;
      } else if (foot) {
        body.innerHTML = items.slice(0, 8).map(it => {
          const p = window.getProduct(it.id);
          if (!p) return '';
          const meta = it.size && it.color ? `${it.size} · ${it.color}` : (it.size || it.color || '');
          const cls = it.color ? ` style="background:${colorHex(it.color)}"` : '';
          return `<div class="drawer-item">
            <a href="product.html?id=${p.id}"><img src="${p.images[0]}" alt="" loading="lazy"></a>
            <div>
              <div class="di-name"><a href="product.html?id=${p.id}">${App.esc(p.name)}</a></div>
              <div class="di-meta">${App.esc(p.brand)}${meta ? ' · ' + App.esc(meta) : ''}<span class="dotc"${cls}></span></div>
              <div class="qty-wrap">
                <button data-dq="${it.key}" data-op="dec">−</button><span>${it.qty}</span><button data-dq="${it.key}" data-op="inc">+</button>
              </div>
            </div>
            <div class="drawer-right">
              <div class="di-price">${App.money(Cart.lineTotal(it))}</div>
              <button class="di-remove" data-drem="${it.key}">Remove</button>
            </div>
          </div>`;
        }).join('');
        const sub = Cart.subtotal();
        foot.innerHTML = `
          <div class="drawer-sub"><span>Subtotal</span><b>${App.money(sub)}</b></div>
          <div class="drawer-actions">
            <button class="btn btn-primary btn-sm" data-view-link="checkout.html">Checkout</button>
            <button class="btn btn-light btn-sm" data-view-link="cart.html">View bag</button>
          </div>`;
      }
      Cart.bindDrawerButtons(drawer);
    },

    bindDrawerButtons(drawer) {
      const all = drawer.querySelectorAll('[data-dq]');
      all.forEach(b => {
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          const key = b.getAttribute('data-dq');
          const it = state.items.find(i => i.key === key);
          if (!it) return;
          if (b.getAttribute('data-op') === 'dec') {
            if (it.qty <= 1) Cart.remove(key);
            else Cart.setQty(key, it.qty - 1);
          } else Cart.setQty(key, it.qty + 1);
        });
      });
      drawer.querySelectorAll('[data-drem]').forEach(b => {
        b.addEventListener('click', (e) => { e.stopPropagation(); Cart.remove(b.getAttribute('data-drem')); });
      });
    },

    /* ---------- Cart page ---------- */
    initCartPage() {
      const rowsEl = document.querySelector('.cart-table .tbody');
      const summaryEl = document.querySelector('.cart-summary-card');
      const emptyEl = document.querySelector('.cart-empty');
      if (!rowsEl) return;

      Cart.refreshCartPage = function () { Cart.renderCartTable(rowsEl, summaryEl, emptyEl); };

      /* events */
      const minus = (e) => { const b = e.target.closest('[data-qm]'); if (b) { const key = b.getAttribute('data-qm'); const hit = state.items.find(i => i.key === key); if (hit.qty <= 1) Cart.remove(key); else Cart.setQty(key, hit.qty - 1); } };
      const plus = (e) => { const b = e.target.closest('[data-qp]'); if (b) { const key = b.getAttribute('data-qp'); const hit = state.items.find(i => i.key === key); if (hit) Cart.setQty(key, hit.qty + 1); } };
      const remove = (e) => { const b = e.target.closest('[data-trem]'); if (b) { Cart.remove(b.getAttribute('data-trem')); } };
      const toWish = (e) => { const b = e.target.closest('[data-towish]'); if (b) { const key = b.getAttribute('data-towish'); const it = state.items.find(i => i.key === key); if (it && window.Wishlist) { Wishlist.add(it.id); Cart.remove(key); App.toast('Moved to wishlist', 'info'); } } };
      [['data-qm', minus], ['data-qp', plus], ['data-trem', remove], ['data-towish', toWish]].forEach(([attr, fn]) => {
        document.addEventListener('click', fn, false);
      });

      Cart.renderCartTable(rowsEl, summaryEl, emptyEl);
    },

renderCartTable(rowsEl, summaryEl, emptyEl) {
      const items = state.items;
      const tableWrap = rowsEl.closest('.cart-list');
      const summaryWrap = summaryEl && summaryEl.closest('.cart-summary-wrap');
      if (!items.length) {
        if (emptyEl) emptyEl.style.display = '';
        if (tableWrap) tableWrap.style.display = 'none';
        if (summaryWrap) summaryWrap.style.display = 'none';
        return;
      }
      if (emptyEl) emptyEl.style.display = 'none';
      if (tableWrap) tableWrap.style.display = '';
      if (summaryWrap) summaryWrap.style.display = '';

      rowsEl.innerHTML = items.map(it => {
        const p = window.getProduct(it.id);
        if (!p) return '';
        const meta = [it.size, it.color].filter(Boolean).join(' · ');
        const cls = it.color ? ` style="background:${colorHex(it.color)}"` : '';
        const disc = p.discount ? `<span class="price-disc">−${p.discount}%</span>` : '';
        return `
        <div class="cart-row" data-key="${it.key}">
          <a href="product.html?id=${p.id}"><img src="${p.images[0]}" alt="${App.esc(p.name)}" loading="lazy"></a>
          <div>
            <div class="ci-name"><a href="product.html?id=${p.id}">${App.esc(p.name)}</a></div>
            <div class="ci-meta">${App.esc(p.brand)}${meta ? ' · ' + App.esc(meta) : ''}<span class="dotc"${cls}></span></div>
            <button class="ci-wish" data-towish="${it.key}">Move to wishlist</button>
          </div>
          <div class="qty">
            <button data-qm="${it.key}" aria-label="Decrease">−</button>
            <span class="qty-val">${it.qty}</span>
            <button data-qp="${it.key}" aria-label="Increase">+</button>
          </div>
          <div class="ci-price">
            ${App.money(p.price)}${disc}<div class="aggr">${App.money(Cart.lineTotal(it))}</div>
          </div>
          <button class="ci-remove" data-trem="${it.key}" aria-label="Remove">${App.icon('close', 'i-sm')}</button>
        </div>`;
      }).join('');

      /* summary */
      if (summaryEl) {
        const sub = Cart.subtotal();
        const disc = Cart.discountAmount();
        const fee = Cart.deliveryFee();
        const total = Cart.total();
        const c = state.coupon;

        let couponHtml = `<div class="coupon-wrap">
            <input type="text" placeholder="Coupon code (try FLEUR10)" value="">
            <button class="coupon-apply">Apply</button>
          </div><p class="coupon-error" style="display:none"></p>`;
        if (c) couponHtml = `<div class="coupon-applied"><span>${App.icon('tag', 'i-xs')} ${App.esc(c.code)} · ${App.esc(c.label)}</span><button class="remove-coupon">remove</button></div>`;

        const feeLine = fee === 0 ? `<b style="color:var(--good)">FREE</b>` : App.money(fee);
        const freeShip = sub < FREE_SHIP_THRESHOLD && fee !== 0 ? `<span>Add <b>${App.money(FREE_SHIP_THRESHOLD - sub)}</b> more for free delivery</span>` : `<b>Free delivery unlocked</b>`;

        summaryEl.innerHTML = `
          <h3>Order summary</h3>
          <div class="sum-row"><span>Subtotal</span><b>${App.money(sub)}</b></div>
          <div class="sum-row">${couponHtml}</div>
          <div class="sum-row"><span>Discount</span><b class="disc-amount">${disc ? '−' + App.money(disc) : App.money(0)}</b></div>
          <div class="sum-row"><span>Delivery</span>${feeLine}</div>
          <div class="free-ship-note">${wrapTruck()}${freeShip}</div>
          <div class="sum-total"><span>Total</span><b>${App.money(total)}</b></div>
          <div class="cart-actions">
            <button class="btn btn-primary btn-block" data-view-link="checkout.html">Checkout securely</button>
            <button class="btn btn-light btn-block" data-view-link="shop.html">Continue shopping</button>
          </div>`;
        const couponBtn = summaryEl.querySelector('.coupon-apply');
        if (couponBtn) couponBtn.addEventListener('click', () => {
          const input = summaryEl.querySelector('.coupon-wrap input');
          const err = summaryEl.querySelector('.coupon-error');
          const r = Cart.applyCoupon(input.value);
          if (r.ok) { App.toast(r.msg, 'success'); err.style.display = 'none'; Cart.refreshCartPage(); }
          else { err.textContent = r.msg; err.style.display = ''; }
        });
        const removeBtn = summaryEl.querySelector('.remove-coupon');
        if (removeBtn) removeBtn.addEventListener('click', () => { Cart.removeCoupon(); App.toast('Coupon removed.', 'info'); Cart.refreshCartPage(); });
      }
    }
  };

  function wrapTruck() { return App.icon('truck'); }

  const COLOR_HEX = {
    cream: '#f4efe4', blush: '#f5d9c9', sage: '#b9c5a7', ivory: '#fdfbf4', charcoal: '#4a4a4a',
    sand: '#d9c6a8', olive: '#7a7f52', indigo: '#3a4a72', 'washed blue': '#8da3c1', cobalt: '#2a4a9e',
    'poppy red': '#d63f3f', black: '#1b1b1b', tan: '#c8a27a', chestnut: '#7a5230', 'natural': '#e8dcc8',
    champagne: '#e6d5b0', 'rose gold': '#e0b7a8', gold: '#d4b06a', silver: '#b8b8be', terracotta: '#c96a45',
    honey: '#e0a83f', tortoise: '#8a6a3a', blushgold: '#e0b7a8'
  };
  function colorHex(name) { return COLOR_HEX[String(name || '').toLowerCase()] || '#e0d9cf'; }
  window.colorHex = colorHex;

  window.Cart = Cart;

  Cart.updateBadges();
})();