// Renders the page from data/site.json (portfolio copy) and data/resume.json (JSON Resume format).
// To change what the site says, edit those two files; nothing here needs to change.
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // *phrase* -> accent emphasis, used only in the hero headline.
  function emph(s) { return esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>'); }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d) {
    if (!d) return 'Present';
    var p = d.split('-');
    return p[1] ? MONTHS[+p[1] - 1] + ' ' + p[0] : p[0];
  }
  function year(d) { return d ? d.split('-')[0] : 'now'; }

  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }

  // ---------- render ----------
  // Name comes from resume.basics.name. Preview without diacritics with ?name=plain (Svilarić -> Svilaric).
  function applyName(resume) {
    var name = resume.basics.name;
    try {
      if (new URLSearchParams(location.search).get('name') === 'plain') name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch (e) {}
    resume.basics.name = name;
    document.querySelectorAll('.vk-wordmark').forEach(function (el) { el.textContent = name; });
    document.title = name + ' · ' + (resume.basics.label || '');
  }

  function renderHero(site, resume) {
    if (site.status) {
      $('status').hidden = false;
      $('status').lastElementChild.textContent = site.status;
    }
    var h = site.hero || {};
    $('hero-headline').innerHTML = emph(h.headline || resume.basics.name) + '<span class="vk-caret" aria-hidden="true"></span>';
    $('hero-subline').textContent = h.subline || resume.basics.summary || '';
    var actions = '';
    if (h.primary) actions += '<a class="vk-btn vk-btn-primary" href="' + esc(h.primary.href) + '">' + esc(h.primary.label) + ' <span class="vk-arrow">→</span></a>';
    if (h.secondary) actions += '<a class="vk-btn vk-btn-ghost" href="' + esc(h.secondary.href) + '">' + esc(h.secondary.label) + '</a>';
    $('hero-actions').innerHTML = actions;
  }

  function renderProjects(projects) {
    $('projects').innerHTML = (projects || []).map(function (p, i) {
      var num = String(i + 1).padStart(2, '0');
      // Impact panel: a headline metric (or the index numeral) over the system's flow. No screenshots needed.
      var head = p.stat
        ? '<div class="vk-stat"><span class="vk-stat-value">' + esc(p.stat.value) + '</span><span class="vk-meta">' + esc(p.stat.label) + '</span></div>'
        : '<span class="vk-num" aria-hidden="true">' + num + '</span>';
      var flow = (p.flow || []).length
        ? '<ol class="vk-flow" aria-label="How it works">' + p.flow.map(function (f, j) { return '<li>' + (j ? '<span class="vk-flow-sep" aria-hidden="true">→</span>' : '') + '<span class="vk-flow-step">' + esc(f) + '</span></li>'; }).join('') + '</ol>'
        : '';
      var media = p.image
        ? '<img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || p.title) + '" loading="lazy">'
        : '<div class="vk-impact">' + (p.stat ? '<span class="vk-label vk-impact-idx">' + num + '</span>' : '') + head + flow + '</div>';
      var tags = (p.tags || []).map(function (t) { return '<span class="vk-tag">' + esc(t) + '</span>'; });
      if (p.ai) tags.push('<span class="vk-tag vk-tag-accent">ai-native</span>');
      var tag = p.href ? 'a' : 'article';
      var attrs = p.href ? ' href="' + esc(p.href) + '"' : '';
      return '<' + tag + ' class="vk-card"' + attrs + '>' +
        '<div class="vk-frame"><div class="vk-media">' + media + '</div></div>' +
        '<div class="vk-card-body">' +
          '<div class="vk-meta">' + esc(p.meta) + '</div>' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<p>' + esc(p.summary) + '</p>' +
          '<div class="vk-tags">' + tags.slice(0, 3).join('') + '</div>' +
        '</div></' + tag + '>';
    }).join('');
  }

  function renderPrinciples(principles) {
    $('principle-list').innerHTML = (principles || []).map(function (p) {
      return '<li><div><h3>' + esc(p.title) + '</h3><p>' + esc(p.body) + '</p></div></li>';
    }).join('');
  }

  function renderExperience(resume) {
    $('work-history').innerHTML = (resume.work || []).map(function (w, i) {
      var range = fmtDate(w.startDate) + ' – ' + fmtDate(w.endDate);
      var bullets = (w.highlights || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('');
      return '<details class="vk-xp-item"' + (i === 0 ? ' open' : '') + '>' +
        '<summary class="vk-xp">' +
          '<span class="vk-label">' + esc(year(w.startDate) + '–' + year(w.endDate)) + '</span>' +
          '<div><h3>' + esc(w.position) + '</h3><p>' + esc(w.name) + ' · ' + esc(range) + '</p></div>' +
          '<span class="vk-go" aria-hidden="true">→</span>' +
        '</summary>' +
        '<div class="vk-xp-detail"><ul>' + bullets + '</ul></div>' +
      '</details>';
    }).join('');

    var skills = (resume.skills || []).map(function (s) {
      return '<div class="vk-skill"><span class="vk-label">' + esc(s.name) + '</span>' +
        '<div class="vk-tags">' + (s.keywords || []).map(function (k) { return '<span class="vk-tag">' + esc(k) + '</span>'; }).join('') + '</div></div>';
    }).join('');
    // Education gets its own row under the work history: secondary to it, but easy to spot.
    var edu = (resume.education || []).map(function (e) {
      var courses = (e.courses || []).map(function (c) { return '<span class="vk-tag">' + esc(c) + '</span>'; }).join('');
      var city = e.location || 'toronto';
      return '<div class="vk-edu">' +
        '<span class="vk-label">Education</span>' +
        '<div>' +
          '<h3>' + (e.url ? '<a class="vk-link" href="' + esc(e.url) + '" rel="noopener">' + esc(e.institution) + '</a>' : esc(e.institution)) + '</h3>' +
          '<p>' + esc(e.studyType) + ' · ' + esc(e.area) + '</p>' +
          (e.summary ? '<p>' + esc(e.summary) + '</p>' : '') +
          '<div class="vk-meta">class of ' + esc(year(e.endDate)) + ' · ' + esc(city) + '</div>' +
          (courses ? '<div class="vk-tags vk-edu-courses">' + courses + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');
    $('resume-extra').innerHTML = edu +
      '<div class="vk-skills"><h3 class="vk-sub">Skills</h3>' + skills +
        '<div class="vk-resume-links"><a class="vk-btn vk-btn-text" href="data/resume.json">Résumé as JSON <span class="vk-arrow">↗</span></a></div>' +
      '</div>';
  }

  function renderContact(site, resume) {
    var c = site.contact || {};
    var b = resume.basics;
    if (c.headline) $('contact-title').textContent = c.headline;
    $('contact-body').textContent = c.body || '';
    var mail = $('contact-email');
    mail.href = 'mailto:' + b.email;
    mail.innerHTML = esc(c.button || b.email) + ' <span class="vk-arrow">→</span>';
    var city = b.location && b.location.city;
    $('foot-name').textContent = '© ' + new Date().getFullYear() + ' ' + b.name + (city ? ' · ' + city : '');
    $('foot-links').innerHTML = (b.profiles || []).map(function (p) {
      return '<a href="' + esc(p.url) + '" rel="noopener">' + esc(p.network) + ' ↗</a>';
    }).join(' &nbsp;·&nbsp; ');
  }

  // ---------- behaviour ----------
  function setupReveal() {
    var el = $('thesis');
    var words = el.textContent.split(/\s+/).filter(Boolean);
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + esc(w) + '</span>'; }).join(' ');
    var spans = el.querySelectorAll('.w');
    function paint() {
      var progress = 1;
      if (!reduceMotion) {
        var r = el.getBoundingClientRect(), vh = window.innerHeight;
        // 0 when the top crosses 80% of the viewport, 1 when the bottom crosses 30%.
        progress = (vh * 0.8 - r.top) / (vh * 0.8 - vh * 0.3 + r.height);
        progress = Math.max(0, Math.min(1, progress));
      }
      var n = Math.round(progress * spans.length);
      spans.forEach(function (s, i) { s.classList.toggle('on', i < n); });
    }
    paint();
    if (!reduceMotion) window.addEventListener('scroll', paint, { passive: true });
  }

  function setupFade() {
    var els = document.querySelectorAll('.vk-fade');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function setupNav() {
    var nav = $('nav');
    function onScroll() {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
      // Back at the hero: no section is current.
      if (window.scrollY < window.innerHeight * 0.5) $('nav-links').querySelectorAll('a').forEach(function (a) { a.removeAttribute('aria-current'); });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var links = $('nav-links'), menu = $('menu');
    menu.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }
    });

    // Mark the section in view as current.
    var anchors = links.querySelectorAll('a');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          anchors.forEach(function (a) {
            if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['work', 'principles', 'experience', 'contact'].forEach(function (id) { if ($(id)) io.observe($(id)); });
    }
  }

  function setupTheme() {
    var btn = $('theme'), root = document.documentElement;
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    function current() { return root.dataset.theme || (mq.matches ? 'dark' : 'light'); }
    function label() { btn.setAttribute('aria-label', 'Switch to ' + (current() === 'dark' ? 'light' : 'dark') + ' theme'); }
    label();
    mq.addEventListener && mq.addEventListener('change', label);
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('vk-theme', next); } catch (e) {}
      label();
    });
  }

  setupNav();
  setupTheme();

  Promise.all([getJSON('data/site.json'), getJSON('data/resume.json')]).then(function (res) {
    var site = res[0], resume = res[1];
    applyName(resume);
    renderHero(site, resume);
    $('thesis').textContent = site.thesis || '';
    renderProjects(site.projects);
    renderPrinciples(site.principles);
    renderExperience(resume);
    renderContact(site, resume);
    setupReveal();
    setupFade();
  }).catch(function (err) {
    console.error(err);
    document.querySelectorAll('.vk-fade').forEach(function (e) { e.classList.add('is-in'); });
  });
})();
