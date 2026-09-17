/* ============================================================
   Bloom · Product detail page
   Depends on products.js, app.js, cart.js, wishlist.js
   ============================================================ */

(function () {
  'use strict';

  if (!document.querySelector('.product-page')) return;

  const App = window.App;
  const id = App.getParam('id') || App.getRecent()[0] || window.PRODUCTS[0].id;
  const p = window.getProduct(id);

  if (!p) {
    document.querySelector('.product-layout').innerHTML =
      `<div class="no-results"><div class="flower-big">${App.icon('flower', 'i-xl')}</div><h3>We couldn’t find that bloom</h3><p>It may have wilted from our shelf.</p><a class="btn btn-primary" href="shop.html">Back to shop</a></div>`;
    throw new Error('product not found');
  }
  App.recordView(id);

  const S = { size: p.sizes ? p.sizes[0] || '' : '', color: p.colors ? p.colors[0] || '' : '', qty: 1 };

  const gallery = document.querySelector('.gallery-main img');
  const thumbsEl = document.querySelector('.gallery-thumbs');
  const sizeChips = document.querySelector('.size-chips');
  const colorChips = document.querySelector('.color-chips');
  const colorValue = document.querySelector('.color-value');
  const qtyVal = document.querySelector('.qty-val');

  /* ---------- Gallery ---------- */
  function setMain(i) {
    gallery.classList.remove('zoomed');
    gallery.style.transform = '';
    gallery.style.transformOrigin = '50% 50%';
    gallery.src = p.images[i];
    gallery.closest('.gallery-main').classList.add('fading');
    setTimeout(() => gallery.closest('.gallery-main').classList.remove('fading'), 300);
    document.querySelectorAll('.gallery-thumbs button').forEach((b, j) => b.classList.toggle('on', j === i));
  }
  if (p.images.length > 1) {
    thumbsEl.innerHTML = p.images.map((src, i) =>
      `<button class="${i === 0 ? 'on' : ''}" data-g="${i}"><img src="${src}" alt=""></button>`).join('');
    document.querySelectorAll('.gallery-thumbs button').forEach(b => b.addEventListener('click', () => setMain(Number(b.getAttribute('data-g')))));
  } else {
    thumbsEl.style.display = 'none';
  }
  setMain(0);

  /* ---------- identity ---------- */
  document.querySelector('.product-info h1').textContent = p.name;
  const pBrandEl = document.querySelector('.p-brand');
  const brandMeta = App.brandRating(p.brand);
  pBrandEl.innerHTML = `${App.esc(p.brand)}${brandMeta ? `<span class="p-brand-rate">${App.icon('star', 'i-xs')} ${brandMeta.rating} · ${brandMeta.count} ${App.maybePlural(brandMeta.count, 'piece')}</span>` : ''}`;
  const tagsEl = document.querySelector('.p-tags');
  tagsEl.innerHTML = (p.tags || []).map(t => `<span class="p-tag">${App.esc(t)}</span>`).join('');
  const crumbCat = document.querySelector('.crumb-cat');
  if (crumbCat && window.CATEGORY_META[p.category]) crumbCat.textContent = window.CATEGORY_META[p.category].name;

  /* hover zoom */
  gallery.addEventListener('mouseenter', () => gallery.classList.add('zoomed'));
  gallery.addEventListener('mouseleave', () => gallery.classList.remove('zoomed'));

  /* badges on gallery */
  const badges = [];
  if (p.discount) badges.push(`<span class="badge badge-sale">−${p.discount}%</span>`);
  if (p.isNew) badges.push(`<span class="badge badge-new">New arrival</span>`);
  document.querySelector('.gallery-main .badges').innerHTML = badges.join('');

  /* ---------- info ---------- */
  const priceEl = document.querySelector('.p-price');
  const ratingRow = document.querySelector('.p-meta-row');
  ratingRow.querySelector('.reviews-count').textContent = `${p.reviews.toLocaleString()} reviews`;
  ratingRow.querySelector('.reviews-count').addEventListener('click', () => { location.hash = 'reviews'; });

  priceEl.innerHTML = `<span class="price-now">${App.money(p.price)}</span>` +
    (p.originalPrice ? `<span class="price-was">${App.money(p.originalPrice)}</span>` : '') +
    (p.discount ? `<span class="price-disc">Save ${p.discount}%</span>` : '');

  document.title = `${p.name} · Bloom`;

  /* stock hint (deterministic pseudo-random) */
  const stockLeft = 1 + (hash(p.id) % 9);
  const lowStock = stockLeft <= 4;
  const stockEl = document.querySelector('.p-stock');
  stockEl.innerHTML = `${lowStock ? 'Only ' + stockLeft + ' left' : 'In stock'} · ships in 1–2 days`;
  if (lowStock) stockEl.classList.add('low');

  /* ---------- sizes ---------- */
  const hasSizes = p.sizes && p.sizes.length;
  if (!hasSizes) {
    const label = sizeChips ? sizeChips.previousElementSibling : null;
    if (label) label.style.display = 'none';
    if (sizeChips) sizeChips.style.display = 'none';
  } else if (sizeChips) {
    sizeChips.innerHTML = p.sizes.map(sz => {
      const soldOut = hash(p.id + sz) % 5 === 0 && p.sizes.length > 1;
      return `<button class="chip ${S.size === sz ? 'on' : ''}" data-size="${App.esc(sz)}" ${soldOut ? 'disabled' : ''}>${App.esc(sz)}</button>`;
    }).join('');
    document.querySelectorAll('.size-chips .chip').forEach(b => b.addEventListener('click', () => {
      if (b.disabled) return;
      S.size = b.getAttribute('data-size');
      document.querySelectorAll('.size-chips .chip').forEach(x => x.classList.toggle('on', x === b));
    }));
  }

  /* ---------- colors ---------- */
  const COLOR_HEX = window.colorHex;
  const hasColors = p.colors && p.colors.length;
  if (!hasColors) {
    const label = colorChips ? colorChips.previousElementSibling : null;
    if (label) label.style.display = 'none';
    if (colorChips) colorChips.style.display = 'none';
    if (colorValue) colorValue.style.display = 'none';
  } else if (colorChips) {
    colorChips.innerHTML = p.colors.map(c => {
      const hex = COLOR_HEX(c);
      return `<button class="color-chip ${S.color === c ? 'on' : ''}" data-color="${App.esc(c)}" title="${App.esc(c)}" style="background:${hex}"></button>`;
    }).join('');
    document.querySelectorAll('.color-chips .color-chip').forEach(b => b.addEventListener('click', () => {
      S.color = b.getAttribute('data-color');
      document.querySelectorAll('.color-chips .color-chip').forEach(x => x.classList.toggle('on', x === b));
      if (colorValue) colorValue.textContent = `Colour: ${S.color}`;
    }));
    if (colorValue) colorValue.textContent = `Colour: ${S.color}`;
  }

  /* ---------- Indian size guide dropdown ---------- */
  const APP_CHART = `32 | 6 | 76 | 60
    34 | 8 | 80 | 64
    36 | 10 | 84 | 68
    38 | 12 | 88 | 72
    40 | 14 | 92 | 76
    42 | 16 | 96 | 80`.trim();
  const SHOE_CHART = `UK 3 (IN) | 35.5 | 5 | 21.5
    UK 4 | 36/37 | 6 | 22.4
    UK 5 | 38 | 7 | 23.4
    UK 6 | 39 | 8 | 24.1
    UK 7 | 40/41 | 9 | 25.0
    UK 8 | 42 | 10 | 25.9
    UK 9 | 43 | 11 | 26.7
    UK 10 | 44 | 12 | 27.5`.trim();
  const guideBtn = document.querySelector('.size-guide-btn');
  const guidePanel = document.querySelector('.size-guide-panel');
  if (guideBtn && guidePanel) {
    const isShoe = p.category === 'shoes';
    const head = isShoe
      ? '<th>Indian / UK</th><th>EU</th><th>US</th><th>Foot length</th>'
      : '<th>Indian size</th><th>UK</th><th>Bust (cm)</th><th>Waist (cm)</th>';
    const rows = (isShoe ? SHOE_CHART : APP_CHART).trim().split('\n').map(r => {
      const c = r.split('|').map(x => x.trim());
      return `<tr><td>${c[0]}</td><td>${c[1]}</td><td>${c[2]}</td><td>${c[3]}</td></tr>`;
    }).join('');
    guidePanel.innerHTML = `<p style="margin:0 0 8px;color:var(--muted)">Standard Indian ${isShoe ? 'footwear (UK sizing is used in India)' : 'apparel'} sizes.</p>
      <table class="size-chart"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
    const toggle = () => {
      const open = guidePanel.style.display !== 'none';
      guidePanel.style.display = open ? 'none' : '';
      guideBtn.classList.toggle('open', !open);
    };
    guideBtn.addEventListener('click', toggle);
    document.addEventListener('click', (e) => {
      if (guidePanel.style.display !== 'none' && !guidePanel.contains(e.target) && !guideBtn.contains(e.target)) toggle();
    });
  }

  /* ---------- qty ---------- */
  document.querySelector('.qty button[data-qdec]').addEventListener('click', () => { if (S.qty > 1) { S.qty--; qtyVal.textContent = S.qty; } });
  document.querySelector('.qty button[data-qinc]').addEventListener('click', () => { if (S.qty < 12) { S.qty++; qtyVal.textContent = S.qty; } });

  /* ---------- actions ---------- */
  document.querySelector('.p-add-cart').addEventListener('click', () => {
    Cart.add(p.id, S.qty, S.size, S.color);
    const unit = `${p.brand} · ${p.name} · ${S.size || 'one size'}${S.color ? ' · ' + S.color : ''}`;
    App.toastHTML(`<img src="${p.images[0]}" alt="" class="toast-thumb"><span><b>${S.qty} added to bag</b>${App.esc(unit)}</span>`, 'success');
    Cart.announceCartOpen();
  });
  document.querySelector('.p-buy-now').addEventListener('click', () => {
    Cart.add(p.id, S.qty, S.size, S.color);
    location.href = 'checkout.html';
  });
  document.querySelector('.p-wishlist').addEventListener('click', () => {
    const added = Wishlist.toggle(p.id, true);
    const b = document.querySelector('.p-wishlist');
    b.classList.toggle('liked', added);
    b.innerHTML = App.icon(added ? 'heartF' : 'heart', 'wish-ico') + (added ? ' Saved' : ' Wishlist');
  });
  Wishlist.sync();
  if (Wishlist.has(p.id)) document.querySelector('.p-wishlist').classList.add('liked');

  /* ---------- pincode ---------- */
  const pinInput = document.querySelector('.pin-input');
  const pinMsg = document.querySelector('.pin-msg');
  const pinBtn = document.querySelector('.pin-check');
  pinBtn.addEventListener('click', () => {
    const v = pinInput.value.replace(/\D/g, '');
    if (v.length !== 6) {
      pinMsg.className = 'pin-msg err';
      pinMsg.textContent = 'Enter a 6-digit pincode.';
      return;
    }
    if (new Set(v).size === 1) {
      pinMsg.className = 'pin-msg err';
      pinMsg.textContent = 'Hmm · check that pincode.';
      return;
    }
    const days = 4 + (hash(v) % 3);
    pinMsg.className = 'pin-msg';
    const d = new Date(Date.now() + days * 86400000);
    pinMsg.innerHTML = `Delivery available · arrives by <b>${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</b>`;
  });

  /* ---------- tabs ---------- */
  const tabs = document.querySelectorAll('.tablist .tab');
  const panels = document.querySelectorAll('.tab-panel');
  function selectTab(name) {
    tabs.forEach(t => t.classList.toggle('on', t.textContent.trim().toLowerCase() === name));
    panels.forEach(pt => {
      const on = pt.getAttribute('data-tab') === name;
      pt.style.display = on ? '' : 'none';
      if (on) pt.classList.remove('fade');
    });
  }
  if (tabs.length) tabs.forEach(t => t.addEventListener('click', () => selectTab(t.textContent.trim().toLowerCase())));
  selectTab('details');

  /* show larger selected defaults */
  const descPara = document.querySelector('[data-tab="details"] p');
  if (descPara) descPara.textContent = p.description;

  /* ---------- details table ---------- */
  const detailsTable = document.querySelector('.p-details-table');
  if (detailsTable) {
    const rows = [
      ['Category', window.CATEGORY_META[p.category] ? window.CATEGORY_META[p.category].name : p.category],
      ['Subcategory', p.subcategory || ''],
      ['Brand', p.brand],
      ['Fit / Note', p.name.includes('Dress') || p.name.includes('Shirt') ? 'True to size' : 'Standard sizing'],
      ['Material', p.brand === 'Veridana' ? 'Clean, skin-safe formula' : p.tags && p.tags.length ? p.tags[0] : 'Premium'],
      ['Tags', (p.tags || []).join(', ') || ''],
      ['SKU', 'BLM-' + (hash(p.id) % 9000 + 1000)]
    ];
    detailsTable.querySelector('tbody').innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td>${App.esc(r[1])}</td></tr>`).join('');
  }

  /* ---------- reviews ---------- */
  const REVIEW_POOL = [
    ['Isobel M.', 'Absolutely in love. The quality feels far above the price, and the packaging was gorgeous · mint tissue and a sprig of dried flowers.'],
    ['Aria S.', 'Sizing runs true and it photographs beautifully. Arrived two days early.'],
    ['Freya L.', 'Third order from Bloom and they never miss. This one fits the aesthetic perfectly.'],
    ['Noor K.', 'Beautifully made. Slight scent of linen and garden · I’m obsessed.'],
    ['Margot D.', 'Wore it out same week. Multiple compliments, zero regrets.'],
    ['Zoe P.', 'Honestly better than similar items I’ve bought at three times the price.']
  ];
  const extra = p.reviews > 40 ? Math.min(3, hash(p.id) % 3) : 0;

  function loadReviews(prefix) {
    const localKey = 'bloom_reviews_' + p.id;
    let local = [];
    try { local = JSON.parse(localStorage.getItem(localKey) || '[]'); } catch (e) { local = []; }
    const mine = local.map(r => ({
      name: r.name, stars: r.stars, date: r.date, verified: true, own: true, text: r.text
    }));
    const pool = REVIEW_POOL.map((r, i) => ({
      name: r[0], stars: 5 - (i % 2), date: (i + 1) * 12, verified: i > 0, text: r[1]
    }));
    return (prefix ? prefix.concat(mine) : mine.concat(pool.slice(0, Math.max(4, Math.min(6, 3 + extra)))));
  }

  function renderReviews() {
    const wrap = document.querySelector('[data-tab="reviews"] .review-list');
    const list = loadReviews();
    if (!wrap) return;
    wrap.innerHTML = list.map(r => `
      <div class="review-item">
        <div class="rv-avatar">${r.name.split(' ')[0][0]}</div>
        <div>
          <b>${App.esc(r.name)}</b>${App.stars(r.stars)}<span class="rv-date">${r.date > 200 ? 'Today' : r.date + ' days ago'}</span>
          ${r.verified ? `<span class="rv-verified">${App.icon('check', 'rv-check')} Verified purchase</span>` : ''}
          <p>${App.esc(r.text)}</p>
        </div>
      </div>`).join('');
    document.querySelector('[data-tab="reviews"] .rv-total').textContent = `${list.length} review` + (list.length !== 1 ? 's' : '');
  }
  renderReviews();

  /* review form */
  const reviewForm = document.querySelector('.review-form form');
  const starBtns = document.querySelectorAll('.rate-input .star-btn');
  let chosenStars = 0;
  starBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      chosenStars = i + 1;
      starBtns.forEach((x, j) => x.className = 'star-btn' + (j <= i ? ' on' : ''));
    });
  });
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = reviewForm.querySelector('[name="rv-name"]');
      const text = reviewForm.querySelector('[name="rv-text"]');
      if (!chosenStars) { App.toast('Please give a star rating first.', 'error'); return; }
      if (!name.value.trim() || !text.value.trim()) { App.toast('Please fill in your name and a few words.', 'error'); return; }
      const key = 'bloom_reviews_' + p.id;
      let local = [];
      try { local = JSON.parse(localStorage.getItem(key) || '[]'); } catch (x) { local = []; }
      local.push({ name: name.value.trim(), stars: chosenStars, date: 'Today', text: text.value.trim() });
      localStorage.setItem(key, JSON.stringify(local));
      App.toast('Thank you · your review is live.', 'success');
      renderReviews();
      name.value = ''; text.value = ''; chosenStars = 0;
      starBtns.forEach(x => x.className = 'star-btn');
      selectTab('reviews');
    });
  }

  /* ---------- related ---------- */
  const relatedEl = document.querySelector('.related-grid');
  const related = (window.MP ? MP.available(window.relatedProducts(p, 4)) : window.relatedProducts(p, 4));
  relatedEl.innerHTML = related.map(rp => App.renderCard(rp)).join('');

  /* ---------- sold state ---------- */
  if (window.MP && MP.isSold(p.id)) {
    const info = document.querySelector('.product-info');
    const banner = document.createElement('div');
    banner.className = 'sold-banner';
    banner.innerHTML = App.icon('tag', 'i-sm') + ' This item has been sold and removed from the marketplace.';
    info.insertBefore(banner, info.firstChild);
    const cartBtn = document.querySelector('.p-add-cart');
    const buyBtn = document.querySelector('.p-buy-now');
    if (cartBtn) { cartBtn.disabled = true; cartBtn.textContent = 'Sold'; }
    if (buyBtn) { buyBtn.disabled = true; buyBtn.textContent = 'Sold'; }
  }

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h *= 16777619; }
    return Math.abs(h);
  }
})();