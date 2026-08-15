const ARXIV_API = "https://export.arxiv.org/api/query";
const REQUEST_TIMEOUT_MS = 7000;
const FALLBACK_IDS = ["2605.02196", "2605.02206"];

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseFeed(xml) {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)];

  return entries.map((entryMatch) => {
    const entry = entryMatch[1];
    const idUrl = tag(entry, "id");
    const id = idUrl.split("/abs/").pop()?.replace(/v\d+$/i, "") || idUrl;
    const authors = [...entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi)]
      .map((match) => decodeXml(match[1]));
    const categories = [...entry.matchAll(/<category\s+term=["']([^"']+)["'][^>]*\/?\s*>/gi)]
      .map((match) => decodeXml(match[1]));
    const pdfLink = entry.match(/<link[^>]+title=["']pdf["'][^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i)
      || entry.match(/<link[^>]+href=["']([^"']+)["'][^>]+title=["']pdf["'][^>]*\/?\s*>/i);

    return {
      id,
      title: tag(entry, "title"),
      summary: tag(entry, "summary"),
      published: tag(entry, "published"),
      updated: tag(entry, "updated"),
      authors,
      categories: [...new Set(categories)].slice(0, 4),
      url: idUrl || `https://arxiv.org/abs/${id}`,
      pdf: pdfLink ? decodeXml(pdfLink[1]) : `https://arxiv.org/pdf/${id}`,
    };
  }).filter((paper) => paper.title && paper.id);
}

async function fetchArxiv(params) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const query = new URLSearchParams(params);

  try {
    const response = await fetch(`${ARXIV_API}?${query.toString()}`, {
      headers: {
        accept: "application/atom+xml, application/xml;q=0.9, text/xml;q=0.8",
        "user-agent": "AbdullahAhmadKhan-Portfolio/2.0 (academic portfolio; public metadata feed)",
      },
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`arXiv returned ${response.status}`);
    return parseFeed(await response.text());
  } finally {
    clearTimeout(timer);
  }
}

function normaliseName(name = "") {
  return name.toLowerCase().replace(/[^a-z]+/g, " ").replace(/\s+/g, " ").trim();
}

function isAbdullahPaper(paper) {
  return paper.authors.some((author) => {
    const name = normaliseName(author);
    return name === "abdullah ahmad khan" || name === "abdullah a khan";
  });
}

function uniqueById(papers) {
  const seen = new Set();
  return papers.filter((paper) => {
    if (seen.has(paper.id)) return false;
    seen.add(paper.id);
    return true;
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ available: false, error: "Method not allowed" });
  }

  // Research metadata changes slowly; edge-cache it to be respectful to arXiv.
  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");

  try {
    let authorPapers = [];
    try {
      authorPapers = await fetchArxiv({
        search_query: 'au:"Abdullah Ahmad Khan"',
        start: "0",
        max_results: "8",
        sortBy: "submittedDate",
        sortOrder: "descending",
      });
      authorPapers = authorPapers.filter(isAbdullahPaper);
    } catch (error) {
      console.warn("arXiv author search unavailable", error.message);
    }

    let knownPapers = [];
    try {
      knownPapers = await fetchArxiv({ id_list: FALLBACK_IDS.join(","), max_results: String(FALLBACK_IDS.length) });
    } catch (error) {
      console.warn("arXiv fallback lookup unavailable", error.message);
    }

    const papers = uniqueById([...authorPapers, ...knownPapers])
      .sort((a, b) => new Date(b.updated || b.published) - new Date(a.updated || a.published))
      .slice(0, 4);

    if (!papers.length) {
      return res.status(200).json({ available: false, source: "arXiv" });
    }

    return res.status(200).json({
      available: true,
      source: "arXiv",
      updatedAt: new Date().toISOString(),
      papers,
    });
  } catch (error) {
    console.error("arXiv research feed unavailable", error);
    return res.status(200).json({ available: false, source: "arXiv" });
  }
}
