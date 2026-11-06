(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile navigation */
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.getElementById('mobileMenu');

  const setMenu = open => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };

  menuButton?.addEventListener('click', () => setMenu(!mobileMenu?.classList.contains('open')));
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenu(false);
  });

  /* Scroll progress */
  const progress = document.querySelector('.page-progress span');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  /* Reveal motion */
  const reveals = [...document.querySelectorAll('.reveal')];
  reveals.forEach(el => {
    const delay = Number(el.dataset.delay || 0);
    el.style.setProperty('--delay', `${delay}ms`);
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  }

  /* Word-by-word research statement */
  const statement = document.querySelector('[data-word-reveal]');
  if (statement) {
    const words = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    words.forEach(word => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      statement.appendChild(span);
    });

    const wordEls = [...statement.querySelectorAll('.word')];
    if (reducedMotion || !('IntersectionObserver' in window)) {
      wordEls.forEach(word => word.classList.add('active'));
    } else {
      const statementObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          wordEls.forEach((word, index) => {
            window.setTimeout(() => word.classList.add('active'), index * 42);
          });
          statementObserver.disconnect();
        });
      }, { threshold: .45 });
      statementObserver.observe(statement);
    }
  }

  /* Active desktop navigation */
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const trackedSections = ['research', 'publications', 'experience', 'activity']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navLinks.length) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const href = `#${visible.target.id}`;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === href));
    }, { threshold: [.2, .45, .7], rootMargin: '-18% 0px -58% 0px' });
    trackedSections.forEach(section => navObserver.observe(section));
  }

  /* Lightweight hero pointer depth */
  const stage = document.querySelector('.signal-stage');
  if (stage && !reducedMotion && window.matchMedia('(hover:hover)').matches) {
    const portrait = stage.querySelector('.portrait-circle');
    stage.addEventListener('pointermove', event => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      if (portrait) portrait.style.transform = `translate(calc(-50% + ${x * 8}px),calc(-50% + ${y * 8}px))`;
    });
    stage.addEventListener('pointerleave', () => {
      if (portrait) portrait.style.transform = 'translate(-50%,-50%)';
    });
  }

  const formatContributionDate = date => new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${date}T00:00:00Z`));

  /* Live GitHub contribution calendar */
  const renderGitHubActivity = async () => {
    const grid = document.getElementById('activityGrid');
    const summary = document.getElementById('activitySummary');
    const detail = document.getElementById('activityDetail');
    const months = document.getElementById('activityMonths');
    if (!grid) return;

    grid.innerHTML = '';

    try {
      const response = await fetch('https://github-contributions-api.jogruber.de/v4/abdullahak07?y=last', {
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`Contribution API returned ${response.status}`);
      const data = await response.json();
      const days = Array.isArray(data.contributions)
        ? data.contributions.slice().sort((a, b) => a.date.localeCompare(b.date))
        : [];
      if (days.length < 300) throw new Error('Incomplete contribution history');

      const total = days.reduce((sum, day) => sum + Number(day.count || 0), 0);
      if (summary) summary.textContent = `${total.toLocaleString()} contributions in the last year`;
      grid.setAttribute('role', 'grid');
      grid.setAttribute('aria-label', `${total} GitHub contributions in the last year`);

      const first = new Date(`${days[0].date}T00:00:00Z`);
      const start = new Date(first);
      start.setUTCDate(first.getUTCDate() - first.getUTCDay());
      const dayMs = 86400000;
      let maxWeek = 0;

      days.forEach(day => {
        const date = new Date(`${day.date}T00:00:00Z`);
        const elapsed = Math.round((date - start) / dayMs);
        const week = Math.floor(elapsed / 7);
        const row = date.getUTCDay();
        maxWeek = Math.max(maxWeek, week);

        const count = Number(day.count || 0);
        const level = Math.max(0, Math.min(4, Number(day.level || 0)));
        const label = `${count === 0 ? 'No contributions' : `${count} contribution${count === 1 ? '' : 's'}`} on ${formatContributionDate(day.date)}`;

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'gh-day';
        cell.dataset.level = String(level);
        cell.style.gridColumn = String(week + 1);
        cell.style.gridRow = String(row + 1);
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', label);
        cell.title = label;

        const show = () => {
          if (detail) detail.textContent = label;
        };
        cell.addEventListener('mouseenter', show);
        cell.addEventListener('focus', show);
        cell.addEventListener('click', show);
        grid.appendChild(cell);
      });

      if (months) {
        months.innerHTML = '';
        const monthStarts = [];
        const seen = new Set();
        days.forEach(day => {
          const date = new Date(`${day.date}T00:00:00Z`);
          const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
          if (seen.has(key)) return;
          seen.add(key);
          monthStarts.push(date);
        });

        monthStarts.slice(-12).forEach(date => {
          const span = document.createElement('span');
          span.textContent = date.toLocaleString('en-AU', { month: 'short', timeZone: 'UTC' });
          months.appendChild(span);
        });
      }

      grid.style.gridTemplateColumns = `repeat(${maxWeek + 1},12px)`;
      if (detail) detail.textContent = 'Live GitHub profile data. Tap or hover a square to inspect a day.';
    } catch (error) {
      console.error('Live GitHub contribution calendar unavailable', error);
      if (summary) summary.textContent = 'GitHub contribution activity';
      if (detail) detail.textContent = 'Live contribution data is temporarily unavailable.';
      grid.innerHTML = '';
      const fallback = document.createElement('a');
      fallback.href = 'https://github.com/abdullahak07';
      fallback.target = '_blank';
      fallback.rel = 'noopener';
      fallback.textContent = 'View the live graph on GitHub ↗';
      fallback.style.cssText = 'display:inline-flex;align-items:center;min-height:48px;color:#165dc5;font-size:13px;font-weight:700';
      grid.appendChild(fallback);
    }
  };

  renderGitHubActivity();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();