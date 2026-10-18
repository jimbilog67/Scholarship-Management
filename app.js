// ScholarTrack: shared logic for every page after log in
const CURRENCY = '$'; // change to ₱, €, £ ...

const LOGO = '<svg width="32" height="32" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="8" fill="#14B8A6"/><path d="M7 12l7-4 7 4-7 4z" fill="#fff"/><path d="M10 15v3c0 1 2 2 4 2s4-1 4-2v-3" stroke="#fff" stroke-width="1.6" fill="none"/></svg>';
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Crect width='28' height='28' rx='8' fill='%2314B8A6'/%3E%3Cpath d='M7 12l7-4 7 4-7 4z' fill='%23fff'/%3E%3Cpath d='M10 15v3c0 1 2 2 4 2s4-1 4-2v-3' stroke='%23fff' stroke-width='1.6' fill='none'/%3E%3C/svg%3E";

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'
};

const STATUS = {
  new: ['New', 'b-new'],
  review: ['Under review', 'b-review'],
  interview: ['Interview', 'b-interview'],
  awarded: ['Awarded', 'b-awarded'],
  declined: ['Declined', 'b-declined']
};
const STATUS_ORDER = ['new', 'review', 'interview', 'awarded', 'declined'];
const ROLES = { admin: 'Administrator', reviewer: 'Reviewer', applicant: 'Applicant' };
const TONES = [['#D6EFEA', '#0B4F47'], ['#E3EBEA', '#2A4541'], ['#DCEBF7', '#1B4A7A'], ['#FFF1D6', '#7A4A00'], ['#EDE4F7', '#4B2A7A']];
const APP_COLUMNS = 'id, status, school, program, gpa, submitted_at, scholarships(name), profiles(full_name), reviews(overall)';
const SLIDERS = ['r-academic', 'r-need', 'r-leadership', 'r-essay'];

let me = null;
let allApps = [];
let appId = null;
let activeStatus = 'all';

// ---------- helpers ----------
const $ = function (id) { return document.getElementById(id); };

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function icon(name) {
  return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
}

function badge(status) {
  const s = STATUS[status] || [status, 'b-new'];
  return '<span class="badge ' + s[1] + '">' + esc(s[0]) + '</span>';
}

function avatar(name, big) {
  const n = (name || '').trim() || '?';
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 997;
  const tone = TONES[h % TONES.length];
  const parts = n.split(/\s+/);
  const initials = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  return '<span class="avatar' + (big ? ' lg' : '') + '" style="background:' + tone[0] + ';color:' + tone[1] + '">' + esc(initials) + '</span>';
}

function money(n) { return CURRENCY + Number(n).toLocaleString(); }

function niceDate(value) {
  const d = value.length === 10 ? new Date(value + 'T00:00:00') : new Date(value);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function todayStr() { return new Date().toLocaleDateString('en-CA'); }

function avgScore(reviews) {
  if (!reviews || !reviews.length) return '—';
  return (reviews.reduce(function (sum, r) { return sum + Number(r.overall); }, 0) / reviews.length).toFixed(1);
}

function scoreCell(reviews) {
  const s = avgScore(reviews);
  return s === '—' ? '<span class="muted">—</span>' : '<b class="score">' + s + '</b>';
}

function emptyState(iconName, title, text, action) {
  return '<div class="empty-state">' + icon(iconName) + '<h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (action || '') + '</div>';
}

function skeletonRows(id, cols, rows) {
  let html = '';
  for (let i = 0; i < rows; i++) html += '<tr>' + '<td><span class="sk"></span></td>'.repeat(cols) + '</tr>';
  $(id).innerHTML = html;
}

function skeletonList(id, n) {
  $(id).innerHTML = '<li><span class="sk sk-tall"></span></li>'.repeat(n);
}

function setLoading(btn, on) {
  btn.disabled = on;
  btn.classList.toggle('loading', on);
}

// Pop-up message (green = success, red = problem)
function showNotice(message, isError) {
  let box = $('toasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toasts';
    document.body.appendChild(box);
  }
  const t = document.createElement('div');
  t.className = 'toast' + (isError ? ' error' : '');
  t.setAttribute('role', isError ? 'alert' : 'status');
  t.innerHTML = icon(isError ? 'alert' : 'check') + '<span>' + esc(message) + '</span><button type="button" aria-label="Dismiss">' + icon('x') + '</button>';
  const close = function () { t.remove(); };
  t.querySelector('button').addEventListener('click', close);
  box.appendChild(t);
  setTimeout(close, isError ? 8000 : 4500);
}

// Confirmation pop-up. Resolves to true or false.
function confirmDialog(title, text, okLabel, danger) {
  return new Promise(function (resolve) {
    const d = document.createElement('dialog');
    d.className = 'dialog';
    d.innerHTML = '<h2>' + esc(title) + '</h2><p>' + esc(text) + '</p>' +
      '<div class="dialog-actions"><button type="button" class="btn btn-outline" data-v="0">Cancel</button>' +
      '<button type="button" class="btn' + (danger ? ' btn-danger' : '') + '" data-v="1">' + esc(okLabel) + '</button></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) {
      const b = e.target.closest('button[data-v]');
      if (b) d.close(b.dataset.v);
    });
    d.addEventListener('close', function () {
      resolve(d.returnValue === '1');
      d.remove();
    });
    d.showModal();
  });
}

