(() => {
  'use strict';

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  const setMenu = (open) => {
    navLinks.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      setMenu(!navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });

    window.matchMedia('(min-width: 801px)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Staggered reveal ---------- */
  // These grids reveal item by item instead of as one block.
  document.querySelectorAll('.about-stats, .cert-list').forEach((group) => {
    group.classList.remove('reveal');
    [...group.children].forEach((child) => child.classList.add('reveal'));
  });

  // Items that enter the screen together get a small delay one after another.
  ['.about-stats', '.skills-grid', '.projects-grid', '.cert-list'].forEach((selector) => {
    const group = document.querySelector(selector);
    if (!group) return;
    [...group.children].forEach((child, i) => {
      child.style.setProperty('--d', Math.min(i * 0.06, 0.3) + 's');
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    // Not unobserved: items reset when they leave the screen, so the
    // animation plays again every time you scroll back to them.
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
      });
    }, { threshold: 0.12 });

    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Where am I? header segments and section accents ---------- */
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = document.querySelectorAll('.nav-link');

  // Segmented line under the header (phones and small screens)
  const segs = document.createElement('div');
  segs.className = 'header-segments';
  segs.setAttribute('aria-hidden', 'true');

  sections.forEach(() => {
    const seg = document.createElement('span');
    seg.innerHTML = '<i></i>';
    segs.appendChild(seg);
  });

  const headerEl = document.querySelector('.header');
  if (headerEl) headerEl.appendChild(segs);

  const segFills = [...segs.querySelectorAll('i')];

  const progress = document.getElementById('scrollProgress');
  const header = headerEl;
  const toTop = document.getElementById('toTop');
  let ticking = false;
  let current = -1;

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;

    if (progress) {
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
    if (header) header.classList.toggle('scrolled', y > 20);
    if (toTop) toTop.classList.toggle('show', y > 700);

    if (!sections.length) { ticking = false; return; }

    // The section sitting around the middle of the screen is the current one.
    const probe = y + vh * 0.45;
    const tops = sections.map((s) => s.getBoundingClientRect().top + y);
    let idx = 0;
    tops.forEach((top, i) => { if (probe >= top) idx = i; });
    if (max > 0 && y >= max - 4) idx = sections.length - 1;

    if (idx !== current) {
      current = idx;
      const id = sections[idx].id;
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
      sections.forEach((s, i) => s.classList.toggle('is-current', i === idx));
    }

    const last = sections.length - 1;

    // Segments under the header: each one fills as its section is read.
    segFills.forEach((fill, i) => {
      const bottom = i < last ? tops[i + 1] : document.documentElement.scrollHeight;
      const p = i < idx ? 1 : i > idx ? 0 : Math.min(Math.max((y + vh * 0.2 - tops[i]) / Math.max(bottom - tops[i] - vh * 0.6, 1), 0.06), 1);
      fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', () => { current = -1; onScroll(); });
  window.addEventListener('load', () => { current = -1; onScroll(); });
  onScroll();

  /* ---------- Card spotlight that follows the cursor (desktop) ---------- */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canHover && !reduceMotion) {
    document.querySelectorAll('.stat-card, .skill-card, .project-card, .cert-list li').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById('currentYear');
  if (year) year.textContent = new Date().getFullYear();
})();