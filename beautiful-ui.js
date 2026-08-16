(() => {
  const root = document.documentElement;
  const THEME_KEY = 'aak-portfolio-theme';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const styles = document.createElement('style');
  styles.id = 'beautiful-ui-layer';
  styles.textContent = `
  /* Beautiful UI inspired layer — purposeful research UI, not SaaS chrome. */
  .nav-tools{display:flex;align-items:center;gap:7px;margin-left:2px}
  .theme-switch,.command-trigger{height:36px;border:1px solid var(--hairline,var(--line));background:rgba(255,255,255,.028);color:var(--text);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;transition:transform .18s ease,background .18s ease,border-color .18s ease;color .18s ease;-webkit-tap-highlight-color:transparent}
  .theme-switch{width:36px;padding:0}.command-trigger{padding:0 10px;font-size:10px;color:var(--muted)}
  .theme-switch:hover,.command-trigger:hover{background:rgba(255,255,255,.06);border-color:rgba(217,255,99,.20)}
  .theme-switch:active,.command-trigger:active{transform:scale(.96)}
  .theme-switch svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .command-trigger kbd{font:inherit;border:1px solid var(--hairline,var(--line));border-radius:6px;padding:2px 5px;color:var(--muted);background:rgba(255,255,255,.025)}

  .insight-shell{margin:0 0 70px}
  .insight-shell-head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:18px}
  .insight-shell-head h3{margin:8px 0 0;font-size:clamp(27px,3vw,42px);letter-spacing:-.045em;line-height:1}.insight-shell-head p{max-width:440px;margin:0;color:var(--muted);font-size:12px;line-height:1.55}
  .insight-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .insight-card{--mx:50%;--my:50%;position:relative;min-height:255px;padding:25px;border:1px solid var(--hairline,var(--line));border-radius:20px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012));overflow:hidden;isolation:isolate;transition:transform .3s cubic-bezier(.2,.75,.2,1),border-color .24s ease,box-shadow .3s ease}
  .insight-card:before{content:"";position:absolute;inset:0;z-index:-1;opacity:0;background:radial-gradient(360px circle at var(--mx) var(--my),rgba(217,255,99,.10),transparent 44%);transition:opacity .2s ease}.insight-card:hover:before{opacity:1}.insight-card:hover{transform:translateY(-4px);border-color:rgba(217,255,99,.20);box-shadow:0 24px 70px rgba(0,0,0,.18)}
  .insight-top{display:flex;justify-content:space-between;align-items:center;gap:12px}.insight-index,.insight-type{font-size:9px;text-transform:uppercase;letter-spacing:.11em;color:var(--muted)}.insight-type{padding:5px 7px;border:1px solid var(--hairline,var(--line));border-radius:999px}
  .insight-card h4{max-width:660px;margin:32px 0 16px;font-size:clamp(24px,2.7vw,38px);line-height:1.04;letter-spacing:-.045em;font-weight:630}.insight-card p{max-width:620px;margin:0;color:var(--muted);font-size:13px;line-height:1.6}.insight-mini{display:flex;align-items:center;gap:8px;margin-top:28px}.insight-mini span{padding:6px 8px;border:1px solid var(--hairline,var(--line));border-radius:8px;font-size:9px;color:var(--muted);background:rgba(255,255,255,.025)}.insight-mini b{color:var(--accent);font-weight:500;font-size:10px}.insight-card[data-kind="recovery"] .insight-mini span:last-child{border-color:rgba(217,255,99,.28);color:var(--accent)}

  .journey{margin-top:72px;border-top:1px solid var(--hairline,var(--line));padding-top:34px}.journey-head{display:grid;grid-template-columns:.7fr 1.3fr;gap:32px;margin-bottom:18px}.journey-head h3{margin:8px 0 0;font-size:clamp(28px,3.2vw,46px);letter-spacing:-.045em;line-height:1}.journey-head p{margin:4px 0 0;color:var(--muted);font-size:13px;max-width:570px;line-height:1.65}.journey-list{border-top:1px solid var(--hairline,var(--line))}.journey-row{display:grid;grid-template-columns:58px minmax(0,1.3fr) minmax(180px,.7fr) auto;gap:18px;align-items:center;padding:19px 0;border-bottom:1px solid var(--hairline,var(--line));transition:padding .2s ease,background .2s ease}.journey-row:hover{padding-left:12px;padding-right:12px;background:rgba(255,255,255,.025)}.journey-num{color:var(--accent);font-size:10px}.journey-row strong{font-size:15px;letter-spacing:-.02em}.journey-row small{display:block;margin-top:4px;color:var(--muted);font-size:10px}.journey-work{color:var(--muted);font-size:11px}.journey-state{padding:5px 7px;border:1px solid var(--hairline,var(--line));border-radius:999px;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.09em;white-space:nowrap}

  .tech-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:18px;position:relative;z-index:2}.tech-chip{padding:5px 8px;border:1px solid var(--hairline,var(--line));border-radius:999px;background:rgba(255,255,255,.025);color:var(--muted);font-size:9px;line-height:1}

  .pub-detail-toggle{margin-left:8px;border:0;background:transparent;color:var(--muted);font:inherit;font-size:12px;font-weight:700;cursor:pointer;padding:7px 0}.pub-detail-toggle:hover{color:var(--accent)}
  .pub-detail{grid-column:2/-1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;max-height:0;opacity:0;overflow:hidden;background:var(--hairline,var(--line));border-radius:13px;transition:max-height .36s cubic-bezier(.2,.75,.2,1),opacity .22s ease,margin .28s ease;margin-top:0}.pub.is-expanded .pub-detail{max-height:280px;opacity:1;margin-top:18px}.pub-detail>div{background:var(--panel);padding:16px}.pub-detail span{display:block;margin-bottom:8px;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.1em}.pub-detail strong{display:block;font-size:12px;line-height:1.45;font-weight:560}

  .spotlight-surface{--mx:50%;--my:50%;position:relative}.spotlight-surface:after{content:"";pointer-events:none;position:absolute;inset:0;border-radius:inherit;opacity:0;background:radial-gradient(320px circle at var(--mx) var(--my),rgba(217,255,99,.065),transparent 45%);transition:opacity .18s ease}.spotlight-surface:hover:after{opacity:1}

  .command-backdrop{position:fixed;inset:0;z-index:1500;background:rgba(0,0,0,.48);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:grid;place-items:start center;padding:clamp(72px,12vh,130px) 18px 20px;opacity:0;visibility:hidden;transition:opacity .18s ease,visibility .18s ease}.command-backdrop.open{opacity:1;visibility:visible}
  .command-panel{width:min(680px,100%);border:1px solid var(--hairline,var(--line));border-radius:20px;background:rgba(15,15,13,.95);box-shadow:0 36px 120px rgba(0,0,0,.42);overflow:hidden;transform:translateY(-8px) scale(.985);transition:transform .22s cubic-bezier(.2,.75,.2,1)}.command-backdrop.open .command-panel{transform:none}.command-input-wrap{display:flex;align-items:center;gap:12px;padding:18px;border-bottom:1px solid var(--hairline,var(--line))}.command-input-wrap svg{width:18px;height:18px;stroke:var(--muted);fill:none;stroke-width:1.8}.command-input{width:100%;border:0;outline:0;background:transparent;color:var(--text);font:inherit;font-size:16px}.command-input::placeholder{color:var(--muted)}.command-esc{font-size:9px;color:var(--muted);border:1px solid var(--hairline,var(--line));border-radius:6px;padding:4px 6px}.command-results{max-height:min(58vh,480px);overflow:auto;padding:8px}.command-result{display:grid;grid-template-columns:86px 1fr auto;gap:12px;align-items:center;padding:12px;border-radius:12px;color:inherit}.command-result:hover,.command-result.active{background:rgba(255,255,255,.055)}.command-result-type{color:var(--accent);font-size:8px;text-transform:uppercase;letter-spacing:.1em}.command-result strong{font-size:13px}.command-result small{display:block;color:var(--muted);font-size:10px;margin-top:3px}.command-result>span:last-child{color:var(--muted);font-size:12px}.command-empty{padding:30px;text-align:center;color:var(--muted);font-size:12px}.command-hint{display:flex;justify-content:space-between;gap:20px;padding:10px 14px;border-top:1px solid var(--hairline,var(--line));color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.08em}

  /* Manual theme overrides loaded last, so user choice can beat system media. */
  html[data-theme="light"]{--bg:#f4f4ef;--panel:#fff;--panel2:#f0f0ea;--text:#171815;--muted:#676961;--line:#d8d9d1;--accent:#536b18;--accent2:#2f6f52;--glass:rgba(250,250,246,.82);--hairline:rgba(25,29,20,.11);--soft-shadow:0 22px 70px rgba(35,41,28,.10);--deep-shadow:0 30px 90px rgba(35,41,28,.14);color-scheme:light}
  html[data-theme="light"] body{background:radial-gradient(circle at 78% 7%,rgba(83,107,24,.07),transparent 24%),radial-gradient(circle at 18% 26%,rgba(20,25,17,.025),transparent 28%),var(--bg)!important;color:var(--text)}
  html[data-theme="light"] .site-header{background:var(--glass)!important;border-color:rgba(25,29,20,.10)!important;box-shadow:0 12px 38px rgba(35,41,28,.08),inset 0 1px rgba(255,255,255,.85)!important}
  html[data-theme="light"] .nav a{color:#62665d!important}html[data-theme="light"] .nav a:hover{background:rgba(25,29,20,.055);color:#171815!important}html[data-theme="light"] .hero-copy{color:#555950!important}html[data-theme="light"] .hero-copy strong{color:#171815!important}
  html[data-theme="light"] .hero-panel,html[data-theme="light"] .arc-card,html[data-theme="light"] .institution-card,html[data-theme="light"] .project-card{background:linear-gradient(155deg,rgba(255,255,255,.96),rgba(242,243,236,.92))!important;border-color:rgba(25,29,20,.10)!important;color:#171815;box-shadow:0 14px 38px rgba(35,41,28,.07),inset 0 1px #fff}
  html[data-theme="light"] .interactive-lab{background:radial-gradient(circle at 78% 46%,rgba(83,107,24,.08),transparent 28%),linear-gradient(150deg,#fff,#eef0e8)!important;border-color:rgba(25,29,20,.11)!important;color:#171815}
  html[data-theme="light"] .publications-section,html[data-theme="light"] .projects-section{background:#f0f1eb!important}html[data-theme="light"] .section-head p,html[data-theme="light"] .arc-card p,html[data-theme="light"] .pub p,html[data-theme="light"] .project-card p,html[data-theme="light"] .about-copy p{color:#62675e!important}
  html[data-theme="light"] .pub:hover{background:linear-gradient(120deg,rgba(255,255,255,.85),rgba(83,107,24,.04))!important}html[data-theme="light"] .pub-detail>div{background:#fff}html[data-theme="light"] .pub-links a,html[data-theme="light"] .profile-links a,html[data-theme="light"] .week-actions a,html[data-theme="light"] .tech-chip{background:rgba(25,29,20,.045);color:#4e534a}html[data-theme="light"] .pub-meta,html[data-theme="light"] .pub-index{color:#74786f}
  html[data-theme="light"] .button.primary{background:#536b18!important;border-color:#536b18!important;color:#fff!important}html[data-theme="light"] .button.ghost{background:rgba(255,255,255,.7)!important;color:#2c3029!important}html[data-theme="light"] .lab-btn{color:#454a42!important}html[data-theme="light"] .lab-btn.active{background:#536b18!important;color:#fff!important}
  html[data-theme="light"] .insight-card{background:linear-gradient(145deg,rgba(255,255,255,.95),rgba(241,243,235,.94));box-shadow:0 14px 38px rgba(35,41,28,.055)}html[data-theme="light"] .insight-card:before,html[data-theme="light"] .spotlight-surface:after{background:radial-gradient(360px circle at var(--mx) var(--my),rgba(83,107,24,.09),transparent 44%)}
  html[data-theme="light"] .command-backdrop{background:rgba(54,58,49,.26)}html[data-theme="light"] .command-panel{background:rgba(250,250,246,.97);box-shadow:0 36px 120px rgba(35,41,28,.20)}html[data-theme="light"] .command-result:hover,html[data-theme="light"] .command-result.active{background:rgba(25,29,20,.055)}
  html[data-theme="light"] .theme-switch,html[data-theme="light"] .command-trigger{background:rgba(255,255,255,.62);color:#3d4239}html[data-theme="light"] .theme-switch:hover,html[data-theme="light"] .command-trigger:hover{background:#fff}
  html[data-theme="light"] .network .node{fill:#34382f}html[data-theme="light"] .network .edge{stroke:#b7bab1}html[data-theme="light"] .network .edge.target,html[data-theme="light"] .network .node.target{stroke:#536b18;fill:#536b18}

  html[data-theme="dark"]{--bg:#0a0a09;--panel:#11110f;--panel2:#151512;--text:#f3f1ea;--muted:#a6a49b;--line:#2b2b27;--accent:#d9ff63;--accent2:#a4ffce;--glass:rgba(18,18,16,.68);--hairline:rgba(255,255,255,.075);--soft-shadow:0 26px 80px rgba(0,0,0,.28);--deep-shadow:0 34px 110px rgba(0,0,0,.38);color-scheme:dark}
  html[data-theme="dark"] body{background:radial-gradient(circle at 78% 7%,rgba(217,255,99,.045),transparent 24%),radial-gradient(circle at 18% 26%,rgba(255,255,255,.018),transparent 28%),#0a0a09!important;color:#f3f1ea}
  html[data-theme="dark"] .site-header{background:rgba(18,18,16,.68)!important}html[data-theme="dark"] .nav a{color:#a8a79f!important}html[data-theme="dark"] .hero-copy{color:#b8b6ae!important}html[data-theme="dark"] .hero-panel{background:linear-gradient(160deg,rgba(28,28,24,.72),rgba(12,12,10,.76))!important}
  html[data-theme="dark"] .arc-card{background:linear-gradient(155deg,rgba(25,25,21,.74),rgba(12,12,10,.9))!important}html[data-theme="dark"] .interactive-lab{background:radial-gradient(circle at 78% 46%,rgba(217,255,99,.05),transparent 28%),linear-gradient(150deg,rgba(24,24,20,.86),rgba(10,10,9,.95))!important}html[data-theme="dark"] .institution-card,html[data-theme="dark"] .project-card{background:linear-gradient(155deg,rgba(23,23,20,.72),rgba(12,12,10,.9))!important}html[data-theme="dark"] .publications-section,html[data-theme="dark"] .projects-section{background:#0c0c0a!important}

  @media(max-width:900px){.insight-grid{grid-template-columns:1fr}.journey-head{grid-template-columns:1fr}.journey-row{grid-template-columns:48px 1fr auto}.journey-work{grid-column:2}.command-trigger span{display:none}.command-trigger{width:36px;padding:0}.command-trigger kbd{display:none}}
  @media(max-width:760px){.nav-tools{width:100%;justify-content:flex-start;padding:8px 12px;border-top:1px solid var(--hairline,var(--line));margin-top:4px}.insight-shell{margin-bottom:52px}.insight-shell-head{align-items:start;flex-direction:column}.insight-card{min-height:220px}.pub-detail{grid-column:1/-1;grid-template-columns:1fr}.pub.is-expanded .pub-detail{max-height:520px}.journey-row{grid-template-columns:42px 1fr auto}.journey-state{grid-column:3;grid-row:1/3}.command-panel{border-radius:16px}.command-result{grid-template-columns:64px 1fr auto}}
  @media(prefers-reduced-motion:reduce){.insight-card,.journey-row,.command-panel,.theme-switch,.command-trigger{transition:none!important;transform:none!important}}
  `;
  document.head.appendChild(styles);

  const icons = {
    sun: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7Z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`
  };

  function preferredTheme(){
    return localStorage.getItem(THEME_KEY) || (systemDark.matches ? 'dark' : 'light');
  }
  function applyTheme(theme, persist = false){
    root.dataset.theme = theme;
    if (persist) localStorage.setItem(THEME_KEY, theme);
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0a0a09' : '#f4f4ef';
    const button = document.querySelector('.theme-switch');
    if (button) {
      const next = theme === 'dark' ? 'light' : 'dark';
      button.innerHTML = theme === 'dark' ? icons.sun : icons.moon;
      button.setAttribute('aria-label', `Switch to ${next} theme`);
      button.title = `Switch to ${next} theme`;
    }
  }
  applyTheme(preferredTheme());
  systemDark.addEventListener?.('change', () => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(systemDark.matches ? 'dark' : 'light');
  });

  const nav = document.querySelector('.nav');
  const cv = nav?.querySelector('.nav-cta');
  if (nav && cv && !document.querySelector('.nav-tools')) {
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    tools.innerHTML = `<button class="command-trigger" type="button" aria-label="Search portfolio">${icons.search}<span>Search</span><kbd>⌘K</kbd></button><button class="theme-switch" type="button"></button>`;
    nav.insertBefore(tools, cv);
    tools.querySelector('.theme-switch').addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
    applyTheme(root.dataset.theme);
  }

  const research = document.querySelector('#research');
  const researchArc = research?.querySelector('.research-arc');
  if (research && researchArc && !document.querySelector('.insight-shell')) {
    const insight = document.createElement('section');
    insight.className = 'insight-shell reveal visible';
    insight.innerHTML = `
      <div class="insight-shell-head"><div><span class="eyebrow">Research signals</span><h3>What the work is actually showing.</h3></div><p>Compact findings designed to communicate the research question before a visitor opens the paper.</p></div>
      <div class="insight-grid">
        <article class="insight-card" data-kind="curvature"><div class="insight-top"><span class="insight-index">01 · HGU</span><span class="insight-type">Selective forgetting</span></div><h4>Fast forgetting can be refined with curvature-aware updates.</h4><p>Hessian-guided refinement is used after gradient-based forgetting to make targeted removal more principled without full retraining.</p><div class="insight-mini"><span>Gradient</span><b>→</b><span>Curvature</span><b>→</b><span>Refine</span></div></article>
        <article class="insight-card" data-kind="recovery"><div class="insight-top"><span class="insight-index">02 · DurableUn</span><span class="insight-type">Deployment robustness</span></div><h4>Forgotten information can return after low-bit quantisation.</h4><p>Evaluation at one numerical precision is not necessarily the end of the story; deployment transformation can expose residual knowledge.</p><div class="insight-mini"><span>BF16</span><b>→</b><span>Unlearn</span><b>→</b><span>INT4 recovery</span></div></article>
        <article class="insight-card" data-kind="metrics"><div class="insight-top"><span class="insight-index">03 · Metric reliability</span><span class="insight-type">Evaluation</span></div><h4>One forgetting score can disagree with privacy and representation evidence.</h4><p>The metric-reliability work treats unlearning evaluation as a multi-signal problem rather than trusting a single headline number.</p><div class="insight-mini"><span>Forgetting</span><b>≠</b><span>Privacy</span><b>≠</b><span>Representation</span></div></article>
        <article class="insight-card" data-kind="multimodal"><div class="insight-top"><span class="insight-index">04 · Multimodal audit</span><span class="insight-type">Vision-language</span></div><h4>Output-level forgetting does not automatically imply internal erasure.</h4><p>Multimodal unlearning is audited across what the model says and what remains encoded in its representations.</p><div class="insight-mini"><span>Output</span><b>+</b><span>Representation</span><b>→</b><span>Audit</span></div></article>
      </div>`;
    researchArc.insertAdjacentElement('beforebegin', insight);
  }

  const lab = document.querySelector('.interactive-lab');
  if (lab && !document.querySelector('.journey')) {
    const journey = document.createElement('section');
    journey.className = 'journey reveal visible';
    journey.innerHTML = `
      <div class="journey-head"><div><span class="eyebrow">Research journey</span><h3>One programme, five questions.</h3></div><p>The projects connect as a research programme: remove information, extend forgetting across modalities, evaluate it correctly, attack its durability, then audit what still remains internally.</p></div>
      <div class="journey-list">
        <div class="journey-row"><span class="journey-num">01</span><div><strong>Targeted unlearning</strong><small>How should selected information be removed efficiently?</small></div><span class="journey-work">Hessian-Guided Unlearning</span><span class="journey-state">Accepted</span></div>
        <div class="journey-row"><span class="journey-num">02</span><div><strong>Multimodal forgetting</strong><small>What changes when information crosses image and text pathways?</small></div><span class="journey-work">Boundary · MU-ALIGN</span><span class="journey-state">Research</span></div>
        <div class="journey-row"><span class="journey-num">03</span><div><strong>Evaluation reliability</strong><small>Do forgetting metrics actually agree?</small></div><span class="journey-work">Metric Unreliability · UQS</span><span class="journey-state">Preprint</span></div>
        <div class="journey-row"><span class="journey-num">04</span><div><strong>Durability attacks</strong><small>Can deployment transformations revive forgotten knowledge?</small></div><span class="journey-work">DurableUn</span><span class="journey-state">Preprint</span></div>
        <div class="journey-row"><span class="journey-num">05</span><div><strong>Representation auditing</strong><small>What survives internally after outputs appear forgotten?</small></div><span class="journey-work">Two-Dimensional Audit</span><span class="journey-state">Current</span></div>
      </div>`;
    lab.insertAdjacentElement('afterend', journey);
  }

  const pubDetails = [
    {area:'Machine unlearning', contribution:'Curvature-aware refinement after gradient-based selective forgetting.', resource:'Code repository'},
    {area:'Multimodal unlearning', contribution:'Boundary deformation with projected-gradient and representation controls.', resource:'Code repository'},
    {area:'Robustness / attacks', contribution:'Tests whether deployment quantisation can recover information judged forgotten.', resource:'arXiv preprint'},
    {area:'Evaluation reliability', contribution:'Studies disagreement across forgetting, utility, privacy and representation metrics.', resource:'arXiv preprint'},
    {area:'Vision-language models', contribution:'Tail suppression, representation alignment and distillation for multimodal unlearning.', resource:'Code repository'},
    {area:'Representation auditing', contribution:'Audits output behaviour and internal representation retention together.', resource:'Active research'},
    {area:'Computer vision', contribution:'Deep neural network pipeline for face-mask detection and person identification.', resource:'Springer'},
    {area:'Natural language processing', contribution:'Transfer-learning approach for Islamophobic tweet detection.', resource:'IEEE Xplore'}
  ];
  document.querySelectorAll('.pub').forEach((pub, index) => {
    const main = pub.querySelector('.pub-main');
    const links = main?.querySelector('.pub-links');
    if (!main || main.querySelector('.pub-detail-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'pub-detail-toggle'; button.textContent = 'Details +'; button.setAttribute('aria-expanded','false');
    (links || main).appendChild(button);
    const info = pubDetails[index] || pubDetails[0];
    const detail = document.createElement('div'); detail.className = 'pub-detail';
    detail.innerHTML = `<div><span>Research area</span><strong>${info.area}</strong></div><div><span>Contribution</span><strong>${info.contribution}</strong></div><div><span>Best route</span><strong>${info.resource}</strong></div>`;
    pub.appendChild(detail);
    button.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); const open = pub.classList.toggle('is-expanded'); button.textContent = open ? 'Details −' : 'Details +'; button.setAttribute('aria-expanded', String(open)); });
  });

  const projectStacks = [
    ['Web App','Supabase','Vercel'],['PyTorch','VLM','Distillation'],['PyTorch','Hessian','Reproducibility'],['Bioinformatics','AMR','Genome screening'],['Local LLM','Ollama','PDF workflow'],['Deep Learning','Computer Vision','Detection']
  ];
  document.querySelectorAll('.project-card').forEach((card,index) => {
    if (card.querySelector('.tech-chips')) return;
    const chips = document.createElement('div'); chips.className = 'tech-chips'; chips.innerHTML = (projectStacks[index] || []).map(x=>`<span class="tech-chip">${x}</span>`).join('');
    const arrow = card.querySelector('.project-arrow'); card.insertBefore(chips, arrow || null);
  });
  const weekStacks = [['Interactive learning','CTI foundations'],['Threat intelligence','Applied security'],['Kali Linux','Security frameworks'],['Cryptography','Network security']];
  document.querySelectorAll('.studio-week').forEach((week,index) => {
    const copy = week.querySelector('.week-copy'); if (!copy || copy.querySelector('.tech-chips')) return;
    const chips = document.createElement('div'); chips.className = 'tech-chips'; chips.innerHTML = (weekStacks[index] || []).map(x=>`<span class="tech-chip">${x}</span>`).join(''); copy.appendChild(chips);
  });

  const spotlightTargets = document.querySelectorAll('.insight-card,.pub,.project-card,.studio-week');
  spotlightTargets.forEach(el => {
    el.classList.add('spotlight-surface');
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', `${e.clientX-r.left}px`); el.style.setProperty('--my', `${e.clientY-r.top}px`); }, {passive:true});
  });

  const searchItems = [
    ['Research','Hessian-Guided Gradient Unlearning','Curvature-aware machine unlearning','#publications'],['Research','DurableUn','Quantization-induced recovery attacks','#publications'],['Research','Metric Unreliability','Unified evaluation and metric reliability','#publications'],['Research','MU-ALIGN','Multimodal vision-language unlearning','#publications'],['Research','Two-Dimensional Audit','Output and representation auditing','#publications'],['Teaching','COMP6012 · Cyber Threat Intelligence','Notre Dame teaching','#teaching'],['Teaching','COMP6013 · Network Security & Cryptography','Notre Dame teaching','#teaching'],['Teaching','ICT619 · Artificial Intelligence','Murdoch teaching','#teaching'],['Teaching','ICT206 · Intelligent Systems','Murdoch teaching','#teaching'],['Project','Health App','Live deployed health application','https://health-app-lac-nu.vercel.app/'],['Project','Perth Tradie Quote AI','Local-LLM quote generation','https://github.com/abdullahak07/tradie-invoice'],['Project','1DProb','AMR genome screening pipeline','https://github.com/abdullahak07/1DProb'],['Profile','Curriculum Vitae','Academic and engineering CV','cv.html'],['Profile','Google Scholar','Publication profile','https://scholar.google.com/citations?user=CXdZEF0AAAAJ&hl=en']
  ];
  const backdrop = document.createElement('div'); backdrop.className = 'command-backdrop'; backdrop.setAttribute('aria-hidden','true');
  backdrop.innerHTML = `<div class="command-panel" role="dialog" aria-modal="true" aria-label="Search portfolio"><div class="command-input-wrap">${icons.search}<input class="command-input" type="search" placeholder="Search research, teaching, projects…" autocomplete="off"/><span class="command-esc">ESC</span></div><div class="command-results"></div><div class="command-hint"><span>↑↓ Navigate · Enter Open</span><span>Search Abdullah's work</span></div></div>`;
  document.body.appendChild(backdrop);
  const input = backdrop.querySelector('.command-input'), results = backdrop.querySelector('.command-results');
  let activeIndex = 0, filtered = searchItems;
  function renderResults(){
    if (!filtered.length){results.innerHTML='<div class="command-empty">No matching work found.</div>';return;}
    results.innerHTML = filtered.map((item,i)=>`<a class="command-result${i===activeIndex?' active':''}" href="${item[3]}"><span class="command-result-type">${item[0]}</span><div><strong>${item[1]}</strong><small>${item[2]}</small></div><span>↗</span></a>`).join('');
  }
  function openCommand(){backdrop.classList.add('open');backdrop.setAttribute('aria-hidden','false');activeIndex=0;input.value='';filtered=searchItems;renderResults();requestAnimationFrame(()=>input.focus())}
  function closeCommand(){backdrop.classList.remove('open');backdrop.setAttribute('aria-hidden','true')}
  document.querySelector('.command-trigger')?.addEventListener('click', openCommand);
  input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();filtered=searchItems.filter(x=>x.slice(0,3).join(' ').toLowerCase().includes(q));activeIndex=0;renderResults()});
  input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();activeIndex=Math.min(filtered.length-1,activeIndex+1);renderResults()}if(e.key==='ArrowUp'){e.preventDefault();activeIndex=Math.max(0,activeIndex-1);renderResults()}if(e.key==='Enter'&&filtered[activeIndex]){e.preventDefault();const href=filtered[activeIndex][3];closeCommand();if(href.startsWith('#'))document.querySelector(href)?.scrollIntoView({behavior:reduceMotion?'auto':'smooth'});else window.open(href,href.startsWith('http')?'_blank':'_self')}});
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand()}else if(e.key==='Escape'&&backdrop.classList.contains('open'))closeCommand()});
  backdrop.addEventListener('pointerdown',e=>{if(e.target===backdrop)closeCommand()});
  results.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href');if(href?.startsWith('#')){e.preventDefault();closeCommand();document.querySelector(href)?.scrollIntoView({behavior:reduceMotion?'auto':'smooth'})}});
})();
