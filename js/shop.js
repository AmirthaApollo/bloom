/* ============================================================
   Bloom · Shop / listings page (resale filters, sorting, search)
   Depends on products.js, marketplace.js, app.js, cart.js, wishlist.js
   ============================================================ */

(function () {
  'use strict';

  if (!document.querySelector('.shop-layout')) return;

  const App = window.App;

  const PRICE_BUCKETS = [
    { key: '0-250', label: 'Under ₹250', min: 0, max: 250 },
    { key: '250-500', label: '₹250 – ₹500', min: 250, max: 500 },
    { key: '500-1000', label: '₹500 – ₹1,000', min: 500, max: 1000 },
    { key: '1000-', label: '₹1,000 +', min: 1000, max: Infinity }
  ];
  const CONDITIONS = ['Like New', 'Excellent', 'Good', 'Fair'];
  const LISTED = [
    { key: '1', label: 'Last 24 hours' },
    { key: '7', label: 'This week' },
    { key: '30', label: 'This month' }
  ];

  /* ---------- state (incl. URL deep links) ---------- */
  const S = {
    search: (App.getParam('q') || '').trim(),
    category: App.getParam('category') || '',
    sub: App.getParam('sub') || '',
    newOnly: App.getParam('new') ? true : false,
    categories: new Set(),
    conditions: new Set(),
    price: null,             // bucket key
    minPrice: App.getParam('min') ? Number(App.getParam('min')) : null,
    maxPrice: App.getParam('max') ? Number(App.getParam('max')) : null,
    sellerMin: 0,
    listedWithin: 0,
    sort: App.getParam('sort') || 'recent',
    view: App.lsViewPref.get() === 'list' ? 'list' : 'grid'
  };
  if (S.category && !window.CATEGORY_META[S.category]) S.category = '';

  const gridEl = document.querySelector('.products-grid');
  const countEl = document.querySelector('.shop-count');
  const titleEl = document.querySelector('.shop-title');
  const crumbEl = document.querySelector('.breadcrumbs');
  const noResultsEl = document.querySelector('.no-results');
  const searchInput = document.querySelector('.shop-search-input');

  function availList() { return window.MP ? MP.available(window.PRODUCTS) : window.PRODUCTS; }
  function priceBand() {
    if (S.price) { const b = PRICE_BUCKETS.find(x => x.key === S.price); if (b) return { min: b.min, max: b.max }; }
    return { min: S.minPrice, max: S.maxPrice };
  }

  /* ---------- results ---------- */
  function results() {
    let list = availList().slice();
    const q = S.search.toLowerCase().trim();
    if (q) list = list.filter(p => (p.name + ' ' + (p.tags || []).join(' ') + ' ' + p.subcategory + ' ' + (window.CATEGORY_META[p.category] ? window.CATEGORY_META[p.category].name : '')).toLowerCase().includes(q));
    if (S.category) list = list.filter(p => p.category === S.category);
    if (S.sub) list = list.filter(p => (p.subcategory || '') === S.sub);
    if (S.categories.size) list = list.filter(p => S.categories.has(p.category));
    if (S.newOnly) list = list.filter(p => p.listedDaysAgo != null && p.listedDaysAgo <= 7);
    if (S.conditions.size) list = list.filter(p => S.conditions.has(p.condition));
    if (S.sellerMin) list = list.filter(p => p.seller && p.seller.rating >= S.sellerMin);
    if (S.listedWithin) list = list.filter(p => p.listedDaysAgo != null && p.listedDaysAgo <= S.listedWithin);
    const band = priceBand();
    if (band.min != null) list = list.filter(p => p.price >= band.min);
    if (band.max != null && band.max !== Infinity) list = list.filter(p => p.price <= band.max);

    switch (S.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'seller': list.sort((a, b) => (b.seller ? b.seller.rating : 0) - (a.seller ? a.seller.rating : 0)); break;
      default: list.sort((a, b) => (a.listedDaysAgo || 0) - (b.listedDaysAgo || 0));
    }
    return list;
  }

  function pageTitle() {
    if (S.search) return 'Results for “' + S.search + '”';
    if (S.newOnly) return 'Fresh on Campus';
    if (S.conditions.size === 1) return [...S.conditions][0] + ' listings';
    if (S.sub) return S.sub;
    if (S.category && window.CATEGORY_META[S.category]) return window.CATEGORY_META[S.category].name;
    if (S.price) { const b = PRICE_BUCKETS.find(x => x.key === S.price); if (b) return b.label; }
    if (S.maxPrice != null && S.minPrice == null) return 'Under ' + App.money(S.maxPrice).replace(/\.00$/, '');
    return 'All listings';
  }

  function render() {
    const list = results();
    countEl.textContent = list.length + ' ' + App.maybePlural(list.length, 'listing');
    if (titleEl) titleEl.textContent = pageTitle();
    if (crumbEl) crumbEl.querySelectorAll('.crumb-current').forEach(c => c.textContent = pageTitle());

    if (!list.length) {
      noResultsEl.style.display = '';
      gridEl.innerHTML = '';
      gridEl.classList.remove('list-active');
      return;
    }
    noResultsEl.style.display = 'none';
    gridEl.classList.toggle('list-active', S.view === 'list');
    gridEl.innerHTML = list.map(p => App.renderCard(p, { list: S.view === 'list' })).join('');
  }

  /* ---------- filter tree ---------- */
  function countFor(pred) { return availList().filter(pred).length; }
  function allBrands() { return []; }

  function renderFilters(target) {
    if (!target) return;
    const check = (on) => on ? ' checked' : '';
    const catChecks = Object.keys(window.CATEGORY_META).filter(k => countFor(p => p.category === k) > 0).map(k =>
      `<label class="filter-check"><input type="checkbox" data-cat="${k}"${check(S.categories.has(k) || S.category === k)}><span>${window.CATEGORY_META[k].name}</span><small>${countFor(p => p.category === k)}</small></label>`).join('');
    const condChecks = CONDITIONS.map(c =>
      `<label class="filter-check"><input type="checkbox" data-cond="${c}"${check(S.conditions.has(c))}><span>${c}</span><small>${countFor(p => p.condition === c)}</small></label>`).join('');
    const priceRadios = PRICE_BUCKETS.map(b =>
      `<label class="filter-check"><input type="radio" name="price-${target.id || 'x'}" data-price="${b.key}"${check(S.price === b.key)}><span>${b.label}</span><small>${countFor(p => p.price >= b.min && (b.max === Infinity || p.price <= b.max))}</small></label>`).join('');
    const sellerRadios = [['4.5', '4.5 & up'], ['4.0', '4.0 & up']].map(([v, l]) =>
      `<label class="filter-check"><input type="radio" name="seller-${target.id || 'x'}" data-seller="${v}"${check(String(S.sellerMin) === v)}><span>${l}</span></label>`).join('');
    const listedRadios = LISTED.map(x =>
      `<label class="filter-check"><input type="radio" name="listed-${target.id || 'x'}" data-listed="${x.key}"${check(String(S.listedWithin) === x.key)}><span>${x.label}</span></label>`).join('');

    target.innerHTML = `
      <div class="filter-head"><span>Filters</span><small data-clear-filters>Clear all</small></div>

      <details class="filter-group" open>
        <summary>Category <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">${catChecks}</div>
      </details>

      <details class="filter-group" open>
        <summary>Price <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">${priceRadios}</div>
      </details>

      <details class="filter-group" open>
        <summary>Condition <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">${condChecks}</div>
      </details>

      <details class="filter-group" open>
        <summary>Seller rating <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">${sellerRadios}
          <label class="filter-check"><input type="radio" name="seller-${target.id || 'x'}" data-seller="0"${check(!S.sellerMin)}><span>Any rating</span></label>
        </div>
      </details>

      <details class="filter-group" open>
        <summary>Recently listed <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">${listedRadios}
          <label class="filter-check"><input type="radio" name="listed-${target.id || 'x'}" data-listed="0"${check(!S.listedWithin)}><span>Any time</span></label>
        </div>
      </details>`;

    bindFilters(target);
  }

  function bindFilters(target) {
    const wire = (sel, fn) => target.querySelectorAll(sel).forEach(el => el.addEventListener('change', fn));

    wire('[data-cat]', (e) => { const v = e.target.getAttribute('data-cat'); if (e.target.checked) S.categories.add(v); else S.categories.delete(v); apply(); });
    wire('[data-cond]', (e) => { const v = e.target.getAttribute('data-cond'); if (e.target.checked) S.conditions.add(v); else S.conditions.delete(v); apply(); });
    wire('[data-price]', (e) => { S.price = e.target.checked ? e.target.getAttribute('data-price') : null; S.minPrice = null; S.maxPrice = null; syncOther(target, e.target); apply(); });
    wire('[data-seller]', (e) => { S.sellerMin = e.target.checked ? Number(e.target.getAttribute('data-seller')) : 0; apply(); });
    wire('[data-listed]', (e) => { S.listedWithin = e.target.checked ? Number(e.target.getAttribute('data-listed')) : 0; apply(); });

    target.querySelectorAll('[data-clear-filters]').forEach(t => t.addEventListener('click', () => clearAll()));
  }
  function syncOther(target, changed) { /* radios already exclusive by name */ }

  function clearAll() {
    S.categories = new Set(); S.conditions = new Set(); S.price = null; S.minPrice = null; S.maxPrice = null; S.sellerMin = 0; S.listedWithin = 0; S.newOnly = false;
    document.querySelectorAll('.filter-panel input, .filter-drawer input').forEach(i => { if (i.type === 'checkbox') i.checked = false; });
    document.querySelectorAll('.filter-panel input[value=""], .filter-drawer input[value=""]').forEach(() => {});
    document.querySelectorAll('input[data-listed="0"], input[data-seller="0"]').forEach(i => i.checked = false);
    apply();
  }

  function apply() { render(); }

  /* ---------- toolbar ---------- */
  function bindToolbar() {
    const sortEl = document.querySelector('.sort-select');
    if (sortEl) { sortEl.value = S.sort; sortEl.addEventListener('change', () => { S.sort = sortEl.value; apply(); }); }
    document.querySelectorAll('.view-toggle button').forEach(b => {
      b.addEventListener('click', () => {
        S.view = b.getAttribute('data-view');
        App.lsViewPref.set(S.view);
        document.querySelectorAll('.view-toggle button').forEach(x => x.classList.toggle('on', x === b));
        gridEl.classList.toggle('list-active', S.view === 'list');
        apply();
      });
    });
    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(() => { S.search = searchInput.value.trim(); apply(); }, 130); });
      searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { S.search = searchInput.value.trim(); apply(); } });
      if (S.search) searchInput.value = S.search;
    }
  }

  /* ---------- mobile filter drawer ---------- */
  function bindFilterDrawer() {
    const openBtn = document.querySelector('[data-filter-open]');
    const veil = document.querySelector('.filter-veil');
    const drawer = document.querySelector('.filter-drawer');
    if (!openBtn || !drawer) return;
    openBtn.addEventListener('click', () => { veil.classList.add('open'); drawer.classList.add('open'); document.body.classList.add('drawer-open'); });
    const close = () => { veil.classList.remove('open'); drawer.classList.remove('open'); document.body.classList.remove('drawer-open'); };
    const closeBtn = drawer.querySelector('.drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    veil.addEventListener('click', close);
    const applyBtn = drawer.querySelector('.btn-apply');
    if (applyBtn) applyBtn.addEventListener('click', close);
  }

  function init() {
    const panel = document.querySelector('.filter-panel'); if (panel) panel.id = 'panel';
    const dbody = document.querySelector('.filter-drawer .filter-body'); if (dbody) dbody.id = 'drawer';
    renderFilters(panel);
    renderFilters(dbody);
    bindToolbar();
    bindFilterDrawer();
    gridEl.classList.toggle('list-active', S.view === 'list');
    apply();
  }

  window.Shop = { init, S, apply, render };
  init();
})();