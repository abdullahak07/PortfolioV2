const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const reveals = document.querySelectorAll('.reveal');
if (reduceMotion) reveals.forEach(el => el.classList.add('visible'));
else {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: .08 });
  reveals.forEach(el => io.observe(el));
}

const progress = document.querySelector('.scroll-progress span');
window.addEventListener('scroll', () => {
  const d = document.documentElement;
  const p = d.scrollTop / (d.scrollHeight - d.clientHeight);
  progress.style.width = `${Math.max(0, Math.min(1, p)) * 100}%`;
}, { passive: true });

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open'); menu.setAttribute('aria-expanded','false');
}));

document.getElementById('year').textContent = new Date().getFullYear();

const svg = document.querySelector('.network svg');
const nodeGroup = svg.querySelector('.nodes');
const linkGroup = svg.querySelector('.links');
const network = document.querySelector('.network');
const status = document.getElementById('labStatus');
const buttons = [...document.querySelectorAll('.lab-btn')];

const nodes = [
  [72,82,0],[78,170,0],[72,255,0],[82,344,0],
  [210,58,0],[215,128,1],[215,206,0],[220,284,1],[210,365,0],
  [370,78,0],[375,152,1],[372,232,1],[378,312,0],[370,372,0],
  [525,112,0],[528,204,1],[525,298,0],
  [650,160,0],[650,266,0]
].map((v,i)=>({id:i,x:v[0],y:v[1],target:!!v[2]}));
const layers = [[0,1,2,3],[4,5,6,7,8],[9,10,11,12,13],[14,15,16],[17,18]];
const edges = [];
for(let l=0;l<layers.length-1;l++){
  layers[l].forEach(a=>layers[l+1].forEach(b=>{
    const target = nodes[a].target || nodes[b].target;
    edges.push({a,b,target});
  }));
}
const NS='http://www.w3.org/2000/svg';
edges.forEach(e=>{
  const line=document.createElementNS(NS,'line');
  line.setAttribute('x1',nodes[e.a].x);line.setAttribute('y1',nodes[e.a].y);
  line.setAttribute('x2',nodes[e.b].x);line.setAttribute('y2',nodes[e.b].y);
  line.setAttribute('class',`edge${e.target?' target':''}`); linkGroup.appendChild(line);
});
nodes.forEach(n=>{
  const c=document.createElementNS(NS,'circle');
  c.setAttribute('cx',n.x);c.setAttribute('cy',n.y);c.setAttribute('r',n.target?7:5);
  c.setAttribute('class',`node${n.target?' target':''}`); nodeGroup.appendChild(c);
});

function setState(s){
  buttons.forEach(b=>b.classList.toggle('active',b.dataset.state===s));
  network.classList.remove('forgotten','recovered');
  if(s==='forgotten'){network.classList.add('forgotten');status.textContent='Target knowledge appears suppressed';}
  else if(s==='recovered'){network.classList.add('recovered');status.textContent='Residual target signal re-emerges';}
  else status.textContent='Target knowledge present';
}
buttons.forEach(b=>b.addEventListener('click',()=>setState(b.dataset.state)));
setState('trained');

const arxivCategoryNames = {
  'cs.LG':'Machine Learning',
  'cs.AI':'Artificial Intelligence',
  'cs.CV':'Computer Vision',
  'cs.CL':'Computation & Language',
  'cs.CR':'Cryptography & Security',
  'stat.ML':'Machine Learning',
};

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatResearchDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return new Intl.DateTimeFormat('en-AU', { month:'short', year:'numeric' }).format(date);
}

function renderResearchFeed(data) {
  const section = document.querySelector('.publications-section');
  const head = section?.querySelector('.section-head');
  const papers = Array.isArray(data?.papers) ? data.papers.slice(0, 4) : [];
  if (!section || !head || !data?.available || !papers.length) return;

  document.getElementById('researchNow')?.remove();

  const panel = document.createElement('section');
  panel.id = 'researchNow';
  panel.className = 'research-now';
  panel.setAttribute('aria-label', 'Latest research from arXiv');

  const paperRows = papers.map((paper, index) => {
    const categories = (paper.categories || []).slice(0, 2)
      .map(code => `<span>${escapeHtml(arxivCategoryNames[code] || code)}</span>`)
      .join('');
    const coauthors = (paper.authors || [])
      .filter(name => !/abdullah\s+(ahmad\s+)?khan/i.test(name))
      .slice(0, 3)
      .map(escapeHtml)
      .join(' · ');

    return `
      <article class="research-now-paper">
        <div class="research-now-meta">
          <span class="research-now-date">${formatResearchDate(paper.updated || paper.published)}</span>
          ${index === 0 ? '<span class="research-now-latest">Latest</span>' : ''}
        </div>
        <div class="research-now-copy">
          <div class="research-now-tags">${categories}</div>
          <h4>${escapeHtml(paper.title)}</h4>
          ${coauthors ? `<p>with ${coauthors}</p>` : ''}
        </div>
        <a class="research-now-link" href="${escapeHtml(paper.url)}" target="_blank" rel="noopener" aria-label="Read ${escapeHtml(paper.title)} on arXiv">Read paper <span>↗</span></a>
      </article>
    `;
  }).join('');

  panel.innerHTML = `
    <div class="research-now-intro">
      <div>
        <span class="research-now-signal" aria-hidden="true"></span>
        <span class="eyebrow">Live from arXiv</span>
      </div>
      <h3>Research, while it’s <em>moving.</em></h3>
      <p>Current preprints and revisions pulled from the arXiv metadata feed. No citation counters—just the work itself.</p>
      <a href="https://arxiv.org/search/?query=Abdullah+Ahmad+Khan&searchtype=author" target="_blank" rel="noopener">View arXiv search ↗</a>
    </div>
    <div class="research-now-list">${paperRows}</div>
  `;

  head.insertAdjacentElement('afterend', panel);
}

