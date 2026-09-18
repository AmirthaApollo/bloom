/* ============================================================
   Bloom · Core application (App namespace)
   Depends on products.js, cart.js, wishlist.js
   ============================================================ */

(function () {
  'use strict';

  const LS_KEYS = { announce: 'bloom_announce_closed', viewPref: 'bloom_view_pref', recent: 'bloom_recent' };

  const ICONS = {
    search:  '<circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.2" y1="15.2" x2="20" y2="20"/>',
    user:    '<circle cx="12" cy="8" r="4"/><path d="M4.5 20 C 5.5 15.6 8.6 14 12 14 C 15.4 14 18.5 15.6 19.5 20"/>',
    heart:   '<path d="M12 20 C 4 14.5 3.2 9.4 6 6.6 C 8.8 3.9 12 6 12 8.2 C 12 6 15.2 3.9 18 6.6 C 20.8 9.4 20 14.5 12 20 Z"/>',
    heartF:  '<path d="M12 20 C 4 14.5 3.2 9.4 6 6.6 C 8.8 3.9 12 6 12 8.2 C 12 6 15.2 3.9 18 6.6 C 20.8 9.4 20 14.5 12 20 Z" fill="currentColor"/>',
    bag:     '<path d="M5 8 H19 L18 20.5 H6 Z"/><path d="M9 8 V6.5 a3 3 0 0 1 6 0 V8"/>',
    cart:    '<circle cx="9.5" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2.5 3.5 H5 L7.5 15.5 H18.5 L21 6.5 H6"/>',
    menu:    '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
    close:   '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    chev:    '<path d="M6 9.5 L12 15.5 L18 9.5"/>',
    chevR:   '<path d="M9.5 5.5 L15.5 11.5 L9.5 17.5"/>',
    check:   '<path d="M5 12.5 L10 17.5 L19 6.5"/>',
    star:    '<path d="M12 3.6 L14.6 9.3 L20.8 10.1 L16.2 14.3 L17.4 20.4 L12 17.4 L6.6 20.4 L7.8 14.3 L3.2 10.1 L9.4 9.3 Z" fill="currentColor"/>',
    starO:   '<path d="M12 3.6 L14.6 9.3 L20.8 10.1 L16.2 14.3 L17.4 20.4 L12 17.4 L6.6 20.4 L7.8 14.3 L3.2 10.1 L9.4 9.3 Z"/>',
    plus:    '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus:   '<line x1="5" y1="12" x2="19" y2="12"/>',
    trash:   '<path d="M4 6.5 H20"/><path d="M9 6.5 V4.5 H15 V6.5"/><path d="M6.5 6.5 L7.5 20 H16.5 L17.5 6.5"/><path d="M10 10 V17"/><path d="M14 10 V17"/>',
    arrow:   '<line x1="4" y1="12" x2="19" y2="12"/><path d="M13 6.5 L19 12 L13 17.5"/>',
    arrowL:  '<line x1="20" y1="12" x2="5" y2="12"/><path d="M11 6.5 L5 12 L11 17.5"/>',
    back:    '<path d="M9 6 L4 11 L9 16"/><path d="M4 11 H14 C 18.5 11 19.5 14.5 18 18"/>',
    grid:    '<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>',
    list:    '<rect x="4" y="5" width="3.4" height="3.4" rx="1"/><path d="M10 6.7 H20"/><rect x="4" y="10.3" width="3.4" height="3.4" rx="1"/><path d="M10 12 H20"/><rect x="4" y="15.6" width="3.4" height="3.4" rx="1"/><path d="M10 17.3 H20"/>',
    lock:    '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5 V7.5 a4 4 0 0 1 8 0 V10.5"/>',
    pin:     '<path d="M12 21 C 12 21 19 14.7 19 9.6 C 19 5.9 15.9 3 12 3 C 8.1 3 5 5.9 5 9.6 C 5 14.7 12 21 12 21 Z"/><circle cx="12" cy="9.6" r="2.6"/>',
    box:     '<path d="M4 8 L12 4 L20 8 V16 L12 20 L4 16 Z"/><path d="M4 8 L12 12 L20 8"/><path d="M12 12 V20"/>',
    card:    '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10 H21"/><path d="M6.5 14.5 H10"/>',
    wallet:  '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10 H21"/><circle cx="17" cy="14.5" r="1.2"/>',
    logout:  '<path d="M14 4 H6 V20 H14"/><path d="M11 12 H21"/><path d="M17.5 8.5 L21 12 L17.5 15.5"/>',
    orders:  '<path d="M6 3.5 H18 V20.5 L15 18.8 L12 20.5 L9 18.8 L6 20.5 Z"/><path d="M9 8 H15"/><path d="M9 12 H15"/>',
    leaf:    '<path d="M12 3 C 19 7 20 15 12 21 C 4 15 5 7 12 3 Z"/><path d="M12 6.5 V20"/><path d="M12 11 C 14 10 16 10 18 11"/><path d="M12 15 C 10 14 8 14 6 15"/>',
    flower:  '<circle cx="12" cy="7.4" r="3.3"/><circle cx="16.4" cy="10.8" r="3.3"/><circle cx="14.7" cy="16" r="3.3"/><circle cx="9.3" cy="16" r="3.3"/><circle cx="7.6" cy="10.8" r="3.3"/><circle cx="12" cy="11.8" r="1.5"/>',
    sprig:   '<path d="M12 21 C 12 15 12 9 12 4"/><path d="M12 13 C 15 12 17 9 17 6 C 14 6 12 9 12 13 Z"/><path d="M12 17 C 9 16 7 13 7 10 C 10 10 12 13 12 17 Z"/>',
    sparkle: '<path d="M12 3 C 12 8 16 12 21 12 C 16 12 12 16 12 21 C 12 16 8 12 3 12 C 8 12 12 8 12 3 Z"/>',
    truck:   '<path d="M3 6.5 H14 V17 H3 Z"/><path d="M14 10 H18 L21 13 V17 H14 Z"/><circle cx="7" cy="18.6" r="1.6"/><circle cx="17" cy="18.6" r="1.6"/>',
    phone:   '<rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M10.5 18.5 H13.5"/>',
    cash:    '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>',
    receipt: '<path d="M6 3 H18 V21 L15 19.2 L12 21 L9 19.2 L6 21 Z"/><path d="M9 8 H15"/><path d="M9 12 H15"/>',
    tag:     '<path d="M4 12.5 L12 4.5 H20 V12.5 L12 20.5 Z"/><circle cx="15.8" cy="8.6" r="1.4"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8 V5"/><path d="M12 19 V21.2"/><path d="M4.4 7.2 L6.3 8.3"/><path d="M17.7 15.7 L19.6 16.8"/><path d="M4.4 16.8 L6.3 15.7"/><path d="M17.7 8.3 L19.6 7.2"/>',
    dress:   '<path d="M9 3 H15 L14 7 C 17.5 12 18.5 16 18.5 21 H5.5 C 5.5 16 6.5 12 10 7 Z"/><path d="M9 3 C 10 5.2 14 5.2 15 3"/>',
    shoe:    '<path d="M3.5 15 H14 C 17.5 15 20.5 16 20.5 18.2 H3.5 Z"/><path d="M8 15 C 8 12 10 10 12 10 C 14.5 11 16.5 12 18.5 13"/><path d="M3.5 18.2 V16"/>',
    ring:    '<circle cx="12" cy="14.5" r="5"/><path d="M9 6 L12 9.5 L15 6 L12 2.8 Z"/>',
    home:    '<path d="M4 11 L12 4 L20 11"/><path d="M6.5 9.5 V20 H17.5 V9.5"/><path d="M10 20 V14.5 H14 V20"/>',
    glasses: '<circle cx="8" cy="14" r="3.4"/><circle cx="16" cy="14" r="3.4"/><path d="M11.4 14 H12.6"/><path d="M4.6 14 L6.2 8.5 H17.8 L19.4 14"/>',
    pants:   '<path d="M6 3 H18 L17.2 21 H13.2 L12 11.5 L10.8 21 H6.8 Z"/><path d="M12 6.5 H12"/>',
    book:    '<path d="M12 6.5 C 10 4.8 7.5 4.5 4.5 5 V18 C 7.5 17.5 10 17.8 12 19.5 C 14 17.8 16.5 17.5 19.5 18 V5 C 16.5 4.5 14 4.8 12 6.5 Z"/><path d="M12 6.5 V19.5"/>',
    upload:  '<path d="M12 16 V4.5"/><path d="M7 9.5 L12 4.5 L17 9.5"/><path d="M5 15 V18 a2 2 0 0 0 2 2 H17 a2 2 0 0 0 2 -2 V15"/>',
    edit:    '<path d="M4 20 L8.5 19 L19 8.5 L15.5 5 L5 15.5 Z"/><path d="M14 6.5 L17.5 10"/>'
  };

  function wrap(name, cls) {
    const inner = ICONS[name] || '';
    return `<svg class="${cls || 'icon'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
  }

  const App = {
    esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    money(n) {
      const v = Math.round(Number(n || 0) * 100) / 100;
      return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },
    brandRating(brand) {
      const list = window.PRODUCTS.filter(p => p.brand === brand);
      if (!list.length) return null;
      const avg = list.reduce((sum, p) => sum + p.rating, 0) / list.length;
      return { rating: Math.round(avg * 10) / 10, count: list.length };
    },
    icon(name, cls) { return wrap(name, cls); },
    applyAvatar(mark) {
      try {
        if (mark) localStorage.setItem('bloom_avatar', mark);
        const name = mark || localStorage.getItem('bloom_avatar') || 'flower';
        document.querySelectorAll('.acct-face .avatar, .acct-avatar-big').forEach(a => {
          a.setAttribute('data-icon', name);
          a.removeAttribute('data-icon-done');
          a.innerHTML = '';
        });
        App.hydrateIcons();
      } catch (e) {}
    },
    stars(rating) {
      const full = Math.min(Math.max(Math.round(rating || 0), 0), 5);
      let out = '<span class="stars" aria-label="' + (rating || 0) + ' out of 5 stars">';
      for (let i = 0; i < 5; i++) out += wrap(i < full ? 'star' : 'starO', 'star-ico' + (i < full ? '' : ' empty'));
      return out + '</span>';
    },
    hydrateIcons(root) {
      const scope = root || document;
      scope.querySelectorAll('[data-icon]').forEach(el => {
        if (el.getAttribute('data-icon-done') === '1') return;
        el.innerHTML = wrap(el.getAttribute('data-icon'), el.getAttribute('data-icon-class') || 'i');
        el.setAttribute('data-icon-done', '1');
      });
      scope.querySelectorAll('[data-stars]').forEach(el => {
        if (el.getAttribute('data-stars-done') === '1') return;
        el.innerHTML = App.stars(Number(el.getAttribute('data-stars')) || 5);
        el.setAttribute('data-stars-done', '1');
      });
    },
    getParam(name) {
      return new URLSearchParams(location.search).get(name);
    },
    maybePlural(n, word) { return n === 1 ? word : word + 's'; }
  };
  function R(v, digits) { return typeof v === 'number' ? String(v) : String(v); }

  window.App = App;

  /* ===================== Toast ===================== */
  const toastWrap = document.createElement('div');
  toastWrap.className = 'toasts';
  document.body.appendChild(toastWrap);

  App.toast = function (msg, type) {
    const t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    const ico = type === 'success' ? wrap('check', 'toast-ico') : type === 'error' ? wrap('close', 'toast-ico') : wrap('leaf', 'toast-ico');
    t.innerHTML = ico + `<span>${App.esc(msg)}</span>`;
    toastWrap.appendChild(t);
    requestAnimationFrame(() => (t.className = 'toast show ' + (type || 'info')));
    setTimeout(() => { t.className = 'toast ' + (type || 'info'); setTimeout(() => t.remove(), 320); }, 2600);
  };

  App.toastHTML = function (html, type) {
    const t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    t.innerHTML = html;
    toastWrap.appendChild(t);
    requestAnimationFrame(() => (t.className = 'toast show ' + (type || 'info')));
    setTimeout(() => { t.className = 'toast ' + (type || 'info'); setTimeout(() => t.remove(), 320); }, 3200);
  };

  /* ===================== Modal ===================== */
  let modalOpen = false;
  App.openModal = function (html, title) {
    modalOpen = true;
    document.body.classList.add('modal-open');
    document.querySelectorAll('.modal-veil').forEach(v => v.remove());
    const veil = document.createElement('div');
    veil.className = 'modal-veil';
    const titleHtml = title ? `<h3>${App.esc(title)}</h3>` : '';
    veil.innerHTML = `<div class="modal-box"><div class="modal-head">${titleHtml}<button class="modal-close" aria-label="Close">${wrap('close')}</button></div>${html}</div>`;
    document.body.appendChild(veil);
    requestAnimationFrame(() => veil.classList.add('open'));
    veil.querySelector('.modal-close').addEventListener('click', () => App.closeModal());
    veil.addEventListener('click', (e) => { if (e.target === veil) App.closeModal(); });
    document.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', () => App.closeModal()));
  };
  App.closeModal = function () {
    modalOpen = false;
    document.body.classList.remove('modal-open');
    const v = document.querySelector('.modal-veil');
    if (v) { v.classList.remove('open'); setTimeout(() => v.remove(), 220); }
  };

  /* ===================== Card renderer (resale listing) ===================== */
  function condClass(c) { return 'cond-' + String(c || '').toLowerCase().replace(/\s+/g, '-'); }

  App.conditionChip = function (p) {
    if (!p.condition) return '';
    return `<span class="cond-chip ${condClass(p.condition)}">${App.esc(p.condition)}</span>`;
  };

  App.sellerLine = function (p) {
    const s = p.seller;
    if (!s) return '';
    return `<div class="seller-line">${wrap('user', 'i-xs')}<span class="seller-name">${App.esc(s.name)}</span><span class="seller-rate">${wrap('star', 'i-xs')} ${s.rating}</span></div>`;
  };

  App.renderCard = function (p, opts) {
    opts = opts || {};
    const wishClass = window.Wishlist && Wishlist.has(p.id) ? ' liked' : '';
    const heart = `<button class="wish-heart${wishClass}" data-wid="${p.id}" aria-label="Save listing" title="Save listing">${wrap('heart', 'wish-ico')}</button>`;
    const badges = `${App.conditionChip(p)}${p.listedDaysAgo != null && p.listedDaysAgo <= 2 ? '<span class="badge badge-new">Just listed</span>' : ''}`;
    const actions = (opts.list ? `
      <div class="list-body-row">
        <button class="btn btn-primary btn-sm" data-add="${p.id}">Add to Cart</button>
        <button class="btn btn-outline btn-sm" data-buy="${p.id}">Buy Now</button>
        <button class="btn btn-ghost btn-sm wish-inline" data-wid="${p.id}">${wrap('heart', 'wish-ico')} Save</button>
      </div>` : `
      <div class="card-actions">
        <button class="btn btn-ghost btn-sm" data-buy="${p.id}">Buy Now</button>
        <button class="card-actions-add" data-add="${p.id}" aria-label="Add to cart" title="Add to cart">Add to Cart ${wrap('bag')}</button>
      </div>`);
    const name = `<a class="name" href="product.html?id=${p.id}">${App.esc(p.name)}</a>`;
    const cat = window.CATEGORY_META[p.category] ? window.CATEGORY_META[p.category].name : p.category;
    return `
    <article class="product-card listing-card${opts.list ? ' list-row-card' : ''}" data-pid="${p.id}">
      <div class="card-inner">
        <a class="thumb" href="product.html?id=${p.id}" aria-label="${App.esc(p.name)}">
          ${maxValid(p)[0] ? `<img src="${maxValid(p)[0]}" alt="${App.esc(p.name)}" loading="lazy">` : ''}
        </a>
        <div class="card-badges">${badges}</div>
        ${heart}
        ${actions}
      </div>
      <div class="card-body">
        <div class="cat">${App.esc(cat)}</div>
        ${name}
        <div class="card-price"><span class="price-now">${App.money(p.price)}</span></div>
        ${App.sellerLine(p)}
      </div>
    </article>`;
  };

  function maxValid(p) { return p.images && p.images.length ? p.images : []; }

  /* ===================== Global click delegation ===================== */
  document.addEventListener('click', function (e) {
    const t = e.target;

    const addEl = t.closest && t.closest('[data-add]');
    if (addEl && !addEl.closest('[data-buy-handled]')) {
      e.preventDefault();
      window.Cart && Cart.addFromUI(addEl.getAttribute('data-add'), addEl);
      return;
    }
    const buyEl = t.closest && t.closest('[data-buy]');
    if (buyEl) {
      e.preventDefault();
      window.Cart && Cart.buyNow(buyEl.getAttribute('data-buy'), buyEl.closest('[data-pid]') ? buyEl.closest('article').dataset.pid : buyEl.getAttribute('data-buy'));
      return;
    }
    const widEl = t.closest && t.closest('[data-wid]');
    if (widEl) {
      e.preventDefault();
      window.Wishlist && Wishlist.toggleUI(widEl.getAttribute('data-wid'), widEl);
      return;
    }
    const viewLink = t.closest && t.closest('[data-view-link]');
    if (viewLink) location.href = viewLink.getAttribute('data-view-link');
  }, false);

  /* ===================== Navbar ===================== */
  App.initNav = function () {
    const navEl = document.querySelector('.sticky');
    const onScroll = () => { if (navEl) navEl.classList.toggle('nav-scrolled', window.scrollY > 8); };
    addListener(window, 'scroll', onScroll, { passive: true });
    onScroll();

    const closeAnn = document.querySelector('.announce .close-announce');
    if (closeAnn) {
      const el = closeAnn.closest('.announce');
      if (localStorage.getItem(LS_KEYS.announce) !== '1') {
        closeAnn.addEventListener('click', () => { el.style.display = 'none'; localStorage.setItem(LS_KEYS.announce, '1'); });
      } else { el.style.display = 'none'; }
    }

    /* dropdowns */
    document.querySelectorAll('.dropdown').forEach(d => {
      d.addEventListener('click', (e) => {
        e.stopPropagation();
        const opened = d.classList.toggle('open');
        document.querySelectorAll('.dropdown').forEach(o => { if (o !== d) o.classList.remove('open'); });
        if (opened) setTimeout(() => document.addEventListener('click', () => { d.classList.remove('open'); }, { once: true }), 10);
      });
    });
    document.querySelectorAll('.link-drop').forEach(d => {
      document.addEventListener('click', (e) => { if (!d.contains(e.target)) d.classList.remove('open'); });
    });

    /* mobile menu */
    const mmBtn = document.querySelector('.nav-mobile-toggle');
    const mmPanel = document.querySelector('.menu-panel');
    if (mmBtn && mmPanel) {
      mmBtn.addEventListener('click', () => { mmPanel.classList.add('open'); document.body.classList.add('drawer-open'); });
      mmPanel.querySelector('.sheet-close').addEventListener('click', () => mmPanel.classList.remove('open'));
      mmPanel.addEventListener('click', (e) => { if (e.target === mmPanel) mmPanel.classList.remove('open'); });
      mmPanel.querySelectorAll('.has-sub').forEach(h => {
        h.addEventListener('click', () => { h.classList.toggle('open'); const s = h.nextElementSibling; if (s) s.style.maxHeight = h.classList.contains('open') ? s.scrollHeight + 'px' : '0'; });
      });
      mmPanel.querySelectorAll('a[href]').forEach(a => { a.addEventListener('click', () => document.body.classList.remove('drawer-open')); });
    }

    /* categories dropdown (button) */
    document.querySelectorAll('.nav-links .link-drop').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const li = btn.parentElement;
        const open = li.classList.toggle('open');
        document.querySelectorAll('.nav-links li.open').forEach(o => { if (o !== li) o.classList.remove('open'); });
      });
    });
    document.addEventListener('click', () => document.querySelectorAll('.nav-links li.open').forEach(o => o.classList.remove('open')));

    /* university selector */
    document.querySelectorAll('.uni-option[data-uni]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const u = b.getAttribute('data-uni');
        if (window.MP) MP.setUniversity(u);
        document.querySelectorAll('.uni-name').forEach(n => n.textContent = u);
        document.querySelectorAll('.uni-option').forEach(o => o.classList.toggle('on', o === b));
        document.querySelectorAll('.uni-drop').forEach(d => d.classList.remove('open'));
        App.toast('Now browsing ' + u, 'success');
      });
    });

    /* search */
    const navSearch = document.querySelector('.nav-search');
    const searchBtn = document.querySelector('[data-nav-search]');
    if (navSearch) {
      const toggle = () => {
        const open = navSearch.classList.toggle('open');
        if (open) { navSearch.querySelector('input') && navSearch.querySelector('input').focus(); }
      };
      if (searchBtn) { searchBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); }); }
      document.addEventListener('click', (e) => { if (navSearch.classList.contains('open') && !navSearch.contains(e.target) && !(searchBtn && searchBtn.contains(e.target))) navSearch.classList.remove('open'); });

      const input = navSearch.querySelector('input');
      const results = navSearch.querySelector('.search-results');
      if (input && results) {
        let debounce;
        input.addEventListener('input', () => {
          clearTimeout(debounce);
          debounce = setTimeout(() => { App.renderSearchResults(input.value, results); }, 120);
        });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) location.href = 'shop.html?q=' + encodeURIComponent(input.value.trim()); });
        const clearBtn = navSearch.querySelector('.clear-search');
        if (clearBtn) clearBtn.addEventListener('click', () => { input.value = ''; results.innerHTML = '<p class="no-hits">Type to search, try “linen” or “necklace”.</p>'; });
        if (!input.value) results.innerHTML = '<p class="no-hits">Type to search, try “linen” or “necklace”.</p>';
      }
    }

    /* cart drawer */
    const veil = document.querySelector('.drawer-veil');
    const drawer = document.querySelector('.cart-drawer');
    window.Cart && Cart.initDrawer(drawer, veil);
  };

  App.renderSearchResults = function (q, container) {
    q = (q || '').trim();
    if (!q) { container.innerHTML = '<p class="no-hits">Type to search, try “linen” or “necklace”.</p>'; return; }
    const ql = q.toLowerCase();
    const hits = (window.MP ? MP.available(window.PRODUCTS) : window.PRODUCTS).filter(p => {
      const hay = (p.name + ' ' + p.brand + ' ' + (p.tags || []).join(' ') + ' ' + (p.category || '') + ' ' + (CATEGORY_META[p.category] ? CATEGORY_META[p.category].name : '')).toLowerCase();
      return hay.includes(ql);
    }).slice(0, 6);
    if (!hits.length) { container.innerHTML = '<p class="no-hits">No products found for “' + App.esc(q) + '”.</p>'; return; }
    container.innerHTML = hits.map(p => `
      <a href="product.html?id=${p.id}">
        <img src="${p.images[0]}" alt="" loading="lazy">
        <span><b>${App.esc(p.name)}</b><small>${App.esc(p.brand)} · ${App.money(p.price)}</small></span>
      </a>`).join('');
    container.innerHTML += `<button class="clear-search" onclick="App.navClearSearch(this)">See all results</button>`;
  };

  App.navClearSearch = function () {
    location.href = 'shop.html';
  };

  /* ===================== Shared header / footer ===================== */
  const PAGE = document.body.getAttribute('data-page') || '';
  const isActive = (page) => (PAGE === page ? ' active' : '');

  App.initChrome = function () {
    const headerEl = document.getElementById('app-header');
    const footerEl = document.getElementById('app-footer');
    if (!headerEl && !footerEl) return;

    const avail = window.MP ? MP.available(window.PRODUCTS) : window.PRODUCTS;
    const catPresent = new Set(avail.map(p => p.category));
    const catLinks = Object.keys(window.CATEGORY_META).filter(k => catPresent.has(k)).map(k => ({ t: window.CATEGORY_META[k].name, l: 'shop.html?category=' + k }));
    const wantedSubs = ['Tops', 'Shirts', 'Dresses', 'Jeans', 'Trousers', 'Skirts', 'Sets', 'Earrings', 'Necklaces', 'Heels', 'Boots', 'Sneakers', 'Flats', 'Handbags', 'Backpacks', 'Textbooks'];
    const subSet = new Set(avail.map(p => p.subcategory));
    const subLinks = wantedSubs.filter(x => subSet.has(x)).map(x => ({ t: x, l: 'shop.html?sub=' + encodeURIComponent(x) }));
    const editLinks = [
      { t: 'Fresh on Campus', l: 'shop.html?sort=recent' },
      { t: 'Under ₹500', l: 'shop.html?max=500' },
      { t: 'Dorm Finds', l: 'shop.html?category=home' },
      { t: 'Books & Academics', l: 'shop.html?category=books' },
      { t: 'Top Seller Rating', l: 'shop.html?sort=seller' }
    ];

    const megaCol = (hed, links) => `
      <div class="mega-col">
        <div class="mega-hed">${hed}</div>
        ${links.map(c => `<a href="${c.l}">${c.t}</a>`).join('')}
      </div>`;

    const megaHtml = megaCol('Categories', catLinks) + megaCol('Shop by style', subLinks) + megaCol('Student finds', editLinks);
    const header = `
    <div class="announce" role="status">
      <span>Buy, sell &amp; discover things from students on your campus · now live at <b>Ashoka University</b></span>
      <button class="close-announce" aria-label="Dismiss" data-icon="close" data-icon-class="i-sm"></button>
    </div>
    <header class="sticky">
      <nav class="nav-inner container" aria-label="Main navigation">
        <div class="nav-left">
          <a class="logo" href="index.html"><span class="logo-mark" data-icon="flower"></span>Bloom</a>
          <div class="dropdown uni-drop">
            <button class="uni-btn" type="button" aria-label="Choose your university">
              <span class="uni-pin" data-icon="pin" data-icon-class="i-xs"></span>
              <span class="uni-name">${window.MP ? MP.university() : 'Ashoka University'}</span>
              <span class="uni-chev" data-icon="chev" data-icon-class="i-xs"></span>
            </button>
            <div class="dropdown-menu uni-menu">
              <div class="uni-menu-hed">Choose your campus</div>
              <button class="uni-option on" type="button" data-uni="Ashoka University">
                <span>Ashoka University</span><span class="uni-check" data-icon="check" data-icon-class="i-xs"></span>
              </button>
              <button class="uni-option is-soon" type="button" disabled>More universities coming soon</button>
            </div>
          </div>
        </div>
        <ul class="nav-links">
          <li><a class="nav-link${isActive('home') ? ' active' : ''}" href="index.html">Home</a></li>
          <li><a class="nav-link${isActive('shop') || PAGE === 'product' ? ' active' : ''}" href="shop.html">Shop</a></li>
          <li>
            <button class="nav-link link-drop" type="button" aria-haspopup="true">Categories ${wrap('chev', 'nav-badge-chev')}</button>
            <div class="mega"><div class="mega-grid">${megaHtml}</div></div>
          </li>
        </ul>
        <div class="nav-actions">
          <a class="sell-link" href="sell.html"><span class="sell-ico" data-icon="plus" data-icon-class="i-xs"></span> Sell on Bloom <span class="seller-badge" data-seller-badge style="display:none">0</span></a>
          <button class="nav-action" type="button" data-nav-search aria-label="Search"><span class="nav-emoji" data-icon="search"></span></button>
          <div class="dropdown">
            <button class="nav-action" type="button" aria-label="Account" data-account><span class="nav-emoji" data-icon="user"></span></button>
            <div class="dropdown-menu">
              <a href="account.html">My account</a>
              <a href="account.html?tab=orders">My orders</a>
              <a href="account.html?tab=wishlist">Wishlist</a>
              <div class="divider"></div>
              <a href="account.html?tab=settings">Settings</a>
              <a href="index.html" data-logout>Sign out</a>
            </div>
          </div>
          <a class="nav-action" href="wishlist.html" aria-label="Wishlist"><span class="nav-emoji wish-emoji" data-icon="heartF"></span><span class="count-badge" data-wishlist>0</span></a>
          <button class="nav-action" type="button" aria-label="Cart" data-cart-toggle><span class="nav-emoji" data-icon="cart"></span><span class="count-badge" data-bag>0</span></button>
          <button class="nav-mobile-toggle nav-action" aria-label="Open menu">${wrap('menu')}</button>
        </div>
      </nav>
      <div class="nav-search" role="search">
        <input type="text" placeholder="Search listings · try “jeans” or “textbook”" aria-label="Search products">
        <div class="search-results"></div>
      </div>
    </header>
    <div class="menu-panel" aria-label="Mobile menu">
      <div class="sheet">
        <div class="sheet-close"><button class="btn-icon" aria-label="Close menu">${wrap('close')}</button></div>
        <nav class="sheet-nav">
          <a href="index.html">Home</a>
          <a href="shop.html">Shop all</a>
          <span class="has-sub">Categories <span class="chev" data-icon="chevR" data-icon-class="i-sm"></span></span>
          <div class="sub">
            <a href="shop.html?category=clothing">Clothing</a>
            <a href="shop.html?category=shoes">Shoes</a>
            <a href="shop.html?category=bags">Bags</a>
            <a href="shop.html?category=jewellery">Jewellery</a>
            <a href="shop.html?category=beauty">Beauty</a>
            <a href="shop.html?category=home">Home</a>
            <a href="shop.html?category=accessories">Accessories</a>
          </div>
          <a href="shop.html?sort=recent">Fresh on Campus</a>
          <a href="shop.html?max=500">Under ₹500</a>
          <a href="shop.html?category=books">Books &amp; Academics</a>
          <a href="sell.html" class="sheet-sell"><span class="sell-ico" data-icon="plus" data-icon-class="i-xs"></span> Sell on Bloom</a>
          <a href="account.html">Account</a>
          <a href="wishlist.html">Wishlist</a>
          <a href="cart.html">Cart</a>
          <a href="checkout.html">Checkout</a>
        </nav>
      </div>
    </div>
    <div class="drawer-veil"></div>
    <aside class="cart-drawer" aria-label="Shopping bag">
      <div class="drawer-head">
        <h3>Your bag</h3>
        <button class="btn-icon drawer-close" aria-label="Close bag">${wrap('close')}</button>
      </div>
      <div class="drawer-body"></div>
      <div class="drawer-foot"></div>
    </aside>`;

    const footer = `
    <footer class="footer">
      <span class="deco-leaf-tl"><svg class="leaf-svg" viewBox="0 0 22 22"><path d="M12 4 C 14 5 15.4 7 14.5 9 12 9.6 C 8.5 8.6 6 6 6 4 C 5 2.6 4 1 4 2.6" fill="none" stroke="currentColor"/></svg></span>
      <div class="container footer-grid">
        <div>
          <a class="logo" href="index.html"><span class="logo-mark" data-icon="flower"></span>Bloom</a>
          <p style="margin-top:14px">A student-to-student resale marketplace. Buy, sell and discover pre-owned things from students on your campus, with on-campus pickup.</p>
          <div class="socials">
            <a href="contact.html" aria-label="Instagram">${wrap('heart')}</a>
            <a href="contact.html" aria-label="Pinterest">${wrap('leaf')}</a>
            <a href="contact.html" aria-label="TikTok">${wrap('eye')}</a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          ${Object.keys(window.CATEGORY_META).map(k => `<a href="shop.html?category=${k}">${window.CATEGORY_META[k].name}</a>`).join('')}
          </div>
        <div>
          <h4>Help</h4>
          <a href="delivery.html">Delivery &amp; returns</a>
          <a href="track.html">Track an order</a>
          <a href="size-guide.html">Size guide</a>
          <a href="care.html">Care guide</a>
          <a href="contact.html">Contact us</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="info.html#story">Our story</a>
          <a href="info.html#sustainability">Sustainability</a>
          <a href="info.html#careers">Careers</a>
          <a href="sell.html">Sell on Bloom</a>
          <a href="info.html#press">Press</a>
          <a href="info.html#privacy">Privacy &amp; terms</a>
        </div>
      </div>
      <div class="container foot-bottom">
        <span>© 2026 Bloom Marketplace · made with care and plenty of petal</span>
        <span class="pay-notes">${wrap('check')} Student verified · ${wrap('pin')} Campus pickup · ${wrap('leaf')} Second-hand first</span>
      </div>
    </footer>`;

    if (headerEl) headerEl.innerHTML = header;
    if (footerEl) footerEl.innerHTML = footer;

    /* wire cart toggle for drawer */
    const cartToggle = document.querySelectorAll('[data-cart-toggle]');
    cartToggle.forEach(b => b.addEventListener('click', (e) => {
      e.preventDefault();
      const d = document.querySelector('.cart-drawer');
      const v = document.querySelector('.drawer-veil');
      if (!d) return;
      const isOpen = d.classList.contains('open');
      if (isOpen) Cart.closeDrawer();
      else Cart.announceCartOpen();
    }));

    /* logout link */
    document.querySelectorAll('[data-logout]').forEach(a => a.addEventListener('click', (e) => {
      e.preventDefault();
      try { localStorage.removeItem('bloom_profile'); } catch (x) {}
      App.openModal(`<p style="margin-top:10px;color:var(--muted)">You’ve signed out from this device. Your bag &amp; wishlist are still saved in the browser.</p>
        <button class="btn btn-primary btn-block" data-close-modal style="margin-top:14px">Close</button>`, 'Signed out');
    }));
  };

  /* Home page assembly */
  App.initHome = function () {
    if (PAGE !== 'home') return;
    const avail = window.MP ? MP.available(window.PRODUCTS) : window.PRODUCTS;
    const byRecent = (list) => list.slice().sort((a, b) => (a.listedDaysAgo || 0) - (b.listedDaysAgo || 0));
    const fill = (sel, list) => { const el = document.querySelector(sel); if (el) el.innerHTML = list.map(p => App.renderCard(p)).join(''); };

    const recent = byRecent(avail);

    /* Just Listed — the newest four */
    fill('.home-just-grid', recent.slice(0, 4));
    /* Fresh on Campus — recently listed by students */
    fill('.home-fresh-grid', recent.slice(4, 12));

    /* Student Closet — clothing, accessories, footwear, bags & jewellery */
    const closetCats = new Set(['clothing', 'accessories', 'shoes', 'bags', 'jewellery']);
    fill('.home-closet-grid', byRecent(avail.filter(p => closetCats.has(p.category))).slice(0, 8));

    /* Under ₹500 */
    fill('.home-under-grid', byRecent(avail.filter(p => p.price <= 500)).slice(0, 8));

    /* Dorm Finds */
    fill('.home-dorm-grid', byRecent(avail.filter(p => p.category === 'home')).slice(0, 4));

    /* Books & Academics — show a listing invite while the shelf is empty */
    const booksEl = document.querySelector('.home-books-grid');
    if (booksEl) {
      const bookList = byRecent(avail.filter(p => p.category === 'books')).slice(0, 4);
      booksEl.innerHTML = bookList.length
        ? bookList.map(p => App.renderCard(p)).join('')
        : `<div class="empty-cta">${App.icon('book', 'i-lg')}<b>No textbooks listed yet.</b><span>Be the first from Ashoka to pass one on.</span><a class="btn btn-rose btn-sm" href="sell.html">List a textbook</a></div>`;
    }

    /* feature slab image — a lived-in campus find */
    const featureEl = document.querySelector('.home-feature-media');
    if (featureEl) {
      const star = recent.find(p => p.category === 'clothing') || recent[0] || window.PRODUCTS[0];
      featureEl.style.backgroundImage = `url(${star.images[0]})`;
      featureEl.innerHTML = `<span class="deco-flower" data-icon="flower"></span>`;
    }
  };

  /* Account dashboard */
  App.initAccount = function () {
    if (!document.querySelector('.acct-layout')) return;
    const tabs = document.querySelectorAll('.acct-nav a[data-tab]');
    const panels = document.querySelectorAll('.acct-panel');
    const paramTab = App.getParam('tab');
    let active = paramTab && ['profile', 'orders', 'wishlist', 'addresses', 'payments', 'settings'].includes(paramTab) ? paramTab : 'profile';

    function show(tab) {
      active = tab;
      tabs.forEach(t => t.classList.toggle('on', t.getAttribute('data-tab') === tab));
      panels.forEach(pan => pan.classList.toggle('on', pan.getAttribute('data-panel') === tab));
    }
    tabs.forEach(t => t.addEventListener('click', (e) => { e.preventDefault(); show(t.getAttribute('data-tab')); }));
    show(active);
    App.renderAccountOrders();
    App.renderAccountWishlist();
    App.renderAccountAddresses();
    App.renderAccountPayments();
    App.bindAccountSettings();

    /* profile form */
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
      try {
        const prof = JSON.parse(localStorage.getItem('bloom_profile') || 'null');
        if (prof) { if (profileForm.querySelector('[name="fname"]')) profileForm.querySelector('[name="fname"]').value = (prof.name || '').split(' ')[0]; }
      } catch (e) {}
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        App.toast('Profile updated', 'success');
      });
    }
    App.applyAvatar();
    const changeAvatarBtn = document.querySelector('[data-change-avatar]');
    if (changeAvatarBtn) changeAvatarBtn.addEventListener('click', () => {
      const opts = ['flower', 'leaf', 'sprig', 'sparkle', 'star', 'heartF'];
      App.openModal(`<p style="margin:0 0 12px;color:var(--muted)">Pick the mark that feels like you.</p>
        <div class="avatar-opts">${opts.map(o => `<button type="button" class="avatar-opt" data-icon="${o}" data-av="${o}" aria-label="${o}"></button>`).join('')}</div>`, 'Choose an avatar');
      App.hydrateIcons(document.querySelector('.modal-box'));
      document.querySelectorAll('[data-av]').forEach(b => b.addEventListener('click', () => {
        App.applyAvatar(b.getAttribute('data-av'));
        App.closeModal();
        App.toast('Avatar updated.', 'success');
      }));
    });
  };

  App.renderAccountOrders = function () {
    const wrap = document.querySelector('.orders-wrap');
    if (!wrap) return;
    let orders = [];
    try { orders = JSON.parse(localStorage.getItem('bloom_orders_v1') || '[]'); } catch (e) { orders = []; }
    if (!orders.length) {
      wrap.innerHTML = `<div class="no-results small"><h3>No orders yet</h3><p>Your orders will appear here after checkout.</p><a class="btn btn-primary" href="shop.html">Start shopping</a></div>`;
      return;
    }
    wrap.innerHTML = orders.slice(0, 6).map(o => {
      const statusCls = o.status === 'Cancelled' ? 'cancelled' : '';
      const itemsRow = o.items.map(it => `<img src="${it.image}" alt="${App.esc(it.name)}" title="${App.esc(it.name)}">`).join('');
      return `<article class="order-card ${statusCls}">
        <div class="oc-hed"><b>${o.number}</b><span class="oc-status">${o.status || 'Confirmed'}</span></div>
        <div class="oc-items">${itemsRow}</div>
        <div class="oc-meta">
          <span>Placed ${new Date(o.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>Campus pickup · ${o.eta}</span>
        </div>
        <div class="oc-actions">
          <button class="btn btn-light btn-sm" data-order-view="${o.number}">View details</button>
          <button class="btn btn-ghost btn-sm danger" data-order-cancel="${o.number}">Cancel order</button>
        </div>
      </article>`;
    }).join('');

    document.querySelectorAll('[data-order-view]').forEach(b => b.addEventListener('click', () => {
      const num = b.getAttribute('data-order-view');
      App.openModal(`<p style="margin-top:10px;color:var(--muted)">A full receipt for <b>${num}</b> was emailed to you. Track it in “My orders” any time.</p>`, `Order ${num}`);
    }));
    document.querySelectorAll('[data-order-cancel]').forEach(b => b.addEventListener('click', () => {
      try {
        let o = JSON.parse(localStorage.getItem('bloom_orders_v1') || '[]');
        const num = b.getAttribute('data-order-cancel');
        o = o.map(x => x.number === num ? Object.assign({}, x, { status: 'Cancelled' }) : x);
        localStorage.setItem('bloom_orders_v1', JSON.stringify(o));
        App.toast('Order cancelled · a refund is on its way.', 'info');
        App.renderAccountOrders();
      } catch (e) {}
    }));
  };

  App.renderAccountWishlist = function () {
    const wrap = document.querySelector('.acct-wishlist-wrap');
    if (!wrap) return;
    const ids = window.Wishlist.all().filter(id => window.getProduct(id) && !(window.MP && MP.isSold(id)));
    wrap.querySelector('.wishlist-count') && (wrap.querySelector('.wishlist-count').textContent = ids.length + ' ' + App.maybePlural(ids.length, 'item'));
    if (!ids.length) { wrap.innerHTML = `<div class="no-results small"><h3>A quiet corner</h3><p>Saved pieces will wait for you here.</p><a class="btn btn-primary" href="shop.html">Browse the shop</a></div>`; return; }
    wrap.innerHTML = `<div class="wish-grid">${ids.map(id => App.renderCard(window.getProduct(id))).join('')}</div>`;
  };

  App.renderAccountAddresses = function () {
    const wrap = document.querySelector('.addresses-wrap');
    if (!wrap) return;
    let addresses = [];
    try { addresses = JSON.parse(localStorage.getItem('bloom_addresses') || '[]'); } catch (e) { addresses = []; }
    let prof = null;
    try { prof = JSON.parse(localStorage.getItem('bloom_profile') || 'null'); } catch (e) {}
    if (prof && !addresses.length) addresses.push({ default: true, name: prof.name || 'Home', line: prof.line, city: prof.city, state: prof.state, pin: prof.pin, phone: prof.phone });
    if (!addresses.length) { addresses.push({ default: true, name: 'Home', line: '12 Rosewater Lane', city: 'New Delhi', state: 'Delhi', pin: '110001', phone: '98765 43210' }); }

    wrap.innerHTML = addresses.map((a, i) => `
      <div class="address-card">
        ${a.default ? '<span class="addr-default">Default</span>' : ''}
        <b>${App.esc(a.name)}</b>
        <p>${App.esc(a.line)}<br>${App.esc(a.city)}, ${App.esc(a.state)} ${a.pin}<br>${App.esc(a.phone || '')}</p>
        <div class="addr-actions">
          <button class="btn btn-ghost btn-sm" data-addr-edit="${i}">Edit</button>
          ${a.default ? '' : `<button class="btn btn-ghost btn-sm" data-addr-del="${i}">Make default</button>`}
          <button class="btn btn-ghost btn-sm danger" data-addr-del="${i}">Remove</button>
        </div>
      </div>`).join('') + `
      <button class="btn btn-outline" data-addr-add>+ Add a new address</button>`;

    document.querySelectorAll('[data-addr-add]').forEach(b => b.addEventListener('click', () => {
      App.openModal(`
        <label class="field"><span>Label</span><input type="text" value="Home"></label>
        <label class="field"><span>Address</span><input type="text" value=""></label>
        <div class="col2">
          <label class="field"><span>City</span><input type="text" value=""></label>
          <label class="field"><span>State</span><input type="text" value=""></label>
          <label class="field"><span>Pincode</span><input type="text" value=""></label>
          <label class="field"><span>Phone</span><input type="text" value=""></label>
        </div>
        <button class="btn btn-primary btn-block" data-addr-save style="margin-top:12px">Save address</button>`, 'New address');
      document.querySelectorAll('[data-addr-save]').forEach(s => s.addEventListener('click', () => {
        const vals = Array.from(document.querySelectorAll('.modal-box input')).filter(i => !i.closest('.col2') || i.closest('.col2')).map(i => i.value.trim());
        try {
          let list = JSON.parse(localStorage.getItem('bloom_addresses') || '[]');
          list.push({ name: vals[0] || 'Home', line: vals[1], city: vals[2], state: vals[3], pin: vals[4], phone: vals[5], default: false });
          localStorage.setItem('bloom_addresses', JSON.stringify(list));
        } catch (e) {}
        App.closeModal(); App.toast('Address saved.', 'success'); App.renderAccountAddresses();
      }));
    }));
  };

  App.renderAccountPayments = function () {
    const wrap = document.querySelector('.payments-wrap');
    if (!wrap) return;
    let cards = [];
    try { cards = JSON.parse(localStorage.getItem('bloom_cards') || '[]'); } catch (e) { cards = []; }
    if (!cards.length) cards.push({ brand: 'Visa', last: '5042', exp: '08/27' });
    wrap.innerHTML = cards.map((c, i) => `
      <div class="pay-card">
        <div class="pay-brand"><span class="pm-ico">${App.icon('card')}</span>
          <div><b>${c.brand} ending ${c.last}</b><small>Expires ${c.exp}</small></div>
        </div>
        <div class="pay-actions"><button class="btn btn-ghost btn-sm" data-pay-del="${i}">Remove</button></div>
      </div>`).join('') + `
      <button class="btn btn-outline" data-pay-add>+ Add a card</button>`;
    document.querySelectorAll('[data-pay-add]').forEach(b => b.addEventListener('click', () => {
      App.openModal(`
        <label class="field"><span>Card</span><input type="text" placeholder="Visa ···· 5042"></label>
        <div class="col2">
          <label class="field"><span>Expiry</span><input type="text" placeholder="MM/YY" value=""></label>
          <label class="field"><span>CVV</span><input type="text" placeholder="···" maxlength="3"></label>
        </div>
        <button class="btn btn-primary btn-block" data-pay-save style="margin-top:12px">Save card</button>`, 'Add payment method');
      document.querySelectorAll('[data-pay-save]').forEach(s => s.addEventListener('click', () => {
        const inputs = Array.from(document.querySelectorAll('.modal-box input')).map(i => i.value.trim());
        if (!inputs[0]) { App.toast('Enter a card number first.', 'error'); return; }
        const dig = inputs[0].replace(/\D/g, '');
        let list = [];
        try { list = JSON.parse(localStorage.getItem('bloom_cards') || '[]'); } catch (e) {}
        list.unshift({ brand: dig[0] === '4' ? 'Visa' : 'Mastercard', last: dig.slice(-4), exp: inputs[1] || '' });
        localStorage.setItem('bloom_cards', JSON.stringify(list));
        App.closeModal(); App.toast('Card saved.', 'success'); App.renderAccountPayments();
      }));
    }));
  };

  App.bindAccountSettings = function () {
    const form = document.querySelector('.settings-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      App.toast('Settings saved', 'success');
    });
    const toggles = form.querySelectorAll('input[type="checkbox"]');
    toggles.forEach(t => {
      const key = 'bloom_set_' + t.getAttribute('data-setting');
      try { t.checked = localStorage.getItem(key) === '1'; } catch (e) {}
      t.addEventListener('change', () => {
        localStorage.setItem(key, t.checked ? '1' : '0');
        App.toast(t.checked ? 'Preference on.' : 'Preference off.', 'info');
      });
    });
  };

  /* banner strip duplicate for marquee */
  App.initMarquee = function () {
    const m = document.querySelector('.marquee .track');
    if (m) { m.innerHTML += m.innerHTML; }
  };

  /* newsletter */
  App.initNewsletter = function () {
    const f = document.querySelector('.newsletter form');
    if (f) f.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = f.querySelector('input').value.trim();
      if (!v) return;
      App.toast('Welcome to the Bloom letters · a sprig of inspiration is on its way', 'success');
      f.querySelector('input').value = '';
    });
  };

  /* reveal on scroll */
  App.initReveal = function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }) : null;
    if (io) { els.forEach(el => io.observe(el)); }
    else { els.forEach(el => el.classList.add('in')); }
  };

  /* recently viewed */
  App.recordView = function (id) {
    try {
      let list = JSON.parse(localStorage.getItem(LS_KEYS.recent) || '[]');
      list = [id].concat(list.filter(x => x !== id)).slice(0, 8);
      localStorage.setItem(LS_KEYS.recent, JSON.stringify(list));
    } catch (e) {}
  };

  App.getRecent = function () {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.recent) || '[]'); } catch (e) { return []; }
  };

  App.lsViewPref = {
    get: () => localStorage.getItem(LS_KEYS.viewPref) || 'grid',
    set: (v) => localStorage.setItem(LS_KEYS.viewPref, v)
  };

  /* helpers */
  function addListener(el2, ev, fn, opts) { (el2 && el2.addEventListener ? el2.addEventListener(ev, fn, opts) : 0); }

  /* motion / hover feature flags · reveal behaviour is handled in CSS media queries */
  const reducedMotion = (function () {
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  })();
  if (reducedMotion) document.documentElement.classList.add('reduced-motion');

  App.boot = function () {
    App.initChrome();
    App.initNav();
    App.initMarquee();
    App.initNewsletter();
    App.initHome();
    App.hydrateIcons();
    if (window.MP) MP.updateBadge();
    App.initReveal();
    App.initAccount();
  };
})();