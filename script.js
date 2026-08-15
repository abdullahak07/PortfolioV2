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

// Conceptual neural network: fixed coordinates, target nodes change by state.
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

// Live scholarly telemetry via our Vercel proxy to the Semantic Scholar Academic Graph.
// The site remains fully usable if the external service is unavailable or rate-limited.
const scholarNumber = new Intl.NumberFormat('en-AU');

function normaliseScholarText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function titleSimilarity(a, b) {
  const aa = new Set(normaliseScholarText(a).split(' ').filter(word => word.length > 2));
  const bb = new Set(normaliseScholarText(b).split(' ').filter(word => word.length > 2));
  if (!aa.size || !bb.size) return 0;
  let common = 0;
  aa.forEach(word => { if (bb.has(word)) common += 1; });
  return common / Math.max(aa.size, bb.size);
}

function addLiveCitationBadges(papers = []) {
  if (!papers.length) return;

  document.querySelectorAll('.pub').forEach(card => {
    const heading = card.querySelector('h3');
    const meta = card.querySelector('.pub-meta');
    if (!heading || !meta || meta.querySelector('.live-citation')) return;

    const match = papers
      .map(paper => ({ paper, score: titleSimilarity(heading.textContent, paper.title) }))
      .sort((a, b) => b.score - a.score)[0];

    if (!match || match.score < .62) return;
    const count = Number(match.paper.citationCount || 0);
    const badge = document.createElement('span');
    badge.className = 'live-citation';
    badge.textContent = `${scholarNumber.format(count)} citation${count === 1 ? '' : 's'}`;
    badge.title = 'Live citation count from Semantic Scholar';
    meta.appendChild(badge);
  });
}

function renderScholarPanel(data) {
  const section = document.querySelector('.publications-section');
  const head = section?.querySelector('.section-head');
  if (!section || !head || !data?.available) return;

  const existing = document.getElementById('scholarLive');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'scholarLive';
  panel.className = 'scholar-live';
  panel.setAttribute('aria-label', 'Live scholarly metrics from Semantic Scholar');

  let metrics;
  let sourceLink = 'https://www.semanticscholar.org/';

  if (data.mode === 'author' && data.author) {
    const author = data.author;
    sourceLink = author.url || sourceLink;
    metrics = [
      ['Citations', scholarNumber.format(Number(author.citationCount || 0))],
      ['h-index', scholarNumber.format(Number(author.hIndex || 0))],
      ['Indexed papers', scholarNumber.format(Number(author.paperCount || 0))],
    ];
  } else {
    const summary = data.summary || {};
    metrics = [
      ['Tracked citations', scholarNumber.format(Number(summary.citationCount || 0))],
      ['Tracked works', scholarNumber.format(Number(summary.trackedPapers || data.papers?.length || 0))],
      ['Influential cites', scholarNumber.format(Number(summary.influentialCitationCount || 0))],
    ];
  }

  panel.innerHTML = `
    <div class="scholar-live-label">
      <span class="scholar-pulse" aria-hidden="true"></span>
      <div><strong>Live research signal</strong><small>Semantic Scholar Academic Graph · cached for performance</small></div>
    </div>
    ${metrics.map(([label, value]) => `<div class="scholar-stat"><strong>${value}</strong><span>${label}</span></div>`).join('')}
    <a class="scholar-source" href="${sourceLink}" target="_blank" rel="noopener">View source ↗</a>
  `;

  head.insertAdjacentElement('afterend', panel);
  addLiveCitationBadges(data.papers || []);
}

async function loadScholarMetrics() {
  const section = document.querySelector('.publications-section');
  if (!section) return;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch('/api/research-metrics', {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return;
    const data = await response.json();
    if (data?.available) renderScholarPanel(data);
  } catch (error) {
    console.info('Live scholarly metrics unavailable; static portfolio retained.', error?.message || error);
  } finally {
    window.clearTimeout(timer);
  }
}

loadScholarMetrics();
