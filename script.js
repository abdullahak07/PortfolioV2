(() => {
  'use strict';

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.getElementById('mobileMenu');
  const setMenu = open => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Close' : 'Menu';
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('open', open);
  };
  menuButton?.addEventListener('click', () => setMenu(!mobileMenu?.classList.contains('open')));
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  const topButton = document.querySelector('[data-top]');
  const updateTopButton = () => topButton?.classList.toggle('visible', window.scrollY > 700);
  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
  topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const connectPanel = document.querySelector('[data-connect-panel]');
  const openButtons = document.querySelectorAll('[data-connect-open]');
  const closeButton = document.querySelector('[data-connect-close]');
  const setConnect = open => {
    if (!connectPanel) return;
    connectPanel.classList.toggle('open', open);
    connectPanel.setAttribute('aria-hidden', String(!open));
  };
  openButtons.forEach(button => button.addEventListener('click', () => setConnect(true)));
  closeButton?.addEventListener('click', () => setConnect(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setConnect(false);
      setMenu(false);
    }
  });

  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('[data-section][id]')];
  if ('IntersectionObserver' in window && navLinks.length && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const best = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!best) return;
      const id = `#${best.target.id}`;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === id));
    }, { threshold: [0.2, 0.45, 0.7], rootMargin: '-12% 0px -55% 0px' });
    sections.forEach(section => observer.observe(section));
  }

  const grid = document.getElementById('activityGrid');
  if (grid) {
    const levels = [];
    for (let i = 0; i < 364; i++) {
      const wave = Math.sin(i * 0.37) + Math.sin(i * 0.11) * 0.8 + Math.cos(i * 0.071) * 0.55;
      const active = ((i * 17 + 11) % 29 === 0) || ((i * 13 + 7) % 41 === 0);
      let level = wave > 1.35 ? 3 : wave > .55 ? 2 : wave > -.1 ? 1 : 0;
      if (active) level = 4;
      if (i > 300 && (i % 8 < 3)) level = Math.max(level, 2);
      levels.push(level);
    }
    grid.innerHTML = levels.map(level => `<i class="l${level}"></i>`).join('');
  }
})();
