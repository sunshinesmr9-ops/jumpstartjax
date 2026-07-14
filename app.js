/* ════════════════════════════════════
   APP LOGIC
═══════════════════════════════════ */

/* ════════════════════════════════════
   SAFE FILTERING FOUNDATIONS
   Every current record is dateVerificationStatus: "unverified", so both
   functions return true for all of them today — no visible behavior change
   until a record is verified with a past close/end date.
═══════════════════════════════════ */
function isOpportunityActive(record) {
  if (record.dateVerificationStatus !== 'verified') return true;
  if (record.applicationCloseAt == null) return true;
  return new Date(record.applicationCloseAt) >= new Date();
}

function isEventActive(record) {
  if (record.dateVerificationStatus !== 'verified') return true;
  if (record.endsAt == null) return true;
  return new Date(record.endsAt) >= new Date();
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  const navEl = document.getElementById('nav-' + pageId);
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0, 0);
  closeMobileNav();
  if (pageId === 'opportunities') renderOpportunities();
  if (pageId === 'home') renderHomeFeatured();

  if (pageId === 'experience') { renderEvents(); if (window.CommunityEventPlatform) window.CommunityEventPlatform.initialize(); }
  if (pageId === 'connect') { renderConnectJax(); updateProfileButton(); }
  if (pageId === 'map') ensureMapReady();
}

function toggleMobileNav() {
  document.getElementById('nav-links').classList.toggle('open');
}

function closeMobileNav() {
  document.getElementById('nav-links')?.classList.remove('open');
}

/* ════════════════════════════════════
   BROWSER HISTORY ROUTING
   Lightweight History API routing (no framework, no path-based routes).
   Routes are ?view=<page>[&employer=<id>] on this same static document.
   showPage() and showDetail() remain pure render functions with no history
   side effects; everything below is responsible only for reading/writing
   browser history and calling those render functions. Rendering triggered
   by `popstate` must never call pushState() again, or pressing Back could
   create another entry and loop.
═══════════════════════════════════ */
history.scrollRestoration = 'manual';

const VALID_PAGES = ['home', 'opportunities', 'detail', 'map', 'experience', 'connect'];
const PAGE_TITLES = {
  home: 'Home',
  opportunities: 'Find Opportunities',
  map: 'Employer Map',
  experience: 'Third Spaces',
  connect: 'Community Hub'
};
const HEADING_SELECTORS = {
  home: '#page-home h1',
  opportunities: '#page-opportunities h1',
  detail: '#detail-main h1',
  map: '#page-map h1',
  experience: '#page-experience h1',
  connect: '#page-connect h1'
};
const ORIGIN_LABELS = {
  home: 'Home',
  opportunities: 'Find Opportunities',
  map: 'Employer Map',
  experience: 'Third Spaces',
  connect: 'Community Hub'
};

let navIndex = 0; // our own monotonically increasing history-depth counter (not history.length)

function routeFromLocation() {
  const params = new URLSearchParams(window.location.search);
  let page = params.get('view') || 'home';
  if (!VALID_PAGES.includes(page)) page = 'home';

  let employerId = null;
  if (page === 'detail') {
    const raw = params.get('employer');
    const id = raw != null ? parseInt(raw, 10) : NaN;
    if (!Number.isNaN(id) && employers.some(e => e.id === id)) {
      employerId = id;
    } else {
      page = 'home'; // invalid or missing employer id -> fall back, never throw
    }
  }
  return { page, employerId };
}

function getCurrentRoute() {
  if (history.state && history.state.app === 'jumpstart-jax') return history.state;
  return routeFromLocation();
}

function buildRouteUrl(route) {
  const params = new URLSearchParams(window.location.search); // preserve unrelated params
  params.delete('view');
  params.delete('employer');
  params.set('view', route.page);
  if (route.page === 'detail' && route.employerId != null) {
    params.set('employer', String(route.employerId));
  }
  const qs = params.toString();
  return window.location.pathname + (qs ? '?' + qs : '');
}

function saveScrollToCurrentEntry() {
  if (history.state && history.state.app === 'jumpstart-jax') {
    const updated = { ...history.state, scrollY: window.scrollY };
    history.replaceState(updated, '', buildRouteUrl(updated));
  }
}

// Continuously keeps the active entry's saved scroll position fresh, so
// restoration is accurate whether the user leaves via our own navigation
// functions, the in-page Back button, or the browser's native Back/Forward
// (which give our code no chance to run immediately beforehand).
let scrollSaveTimer = null;
window.addEventListener('scroll', () => {
  if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
  scrollSaveTimer = setTimeout(saveScrollToCurrentEntry, 200);
}, { passive: true });

function pushRoute(route) {
  navIndex++;
  const state = {
    app: 'jumpstart-jax',
    page: route.page,
    employerId: route.employerId != null ? route.employerId : null,
    originPage: route.originPage != null ? route.originPage : null,
    scrollY: 0,
    navIndex
  };
  history.pushState(state, '', buildRouteUrl(state));
  return state;
}

function updateDocumentTitle(route) {
  if (route.page === 'detail' && route.employerId != null) {
    const e = employers.find(x => x.id === route.employerId);
    document.title = (e ? e.name : 'Employer') + ' | Jumpstart Jax';
  } else {
    document.title = (PAGE_TITLES[route.page] || PAGE_TITLES.home) + ' | Jumpstart Jax';
  }
}

function focusMainHeading(pageId) {
  const sel = HEADING_SELECTORS[pageId] || HEADING_SELECTORS.home;
  const heading = document.querySelector(sel);
  if (!heading) return;
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}

function updateDetailBackButton(originPage) {
  const btn = document.getElementById('detail-back-btn');
  if (!btn) return;
  const label = ORIGIN_LABELS[originPage] || ORIGIN_LABELS.opportunities;
  btn.setAttribute('aria-label', 'Back to ' + label);
}

function ensureMapReady() {
  initMap(); // idempotent (mapInitialized guard)
  if (mapInstance) {
    setTimeout(() => mapInstance.invalidateSize(), 0);
  }
}

function renderRoute(route, options = {}) {
  const { restoreScrollY, moveFocus = true } = options;

  if (route.page === 'detail' && route.employerId != null && employers.some(e => e.id === route.employerId)) {
    showDetail(route.employerId);
    updateDetailBackButton(route.originPage);
  } else {
    showPage(route.page !== 'detail' && VALID_PAGES.includes(route.page) ? route.page : 'home');
  }

  updateDocumentTitle(route);

  if (typeof restoreScrollY === 'number') {
    window.scrollTo(0, restoreScrollY);
  }
  if (moveFocus) focusMainHeading(route.page);
}

