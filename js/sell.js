/* ============================================================
   Bloom · Sell on Bloom (frontend simulation)
   Depends on products.js, marketplace.js, app.js
   ============================================================ */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'sell') return;

  const App = window.App;
  const SAMPLE_IMAGES = [
    'images/aclothes/bohemian-linen-dress.jpg',
    'images/aclothes/kolhapuri-sandals.jpg',
    'images/aclothes/beaded-flower-earrings.jpg',
    'images/aclothes/striped-corset-maxi.jpg',
    'images/aclothes/blue-satin-drape-tank.jpg',
    'images/aclothes/canvas-weekender-tote.jpg',
    'images/aclothes/moon-sun-jeans.jpg',
    'images/aclothes/printed-fabric-scarf.jpg'.replace('printed-fabric-scarf', 'printed-chiffon-scarf')
  ];

  /* ---------- fill selects ---------- */
  const catSel = document.querySelector('#sell-form [name="category"]');
  if (catSel) {
    catSel.innerHTML = Object.keys(window.CATEGORY_META)
      .map(k => `<option value="${k}">${window.CATEGORY_META[k].name}</option>`).join('');
  }
  const imgSel = document.querySelector('#sell-image');
  if (imgSel) {
    imgSel.innerHTML = SAMPLE_IMAGES.map(src => `<option value="${src}">${src.split('/').pop()}</option>`).join('');
  }
  const uniEl = document.querySelector('#sell-uni');
  if (uniEl && window.MP) uniEl.textContent = MP.university();

  /* ---------- photo upload ---------- */
  let uploadedImage = null;
  const fileInput = document.querySelector('#sell-photo');
  const preview = document.querySelector('#sell-photo-preview');

  function resizeImage(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const uploadBox = document.querySelector('#upload-box');
  const nameEl = document.querySelector('#sell-photo-name');

  function handleFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { App.toast('Please choose an image file.', 'error'); if (fileInput) fileInput.value = ''; return; }
    resizeImage(file, 800, 0.78).then((dataUrl) => {
      if (dataUrl.length > 1600000) { App.toast('That photo is a bit large · try another.', 'error'); return; }
      uploadedImage = dataUrl;
      if (uploadBox) uploadBox.classList.add('has-file');
      if (nameEl) nameEl.textContent = file.name;
      if (preview) preview.innerHTML = `<img src="${dataUrl}" alt="Selected photo">`;
      App.toast('Photo added.', 'success');
    }).catch(() => App.toast('Could not read that image.', 'error'));
  }

  if (fileInput) fileInput.addEventListener('change', () => handleFile(fileInput.files && fileInput.files[0]));

  if (uploadBox && fileInput) {
    ['dragenter', 'dragover'].forEach(ev => uploadBox.addEventListener(ev, (e) => { e.preventDefault(); uploadBox.classList.add('drag'); }));
    ['dragleave', 'dragend'].forEach(ev => uploadBox.addEventListener(ev, () => uploadBox.classList.remove('drag')));
    uploadBox.addEventListener('drop', (e) => {
      e.preventDefault(); uploadBox.classList.remove('drag');
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) { try { fileInput.files = e.dataTransfer.files; } catch (x) {} handleFile(f); }
    });
  }

  /* ---------- publish a listing ---------- */
  const form = document.querySelector('#sell-form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const name = f.name.value.trim();
    const price = Number(f.price.value) || 0;
    if (!name || price <= 0) { App.toast('Please add a name and a price.', 'error'); return; }

    const id = 'listing-' + Date.now().toString(36);
    const product = {
      id,
      name,
      brand: 'You · Student Seller',
      category: f.category.value,
      subcategory: (f.subcategory.value || window.CATEGORY_META[f.category.value].name).trim(),
      price,
      originalPrice: null,
      rating: 5,
      reviews: 0,
      popularity: 60,
      isNew: true,
      tags: [(f.condition.value || 'Like new').toLowerCase(), 'student-listing'],
      colors: [],
      sizes: [f.size.value.trim() || 'One Size'],
      images: [uploadedImage || f.image.value],
      description: (f.description.value.trim() || name + ' — listed by a student seller on ' + (window.MP ? MP.university() : 'campus') + '. Reach out to coordinate an on-campus handoff.'),
      discount: 0
    };
    MP.addListing(product);

    App.openModal(`
      <p style="margin-top:10px;color:var(--muted)">Your listing is live on the marketplace. It’s visible to students at <b>${App.esc(window.MP ? MP.university() : 'your campus')}</b> right away.</p>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        <a class="btn btn-primary" href="product.html?id=${id}">View listing</a>
        <a class="btn btn-light" href="shop.html">See it in the shop</a>
      </div>`, 'Listing published');

    form.reset();
    uploadedImage = null;
    if (preview) preview.innerHTML = '';
    if (nameEl) nameEl.textContent = '';
    if (uploadBox) uploadBox.classList.remove('has-file');
    renderDashboard();
    App.toast('Listing published to the marketplace.', 'success');
  });

  /* ---------- sample email ---------- */
  const sampleBtn = document.querySelector('#sample-email-btn');
  if (sampleBtn) sampleBtn.addEventListener('click', () => {
    const sample = {
      number: 'BLM-SAMPLE-01',
      eta: 'this week',
      buyerEmail: 'you@ashoka.edu.in',
      items: [{ name: 'White Co-ord Set', qty: 1, size: 'M', seller: { name: 'Ananya Iyer', email: 'ananya.i@ashoka.edu.in' } }]
    };
    App.openModal(MP.sellerEmail(sample), 'Sample seller email');
  });

  /* ---------- dashboard ---------- */
  const notesList = document.querySelector('#notes-list');
  const listList = document.querySelector('#listings-list');
  const listCount = document.querySelector('#listings-count');

  function timeAgo(ts) {
    const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  function renderNotes() {
    if (!notesList) return;
    const notes = MP.notes();
    if (!notes.length) {
      notesList.innerHTML = `<div class="dash-empty">No notifications yet. When someone buys your listing, it will appear here.</div>`;
      return;
    }
    notesList.innerHTML = notes.map(n => {
      const names = (n.items || []).map(i => i.name).join(', ');
      return `<div class="note-item ${n.unread ? 'unread' : ''}">
        <span class="note-ico" data-icon="orders" data-icon-class="i-sm"></span>
        <div class="note-body">
          <b>New order · ${App.esc(n.order || '')}</b>
          <span>${App.esc(names || 'Your item')} was ordered by a student at ${App.esc(n.university || 'your campus')}.</span>
          <small>${timeAgo(n.at)}</small>
        </div>
      </div>`;
    }).join('');
    App.hydrateIcons(notesList);
  }

  function renderListings() {
    if (!listList) return;
    const items = MP.listings();
    if (listCount) listCount.textContent = items.length;
    if (!items.length) {
      listList.innerHTML = `<div class="dash-empty">You haven’t listed anything yet. Publish your first item using the form.</div>`;
      return;
    }
    listList.innerHTML = items.map(p => {
      const sold = MP.isSold(p.id);
      return `<div class="listing-row ${sold ? 'sold' : ''}">
        <img src="${p.images[0]}" alt="" loading="lazy">
        <div class="listing-info">
          <b>${App.esc(p.name)}</b>
          <small>${App.esc(window.CATEGORY_META[p.category] ? window.CATEGORY_META[p.category].name : p.category)} · ${App.money(p.price)}</small>
        </div>
        <span class="listing-status ${sold ? 'is-sold' : ''}">${sold ? 'Sold' : 'Active'}</span>
        <div class="listing-actions">
          <a class="btn btn-ghost btn-sm" href="product.html?id=${p.id}">View</a>
          ${sold ? '' : `<button class="btn btn-ghost btn-sm" type="button" data-simulate="${p.id}">Simulate sale</button>`}
          <button class="btn btn-ghost btn-sm danger" type="button" data-remove="${p.id}">Remove</button>
        </div>
      </div>`;
    }).join('');

    listList.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
      MP.removeListing(b.getAttribute('data-remove'));
      renderDashboard();
      App.toast('Listing removed.', 'info');
    }));
    listList.querySelectorAll('[data-simulate]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-simulate');
      const p = window.getProduct(id);
      if (!p) return;
      const order = { number: 'BLM-' + Date.now().toString().slice(-6), eta: 'this week', items: [{ name: p.name, id: p.id, qty: 1, size: (p.sizes || [])[0], seller: p.seller ? { name: p.seller.name, email: p.seller.email } : null }] };
      MP.markSold(id);
      MP.notify({ kind: 'order', order: order.number, items: order.items, university: MP.university() });
      renderDashboard();
      App.openModal(MP.sellerEmail(order), 'Email to seller (simulated)');
      App.toast('Order simulated · seller notified.', 'success');
    }));
  }

  function renderDashboard() { renderNotes(); renderListings(); }
  renderDashboard();

  const readBtn = document.querySelector('#notes-read');
  if (readBtn) readBtn.addEventListener('click', () => { MP.markNotesRead(); renderNotes(); App.toast('All notifications marked read.', 'info'); });
  const clearBtn = document.querySelector('#notes-clear');
  if (clearBtn) clearBtn.addEventListener('click', () => { MP.clearNotes(); renderNotes(); App.toast('Notifications cleared.', 'info'); });
})();