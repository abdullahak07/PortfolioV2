(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const Lenis = window.Lenis;

  $('#year').textContent = new Date().getFullYear();

  // ---------- PRELOADER + MASTER INTRO ----------
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

    gsap.set(heroLines, { yPercent: 118, rotate: 1.2 });
    gsap.set(heroRevealGroups, { y: 22, opacity: 0 });
    gsap.set(preloadBar, { width: '0%' });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(preloadBar, { width: '100%', duration: .55, ease: 'power2.inOut' })
      .to(preloaderInner, { y: -24, opacity: 0, duration: .45 }, '+=.08')
      .to(preloader, { yPercent: -100, duration: .85, ease: 'power4.inOut' }, '-=.12')
      .add(() => {
        body.classList.remove('is-loading');
        body.classList.add('is-ready');
      }, '-=.45')
      .to(heroLines, { yPercent: 0, rotate: 0, duration: 1.05, stagger: .09 }, '-=.48')
      .to(heroRevealGroups, { y: 0, opacity: 1, duration: .72, stagger: .08 }, '-=.72');
  }

  window.addEventListener('load', () => window.setTimeout(revealPage, 180), { once: true });
  window.setTimeout(revealPage, 1700);

  // ---------- SMOOTH SCROLL ----------
  let lenis = null;
  if (!reducedMotion && Lenis) {
    lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.2,
      wheelMultiplier: .9,
      syncTouch: false,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    if (gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } else if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  function scrollToElement(target, offset = 0) {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.15 });
    else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      event.preventDefault();
      scrollToElement(target, id === '#top' ? 0 : -40);
    });
  });

  // ---------- MOBILE NAV ----------
  const menuToggle = $('.menu-toggle');
  const mobileNav = $('.mobile-nav');
  function closeMobileNav() {
    if (!mobileNav || !menuToggle) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  menuToggle?.addEventListener('click', () => {
    const open = !mobileNav.classList.contains('is-open');
    mobileNav.classList.toggle('is-open', open);
    mobileNav.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.mobile-nav a').forEach(a => a.addEventListener('click', closeMobileNav));

  // ---------- HEADER BEHAVIOUR ----------
  const header = $('[data-header]');
  let previousY = window.scrollY;
  let headerTicking = false;
  function updateHeader() {
    const y = window.scrollY;
    const movingDown = y > previousY;
    if (header) header.classList.toggle('is-hidden', movingDown && y > 260 && !mobileNav?.classList.contains('is-open'));
    previousY = y;
    headerTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!headerTicking) {
      requestAnimationFrame(updateHeader);
      headerTicking = true;
    }
  }, { passive: true });

  // ---------- CURSOR + MAGNETIC PHYSICS ----------
  const cursorDot = $('.cursor-dot');
  const cursorRing = $('.cursor-ring');
  if (finePointer && !reducedMotion && cursorDot && cursorRing) {
    body.classList.add('has-pointer');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;
    window.addEventListener('pointermove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX - 2.5}px, ${mouseY - 2.5}px)`;
    }, { passive: true });
    const cursorFrame = () => {
      ringX += (mouseX - ringX) * .16;
      ringY += (mouseY - ringY) * .16;
      cursorRing.style.transform = `translate(${ringX - 17}px, ${ringY - 17}px)`;
      requestAnimationFrame(cursorFrame);
    };
    requestAnimationFrame(cursorFrame);

    $$('a, button, [data-tilt]').forEach(el => {
      el.addEventListener('pointerenter', () => body.classList.add('cursor-active'));
      el.addEventListener('pointerleave', () => body.classList.remove('cursor-active'));
    });

    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .16;
        const y = (e.clientY - r.top - r.height / 2) * .16;
        if (gsap) gsap.to(el, { x, y, duration: .35, ease: 'power3.out', overwrite: true });
        else el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('pointerleave', () => {
        if (gsap) gsap.to(el, { x: 0, y: 0, duration: .65, ease: 'elastic.out(1,.5)' });
        else el.style.transform = '';
      });
    });
  }

  // ---------- AMBIENT RESEARCH FIELD ----------
  class AmbientField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      this.w = 0; this.h = 0;
      this.nodes = [];
      this.pointer = { x: -9999, y: -9999, active: false };
      this.scroll = 0;
      this.targetColor = [201,255,102];
      this.color = [201,255,102];
      this.frame = 0;
      this.resize = this.resize.bind(this);
      this.draw = this.draw.bind(this);
      window.addEventListener('resize', this.resize, { passive: true });
      window.addEventListener('pointermove', e => { this.pointer.x = e.clientX; this.pointer.y = e.clientY; this.pointer.active = true; }, { passive: true });
      window.addEventListener('pointerleave', () => { this.pointer.active = false; }, { passive: true });
      window.addEventListener('scroll', () => { this.scroll = window.scrollY; }, { passive: true });
      this.resize();
      this.seed();
      this.draw();
    }
    resize() {
      this.w = window.innerWidth; this.h = window.innerHeight;
      this.canvas.width = Math.floor(this.w * this.dpr);
      this.canvas.height = Math.floor(this.h * this.dpr);
      this.canvas.style.width = `${this.w}px`;
      this.canvas.style.height = `${this.h}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    seed() {
      const count = this.w < 800 ? 24 : Math.min(72, Math.floor(this.w / 24));
      this.nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: (Math.random() - .5) * .14,
        vy: (Math.random() - .5) * .14,
        r: i % 11 === 0 ? 1.5 : .75,
        depth: .35 + Math.random() * .9
      }));
    }
    setScene(scene) {
      const colors = {
        hero:[201,255,102], research:[201,255,102], publications:[88,112,34],
        teaching:[121,231,255], projects:[201,255,102], about:[121,231,255], closing:[201,255,102]
      };
      this.targetColor = colors[scene] || colors.hero;
    }
    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      for (let c = 0; c < 3; c++) this.color[c] += (this.targetColor[c] - this.color[c]) * .025;
      const [r,g,b] = this.color.map(Math.round);
      const threshold = this.w < 800 ? 105 : 145;

      this.nodes.forEach((n, index) => {
        n.x += n.vx * n.depth;
        n.y += n.vy * n.depth + Math.sin((this.frame + index * 13) * .003) * .015;
        if (n.x < -30) n.x = this.w + 30; if (n.x > this.w + 30) n.x = -30;
        if (n.y < -30) n.y = this.h + 30; if (n.y > this.h + 30) n.y = -30;

        if (this.pointer.active && finePointer) {
          const dx = n.x - this.pointer.x, dy = n.y - this.pointer.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < 17000 && d2 > 1) {
            const push = (17000 - d2) / 17000 * .22;
            const d = Math.sqrt(d2);
            n.x += dx / d * push * 4;
            n.y += dy / d * push * 4;
          }
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * n.depth, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${.12 * n.depth})`;
        ctx.fill();
      });

      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const a = this.nodes[i], bNode = this.nodes[j];
          const dx = a.x - bNode.x, dy = a.y - bNode.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < threshold) {
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(bNode.x,bNode.y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1-d/threshold)*.055})`;
            ctx.lineWidth = .55; ctx.stroke();
          }
        }
      }
      this.frame++;
      requestAnimationFrame(this.draw);
    }
  }

  const field = !reducedMotion && $('#ambientField') ? new AmbientField($('#ambientField')) : null;

  // ---------- SCENE OBSERVER + NAV STATE ----------
  const scenes = $$('.scene[data-scene]');
  const navLinks = $$('.nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const sceneObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const scene = visible.target.dataset.scene;
      field?.setScene(scene);
      const id = visible.target.id;
      navLinks.forEach(link => link.classList.toggle('is-active', id && link.getAttribute('href') === `#${id}`));
    }, { threshold:[.12,.3,.5,.7] });
    scenes.forEach(scene => sceneObserver.observe(scene));
  }

  // ---------- GSAP SCROLL CHOREOGRAPHY ----------
  if (!reducedMotion && gsap && ScrollTrigger) {
    // Hero behaves like a title sequence, not a set of independent fades.
    gsap.to('.hero-line:nth-child(1) > span', { xPercent:-7, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:1 } });
    gsap.to('.hero-line:nth-child(2) > span', { xPercent:5, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:1 } });
    gsap.to('.hero-line:nth-child(3) > span', { xPercent:-4, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:1 } });
    gsap.to('.portrait-frame img', { yPercent:8, scale:1.04, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:1.2 } });
    gsap.to('.portrait-scan', { y:'360%', ease:'none', scrollTrigger:{ trigger:'.hero-portrait', start:'top 75%', end:'bottom 20%', scrub:1 } });

    $$('.section-intro').forEach(intro => {
      const parts = $$('.section-kicker,.section-title,.section-copy', intro);
      gsap.from(parts, { y:58, opacity:0, duration:1, stagger:.08, ease:'power4.out', scrollTrigger:{ trigger:intro, start:'top 78%', once:true } });
    });

    $$('.publication-row').forEach((row, index) => {
      gsap.from(row.children, { y:40, opacity:0, duration:.8, stagger:.055, ease:'power3.out', scrollTrigger:{ trigger:row, start:'top 84%', once:true } });
      const graphic = $('.pub-motion', row);
      if (graphic) gsap.from(graphic, { x: index % 2 ? -28 : 28, duration:1, ease:'power3.out', scrollTrigger:{ trigger:row, start:'top 84%', once:true } });
    });

    $$('.teaching-roles article').forEach((card, i) => {
      gsap.from(card, { y:50, opacity:0, duration:.9, delay:i*.07, ease:'power3.out', scrollTrigger:{ trigger:card, start:'top 82%', once:true } });
    });

    $$('.project-case').forEach((project, i) => {
      const copy = $('.project-copy', project), visual = $('.project-visual', project);
      gsap.from(copy, { y:65, opacity:0, duration:1, ease:'power4.out', scrollTrigger:{ trigger:project, start:'top 76%', once:true } });
      gsap.from(visual, { clipPath:i%2 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', duration:1.15, ease:'power4.inOut', scrollTrigger:{ trigger:project, start:'top 79%', once:true } });
    });

    gsap.from('.about-lead', { y:60, opacity:0, duration:1, ease:'power4.out', scrollTrigger:{ trigger:'.about-grid', start:'top 78%', once:true } });
    gsap.from('.about-copy > *', { y:45, opacity:0, duration:.85, stagger:.1, ease:'power3.out', scrollTrigger:{ trigger:'.about-grid', start:'top 75%', once:true } });
    $$('.timeline article').forEach(row => gsap.from(row, { x:-26, opacity:0, duration:.7, ease:'power3.out', scrollTrigger:{ trigger:row, start:'top 88%', once:true } }));
    gsap.from('.closing h2 span', { yPercent:110, opacity:0, duration:1.05, stagger:.11, ease:'power4.out', scrollTrigger:{ trigger:'.closing', start:'top 62%', once:true } });

    // Horizontal teaching cinema on large screens.
    const rail = $('[data-horizontal-rail]');
    const track = $('.rail-track', rail || document);
    const viewport = $('.rail-viewport', rail || document);
    if (rail && track && viewport && window.innerWidth > 800) {
      const horizontalDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + Math.max(40, window.innerWidth * .08));
      gsap.to(track, {
        x: () => -horizontalDistance(),
        ease:'none',
        scrollTrigger:{
          trigger:rail,
          start:'top top',
          end:() => `+=${horizontalDistance() + window.innerHeight * .8}`,
          scrub:1,
          pin:true,
          anticipatePin:1,
          invalidateOnRefresh:true
        }
      });
    }
  }

  // ---------- RESEARCH STATE MACHINE ----------
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
    stateLabel.textContent = states[state].label;
    targetSignal.textContent = states[state].target;
    retainSignal.textContent = states[state].retain;
    auditSignal.textContent = states[state].audit;
    steps.forEach(step => step.classList.toggle('is-active', step.dataset.memoryState === state));
    tabs.forEach(tab => tab.classList.toggle('is-active', tab.dataset.stateTarget === state));
    if (gsap && !reducedMotion) {
      gsap.fromTo([stateLabel,targetSignal,retainSignal,auditSignal], { y:8, opacity:.3 }, { y:0, opacity:1, duration:.45, stagger:.035, ease:'power3.out', overwrite:true });
    }
  }

  if (!reducedMotion && ScrollTrigger) {
    steps.forEach(step => {
      ScrollTrigger.create({
        trigger:step,
        start:'top 55%',
        end:'bottom 45%',
        onEnter:() => setMachineState(step.dataset.memoryState),
        onEnterBack:() => setMachineState(step.dataset.memoryState)
      });
    });
  } else {
    const researchObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setMachineState(entry.target.dataset.memoryState); });
    }, { threshold:.6 });
    steps.forEach(step => researchObserver.observe(step));
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    const state = tab.dataset.stateTarget;
    const step = steps.find(item => item.dataset.memoryState === state);
    setMachineState(state);
    if (step) scrollToElement(step, -window.innerHeight * .22);
  }));

  // ---------- PUBLICATION LIGHT FIELD ----------
  $$('.publication-row').forEach(row => {
    row.addEventListener('pointermove', e => {
      const rect = row.getBoundingClientRect();
      row.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      row.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }, { passive:true });
  });

  // ---------- PROJECT DEPTH ----------
  if (finePointer && !reducedMotion) {
    $$('[data-tilt]').forEach(item => {
      const visual = item.matches('.project-case') ? $('.project-visual', item) : $('.portrait-frame', item);
      if (!visual) return;
      item.addEventListener('pointermove', e => {
        const r = visual.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        const rx = py * -4.5;
        const ry = px * 5.5;
        if (gsap) gsap.to(visual, { rotateX:rx, rotateY:ry, x:px*8, y:py*8, duration:.55, ease:'power3.out', transformPerspective:1200, overwrite:true });
        else visual.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      item.addEventListener('pointerleave', () => {
        if (gsap) gsap.to(visual, { rotateX:0, rotateY:0, x:0, y:0, duration:.8, ease:'elastic.out(1,.55)' });
        else visual.style.transform = '';
      });
    });
  }

  // ---------- RESIZE / REFRESH ----------
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => ScrollTrigger?.refresh(), 180);
  }, { passive:true });

  window.addEventListener('load', () => ScrollTrigger?.refresh(), { once:true });
})();