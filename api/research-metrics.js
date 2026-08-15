const API_BASE = "https://api.semanticscholar.org/graph/v1";
const REQUEST_TIMEOUT_MS = 6500;

const KNOWN_TITLES = [
  "Hessian-Guided Gradient Unlearning",
  "DurableUn: Quantization-Induced Recovery Attacks in Machine Unlearning",
  "Metric Unreliability in Multimodal Machine Unlearning",
  "Rapid Face Mask Detection and Person Identification Model Based on Deep Neural Networks",
  "Islamophobic Tweet Detection using Transfer Learning",
  "Machine Unlearning for GDPR Right-to-Erasure in Antimicrobial Resistance Prediction Models",
];

const KNOWN_PAPER_IDS = [
  "DOI:10.1007/978-981-19-8136-4_10",
  "DOI:10.1109/CSI54720.2022.9923957",
  "ARXIV:2605.02196",
  "ARXIV:2605.02206",
  "DOI:10.64898/2026.03.09.26347960",
];

function normalise(value = "") {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function semanticFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = {
    accept: "application/json",
    ...(options.headers || {}),
  };

  if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
    headers["x-api-key"] = process.env.SEMANTIC_SCHOLAR_API_KEY;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Semantic Scholar returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function candidateScore(candidate) {
  const name = normalise(candidate?.name);
  if (!name.includes("abdullah") || !name.includes("khan")) return -1;

  let score = name === "abdullah ahmad khan" ? 5 : 2;
  const affiliations = (candidate.affiliations || []).map(normalise).join(" ");
  if (affiliations.includes("murdoch")) score += 8;

  const candidateTitles = (candidate.papers || []).map((paper) => normalise(paper.title));
  for (const known of KNOWN_TITLES) {
    const target = normalise(known);
    if (candidateTitles.some((title) => title === target || title.includes(target) || target.includes(title))) {
      score += 12;
    }
  }

  return score;
}

function cleanPaper(paper) {
  if (!paper?.title) return null;
  return {
    paperId: paper.paperId || null,
    title: paper.title,
    year: paper.year || null,
    citationCount: Number(paper.citationCount || 0),
    influentialCitationCount: Number(paper.influentialCitationCount || 0),
    url: paper.url || null,
    externalIds: paper.externalIds || null,
  };
}

async function findAuthor() {
  const fields = [
    "name",
    "url",
    "affiliations",
    "paperCount",
    "citationCount",
    "hIndex",
    "papers.title",
    "papers.year",
    "papers.citationCount",
    "papers.influentialCitationCount",
    "papers.url",
    "papers.externalIds",
  ].join(",");

  const search = new URLSearchParams({
    query: "Abdullah Ahmad Khan",
    limit: "10",
    fields,
  });

  const result = await semanticFetch(`/author/search?${search.toString()}`);
  const candidates = Array.isArray(result?.data) ? result.data : [];
  const ranked = candidates
    .map((candidate) => ({ candidate, score: candidateScore(candidate) }))
    .sort((a, b) => b.score - a.score);

  // Require evidence beyond a loose name match before publishing author-level metrics.
  if (!ranked.length || ranked[0].score < 14) return null;
  return ranked[0].candidate;
}

async function fetchKnownPapers() {
  const fields = [
    "title",
    "year",
    "citationCount",
    "influentialCitationCount",
    "url",
    "externalIds",
  ].join(",");

  const result = await semanticFetch(`/paper/batch?fields=${encodeURIComponent(fields)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: KNOWN_PAPER_IDS }),
  });

  return (Array.isArray(result) ? result : []).map(cleanPaper).filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ available: false, error: "Method not allowed" });
  }

  // Cache at Vercel's edge. The portfolio does not need second-by-second citation updates.
  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");

  try {
    let author = null;
    try {
      author = await findAuthor();
    } catch (error) {
      console.warn("Semantic Scholar author lookup failed", error.message);
    }

    if (author) {
      const papers = (author.papers || []).map(cleanPaper).filter(Boolean);
      return res.status(200).json({
        available: true,
        source: "Semantic Scholar",
        mode: "author",
        updatedAt: new Date().toISOString(),
        author: {
          authorId: author.authorId,
          name: author.name,
          url: author.url,
          paperCount: Number(author.paperCount || papers.length || 0),
          citationCount: Number(author.citationCount || 0),
          hIndex: Number(author.hIndex || 0),
        },
        papers,
      });
    }

    const papers = await fetchKnownPapers();
    if (!papers.length) throw new Error("No verified papers were returned");

    const citationCount = papers.reduce((sum, paper) => sum + paper.citationCount, 0);
    const influentialCitationCount = papers.reduce(
      (sum, paper) => sum + paper.influentialCitationCount,
      0,
    );

    return res.status(200).json({
      available: true,
      source: "Semantic Scholar",
      mode: "papers",
      updatedAt: new Date().toISOString(),
      summary: {
        trackedPapers: papers.length,
        citationCount,
        influentialCitationCount,
      },
      papers,
    });
  } catch (error) {
    console.error("Research metrics unavailable", error);
    return res.status(200).json({
      available: false,
      source: "Semantic Scholar",
      updatedAt: new Date().toISOString(),
    });
  }
}
