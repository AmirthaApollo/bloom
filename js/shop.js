/* ============================================================
   Bloom · Shop listing page (filters, sorting, search, view)
   Depends on products.js, app.js, cart.js, wishlist.js
   ============================================================ */

(function () {
  'use strict';

  if (!document.querySelector('.shop-layout')) return;

  const App = window.App;

  /* ---------- state (incl. URL deep links) ---------- */
  const S = {
    search: (App.getParam('q') || '').trim(),
    category: App.getParam('category') || '',
    sub: App.getParam('sub') || '',
    gender: App.getParam('gender') || '',
    lifestyle: App.getParam('lifestyle') ? true : false,
    bottoms: App.getParam('bottoms') ? true : false,
    newOnly: App.getParam('new') ? true : false,
    categories: new Set(),
    brands: new Set(),
    minPrice: App.getParam('min') ? Number(App.getParam('min')) : null,
    maxPrice: App.getParam('max') ? Number(App.getParam('max')) : null,
    ratingMin: 0,
    discountMin: App.getParam('disc') ? Math.max(1, Number(App.getParam('disc')) || 1) : 0,
    sizes: new Set(),
    colors: new Set(),
    sort: App.getParam('sort') || 'popular',
    view: App.lsViewPref.get() === 'list' ? 'list' : 'grid'
  };

  const gridEl = document.querySelector('.products-grid');
  const countEl = document.querySelector('.shop-count');
  const titleEl = document.querySelector('.shop-title');
  const crumbEl = document.querySelector('.breadcrumbs');
  const noResultsEl = document.querySelector('.no-results');
  const searchInput = document.querySelector('.shop-search-input');

  const PRICE_MAX = Math.max.apply(Math, availList().map(p => p.price)) || 8000;

  if (S.search && searchInput) searchInput.value = S.search;
  if (S.category && !window.CATEGORY_META[S.category]) S.category = '';

  const BOTTOMS = new Set(['Trousers', 'Jeans', 'Jorts', 'Skirts']);

  const GENDER_MAP = {
    women: new Set(['clothing', 'shoes', 'bags', 'jewellery', 'accessories', 'beauty']),
    men: new Set(['clothing', 'shoes', 'bags', 'accessories'])
  };

  function inRange(p) {
    if (S.minPrice != null && p.price < S.minPrice) return false;
    if (S.maxPrice != null && p.price > S.maxPrice) return false;
    return true;
  }

  /* ---------- results ---------- */
  function results() {
    let list = (window.MP ? MP.available(window.PRODUCTS) : window.PRODUCTS).slice();
    const q = S.search.toLowerCase().trim();
    if (q) list = list.filter(p => (p.name + ' ' + p.brand + ' ' + (p.tags || []).join(' ') + ' ' + (window.CATEGORY_META[p.category] ? window.CATEGORY_META[p.category].name : '')).toLowerCase().includes(q));
    if (S.category) list = list.filter(p => p.category === S.category);
    if (S.sub) list = list.filter(p => (p.subcategory || '') === S.sub);
    if (S.lifestyle) list = list.filter(p => p.category === 'home' || p.category === 'beauty');
    if (S.bottoms) list = list.filter(p => BOTTOMS.has(p.subcategory));
    if (S.gender) { const set = GENDER_MAP[S.gender]; if (set) list = list.filter(p => set.has(p.category)); }
    if (S.categories.size) list = list.filter(p => S.categories.has(p.category));
    if (S.brands.size) list = list.filter(p => S.brands.has(p.brand));
    if (S.newOnly) list = list.filter(p => p.isNew);
    list = list.filter(inRange);
    if (S.ratingMin) list = list.filter(p => p.rating >= S.ratingMin);
    if (S.discountMin) list = list.filter(p => p.discount >= S.discountMin);
    if (S.sizes.size) list = list.filter(p => (p.sizes || []).some(s => S.sizes.has(s)));
    if (S.colors.size) list = list.filter(p => (p.colors || []).some(c => S.colors.has(c)));

    switch (S.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews); break;
      case 'newest': list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.popularity - a.popularity); break;
      default: list.sort((a, b) => b.popularity - a.popularity || b.rating - a.rating);
    }
    return list;
  }

  function pageTitle() {
    if (S.search) return 'Results for \u201C' + S.search + '\u201D';
    if (S.bottoms) return 'Bottoms';
    if (S.newOnly) return 'New Arrivals';
    if (S.discountMin) return 'On Sale';
    if (S.sub) return S.sub;
    if (S.category && window.CATEGORY_META[S.category]) return window.CATEGORY_META[S.category].name;
    if (S.lifestyle) return 'Lifestyle';
    if (S.maxPrice != null && S.minPrice == null) return 'Under ' + App.money(S.maxPrice).replace(/\.00$/, '');
    if (S.minPrice != null && S.maxPrice != null) return App.money(S.minPrice).replace(/\.00$/, '') + ' \u2013 ' + App.money(S.maxPrice).replace(/\.00$/, '');
    if (S.sort === 'rating') return 'Top Rated';
    if (S.sort === 'newest') return 'New Arrivals';
    return 'All products';
  }

  function render() {
    const list = results();
    countEl.textContent = list.length + ' ' + App.maybePlural(list.length, 'product');
    if (titleEl) titleEl.textContent = pageTitle();
    if (crumbEl) {
      const current = pageTitle();
      crumbEl.querySelectorAll('.crumb-current').forEach(c => c.textContent = current);
    }
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

  /* ---------- filter tree generation ---------- */
  function availList() { return window.MP ? MP.available(window.PRODUCTS) : window.PRODUCTS; }
  function countFor(pred) { return availList().filter(pred).length; }

  function renderFilters(target) {
    if (!target) return;
    const check = (checked) => checked ? ' checked' : '';
    const catChecks = Object.keys(window.CATEGORY_META).map(k => {
      const label = window.CATEGORY_META[k];
      return `<label class="filter-check"><input type="checkbox" data-cat="${k}"${check(S.categories.has(k))}><span>${label.name}</span><small>${countFor(p => p.category === k)}</small></label>`;
    }).join('');

    const allSizes = Array.from(new Set([].concat.apply([], availList().map(p => p.sizes || []))));
    const sizeChecks = allSizes.map(sz => {
      const key = el(sz);
      return `<label class="filter-check"><input type="checkbox" data-size="${key}"${check(S.sizes.has(sz))}><span>${App.esc(sz)}</span><small>${countFor(p => (p.sizes || []).includes(sz))}</small></label>`;
    }).join('');

    const allColors = Array.from(new Set([].concat.apply([], availList().map(p => p.colors || []))));
    const colorSwatches = allColors.map(c => {
      const key = el(c);
      const hex = window.colorHex(c);
      return `<span class="swatch-label ${S.colors.has(c) ? 'checked' : ''}" title="${App.esc(c)}" style="background:${hex}">
        <input type="checkbox" data-color-swatch="${key}" ${S.colors.has(c) ? 'checked' : ''}><span class="dot"></span></span>`;
    }).join('');

    const html = `
      <div class="filter-head"><span>Filters</span><small data-clear-filters>Clear all</small></div>

      <details class="filter-group" open>
        <summary>Category <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">${catChecks}</div>
      </details>

      <details class="filter-group" open>
        <summary>New arrivals <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body"><label class="filter-check"><input type="checkbox" data-new ${S.newOnly ? 'checked' : ''}><span>Just dropped</span><small>${countFor(p => p.isNew)}</small></label></div>
      </details>

      <details class="filter-group" open>
        <summary>Price <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">
          <input type="range" class="price-slider" min="0" max="${PRICE_MAX}" value="${S.maxPrice != null ? S.maxPrice : PRICE_MAX}">
          <div class="range-labels"><span>₹0</span><span>₹${PRICE_MAX}</span></div>
          <div class="price-range-row">
            <input class="price-input-min" type="number" min="0" max="${PRICE_MAX}" value="${S.minPrice != null ? S.minPrice : 0}" aria-label="Minimum price" placeholder="Min">
            <span style="color:var(--muted)">–</span>
            <input class="price-input-max" type="number" min="0" max="${PRICE_MAX}" value="${S.maxPrice != null ? S.maxPrice : PRICE_MAX}" aria-label="Maximum price" placeholder="Max">
            <button class="price-apply" type="button">Go</button>
          </div>
        </div>
      </details>

      <details class="filter-group" open>
        <summary>Brand <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">${allBrands().map(b => `<label class="filter-check"><input type="checkbox" data-brand="${el(b)}"${check(S.brands.has(b))}><span>${App.esc(b)}</span><small>${countFor(p => p.brand === b)}</small></label>`).join('')}</div>
      </details>

      <details class="filter-group" open>
        <summary>Rating <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">
          <label class="star-filter"><input type="checkbox" data-star="4" ${S.ratingMin >= 4 ? 'checked' : ''}><span>${App.stars(4)} &amp; up</span></label>
          <label class="star-filter"><input type="checkbox" data-star="3" ${S.ratingMin === 3 ? 'checked' : ''}><span>${App.stars(3)} &amp; up</span></label>
        </div>
      </details>

      <details class="filter-group" open>
        <summary>Discount <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">
          <label class="filter-check"><input type="checkbox" data-disc="25" ${S.discountMin >= 25 ? 'checked' : ''}><span>25% off or more</span></label>
          <label class="filter-check"><input type="checkbox" data-disc="10" ${S.discountMin >= 10 && S.discountMin < 25 ? 'checked' : ''}><span>10% off or more</span></label>
          <label class="filter-check"><input type="checkbox" data-disc="1" ${S.discountMin >= 1 && S.discountMin < 10 ? 'checked' : ''}><span>Any discount</span></label>
        </div>
      </details>

      <details class="filter-group open">
        <summary>Size <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body">${sizeChecks}</div>
      </details>

      <details class="filter-group open">
        <summary>Colour <span class="chev">${App.icon('chev', 'i-sm')}</span></summary>
        <div class="body"><div class="swatches">${colorSwatches}</div><label class="filter-check"><input type="checkbox" data-color-label ${S.colors.size ? '' : 'checked'}><span>All colours</span></label></div>
      </details>`;

    target.innerHTML = html;
    bindFilters(target);
  }

  function el(s) { return String(s).replace(/"/g, '&quot;'); }

  function allBrands() {
    return Array.from(new Set(availList().map(p => p.brand))).sort();
  }

  /* ---------- bind inputs within a filter container ---------- */
  function bindFilters(target) {
    const wire = (sel, fn) => target.querySelectorAll(sel).forEach(el2 => el2.addEventListener('change', fn));

    wire('[data-cat]', (e) => { const v = e.target.getAttribute('data-cat'); if (e.target.checked) S.categories.add(v); else S.categories.delete(v); apply(); });
    wire('[data-brand]', (e) => { const v = e.target.getAttribute('data-brand'); if (e.target.checked) S.brands.add(v); else S.brands.delete(v); apply(); });
    wire('[data-new]', (e) => { S.newOnly = e.target.checked; apply(); });
    wire('[data-star]', (e) => {
      const v = Number(e.target.getAttribute('data-star'));
      target.querySelectorAll('[data-star]').forEach(x => { if (x !== e.target && Number(x.getAttribute('data-star')) >= v) x.checked = e.target.checked; });
      S.ratingMin = e.target.checked ? v : Math.max(0, Math.min.apply(Math, Array.from(target.querySelectorAll('[data-star]:checked')).map(x => Number(x.getAttribute('data-star'))).concat([0])));
      apply();
    });
    wire('[data-disc]', (e) => {
      const v = Number(e.target.getAttribute('data-disc'));
      target.querySelectorAll('[data-disc]').forEach(x => { if (x !== e.target && Number(x.getAttribute('data-disc')) >= v) x.checked = e.target.checked; });
      S.discountMin = e.target.checked ? v : Math.max(0, Math.min.apply(Math, Array.from(target.querySelectorAll('[data-disc]:checked')).map(x => Number(x.getAttribute('data-disc'))).concat([0])));
      apply();
    });
    wire('[data-size]', (e) => { const v = e.target.getAttribute('data-size'); if (e.target.checked) S.sizes.add(v); else S.sizes.delete(v); apply(); });
    wire('[data-color-swatch]', (e) => {
      const v = e.target.closest('.swatch-label').getAttribute('title');
      e.target.closest('.swatch-label').classList.toggle('checked', e.target.checked);
      if (e.target.checked) S.colors.add(v); else S.colors.delete(v);
      target.querySelectorAll('[data-color-label]').forEach(c => c.checked = S.colors.size === 0);
      apply();
    });
    wire('[data-color-label]', (e) => { if (e.target.checked) { S.colors = new Set(); target.querySelectorAll('[data-color-swatch]').forEach(c => c.checked = false); target.querySelectorAll('.swatch-label').forEach(sl => sl.classList.remove('checked')); apply(); } });

    const priceMin = target.querySelector('.price-input-min');
    const priceMax = target.querySelector('.price-input-max');
    const priceApply = target.querySelector('.price-apply');
    const slider = target.querySelector('.price-slider');
    if (slider) slider.addEventListener('input', () => {
      S.maxPrice = Number(slider.value);
      if (priceMax) priceMax.value = S.maxPrice;
      apply();
    });
    if (priceApply) priceApply.addEventListener('click', () => {
      S.minPrice = priceMin.value !== '' && Number(priceMin.value) > 0 ? Number(priceMin.value) : null;
      S.maxPrice = priceMax.value !== '' && Number(priceMax.value) > 0 ? Number(priceMax.value) : null;
      apply();
    });

    target.querySelectorAll('[data-clear-filters]').forEach(t => t.addEventListener('click', () => clearAll()));
  }

  function clearAll() {
    S.categories = new Set(); S.brands = new Set(); S.minPrice = null; S.maxPrice = null;
    S.ratingMin = 0; S.discountMin = 0; S.sizes = new Set(); S.colors = new Set(); S.newOnly = false;
    document.querySelectorAll('.filter-panel input[type="checkbox"], .filter-drawer input[type="checkbox"]').forEach(i => i.checked = false);
    document.querySelectorAll('.swatch-label').forEach(sl => sl.classList.remove('checked'));
    apply();
  }

  function apply() {
    /* sync drawer & sidebar matches of newOnly/category from URL deep links */
    render();
  }

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

  /* ---------- init ---------- */
  function init() {
    renderFilters(document.querySelector('.filter-panel'));
    renderFilters(document.querySelector('.filter-drawer .filter-body'));
    bindToolbar();
    bindFilterDrawer();
    gridEl.classList.toggle('list-active', S.view === 'list');
    apply();
  }

  window.Shop = { init, S, apply, render };
  init();
})();