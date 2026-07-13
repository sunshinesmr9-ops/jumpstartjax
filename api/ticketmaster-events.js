// Ticketmaster Discovery API proof of concept (ADR-002).
// Scope, fixed parameters, and normalization rules are documented in
// docs/integrations/ticketmaster-poc.md. This endpoint is not called by
// index.html/app.js/data.js and does not affect the live site.

const TICKETMASTER_EVENTS_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
const SEARCH_WINDOW_DAYS = 30;
const RESULT_SIZE = 20;
const UPSTREAM_TIMEOUT_MS = 8000;

export async function GET(request) {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return jsonError(500, "Ticketmaster is not configured.");
  }

  const now = new Date();
  const startDateTime = toTicketmasterUtc(now);
  const endDateTime = toTicketmasterUtc(
    new Date(now.getTime() + SEARCH_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  );

  const upstreamUrl = new URL(TICKETMASTER_EVENTS_URL);
  upstreamUrl.searchParams.set("city", "Jacksonville");
  upstreamUrl.searchParams.set("stateCode", "FL");
  upstreamUrl.searchParams.set("countryCode", "US");
  upstreamUrl.searchParams.set("startDateTime", startDateTime);
  upstreamUrl.searchParams.set("endDateTime", endDateTime);
  upstreamUrl.searchParams.set("size", String(RESULT_SIZE));
  upstreamUrl.searchParams.set("sort", "date,asc");
  upstreamUrl.searchParams.set("apikey", apiKey);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, { signal: controller.signal });
  } catch (err) {
    if (err && err.name === "AbortError") {
      return jsonError(504, "Ticketmaster request timed out.");
    }
    return jsonError(502, "Unable to reach Ticketmaster.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!upstreamResponse.ok) {
    return jsonError(502, "Ticketmaster returned an error.");
  }

  let payload;
  try {
    payload = await upstreamResponse.json();
  } catch (err) {
    return jsonError(502, "Ticketmaster returned an unreadable response.");
  }

  const generatedAt = new Date().toISOString();
  const rawEvents = (payload && payload._embedded && payload._embedded.events) || [];
  const events = rawEvents.map((event) => normalizeEvent(event, generatedAt));

  const body = {
    source: "ticketmaster",
    generatedAt,
    searchWindow: { startDateTime, endDateTime },
    count: events.length,
    events,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

function normalizeEvent(event, generatedAt) {
  const venue =
    (event._embedded && event._embedded.venues && event._embedded.venues[0]) || null;
  const start = (event.dates && event.dates.start) || null;
  const end = (event.dates && event.dates.end) || null;
  const status = (event.dates && event.dates.status) || null;
  const classification =
    (event.classifications && event.classifications[0]) || null;

  return {
    id: `ticketmaster:${event.id}`,
    sourceId: event.id,
    sourceName: "Ticketmaster",
    title: event.name || null,
    description: event.info || event.pleaseNote || null,
    experienceType: "scheduled_event",
    startsAt: (start && start.dateTime) || null,
    endsAt: (end && end.dateTime) || null,
    localDate: (start && start.localDate) || null,
    localTime: (start && start.localTime) || null,
    venueName: (venue && venue.name) || null,
    address: (venue && venue.address && venue.address.line1) || null,
    city: (venue && venue.city && venue.city.name) || null,
    stateCode: (venue && venue.state && venue.state.stateCode) || null,
    postalCode: (venue && venue.postalCode) || null,
    latitude: (venue && venue.location && venue.location.latitude) || null,
    longitude: (venue && venue.location && venue.location.longitude) || null,
    category: (classification && classification.segment && classification.segment.name) || null,
    externalUrl: event.url || null,
    eventStatus: (status && status.code) || null,
    dateVerificationStatus: "verified",
    lastVerifiedAt: generatedAt,
  };
}

function toTicketmasterUtc(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