async function loadResearchFeed() {
  const section = document.querySelector('.publications-section');
  if (!section) return;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch('/api/research-feed', {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return;
    const data = await response.json();
    renderResearchFeed(data);
  } catch (error) {
    console.info('Live arXiv feed unavailable; static publications retained.', error?.message || error);
  } finally {
    window.clearTimeout(timer);
  }
}

loadResearchFeed();

(function installAppleInteractionLayer(){
  if (!document.querySelector('link[data-apple-motion]')) {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = 'apple-motion.css';
    sheet.dataset.appleMotion = 'true';
    document.head.appendChild(sheet);
  }

  const pressables = document.querySelectorAll('.button,.lab-btn,.week-actions a,.project-card,.profile-links a,.pub-links a,.nav a,.research-now-link');
  pressables.forEach(el => {
    el.classList.add('motion-pressable');
    const press = () => el.classList.add('is-pressed');
    const release = () => el.classList.remove('is-pressed');
    el.addEventListener('pointerdown', press, {passive:true});
    el.addEventListener('pointerup', release, {passive:true});
    el.addEventListener('pointercancel', release, {passive:true});
    el.addEventListener('pointerleave', release, {passive:true});
    el.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') press(); });
    el.addEventListener('keyup', release);
    el.addEventListener('blur', release);
  });

  const controls = document.querySelector('.lab-controls');
  if (controls && network && status && !document.querySelector('.research-scrubber')) {
    const scrubber = document.createElement('div');
    scrubber.className = 'research-scrubber';
    scrubber.innerHTML = `
      <div class="research-scrubber-top"><span>Drag model state</span><strong>Direct manipulation</strong></div>
      <div class="research-track" role="slider" tabindex="0" aria-label="Model state" aria-valuemin="0" aria-valuemax="2" aria-valuenow="0" aria-valuetext="Trained">
        <div class="research-track-line"></div>
        <div class="research-track-fill"></div>
        <div class="research-track-knob"></div>
      </div>
      <div class="research-stops"><span>Trained</span><span>Unlearned</span><span>INT4 recovery</span></div>
    `;
    controls.insertAdjacentElement('afterend', scrubber);

    const track = scrubber.querySelector('.research-track');
    const fill = scrubber.querySelector('.research-track-fill');
    const knob = scrubber.querySelector('.research-track-knob');
    const targetVisuals = [...network.querySelectorAll('.target')];
    let value = 0;
    let dragging = false;
    let springFrame = 0;
    let history = [];

    const clamp01 = n => Math.max(0, Math.min(1, n));
    const stateName = p => p < .25 ? 'Trained' : p < .75 ? 'Unlearned' : 'INT4 recovery';

    function targetOpacityAt(p){
      if (p <= .5) return 1 + (.08 - 1) * (p / .5);
      return .08 + (.68 - .08) * ((p - .5) / .5);
    }

    function renderValue(p, continuous = false){
      value = clamp01(p);
      fill.style.width = `${value * 100}%`;
      knob.style.left = `${value * 100}%`;
      const opacity = targetOpacityAt(value);
      targetVisuals.forEach(el => { el.style.opacity = String(opacity); });
      network.classList.toggle('is-scrubbing', continuous);
      buttons.forEach(b => b.classList.remove('active'));
      const nearest = value < .25 ? 0 : value < .75 ? 1 : 2;
      if (buttons[nearest]) buttons[nearest].classList.add('active');
      const label = stateName(value);
      track.setAttribute('aria-valuenow', String(nearest));
      track.setAttribute('aria-valuetext', label);
      if (value < .25) status.textContent = 'Target knowledge present';
      else if (value < .75) status.textContent = 'Target signal progressively suppressed';
      else status.textContent = 'Residual target signal re-emerges';
    }

    function springTo(target, initialVelocity = 0){
      cancelAnimationFrame(springFrame);
      if (reduceMotion) { renderValue(target, false); return; }
      let x = value;
      let v = initialVelocity;
      let last = performance.now();
      const stiffness = 190;
      const damping = 28;
      const mass = 1;
      const step = now => {
        const dt = Math.min((now - last) / 1000, .032);
        last = now;
        const force = -stiffness * (x - target) - damping * v;
        v += (force / mass) * dt;
        x += v * dt;
        renderValue(x, true);
        if (Math.abs(v) < .006 && Math.abs(target - x) < .0015) {
          renderValue(target, false);
          return;
        }
        springFrame = requestAnimationFrame(step);
      };
      springFrame = requestAnimationFrame(step);
    }

    function pointerToValue(e){
      const r = track.getBoundingClientRect();
      return clamp01((e.clientX - r.left) / r.width);
    }

    track.addEventListener('pointerdown', e => {
      cancelAnimationFrame(springFrame);
      dragging = true;
      history = [{x:e.clientX,t:performance.now()}];
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
      renderValue(pointerToValue(e), true);
    });

    track.addEventListener('pointermove', e => {
      if (!dragging) return;
      const now = performance.now();
      history.push({x:e.clientX,t:now});
      if (history.length > 5) history.shift();
      renderValue(pointerToValue(e), true);
    });

    const finishDrag = e => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      const r = track.getBoundingClientRect();
      let pxVelocity = 0;
      if (history.length >= 2) {
        const a = history[0], b = history[history.length - 1];
        const dt = Math.max(1, b.t - a.t);
        pxVelocity = (b.x - a.x) / dt * 1000;
      }
      const normalizedVelocity = pxVelocity / Math.max(1, r.width);
      const projected = clamp01(value + normalizedVelocity * .18);
      const stops = [0,.5,1];
      const target = stops.reduce((best,s) => Math.abs(s-projected) < Math.abs(best-projected) ? s : best, stops[0]);
      springTo(target, normalizedVelocity);
      try { track.releasePointerCapture(e.pointerId); } catch {}
    };
    track.addEventListener('pointerup', finishDrag);
    track.addEventListener('pointercancel', finishDrag);

    track.addEventListener('keydown', e => {
      const stops = [0,.5,1];
      let idx = stops.reduce((best,i,ix) => Math.abs(i-value) < Math.abs(stops[best]-value) ? ix : best,0);
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { idx = Math.min(2, idx + 1); e.preventDefault(); springTo(stops[idx]); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { idx = Math.max(0, idx - 1); e.preventDefault(); springTo(stops[idx]); }
      if (e.key === 'Home') { e.preventDefault(); springTo(0); }
      if (e.key === 'End') { e.preventDefault(); springTo(1); }
    });

    buttons.forEach((b,index) => b.addEventListener('click', () => springTo([0,.5,1][index])));
    renderValue(0,false);
  }

  const deck = document.querySelector('.studio-weeks');
  if (deck) {
    let active = false;
    let startX = 0;
    let startScroll = 0;
    let samples = [];
    let momentumFrame = 0;

    const stopMomentum = () => cancelAnimationFrame(momentumFrame);

    deck.addEventListener('pointerdown', e => {
      if (window.innerWidth > 760) return;
      stopMomentum();
      active = true;
      startX = e.clientX;
      startScroll = deck.scrollLeft;
      samples = [{x:e.clientX,t:performance.now()}];
      deck.classList.add('is-dragging');
      deck.setPointerCapture(e.pointerId);
    });

    deck.addEventListener('pointermove', e => {
      if (!active || window.innerWidth > 760) return;
      const dx = e.clientX - startX;
      deck.scrollLeft = startScroll - dx;
      const now = performance.now();
      samples.push({x:e.clientX,t:now});
      if (samples.length > 5) samples.shift();
    });

    const endDeckDrag = e => {
      if (!active) return;
      active = false;
      deck.classList.remove('is-dragging');
      let velocity = 0;
      if (samples.length >= 2) {
        const a = samples[0], b = samples[samples.length-1];
        velocity = -(b.x-a.x) / Math.max(1,b.t-a.t) * 16;
      }
      if (!reduceMotion && Math.abs(velocity) > .35) {
        let v = velocity;
        const animate = () => {
          deck.scrollLeft += v;
          v *= .93;
          if (Math.abs(v) > .25) momentumFrame = requestAnimationFrame(animate);
        };
        momentumFrame = requestAnimationFrame(animate);
      }
      try { deck.releasePointerCapture(e.pointerId); } catch {}
    };
    deck.addEventListener('pointerup', endDeckDrag);
    deck.addEventListener('pointercancel', endDeckDrag);
  }
})();

// Load the Beautiful UI inspired research/product layer last so it can enhance
// the existing portfolio without changing the underlying content structure.
const beautifulUiScript = document.createElement('script');
beautifulUiScript.src = 'beautiful-ui.js';
beautifulUiScript.defer = true;
document.body.appendChild(beautifulUiScript);
