/* ============================================================
   Bloom · Simulated marketplace state (frontend-only)
   - sold items (removed from the marketplace once ordered)
   - student listings (items added via "Sell on Bloom")
   - seller notifications + simulated email
   No backend, no accounts, no payments, no real email.
   ============================================================ */

;(function () {
  'use strict';

  const KEYS = {
    sold: 'bloom_sold_v1',
    listings: 'bloom_listings_v1',
    notes: 'bloom_seller_notes_v1',
    uni: 'bloom_university_v1'
  };

  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const UNIVERSITIES = ['Ashoka University'];

  const MP = {
    universities: UNIVERSITIES,

    university() { return localStorage.getItem(KEYS.uni) || UNIVERSITIES[0]; },
    setUniversity(u) { if (UNIVERSITIES.indexOf(u) !== -1) localStorage.setItem(KEYS.uni, u); },

    sold() { return new Set(read(KEYS.sold, [])); },
    isSold(id) { return MP.sold().has(id); },
    markSold(ids) {
      const s = MP.sold();
      (Array.isArray(ids) ? ids : [ids]).forEach(i => s.add(i));
      write(KEYS.sold, Array.from(s));
    },

    listings() { return read(KEYS.listings, []); },
    addListing(p) {
      const list = MP.listings().filter(x => x.id !== p.id);
      list.unshift(p);
      write(KEYS.listings, list);
      MP.mergeListings();
      return p;
    },
    removeListing(id) { write(KEYS.listings, MP.listings().filter(x => x.id !== id)); },
    isListing(id) { return MP.listings().some(x => x.id === id); },

    notes() { return read(KEYS.notes, []); },
    notify(n) {
      const list = MP.notes();
      list.unshift(Object.assign({ at: Date.now(), unread: true }, n));
      write(KEYS.notes, list.slice(0, 40));
      MP.updateBadge();
    },
    markNotesRead() { write(KEYS.notes, MP.notes().map(n => Object.assign({}, n, { unread: false }))); MP.updateBadge(); },
    clearNotes() { write(KEYS.notes, []); MP.updateBadge(); },
    unreadCount() { return MP.notes().filter(n => n.unread).length; },

    /* products still available to buy (excludes sold) */
    available(list) { return (list || window.PRODUCTS || []).filter(p => !MP.isSold(p.id)); },

    /* merge any student listings into the live catalog so they render everywhere */
    mergeListings() {
      const ids = new Set((window.PRODUCTS || []).map(p => p.id));
      MP.listings().forEach(p => { if (!ids.has(p.id)) { window.PRODUCTS.push(p); ids.add(p.id); } });
    },

    /* navbar seller notification badge */
    updateBadge() {
      const n = MP.unreadCount();
      document.querySelectorAll('[data-seller-badge]').forEach(b => { b.textContent = n; b.style.display = n ? '' : 'none'; });
    },

    /* ---- simulated seller email ---- */
    sellerEmail(order) {
      const first = (order.items && order.items[0]) || {};
      const rows = (order.items || []).map(it =>
        `<tr><td style="padding:6px 0">${window.App ? App.esc(it.name) : it.name}${it.size ? ' · ' + it.size : ''}${it.color ? ' · ' + it.color : ''}</td><td style="padding:6px 0;text-align:right">x${it.qty}</td></tr>`).join('');
      const uni = MP.university();
      return `
      <div class="email-preview">
        <div class="email-head">
          <div class="email-row"><span>From</span><b>orders@bloom.marketplace</b></div>
          <div class="email-row"><span>To</span><b>you · student seller at ${App ? App.esc(uni) : uni}</b></div>
          <div class="email-row"><span>Subject</span><b>You sold “${App ? App.esc(first.name || 'an item') : first.name}” on Bloom</b></div>
        </div>
        <div class="email-body">
          <p>Hi there,</p>
          <p>Good news, someone just ordered your listing on Bloom. The item has been reserved and removed from the marketplace so no one else can buy it.</p>
          <table class="email-table"><tbody>${rows}</tbody></table>
          <p><b>Order</b> ${App ? App.esc(order.number) : order.number} &nbsp;·&nbsp; <b>Campus</b> ${App ? App.esc(uni) : uni}</p>
          <p><b>Next step:</b> reply to this email or open your seller dashboard to coordinate an on-campus handoff with the buyer. Bloom holds the payment until the handoff is confirmed.</p>
          <p class="email-sign">Bought and sold, on campus.<br>— The Bloom Team</p>
        </div>
        <p class="email-note">This is a simulated email for the demo. No message was actually sent.</p>
      </div>`;
    },

    /* ---- simulated order-confirmation email to the buyer ---- */
    buyerEmail(order) {
      return `
      <div class="email-preview">
        <div class="email-head">
          <div class="email-row"><span>From</span><b>hello@bloom.marketplace</b></div>
          <div class="email-row"><span>To</span><b>you · buyer at ${App ? App.esc(MP.university()) : MP.university()}</b></div>
          <div class="email-row"><span>Subject</span><b>Your Bloom order ${App ? App.esc(order.number) : order.number} is confirmed</b></div>
        </div>
        <div class="email-body">
          <p>Thanks for shopping on Bloom.</p>
          <p>Your order is confirmed and the seller has been notified. They’ll reach out to arrange an on-campus handoff.</p>
          <p><b>Estimated handoff:</b> ${App ? App.esc(order.eta || '') : order.eta || ''}</p>
          <p class="email-sign">Bought and sold, on campus.<br>— The Bloom Team</p>
        </div>
        <p class="email-note">This is a simulated email for the demo. No message was actually sent.</p>
      </div>`;
    },

    reset() {
      write(KEYS.sold, []); write(KEYS.notes, []); write(KEYS.listings, []);
      MP.updateBadge();
    }
  };

  MP.mergeListings();
  window.MP = MP;
})();