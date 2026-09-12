(() => {
  'use strict';

  const glassStyles = document.createElement('link');
  glassStyles.rel = 'stylesheet';
  glassStyles.href = 'glass-motion.css?v=4';
  document.head.appendChild(glassStyles);

  const paletteStyles = document.createElement('link');
  paletteStyles.rel = 'stylesheet';
  paletteStyles.href = 'palette-polish.css?v=1';
  document.head.appendChild(paletteStyles);

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f7f6f2');

  const heroActions = document.querySelector('.hero-actions');
  if (heroActions && !document.querySelector('.hero-current')) {
    const current = document.createElement('div');
    current.className = 'hero-current hero-animate';
    current.setAttribute('aria-label', 'Current professional snapshot');
    current.innerHTML = `
      <p class="hero-current-label">Now</p>
      <div class="hero-current-item">
        <span>Research</span>
        <strong>Thesis finalisation</strong>
        <em>Machine unlearning · multimodal AI</em>
      </div>
      <div class="hero-current-item">
        <span>Accepted</span>
        <strong>Neurocomputing · 2026</strong>
        <em>Hessian-Guided Gradient Unlearning</em>
      </div>
      <div class="hero-current-item">
        <span>Teaching</span>
        <strong>AI + cybersecurity</strong>
        <em>Murdoch · Notre Dame Australia</em>
      </div>`;
    heroActions.before(current);
  }

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  body.classList.add('motion-enabled');
  requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('is-ready')));

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mobileNav');

  const setMenu = open => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
    nav.setAttribute('aria-hidden', String(!open));
    nav.classList.toggle('is-open', open);
  };

  toggle?.addEventListener('click', () => setMenu(!nav?.classList.contains('is-open')));
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
      setMenu(false);
      toggle?.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1040 && nav?.classList.contains('is-open')) setMenu(false);
  }, { passive: true });

  const progress = document.querySelector('.scroll-progress span');
  let scrollTicking = false;

  const updateProgress = () => {
    const max = root.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progress) progress.style.transform = `scaleX(${value})`;
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  const sections = [...document.querySelectorAll('[data-section][id]')];
  const desktopLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];

  if ('IntersectionObserver' in window && sections.length) {
    const activeObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = `#${visible.target.id}`;
      desktopLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === id));
    }, { threshold: [0.2, 0.45, 0.7], rootMargin: '-18% 0px -55% 0px' });
    sections.forEach(section => activeObserver.observe(section));
  }
})();
