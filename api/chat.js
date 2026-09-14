const PROFILE = `
Verified public profile for Abdullah Ahmad Khan. Current context: September 2026.

IDENTITY
- Abdullah Ahmad Khan is based in Perth, Western Australia.
- He is a final-stage PhD researcher in Computer Science at Murdoch University.
- His work focuses on machine unlearning, multimodal AI, trustworthy AI, vision-language models, model auditing, recovery attacks, privacy-preserving ML and reliable evaluation.

PHD / RESEARCH
- PhD institution: Murdoch University.
- Thesis by publication / thesis finalisation stage.
- Core thesis portfolio:
  1. Hessian-Guided Gradient Unlearning — accepted in Neurocomputing, 2026.
  2. Selective Multimodal Unlearning via Boundary-Based Forgetting — Neural Networks, revision stage.
  3. MU-ALIGN: Tail-Suppressed Multimodal Machine Unlearning — Knowledge-Based Systems, under review.
- Other current work includes DurableUn: Quantization-Induced Recovery Attacks in Machine Unlearning and Metric Unreliability in Multimodal Machine Unlearning.
- DurableUn studies whether deployment compression / quantisation can recover behaviour that appeared to be forgotten.
- The metric work studies reliability of evaluation metrics for multimodal machine unlearning.

TEACHING
- University of Notre Dame Australia: Academic Lecturer. Units include COMP6012 Cyber Threat Intelligence and COMP6013 Network Security & Cryptography.
- Murdoch University: Casual Academic / teaching academic. Units include ICT619 Artificial Intelligence, ICT206 Intelligent Systems and ICT100 Transition to IT.

EDUCATION
- Doctor of Philosophy in Computer Science, Murdoch University — final stage.
- Master of Computer Science & Applications, Aligarh Muslim University — completed.
- University of Turku, Finland — admitted to a master's programme. This is an admission, not a completed degree and should never be described as one.

PROJECTS / SYSTEMS
- FacePercept-Bench — live benchmark: https://face-percept-bench.vercel.app/
- ForensicVLM-Lite — research software: https://github.com/abdullahak07/ForensicVLM
- NeuroLoop-Lite — closed-loop ML system: https://github.com/abdullahak07/NeuroLoop-Lite
- MU-ALIGN code: https://github.com/abdullahak07/MU-Align
- Hessian-Guided code: https://github.com/abdullahak07/Hessian-Guided-Paper
- Boundary unlearning code: https://github.com/abdullahak07/BoundaryUnl

LINKS / CONTACT
- GitHub: https://github.com/abdullahak07
- Google Scholar: https://scholar.google.com/citations?user=CXdZEF0AAAAJ&hl=en
- Email: aahmad607@gmail.com
- Website CV: /cv

RULES FOR ANSWERING
- Answer only from the verified profile above.
- Never invent publications, awards, affiliations, dates, qualifications or employment.
- If the requested information is not in the verified profile, say that it is not listed in Abdullah's verified public profile.
- Keep answers concise and professional, usually 2–5 short paragraphs or a compact list.
- Distinguish submitted / under review / revision / accepted work accurately.
- Do not imply that University of Turku was attended or completed; only say Abdullah was admitted to a master's programme there.
- If someone wants to collaborate, direct them to aahmad607@gmail.com and mention relevant research areas.
- For personal questions unrelated to the professional profile, say the assistant only answers about Abdullah's public professional work.
`;

