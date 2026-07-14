// Official-program-page source for Miller Electric Company. Unlike
// api/dnb-lever-jobs.js (a structured Lever postings API), Miller has no
// public jobs API WorkJax is integrating with here. This endpoint reads
// Miller Electric's own official internship-program webpage and returns a
// single normalized "program" record, not individual job requisitions.
// See docs/integrations/miller-internship-program.md for scope, parsing
// rules, and limitations.
//
// This endpoint is independent of, and does not affect or depend on, the
// separate weekly iCIMS public-portal monitor
// (monitoring/employer-feed-watch.json, scripts/check-employer-feeds.mjs).
// That monitor watches EMCOR's public iCIMS job-search results page for
// job-level records and only ever writes to a GitHub issue. This endpoint
// watches Miller's own internship page and only ever feeds the WorkJax UI.
// Neither system uses the authenticated iCIMS API (api.icims.com).

// Fixed, server-controlled source. Never accept a site name or URL from the caller.
const MILLER_SOURCE_URL = "https://mecojax.com/join-the-team/internships";
const SOURCE_SLUG = "official-program:miller-electric";
const SOURCE_NAME = "Miller Electric official internship page";
const SOURCE_EMPLOYER = "Miller Electric Company";
const DEFAULT_TITLE = "Miller Electric Internship Program";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 3_000_000;
const REQUEST_USER_AGENT = "workjax-miller-internship-program (+read-only public page check)";

function isAllowedSourceHostname(hostname) {
  const h = String(hostname || "").toLowerCase();
  return h === "mecojax.com" || h === "www.mecojax.com" || h.endsWith(".mecojax.com");
}

// Application links are only ever accepted toward Miller's own domain or the
// specific EMCOR careers tenant named in the task scope — never a generic
// icims.com host, tracking redirect, or login URL.
function isApprovedApplicationHostname(hostname) {
  const h = String(hostname || "").toLowerCase();
  return (
    h === "mecojax.com" ||
    h === "www.mecojax.com" ||
    h.endsWith(".mecojax.com") ||
    h === "careers-emcorgroup.icims.com"
  );
}

const NAMED_ENTITIES = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  mdash: "—", ndash: "–", hellip: "…",
};

function decodeEntities(text) {
  if (typeof text !== "string" || text.length === 0) return "";
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => {
      const key = name.toLowerCase();
      return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, key) ? NAMED_ENTITIES[key] : match;
    });
}

function stripHtml(html) {
  if (typeof html !== "string" || html.length === 0) return "";
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  return decodeEntities(withoutTags).replace(/\s+/g, " ").trim();
}

function removeNoiseBlocks(html) {
  if (typeof html !== "string") return "";
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
}

const CHALLENGE_PATTERN = /checking your browser|attention required|cf-browser-verification|are you a human|captcha|access denied/i;
const INTERN_CONTEXT_PATTERN = /\bintern(ship)?s?\b/i;

// Recurring/future-tense phrasing never counts as evidence that applications
// are open or closed *right now* (e.g. "Applications typically open in
// Spring" is a generic recurring statement, not a current-status claim).
const RECURRING_DISQUALIFIER_PATTERN =
  /\b(typically|usually|generally|annually|each\s+(spring|summer|fall|winter)|every\s+year|will\s+open|will\s+begin|plan(?:s|ned)?\s+to\s+open)\b/i;

const OPEN_EVIDENCE_PATTERN =
  /\b(applications?|the\s+application\s+(?:period|window|process))\b[\s\S]{0,60}?\b(?:is|are)\b[\s\S]{0,40}?\b(?:now\s+|currently\s+)?open\b(?!\s+to\b)|\b(?:now|currently)\s+accepting\s+applications\b/i;

const CLOSED_EVIDENCE_PATTERN =
  /\b(applications?|the\s+application\s+(?:period|window|process))\b[\s\S]{0,60}?\b(?:is|are)\b[\s\S]{0,40}?\bclosed\b|\bnot\s+(?:currently\s+)?accepting\s+applications\b/i;

const AREA_HEADING_PATTERN = /internship\s+(opportunities|areas)/i;
const PAID_PATTERN = /\bpaid\s+(summer\s+)?intern(ship)?s?\b|\binternships?\s+(?:is|are)\s+paid\b/i;
const COLLEGE_ELIGIBILITY_PATTERN =
  /\b(currently\s+enrolled\s+(?:in\s+)?(?:a\s+|an\s+)?(college|university)|college\s+student|university\s+student|undergraduate\s+student)\b/i;
