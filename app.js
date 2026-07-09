/* ════════════════════════════════════
   APP LOGIC
═══════════════════════════════════ */
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

  if (pageId === 'experience') renderEvents();
  if (pageId === 'connect') { renderConnectJax(); updateMyLinkedInButton(); }
}

function toggleMobileNav() {
  document.getElementById('nav-links').classList.toggle('open');
}

function closeMobileNav() {
  document.getElementById('nav-links')?.classList.remove('open');
}

/* ════════════════════════════════════
   EXPERIENCEJAX
═══════════════════════════════════ */
function filterEvents(cat) {
  currentEventFilter = cat;
  document.querySelectorAll('.exp-filter-btn').forEach(b => b.classList.remove('active'));
  const id = cat === 'All' ? 'exp-filter-all' : 'exp-filter-' + cat;
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  renderEvents();
}

function renderEvents() {
  const grid = document.getElementById('exp-grid');
  const countEl = document.getElementById('exp-count');
  if (!grid) return;

  let filtered = events;
  if (currentEventFilter === 'Free') {
    filtered = events.filter(e => e.free);
  } else if (currentEventFilter !== 'All') {
    filtered = events.filter(e => e.category === currentEventFilter);
  }

  countEl.textContent = filtered.length + ' event' + (filtered.length !== 1 ? 's' : '') + ' in Jacksonville';

  if (!filtered.length) {
    grid.innerHTML = '<div class="exp-no-results"><i class="fa-solid fa-calendar-xmark" style="font-size:2rem;color:var(--border);margin-bottom:12px;display:block"></i><p>No events match this filter.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(e => {
    const rsvps = rsvpData[e.id] ? [...rsvpData[e.id]] : [];
    const iGoing = rsvps.includes(MY_NAME);
    const othersGoing = rsvps.filter(n => n !== MY_NAME);
    const displayNames = othersGoing.slice(0, 4);
    const extra = othersGoing.length > 4 ? othersGoing.length - 4 : 0;

    const avatarHtml = displayNames.map(name => {
      const intern = interns.find(i => i.name === name);
      const color = avatarColor(name);
      return `<div class="rsvp-avatar-sm" style="background:${color}" title="${name}">${initials(name)}</div>`;
    }).join('');

    const rsvpCountText = rsvps.length === 0
      ? 'No RSVPs yet — be first!'
      : iGoing && rsvps.length === 1
        ? 'Just you so far!'
        : `${rsvps.length} intern${rsvps.length !== 1 ? 's' : ''} going`;

    return `
    <div class="event-card" id="event-card-${e.id}">
      <div class="event-card-banner" style="background:${e.color}"></div>
      <div class="event-card-body">
        <div>
          <span class="event-tag" style="background:${e.color}18;color:${e.color}">
            <i class="${e.icon}" style="font-size:0.75rem"></i> ${e.category}
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
    </div>`;
  }).join('');
}

function toggleRSVP(eventId) {
  if (!rsvpData[eventId]) rsvpData[eventId] = new Set();
  const set = rsvpData[eventId];
  if (set.has(MY_NAME)) {
    set.delete(MY_NAME);
  } else {
    set.add(MY_NAME);
    // seed a couple of demo interns as already going on first RSVP
    if (set.size === 1 && eventId % 3 === 0) { set.add("Jordan Kim"); set.add("Aaliyah Johnson"); }
    if (set.size === 1 && eventId % 3 === 1) { set.add("Simone Carter"); }
  }
  renderEvents();
}

