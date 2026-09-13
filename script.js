(() => {
  'use strict';

  const logoStyles = document.createElement('link');
  logoStyles.rel = 'stylesheet';
  logoStyles.href = 'university-logos.css?v=1';
  document.head.appendChild(logoStyles);

  const universities = {
    murdoch: {
      name: 'Murdoch University',
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=https://www.murdoch.edu.au/'
    },
    notreDame: {
      name: 'The University of Notre Dame Australia',
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=https://www.notredame.edu.au/'
    },
    amu: {
      name: 'Aligarh Muslim University',
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=https://www.amu.ac.in/'
    }
  };

  const makeLogo = (university, fallback) => {
    const img = document.createElement('img');
    img.className = 'uni-logo';
    img.src = university.src;
    img.alt = `${university.name} logo`;
    img.width = 128;
    img.height = 128;
    img.decoding = 'async';
    img.addEventListener('error', () => fallback?.(), { once: true });
    return img;
  };

  const matchUniversity = text => {
    const value = (text || '').toLowerCase();
    if (value.includes('notre dame')) return universities.notreDame;
    if (value.includes('aligarh') || value.includes('amu')) return universities.amu;
    if (value.includes('murdoch') || value.trim() === 'mu' || value.includes('phd')) return universities.murdoch;
    return null;
  };

  document.querySelectorAll('.institution').forEach(item => {
    const university = matchUniversity(item.textContent);
    if (!university) return;
    const fallbackMark = item.querySelector('b');
    const img = makeLogo(university, () => item.classList.remove('has-uni-logo'));
    item.insertBefore(img, item.firstChild);
    item.classList.add('has-uni-logo');
    if (fallbackMark) fallbackMark.hidden = true;
    img.addEventListener('error', () => { if (fallbackMark) fallbackMark.hidden = false; }, { once: true });
  });

  document.querySelectorAll('.logo-mark').forEach(mark => {
    const context = `${mark.textContent} ${mark.closest('article')?.textContent || ''}`;
    const university = matchUniversity(context);
    if (!university) return;
    const fallback = mark.textContent.trim();
    mark.textContent = '';
    const img = makeLogo(university, () => {
      mark.classList.remove('has-uni-logo');
      mark.textContent = fallback;
    });
    mark.classList.add('has-uni-logo');
    mark.appendChild(img);
  });

  document.querySelectorAll('.footer-badges span').forEach(item => {
    const university = matchUniversity(item.textContent);
    if (!university) return;
    item.insertBefore(makeLogo(university), item.firstChild);
  });

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
