(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*
   * Flow-first layout override.
   * The previous research sticky panel, horizontal teaching rail and
   * content-visibility optimisation all interrupted normal scrolling.
   * This keeps the same content but restores a completely natural page flow.
   */
  const flowStyle = document.createElement('style');
  flowStyle.setAttribute('data-flow-fix', '');
  flowStyle.textContent = `
    .scene{content-visibility:visible!important;contain-intrinsic-size:auto!important}

    .research-story{
      display:block!important;
      width:min(var(--max),100%)!important;
      padding-bottom:clamp(76px,8vw,120px)!important;
    }
    .memory-wrap{display:none!important}
    .research-steps{
      display:grid!important;
      grid-template-columns:repeat(2,minmax(0,1fr))!important;
      gap:0 44px!important;
      padding:0!important;
    }
    .research-step,
    .research-step.is-active{
      min-height:0!important;
      opacity:1!important;
      padding:38px 0!important;
      transition:none!important;
      align-content:start!important;
    }
    .research-step:nth-child(3),
    .research-step:nth-child(4){border-bottom:1px solid var(--line)!important}

    .teaching-rail{padding-bottom:100px!important}
    .rail-topline i{display:none!important}
    .rail-viewport{
      overflow:visible!important;
      scroll-snap-type:none!important;
      scrollbar-width:auto!important;
    }
    .rail-track{
      display:grid!important;
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      gap:14px!important;
      min-width:0!important;
      padding:18px 0 0!important;
    }
    .week-card{
      width:auto!important;
      min-width:0!important;
      min-height:0!important;
      scroll-snap-align:none!important;
      padding:26px!important;
    }

    .section-intro,
    .publication-row,
    .teaching-roles article,
    .week-card,
    .project-case,
    .timeline article,
    .about-grid,
    .closing{
      opacity:1!important;
      transform:none!important;
      transition:none!important;
    }

    @media(max-width:1100px){
      .rail-track{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    }
    @media(max-width:760px){
      .research-steps{grid-template-columns:1fr!important;gap:0!important}
      .research-step{padding:30px 0!important}
      .research-step:nth-child(3){border-bottom:0!important}
      .rail-track{grid-template-columns:1fr!important}
      .week-card{width:100%!important;padding:22px!important}
    }
  `;
  document.head.appendChild(flowStyle);

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

  /* Native document flow only. No scroll-jacking or section-centering. */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const selector = link.getAttribute('href');
      if (!selector || selector === '#') return;
      const target = $(selector);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
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
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateHeader);
  }, { passive: true });
  updateHeader();

  /* Lightweight navigation state only; no visual reveal observers. */
  const navLinks = $$('.nav a[href^="#"]');
  const scenes = $$('.scene[data-scene]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('is-active', Boolean(id) && link.getAttribute('href') === `#${id}`);
      });
    }, { rootMargin: '-24% 0px -60% 0px', threshold: [0, 0.15] });
    scenes.forEach(scene => sectionObserver.observe(scene));
  }
})();