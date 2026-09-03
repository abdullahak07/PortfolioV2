(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const waveBars = $('.wave-bars');
  if (waveBars && !waveBars.children.length) {
    [22,34,58,78,47,66,38,84,52,30,70,92,56,42,76,48,28,64,86,44].forEach((height, index) => {
      const bar = document.createElement('i');
      bar.style.height = `${height}%`;
      bar.style.setProperty('--i', index);
      waveBars.appendChild(bar);
    });
  }

  const menuToggle = $('.menu-toggle');
  const mobileNav = $('.mobile-nav');
  const setMenu = open => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
    mobileNav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => setMenu(!mobileNav.classList.contains('is-open')));
  $$('.mobile-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const selector = link.getAttribute('href');
      if (!selector || selector === '#') return;
      const target = $(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', selector === '#top' ? location.pathname : selector);
    });
  });

  const header = $('[data-header]');
  let ticking = false;
  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
  updateHeader();

  const revealTargets = [
    ...$$('.section-intro'),
    ...$$('.publication-row'),
    ...$$('.teaching-roles article'),
    ...$$('.week-card'),
    ...$$('.project-case'),
    ...$$('.timeline article'),
    ...$$('.about-grid'),
    $('.closing')
  ].filter(Boolean);

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(el => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach(el => revealObserver.observe(el));
  }

  const navLinks = $$('.nav a[href^="#"]');
  const scenes = $$('.scene[data-scene]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      navLinks.forEach(link => link.classList.toggle('is-active', Boolean(id) && link.getAttribute('href') === `#${id}`));
    }, { rootMargin: '-24% 0px -58% 0px', threshold: [0, 0.15, 0.3] });
    scenes.forEach(scene => sectionObserver.observe(scene));
  }

  const machine = $('.memory-machine');
  const steps = $$('.research-step');
  const tabs = $$('.machine-tab');
  const stateLabel = $('#machineStateLabel');
  const targetSignal = $('#targetSignal');
  const retainSignal = $('#retainSignal');
  const auditSignal = $('#auditSignal');
  const states = {
    trained: { label: 'Original model', target: '100%', retain: '100%', audit: 'Output' },
    suppressed: { label: 'Selective forgetting', target: 'Reduced', retain: 'Protected', audit: 'Behaviour' },
    audited: { label: 'Representation audit', target: 'Residual?', retain: 'Measured', audit: 'Internal' },
    durable: { label: 'Deployment stress', target: 'Recovery?', retain: 'Re-check', audit: 'Post-deploy' }
  };

  const setMachineState = state => {
    const data = states[state];
    if (!machine || !data) return;
    machine.dataset.state = state;
    if (stateLabel) stateLabel.textContent = data.label;
    if (targetSignal) targetSignal.textContent = data.target;
    if (retainSignal) retainSignal.textContent = data.retain;
    if (auditSignal) auditSignal.textContent = data.audit;
    steps.forEach(step => step.classList.toggle('is-active', step.dataset.memoryState === state));
    tabs.forEach(tab => tab.classList.toggle('is-active', tab.dataset.stateTarget === state));
  };

  tabs.forEach(tab => tab.addEventListener('click', () => {
    const state = tab.dataset.stateTarget;
    setMachineState(state);
    const step = steps.find(item => item.dataset.memoryState === state);
    step?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  }));

  if ('IntersectionObserver' in window) {
    const stepObserver = new IntersectionObserver(entries => {
      const active = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) setMachineState(active.target.dataset.memoryState);
    }, { rootMargin: '-34% 0px -34% 0px', threshold: [0, 0.25, 0.5] });
    steps.forEach(step => stepObserver.observe(step));
  }
})();