const SUMMER_INTERNSHIP_PATTERN = /\bsummer\s+intern(ship)?\b/i;

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function truncateEvidence(str) {
  const trimmed = String(str || "").trim();
  const MAX = 220;
  return trimmed.length > MAX ? `${trimmed.slice(0, MAX - 1).trim()}…` : trimmed;
}

// Conservative by design: only returns "open" or "closed" when a sentence
// explicitly and currently says so. Conflicting, absent, stale, or ambiguous
// wording always resolves to "unknown" rather than guessing.
function detectProgramStatus(plainText) {
  const sentences = splitSentences(plainText).filter((s) => INTERN_CONTEXT_PATTERN.test(s));
  const openSentence = sentences.find((s) => OPEN_EVIDENCE_PATTERN.test(s) && !RECURRING_DISQUALIFIER_PATTERN.test(s));
  const closedSentence = sentences.find((s) => CLOSED_EVIDENCE_PATTERN.test(s) && !RECURRING_DISQUALIFIER_PATTERN.test(s));

  if (openSentence && closedSentence) {
    return { status: "unknown", evidence: truncateEvidence(`${openSentence} ${closedSentence}`) };
  }
  if (openSentence) {
    return { status: "open", evidence: truncateEvidence(openSentence) };
  }
  if (closedSentence) {
    return { status: "closed", evidence: truncateEvidence(closedSentence) };
  }
  return { status: "unknown", evidence: null };
}

// Extracts list items from beneath an "Internship Opportunities"/"Internship
// Areas" heading only. Returns [] (never a fabricated or guessed list)
// whenever the section can't be located or the extracted items don't look
// like short area names.
function extractProgramAreas(html) {
  const headingMatches = [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)];
  let sectionStart = -1;
  for (const m of headingMatches) {
    const headingText = stripHtml(m[1]);
    if (AREA_HEADING_PATTERN.test(headingText)) {
      sectionStart = m.index + m[0].length;
      break;
    }
  }
  if (sectionStart === -1) return [];

  const rest = html.slice(sectionStart);
  const nextHeadingMatch = rest.match(/<h[1-4][^>]*>/i);
  const sectionHtml = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index) : rest.slice(0, 8000);

  const liMatches = [...sectionHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
  const candidates = liMatches.map((m) => stripHtml(m[1]));

  const seen = new Set();
  const areas = [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.length < 2 || candidate.length > 60) continue;
    if (/[.!?]\s+\S/.test(candidate)) continue; // looks like prose, not a short area name
    const wordCount = candidate.split(/\s+/).filter(Boolean).length;
    if (wordCount > 8) continue;
    const key = candidate.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    areas.push(candidate);
    if (areas.length >= 40) break;
  }
  return areas;
}

function extractApplicationUrl(html, baseUrl) {
  const anchorMatches = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  for (const m of anchorMatches) {
    const attrs = m[1] || "";
    const innerText = stripHtml(m[2] || "");
    const hrefMatch = attrs.match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i);
    if (!hrefMatch) continue;
    const rawHref = hrefMatch[1] || hrefMatch[2];
    if (!rawHref) continue;
    // HTML attribute values are entity-encoded (e.g. "&amp;" for "&" in a
    // query string) and must be decoded before the href is usable as a URL.
    const href = decodeEntities(rawHref);
    const looksLikeApply = /apply/i.test(innerText) || /apply/i.test(attrs);
    if (!looksLikeApply) continue;

    let resolved;
    try {
      resolved = new URL(href, baseUrl);
    } catch (_err) {
      continue;
    }
    if (resolved.protocol !== "https:" && resolved.protocol !== "http:") continue;
    if (isApprovedApplicationHostname(resolved.hostname)) {
      return resolved.href;
    }
  }
  return null;
}

function extractTitle(html) {
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    const candidate = stripHtml(h1Match[1]);
    if (candidate && candidate.length <= 100 && /intern/i.test(candidate)) {
      return candidate;
    }
  }
  return DEFAULT_TITLE;
}

function detectPaid(plainText) {
  return PAID_PATTERN.test(plainText) ? true : null;
}

function detectStudentLevel(plainText) {
  return COLLEGE_ELIGIBILITY_PATTERN.test(plainText) ? "College" : null;
}

function detectCommitment(plainText) {
  return SUMMER_INTERNSHIP_PATTERN.test(plainText) ? "Summer Internship" : null;
}