function navigateToPage(pageId) {
  const current = getCurrentRoute();
  const samePage = current && current.page === pageId;
  if (!samePage) {
    saveScrollToCurrentEntry();
    pushRoute({ page: pageId });
  }
  renderRoute({ page: pageId }, { moveFocus: !samePage });
}

function navigateToEmployer(employerId) {
  const id = Number(employerId);
  if (!employers.some(e => e.id === id)) return;
  const current = getCurrentRoute();
  const originPage = (current && current.page !== 'detail')
    ? current.page
    : ((current && current.originPage) || 'opportunities');
  saveScrollToCurrentEntry();
  pushRoute({ page: 'detail', employerId: id, originPage });
  renderRoute({ page: 'detail', employerId: id, originPage }, { moveFocus: true });
}

function goBackFromDetail() {
  const state = history.state;
  const cameFromInApp = !!state && state.app === 'jumpstart-jax' && state.page === 'detail' && Number(state.navIndex) > 0;
  if (cameFromInApp) {
    history.back();
  } else {
    // Direct/first-loaded detail URL, or no safe prior Jumpstart Jax entry —
    // never leave the site; land on Find Opportunities instead.
    navigateToPage('opportunities');
  }
}

function handlePopState(event) {
  const route = (event.state && event.state.app === 'jumpstart-jax') ? event.state : routeFromLocation();
  navIndex = Number(route.navIndex) || 0;
  renderRoute(route, {
    restoreScrollY: typeof route.scrollY === 'number' ? route.scrollY : undefined,
    moveFocus: false
  });
}

function replaceInitialRoute() {
  const route = routeFromLocation();
  const state = {
    app: 'jumpstart-jax',
    page: route.page,
    employerId: route.employerId != null ? route.employerId : null,
    originPage: null,
    scrollY: 0,
    navIndex: 0
  };
  history.replaceState(state, '', buildRouteUrl(state));
  navIndex = 0;
  renderRoute(state, { moveFocus: false });
}

window.addEventListener('popstate', handlePopState);

/* ════════════════════════════════════
   THIRD SPACES
═══════════════════════════════════ */
function filterEvents(cat) {
  if (cat === 'All') {
    activeEventFilters.clear();
  } else if (activeEventFilters.has(cat)) {
    activeEventFilters.delete(cat);
  } else {
    activeEventFilters.add(cat);
  }
  document.querySelectorAll('.exp-filter-btn').forEach(b => b.classList.remove('active'));
  if (activeEventFilters.size === 0) {
    document.getElementById('exp-filter-all')?.classList.add('active');
  } else {
    activeEventFilters.forEach(c => {
      document.getElementById('exp-filter-' + c)?.classList.add('active');
    });
  }
  renderEvents();
}

