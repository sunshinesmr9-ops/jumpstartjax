/* ════════════════════════════════════
   COMMUNITY EVENT PLATFORM
   Standalone module for the Community Event Platform section of the Third
   Spaces page. Reads window.COMMUNITY_EVENT_PLATFORM_DATA
   (community-event-data.js). Concept and front-porch UI adapted from the
   public espil77/3rd-Space repository — see
   docs/features/community-event-platform.md for full attribution.

   Everything here is isolated from the existing Jumpstart Jax `events` array and
   `renderEvents()` in app.js — this module never reads or writes those.

   Initialization requires only the #cep-shell root container and the data
   object above; it no longer depends on any nested-tab markup.
═══════════════════════════════════ */
window.CommunityEventPlatform = (function () {
  var STORAGE_KEY = 'workjax_cep_interest_v1';
  var DAYPART_REFRESH_MS = 60000;
  var DAYPART_LABELS = { morning: 'Morning', midday: 'Afternoon', evening: 'Evening' };

  var initialized = false;
  var manualDaypartOverride = null; // null = automatic mode; otherwise 'morning'|'midday'|'evening'
  var currentDaypart = null;
  var currentMode = 'auto'; // 'auto' | 'manual'
  var daypartTimer = null;

  function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ---------- Daypart theming (scoped to #cep-shell only, never body) ---------- */
  function getLocalDaypart() {
    var h = new Date().getHours();
    if (h >= 5 && h < 11) return 'morning';
    if (h >= 11 && h < 17) return 'midday';
    return 'evening';
  }

  function updateThemeControls(daypart) {
    ['morning', 'midday', 'evening'].forEach(function (d) {
      var btn = document.getElementById('cep-theme-btn-' + d);
      if (!btn) return;
      var isSelected = d === daypart;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      btn.classList.toggle('cep-theme-btn--selected', isSelected);
    });
  }

  function updateStatusText(daypart, mode) {
    var statusEl = document.getElementById('cep-theme-status');
    if (!statusEl) return;
    var label = DAYPART_LABELS[daypart] || daypart;
    statusEl.textContent = mode === 'manual'
      ? ('Previewing ' + label + '.')
      : ('Using ' + label + ' based on your device time.');
  }

  function applyDaypart(daypart, mode) {
    var shell = document.getElementById('cep-shell');
    if (!shell) return;

    var changed = (daypart !== currentDaypart) || (mode !== currentMode);

    shell.setAttribute('data-daypart', daypart);
    var img = document.getElementById('cep-hero-img');
    if (img) img.src = 'assets/community-event-platform/daypart-' + daypart + '.png';

    currentDaypart = daypart;
    currentMode = mode;

    updateThemeControls(daypart);
    if (changed) updateStatusText(daypart, mode);
  }

  function setManualDaypart(daypart) {
    manualDaypartOverride = daypart;
    applyDaypart(daypart, 'manual');
  }

  function restoreAutomaticDaypart() {
    manualDaypartOverride = null;
    applyDaypart(getLocalDaypart(), 'auto');
  }

  function startDaypartClock() {
    applyDaypart(getLocalDaypart(), 'auto');
    if (daypartTimer) return;
    daypartTimer = setInterval(function () {
      if (manualDaypartOverride) return; // manual preview active — never overwritten by the clock
      var current = getLocalDaypart();
      if (current !== currentDaypart) applyDaypart(current, 'auto');
    }, DAYPART_REFRESH_MS);
  }

  function wireThemeControls() {
    ['morning', 'midday', 'evening'].forEach(function (d) {
      var btn = document.getElementById('cep-theme-btn-' + d);
      if (btn) btn.addEventListener('click', function () { setManualDaypart(d); });
    });
    var autoBtn = document.getElementById('cep-auto-theme-btn');
    if (autoBtn) autoBtn.addEventListener('click', function () { restoreAutomaticDaypart(); });
  }

  /* ---------- Demo-only "I'll Be There" attendance (device-local only) ---------- */
  function readInterest() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeInterest(tradition) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        traditionId: tradition.id,
        dayIndex: tradition.dayIndex,
        storedAt: new Date().toISOString()
      }));
    } catch (e) {
      // localStorage unavailable (private browsing, quota, etc.) — the demo
      // interaction simply won't persist across a reload; no error surfaced.
    }
  }

  function clearInterest() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* no-op */ }
  }

  function wireAttendanceControls(tradition) {
    var confirmBtn = document.getElementById('cep-confirm-btn');
    var confirmedNote = document.getElementById('cep-confirmed-note');
    var undoBtn = document.getElementById('cep-undo-btn');
    if (!confirmBtn || !confirmedNote || !undoBtn) return;

    function setInterestedUi(interested) {
      confirmBtn.hidden = interested;
      confirmedNote.hidden = !interested;
      undoBtn.hidden = !interested;
    }

    var stored = readInterest();
    var isInterested = !!stored && stored.traditionId === tradition.id && stored.dayIndex === tradition.dayIndex;
    setInterestedUi(isInterested);

    confirmBtn.addEventListener('click', function () {
      writeInterest(tradition);
      setInterestedUi(true);
    });
    undoBtn.addEventListener('click', function () {
      clearInterest();
      setInterestedUi(false);
    });
  }

  /* ---------- Rendering ---------- */
  function renderPreviewCard(todayTradition) {
    var cardEl = document.getElementById('cep-preview-card');
    if (!cardEl) return;

    if (!todayTradition) {
      cardEl.innerHTML = '<p class="cep-ticket-unavailable">Today’s tradition isn’t available in this prototype schedule right now.</p>';
      return;
    }

    cardEl.innerHTML =
      '<p class="cep-ticket-what">' + escapeHtml(todayTradition.title) + '</p>' +
      '<p class="cep-ticket-where">' + escapeHtml(todayTradition.location) + ' · ' + escapeHtml(todayTradition.time) + '</p>' +
      '<button type="button" class="cep-ticket-btn" id="cep-confirm-btn">I’ll Be There</button>' +
      '<p class="cep-ticket-confirmed" id="cep-confirmed-note" hidden>You marked yourself as interested on this device.</p>' +
      '<button type="button" class="cep-ticket-undo" id="cep-undo-btn" hidden>Undo</button>';

    wireAttendanceControls(todayTradition);
  }

  function renderSchedule(traditions) {
    var listEl = document.getElementById('cep-setlist');
    if (!listEl) return;

    var today = new Date().getDay(); // 0=Sun..6=Sat, matches tradition.dayIndex
    var todayTradition = null;

    listEl.innerHTML = traditions.map(function (t) {
      var isToday = t.dayIndex === today;
      if (isToday) todayTradition = t;

      var classes = ['cep-tradition'];
      if (t.isAnchor) classes.push('cep-tradition--anchor');
      if (isToday) classes.push('cep-tradition--today');

      return '<li class="' + classes.join(' ') + '" data-day="' + t.dayIndex + '">' +
        '<span class="cep-tradition-day">' + escapeHtml(t.dayLabel) + '</span>' +
        '<span class="cep-tradition-body">' +
          '<span class="cep-tradition-what">' + escapeHtml(t.title) + '</span>' +
          '<span class="cep-tradition-meta">' + escapeHtml(t.location) + ' · ' + escapeHtml(t.time) + '</span>' +
        '</span>' +
        (t.isAnchor ? '<span class="cep-anchor-tag">anchor night</span>' : '') +
        (isToday ? '<span class="cep-today-badge" aria-label="Today’s tradition">Today</span>' : '') +
        '</li>';
    }).join('');

    renderPreviewCard(todayTradition);
  }

  function renderShell() {
    var data = window.COMMUNITY_EVENT_PLATFORM_DATA;
    if (!data) return;
    setText('cep-hero-line', data.tagline);
    setText('cep-explainer-line', data.description);
    setText('cep-footer-line', data.footer);
    renderSchedule(data.traditions);
  }

  function initialize() {
    if (initialized) return;

    var shell = document.getElementById('cep-shell');
    if (!shell) return;

    renderShell();
    wireThemeControls();
    startDaypartClock();

    initialized = true;
  }

  return Object.freeze({
    initialize: initialize
  });
})();
