/* ============================================================
   Bloom · Checkout (multi-step + order success)
   Depends on products.js, app.js, cart.js
   ============================================================ */

(function () {
  'use strict';

  if (!document.querySelector('.checkout-page')) return;

  const App = window.App;

  /* ---------- if no items ---------- */
  const emptyWrap = document.querySelector('.checkout-empty');
  const checkoutLayout = document.querySelector('.checkout-layout');
  if (Cart.count() === 0) {
    checkoutLayout.style.display = 'none';
    emptyWrap.style.display = '';
  } else emptyWrap.style.display = 'none';

  const STEPS = ['address', 'delivery', 'payment', 'review'];
  let current = 0;
  const stepEls = document.querySelectorAll('.steps .step');
  const panels = document.querySelectorAll('[data-panel]');

  const S = {
    address: loadProfile(),
    delivery: 'standard',
    payment: 'card'
  };

  function loadProfile() {
    try { return JSON.parse(localStorage.getItem('bloom_profile') || 'null'); } catch (e) { return null; }
  }

  function setStep(i) {
    current = Math.min(Math.max(i, 0), STEPS.length - 1);
    stepEls.forEach((el, j) => {
      el.classList.toggle('on', j === current);
      el.classList.toggle('done', j < current);
    });
    panels.forEach(pt => pt.style.display = pt.getAttribute('data-panel') === STEPS[current] ? '' : 'none');
    renderSummary();
  }

  /* ---------- summary ---------- */
  const subtotalEl = document.querySelector('.co-subtotal');
  const discEl = document.querySelector('.co-discount');
  const feeEl = document.querySelector('.co-fee');
  const totalEl = document.querySelector('.co-total');
  const coItemsEl = document.querySelector('.co-items');

  function renderSummary() {
    const items = Cart.items();
    const sub = Cart.subtotal();
    const disc = Cart.discountAmount();
    const fee = S.delivery === 'express' ? 1200 : Cart.deliveryFee();
    subtotalEl.textContent = App.money(sub);
    discEl.textContent = disc ? '−' + App.money(disc) : App.money(0);
    feeEl.innerHTML = fee ? App.money(fee) : '<span style="color:var(--good)">FREE</span>';
    totalEl.textContent = App.money(Math.max(0, sub - disc + fee));
    window.__coFee = fee;
    coItemsEl.innerHTML = items.slice(0, 6).map(it => {
      const p = window.getProduct(it.id);
      if (!p) return '';
      const meta = [it.size, it.color].filter(Boolean).join(' · ');
      return `<div class="co-item"><img src="${p.images[0]}" alt="" loading="lazy">
        <div class="ci-meta"><b>${App.esc(p.name)}</b><small>${App.esc(p.brand)}${meta ? ' · ' + App.esc(meta) : ''}</small></div>
        <span>${it.qty}× ${App.money(p.price)}</span></div>`;
    }).join('');
    if (items.length > 6) coItemsEl.innerHTML += `<div class="co-more">… +${items.length - 6} more</div>`;
  }

  function validateAddress() {
    const fields = ['addr', 'city', 'state', 'pin', 'phone'];
    let ok = true;
    clearErrs();
    const get = (n) => document.querySelector(`[name="${n}"]`);
    if (!get('addr').value.trim() || get('addr').value.trim().length < 5) { err(get('addr'), 'Please enter a complete address.'); ok = false; }
    if (!get('city').value.trim()) { err(get('city'), 'Required.'); ok = false; }
    if (!get('state').value.trim()) { err(get('state'), 'Required.'); ok = false; }
    if (!/^\d{6}$/.test(get('pin').value.replace(/\s/g, ''))) { err(get('pin'), 'Enter a valid 6-digit pincode.'); ok = false; }
    if (!/^[\d\s+()]{9,15}$/.test(get('phone').value.trim())) { err(get('phone'), 'Enter a valid phone number.'); ok = false; }
    if (ok) {
      S.address = {
        name: get('name').value.trim() || 'Bloom customer',
        line: get('addr').value.trim(),
        city: get('city').value.trim(),
        state: get('state').value.trim(),
        pin: get('pin').value.replace(/\s/g, ''),
        phone: get('phone').value.trim(),
        country: get('country').value.trim()
      };
      localStorage.setItem('bloom_profile', JSON.stringify(S.address));
    }
    return ok;
  }

  function err(input, msg) {
    let e = input.closest('.field').querySelector('.err');
    if (!e) { e = document.createElement('small'); e.className = 'err'; input.closest('.field').appendChild(e); }
    e.innerHTML = msg;
  }
  function clearErrs() { document.querySelectorAll('.field .err').forEach(e => e.remove()); }

  /* ---------- address prefill ---------- */
  if (S.address) {
    const map = { name: 'name', addr: 'addr', city: 'city', state: 'state', pin: 'pin', phone: 'phone', country: 'country' };
    Object.keys(map).forEach(k => {
      const el = document.querySelector(`[name="${map[k]}"]`);
      if (el && S.address[k]) el.value = S.address[k];
    });
  }

  /* ---------- delivery ---------- */
  document.querySelectorAll('.delivery-method input').forEach(r => {
    r.addEventListener('change', () => {
      S.delivery = r.value;
      document.querySelectorAll('.delivery-method').forEach(d => d.classList.toggle('sel', d.querySelector('input').value === r.value));
      renderSummary();
    });
  });

  /* ---------- payment ---------- */
  document.querySelectorAll('.pay-method input').forEach(r => {
    r.addEventListener('change', () => {
      S.payment = r.value;
      document.querySelectorAll('.pay-method').forEach(d => d.classList.toggle('sel', d.querySelector('input').value === r.value));
      const isCard = r.value === 'card';
      document.querySelectorAll('.pay-fields[data-for="card"]').forEach(f => f.style.display = isCard ? '' : 'none');
    });
  });
  document.querySelectorAll('.pay-fields').forEach(f => f.style.display = f.getAttribute('data-for') === 'card' ? '' : 'none');

  /* ---------- navigation buttons ---------- */
  function next() {
    if (STEPS[current] === 'address' && !validateAddress()) return;
    setStep(current + 1);
  }
  function back() { setStep(current - 1); }

  document.querySelectorAll('[data-nav="next"]').forEach(b => b.addEventListener('click', next));
  document.querySelectorAll('[data-nav="back"]').forEach(b => b.addEventListener('click', back));

  /* simulated email previews */
  document.querySelectorAll('[data-seller-email]').forEach(b => b.addEventListener('click', () => {
    if (window.__lastOrder && window.MP) App.openModal(MP.sellerEmail(window.__lastOrder), 'Email to seller');
  }));
  document.querySelectorAll('[data-buyer-email]').forEach(b => b.addEventListener('click', () => {
    if (window.__lastOrder && window.MP) App.openModal(MP.buyerEmail(window.__lastOrder), 'Order confirmation email');
  }));

  /* place order */
  const placeBtn = document.querySelector('.place-order');
  const successEl = document.querySelector('.checkout-success');
  const successNum = successEl.querySelector('.order-number b');
  const successEta = successEl.querySelector('.eta-arrive');

  placeBtn.addEventListener('click', async () => {
    if (!S.address) { setStep(0); App.toast('Please fill in your delivery address first.', 'error'); return; }
    if (S.payment === 'card') {
      const num = document.querySelector('[name="cc"]');
      const exp = document.querySelector('[name="cexp"]');
      const cvv = document.querySelector('[name="ccvv"]');
      if (!num || !num.value.replace(/\s/g, '').match(/^\d{16}$/)) { App.toast('Enter a valid 16-digit card number.', 'error'); return; }
      if (!exp || !exp.value.match(/^\d{2}\/\d{2}$/)) { App.toast('Expiry in MM / YY format.', 'error'); return; }
      if (!cvv || !cvv.value.match(/^\d{3}$/)) { App.toast('Enter a valid CVV.', 'error'); return; }
    }
    placeBtn.disabled = true;
    placeBtn.innerHTML = `<span class="spin"></span> Placing your order…`;
    await new Promise(r => setTimeout(r, 1400));

    /* build & save order */
    const orderId = 'BLM' + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 90 + 10));
    const sub = Cart.subtotal();
    const disc = Cart.discountAmount();
    const fee = S.delivery === 'express' ? 1200 : Cart.deliveryFee();
    const total = Math.max(0, sub - disc + fee);
    const etaDays = S.delivery === 'express' ? 2 : (Cart.deliveryFee() === 0 ? 4 : 5);
    const d = new Date(Date.now() + etaDays * 86400000);

    const order = {
      number: orderId,
      placedAt: new Date().toISOString(),
      items: Cart.items().map(it => { const pr = window.getProduct(it.id); return { id: it.id, name: pr.name, brand: pr.brand, image: pr.images[0], size: it.size, color: it.color, qty: it.qty, price: pr.price }; }),
      subtotal: sub, discount: disc, delivery: fee, total,
      address: S.address, delivery: S.delivery, payment: S.payment,
      eta: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
      status: 'Confirmed'
    };
    let orders = [];
    try { orders = JSON.parse(localStorage.getItem('bloom_orders_v1') || '[]'); } catch (e) { orders = []; }
    orders.unshift(order);
    localStorage.setItem('bloom_orders_v1', JSON.stringify(orders));

    successNum.textContent = orderId;
    successEta.textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    successEl.querySelector('.success-total').textContent = App.money(total);
    successEl.querySelector('.success-pay').textContent = S.payment === 'card' ? 'Paid by card' : S.payment === 'upi' ? 'Paid by UPI' : 'Pay on delivery';

    /* sales simulation: reserve/remove the ordered items + notify the seller */
    if (window.MP) {
      MP.markSold(order.items.map(it => it.id));
      MP.notify({ kind: 'order', order: order.number, items: order.items.map(it => ({ name: it.name, id: it.id, qty: it.qty })), university: MP.university() });
      window.__lastOrder = order;
      const names = order.items.map(it => it.name).join(', ');
      const line = document.querySelector('.success-notify .notify-line');
      if (line) line.innerHTML = `<b>${App.esc(names)}</b> sold to a student at ${App.esc(MP.university())}. It has been removed from the marketplace.`;
    }

    Cart.clear();
    document.querySelector('.checkout-head').style.display = 'none';
    checkoutLayout.style.display = 'none';
    successEl.style.display = '';
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  });

  setTimeout(() => { if (Cart.count()) setStep(0); }, 0);
})();