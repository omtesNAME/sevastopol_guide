/* ==============================================
   main.js — Путеводитель по Севастополю
   ============================================== */

const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── 1. Sticky header ── */
const header = qs('#site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── 2. Scroll progress bar ── */
const progressBar = qs('#scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? Math.min(window.scrollY / max * 100, 100) : 0) + '%';
  }, { passive: true });
}

/* ── 3. Burger menu ── */
const burgerBtn  = qs('#burger-btn');
const mobileMenu = qs('#mobile-menu');
const closeBtn   = qs('#mobile-close-btn');

function openMenu() {
  mobileMenu?.classList.add('open');
  mobileMenu?.setAttribute('aria-hidden', 'false');
  burgerBtn?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu?.classList.remove('open');
  mobileMenu?.setAttribute('aria-hidden', 'true');
  burgerBtn?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

burgerBtn?.addEventListener('click', openMenu);
closeBtn?.addEventListener('click', closeMenu);
qsa('.mobile-menu__link').forEach(link => link.addEventListener('click', closeMenu));
mobileMenu?.addEventListener('click', e => { if (e.target === mobileMenu) closeMenu(); });

/* ── 4. Active nav при скролле ── */
const navLinks = qsa('.nav-desktop a[href^="#"]');
const sections = qsa('main section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(link =>
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
    );
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

/* ── 5. HERO 1 — буквенная анимация ── */
function initHero1() {
  const title = qs('.hero1-title');
  if (!title || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    qs('.hero1-tagline')?.classList.add('animated');
    qs('.hero1-meta')?.classList.add('animated');
    return;
  }

  const text = title.textContent.trim();
  title.innerHTML = '';
  title.setAttribute('aria-label', text);

  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'hero1-letter';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = char === ' ' ? ' ' : char;
    span.style.animationDelay = (i * 70) + 'ms';
    title.appendChild(span);
  });

  const revealDelay = text.length * 70 + 800;
  const tagline = qs('.hero1-tagline');
  if (tagline) setTimeout(() => tagline.classList.add('animated'), revealDelay);
  const meta = qs('.hero1-meta');
  if (meta) setTimeout(() => meta.classList.add('animated'), revealDelay + 200);
}

/* ── 6. HERO 2 — slide-up + параллакс (только десктоп) ── */
function initHero2() {
  const titleInner = qs('.hero2-title-inner');
  const tagline    = qs('.hero2-tagline');
  const reduced    = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (titleInner && !reduced) setTimeout(() => titleInner.classList.add('animated'), 150);
  if (tagline && !reduced)    setTimeout(() => tagline.classList.add('animated'), 750);

  const content = qs('.hero2-content');
  if (!content || window.matchMedia('(max-width: 767px), (hover: none)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const hero = qs('.section-hero--2');
      if (!hero) { ticking = false; return; }
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) { ticking = false; return; }
      content.style.transform = `translateY(${-rect.top * 0.25}px)`;
      ticking = false;
    });
  }, { passive: true });
}

/* ── 7. HERO 3 — счётчики при загрузке ── */
function initHero3() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    qsa('.h3-num').forEach(el => { el.textContent = el.dataset.target; });
    return;
  }

  function countUp(el, target, duration, delay) {
    setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  }

  qsa('.h3-num').forEach((el, i) => {
    countUp(el, parseInt(el.dataset.target, 10), 1800, 400 + i * 200);
  });
}