function renderEvents() {
  const grid = document.getElementById('exp-grid');
  const countEl = document.getElementById('exp-count');
  if (!grid) return;

  let filtered = events.filter(isEventActive);
  if (activeEventFilters.size > 0) {
    filtered = filtered.filter(e =>
      (activeEventFilters.has('Free') && e.free) ||
      e.categories.some(c => activeEventFilters.has(c))
    );
  }

  countEl.textContent = filtered.length + ' event' + (filtered.length !== 1 ? 's' : '') + ' in Jacksonville';

  if (!filtered.length) {
    grid.innerHTML = '<div class="exp-no-results"><i class="fa-solid fa-calendar-xmark" style="font-size:2rem;color:var(--border);margin-bottom:12px;display:block"></i><p>No events match this filter.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(e => {
    const rsvps = rsvpData[e.id] ? [...rsvpData[e.id]] : [];
    const iGoing = rsvps.includes(myName());
    const othersGoing = rsvps.filter(n => n !== myName());
    const displayNames = othersGoing.slice(0, 4);
    const extra = othersGoing.length > 4 ? othersGoing.length - 4 : 0;

    const avatarHtml = displayNames.map(name => {
      const intern = interns.find(i => i.name === name);
      const color = avatarColor(name);
      return `<div class="rsvp-avatar-sm" style="background:${color}" title="${name}">${initials(name)}</div>`;
    }).join('');

    const rsvpCountText = rsvps.length === 0
      ? 'No RSVPs yet, be first!'
      : iGoing && rsvps.length === 1
        ? 'Just you so far!'
        : `${rsvps.length} intern${rsvps.length !== 1 ? 's' : ''} going`;

    return `
    <div class="event-card" id="event-card-${e.id}">
      <div class="event-card-banner" style="background:${e.color}"></div>
      <div class="event-card-body">
        <div>
          <span class="event-tag" style="background:${e.color}18;color:${e.color}">
            <i class="${e.icon}" style="font-size:0.75rem"></i> ${e.categories.join(' · ')}
          </span>
          ${e.free ? '<span class="event-tag" style="background:#E8F5E9;color:#2E7D32;margin-left:6px"><i class="fa-solid fa-ticket" style="font-size:0.75rem"></i> Free</span>' : ''}
          ${e.recurring ? '<span class="event-tag" style="background:#E3F2FD;color:#1565C0;margin-left:6px"><i class="fa-solid fa-rotate" style="font-size:0.75rem"></i> Recurring</span>' : ''}
        </div>
        <div class="event-title">${e.title}</div>
        <div class="event-meta">
          <div class="event-meta-row"><i class="fa-solid fa-clock"></i>${e.date}</div>
          <div class="event-meta-row"><i class="fa-solid fa-location-dot"></i>${e.location}</div>
        </div>
        <p class="event-desc">${e.description}</p>
      </div>
      <div class="event-card-footer">
        <span class="event-price ${e.free ? 'free' : ''}">${e.price}</span>
        <a href="${e.link}" target="_blank" class="event-link">
          Learn more <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem"></i>
        </a>
      </div>
      <div class="rsvp-bar">
        <div class="prototype-note prototype-note-compact">
          <i class="fa-solid fa-circle-info"></i>
          <span>Prototype note: This RSVP is for demonstration only and does not register you with the event organizer. Use the official event link to register.</span>
        </div>
        <div class="rsvp-bar-row">
          <div style="display:flex;align-items:center;gap:0;">
            ${avatarHtml}
            ${extra ? `<div class="rsvp-avatar-sm" style="background:var(--gray)" title="${extra} more">+${extra}</div>` : ''}
            <span class="rsvp-count-text">${rsvpCountText}</span>
          </div>
          <button class="rsvp-btn ${iGoing ? 'going' : ''}" onclick="toggleRSVP(${e.id})">
            <i class="fa-solid ${iGoing ? 'fa-circle-check' : 'fa-calendar-plus'}"></i>
            ${iGoing ? "Going!" : "RSVP"}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleRSVP(eventId) {
  if (!rsvpData[eventId]) rsvpData[eventId] = new Set();
  const set = rsvpData[eventId];
  if (set.has(myName())) {
    set.delete(myName());
  } else {
    set.add(myName());
    // seed a couple of demo interns as already going on first RSVP
    if (set.size === 1 && eventId % 3 === 0) { set.add("Jordan Kim"); set.add("Aaliyah Johnson"); }
    if (set.size === 1 && eventId % 3 === 1) { set.add("Simone Carter"); }
  }
  renderEvents();
}

/* ════════════════════════════════════
   COMMUNITY HUB
═══════════════════════════════════ */
function renderConnectJax() {
  const grid = document.getElementById('intern-grid');
  const countEl = document.getElementById('connect-count');
  if (!grid) return;

  const q = (document.getElementById('connect-search')?.value || '').toLowerCase();
  const co = document.getElementById('connect-company-filter')?.value || '';
  const type = document.getElementById('connect-type-filter')?.value || '';

  const me = getProfile();
  const allPeople = me
    ? [{ id: 'me', name: me.name, type: me.type || 'College', company: me.company || '', email: '',
         linkedin: me.linkedin || '', school: me.school || '', major: me.major || '',
         interests: me.interests || [], photo: null, isMe: true }, ...interns]
    : interns;

  let filtered = allPeople.filter(i => {
    const matchQ = !q || i.name.toLowerCase().includes(q)
      || i.company.toLowerCase().includes(q)
      || i.interests.some(t => t.toLowerCase().includes(q))
      || i.school.toLowerCase().includes(q);
    const matchCo = !co || i.company === co;
    const matchType = !type || i.type === type;
    return matchQ && matchCo && matchType;
  });

  countEl.textContent = filtered.length + ' student' + (filtered.length !== 1 ? 's' : '') + ' in the Jumpstart Jax network';

  if (!filtered.length) {
    grid.innerHTML = `<div class="connect-empty">
      <i class="fa-solid fa-users-slash" style="font-size:2rem;color:var(--border);display:block;margin-bottom:12px"></i>
      <p>No students match your search.</p>
    </div>`;
    return;
  }

  const companyColor = (company) => {
    const emp = employers.find(e => e.name === company);
    return emp ? (industryColor[emp.industry] || '#01696F') : '#01696F';
  };

  grid.innerHTML = filtered.map(intern => {
    const color = avatarColor(intern.name);
    const co_color = companyColor(intern.company);
    const avatarEl = intern.photo
      ? `<img src="${intern.photo}" alt="${intern.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
      : `<div class="avatar-initials">${initials(intern.name)}</div>`;

    return `
    <div class="intern-card" ${intern.isMe ? 'style="border:2px solid var(--teal);position:relative;"' : ''}>
      ${intern.isMe ? '<span style="position:absolute;top:10px;right:10px;background:var(--teal);color:#fff;font-size:0.68rem;font-weight:700;padding:3px 9px;border-radius:20px;">YOU</span>' : ''}
      <div class="intern-avatar" style="background:${color};">
        ${avatarEl}
      </div>
      <div class="intern-name">${intern.name}</div>
      ${intern.company ? `<span class="intern-company" style="background:${co_color}18;color:${co_color};">
        <i class="fa-solid fa-building" style="font-size:0.7rem"></i> ${intern.company}
      </span>` : ''}
      ${(intern.school || intern.major) ? `<div style="font-size:0.8rem;color:var(--gray);">${[intern.school, intern.major].filter(Boolean).join(' · ')}</div>` : ''}
      ${intern.email ? `<div class="intern-email"><i class="fa-solid fa-envelope"></i>${intern.email}</div>` : ''}
      <div class="intern-interests">
        ${intern.interests.map(t => `<span class="interest-pill">${t}</span>`).join('')}
      </div>
      ${intern.isMe ? `
      <button class="intern-linkedin-btn" onclick="openProfileModal()" style="background:var(--light);color:var(--navy);border:1px solid var(--border);">
        <i class="fa-solid fa-pen"></i> Edit Profile
      </button>` : intern.linkedin ? `
      <a class="intern-linkedin-btn" href="${intern.linkedin}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
        <i class="fa-brands fa-linkedin"></i> View LinkedIn
      </a>` : `
      <button class="intern-linkedin-btn disabled" disabled title="No public profile shared">
        <i class="fa-brands fa-linkedin"></i> Private Profile
      </button>`}
    </div>`;
  }).join('');
}

function closeMsgModal() {
  document.getElementById('msg-modal').classList.remove('open');
}

/* ════════════════════════════════════
   MY PROFILE (stored locally, no account needed)
═══════════════════════════════════ */
function getProfile() {
  try { return JSON.parse(localStorage.getItem('workjax_profile')) || null; }
  catch { return null; }
}

function myName() {
  const p = getProfile();
  return (p && p.name) ? p.name : MY_NAME;
}

