/* ══════════════════════════════════════════════════════
   MIST & GREEN — main.js
   GSAP animations, nav, filter, age gate, hours check
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Wait for GSAP to load ── */
  function waitForGSAP(cb) {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      cb();
    } else {
      setTimeout(() => waitForGSAP(cb), 50);
    }
  }

  waitForGSAP(init);
});

function init() {

  /* ──────────────────────────────────────
     AGE GATE
  ────────────────────────────────────── */
  const ageGate   = document.getElementById('ageGate');
  const ageYesBtn = document.getElementById('ageYes');
  const SESSION_KEY = 'mg_age_ok';

  function closeAgeGate() {
    sessionStorage.setItem(SESSION_KEY, '1');
    ageGate.classList.add('is-hidden');
    setTimeout(() => ageGate.remove(), 600);
  }

  if (sessionStorage.getItem(SESSION_KEY)) {
    ageGate.remove();
  } else {
    ageYesBtn?.addEventListener('click', closeAgeGate);
    ageGate.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') ageGate.querySelector('.age-gate__no')?.click();
    });
    gsap.fromTo(ageGate.querySelector('.age-gate__card'),
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    );
  }

  /* ──────────────────────────────────────
     NAVIGATION — scroll state + mobile toggle
  ────────────────────────────────────── */
  const nav       = document.getElementById('nav');
  const toggle    = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  // Scroll state
  ScrollTrigger.create({
    start: 'top -60px',
    onEnter:      () => nav.classList.add('nav--scrolled'),
    onLeaveBack:  () => nav.classList.remove('nav--scrolled'),
  });

  /* ──────────────────────────────────────
     LANGUAGE TOGGLE  EN ↔ ไทย
  ────────────────────────────────────── */
  initLangToggle();

  function initLangToggle() {
    const btnEn  = document.getElementById('langBtnEn');
    const btnTh  = document.getElementById('langBtnTh');
    const pill   = document.getElementById('langPill');
    if (!btnEn || !btnTh || !pill) return;

    // Restore saved preference
    const saved = localStorage.getItem('msn_lang') || 'en';
    if (saved === 'th') setLang('th', false);

    function setLang(lang, animate = true) {
      const isTh   = lang === 'th';
      const active = isTh ? btnTh : btnEn;
      const inactive = isTh ? btnEn : btnTh;

      // Body class drives CSS visibility of .t-en / .t-th
      document.body.classList.toggle('lang-th', isTh);

      // ARIA
      btnEn.setAttribute('aria-pressed', String(!isTh));
      btnTh.setAttribute('aria-pressed', String(isTh));
      btnEn.classList.toggle('is-active', !isTh);
      btnTh.classList.toggle('is-active', isTh);

      // Slide the pill to the active button
      const pillTarget = active.getBoundingClientRect();
      const wrapTarget = pill.parentElement.getBoundingClientRect();
      const newLeft    = pillTarget.left - wrapTarget.left - 3; // -3 = padding offset
      const newWidth   = pillTarget.width;

      if (animate) {
        gsap.to(pill, {
          x: newLeft,
          width: newWidth,
          duration: 0.35,
          ease: 'power2.inOut',
        });
        // Colour crossfade
        gsap.to(active,   { color: '#00ff66', textShadow: '0 0 8px rgba(0,255,100,0.6)', duration: 0.25 });
        gsap.to(inactive, { color: 'var(--c-text-muted)', textShadow: 'none', duration: 0.25 });
      } else {
        // Instant on first load
        gsap.set(pill, { x: newLeft, width: newWidth });
      }

      localStorage.setItem('msn_lang', lang);
    }

    // Size + position pill after fonts render
    requestAnimationFrame(() => {
      const lang = localStorage.getItem('msn_lang') || 'en';
      setLang(lang, false);
    });

    btnEn.addEventListener('click', () => setLang('en'));
    btnTh.addEventListener('click', () => setLang('th'));
  }

  // Mobile toggle
  toggle?.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('is-open');
    navMenu.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navMenu?.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      navMenu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Keyboard trap in mobile menu
  navMenu?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      toggle.click();
      toggle.focus();
    }
  });

  /* ──────────────────────────────────────
     HERO ENTRANCE
  ────────────────────────────────────── */
  const heroDelay = sessionStorage.getItem('mg_age_ok') ? 0.3 : 0.8;
  gsap.fromTo('.hero__actions',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: heroDelay }
  );
  gsap.fromTo('.hero__scroll-hint',
    { opacity: 0 },
    { opacity: 1, duration: 1, delay: heroDelay + 0.6 }
  );

  /* ──────────────────────────────────────
     HERO IMAGE PARALLAX ON SCROLL
  ────────────────────────────────────── */
  gsap.to('.hero__img', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero', start: 'top top', end: 'bottom top',
      scrub: 1,
    }
  });
  gsap.to('.hero__content', {
    y: '18%', opacity: 0.2,
    scrollTrigger: {
      trigger: '.hero', start: 'top top', end: 'bottom top',
      scrub: 1.2,
    }
  });

  /* ──────────────────────────────────────
     ABOUT SECTION
  ────────────────────────────────────── */
  gsap.fromTo('.about__img-wrap',
    { opacity: 0, x: -60, rotation: -3 },
    {
      opacity: 1, x: 0, rotation: 0,
      duration: 1.2, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about__grid',
        start: 'top 75%',
      }
    }
  );

  gsap.fromTo('.about__stat-row',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0,
      duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.about__stat-row', start: 'top 80%' }
    }
  );

  // Animate stat numbers counting up
  document.querySelectorAll('.about__stat-num[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter() {
        gsap.fromTo({ val: 0 }, { val: target },
          {
            duration: 1.5, ease: 'power2.out',
            onUpdate() { el.textContent = Math.round(this.targets()[0].val) + '+'; }
          }
        );
      }
    });
  });

  gsap.fromTo('.about__copy > *',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0,
      duration: 0.7, ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: '.about__copy', start: 'top 75%' }
    }
  );

  gsap.fromTo('.about__pillar',
    { opacity: 0, x: 30 },
    {
      opacity: 1, x: 0,
      duration: 0.6, ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: { trigger: '.about__pillars', start: 'top 80%' }
    }
  );

  /* ──────────────────────────────────────
     MENU SECTION
  ────────────────────────────────────── */
  gsap.fromTo('.menu__header > *',
    { opacity: 0, y: 24 },
    {
      opacity: 1, y: 0,
      duration: 0.7, ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '.menu__header', start: 'top 80%' }
    }
  );

  gsap.fromTo('.menu__filter',
    { opacity: 0, scale: 0.9, y: 10 },
    {
      opacity: 1, scale: 1, y: 0,
      duration: 0.5, ease: 'back.out(1.5)',
      stagger: 0.07,
      scrollTrigger: { trigger: '.menu__filters', start: 'top 85%' }
    }
  );

  function animateVisibleCards() {
    const visibleCards = gsap.utils.toArray('.product-card:not(.is-hidden)');
    gsap.fromTo(visibleCards,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.6, ease: 'power3.out',
        stagger: 0.08,
      }
    );
  }

  // Initial card animation on scroll
  ScrollTrigger.create({
    trigger: '.menu__grid',
    start: 'top 80%',
    once: true,
    onEnter: animateVisibleCards,
  });

  /* ──────────────────────────────────────
     MENU FILTER TABS
  ────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.menu__filter');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('menu__filter--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('menu__filter--active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      // Hide/show with GSAP
      const toHide = [...productCards].filter(c =>
        filter !== 'all' && c.dataset.category !== filter
      );
      const toShow = [...productCards].filter(c =>
        filter === 'all' || c.dataset.category === filter
      );

      // Hide
      gsap.to(toHide, {
        opacity: 0, scale: 0.9, y: -10,
        duration: 0.25, ease: 'power2.in',
        onComplete() {
          toHide.forEach(c => c.classList.add('is-hidden'));
          // Animate newly shown cards
          toShow.forEach(c => c.classList.remove('is-hidden'));
          gsap.fromTo(toShow,
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06 }
          );
        }
      });
    });
  });

  /* ──────────────────────────────────────
     GALLERY SECTION
  ────────────────────────────────────── */
  gsap.fromTo('.gallery__header > *',
    { opacity: 0, y: 24 },
    {
      opacity: 1, y: 0,
      duration: 0.7, ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '.gallery__header', start: 'top 80%' }
    }
  );

  gsap.utils.toArray('.gallery__item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 50, scale: 0.94 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.8, ease: 'power3.out',
        delay: (i % 3) * 0.1,
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
        }
      }
    );
  });

  /* ──────────────────────────────────────
     MARQUEE BANNER — pause on reduced motion
  ────────────────────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelector('.banner__inner')?.style?.setProperty('animation', 'none');
  }

  /* ──────────────────────────────────────
     CONTACT SECTION
  ────────────────────────────────────── */
  gsap.fromTo('.contact__info > *',
    { opacity: 0, x: -40 },
    {
      opacity: 1, x: 0,
      duration: 0.7, ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '.contact__grid', start: 'top 75%' }
    }
  );

  gsap.fromTo('.contact__map-wrap',
    { opacity: 0, x: 40 },
    {
      opacity: 1, x: 0,
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact__map-wrap', start: 'top 80%' }
    }
  );

  gsap.fromTo('.contact__cta',
    { opacity: 0, y: 20, scale: 0.95 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 0.5, ease: 'back.out(1.5)',
      stagger: 0.15,
      scrollTrigger: { trigger: '.contact__ctas', start: 'top 85%' }
    }
  );

  /* ──────────────────────────────────────
     FOOTER
  ────────────────────────────────────── */
  gsap.fromTo('.footer__grid > *',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0,
      duration: 0.7, ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: { trigger: '.footer__grid', start: 'top 85%' }
    }
  );

  /* ──────────────────────────────────────
     OPEN/CLOSED STATUS
  ────────────────────────────────────── */
  checkOpenStatus();

  function checkOpenStatus() {
    const el = document.getElementById('openNow');
    if (!el) return;

    // Thailand is UTC+7
    const now = new Date();
    const bangkokOffset = 7 * 60;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bangkokTime = new Date(utc + bangkokOffset * 60000);
    const h = bangkokTime.getHours();
    const m = bangkokTime.getMinutes();
    const totalMins = h * 60 + m;
    const openMins  = 10 * 60;   // 10:00
    const closeMins = 22 * 60;   // 22:00

    const isOpen = totalMins >= openMins && totalMins < closeMins;

    el.textContent = isOpen
      ? `● Open Now · เปิดอยู่`
      : `● Closed · ปิดแล้ว · Opens 10:00`;
    el.classList.toggle('is-open', isOpen);
    el.classList.toggle('is-closed', !isOpen);
  }

  /* ──────────────────────────────────────
     SMOOTH SCROLL — offset for fixed nav
  ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight ?? 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ──────────────────────────────────────
     CARD — keyboard enter/space support
  ────────────────────────────────────── */
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.querySelector('button')?.click();
      }
    });
  });

  /* ──────────────────────────────────────
     PRODUCT INQUIRE — simple handler
  ────────────────────────────────────── */
  document.querySelectorAll('.product-card .btn--small').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const name = card?.querySelector('.product-card__name')?.textContent ?? 'this product';
      const msg  = encodeURIComponent(`สวัสดีครับ ต้องการสอบถามเกี่ยวกับ ${name} - Hello, I'd like to ask about ${name}`);
      // Opens WhatsApp — update number when real info is available
      window.open(`https://wa.me/66XXXXXXXXX?text=${msg}`, '_blank', 'noopener');
    });
  });

}
