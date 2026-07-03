// ===== Loader =====
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 400);
});

// ===== Scroll progress + header state + back-to-top =====
const header = document.getElementById('site-header');
const progress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrollable = h.scrollHeight - h.clientHeight;
  const scrolled = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
  if (progress) progress.style.width = scrolled + '%';
  if (header) header.classList.toggle('scrolled', h.scrollTop > 30);
  if (backToTop) backToTop.classList.toggle('show', h.scrollTop > 500);
});
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));

// ===== Mobile nav =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('mobile-open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('mobile-open')));
}

// ===== Active nav link based on current page =====
(function setActiveNav() {
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    const isActive = href === current || (current === '' && href === 'index.html');
    a.classList.toggle('active', isActive);
  });
})();

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, {threshold: 0.15});
  revealEls.forEach(el => revealObserver.observe(el));
}

// ===== Animated counters (home page) =====
const counterEls = document.querySelectorAll('[data-count]');
if (counterEls.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = +el.dataset.count;
        let cur = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const tick = () => {
          cur += step;
          if (cur >= target) { el.textContent = target; return; }
          el.textContent = cur;
          requestAnimationFrame(tick);
        };
        tick();
        counterObserver.unobserve(el);
      }
    });
  }, {threshold: 0.5});
  counterEls.forEach(el => counterObserver.observe(el));
}

// ===== Skill bars (skills page) =====
const skillCards = document.querySelectorAll('.skill-card');
if (skillCards.length) {
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-bar span').forEach(bar => {
          bar.style.width = bar.dataset.w + '%';
        });
        skillObserver.unobserve(e.target);
      }
    });
  }, {threshold: 0.3});
  skillCards.forEach(el => skillObserver.observe(el));
}

// ===== Project filter (projects page) =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('#projects-grid .project-card');
if (filterBtns.length && projectCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      projectCards.forEach(card => {
        const show = f === 'all' || card.dataset.tags.includes(f);
        card.style.display = show ? 'flex' : 'none';
      });
    });
  });
}

// ===== Terminal typing animation (home page) =====
const termBody = document.getElementById('terminal-body');
if (termBody) {
  const termLines = [
    {p: 'whoami', o: 'Ibrahim Martine Matango'},
    {p: 'role', o: 'Full Stack Web Developer · IT Graduate'},
    {p: 'stack', o: 'PHP · MySQL · JavaScript · Python'},
    {p: 'status', o: 'AVAILABLE_FOR_HIRE = true'}
  ];
  let li = 0, mode = 'prompt';
  function typeTerminal() {
    if (li >= termLines.length) {
      const pill = document.createElement('div');
      pill.className = 'status-pill';
      pill.innerHTML = '<span class="status-dot"></span> System online — open to freelance &amp; full-time work';
      termBody.appendChild(pill);
      return;
    }
    const line = termLines[li];
    if (mode === 'prompt') {
      const div = document.createElement('div');
      div.className = 'line';
      div.innerHTML = '<span class="prompt">$ </span><span class="ptext"></span><span class="cursor"></span>';
      termBody.appendChild(div);
      const ptext = div.querySelector('.ptext');
      const cmd = line.p;
      let i = 0;
      const t = setInterval(() => {
        ptext.textContent += cmd[i];
        i++;
        if (i >= cmd.length) {
          clearInterval(t);
          const cursor = div.querySelector('.cursor');
          if (cursor) cursor.remove();
          mode = 'output';
          setTimeout(typeTerminal, 200);
        }
      }, 55);
      return;
    } else {
      const div = document.createElement('div');
      div.className = 'line out';
      div.textContent = '→ ' + line.o;
      termBody.appendChild(div);
      li++;
      mode = 'prompt';
      setTimeout(typeTerminal, 350);
    }
  }
  setTimeout(typeTerminal, 900);
}

// ===== Contact form (contact page) — submits to Formspree =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const note = document.getElementById('form-note');
  const btn = document.getElementById('form-submit-btn');
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const action = contactForm.getAttribute('action') || '';
    if (action.includes('YOUR_FORM_ID')) {
      if (note) note.textContent = 'Form not connected yet — replace YOUR_FORM_ID in the form action with your real Formspree endpoint.';
      return;
    }
    const originalBtnText = btn ? btn.textContent : '';
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    if (note) note.textContent = '';
    fetch(action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' }
    })
    .then(res => {
      if (res.ok) {
        if (note) { note.textContent = "Thanks — your message has been sent. I'll get back to you soon."; note.style.color = 'var(--accent-2)'; }
        contactForm.reset();
      } else {
        res.json().then(data => {
          const msg = (data && data.errors && data.errors.length) ? data.errors.map(e => e.message).join(', ') : 'Something went wrong. Please try again or email me directly.';
          if (note) { note.textContent = msg; note.style.color = '#ff8080'; }
        }).catch(() => {
          if (note) { note.textContent = 'Something went wrong. Please try again or email me directly.'; note.style.color = '#ff8080'; }
        });
      }
    })
    .catch(() => {
      if (note) { note.textContent = 'Network error — please check your connection and try again.'; note.style.color = '#ff8080'; }
    })
    .finally(() => {
      if (btn) { btn.textContent = originalBtnText; btn.disabled = false; }
    });
  });
}