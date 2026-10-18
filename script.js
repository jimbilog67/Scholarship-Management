// ScholarTrack: log in and sign up page

const views = {
  login:  { tab: document.getElementById('tab-login'),  panel: document.getElementById('panel-login') },
  signup: { tab: document.getElementById('tab-signup'), panel: document.getElementById('panel-signup') }
};

function show(name) {
  Object.keys(views).forEach(function (key) {
    const active = key === name;
    views[key].tab.setAttribute('aria-selected', active);
    views[key].tab.tabIndex = active ? 0 : -1;
    views[key].panel.hidden = !active;
  });
}

document.querySelectorAll('[data-show]').forEach(function (el) {
  el.addEventListener('click', function (e) {
    e.preventDefault();
    show(el.dataset.show);
  });
});

// Left and right arrow keys switch tabs
document.querySelector('.tabs').addEventListener('keydown', function (e) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const next = views.login.tab.getAttribute('aria-selected') === 'true' ? 'signup' : 'login';
  show(next);
  views[next].tab.focus();
});

// Open the Sign up view directly with index.html#signup
if (location.hash === '#signup') show('signup');

document.getElementById('year').textContent = new Date().getFullYear();

// Show / hide button on every password field
document.querySelectorAll('input[type="password"]').forEach(function (input) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pw-toggle';
  btn.setAttribute('aria-label', 'Show password');
  btn.setAttribute('aria-pressed', 'false');
  btn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-eye"/></svg>';
  input.closest('.input-wrap').appendChild(btn);

  btn.addEventListener('click', function () {
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    btn.setAttribute('aria-pressed', visible);
    btn.querySelector('use').setAttribute('href', visible ? '#i-eye-off' : '#i-eye');
  });
});

// Password strength
const pw = document.getElementById('su-password');
const confirmPw = document.getElementById('su-confirm');
const strength = document.getElementById('strength');
const strengthText = document.getElementById('strength-text');
const ruleItems = document.querySelectorAll('#pw-rules li');
const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const common = ['password', '12345678', '123456789', 'qwerty123', 'iloveyou', 'letmein123'];

function rateStrength() {
  const v = pw.value;
  const rules = {
    length: v.length >= 8,
    case: /[a-z]/.test(v) && /[A-Z]/.test(v),
    number: /\d/.test(v),
    symbol: /[^A-Za-z0-9]/.test(v)
  };

  ruleItems.forEach(function (li) {
    li.classList.toggle('met', rules[li.dataset.rule]);
  });

  let level = 0;
  if (v) {
    const points = Object.values(rules).filter(Boolean).length + (v.length >= 12 ? 1 : 0);
    level = points <= 2 ? 1 : points - 1;
    if (!rules.length || common.includes(v.toLowerCase())) level = 1;
  }

  strength.dataset.level = level;
  const text = level ? 'Strength: ' + labels[level] : 'Use 8+ characters with letters, numbers, and symbols.';
  if (strengthText.textContent !== text) strengthText.textContent = text;
}

// Make sure both passwords match
function checkMatch() {
  confirmPw.setCustomValidity(pw.value === confirmPw.value ? '' : 'Passwords do not match');
}

pw.addEventListener('input', function () {
  rateStrength();
  checkMatch();
});
confirmPw.addEventListener('input', checkMatch);
rateStrength();

// ---- Supabase accounts ----
function setLoading(btn, on) {
  btn.disabled = on;
  btn.classList.toggle('loading', on);
}

function formMessage(id, text, ok) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'form-msg' + (ok ? ' ok' : '');
  el.hidden = false;
}

function hideMessage(id) {
  document.getElementById(id).hidden = true;
}

const friendlyErrors = {
  'Invalid login credentials': 'Incorrect email or password.',
  'User already registered': 'An account with this email already exists. Try logging in.'
};

function friendly(error) {
  return friendlyErrors[error.message] || error.message;
}

async function goHome(userId) {
  const { data } = await db.from('profiles').select('role').eq('id', userId).single();
  const staff = data && (data.role === 'admin' || data.role === 'reviewer');
  location.href = staff ? 'dashboard.html' : 'apply.html';
}

document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  hideMessage('login-msg');
  setLoading(btn, true);
  const { data, error } = await db.auth.signInWithPassword({
    email: document.getElementById('login-email').value.trim(),
    password: document.getElementById('login-password').value
  });
  if (error) {
    formMessage('login-msg', friendly(error), false);
    setLoading(btn, false);
    return;
  }
  goHome(data.user.id);
});

document.getElementById('signup-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  hideMessage('signup-msg');
  setLoading(btn, true);
  const { data, error } = await db.auth.signUp({
    email: document.getElementById('su-email').value.trim(),
    password: pw.value,
    options: { data: { full_name: document.getElementById('su-name').value.trim() } }
  });
  if (error) {
    formMessage('signup-msg', friendly(error), false);
    setLoading(btn, false);
    return;
  }
  if (data.session) {
    location.href = 'apply.html';
  } else {
    formMessage('signup-msg', 'Account created. Check your email to confirm it, then log in.', true);
    setLoading(btn, false);
  }
});