/* ── 8. Счётчики в секции Intro (при попадании в viewport) ── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();
  const tick = (now) => {
    const t     = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const statsSection = qs('.intro-stats');
if (statsSection) {
  const statsObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        qsa('.stat-num', statsSection).forEach(animateCounter);
      }
      statsObs.disconnect();
    }
  }, { threshold: 0.6 });
  statsObs.observe(statsSection);
}

/* ── 9. Fade-in со stagger ── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el      = entry.target;
    const stagger = parseFloat(el.style.getPropertyValue('--stagger') || 0);
    setTimeout(() => el.classList.add('visible'), Math.round(stagger * 80));
    fadeObserver.unobserve(el);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

function observeFadeIn(ctx = document) {
  qsa('.fade-in', ctx).forEach(el => fadeObserver.observe(el));
}

/* ── 10. Universal carousel setup ── */
function setupCarousel(id) {
  const carousel = qs(`#${id}`);
  const dotsEl   = qs(`#${id}-dots`);
  const prevBtn  = qs(`#${id}-prev`);
  const nextBtn  = qs(`#${id}-next`);
  if (!carousel) return;

  function getCardWidth() {
    const card = carousel.querySelector('.carousel-card');
    return card ? card.offsetWidth + 18 : 308;
  }

  function updateDots() {
    if (!dotsEl) return;
    const count = carousel.querySelectorAll('.carousel-card').length;
    dotsEl.innerHTML = Array.from({ length: count }, (_, i) =>
      `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="карточка ${i + 1}"></button>`
    ).join('');
  }

  carousel.addEventListener('scroll', () => {
    if (!dotsEl) return;
    const idx = Math.round(carousel.scrollLeft / getCardWidth());
    dotsEl.querySelectorAll('.carousel-dot').forEach((dot, i) =>
      dot.classList.toggle('active', i === idx)
    );
  }, { passive: true });

  prevBtn?.addEventListener('click', () =>
    carousel.scrollBy({ left: -getCardWidth(), behavior: 'smooth' })
  );
  nextBtn?.addEventListener('click', () =>
    carousel.scrollBy({ left: getCardWidth(), behavior: 'smooth' })
  );

  dotsEl?.addEventListener('click', e => {
    const dot = e.target.closest('.carousel-dot');
    if (!dot) return;
    carousel.scrollTo({ left: parseInt(dot.dataset.idx, 10) * getCardWidth(), behavior: 'smooth' });
  });

  updateDots();
}

/* ── 11. Card templates ── */
function cardPhoto(p) {
  return `<div class="carousel-card__photo">
    ${p.image
      ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
      : `<span class="cc-ph-label">${p.name}</span>`}
    ${p.featured ? '<span class="cc-badge cc-badge--featured">обязательно</span>' : ''}
  </div>`;
}

function cardArticle(p, content) {
  return `<article class="carousel-card${p.url ? ' carousel-card--linked' : ''}">
    ${p.url
      ? `<a class="carousel-card__link" href="${p.url}" target="_blank" rel="noopener">${content}</a>`
      : content}
  </article>`;
}

function cardBase(p, meta = '', note = '') {
  const content = `
    ${cardPhoto(p)}
    <div class="carousel-card__body">
      <div class="carousel-card__header">
        <h3 class="carousel-card__name">${p.name}</h3>
        ${meta ? `<span class="carousel-card__price">${meta}</span>` : ''}
      </div>
      <p class="carousel-card__desc">${p.desc}</p>
      ${note ? `<span class="carousel-card__note">↗ ${note}</span>` : ''}
    </div>
  `;

  return cardArticle(p, content);
}

function cardFood(p) {
  return cardBase(p, p.price, p.note);
}

function cardFamous(p) {
  return cardBase(p, p.price || p.tag);
}

function cardBar(p) {
  return cardBase(p, p.price, p.note);
}

function cardBeach(p) {
  return cardBase(p, p.type, p.note);
}

function cardHidden(p) {
  return cardBase(p, p.price, p.note);
}

function cardTrip(p) {
  return cardBase(p, p.distance);
}

function cardHike(p) {
  return cardBase(p, p.price, [p.duration, p.distance].filter(Boolean).join(' · '));
}

function cardGrid(p) {
  const content = `
    <div class="card-b__photo-wrap">
      <div class="card-b__photo-inner">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
          : `<span class="cc-ph-label">${p.name}</span>`}
      </div>
    </div>
    <div class="card-b__body">
      ${p.tag ? `<span class="card-b__tag">${p.tag}</span>` : ''}
      <h3 class="card-b__name">${p.name}</h3>
      <p class="card-b__desc">${p.desc}</p>
    </div>
  `;

  return `<article class="card-b${p.url ? ' card-b--linked' : ''}">
    ${p.url
      ? `<a class="card-b__link" href="${p.url}" target="_blank" rel="noopener">${content}</a>`
      : content}
  </article>`;
}