// Click anywhere on a table row to open it
function rowLinks(id) {
  $(id).addEventListener('click', function (e) {
    const tr = e.target.closest('tr[data-href]');
    if (tr && !e.target.closest('a')) location.href = tr.dataset.href;
  });
}

// ---------- shared layout ----------
function renderSidebar(page) {
  const el = $('sidebar');
  if (!el) return;
  const links = [
    ['dashboard', 'dashboard.html', 'Dashboard', 'dashboard'],
    ['applicants', 'applicants.html', 'Applicants', 'users'],
    ['scholarships', 'scholarships.html', 'Scholarships', 'cap']
  ];
  const who = me.full_name || me.email;
  el.innerHTML = '<div class="logo">' + LOGO + 'ScholarTrack</div>' +
    '<nav class="nav" aria-label="Main">' +
    links.map(function (l) {
      const current = l[0] === page || (l[0] === 'applicants' && page === 'applicant');
      return '<a href="' + l[1] + '"' + (current ? ' aria-current="page"' : '') + '>' + icon(l[3]) + l[2] + '</a>';
    }).join('') + '</nav>' +
    '<div class="side-user">' + avatar(who) + '<div><b>' + esc(who) + '</b><span>' + esc(ROLES[me.role] || me.role) + '</span></div></div>' +
    '<a class="logout" href="index.html" data-logout>' + icon('logout') + 'Log out</a>';
}

