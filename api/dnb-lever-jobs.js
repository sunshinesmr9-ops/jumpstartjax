// Endpoint-only proof of concept: Dun & Bradstreet postings via the public Lever
// Postings API. See docs/integrations/dnb-lever-poc.md and
// docs/decisions/ADR-003-dnb-lever-job-poc.md for scope and rationale.
//
// This function is not called from index.html, app.js, or data.js. It exists
// so its output can be reviewed on its own before any UI integration decision
// is made.

// Fixed, server-controlled source. Never accept a site name or URL from the caller.
const LEVER_SOURCE_URL = "https://api.lever.co/v0/postings/dnb?mode=json";
const SOURCE_NAME = "Lever";
const SOURCE_EMPLOYER = "Dun & Bradstreet";
const MAX_RESULTS = 20;
const REQUEST_TIMEOUT_MS = 8000;

const INTERNSHIP_TITLE_PATTERN = /\b(internship|intern|interns)\b/i;
const APPRENTICE_TITLE_PATTERN = /\bapprentice(ship)?\b/i;
const EARLY_TALENT_TITLE_PATTERN = /\bearly talent\b/i;
const CO_OP_TITLE_PATTERN = /\bco-?op\b/i;
const GRADUATE_PROGRAM_TITLE_PATTERN = /\bgraduate program\b/i;

const STUDENT_TITLE_PATTERN = new RegExp(
  [
    INTERNSHIP_TITLE_PATTERN.source,
    APPRENTICE_TITLE_PATTERN.source,
    EARLY_TALENT_TITLE_PATTERN.source,
    CO_OP_TITLE_PATTERN.source,
    GRADUATE_PROGRAM_TITLE_PATTERN.source,
  ].join("|"),
  "i"
);

const COLLEGE_REFERENCE_PATTERN = /\b(college|university|undergraduate|graduate|degree)\b/i;

// Lever's "Intern" commitment value can appear with a suffix, e.g.
// "Intern: Full Time" or "Intern: Part Time" — match the prefix, not the
// exact string.
const TALENT_NETWORK_TITLE_PATTERN = /early talent network/i;
const TALENT_NETWORK_DESCRIPTION_PATTERN =
  /(not\s+(?:currently\s+)?(?:an?\s+)?(?:specific\s+|current\s+)?open\s+(?:job\s+)?(?:opportunity|position|role|opening))|(no\s+specific\s+(?:job\s+)?(?:opportunity|position|opening|role))/i;

function commitmentIndicatesIntern(commitment) {
  return typeof commitment === "string" && commitment.trim().toLowerCase().startsWith("intern");
}

function isTalentNetworkPosting(title, descriptionPlain) {
  if (TALENT_NETWORK_TITLE_PATTERN.test(title || "")) {
    return true;
  }
  return TALENT_NETWORK_DESCRIPTION_PATTERN.test(descriptionPlain || "");
}

