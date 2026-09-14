(() => {
  'use strict';

  const botIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M12 2.5 19 6.6v8.8L12 19.5 5 15.4V6.6L12 2.5Zm0 4.1 3.8 2.2v4.4L12 15.4l-3.8-2.2V8.8L12 6.6Zm0 0v8.8M8.2 8.8l7.6 4.4m0-4.4-7.6 4.4"/></svg>';
  const sendIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="m21 3-8.4 18-2.2-7.4L3 11.4 21 3Zm-10.6 10.6L21 3"/></svg>';
  const mailIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18v12H3zM3 7l9 6 9-6"/></svg>';
  const fileIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16h16V8l-6-6Zm0 0v6h6M8 13h8M8 17h6"/></svg>';
  const downloadIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/></svg>';

  const suggestions = [
    'What does Abdullah research?',
    'Tell me about his PhD',
    'Show me his publications',
    'What does he teach?',
    'What projects has he built?',
    'I’d like to collaborate'
  ];

  const oldPanel = document.querySelector('[data-connect-panel]');
  const divider = document.querySelector('.connect-divider');
  const centerOriginal = divider?.querySelector('[data-connect-open]');
  const floatingOriginal = document.querySelector('.connect-button[data-connect-open]');
  if (!oldPanel || !floatingOriginal) return;

  oldPanel.remove();

  const quickPanel = document.createElement('div');
  quickPanel.className = 'connect-quick-panel';
  quickPanel.setAttribute('aria-hidden', 'true');
  quickPanel.innerHTML = `
    <a class="connect-quick-action" href="/cv">
      <span class="connect-quick-icon">${downloadIcon}</span>
      <span>Download CV</span>
    </a>
    <a class="connect-quick-action" href="mailto:aahmad607@gmail.com?subject=Portfolio%20enquiry">
      <span class="connect-quick-icon">${mailIcon}</span>
      <span>Email</span>
    </a>`;
  divider?.appendChild(quickPanel);

  let centerTrigger = null;
  if (centerOriginal) {
    centerTrigger = centerOriginal.cloneNode(true);
    centerTrigger.removeAttribute('data-connect-open');
    centerTrigger.setAttribute('data-connect-quick-open', '');
    centerTrigger.setAttribute('aria-expanded', 'false');
    centerTrigger.setAttribute('aria-label', 'Connect with Abdullah');
    centerOriginal.replaceWith(centerTrigger);
  }

  const setQuickOpen = open => {
    quickPanel.classList.toggle('open', open);
    quickPanel.setAttribute('aria-hidden', String(!open));
    centerTrigger?.setAttribute('aria-expanded', String(open));
  };

  centerTrigger?.addEventListener('click', event => {
    event.stopPropagation();
    setQuickOpen(!quickPanel.classList.contains('open'));
  });
  quickPanel.addEventListener('click', event => event.stopPropagation());

  const chatTrigger = floatingOriginal.cloneNode(false);
  chatTrigger.removeAttribute('data-connect-open');
  chatTrigger.setAttribute('data-ask-open', '');
  chatTrigger.setAttribute('aria-label', 'Open Ask Abdullah assistant');
  chatTrigger.classList.add('ask-launcher-trigger');
  chatTrigger.innerHTML = `<span class="ask-trigger-icon">${botIcon}</span><span class="ask-trigger-label">Ask Abdullah</span>`;
  floatingOriginal.replaceWith(chatTrigger);

  const panel = document.createElement('section');
  panel.className = 'ask-panel';
  panel.setAttribute('data-ask-panel', '');
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('aria-label', 'Ask Abdullah assistant');
  panel.setAttribute('role', 'dialog');
  panel.innerHTML = `
    <header class="ask-header">
      <span class="ask-avatar">${botIcon}</span>
      <div class="ask-heading"><strong>Ask Abdullah</strong><span>Research, teaching & collaboration assistant</span></div>
      <button class="ask-close" type="button" aria-label="Close assistant">×</button>
    </header>
    <div class="ask-scroll">
      <div class="ask-welcome">
        <p>Explore Abdullah’s research, publications, teaching, projects and academic background — or ask about a potential collaboration.</p>
        <div class="ask-suggestions"></div>
      </div>
      <div class="ask-messages" aria-live="polite"></div>
      <div class="ask-status" role="status"><i></i><span>Searching verified profile information…</span></div>
    </div>
    <footer class="ask-footer">
      <form class="ask-form">
        <input class="ask-input" type="text" maxlength="600" autocomplete="off" placeholder="Ask about Abdullah’s work…" aria-label="Ask about Abdullah’s work" />
        <button class="ask-send" type="submit" aria-label="Send question">${sendIcon}</button>
      </form>
      <div class="ask-actions">
        <a href="mailto:aahmad607@gmail.com?subject=Portfolio%20enquiry">${mailIcon}<span>Contact</span></a>
        <a href="/cv">${fileIcon}<span>View CV</span></a>
      </div>
      <p class="ask-note">Answers are grounded in Abdullah’s verified public profile and research information.</p>
    </footer>`;
  document.body.appendChild(panel);

  const scroll = panel.querySelector('.ask-scroll');
  const welcome = panel.querySelector('.ask-welcome');
  const suggestionWrap = panel.querySelector('.ask-suggestions');
  const messages = panel.querySelector('.ask-messages');
  const status = panel.querySelector('.ask-status');
  const form = panel.querySelector('.ask-form');
  const input = panel.querySelector('.ask-input');
  const send = panel.querySelector('.ask-send');
  const close = panel.querySelector('.ask-close');
  const history = [];
  let busy = false;

  suggestions.forEach(text => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ask-suggestion';
    button.textContent = text;
    button.addEventListener('click', () => submitQuestion(text));
    suggestionWrap.appendChild(button);
  });

  const setOpen = open => {
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('ask-open', open);
    if (open) {
      setQuickOpen(false);
      window.setTimeout(() => input.focus(), 80);
    } else {
      chatTrigger.focus();
    }
  };

  chatTrigger.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => setOpen(false));

  document.addEventListener('click', event => {
    if (!quickPanel.classList.contains('open')) return;
    if (quickPanel.contains(event.target) || centerTrigger?.contains(event.target)) return;
    setQuickOpen(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (panel.classList.contains('open')) setOpen(false);
    setQuickOpen(false);
  });

  function addMessage(role, text, source = '') {
    const wrap = document.createElement('div');
    wrap.className = `ask-message ${role}`;
    const speaker = document.createElement('span');
    speaker.className = 'ask-speaker';
    speaker.textContent = role === 'user' ? 'You' : 'Ask Abdullah';
    const bubble = document.createElement('div');
    bubble.className = 'ask-bubble';
    bubble.textContent = text;
    wrap.append(speaker, bubble);
    if (role === 'assistant' && source) {
      const meta = document.createElement('span');
      meta.className = 'ask-source';
      meta.textContent = source === 'openai' ? 'Verified profile answer' : 'Verified profile fallback';
      wrap.appendChild(meta);
    }
    messages.appendChild(wrap);
    scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
  }

  async function submitQuestion(raw) {
    const question = (raw || '').trim();
    if (!question || busy) return;
    busy = true;
    send.disabled = true;
    input.disabled = true;
    welcome.hidden = true;
    addMessage('user', question);
    input.value = '';
    status.classList.add('visible');
    scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: question, history: history.slice(-6) })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Assistant unavailable');
      const answer = data.answer || 'I could not find that in Abdullah’s verified profile.';
      addMessage('assistant', answer, data.source || 'verified-fallback');
      history.push({ role: 'user', content: question }, { role: 'assistant', content: answer });
      if (history.length > 12) history.splice(0, history.length - 12);
    } catch (error) {
      addMessage('assistant', 'The assistant is temporarily unavailable. You can still view Abdullah’s research, CV, or contact him directly by email.');
    } finally {
      status.classList.remove('visible');
      busy = false;
      send.disabled = false;
      input.disabled = false;
      input.focus();
      scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    submitQuestion(input.value);
  });
})();