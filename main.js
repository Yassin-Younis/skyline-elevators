/* SKYLINE Elevators · interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── i18n (EN in the markup, other languages in i18n/<lang>.js as window.SKYLINE_I18N) ── */
  const DICTS = window.SKYLINE_I18N || {};
  const RTL = new Set(['ar']);
  const JS_EN = { 'js.cat.panoramic': 'Panoramic', 'js.cat.passenger': 'Passenger', 'js.cat.home': 'Home lift', 'js.cabin_design': 'Cabin design', 'js.cabin_alt': '{cat} elevator cabin design {n}', 'js.sample_of': '{title} · sample {i} of {n}', 'js.tour_title': '360° panorama {id}', 'js.quote_subject': 'Quote request', 'js.f.name': 'Name', 'js.f.email': 'Email', 'js.f.phone': 'Phone', 'js.f.type': 'Interested in', 'js.lang_other': 'عربي', 'js.lang_other_label': 'العربية' };
  const EN = { ...JS_EN };
  $$('[data-i18n]').forEach(el => { EN[el.dataset.i18n] ??= el.textContent.trim(); });
  $$('[data-i18n-html]').forEach(el => { EN[el.dataset.i18nHtml] ??= el.innerHTML; });
  $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(p => { const [a, k] = p.split(':'); EN[k] ??= el.getAttribute(a); }));
  let lang = 'en';
  const t = (k, vars) => { let s = String((lang !== 'en' && DICTS[lang] && DICTS[lang][k] != null) ? DICTS[lang][k] : (EN[k] ?? k)); if (vars) for (const [v, x] of Object.entries(vars)) s = s.replaceAll('{' + v + '}', x); return s; };
  const langBtns = $$('.lang-toggle');
  function applyLang(l, persist = true) {
    if (l !== 'en' && !DICTS[l]) l = 'en';
    lang = l;
    const d = l === 'en' ? EN : { ...EN, ...DICTS[l] };
    $$('[data-i18n]').forEach(el => { const v = d[el.dataset.i18n]; if (v != null) el.textContent = v; });
    $$('[data-i18n-html]').forEach(el => { const v = d[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
    $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(p => { const [a, k] = p.split(':'); if (d[k] != null) el.setAttribute(a, d[k]); }));
    document.documentElement.lang = l;
    document.documentElement.dir = RTL.has(l) ? 'rtl' : 'ltr';
    document.title = d['meta.title'] || document.title;
    $$('.brand img, .footer .logo').forEach(img => { img.src = RTL.has(l) ? 'img/brand/logo-white-ar.svg' : 'img/brand/logo-white.svg'; });
    $$('.footer .ar-logo').forEach(img => { img.src = RTL.has(l) ? 'img/brand/logo-white.svg' : 'img/brand/logo-white-ar.svg'; });
    const other = l === 'en' ? { text: JS_EN['js.lang_other'], label: JS_EN['js.lang_other_label'], code: 'ar' } : { text: 'EN', label: 'English', code: 'en' };
    langBtns.forEach(b => { b.textContent = other.text; b.setAttribute('aria-label', other.label); b.lang = other.code; });
    if (persist) try { localStorage.setItem('lang', l); } catch (_) {}
    const u = new URL(location.href); if (l === 'en') u.searchParams.delete('lang'); else u.searchParams.set('lang', l); history.replaceState(null, '', u);
    document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  }
  langBtns.forEach(b => b.addEventListener('click', () => applyLang(lang === 'en' ? 'ar' : 'en')));
  const initLang = (() => { const q = new URLSearchParams(location.search).get('lang'); if (q) return q; try { return localStorage.getItem('lang') || 'en'; } catch (_) { return 'en'; } })();

  /* ── header + drawer ─────────────────────────────── */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const burger = $('#burger'), drawer = $('#drawer');
  const setDrawer = (open) => { burger.setAttribute('aria-expanded', open); drawer.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; };
  burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));

  /* ── reveal on scroll ────────────────────────────── */
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* ── counters ────────────────────────────────────── */
  const fmt = (n) => n.toLocaleString('en-US');
  const cio = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = reduce ? 0 : 1600;
    const tick = (t) => { const p = Math.min(1, (t - t0) / dur || 1), k = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(end * k)); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ── hero elevator display ───────────────────────── */
  const hf = $('#heroFloor');
  if (hf && !reduce) {
    let n = 0; const target = 46; const t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / 2600), k = 1 - Math.pow(1 - p, 2); n = Math.round(target * k); hf.textContent = String(n).padStart(2, '0'); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* ── floor indicator (current section) ───────────── */
  const floorLinks = $$('#floors a'), floorNum = $('#floorNum'), navLinks = $$('.nav a');
  const sections = $$('[data-floor]').filter(s => s.tagName === 'SECTION');
  const sio = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const f = e.target.dataset.floor, id = e.target.id || 'top';
      floorLinks.forEach(a => a.classList.toggle('active', a.dataset.floor === f));
      if (floorNum) floorNum.textContent = f;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => sio.observe(s));

  /* ── elevator type tabs ──────────────────────────── */
  const tabs = $$('.type-tab');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-selected', t === tab));
    $$('.type-panel').forEach(p => { const on = p.id === tab.getAttribute('aria-controls'); p.classList.toggle('active', on); p.hidden = !on; });
    tab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }));

  /* ── gallery ─────────────────────────────────────── */
  const cats = { panoramic: [1, 2, 3, 4, 5, 6], passenger: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], home: [19, 20, 21, 22, 23, 24, 25] };
  const gal = $('#gallery');
  const items = [];
  Object.entries(cats).forEach(([cat, ids]) => ids.forEach((i, k) => items.push({ i, cat, k: k + 1 })));
  items.sort((a, b) => a.i - b.i);
  const buildGallery = () => {
    const active = $('.filter.active')?.dataset.filter || 'all';
    gal.innerHTML = items.map(({ i, cat, k }) => {
      const src = `img/gallery/cabin-${String(i).padStart(2, '0')}.jpg`, label = t('js.cat.' + cat), n = String(k).padStart(2, '0');
      return `<a class="g-item${active !== 'all' && cat !== active ? ' hide' : ''}" href="${src}" data-cat="${cat}" data-lb="gallery" data-cap="${label} ${n}"><img src="${src}" alt="${t('js.cabin_alt', { cat: label, n: k })}" loading="lazy"><span class="cap"><b>${label} ${n}</b><small>${t('js.cabin_design')}</small></span></a>`;
    }).join('');
  };
  buildGallery();
  document.addEventListener('langchange', buildGallery);
  $$('.filter').forEach(b => b.addEventListener('click', () => {
    $$('.filter').forEach(x => x.classList.toggle('active', x === b));
    const f = b.dataset.filter;
    $$('.g-item', gal).forEach(it => it.classList.toggle('hide', f !== 'all' && it.dataset.cat !== f));
  }));

  /* ── style sample sets ───────────────────────────── */
  const styleSets = { doors: 4, ceilings: 3, walls: 2, mirrors: 1, floors: 1, displays: 2, handrails: 3, drive: 2, 'm-safety': 3, 'e-safety': 3 };
  $$('.style-card').forEach(card => card.addEventListener('click', () => {
    const k = card.dataset.lbset, n = styleSets[k] || 1, title = $('h3', card).textContent;
    const list = Array.from({ length: n }, (_, i) => ({ src: `img/styles/${k}-${String(i + 1).padStart(2, '0')}.jpg`, cap: t('js.sample_of', { title, i: i + 1, n }) }));
    openLB(list, 0);
  }));

  /* ── lightbox ────────────────────────────────────── */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let cur = [], idx = 0;
  const show = (i) => { idx = (i + cur.length) % cur.length; lbImg.src = cur[idx].src; lbImg.alt = cur[idx].cap; lbCap.textContent = `${cur[idx].cap}  ·  ${idx + 1} / ${cur.length}`; };
  function openLB(list, i) { cur = list; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb-prev', lb).style.display = $('.lb-next', lb).style.display = list.length > 1 ? '' : 'none'; }
  const closeLB = () => { lb.classList.remove('open'); document.body.style.overflow = ''; lbImg.src = ''; };
  $('#lbClose').addEventListener('click', closeLB);
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  addEventListener('keydown', (e) => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  let tx = 0; lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(d < 0 ? idx + 1 : idx - 1); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-lb]'); if (!a) return; e.preventDefault();
    const group = $$(`a[data-lb="${a.dataset.lb}"]`).filter(x => !x.classList.contains('hide'));
    openLB(group.map(x => ({ src: x.getAttribute('href'), cap: x.dataset.cap || '' })), group.indexOf(a));
  });

  /* ── 360 tours (lazy kuula) ──────────────────────── */
  const stage = $('#tourStage'), tourBtns = $$('.tour-btn');
  const loadTour = (id) => {
    stage.innerHTML = `<iframe title="${t('js.tour_title', { id })}" allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen" allowfullscreen loading="lazy" src="https://kuula.co/share/${id}?logo=1&info=1&fs=1&vr=0&zoom=1&initload=0&thumbs=1&margin=30&alpha=0.60"></iframe>`;
    tourBtns.forEach(b => b.classList.toggle('active', b.dataset.id === id));
  };
  $('#tourStart')?.addEventListener('click', () => loadTour(tourBtns[0].dataset.id));
  tourBtns.forEach(b => b.addEventListener('click', () => loadTour(b.dataset.id)));

  /* ── client logos ────────────────────────────────── */
  const clients = ['King Saud University', 'Almajdiah Residence', 'Ministry of Health', 'Extra', 'Aramex', 'Alsaif Gallery', 'Almajdouie', 'Tokyo Restaurant', "Al'Athriyah", 'Ministry of Defense', 'CADI', 'King Faisal University'];
  const track = $('#logoTrack');
  const logos = clients.map((n, i) => `<img src="img/clients/client-${i + 1}.png" alt="${n}" loading="lazy">`).join('');
  track.innerHTML = logos + logos;

  /* ── quote form → mailto ─────────────────────────── */
  $('#quoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `${t('js.f.name')}: ${f.get('name')}\n${t('js.f.email')}: ${f.get('email')}\n${t('js.f.phone')}: ${f.get('phone') || '-'}\n${t('js.f.type')}: ${f.get('type')}\n\n${f.get('message') || ''}`;
    location.href = `mailto:support@skyline-e.com?subject=${encodeURIComponent(t('js.quote_subject') + ' · ' + f.get('type'))}&body=${encodeURIComponent(body)}`;
  });

  $('#year').textContent = new Date().getFullYear();
  if (initLang !== 'en') applyLang(initLang, false);
})();
