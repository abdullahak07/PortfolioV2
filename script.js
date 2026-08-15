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

// Live arXiv metadata: show research momentum, not vanity metrics.
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
