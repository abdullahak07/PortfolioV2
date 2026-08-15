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
