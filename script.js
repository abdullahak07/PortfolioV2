(() => {
  'use strict';

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mobileNav');

  const setMenu = open => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
    nav.setAttribute('aria-hidden', String(!open));
    nav.classList.toggle('is-open', open);
  };

  toggle?.addEventListener('click', () => {
    setMenu(!nav?.classList.contains('is-open'));
  });

  nav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
      setMenu(false);
      toggle?.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1020 && nav?.classList.contains('is-open')) setMenu(false);
  }, { passive: true });
})();