/* ════════════════════════════════════
   CONNECTJAX
═══════════════════════════════════ */
function renderConnectJax() {
  const grid = document.getElementById('intern-grid');
  const countEl = document.getElementById('connect-count');
  if (!grid) return;

  const q = (document.getElementById('connect-search')?.value || '').toLowerCase();
  const co = document.getElementById('connect-company-filter')?.value || '';
  const type = document.getElementById('connect-type-filter')?.value || '';

  let filtered = interns.filter(i => {
    const matchQ = !q || i.name.toLowerCase().includes(q)
      || i.company.toLowerCase().includes(q)
      || i.interests.some(t => t.toLowerCase().includes(q))
      || i.school.toLowerCase().includes(q);
    const matchCo = !co || i.company === co;
    const matchType = !type || i.type === type;
    return matchQ && matchCo && matchType;
  });

  countEl.textContent = filtered.length + ' intern' + (filtered.length !== 1 ? 's' : '') + ' in the WorkJax network';

  if (!filtered.length) {
    grid.innerHTML = `<div class="connect-empty">
      <i class="fa-solid fa-users-slash" style="font-size:2rem;color:var(--border);display:block;margin-bottom:12px"></i>
      <p>No interns match your search.</p>
    </div>`;
    return;
  }

  const companyColor = (company) => {
    const emp = employers.find(e => e.name === company);
    return emp ? (industryColor[emp.industry] || '#0D2F6B') : '#0D2F6B';
  };

  grid.innerHTML = filtered.map(intern => {
    const color = avatarColor(intern.name);
    const co_color = companyColor(intern.company);
    const avatarEl = intern.photo
      ? `<img src="${intern.photo}" alt="${intern.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
      : `<div class="avatar-initials">${initials(intern.name)}</div>`;

    return `
    <div class="intern-card">
      <div class="intern-avatar" style="background:${color};">
        ${avatarEl}
      </div>
      <div class="intern-name">${intern.name}</div>
      <span class="intern-company" style="background:${co_color}18;color:${co_color};">
        <i class="fa-solid fa-building" style="font-size:0.7rem"></i> ${intern.company}
      </span>
      <div style="font-size:0.8rem;color:var(--gray);">${intern.school} · ${intern.major}</div>
      <div class="intern-email"><i class="fa-solid fa-envelope"></i>${intern.email}</div>
      <div class="intern-interests">
        ${intern.interests.map(t => `<span class="interest-pill">${t}</span>`).join('')}
      </div>
      ${intern.linkedin ? `
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
   MY LINKEDIN (self profile link)
═══════════════════════════════════ */
function getMyLinkedIn() {
  return localStorage.getItem('workjax_my_linkedin') || '';
}

function updateMyLinkedInButton() {
  const btn = document.getElementById('my-linkedin-btn');
  if (!btn) return;
  const url = getMyLinkedIn();
  if (url) {
    btn.classList.add('connected');
    btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> LinkedIn Connected`;
  } else {
    btn.classList.remove('connected');
    btn.innerHTML = `<i class="fa-brands fa-linkedin"></i> Connect Your LinkedIn`;
  }
}

function openMyLinkedInModal() {
  const existing = getMyLinkedIn();
  document.getElementById('msg-modal-inner').innerHTML = `
    <div class="modal-header">
      <h3>${existing ? 'Update' : 'Connect'} Your LinkedIn</h3>
      <button class="modal-close" onclick="closeMsgModal()"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <p style="font-size:0.87rem;color:var(--gray);margin-bottom:16px;line-height:1.5;">
      Add your LinkedIn profile so other interns in the WorkJax network can connect with you directly.
    </p>
    <label class="modal-label">Your LinkedIn URL</label>
    <input type="url" class="form-input" id="my-linkedin-input" placeholder="https://www.linkedin.com/in/your-name" value="${existing}" style="width:100%;margin-bottom:4px;" />
    <div class="modal-actions">
      ${existing ? `<button class="modal-cancel" onclick="removeMyLinkedIn()" style="color:#DC2626;border-color:#DC2626;">Remove</button>` : `<button class="modal-cancel" onclick="closeMsgModal()">Cancel</button>`}
      <button class="modal-send" onclick="saveMyLinkedIn()" style="background:#0A66C2;"><i class="fa-brands fa-linkedin" style="margin-right:6px"></i>Save</button>
    </div>`;
  document.getElementById('msg-modal').classList.add('open');
}

function saveMyLinkedIn() {
  const input = document.getElementById('my-linkedin-input');
  const url = input.value.trim();
  if (url && !url.startsWith('http')) { input.style.borderColor = '#DC2626'; return; }
  if (url) localStorage.setItem('workjax_my_linkedin', url);
  else localStorage.removeItem('workjax_my_linkedin');
  updateMyLinkedInButton();
  closeMsgModal();
}

function removeMyLinkedIn() {
  localStorage.removeItem('workjax_my_linkedin');
  updateMyLinkedInButton();
  closeMsgModal();
}

/* ════════════════════════════════════
   HOME
═══════════════════════════════════ */
function searchAndGo() {
  const q = document.getElementById('hero-search-input').value;
  document.getElementById('board-search-input').value = q;
  hideAllSuggestions();
  showPage('opportunities');
}

function filterAndGo(industry) {
  // un-check all industry filters, check the selected one
  ['fi-health','fi-tech','fi-fin','fi-gov','fi-eng','fi-non'].forEach(id => {
    document.getElementById(id).checked = false;
  });
  const map = {Healthcare:'fi-health',Technology:'fi-tech',Finance:'fi-fin',Government:'fi-gov',Engineering:'fi-eng',Nonprofit:'fi-non'};
  if (map[industry]) document.getElementById(map[industry]).checked = true;
  showPage('opportunities');
}

function renderHomeFeatured() {
  const container = document.getElementById('home-listings');
  if (!container) return;
  const featured = employers.slice(0, 6);
  container.innerHTML = featured.map(e => oppCardHTML(e, true)).join('');
}

/* ════════════════════════════════════
   OPPORTUNITIES
═══════════════════════════════════ */
function oppCardHTML(e, compact = false) {
  const isSaved = savedOpportunities.has(e.id);
  return `
    <div class="opp-card" onclick="showDetail(${e.id})">
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
          <span class="tag tag-industry">${e.industry}</span>
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
  };
  const anyIndustryChecked = Object.values(industryFilters).some(Boolean);

  // Compensation filters (stipend folds into "paid" since data has no separate stipend flag)
  const paidChecked = document.getElementById('f-paid')?.checked;
  const unpaidChecked = document.getElementById('f-unpaid')?.checked;
  const stipendChecked = document.getElementById('f-stipend')?.checked;
  const anyCompChecked = paidChecked || unpaidChecked || stipendChecked;

  let results = employers.filter(e => {
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
      const matchesPaid = (paidChecked || stipendChecked) && e.paid;
      const matchesUnpaid = unpaidChecked && !e.paid;
      if (!matchesPaid && !matchesUnpaid) return false;
    }
    return true;
  });

  document.getElementById('results-count').innerHTML =
    `Showing <strong>${results.length}</strong> of ${employers.length} opportunities`;

  grid.innerHTML = results.map(e => oppCardHTML(e)).join('');
}


/* ════════════════════════════════════
   DETAIL PAGE
═══════════════════════════════════ */
function showDetail(id) {
  const e = employers.find(x => x.id === id);
  if (!e) return;

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
        <span class="tag tag-industry">${e.industry}</span>
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
      <p style="font-size:0.85rem;color:var(--gray);line-height:1.5">${e.icon} ${e.location}</p>
      <a onclick="showPage('map');initMap();setTimeout(()=>focusEmployer(${id}),500)" style="color:var(--teal);font-size:0.82rem;font-weight:600;cursor:pointer;display:block;margin-top:8px">View on Map →</a>
    </div>

    <div class="card">
      <h3>About ${e.name}</h3>
      <p style="font-size:0.82rem;color:var(--gray);line-height:1.5">Northeast Florida employer offering ${e.type.toLowerCase()} opportunities in the ${e.industry} sector.</p>
    </div>
  `;

  showPage('detail');
}


/* ════════════════════════════════════
   MAP
═══════════════════════════════════ */
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
    const markerColor = industryColor[e.industry] || '#0D2F6B';
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
        <button class="popup-btn" onclick="showDetail(${e.id})">View Programs →</button>
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
      <span class="map-emp-link" onclick="event.stopPropagation();showDetail(${e.id})">View Programs →</span>
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
  if (card) { card.classList.add('active'); card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}


/* ════════════════════════════════════
   INIT
═══════════════════════════════════ */
const savedOpportunities = new Set();
renderHomeFeatured();

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
  showDetail(id);
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
