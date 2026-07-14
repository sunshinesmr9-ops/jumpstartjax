# Community Event Platform

- **Current status:** `DEMO ONLY` prototype nested inside the `LIVE` Third Spaces page
- **Product owner:** TBD
- **Technical owner:** TBD
- **Content owner:** TBD
- **Last reviewed:** 2026-07-14
- **Related code:** `community-event-data.js`, `community-event-platform.js`, `index.html` (`#page-experience`), `styles.css` (`cep-` section)
- **Related data:** `window.COMMUNITY_EVENT_PLATFORM_DATA` (see [Data Structure](#data-structure) below)

## 1. Purpose

Community Event Platform is a prototype nested subtab on the existing Third Spaces page. It adapts a separate public concept — a hospitality-first, SMS-oriented community app for Jacksonville — into a browser-only preview inside WorkJax, so the idea of "standing weekly traditions" can be explored alongside WorkJax's own curated Third Spaces content, without merging the two systems.

## 2. Relationship to the WorkJax Third Spaces Page

The Third Spaces page (`#page-experience`) now contains two nested subtabs, controlled by an accessible tab widget:

1. **Explore Jacksonville** (default) — the original, unchanged WorkJax Third Spaces experience: curated recurring-spot cards, the "ideas we're exploring" chips, and the scheduled-events grid with filters and demo RSVP. Nothing about this tab's markup, data, or behavior changed.
2. **Community Event Platform** — the new prototype described in this document.

The two are independent. Community Event Platform does not read from or write to the `events` array, `renderEvents()`, or the RSVP system that power Explore Jacksonville.

## 3. Source-Repository Attribution

- **Original repository:** [`espil77/3rd-Space`](https://github.com/espil77/3rd-Space) (public GitHub repository).
- **Original concept and assets:** the "Third Space" hospitality concept, its front-porch web copy ("Someone's already making plans for tonight.", the third-place explainer, the weekly schedule framing, "A peek at what's next," the closing line "The website is not the destination. Jacksonville is."), the weekly schedule in `content/traditions/weekly_schedule.md`, the time-of-day ("daypart") visual theming concept, and the three daypart reference images (`app/images/daypart-morning.png`, `daypart-midday.png`, `daypart-evening.png`) all originate from that repository's `app/index.html`, `app/script.js`, `app/styles.css`, and `content/traditions/weekly_schedule.md`.
- **Adaptation location in WorkJax:** `community-event-data.js`, `community-event-platform.js`, the `#exp-panel-cep` markup in `index.html`, the `cep-` prefixed rules in `styles.css`, and the three copied images in `assets/community-event-platform/`.
- Being a public repository does not, by itself, grant a license to reuse its content or images. This adaptation is made for an internal prototype under the same product umbrella; before any real public launch, ownership and licensing of the concept, copy, and art should be explicitly confirmed with the source project.
- **Known limitation — asset licensing:** the three daypart images are reference art that the source repository's own code comments describe as supplied by its founder "for direction" and explicitly **not licensed for a public launch** ("needs a real commission or licensed source before shipping"). They have been copied into this repository as-is for prototype fidelity, per an explicit decision to proceed with a documented limitation rather than omit them. **Before any real public launch of this feature, these three images must be replaced with commissioned or properly licensed art**, or removed.

## 4. Public Content Imported or Adapted

Displayed in the WorkJax UI:

- The hero line, "Someone's already making plans for tonight."
- The "third place" explainer paragraph.
- The seven-day "This Week" schedule (all seven traditions from `content/traditions/weekly_schedule.md`), including the Sunday "anchor night" framing for Sunday Jazz.
- A "Today" indicator highlighting whichever tradition matches the visitor's local day.
- A "A peek at what's next" preview card driven by today's tradition.
- A demo-only "I'll Be There" interaction (see [Demo Attendance Behavior](#9-demo-attendance-behavior)).
- The closing line, "The website is not the destination. Jacksonville is."
- A visible verification notice and a labeled `PROPOSED` note about a possible future text-message concept.

## 5. Content Intentionally Not Displayed Publicly

The source repository's internal planning material is **not** reproduced on the public page. It is summarized here only:

- **Product/decision log** (`docs/00_PRODUCT.md`): the source project's v1 product is a two-beat SMS loop (a morning "tonight's plan" text and an afternoon "who's confirmed" text to YES-repliers), with no app and no chat. WorkJax's public page reflects only that a future opt-in text concept is being explored (see §11) — it does not reproduce the decision log, phone-number join flow, or internal reasoning.
- **SMS flow specification** (`docs/01_SMS_FLOWS.md`): join keyword, two daily message beats, inbound-message handling, cancellation flow, season-close/retention flow. None of this is built or exposed; summarized here for institutional context only.
- **Data rules** (`docs/02_DATA.md`): the source project's real design collects only phone number, first name, join date, and a same-day yes/no — nothing else, no attendance history, no exports. This minimal-collection principle is carried forward as the standard any future WorkJax SMS concept must meet (see §12).
- **Operations model** (`docs/03_OPERATIONS.md`): a single named "operator" verifies each tradition's accuracy once and handles rare cancellations; there is no per-night host role. This is why every tradition here defaults to `verificationStatus: "unverified"` — no such verification step has occurred in WorkJax.
- **Discovery-layer concept** (`docs/06_DISCOVERY_LAYER.md`): the source project explicitly considered, and declined to build, a broader citywide event aggregator/feed, to avoid becoming a content treadmill. WorkJax's Community Event Platform likewise stays to the same seven curated traditions — it is not a scraper or aggregator.
- **Design brief** (`docs/08_DESIGN_BRIEF.md`): the emotional arc ("uncertain → welcomed → comfortable → known → belonging") and non-negotiables (no gamification, no infinite feed, no bot-mediated interaction) informed the tone of the adapted copy and the deliberate absence of attendee counts or fabricated names.

## 6. Nested-Tab Behavior

- Implemented with an accessible tabs pattern: `role="tablist"` on the container, `role="tab"` on each button, `role="tabpanel"` on each panel, `aria-selected`, `aria-controls`/`aria-labelledby`, and roving `tabindex` (0 on the active tab, -1 on the inactive one).
- Both tabs are real `<button>` elements — no links with placeholder URLs.
- **Explore Jacksonville is selected by default** the first time the Third Spaces page is initialized in a session. Revisiting the page later in the same session preserves whichever tab the visitor last had open (the tab system initializes once, not on every navigation).
- Supported interaction: mouse click, touch tap, `Enter`/`Space` on a focused tab, and `ArrowLeft`/`ArrowRight` to move focus between tabs (wrapping at the ends) and activate the newly focused tab.
- Visible focus is preserved (`:focus-visible` outline on `.exp-subtab`) — no focus outline is suppressed.

## 7. Data Structure

`community-event-data.js` exposes a frozen (`Object.freeze`, applied to the top-level object, the traditions array, and each tradition record individually) global:

```js
window.COMMUNITY_EVENT_PLATFORM_DATA = {
  title: "Community Event Platform",
  tagline: "Someone's already making plans for tonight.",
  description: "...",
  footer: "The website is not the destination. Jacksonville is.",
  scheduleSource: "content/traditions/weekly_schedule.md (espil77/3rd-Space), adapted",
  lastReviewedAt: "2026-07-14",
  overallVerificationStatus: "unverified",
  traditions: [
    {
      id: "sunday-jazz",
      dayIndex: 0,            // 0=Sun..6=Sat, matches Date.getDay()
      dayLabel: "Sun",
      title: "Sunday Jazz",
      location: "Casbah Cafe",
      time: "starts 9:00pm",
      isAnchor: true,
      verificationStatus: "unverified",
      sourceNote: "Adapted from content/traditions/weekly_schedule.md (espil77/3rd-Space)…"
    }
    // …six more, one per day of the week
  ]
};
```

This dataset is **never merged into `data.js`'s `events` array**. It is read only by `community-event-platform.js`.

## 8. Daypart Behavior

Three time-of-day themes — morning (5:00–10:59), midday (11:00–16:59), evening (all other hours) — are computed from the visitor's local device clock, re-checked every 60 seconds. The `data-daypart` attribute is applied **only to `#cep-shell`**, never to `document.body`; every corresponding CSS custom property and rule is scoped under `.cep-shell[data-daypart="…"]`. No other page or component changes appearance when the daypart changes. The source project's developer-only daypart preview toggle (buttons to force morning/midday/evening for QA) is intentionally not included in this public build.

## 9. Demo Attendance Behavior

The "I'll Be There" control on today's tradition is explicitly a prototype:

- Clicking it writes `{ traditionId, dayIndex, storedAt }` to `localStorage` under the WorkJax-prefixed key `workjax_cep_interest_v1`. Nothing is sent to a server; there is no server.
- It does not contact an organizer or venue, does not add the visitor to any shared or visible attendee list, does not claim other people can see the response, does not display any attendee names (real or fabricated), does not send an SMS, and does not require a profile.
- A visible note sits next to the control: "Prototype note: This response is stored only on this device. It does not notify the venue, organizer, or other users."
- After activating, the visitor sees "You marked yourself as interested on this device." and can click "Undo" to clear the local response.
- This is entirely separate from — and never combined with — the existing Explore Jacksonville RSVP data (`rsvpData` in `app.js`), which is also demo-only but modeled as a shared list of names.

## 10. Verification Limitations

- `overallVerificationStatus` and every individual tradition's `verificationStatus` are `"unverified"`. The source project's own schedule file marks its "Schedule verified" column as `TBD` for all seven traditions, so WorkJax carries the same status forward rather than inventing confirmation.
- A visible, non-alarming notice appears at the top of the panel: "Community platform prototype. Recurring traditions and times have not yet been independently verified by WorkJax. Confirm details with the venue before attending."
- No tradition is labeled "Verified," "Live," or equivalent, and none is described as officially hosted or run by WorkJax — each is presented as an already-existing, independently-run local event that this prototype merely lists.

## 11. SMS Concept as `PROPOSED`

A small, clearly labeled `PROPOSED` note explains that an opt-in text-message loop is being explored as a possible future concept, and that it is not active today — no phone number, SMS signup form, `sms:` link, phone-number collection, attendee-name sharing, SMS automation, or third-party messaging provider is implemented anywhere in this feature. No backend of any kind was added.

## 12. Privacy and Safety Implications

- No personal information is collected by this feature. The only client-side state it writes is the single local "I'll Be There" flag described in §9, scoped to the visitor's own browser.
- If a future SMS concept is ever built, the source material's data-minimization principles should carry forward as hard requirements: collect only phone number, first name, and join date; no attendance history; no export or resale of numbers; deletion on request (`STOP`); and a season-end retention/deletion policy. These are documented here as requirements for any future implementation, not as anything currently built.
- Per WorkJax's existing governance rules (`docs/governance/privacy-and-safety.md`), any future public/shared version of an attendance or messaging feature would need a named privacy and safeguarding owner, minor-safety review, and moderation plan before launch — none of which is in scope for this browser-only prototype.

## 13. Mobile and Accessibility Behavior

- Responsive: the hero image/panel pair stacks to a single column under 640px width; the tab row and shell padding adjust under 520px.
- Full ARIA tabs pattern (see §6) with keyboard support and visible focus.
- All interactive elements are native `<button>` elements (no fake links), and the verification notice, demo note, and future-concept note are all rendered as visible text (not tooltip-only or icon-only).

## 14. Future Path to a Real Community Service

This prototype does not change WorkJax's target-state architecture. If a real, shared version of this concept is pursued, it would need (per `docs/architecture/target-state.md`'s existing principles): a named human operator to verify each tradition's accuracy, a decision on whether/how an SMS loop is built (with the data-minimization rules in §12), a moderation and privacy review before any shared or public attendance data is introduced, and an explicit decision on whether this content is ever merged with WorkJax's existing `events` data model — it is deliberately kept separate today.

## 15. Content Ownership and Maintenance Responsibility

Same as the rest of WorkJax's current-state documentation: no formal content owner is assigned today (see `docs/README.md`'s ownership table). Until an owner is named, changes to `community-event-data.js` should be made by hand, cross-checked against `content/traditions/weekly_schedule.md` in the source repository if that file changes.

## 16. How Schedule Verification Should Be Recorded

When a tradition's day/time/place is actually confirmed with the venue by a named WorkJax owner, update that record's `verificationStatus` to `"verified"` and update `sourceNote` to describe who verified it and when, rather than changing the default silently. Do not change `verificationStatus` based on the source repository alone — that repository's own schedule file has never marked any of these as verified either.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Initial documentation; feature created | WorkJax engineering |
