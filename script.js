(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const wideScreen = window.innerWidth >= 1100;
  const desktopMotion = !reducedMotion && finePointer && wideScreen;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Load small performance-only overrides without adding another visual system.
  const perfLink = document.createElement('link');
  perfLink.rel = 'stylesheet';
  perfLink.href = 'performance.css';
  document.head.appendChild(perfLink);

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Build the voice waveform once; there is no continuous JS animation attached to it.
  const waveBars = $('.wave-bars');
  if (waveBars) {
    const heights = [18,28,46,68,42,78,54,34,62,88,52,29,74,96,61,41,82,56,32,67,91,48,27,58];
    waveBars.textContent = '';
    heights.forEach((height, index) => {
      const bar = document.createElement('i');
      bar.style.setProperty('--i', String(index));
      bar.style.height = `${height}%`;
      waveBars.appendChild(bar);
    });
  }

  const body = document.body;
  const preloader = $('.preloader');
  const preloaderInner = $('.preloader-inner');
  const preloadBar = $('.preloader-line i');
  const heroLines = $$('.hero-line > span');
  const heroRevealGroups = $$('.hero .reveal-group');
  let introPlayed = false;

  function revealPage() {
    if (introPlayed) return;
    introPlayed = true;

    if (reducedMotion || !gsap) {
      body.classList.remove('is-loading');
      body.classList.add('is-ready');
      return;
    }

    gsap.set(heroLines, { yPercent: 108 });
    gsap.set(heroRevealGroups, { y: 18, opacity: 0 });
    gsap.set(preloadBar, { width: '0%' });

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(preloadBar, { width: '100%', duration: .32, ease: 'power2.inOut' })
      .to(preloaderInner, { y: -14, opacity: 0, duration: .28 }, '+=.03')
      .to(preloader, { yPercent: -100, duration: .52, ease: 'power3.inOut' }, '-=.08')
      .add(() => {
        body.classList.remove('is-loading');
        body.classList.add('is-ready');
      }, '-=.28')
      .to(heroLines, { yPercent: 0, duration: .72, stagger: .06 }, '-=.30')
      .to(heroRevealGroups, { y: 0, opacity: 1, duration: .48, stagger: .05 }, '-=.48');
  }

  window.addEventListener('load', () => window.setTimeout(revealPage, 60), { once: true });
  window.setTimeout(revealPage, 1100);

  // Native scrolling is the performance baseline. No permanent Lenis/GSAP ticker.
  function scrollToElement(target, offset = 0) {
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      event.preventDefault();
      scrollToElement(target, id === '#top' ? 0 : -28);
    });
  });

  const menuToggle = $('.menu-toggle');
  const mobileNav = $('.mobile-nav');
  function closeMobileNav() {
    if (!mobileNav || !menuToggle) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  menuToggle?.addEventListener('click', () => {
    const open = !mobileNav?.classList.contains('is-open');
    mobileNav?.classList.toggle('is-open', open);
    mobileNav?.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.mobile-nav a').forEach(a => a.addEventListener('click', closeMobileNav));

  // One rAF-throttled header update, only while scroll events arrive.
  const header = $('[data-header]');
  let previousY = window.scrollY;
  let headerTicking = false;
  function updateHeader() {
    const y = window.scrollY;
    const movingDown = y > previousY + 2;
    const movingUp = y < previousY - 2;
    if (movingDown || movingUp) {
      header?.classList.toggle('is-hidden', movingDown && y > 280 && !mobileNav?.classList.contains('is-open'));
      previousY = y;
    }
    headerTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (headerTicking) return;
    headerTicking = true;
    requestAnimationFrame(updateHeader);
  }, { passive: true });

  // Lightweight ambient field: desktop only, capped at 30 fps, 30 nodes, limited neighbours.
  class AmbientFieldLite {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.15);
      this.w = 0;
      this.h = 0;
      this.nodes = [];
      this.targetColor = [201,255,102];
      this.color = [201,255,102];
      this.lastFrame = 0;
      this.running = true;
      this.frameInterval = 1000 / 30;
      this.resizeTimer = 0;
      this.draw = this.draw.bind(this);
      this.onResize = this.onResize.bind(this);

      window.addEventListener('resize', this.onResize, { passive:true });
      document.addEventListener('visibilitychange', () => {
        this.running = !document.hidden;
        if (this.running) requestAnimationFrame(this.draw);
      });

      this.resize();
      this.seed();
      requestAnimationFrame(this.draw);
    }

    onResize() {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => {
        this.resize();
        this.seed();
      }, 180);
    }

    resize() {
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.canvas.width = Math.floor(this.w * this.dpr);
      this.canvas.height = Math.floor(this.h * this.dpr);
      this.canvas.style.width = `${this.w}px`;
      this.canvas.style.height = `${this.h}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    seed() {
      const count = Math.min(30, Math.max(22, Math.floor(this.w / 55)));
      this.nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: (Math.random() - .5) * .09,
        vy: (Math.random() - .5) * .09,
        r: i % 9 === 0 ? 1.35 : .72,
        depth: .45 + Math.random() * .55
      }));
    }

    setScene(scene) {
      const colors = {
        hero:[201,255,102], research:[201,255,102], publications:[88,112,34],
        teaching:[121,231,255], projects:[201,255,102], about:[121,231,255], closing:[201,255,102]
      };
      this.targetColor = colors[scene] || colors.hero;
    }

    draw(time) {
      if (!this.running) return;
      requestAnimationFrame(this.draw);
      if (time - this.lastFrame < this.frameInterval) return;
      this.lastFrame = time;

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      for (let c = 0; c < 3; c++) this.color[c] += (this.targetColor[c] - this.color[c]) * .06;
      const [r,g,b] = this.color.map(Math.round);
      const threshold = 135;
      const threshold2 = threshold * threshold;

      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        n.x += n.vx * n.depth;
        n.y += n.vy * n.depth;
        if (n.x < -20) n.x = this.w + 20;
        if (n.x > this.w + 20) n.x = -20;
        if (n.y < -20) n.y = this.h + 20;
        if (n.y > this.h + 20) n.y = -20;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * n.depth, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${.10 * n.depth})`;
        ctx.fill();

        // Only compare with the next few nodes instead of every node on the canvas.
        const maxJ = Math.min(this.nodes.length, i + 6);
        for (let j = i + 1; j < maxJ; j++) {
          const other = this.nodes[j];
          const dx = n.x - other.x;
          const dy = n.y - other.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= threshold2) continue;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d2 / threshold2) * .045})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  const deviceMemory = Number(navigator.deviceMemory || 8);
  const canRunAmbient = desktopMotion && deviceMemory > 4 && $('#ambientField');
  const field = canRunAmbient ? new AmbientFieldLite($('#ambientField')) : null;
  if (!field) $('#ambientField')?.setAttribute('hidden', '');

  const scenes = $$('.scene[data-scene]');
  const navLinks = $$('.nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const sceneObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const scene = visible.target.dataset.scene;
      field?.setScene(scene);
      const id = visible.target.id;
      navLinks.forEach(link => link.classList.toggle('is-active', Boolean(id) && link.getAttribute('href') === `#${id}`));
    }, { threshold:[.18,.42,.66] });
    scenes.forEach(scene => sceneObserver.observe(scene));
  }

  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ limitCallbacks:true, ignoreMobileResize:true });

    // Expensive scroll-scrub effects are desktop-only.
    if (desktopMotion) {
      gsap.to('.hero-line:nth-child(1) > span', { xPercent:-4.5, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:.45 } });
      gsap.to('.hero-line:nth-child(2) > span', { xPercent:3.5, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:.45 } });
      gsap.to('.portrait-frame img', { yPercent:5, scale:1.025, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:.5 } });
    }

    // Entry animations run once and then release their transform layers.
    $$('.section-intro').forEach(intro => {
      gsap.from(intro, {
        y: reducedMotion ? 0 : 36,
        opacity:0,
        duration:.72,
        ease:'power3.out',
        clearProps:'transform,opacity',
        scrollTrigger:{ trigger:intro, start:'top 82%', once:true }
      });
    });

    $$('.publication-row').forEach(row => {
      gsap.from(row, {
        y: reducedMotion ? 0 : 28,
        opacity:0,
        duration:.62,
        ease:'power3.out',
        clearProps:'transform,opacity',
        scrollTrigger:{ trigger:row, start:'top 88%', once:true }
      });
    });

    $$('.project-case').forEach(project => {
      gsap.from(project, {
        y: reducedMotion ? 0 : 38,
        opacity:0,
        duration:.76,
        ease:'power3.out',
        clearProps:'transform,opacity',
        scrollTrigger:{ trigger:project, start:'top 82%', once:true }
      });
    });

    // Pinned horizontal storytelling stays on large desktops only.
    const rail = $('[data-horizontal-rail]');
    const track = rail ? $('.rail-track', rail) : null;
    if (desktopMotion && rail && track && window.innerWidth >= 1200) {
      const horizontalDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + Math.max(40, window.innerWidth * .08));
      gsap.to(track, {
        x:() => -horizontalDistance(),
        ease:'none',
        scrollTrigger:{
          trigger:rail,
          start:'top top',
          end:() => `+=${horizontalDistance() + window.innerHeight * .55}`,
          scrub:.4,
          pin:true,
          pinType:'fixed',
          anticipatePin:0,
          invalidateOnRefresh:true
        }
      });
    }
  }

  const machine = $('.memory-machine');
  const stateLabel = $('#machineStateLabel');
  const targetSignal = $('#targetSignal');
  const retainSignal = $('#retainSignal');
  const auditSignal = $('#auditSignal');
  const steps = $$('.research-step');
  const tabs = $$('.machine-tab');
  const states = {
    trained:{ label:'Original model', target:'100%', retain:'100%', audit:'Output' },
    suppressed:{ label:'Selective forgetting', target:'↓ target', retain:'Protected', audit:'Behaviour' },
    audited:{ label:'Representation audit', target:'Residual?', retain:'Measured', audit:'Internal' },
    durable:{ label:'Deployment stress', target:'Recovery?', retain:'Re-check', audit:'Post-deploy' }
  };

  function setMachineState(state) {
    if (!machine || !states[state]) return;
    machine.dataset.state = state;
    if (stateLabel) stateLabel.textContent = states[state].label;
    if (targetSignal) targetSignal.textContent = states[state].target;
    if (retainSignal) retainSignal.textContent = states[state].retain;
    if (auditSignal) auditSignal.textContent = states[state].audit;
    steps.forEach(step => step.classList.toggle('is-active', step.dataset.memoryState === state));
    tabs.forEach(tab => tab.classList.toggle('is-active', tab.dataset.stateTarget === state));
  }

  if ('IntersectionObserver' in window) {
    const researchObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setMachineState(visible.target.dataset.memoryState);
    }, { rootMargin:'-34% 0px -34% 0px', threshold:.01 });
    steps.forEach(step => researchObserver.observe(step));
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    const state = tab.dataset.stateTarget;
    const step = steps.find(item => item.dataset.memoryState === state);
    setMachineState(state);
    if (step) scrollToElement(step, -window.innerHeight * .20);
  }));

  // Pointer spotlight only; no GSAP tween creation on every pointer move.
  if (desktopMotion) {
    $$('.publication-row').forEach(row => {
      let raf = 0;
      let x = 0;
      let y = 0;
      row.addEventListener('pointermove', event => {
        const rect = row.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          row.style.setProperty('--mx', `${x}px`);
          row.style.setProperty('--my', `${y}px`);
          raf = 0;
        });
      }, { passive:true });
    });
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (desktopMotion) ScrollTrigger?.refresh();
    }, 250);
  }, { passive:true });

  window.addEventListener('load', () => {
    if (desktopMotion) window.setTimeout(() => ScrollTrigger?.refresh(), 120);
  }, { once:true });
})();