function updateProfileButton() {
  const btn = document.getElementById('my-profile-btn');
  if (!btn) return;
  const p = getProfile();
  if (p) {
    btn.classList.add('connected');
    btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${p.name.split(' ')[0]}'s Profile`;
  } else {
    btn.classList.remove('connected');
    btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Create Your Profile`;
  }
}

function openProfileModal() {
  const p = getProfile() || {};
  const oldLinkedin = p.linkedin || localStorage.getItem('workjax_my_linkedin') || '';
  document.getElementById('msg-modal-inner').innerHTML = `
    <div class="modal-header">
      <h3>${p.name ? 'Edit' : 'Create'} Your Profile</h3>
      <button class="modal-close" onclick="closeMsgModal()"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <p style="font-size:0.87rem;color:var(--gray);margin-bottom:16px;line-height:1.5;">
      No password needed, your profile is saved on this device. It appears in the Community Hub directory, links your LinkedIn, and keeps your saved opportunities and RSVPs.
    </p>
    <label class="modal-label">Name *</label>
    <input type="text" class="form-input" id="pf-name" placeholder="Your full name" value="${p.name || ''}" style="width:100%;margin-bottom:10px;" />
    <div style="display:flex;gap:10px;margin-bottom:10px;">
      <div style="flex:1;">
        <label class="modal-label">Student Level</label>
        <select class="form-input" id="pf-type" style="width:100%;">
          <option value="College" ${p.type !== 'High School' ? 'selected' : ''}>College</option>
          <option value="High School" ${p.type === 'High School' ? 'selected' : ''}>High School</option>
        </select>
      </div>
      <div style="flex:2;">
        <label class="modal-label">School</label>
        <input type="text" class="form-input" id="pf-school" placeholder="e.g. University of North Florida" value="${p.school || ''}" style="width:100%;" />
      </div>
    </div>
    <label class="modal-label">Major / Grade</label>
    <input type="text" class="form-input" id="pf-major" placeholder="e.g. Marketing, or 11th Grade" value="${p.major || ''}" style="width:100%;margin-bottom:10px;" />
    <label class="modal-label">Where You're Working (optional)</label>
    <input type="text" class="form-input" id="pf-company" placeholder="e.g. Mayo Clinic Florida" value="${p.company || ''}" style="width:100%;margin-bottom:10px;" />
    <label class="modal-label">Interests (comma-separated)</label>
    <input type="text" class="form-input" id="pf-interests" placeholder="e.g. Healthcare, Photography, Soccer" value="${(p.interests || []).join(', ')}" style="width:100%;margin-bottom:10px;" />
    <label class="modal-label">LinkedIn URL (optional)</label>
    <input type="url" class="form-input" id="pf-linkedin" placeholder="https://www.linkedin.com/in/your-name" value="${oldLinkedin}" style="width:100%;margin-bottom:14px;" />
    <div class="prototype-note" style="margin-bottom:14px;">
      <i class="fa-solid fa-circle-info"></i>
      <span>Prototype note: Profiles created here are stored only in this browser and are not visible to other users.</span>
    </div>
    <div class="modal-actions">
      ${p.name ? `<button class="modal-cancel" onclick="removeProfile()" style="color:#DC2626;border-color:#DC2626;">Delete Profile</button>` : `<button class="modal-cancel" onclick="closeMsgModal()">Cancel</button>`}
      <button class="modal-send" onclick="saveProfile()"><i class="fa-solid fa-user-check" style="margin-right:6px"></i>Save Profile</button>
    </div>`;
  document.getElementById('msg-modal').classList.add('open');
}

function saveProfile() {
  const nameInput = document.getElementById('pf-name');
  const name = nameInput.value.trim();
  if (!name) { nameInput.style.borderColor = '#DC2626'; return; }
  const linkedinInput = document.getElementById('pf-linkedin');
  const linkedin = linkedinInput.value.trim();
  if (linkedin && !linkedin.startsWith('http')) { linkedinInput.style.borderColor = '#DC2626'; return; }
  const profile = {
    name,
    type: document.getElementById('pf-type').value,
    school: document.getElementById('pf-school').value.trim(),
    major: document.getElementById('pf-major').value.trim(),
    company: document.getElementById('pf-company').value.trim(),
    interests: document.getElementById('pf-interests').value.split(',').map(s => s.trim()).filter(Boolean),
    linkedin
  };
  localStorage.setItem('workjax_profile', JSON.stringify(profile));
  updateProfileButton();
  renderConnectJax();
  renderEvents();
  closeMsgModal();
}

function removeProfile() {
  localStorage.removeItem('workjax_profile');
  updateProfileButton();
  renderConnectJax();
  closeMsgModal();
}

/* ════════════════════════════════════
   HOME
═══════════════════════════════════ */
function searchAndGo() {
  const q = document.getElementById('hero-search-input').value;
  document.getElementById('board-search-input').value = q;
  hideAllSuggestions();
  navigateToPage('opportunities');
}

function filterAndGo(industry) {
  // un-check all industry filters, check the selected one
  ['fi-health','fi-tech','fi-fin','fi-gov','fi-eng','fi-non','fi-log','fi-media'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  const map = {Healthcare:'fi-health',Technology:'fi-tech',Finance:'fi-fin',Government:'fi-gov',Engineering:'fi-eng',Nonprofit:'fi-non',Logistics:'fi-log',Media:'fi-media'};
  if (map[industry]) document.getElementById(map[industry]).checked = true;
  navigateToPage('opportunities');
}

function renderHomeFeatured() {
  const container = document.getElementById('home-listings');
  if (!container) return;
  const featured = employers.filter(e => e.isFeatured === true && isOpportunityActive(e)).slice(0, 6);
  container.innerHTML = featured.map(e => oppCardHTML(e, true)).join('');
}

/* ════════════════════════════════════
   OPPORTUNITIES
═══════════════════════════════════ */
function oppCardHTML(e, compact = false) {
  const isSaved = savedOpportunities.has(e.id);
  return `
    <div class="opp-card" onclick="navigateToEmployer(${e.id})">
      <div class="opp-logo">${empLogo(e, '38px', '1.3rem')}</div>
      <div class="opp-body">
        <div class="opp-top">
          <div>
            <div class="opp-title">${e.programs[0]}</div>
            <div class="opp-employer"><i class="fa-solid fa-building" style="font-size:0.7rem"></i>${e.name}</div>
          </div>
          <button class="opp-save ${isSaved ? 'saved' : ''}" onclick="event.stopPropagation();toggleSaveOpportunity(${e.id})">
            <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i> ${isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
        <div class="opp-tags">
          <span class="tag tag-industry">${e.industryLabel || e.industry}</span>
          <span class="tag tag-type">${e.type}</span>
          <span class="tag tag-grade">${e.grade === 'Both' ? 'HS + College' : e.grade}</span>
          <span class="tag ${e.paid?'tag-paid':'tag-unpaid'}">${e.paid?'Paid':'Unpaid'}</span>
        </div>
        <div class="opp-meta">
          <span><i class="fa-solid fa-location-dot" style="color:var(--teal)"></i>${e.location.split(',').slice(1).join(',').trim()}</span>
          <span><i class="fa-regular fa-clock" style="color:var(--gray)"></i>${e.duration}</span>
          <span class="opp-deadline"><i class="fa-solid fa-calendar-xmark"></i>Deadline: ${e.deadline}</span>
        </div>
      </div>
    </div>`;
}

function toggleSaveOpportunity(id) {
  if (savedOpportunities.has(id)) savedOpportunities.delete(id);
  else savedOpportunities.add(id);
  localStorage.setItem('workjax_saved', JSON.stringify([...savedOpportunities]));
  renderOpportunities();
  renderHomeFeatured();
}

function renderOpportunities() {
  const grid = document.getElementById('opp-grid');
  if (!grid) return;
  const searchVal = (document.getElementById('board-search-input')?.value || '').toLowerCase();

  // Student level filters
  const levelFilters = {
    'High School': document.getElementById('f-hs')?.checked,
    'College': document.getElementById('f-col')?.checked,
    'Both': document.getElementById('f-both')?.checked,
  };
  const anyLevelChecked = Object.values(levelFilters).some(Boolean);

  // Opportunity type filters
  const typeFilters = {
    'Internship': document.getElementById('f-intern')?.checked,
    'Job Shadow': document.getElementById('f-shadow')?.checked,
    'Co-op': document.getElementById('f-coop')?.checked,
    'Fellowship': document.getElementById('f-fellow')?.checked,
    'Volunteer': document.getElementById('f-volunteer')?.checked,
    'Apprenticeship': document.getElementById('f-apprentice')?.checked,
  };
  const anyTypeChecked = Object.values(typeFilters).some(Boolean);

  // Industry filters
  const industryFilters = {
    Healthcare: document.getElementById('fi-health')?.checked,
    Technology: document.getElementById('fi-tech')?.checked,
    Finance: document.getElementById('fi-fin')?.checked,
    Government: document.getElementById('fi-gov')?.checked,
    Engineering: document.getElementById('fi-eng')?.checked,
    Nonprofit: document.getElementById('fi-non')?.checked,
    Logistics: document.getElementById('fi-log')?.checked,
    Media: document.getElementById('fi-media')?.checked,
  };
  const anyIndustryChecked = Object.values(industryFilters).some(Boolean);

  // Compensation filters
  const paidChecked = document.getElementById('f-paid')?.checked;
  const unpaidChecked = document.getElementById('f-unpaid')?.checked;
  const anyCompChecked = paidChecked || unpaidChecked;

  let results = employers.filter(e => {
    // structured-date active check (no-op today; every record is unverified)
    if (!isOpportunityActive(e)) return false;
    // search
    if (searchVal && !e.name.toLowerCase().includes(searchVal) &&
        !e.programs.join(' ').toLowerCase().includes(searchVal) &&
        !e.industry.toLowerCase().includes(searchVal)) return false;
    // student level
    if (anyLevelChecked && !levelFilters[e.grade]) return false;
    // opportunity type
    if (anyTypeChecked && !typeFilters[e.type]) return false;
    // industry
    if (anyIndustryChecked && !industryFilters[e.industry]) return false;
    // compensation
    if (anyCompChecked) {
      const matchesPaid = paidChecked && e.paid;
      const matchesUnpaid = unpaidChecked && !e.paid;
      if (!matchesPaid && !matchesUnpaid) return false;
    }
    return true;
  });

  // Sorting
  const sortMode = document.getElementById('results-sort')?.value || 'featured';
  if (sortMode === 'featured') {
    results = [...results].sort((a, b) => (b.isFeatured === true) - (a.isFeatured === true));
  } else if (sortMode === 'alpha') {
    results = [...results].sort((a, b) => a.programs[0].localeCompare(b.programs[0]));
  } else if (sortMode === 'deadline') {
    results = [...results].sort((a, b) => deadlineSortKey(a.deadline) - deadlineSortKey(b.deadline));
  }

  document.getElementById('results-count').innerHTML =
    `Showing <strong>${results.length}</strong> of ${employers.length} opportunities`;

  if (!results.length) {
    grid.innerHTML = `<div class="exp-no-results" style="padding:48px 20px;text-align:center;">
      <i class="fa-solid fa-magnifying-glass" style="font-size:2rem;color:var(--border);margin-bottom:12px;display:block"></i>
      <p style="color:var(--gray);margin-bottom:16px;">No opportunities match your search and filters.</p>
      <button class="btn-primary" onclick="clearAllFilters()">Clear All Filters</button>
    </div>`;
    return;
  }

  grid.innerHTML = results.map(e => oppCardHTML(e)).join('');
}

function clearAllFilters() {
  const searchInput = document.getElementById('board-search-input');
  if (searchInput) searchInput.value = '';
  ['f-hs','f-col','f-both','f-intern','f-shadow','f-coop','f-fellow','f-volunteer','f-apprentice'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  });
  ['fi-health','fi-tech','fi-fin','fi-gov','fi-eng','fi-non','fi-log','fi-media','f-paid','f-unpaid'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  renderOpportunities();
}

// Parses "close Jan 31", "Applications open Dec 1, close Feb 15", etc.
// Dated deadlines sort by days until they next occur; rolling/undated sort last.
function deadlineSortKey(str) {
  const months = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
  const matches = [...str.matchAll(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})/gi)];
  if (!matches.length) return 10000;
  const m = matches[matches.length - 1]; // last date mentioned = closing date
  const now = new Date();
  let d = new Date(now.getFullYear(), months[m[1].slice(0,3).toLowerCase()], parseInt(m[2]));
  if (d < now) d.setFullYear(d.getFullYear() + 1);
  return Math.round((d - now) / 86400000);
}


/* ════════════════════════════════════
   DETAIL PAGE
═══════════════════════════════════ */
function showDetail(id) {
  const e = employers.find(x => x.id === id);
  if (!e) return;

  const liveSource = getLiveOpportunitySource(e);

  document.getElementById('detail-main').innerHTML = `
    <div class="detail-hero">
      <div class="detail-logo-row">
        <div class="detail-logo">${empLogo(e, '52px', '2rem')}</div>
        <div class="detail-employer-info">
          <h1>${e.programs[0]}</h1>
          <div class="detail-employer-name">${e.name}</div>
        </div>
      </div>
      <div class="detail-tags">
        <span class="tag tag-industry">${e.industryLabel || e.industry}</span>
        <span class="tag tag-type">${e.type}</span>
        <span class="tag tag-grade">${e.grade === 'Both' ? 'HS + College' : e.grade}</span>
        <span class="tag ${e.paid?'tag-paid':'tag-unpaid'}">${e.paid?'Paid':'Unpaid'}</span>
      </div>
      <div class="detail-desc">${e.description}</div>

      <div class="detail-section">
        <h3>Requirements</h3>
        <ul>${e.requirements.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>

      ${e.programs.length > 1 ? `
      <div class="detail-section">
        <h3>Available Programs at ${e.name}</h3>
        <ul>${e.programs.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>` : ''}

      ${liveSource ? liveOpportunitySectionHTML(e, liveSource) : ''}
    </div>

  `;

  document.getElementById('detail-sidebar').innerHTML = `
    <div class="card">
      <h3>Program Details</h3>
      <div class="info-row"><span class="info-label">Duration</span><span class="info-val">${e.duration}</span></div>
      <div class="info-row"><span class="info-label">Application Deadline</span><span class="info-val" style="color:var(--orange)">${e.deadline}</span></div>
      <div class="info-row"><span class="info-label">Compensation</span><span class="info-val">${e.paid ? '<i class="fa-solid fa-circle-check" style="color:#2E7D32;margin-right:4px"></i>Paid' : 'Unpaid / Credit'}</span></div>
      <div class="info-row"><span class="info-label">Student Level</span><span class="info-val">${e.grade === 'Both' ? 'HS + College' : e.grade}</span></div>
      ${e.internshipUrl ? `
      <hr class="divider">
      <a href="${e.internshipUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 0;border-radius:8px;background:var(--teal);color:#fff;font-weight:700;font-size:0.88rem;text-decoration:none;margin-top:4px">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Apply Directly at ${e.name}
      </a>
      <p style="font-size:0.74rem;color:var(--gray);text-align:center;margin-top:6px">Opens official careers portal</p>` : ''}
    </div>

    <div class="card">
      <h3>Location</h3>
      <p style="font-size:0.85rem;color:var(--gray);line-height:1.5"><i class="fa-solid fa-location-dot" style="color:var(--teal);margin-right:6px"></i>${e.location}</p>
      <a onclick="navigateToPage('map');setTimeout(()=>focusEmployer(${id}),500)" style="color:var(--teal);font-size:0.82rem;font-weight:600;cursor:pointer;display:block;margin-top:8px">View on Map →</a>
    </div>

    <div class="card">
      <h3>About ${e.name}</h3>
      <p style="font-size:0.82rem;color:var(--gray);line-height:1.5">Northeast Florida employer offering ${e.type.toLowerCase()} opportunities in the ${e.industry} sector.</p>
    </div>
  `;

  if (liveSource) {
    renderLiveOpportunitySection(e, liveSource);
  }

  showPage('detail');
}


/* ════════════════════════════════════
   LIVE EMPLOYER OPPORTUNITY FEEDS
   Reusable frontend for the employer-feed registry
   (live-opportunity-sources.js, docs/integrations/employer-feed-registry.md).
   A live feed is fetched only when an enabled registry entry matches the
   employer being viewed, and only when that employer's existing detail
   page is opened — never on load, never for any other employer, never
   while rendering the directory, homepage, or map. A successful response
   is cached for the rest of this browser page session so reopening the
   same detail page does not re-fetch. This does not add a new employer
   record or card; it only augments an existing, curated detail page.
═══════════════════════════════════ */
const liveOpportunityCache = new Map();    // endpoint -> successful { source, employer, generatedAt, count, jobs } payload
const liveOpportunityRequests = new Map(); // endpoint -> in-flight fetch promise, dedupes concurrent opens

function getLiveOpportunitySource(employer) {
  const registry = Array.isArray(window.LIVE_OPPORTUNITY_SOURCES) ? window.LIVE_OPPORTUNITY_SOURCES : [];
  return registry.find(entry => entry.employerId === employer.id && entry.enabled === true) || null;
}

function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fetchLiveOpportunities(source) {
  const key = source.endpoint;
  if (liveOpportunityCache.has(key)) {
    return Promise.resolve({ ok: true, payload: liveOpportunityCache.get(key) });
  }
  if (!liveOpportunityRequests.has(key)) {
    const request = fetch(source.endpoint)
      .then(res => {
        if (!res.ok) throw new Error('live opportunity feed request failed');
        return res.json();
      })
      .then(payload => {
        liveOpportunityCache.set(key, payload); // only a successful response is cached
        return { ok: true, payload };
      })
      .catch(() => ({ ok: false, payload: null }))
      .finally(() => { liveOpportunityRequests.delete(key); });
    liveOpportunityRequests.set(key, request);
  }
  return liveOpportunityRequests.get(key);
}

function formatSalaryRange(range) {
  if (!range || typeof range !== 'object') return '';
  const currency = typeof range.currency === 'string' ? range.currency : '';
  const min = typeof range.min === 'number' ? range.min : null;
  const max = typeof range.max === 'number' ? range.max : null;
  if (min == null && max == null) return '';
  if (min != null && max != null && min !== max) {
    return `${currency} ${min.toLocaleString()}–${max.toLocaleString()}`.trim();
  }
  return `${currency} ${(min != null ? min : max).toLocaleString()}`.trim();
}

function liveOpportunityLoadingHTML(employer, source) {
  return `<div class="prototype-note live-opp-status">
    <i class="fa-solid fa-spinner fa-spin"></i>
    <span>Checking for current opportunities from ${escapeHtml(employer.name)}…</span>
  </div>`;
}

function liveOpportunityErrorHTML(employer, source) {
  return `<div class="prototype-note live-opp-status live-opp-status-error">
    <i class="fa-solid fa-triangle-exclamation"></i>
    <span>Live opportunities from ${escapeHtml(employer.name)} are temporarily unavailable. The program details above reflect Jumpstart Jax's curated information.</span>
  </div>`;
}

function liveOpportunityEmptyHTML(employer, source) {
  return `<div class="prototype-note live-opp-status">
    <i class="fa-solid fa-circle-info"></i>
    <span>No current matching opportunities were found on ${escapeHtml(employer.name)}'s official careers feed right now. Use the "Apply Directly at ${escapeHtml(employer.name)}" link for their full careers site.</span>
  </div>`;
}

function programStatusLabel(status) {
  if (status === 'open') return 'Applications open';
  if (status === 'closed') return 'Applications closed';
  return 'Status not currently confirmed';
}

function programStatusClass(status) {
  if (status === 'open') return 'live-opp-program-status-open';
  if (status === 'closed') return 'live-opp-program-status-closed';
  return 'live-opp-program-status-unknown';
}

// Generic renderer for any postingKind: "official_program" record — driven
// entirely by the registry entry and the fields the endpoint returns, not by
// any employer-specific logic. See docs/integrations/employer-feed-registry.md.
function liveOpportunityProgramCardHTML(job, employer, source) {
  const lastVerified = job.lastVerifiedAt ? new Date(job.lastVerifiedAt).toLocaleDateString() : null;
  const applicationHref = typeof job.applicationUrl === 'string' && /^https?:\/\//i.test(job.applicationUrl)
    ? job.applicationUrl
    : null;
  const externalHref = typeof job.externalUrl === 'string' && /^https?:\/\//i.test(job.externalUrl)
    ? job.externalUrl
    : null;
  const canApplyOfficially = job.programStatus === 'open' && applicationHref;
  const actionHref = applicationHref || externalHref;
  const actionLabel = canApplyOfficially ? 'Apply on Official Site' : 'View Official Program';

  const metaItems = [
    job.opportunityType ? `<span><i class="fa-solid fa-tag"></i>${escapeHtml(job.opportunityType)}</span>` : '',
    job.studentLevel ? `<span><i class="fa-solid fa-graduation-cap"></i>${escapeHtml(job.studentLevel)}</span>` : '',
    job.paid === true ? `<span><i class="fa-solid fa-sack-dollar"></i>Paid</span>` : '',
    job.location ? `<span><i class="fa-solid fa-location-dot"></i>${escapeHtml(job.location)}</span>` : '',
  ].filter(Boolean).join('');

  const areas = Array.isArray(job.programAreas) ? job.programAreas.filter(a => typeof a === 'string' && a.trim()) : [];
  const areasHTML = areas.length ? `
    <details class="live-opp-areas-details">
      <summary>Explore internship areas</summary>
      <div class="live-opp-areas">${areas.map(a => `<span class="live-opp-area-pill">${escapeHtml(a)}</span>`).join('')}</div>
    </details>` : '';

  return `
  <div class="live-opp-card">
    <div class="live-opp-card-top">
      <span class="live-opp-badge"><i class="fa-solid fa-satellite-dish"></i> ${escapeHtml(source.sourceLabel)}</span>
    </div>
    <div class="live-opp-title">${escapeHtml(job.title) || 'Official internship program'}</div>
    <div class="live-opp-program-status ${programStatusClass(job.programStatus)}">
      <i class="fa-solid fa-circle-info"></i> ${escapeHtml(programStatusLabel(job.programStatus))}
    </div>
    ${metaItems ? `<div class="live-opp-meta">${metaItems}</div>` : ''}
    ${lastVerified ? `<div class="live-opp-verified">Last verified ${escapeHtml(lastVerified)}</div>` : ''}
    ${areasHTML}
    ${actionHref ? `<a href="${actionHref}" target="_blank" rel="noopener" class="live-opp-apply">
      ${escapeHtml(actionLabel)} <i class="fa-solid fa-arrow-up-right-from-square"></i>
    </a>` : ''}
  </div>`;
}

function liveOpportunityCardHTML(job, employer, source) {
  const isNetwork = job.postingKind === 'talent_network';
  const lastVerified = job.lastVerifiedAt ? new Date(job.lastVerifiedAt).toLocaleDateString() : null;
  const salaryText = formatSalaryRange(job.salaryRange);
  const applyHref = typeof job.applicationUrl === 'string' && /^https?:\/\//i.test(job.applicationUrl)
    ? job.applicationUrl
    : null;

  const metaItems = [
    job.opportunityType ? `<span><i class="fa-solid fa-tag"></i>${escapeHtml(job.opportunityType)}</span>` : '',
    job.location ? `<span><i class="fa-solid fa-location-dot"></i>${escapeHtml(job.location)}</span>` : '',
    job.workplaceType ? `<span><i class="fa-solid fa-building"></i>${escapeHtml(job.workplaceType)}</span>` : '',
    job.commitment ? `<span><i class="fa-regular fa-clock"></i>${escapeHtml(job.commitment)}</span>` : '',
    salaryText ? `<span><i class="fa-solid fa-sack-dollar"></i>${escapeHtml(salaryText)}</span>` : '',
  ].filter(Boolean).join('');

  return `
  <div class="live-opp-card ${isNetwork ? 'live-opp-card-network' : ''}">
    <div class="live-opp-card-top">
      <span class="live-opp-badge"><i class="fa-solid fa-satellite-dish"></i> ${escapeHtml(source.sourceLabel)}</span>
      ${isNetwork ? '<span class="live-opp-network-tag">Talent Network</span>' : ''}
    </div>
    <div class="live-opp-title">${escapeHtml(job.title) || 'Untitled posting'}</div>
    ${isNetwork ? `<p class="live-opp-network-note">This is a recruitment-interest network, not a currently open job.</p>` : ''}
    ${metaItems ? `<div class="live-opp-meta">${metaItems}</div>` : ''}
    ${lastVerified ? `<div class="live-opp-verified">Last verified ${escapeHtml(lastVerified)}</div>` : ''}
    ${applyHref ? `<a href="${applyHref}" target="_blank" rel="noopener" class="live-opp-apply">
      ${isNetwork ? 'Join Talent Network' : 'Apply Officially'} <i class="fa-solid fa-arrow-up-right-from-square"></i>
    </a>` : ''}
  </div>`;
}

function liveOpportunityResultsHTML(payload, employer, source) {
  const jobs = Array.isArray(payload && payload.jobs) ? payload.jobs : [];
  if (!jobs.length) return liveOpportunityEmptyHTML(employer, source);

  const programRecords = jobs.filter(j => j.postingKind === 'official_program');
  const openJobs = jobs.filter(j => j.postingKind === 'open_opportunity');
  const networkJobs = jobs.filter(j => j.postingKind === 'talent_network');

  if (!programRecords.length && !openJobs.length && !networkJobs.length) return liveOpportunityEmptyHTML(employer, source);

  let html = '';
  if (programRecords.length) {
    html += `<div class="live-opp-group">${programRecords.map(job => liveOpportunityProgramCardHTML(job, employer, source)).join('')}</div>`;
  }
  if (openJobs.length) {
    html += `<div class="live-opp-group">${openJobs.map(job => liveOpportunityCardHTML(job, employer, source)).join('')}</div>`;
  }
  if (networkJobs.length) {
    html += `
    <div class="live-opp-network-group">
      <h4><i class="fa-solid fa-user-group"></i> Talent Network</h4>
      <p class="live-opp-network-group-note">These are recruitment-interest signups, not confirmed open positions.</p>
      ${networkJobs.map(job => liveOpportunityCardHTML(job, employer, source)).join('')}
    </div>`;
  }
  return html;
}

function liveOpportunitySectionHTML(employer, source) {
  const heading = source.sectionTitle
    ? escapeHtml(source.sectionTitle)
    : `Current opportunities from ${escapeHtml(employer.name)}`;
  return `
  <div class="detail-section live-opp-section">
    <h3>${heading}</h3>
    <div id="live-opportunities-${employer.id}">${liveOpportunityLoadingHTML(employer, source)}</div>
  </div>`;
}

async function renderLiveOpportunitySection(employer, source) {
  const result = await fetchLiveOpportunities(source);
  // The user may have navigated to a different page while the fetch was in
  // flight; only touch the DOM if this employer's container still exists.
  const container = document.getElementById('live-opportunities-' + employer.id);
  if (!container) return;
  container.innerHTML = result.ok
    ? liveOpportunityResultsHTML(result.payload, employer, source)
    : liveOpportunityErrorHTML(employer, source);
}


/* ════════════════════════════════════
   MAP
═══════════════════════════════════ */
let mapInitialized = false;
let mapInstance = null;

function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  mapInstance = L.map('map').setView([30.3322, -81.6057], 11);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mapInstance);

  const markers = {};

  employers.forEach(e => {
    const markerColor = industryColor[e.industry] || '#01696F';
    const markerInner = e.logo
      ? `<img src="${e.logo}" style="width:28px;height:28px;object-fit:contain;border-radius:3px;"
           onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
         <i class="${e.icon}" style="color:${markerColor};font-size:1.1rem;display:none;"></i>`
      : `<i class="${e.icon}" style="color:${markerColor};font-size:1.1rem;"></i>`;
    const icon = L.divIcon({
      html: `<div style="
        width:46px;height:46px;border-radius:50%;
        background:white;border:3px solid ${markerColor};
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 3px 12px rgba(0,0,0,0.3);cursor:pointer;overflow:hidden;
      ">${markerInner}</div>`,
      className: '', iconSize: [46, 46], iconAnchor: [23, 23]
    });

    const marker = L.marker([e.lat, e.lng], { icon }).addTo(mapInstance);
    markers[e.id] = marker;

    marker.bindPopup(`
      <div class="popup-inner">
        <div class="popup-logo">${empLogo(e, '40px', '1.8rem')}</div>
        <div class="popup-name">${e.name}</div>
        <div class="popup-cat">${e.industry} · ${e.type}</div>
        <div class="popup-desc">${e.programs.join(', ')}</div>
        <button class="popup-btn" onclick="navigateToEmployer(${e.id})">View Programs →</button>
      </div>
    `, { maxWidth: 240 });
  });

  window._mapMarkers = markers;

  // Sidebar list
  const list = document.getElementById('map-employer-list');
  list.innerHTML = employers.map(e => `
    <div class="map-emp-card" id="mec-${e.id}" onclick="focusEmployer(${e.id})">
      <div class="map-emp-top">
        <div class="map-emp-icon">${empLogo(e, '28px', '1.2rem')}</div>
        <div>
          <div class="map-emp-name">${e.name}</div>
          <div class="map-emp-cat">${e.industry}</div>
        </div>
      </div>
      <div class="map-emp-detail">${e.location}<br>${e.programs.length} program${e.programs.length>1?'s':''} · ${e.type}</div>
      <span class="map-emp-link" onclick="event.stopPropagation();navigateToEmployer(${e.id})">View Programs →</span>
    </div>
  `).join('');
}