// Composed from confirmed, extracted fields only — never a verbatim excerpt
// of arbitrary page prose, so it can't accidentally surface unrelated
// marketing or legal copy as if it were a description WorkJax wrote.
function composeDescription({ paid, programAreas }) {
  const parts = ["Miller Electric Company's official internship program page, verified directly from mecojax.com."];
  if (paid === true) {
    parts.push("The program is explicitly described as paid on the official page.");
  }
  if (Array.isArray(programAreas) && programAreas.length > 0) {
    parts.push(`The official page currently lists ${programAreas.length} internship area${programAreas.length === 1 ? "" : "s"}.`);
  }
  return parts.join(" ");
}

// Reads the response body through a capped, streamed reader — never an
// unbounded read — mirroring scripts/check-employer-feeds.mjs's approach for
// the same class of public-webpage fetch.
async function readBodyCapped(response) {
  if (!response.body || typeof response.body.getReader !== "function") {
    const text = await response.text();
    return { html: text.slice(0, MAX_HTML_BYTES) };
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let html = "";
  try {
    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (received >= MAX_HTML_BYTES) break;
    }
  } finally {
    try {
      await reader.cancel();
    } catch (_err) {
      // ignore
    }
  }
  return { html };
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=60",
    },
  });
}

function errorResponse(generatedAt, message) {
  return jsonResponse(
    {
      source: SOURCE_SLUG,
      employer: SOURCE_EMPLOYER,
      generatedAt,
      count: 0,
      jobs: [],
      error: message,
    },
    502
  );
}

export async function GET(_request) {
  const generatedAt = new Date().toISOString();

  let response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      response = await fetch(MILLER_SOURCE_URL, {
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": REQUEST_USER_AGENT },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (_err) {
    return errorResponse(generatedAt, "Unable to retrieve Miller Electric's official internship page right now.");
  }

  if (!response.ok) {
    return errorResponse(generatedAt, "Unable to retrieve Miller Electric's official internship page right now.");
  }

  let finalHostname;
  try {
    finalHostname = new URL(response.url || MILLER_SOURCE_URL).hostname;
  } catch (_err) {
    return errorResponse(generatedAt, "Unable to confirm the official source of Miller Electric's internship page.");
  }
  if (!isAllowedSourceHostname(finalHostname)) {
    return errorResponse(generatedAt, "Miller Electric's internship page did not resolve to an approved official hostname.");
  }

  const { html: rawHtml } = await readBodyCapped(response);
  const cleanHtml = removeNoiseBlocks(rawHtml);
  const plainText = stripHtml(cleanHtml);

  // Baseline sanity check that this is actually a readable internship page,
  // separate from and prior to application-status interpretation — an
  // "unknown" status is a successful parse; this check catches a page that
  // couldn't be meaningfully read at all (bot challenge, empty body, wrong
  // page after a redirect the hostname check didn't already catch).
  if (plainText.length < 200 || CHALLENGE_PATTERN.test(plainText) || !INTERN_CONTEXT_PATTERN.test(plainText)) {
    return errorResponse(generatedAt, "Miller Electric's official internship page could not be reliably interpreted right now.");
  }

  const title = extractTitle(cleanHtml);
  const { status: programStatus, evidence: statusEvidence } = detectProgramStatus(plainText);
  const programAreas = extractProgramAreas(cleanHtml);
  const paid = detectPaid(plainText);
  const studentLevel = detectStudentLevel(plainText);
  const commitment = detectCommitment(plainText);
  const applicationUrl = extractApplicationUrl(cleanHtml, MILLER_SOURCE_URL) || MILLER_SOURCE_URL;
  const description = composeDescription({ paid, programAreas });

  const job = {
    id: "official-program:miller-electric:summer-internship",
    sourceId: SOURCE_SLUG,
    sourceName: SOURCE_NAME,
    sourceEmployer: SOURCE_EMPLOYER,
    employerName: SOURCE_EMPLOYER,
    title,
    description,
    descriptionPlain: description,
    postingKind: "official_program",
    opportunityType: "Internship Program",
    studentLevel,
    location: "Jacksonville, FL",
    workplaceType: null,
    commitment,
    salaryRange: null,
    paid,
    programStatus,
    statusEvidence,
    programAreas,
    externalUrl: MILLER_SOURCE_URL,
    applicationUrl,
    sourceLastSeenAt: generatedAt,
    lastVerifiedAt: generatedAt,
    dateVerificationStatus: "unverified",
    status: "active",
  };

  return jsonResponse(
    {
      source: SOURCE_SLUG,
      employer: SOURCE_EMPLOYER,
      generatedAt,
      count: 1,
      jobs: [job],
    },
    200
  );
}
