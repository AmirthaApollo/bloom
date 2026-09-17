/* ============================================================
   Bloom · Wishlist
   Depends on products.js, app.js, cart.js
   ============================================================ */

(function () {
  'use strict';

  const KEY = 'bloom_wish_v1';

  let state = [];
  try { state = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { state = []; }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

  const Wishlist = {
    all: () => state.slice(),
    count: () => state.length,
    has: (id) => state.indexOf(id) !== -1,

    add(id) {
      if (Wishlist.has(id)) return false;
      state.push(id);
      save();
      Wishlist.updateBadges();
      return true;
    },
    remove(id) {
      state = state.filter(x => x !== id);
      save();
      Wishlist.updateBadges();
    },
    toggle(id, toastOnAdd) {
      const was = Wishlist.has(id);
      if (was) Wishlist.remove(id);
      else Wishlist.add(id);
      if (toastOnAdd) App.toast(was ? 'Removed from wishlist' : 'Added to wishlist', was ? 'info' : 'success');
      return !was;
    },

    toggleUI(id, btnEl) {
      const added = Wishlist.toggle(id, true);
      document.querySelectorAll('[data-wid="' + id + '"]').forEach(b => {
        b.classList.toggle('liked', added);
      });
      Wishlist.updateBadges();
    },

    updateBadges() {
      document.querySelectorAll('.count-badge[data-wishlist]').forEach(b => {
        const n = Wishlist.count();
        b.textContent = n;
        b.style.display = n ? '' : 'none';
      });
      document.querySelectorAll('[data-wid]').forEach(b => {
        const id = b.getAttribute('data-wid');
        if (b.getAttribute('data-frozen') === '1') return;
        b.classList.toggle('liked', Wishlist.has(id));
      });
    },

    sync() {
      Wishlist.updateBadges();
    }
  };

  window.Wishlist = Wishlist;

  Wishlist.updateBadges();

  /* ============ wishlist page ============ */
  if (document.querySelector('#wishlist-page')) {
    const wrap = document.querySelector('#wishlist-page');
    const gridEl = wrap.querySelector('.wish-grid');
    const emptyEl = wrap.querySelector('.wishlist-empty');

    function render() {
      const ids = Wishlist.all().filter(id => window.getProduct(id) && !(window.MP && MP.isSold(id)));
      if (!ids.length) {
        gridEl.innerHTML = '';
        emptyEl.style.display = '';
        wrap.querySelector('.wishlist-toolbar').style.display = 'none';
        return;
      }
      emptyEl.style.display = 'none';
      wrap.querySelector('.wishlist-toolbar').style.display = '';
      wrap.querySelector('.wishlist-count').textContent = `${ids.length} ${App.maybePlural(ids.length, 'item')} saved`;

      gridEl.innerHTML = ids.map(id => App.renderCard(window.getProduct(id))).join('');

      const moveAll = wrap.querySelector('.wish-move-all');
      if (moveAll) {
        moveAll.addEventListener('click', () => {
          ids.forEach(id => { const p = window.getProduct(id); if (p) Cart.add(id, 1, null, null); });
          App.toast(`Moved ${ids.length} ${App.maybePlural(ids.length, 'item')} to your bag`, 'success');
          setTimeout(() => { Wishlist.all().forEach(id => Wishlist.remove(id)); render(); }, 200);
        });
      }
    }

    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add && add.closest('#wishlist-page')) {
        const id = add.getAttribute('data-add');
        setTimeout(() => { if (!Wishlist.has(id)) render(); }, 300);
      }
    });

    Wishlist.updateBadges();
    render();
    /* re-render when wishlist changes from elsewhere (e.g. product page) */
    window.Wishlist.onChange = render;
  }
})();