function wireCommon() {
  document.querySelectorAll('[data-icon]').forEach(function (el) {
    el.innerHTML = icon(el.dataset.icon);
  });
  document.querySelectorAll('[data-logout]').forEach(function (a) {
    a.addEventListener('click', async function (e) {
      e.preventDefault();
      await db.auth.signOut();
      location.href = 'index.html';
    });
  });

  const menuBtn = document.querySelector('.menu-btn');
  const sidebar = $('sidebar');
  if (menuBtn && sidebar) {
    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    document.body.appendChild(backdrop);
    const setOpen = function (open) {
      sidebar.classList.toggle('open', open);
      backdrop.classList.toggle('show', open);
      menuBtn.setAttribute('aria-expanded', open);
    };
    menuBtn.addEventListener('click', function () { setOpen(!sidebar.classList.contains('open')); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }
}

// ---------- applicant rows (dashboard and applicants list) ----------
function applicantRow(a, full) {
  const name = (a.profiles && a.profiles.full_name) || 'Unnamed';
  const href = 'applicant.html?id=' + encodeURIComponent(a.id);
  return '<tr data-href="' + esc(href) + '">' +
    '<td><a class="person" href="' + esc(href) + '">' + avatar(name) + '<span><b>' + esc(name) + '</b><small>' + esc(a.program) + '</small></span></a></td>' +
    '<td>' + esc(a.scholarships ? a.scholarships.name : '') + '</td>' +
    (full ? '<td>' + esc(a.school) + '</td><td>' + esc(a.gpa) + '</td>' : '') +
    '<td>' + badge(a.status) + '</td>' +
    '<td>' + scoreCell(a.reviews) + '</td>' +
    (full ? '<td class="nowrap">' + niceDate(a.submitted_at) + '</td>' : '') +
    '</tr>';
}

// ---------- dashboard ----------
async function loadDashboard() {
  const first = (me.full_name || '').trim().split(/\s+/)[0];
  $('greeting').textContent = first ? 'Welcome back, ' + first : 'Welcome back';
  $('new-sch-btn').hidden = me.role !== 'admin';
  skeletonRows('recent-body', 4, 4);
  skeletonList('open-list', 2);
  rowLinks('recent-body');

  const res = await db.from('applications').select(APP_COLUMNS).order('submitted_at', { ascending: false });
  if (res.error) {
    $('recent-body').innerHTML = '';
    $('open-list').innerHTML = '';
    showNotice('Could not load the dashboard. ' + res.error.message, true);
    return;
  }
  const data = res.data;
  const counts = {};
  STATUS_ORDER.forEach(function (s) { counts[s] = 0; });
  data.forEach(function (a) { if (counts[a.status] !== undefined) counts[a.status]++; });

  $('k-total').textContent = data.length;
  $('k-review').textContent = counts.review;
  $('k-interview').textContent = counts.interview;
  $('k-awarded').textContent = counts.awarded;

  $('recent-body').innerHTML = data.slice(0, 5).map(function (a) { return applicantRow(a, false); }).join('');
  $('recent-empty').hidden = data.length > 0;
  $('recent-empty').innerHTML = emptyState('inbox', 'No applications yet', 'They will appear here as soon as applicants submit the form.');

  $('status-chart').innerHTML = data.length
    ? '<ul class="bars">' + STATUS_ORDER.map(function (s) {
        const pct = Math.round(counts[s] / data.length * 100);
        return '<li><div class="bar-top"><span>' + STATUS[s][0] + '</span><b>' + counts[s] + '</b></div>' +
          '<div class="bar"><i class="f-' + s + '" style="width:' + pct + '%"></i></div></li>';
      }).join('') + '</ul>'
    : '<p class="muted">The chart appears once applications arrive.</p>';

  const sch = await db.from('scholarships').select('name, amount, deadline')
    .eq('status', 'open').gte('deadline', todayStr()).order('deadline');
  const list = sch.data || [];
  $('open-list').innerHTML = list.map(function (s) {
    return '<li><div><b>' + esc(s.name) + '</b><small>' + money(s.amount) + '</small></div><span class="due">Due ' + niceDate(s.deadline) + '</span></li>';
  }).join('');
  $('open-empty').hidden = list.length > 0;
  $('open-empty').innerHTML = me.role === 'admin'
    ? emptyState('cap', 'No open scholarships', 'Create one so applicants can apply.', '<a class="btn btn-sm" href="scholarships.html">Create scholarship</a>')
    : emptyState('cap', 'No open scholarships', 'Check back once an administrator opens one.');
}

// ---------- applicants list ----------
function buildPills() {
  const counts = {};
  allApps.forEach(function (a) { counts[a.status] = (counts[a.status] || 0) + 1; });
  const items = [['all', 'All', allApps.length]].concat(STATUS_ORDER.map(function (s) {
    return [s, STATUS[s][0], counts[s] || 0];
  }));
  $('status-pills').innerHTML = items.map(function (i) {
    const on = i[0] === activeStatus;
    return '<button type="button" class="pill' + (on ? ' active' : '') + '" data-status="' + i[0] + '" aria-pressed="' + on + '">' + esc(i[1]) + '<span>' + i[2] + '</span></button>';
  }).join('');
}

function renderApplicants() {
  const q = $('search').value.trim().toLowerCase();
  const rows = allApps.filter(function (a) {
    const text = [a.profiles ? a.profiles.full_name : '', a.school, a.program, a.scholarships ? a.scholarships.name : ''].join(' ').toLowerCase();
    return (activeStatus === 'all' || a.status === activeStatus) && text.includes(q);
  });
  $('applicants-body').innerHTML = rows.map(function (a) { return applicantRow(a, true); }).join('');
  $('no-results').hidden = rows.length > 0;
  $('no-results').innerHTML = allApps.length
    ? emptyState('search', 'No applicants match', 'Try a different search or choose another status.')
    : emptyState('inbox', 'No applications yet', 'They will appear here once applicants submit the form.');
  $('result-count').textContent = allApps.length ? 'Showing ' + rows.length + ' of ' + allApps.length + ' applicants' : '';
}

async function loadApplicants() {
  skeletonRows('applicants-body', 7, 5);
  rowLinks('applicants-body');
  const res = await db.from('applications').select(APP_COLUMNS).order('submitted_at', { ascending: false });
  if (res.error) {
    $('applicants-body').innerHTML = '';
    showNotice('Could not load applicants. ' + res.error.message, true);
    return;
  }
  allApps = res.data;
  buildPills();
  $('search').addEventListener('input', renderApplicants);
  $('status-pills').addEventListener('click', function (e) {
    const b = e.target.closest('.pill');
    if (!b) return;
    activeStatus = b.dataset.status;
    $('status-pills').querySelectorAll('.pill').forEach(function (p) {
      p.classList.toggle('active', p === b);
      p.setAttribute('aria-pressed', p === b);
    });
    renderApplicants();
  });
  renderApplicants();
}

// ---------- applicant review ----------
async function fileLink(path, optional) {
  if (!path) return optional ? '<span class="muted">Not provided</span>' : '<span class="badge b-review">Missing</span>';
  const res = await db.storage.from('documents').createSignedUrl(path, 3600);
  if (res.error || !res.data) return '<span class="badge b-declined">Unavailable</span>';
  return '<a class="btn btn-outline btn-sm" href="' + esc(res.data.signedUrl) + '" target="_blank" rel="noopener">Open</a>';
}

function setStatusBadge(status) {
  const s = STATUS[status] || [status, 'b-new'];
  $('status-chip').textContent = s[0];
  $('status-chip').className = 'badge ' + s[1];
  document.querySelectorAll('.status-btn').forEach(function (b) {
    b.setAttribute('aria-pressed', b.dataset.status === status);
  });
}

function updateScore() {
  let sum = 0;
  SLIDERS.forEach(function (id) {
    const v = Number($(id).value);
    $(id + '-out').textContent = v + ' / 10';
    sum += v;
  });
  $('total-score').textContent = (sum / SLIDERS.length).toFixed(1);
}

function detailRows(rows) {
  return '<dl class="details">' + rows.map(function (r) {
    const empty = r[1] === null || r[1] === undefined || r[1] === '';
    return '<div' + (r[2] ? ' class="wide"' : '') + '><dt>' + r[0] + '</dt><dd' + (empty ? ' class="muted"' : '') + '>' + (empty ? 'Not provided' : esc(r[1])) + '</dd></div>';
  }).join('') + '</dl>';
}

function ageFrom(dob) {
  return Math.floor((Date.now() - new Date(dob + 'T00:00:00').getTime()) / 31557600000);
}

function monthLabel(value) {
  if (!/^\d{4}-\d{2}$/.test(value || '')) return value;
  return new Date(value + '-01T00:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

async function loadApplicant() {
  appId = new URLSearchParams(location.search).get('id');
  if (!appId) { location.replace('applicants.html'); return; }

  const res = await db.from('applications').select('*, scholarships(name), profiles(full_name)').eq('id', appId).single();
  if (res.error || !res.data) {
    $('ap-name').textContent = 'Application not found';
    showNotice('This application could not be found. Go back to the applicants list and try again.', true);
    return;
  }
  const a = res.data;
  const name = (a.profiles && a.profiles.full_name) || 'Unnamed applicant';

   $('ap-avatar').innerHTML = avatar(name, true);
  $('ap-name').textContent = name;
  $('ap-meta').textContent = (a.scholarships ? a.scholarships.name : '') + ' · Applied ' + niceDate(a.submitted_at);
  setStatusBadge(a.status);

  const address = [a.address, a.city, a.region, a.postal_code, a.country].filter(Boolean).join(', ');
  const dob = a.date_of_birth ? niceDate(a.date_of_birth) + ' (age ' + ageFrom(a.date_of_birth) + ')' : null;
  const groups = [
    ['Personal details', [
      ['Date of birth', dob], ['Gender', a.gender || 'Prefer not to say'], ['Citizenship', a.citizenship],
      ['Mobile number', a.phone], ['Address', address || null, true]
    ]],
    ['Education', [
      ['School', a.school], ['Student ID', a.student_id], ['Program', a.program],
      ['Year level', a.year_level], ['Expected graduation', monthLabel(a.expected_graduation)], ['GPA', a.gpa]
    ]],
    ['Family and finances', [
      ['Parent or guardian', a.guardian_name], ['Guardian mobile number', a.guardian_phone],
      ['People in household', a.household_size],
      ['Annual household income', a.household_income !== null && a.household_income !== undefined ? money(a.household_income) : null],
      ['Other financial aid', a.other_aid, true]
    ]],
    ['Recommendation', [['Referee', a.reference_name], ['Referee contact', a.reference_contact]]]
  ];
  $('ap-details').innerHTML = groups.map(function (g) {
    return '<div class="detail-group"><h3>' + g[0] + '</h3>' + detailRows(g[1]) + '</div>';
  }).join('');
  $('ap-essay').textContent = a.essay;
  $('ap-achievements').textContent = a.achievements || 'Not provided';
  $('ap-achievements').classList.toggle('muted', !a.achievements);
  $('ap-activities').textContent = a.activities || 'Not provided';
  $('ap-activities').classList.toggle('muted', !a.activities);

  const docs = [
    ['Transcript', a.transcript_path, false],
    ['Recommendation letter', a.reference_path, false],
    ['Proof of enrollment', a.enrollment_path, true]
  ];
  const links = await Promise.all(docs.map(function (d) { return fileLink(d[1], d[2]); }));
  $('doc-list').innerHTML = docs.map(function (d, i) {
    return '<li><span class="doc-ic">' + icon('file') + '</span><div><b>' + d[0] + '</b><small>PDF</small></div>' + links[i] + '</li>';
  }).join('');

  const mine = await db.from('reviews').select('*').eq('application_id', appId).eq('reviewer_id', me.id).maybeSingle();
  if (mine.data) {
    $('r-academic').value = mine.data.academic;
    $('r-need').value = mine.data.need;
    $('r-leadership').value = mine.data.leadership;
    $('r-essay').value = mine.data.essay;
    $('notes').value = mine.data.notes || '';
  }
  SLIDERS.forEach(function (id) { $(id).addEventListener('input', updateScore); });
  updateScore();

  $('save-review').addEventListener('click', async function () {
    const btn = $('save-review');
    setLoading(btn, true);
    const r = await db.from('reviews').upsert({
      application_id: appId,
      reviewer_id: me.id,
      academic: Number($('r-academic').value),
      need: Number($('r-need').value),
      leadership: Number($('r-leadership').value),
      essay: Number($('r-essay').value),
      notes: $('notes').value.trim() || null
    }, { onConflict: 'application_id,reviewer_id' });
    setLoading(btn, false);
    showNotice(r.error ? 'Could not save the review. ' + r.error.message : 'Review saved.', !!r.error);
  });

  document.querySelectorAll('.status-btn').forEach(function (b) {
    b.addEventListener('click', async function () {
      const st = b.dataset.status;
      if (st === 'awarded' || st === 'declined') {
        const ok = await confirmDialog(
          st === 'awarded' ? 'Award this scholarship?' : 'Decline this applicant?',
          'This marks ' + name + ' as ' + STATUS[st][0] + '. You can change the status again later.',
          st === 'awarded' ? 'Award' : 'Decline',
          st === 'declined'
        );
        if (!ok) return;
      }
      const r = await db.from('applications').update({ status: st }).eq('id', appId);
      if (r.error) { showNotice('Could not update the status. ' + r.error.message, true); return; }
      setStatusBadge(st);
      showNotice('Status updated to ' + STATUS[st][0] + '.');
    });
  });
}

// ---------- scholarships ----------
async function renderScholarships() {
  const res = await db.from('scholarships').select('*, applications(count)').order('deadline');
  if (res.error) { showNotice('Could not load scholarships. ' + res.error.message, true); return; }
  const today = todayStr();
  const admin = me.role === 'admin';
  $('sch-list').innerHTML = res.data.map(function (s) {
    const closed = s.status === 'closed';
    const passed = !closed && s.deadline < today;
    const tag = closed ? '<span class="badge b-new">Closed</span>'
      : passed ? '<span class="badge b-new">Deadline passed</span>'
      : '<span class="badge b-awarded">Open</span>';
    const n = s.applications && s.applications[0] ? s.applications[0].count : 0;
    return '<li class="card sch-card"><div class="sch-top"><h2>' + esc(s.name) + '</h2>' + tag + '</div>' +
      (s.description ? '<p class="sch-desc">' + esc(s.description) + '</p>' : '') +
      '<dl class="sch-stats">' +
      '<div><dt>Amount</dt><dd>' + money(s.amount) + '</dd></div>' +
      '<div><dt>Awards</dt><dd>' + esc(s.slots) + '</dd></div>' +
      '<div><dt>Minimum GPA</dt><dd>' + esc(s.min_gpa) + '</dd></div>' +
      '<div><dt>Deadline</dt><dd>' + niceDate(s.deadline) + '</dd></div>' +
      '<div><dt>Applicants</dt><dd>' + n + '</dd></div></dl>' +
      (admin ? '<div class="sch-actions">' +
        '<button type="button" class="btn btn-outline btn-sm" data-act="toggle" data-id="' + esc(s.id) + '" data-status="' + esc(s.status) + '">' + (closed ? 'Reopen' : 'Close') + '</button>' +
        '<button type="button" class="btn btn-outline btn-sm btn-del" data-act="delete" data-id="' + esc(s.id) + '" data-name="' + esc(s.name) + '">Delete</button></div>' : '') +
      '</li>';
  }).join('');
  $('sch-empty').hidden = res.data.length > 0;
  $('sch-empty').innerHTML = emptyState('cap', 'No scholarships yet', admin ? 'Use the form to create your first scholarship.' : 'An administrator has not created one yet.');
}

async function loadScholarships() {
  if (me.role !== 'admin') {
    $('new-scholarship').remove();
    $('sch-layout').classList.add('single');
  } else {
    $('scholarship-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      setLoading(btn, true);
      const r = await db.from('scholarships').insert({
        name: $('s-name').value.trim(),
        description: $('s-desc').value.trim(),
        amount: Number($('s-amount').value),
        slots: Number($('s-slots').value),
        min_gpa: Number($('s-gpa').value),
        deadline: $('s-deadline').value
      });
      setLoading(btn, false);
      if (r.error) { showNotice('Could not save the scholarship. ' + r.error.message, true); return; }
      e.target.reset();
      showNotice('Scholarship saved.');
      renderScholarships();
    });
    $('sch-list').addEventListener('click', async function (e) {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      if (b.dataset.act === 'toggle') {
        const next = b.dataset.status === 'open' ? 'closed' : 'open';
        const r = await db.from('scholarships').update({ status: next }).eq('id', b.dataset.id);
        if (r.error) { showNotice('Could not update the scholarship. ' + r.error.message, true); return; }
        showNotice(next === 'closed' ? 'Scholarship closed.' : 'Scholarship reopened.');
      } else {
        const ok = await confirmDialog(
          'Delete "' + b.dataset.name + '"?',
          'This also deletes every application made for it. This cannot be undone.',
          'Delete', true
        );
        if (!ok) return;
        const r = await db.from('scholarships').delete().eq('id', b.dataset.id);
        if (r.error) { showNotice('Could not delete the scholarship. ' + r.error.message, true); return; }
        showNotice('Scholarship deleted.');
      }
      renderScholarships();
    });
  }
  await renderScholarships();
}

// ---------- application form ----------
async function upload(file, label) {
  if (file.size > 5 * 1024 * 1024) throw new Error('Each PDF must be 5 MB or smaller.');
  const path = me.id + '/' + Date.now() + '-' + label + '.pdf';
  const r = await db.storage.from('documents').upload(path, file, { contentType: 'application/pdf' });
  if (r.error) throw r.error;
  return path;
}

async function loadMyApps() {
  const res = await db.from('applications').select('id, status, submitted_at, scholarships(name)')
    .eq('applicant_id', me.id).order('submitted_at', { ascending: false });
  const list = res.data || [];
  $('my-apps').innerHTML = list.map(function (a) {
    return '<li><div><b>' + esc(a.scholarships ? a.scholarships.name : '') + '</b><small>Submitted ' + niceDate(a.submitted_at) + '</small></div>' + badge(a.status) + '</li>';
  }).join('');
  $('my-empty').hidden = list.length > 0;
  $('my-empty').innerHTML = emptyState('file', 'No applications yet', 'Complete the form above and your application will be listed here.');
}

async function loadApply() {
  $('applying-as').textContent = 'Applying as ' + (me.full_name || 'your account') + ' (' + me.email + ')';
  $('staff-link').hidden = me.role === 'applicant';
  $('a-dob').max = todayStr();

  const res = await db.from('scholarships').select('id, name, min_gpa, deadline')
    .eq('status', 'open').gte('deadline', todayStr()).order('deadline');
  if (res.error) { showNotice('Could not load scholarships. ' + res.error.message, true); return; }
  if (!res.data.length) {
    $('apply-closed').hidden = false;
    $('apply-form').hidden = true;
  } else {
    $('a-scholarship').insertAdjacentHTML('beforeend', res.data.map(function (s) {
      return '<option value="' + esc(s.id) + '" data-mingpa="' + esc(s.min_gpa) + '">' + esc(s.name) + ' (deadline ' + niceDate(s.deadline) + ')</option>';
    }).join(''));
  }

  const essay = $('essay');
  function updateCount() { $('essay-count').textContent = essay.value.length + ' / 2000 characters'; }
  essay.addEventListener('input', updateCount);
  $('apply-form').addEventListener('reset', function () { setTimeout(updateCount); });
  updateCount();

  $('apply-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    setLoading(btn, true);
    try {
      const opt = $('a-scholarship').selectedOptions[0];
      const gpa = Number($('a-gpa').value);
      if (gpa < Number(opt.dataset.mingpa)) {
        throw new Error('This scholarship needs a GPA of at least ' + opt.dataset.mingpa + '. Choose another scholarship or check your GPA.');
      }
      const dup = await db.from('applications').select('id')
        .eq('scholarship_id', opt.value).eq('applicant_id', me.id).maybeSingle();
      if (dup.data) throw new Error('You already applied for this scholarship.');

      const val = function (id) { return $(id).value.trim(); };
      const orNull = function (id) { return val(id) || null; };
      const transcript = await upload($('a-transcript').files[0], 'transcript');
      const reference = await upload($('a-reference').files[0], 'reference');
      const enrollmentFile = $('a-enrollment').files[0];
      const enrollment = enrollmentFile ? await upload(enrollmentFile, 'enrollment') : null;
      const r = await db.from('applications').insert({
        scholarship_id: opt.value,
        applicant_id: me.id,
        date_of_birth: $('a-dob').value,
        gender: orNull('a-gender'),
        citizenship: val('a-citizenship'),
        phone: val('a-phone'),
        address: val('a-address'),
        city: val('a-city'),
        region: val('a-region'),
        postal_code: orNull('a-postal'),
        country: val('a-country'),
        school: val('a-school'),
        student_id: orNull('a-studentid'),
        program: val('a-program'),
        year_level: $('a-year').value,
        expected_graduation: val('a-grad'),
        gpa: gpa,
        guardian_name: val('a-guardian'),
        guardian_phone: val('a-guardian-phone'),
        household_size: Number($('a-household').value),
        household_income: Number($('a-income').value),
        other_aid: orNull('a-aid'),
        achievements: orNull('a-achievements'),
        activities: orNull('a-activities'),
        essay: essay.value.trim(),
        reference_name: val('a-ref-name'),
        reference_contact: val('a-ref-contact'),
        transcript_path: transcript,
        reference_path: reference,
        enrollment_path: enrollment,
        consented_at: new Date().toISOString()
      });
      if (r.error) throw r.error;
      form.reset();
      showNotice('Application submitted. You can follow its status below.');
      loadMyApps();
    } catch (err) {
      showNotice(err.message, true);
    }
    setLoading(btn, false);
  });

  loadMyApps();
}

// ---------- start ----------
(async function init() {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = FAVICON;
  document.head.appendChild(link);

  const page = document.body.dataset.page;
  const sessionRes = await db.auth.getSession();
  const session = sessionRes.data.session;
  if (!session) { location.replace('index.html'); return; }

  db.auth.onAuthStateChange(function (event) {
    if (event === 'SIGNED_OUT') location.replace('index.html');
  });

  const p = await db.from('profiles').select('id, full_name, role').eq('id', session.user.id).single();
  if (p.error || !p.data) {
    await db.auth.signOut();
    location.replace('index.html');
    return;
  }
  me = p.data;
  me.email = session.user.email;

  const staff = me.role === 'admin' || me.role === 'reviewer';
  if (document.body.dataset.access === 'staff' && !staff) { location.replace('apply.html'); return; }

  renderSidebar(page);
  wireCommon();

  const loaders = {
    dashboard: loadDashboard,
    applicants: loadApplicants,
    applicant: loadApplicant,
    scholarships: loadScholarships,
    apply: loadApply
  };
  try {
    if (loaders[page]) await loaders[page]();
  } catch (err) {
    showNotice('Something went wrong. ' + err.message, true);
  }
})();