function focusEmployer(id) {
  const e = employers.find(x => x.id === id);
  if (!e || !mapInstance) return;
  mapInstance.setView([e.lat, e.lng], 14, { animate: true });
  if (window._mapMarkers && window._mapMarkers[id]) {
    window._mapMarkers[id].openPopup();
  }
  document.querySelectorAll('.map-emp-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById('mec-' + id);
  if (card) {
    card.classList.add('active');
    const list = document.getElementById('map-employer-list');
    if (list) list.scrollTop = card.offsetTop - list.offsetTop - 12;
  }
}


/* ════════════════════════════════════
   INIT
═══════════════════════════════════ */
const savedOpportunities = new Set((() => {
  try { return JSON.parse(localStorage.getItem('workjax_saved')) || []; }
  catch { return []; }
})());

// Fill home-page stats and category counts from real data
function fillHomeCounts() {
  const programCount = employers.reduce((n, e) => n + e.programs.length, 0);
  const industries = new Set(employers.map(e => e.industry));
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-employers', employers.length);
  set('stat-opps', programCount + '+');
  set('stat-industries', industries.size);
  document.querySelectorAll('[data-cat-count]').forEach(span => {
    const ind = span.getAttribute('data-cat-count');
    const n = employers.filter(e => e.industry === ind).reduce((s, e) => s + e.programs.length, 0);
    span.textContent = n + ' opportunit' + (n === 1 ? 'y' : 'ies');
  });
  set('count-hs', employers.filter(e => e.grade === 'High School').length);
  set('count-col', employers.filter(e => e.grade === 'College').length);
  set('count-both', employers.filter(e => e.grade === 'Both').length);
}
fillHomeCounts();
renderHomeFeatured();
replaceInitialRoute();

/* ════════════════════════════════════
   SEARCH SUGGESTIONS
═══════════════════════════════════ */
let activeSuggestIndex = -1;

function getSearchMatches(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return employers.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.industry.toLowerCase().includes(q) ||
    e.programs.join(' ').toLowerCase().includes(q)
  ).slice(0, 6);
}