const FALLBACKS = {
  research: `Abdullah researches machine unlearning, multimodal AI and trustworthy vision-language systems. His work focuses on selective forgetting, model auditing, recovery attacks and reliable evaluation — especially the question of whether a model has genuinely forgotten information rather than only hiding it at the output level.`,
  phd: `Abdullah is in the final stage of a PhD in Computer Science at Murdoch University. His thesis-by-publication portfolio centres on three machine-unlearning papers: Hessian-Guided Gradient Unlearning (accepted in Neurocomputing), Boundary-Based Forgetting (Neural Networks, revision), and MU-ALIGN (Knowledge-Based Systems, under review).`,
  publications: `Selected current research includes:\n• Hessian-Guided Gradient Unlearning — accepted, Neurocomputing 2026\n• Selective Multimodal Unlearning via Boundary-Based Forgetting — Neural Networks, revision\n• MU-ALIGN — Knowledge-Based Systems, under review\n• DurableUn — quantisation-induced recovery attacks\n• Metric Unreliability in Multimodal Machine Unlearning\n\nSee Google Scholar: https://scholar.google.com/citations?user=CXdZEF0AAAAJ&hl=en`,
  teaching: `Abdullah teaches across AI and cybersecurity. At the University of Notre Dame Australia he teaches Cyber Threat Intelligence and Network Security & Cryptography. At Murdoch University he has taught Artificial Intelligence, Intelligent Systems and Transition to IT.`,
  projects: `Selected systems include FacePercept-Bench, ForensicVLM-Lite, NeuroLoop-Lite, MU-ALIGN, Hessian-Guided Unlearning and BoundaryUnl. His GitHub is https://github.com/abdullahak07 and FacePercept-Bench is live at https://face-percept-bench.vercel.app/.`,
  education: `Abdullah is completing a PhD in Computer Science at Murdoch University and completed a Master of Computer Science & Applications at Aligarh Muslim University. He was also admitted to a master's programme at the University of Turku, Finland; that entry is an admission, not a completed degree.`,
  collaborate: `Abdullah is open to research collaboration around machine unlearning, trustworthy AI, multimodal / vision-language systems, model auditing and applied AI. The best contact is aahmad607@gmail.com.`
};

function fallbackAnswer(question = '') {
  const q = question.toLowerCase();
  if (/turku|education|degree|master/.test(q)) return FALLBACKS.education;
  if (/publication|paper|journal|neurocomputing|boundary|mu-align|durable|metric/.test(q)) return FALLBACKS.publications;
  if (/teach|course|unit|lecturer|notre dame|murdoch/.test(q)) return FALLBACKS.teaching;
  if (/project|system|github|software|benchmark|forensic|neuroloop/.test(q)) return FALLBACKS.projects;
  if (/collaborat|contact|email|work with|meeting/.test(q)) return FALLBACKS.collaborate;
  if (/phd|thesis|doctoral/.test(q)) return FALLBACKS.phd;
  if (/research|unlearn|multimodal|vlm|trustworthy|forget/.test(q)) return FALLBACKS.research;
  return `I can answer questions about Abdullah's machine-unlearning research, PhD, publications, teaching, projects, education and collaboration. That specific information is not listed in the verified public profile I have.`;
}

function extractText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const text = (data?.output || [])
    .flatMap(item => item?.content || [])
    .filter(part => part?.type === 'output_text' && typeof part?.text === 'string')
    .map(part => part.text)
    .join('\n')
    .trim();
  return text;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : (req.body || {});
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 600) : '';
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  if (!message) return res.status(400).json({ error: 'A question is required.' });

  const fallback = fallbackAnswer(message);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ answer: fallback, source: 'verified-fallback', configured: false });
  }

  const conversation = history
    .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .map(item => ({ role: item.role, content: item.content.slice(0, 1200) }));
  conversation.push({ role: 'user', content: message });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-5.6-luna',
        instructions: PROFILE,
        input: conversation,
        max_output_tokens: 500
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('OpenAI response error', response.status, detail.slice(0, 500));
      return res.status(200).json({ answer: fallback, source: 'verified-fallback', configured: true });
    }

    const data = await response.json();
    const answer = extractText(data) || fallback;
    return res.status(200).json({ answer, source: answer === fallback ? 'verified-fallback' : 'openai', configured: true });
  } catch (error) {
    console.error('Ask Abdullah API unavailable', error);
    return res.status(200).json({ answer: fallback, source: 'verified-fallback', configured: true });
  }
}
