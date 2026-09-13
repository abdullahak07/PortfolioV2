(() => {
  'use strict';

  const logoStyles = document.createElement('link');
  logoStyles.rel = 'stylesheet';
  logoStyles.href = 'university-logos.css?v=2';
  document.head.appendChild(logoStyles);

  const footerIconStyles = document.createElement('link');
  footerIconStyles.rel = 'stylesheet';
  footerIconStyles.href = 'footer-icons.css?v=2';
  document.head.appendChild(footerIconStyles);

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
    },
    turku: {
      name: 'University of Turku',
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=https://www.utu.fi/'
    }
  };

  const institutionStrip = document.querySelector('.institution-strip');
  if (institutionStrip && !institutionStrip.textContent.toLowerCase().includes('turku')) {
    const item = document.createElement('span');
    item.className = 'institution';
    item.innerHTML = '<b>UTU</b><em>University of<br>Turku</em>';
    institutionStrip.appendChild(item);
  }

  const educationCard = document.querySelector('.education-card');
  if (educationCard && !educationCard.textContent.toLowerCase().includes('turku')) {
    const article = document.createElement('article');
    article.className = 'admission-entry';
    article.innerHTML = '<div class="logo-mark blue">UTU</div><div><strong>Master’s Programme — Admission</strong><span>University of Turku, Finland</span><p>Admitted to a master’s programme.</p></div>';
    educationCard.appendChild(article);
  }

  const footerBadges = document.querySelector('.footer-badges');
  if (footerBadges && !footerBadges.textContent.toLowerCase().includes('turku')) {
    const badge = document.createElement('span');
    badge.textContent = 'University of Turku';
    footerBadges.appendChild(badge);
  }

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
    if (value.includes('turku') || value.includes('utu')) return universities.turku;
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
    if (!item.querySelector('.uni-logo')) item.insertBefore(makeLogo(university), item.firstChild);
  });

  const socialIcons = [
    {
      match: href => href.includes('linkedin.com'),
      label: 'LinkedIn',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.2 3.2A2.2 2.2 0 1 1 .8 3.2a2.2 2.2 0 0 1 4.4 0ZM1.3 8h3.8v12.7H1.3V8Zm6.1 0H11v1.7h.1c.5-.9 1.8-2.2 3.9-2.2 4.1 0 4.9 2.7 4.9 6.2v7h-3.8v-6.2c0-1.5 0-3.5-2.2-3.5s-2.5 1.7-2.5 3.4v6.3H7.4V8Z"/></svg>'
    },
    {
      match: href => href.includes('github.com'),
      label: 'GitHub',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-2c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-5a4 4 0 0 1 1-2.8c-.1-.3-.4-1.3.1-2.8 0 0 .9-.3 2.9 1.1A9.7 9.7 0 0 1 12 7a9.7 9.7 0 0 1 2.6.4c2-1.4 2.9-1.1 2.9-1.1.5 1.5.2 2.5.1 2.8a4 4 0 0 1 1 2.8c0 3.9-2.4 4.7-4.6 5 .4.3.7 1 .7 2v3c0 .3.2.6.7.5a10.2 10.2 0 0 0 6.8-9.7C22 6.6 17.5 2 12 2Z"/></svg>'
    },
    {
      match: href => href.includes('scholar.google.com'),
      label: 'Google Scholar',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 3 9 5-9 5-9-5 9-5Zm-6 8.7 6 3.3 6-3.3v4.1c0 2.1-2.7 4.2-6 4.2s-6-2.1-6-4.2v-4.1Z"/></svg>'
    },
    {
      match: href => href.startsWith('mailto:'),
      label: 'Email',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2 9 6 9-6H3Zm18 10V9.4l-8.4 5.6a1 1 0 0 1-1.2 0L3 9.4V17h18Z"/></svg>'
    },
    {
      match: href => href.endsWith('cv.html'),
      label: 'CV',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h6"/></svg>'
    }
  ];

  document.querySelectorAll('.socials a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const icon = socialIcons.find(item => item.match(href));
    if (!icon) return;

    link.textContent = '';
    link.setAttribute('aria-label', icon.label);
    link.title = icon.label;
    link.insertAdjacentHTML('afterbegin', icon.svg);

    const label = document.createElement('span');
    label.className = 'social-label';
    label.textContent = icon.label;
    link.appendChild(label);
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