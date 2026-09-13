(() => {
  'use strict';

  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

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
    if (window.innerWidth > 820 && nav?.classList.contains('is-open')) setMenu(false);
  }, { passive: true });

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
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  const sections = [...document.querySelectorAll('[data-section][id]')];
  const desktopLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];

  if ('IntersectionObserver' in window && sections.length) {
    const activeObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = `#${visible.target.id}`;
      desktopLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === id));
    }, { threshold: [0.18, 0.4, 0.65], rootMargin: '-16% 0px -58% 0px' });
    sections.forEach(section => activeObserver.observe(section));
  }
})();
