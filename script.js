const menuButton = document.querySelector('.mobile-menu');
const rail = document.querySelector('.rail');
if (menuButton && rail) {
  menuButton.addEventListener('click', () => rail.classList.toggle('open'));
  rail.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => rail.classList.remove('open')));
}

const navLinks = [...document.querySelectorAll('.rail nav a[href^="#"]')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

const modelButtons = [...document.querySelectorAll('[data-model]')];
const modelStatus = document.getElementById('modelStatus');
const modelStates = {
  trained: 'Target knowledge present',
  forgotten: 'Target signal suppressed after unlearning',
  recovered: 'Residual signal can re-emerge after INT4 quantisation',
};
modelButtons.forEach(button => {
  button.addEventListener('click', () => {
    modelButtons.forEach(item => item.classList.toggle('active', item === button));
    if (modelStatus) modelStatus.textContent = modelStates[button.dataset.model] || '';
  });
});

const categoryNames = {
  'cs.LG': 'Machine Learning',
  'cs.AI': 'Artificial Intelligence',
  'cs.CV': 'Computer Vision',
  'cs.CL': 'Language',
  'cs.CR': 'Security',
  'stat.ML': 'Machine Learning',
};

function esc(value = '') {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function fmtDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return new Intl.DateTimeFormat('en-AU', { month: 'short', year: 'numeric' }).format(date);
}

function renderResearchFeed(data) {
  const target = document.getElementById('researchNow');
  const papers = Array.isArray(data?.papers) ? data.papers.slice(0, 4) : [];
  if (!target || !data?.available || !papers.length) return;
  target.className = 'research-now';
  target.innerHTML = `
    <div class="research-now-intro">
      <span style="color:var(--gold)">●</span>
      <h3>LIVE FROM arXiv</h3>
      <p>Current preprints and revisions · no citation counters</p>
    </div>
    <div class="research-now-list">
      ${papers.map(paper => {
        const cats = (paper.categories || []).slice(0,2).map(code => categoryNames[code] || code).join(' · ');
        return `<article class="research-now-paper"><span>${fmtDate(paper.updated || paper.published)} · ${esc(cats)}</span><h4>${esc(paper.title)}</h4><a href="${esc(paper.url)}" target="_blank" rel="noopener">Read on arXiv ↗</a></article>`;
      }).join('')}
    </div>`;
}

(async function loadResearchFeed(){
  const target = document.getElementById('researchNow');
  if (!target) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch('/api/research-feed', { signal: controller.signal, headers: { accept: 'application/json' } });
    if (!response.ok) return;
    renderResearchFeed(await response.json());
  } catch (_) {
    // Static publication content remains fully usable.
  } finally {
    clearTimeout(timer);
  }
})();