function stripHtml(html) {
  if (typeof html !== "string" || html.length === 0) {
    return "";
  }
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function textIncludesJacksonvilleFlorida(text) {
  if (typeof text !== "string" || text.length === 0) {
    return false;
  }
  const normalized = text.toLowerCase();
  if (!normalized.includes("jacksonville")) {
    return false;
  }
  return (
    normalized.includes("florida") ||
    /,\s*fl\b/.test(normalized) ||
    /\bfl\b/.test(normalized)
  );
}

function isJacksonvilleFloridaPosting(posting) {
  const categories = posting.categories || {};
  const candidates = [categories.location];
  if (Array.isArray(categories.allLocations)) {
    candidates.push(...categories.allLocations);
  }
  return candidates.some((candidate) => textIncludesJacksonvilleFlorida(candidate));
}

function isStudentRelevantPosting(posting, title) {
  const categories = posting.categories || {};
  if (commitmentIndicatesIntern(categories.commitment)) {
    return true;
  }

  const department = typeof categories.department === "string" ? categories.department.toLowerCase() : "";
  const team = typeof categories.team === "string" ? categories.team.toLowerCase() : "";
  if (department.includes("internship") || team.includes("internship")) {
    return true;
  }

  return STUDENT_TITLE_PATTERN.test(title || "");
}

function classifyOpportunityType(posting, title) {
  const categories = posting.categories || {};
  const department = typeof categories.department === "string" ? categories.department.toLowerCase() : "";
  const team = typeof categories.team === "string" ? categories.team.toLowerCase() : "";
  const titleText = title || "";

  if (
    commitmentIndicatesIntern(categories.commitment) ||
    department.includes("internship") ||
    team.includes("internship") ||
    INTERNSHIP_TITLE_PATTERN.test(titleText)
  ) {
    return "Internship";
  }

  if (
    department.includes("apprentice") ||
    team.includes("apprentice") ||
    APPRENTICE_TITLE_PATTERN.test(titleText)
  ) {
    return "Apprenticeship";
  }

  return "Early Talent";
}

function classifyStudentLevel(title, descriptionPlain) {
  const combined = `${title || ""} ${descriptionPlain || ""}`;
  return COLLEGE_REFERENCE_PATTERN.test(combined) ? "College" : "Unspecified";
}

function parseCityAndState(location) {
  if (typeof location !== "string") {
    return { city: null, stateCode: null };
  }
  const match = location.match(/^\s*([^,]+),\s*([A-Za-z]{2})\s*$/);
  if (!match) {
    return { city: null, stateCode: null };
  }
  return { city: match[1].trim(), stateCode: match[2].toUpperCase() };
}

function normalizePosting(posting, requestTimestamp) {
  const title = typeof posting.text === "string" ? posting.text : "";
  const categories = posting.categories || {};
  const content = posting.content || {};
  const description = typeof content.description === "string" ? content.description : "";
  const descriptionPlain = stripHtml(description);
  const location = typeof categories.location === "string" ? categories.location : null;
  const allLocations = Array.isArray(categories.allLocations) ? categories.allLocations : [];
  const { city, stateCode } = parseCityAndState(location);
  const isTalentNetwork = isTalentNetworkPosting(title, descriptionPlain);

  return {
    id: `lever:dnb:${posting.id}`,
    sourceId: posting.id,
    sourceName: SOURCE_NAME,
    sourceEmployer: SOURCE_EMPLOYER,
    title,
    description,
    descriptionPlain,
    postingKind: isTalentNetwork ? "talent_network" : "open_opportunity",
    opportunityType: isTalentNetwork ? "Early Talent" : classifyOpportunityType(posting, title),
    studentLevel: classifyStudentLevel(title, descriptionPlain),
    employerName: SOURCE_EMPLOYER,
    location,
    allLocations,
    city,
    stateCode,
    countryCode: typeof posting.country === "string" ? posting.country : null,
    workplaceType: typeof posting.workplaceType === "string" ? posting.workplaceType : null,
    commitment: typeof categories.commitment === "string" ? categories.commitment : null,
    team: typeof categories.team === "string" ? categories.team : null,
    department: typeof categories.department === "string" ? categories.department : null,
    salaryRange: posting.salaryRange || null,
    externalUrl: typeof posting.hostedUrl === "string" ? posting.hostedUrl : null,
    applicationUrl: typeof posting.applyUrl === "string" ? posting.applyUrl : null,
    sourceLastSeenAt: requestTimestamp,
    lastVerifiedAt: requestTimestamp,
    dateVerificationStatus: "verified",
    status: isTalentNetwork ? "active_network" : "active",
  };
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

export async function GET(request) {
  const generatedAt = new Date().toISOString();

  let upstreamResponse;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      upstreamResponse = await fetch(LEVER_SOURCE_URL, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  } catch (_err) {
    return jsonResponse(
      {
        source: "lever:dnb",
        employer: SOURCE_EMPLOYER,
        generatedAt,
        count: 0,
        jobs: [],
        error: "Unable to retrieve postings from source.",
      },
      502
    );
  }

  if (!upstreamResponse.ok) {
    return jsonResponse(
      {
        source: "lever:dnb",
        employer: SOURCE_EMPLOYER,
        generatedAt,
        count: 0,
        jobs: [],
        error: "Unable to retrieve postings from source.",
      },
      502
    );
  }

  let postings;
  try {
    postings = await upstreamResponse.json();
  } catch (_err) {
    return jsonResponse(
      {
        source: "lever:dnb",
        employer: SOURCE_EMPLOYER,
        generatedAt,
        count: 0,
        jobs: [],
        error: "Unable to retrieve postings from source.",
      },
      502
    );
  }

  if (!Array.isArray(postings)) {
    return jsonResponse(
      {
        source: "lever:dnb",
        employer: SOURCE_EMPLOYER,
        generatedAt,
        count: 0,
        jobs: [],
        error: "Unable to retrieve postings from source.",
      },
      502
    );
  }

  const jobs = postings
    .filter((posting) => posting && typeof posting === "object")
    .filter((posting) => isJacksonvilleFloridaPosting(posting))
    .filter((posting) => isStudentRelevantPosting(posting, posting.text))
    .slice(0, MAX_RESULTS)
    .map((posting) => normalizePosting(posting, generatedAt));

  return jsonResponse(
    {
      source: "lever:dnb",
      employer: SOURCE_EMPLOYER,
      generatedAt,
      count: jobs.length,
      jobs,
    },
    200
  );
}