function showSuggestions(scope) {
  const inputId = scope === 'hero' ? 'hero-search-input' : 'board-search-input';
  const suggestId = scope === 'hero' ? 'hero-suggest' : 'board-suggest';
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestId);
  if (!input || !box) return;
  activeSuggestIndex = -1;

  const query = input.value;
  if (!query.trim()) { box.classList.remove('open'); box.innerHTML = ''; return; }

  const matches = getSearchMatches(query);
  if (!matches.length) {
    box.innerHTML = `<div class="search-suggest-empty">No matches for "${query}"</div>`;
    box.classList.add('open');
    return;
  }

  box.innerHTML = matches.map(e => `
    <div class="search-suggest-item" onmousedown="goToSuggestion(${e.id})">
      <div class="search-suggest-icon">${empLogo(e, '26px', '1rem')}</div>
      <div>
        <div class="search-suggest-name">${e.programs[0]}</div>
        <div class="search-suggest-sub">${e.name} · ${e.industry}</div>
      </div>
    </div>`).join('');
  box.classList.add('open');
}

function goToSuggestion(id) {
  hideAllSuggestions();
  navigateToEmployer(id);
}

function hideAllSuggestions() {
  ['hero-suggest', 'board-suggest'].forEach(id => {
    const box = document.getElementById(id);
    if (box) { box.classList.remove('open'); box.innerHTML = ''; }
  });
}