/* ── 12. Render functions ── */
function renderHousing() {
  const el   = qs('#housing-grid');
  const data = window.placesData?.housing;
  if (!el || !data) return;
  el.innerHTML = data.map(cardGrid).join('');
}

function renderFood() {
  const el   = qs('#food-carousel');
  const data = window.placesData?.food;
  if (!el || !data) return;
  el.innerHTML = data.map(cardFood).join('');
  setupCarousel('food-carousel');
}

function renderSights() {
  const el   = qs('#sights-carousel');
  const data = window.placesData?.famous;
  if (!el || !data) return;
  el.innerHTML = data.map(cardFamous).join('');
  setupCarousel('sights-carousel');
}

function renderBars() {
  const el   = qs('#bars-carousel');
  const data = window.placesData?.bars;
  if (!el || !data) return;
  el.innerHTML = data.map(cardBar).join('');
  setupCarousel('bars-carousel');
}

function renderBeaches() {
  const el   = qs('#beaches-carousel');
  const data = window.placesData?.beaches;
  if (!el || !data) return;
  el.innerHTML = data.map(cardBeach).join('');
  setupCarousel('beaches-carousel');
}

function renderHidden() {
  const el   = qs('#hidden-carousel');
  const data = window.placesData?.hidden;
  if (!el || !data) return;
  el.innerHTML = data.map(cardHidden).join('');
  setupCarousel('hidden-carousel');
}

function renderTrips() {
  const el   = qs('#trips-carousel');
  const data = window.placesData?.trips;
  if (!el || !data) return;
  el.innerHTML = data.map(cardTrip).join('');
  setupCarousel('trips-carousel');
}

function renderHiking() {
  const el   = qs('#hiking-carousel');
  const data = window.placesData?.hiking;
  if (!el || !data) return;
  el.innerHTML = data.map(cardHike).join('');
  setupCarousel('hiking-carousel');
}

/* ── Init ── */

/* -- 13. Energy layer: small experimental interactions -- */
function initEnergyLayer() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('page-ready');
  if (reduced) return;

  const revealTargets = qsa('main section, .section-callout, .carousel-wrap, .district-map-card, .cards-grid');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('energy-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
  revealTargets.forEach(el => {
    el.classList.add('energy-reveal');
    revealObserver.observe(el);
  });

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.target.classList.toggle('is-inview', entry.isIntersecting));
  }, { threshold: 0.65 });
  qsa('.carousel-card, .card-b').forEach(card => cardObserver.observe(card));

  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      header?.classList.toggle('header-hidden', currentY > lastY && currentY > 220 && !mobileMenu?.classList.contains('open'));
      qsa('.section-num').forEach(num => {
        const rect = num.parentElement.getBoundingClientRect();
        const shift = Math.max(-18, Math.min(18, rect.top * -0.035));
        num.style.setProperty('--num-shift', `${shift}px`);
      });
      lastY = currentY;
      ticking = false;
    });
  }, { passive: true });

  qsa('.carousel-btn, .burger, .mobile-menu__close, .carousel-card__link, .card-b__link, .district-pin, .map-point[href]').forEach(el => {
    el.addEventListener('pointerdown', () => {
      el.classList.remove('tap-pop');
      void el.offsetWidth;
      el.classList.add('tap-pop');
    });
  });
}
document.addEventListener('DOMContentLoaded', () => {
  initHero1();
  initHero2();
  initHero3();

  renderFood();
  renderHousing();
  renderSights();
  renderBars();
  renderBeaches();
  renderHidden();
  renderTrips();
  renderHiking();
  setupCarousel('nuances-carousel');
  initEnergyLayer();

  qsa('.section-header').forEach(el => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
  });

  qsa('.intro-quote, .intro-subquote, .intro-stats').forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.setProperty('--stagger', i);
    fadeObserver.observe(el);
  });
});