function searchKeydown(evt, scope) {
  const suggestId = scope === 'hero' ? 'hero-suggest' : 'board-suggest';
  const box = document.getElementById(suggestId);
  if (!box || !box.classList.contains('open')) {
    if (evt.key === 'Enter' && scope === 'hero') searchAndGo();
    return;
  }
  const items = [...box.querySelectorAll('.search-suggest-item')];
  if (evt.key === 'ArrowDown') {
    evt.preventDefault();
    activeSuggestIndex = Math.min(activeSuggestIndex + 1, items.length - 1);
  } else if (evt.key === 'ArrowUp') {
    evt.preventDefault();
    activeSuggestIndex = Math.max(activeSuggestIndex - 1, 0);
  } else if (evt.key === 'Enter') {
    if (activeSuggestIndex >= 0 && items[activeSuggestIndex]) {
      evt.preventDefault();
      items[activeSuggestIndex].dispatchEvent(new Event('mousedown'));
      return;
    } else if (scope === 'hero') {
      searchAndGo();
    }
    hideAllSuggestions();
    return;
  } else if (evt.key === 'Escape') {
    hideAllSuggestions();
    return;
  } else {
    return;
  }
  items.forEach((it, i) => it.classList.toggle('active', i === activeSuggestIndex));
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.hero-search') && !e.target.closest('.board-search-row')) {
    hideAllSuggestions();
  }
});
