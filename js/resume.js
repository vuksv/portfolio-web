// Renders the one-page printable résumé from data/resume.json, then shrinks the type until it fits one Letter sheet.
(function () {
  'use strict';
  var page = document.getElementById('page');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d) {
    if (!d) return 'Present';
    var p = d.split('-');
    return p[1] ? MONTHS[+p[1] - 1] + ' ' + p[0] : p[0];
  }
  function host(u) { return String(u || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); }

  function render(r) {
    var b = r.basics;
    var contact = [
      '<li><a href="mailto:' + esc(b.email) + '">' + esc(b.email) + '</a></li>',
      b.url ? '<li><a href="' + esc(b.url) + '">' + esc(host(b.url)) + '</a></li>' : ''
    ].concat((b.profiles || []).map(function (p) {
      return '<li><a href="' + esc(p.url) + '">' + esc(host(p.url)) + '</a></li>';
    }));
    if (b.location && b.location.city) contact.push('<li>' + esc(b.location.city + (b.location.region ? ', ' + b.location.region : '')) + '</li>');

    var work = (r.work || []).map(function (w) {
      // printHighlights (optional) keeps only the first N bullets on the one-page version; the site shows them all.
      var hl = w.highlights || [];
      if (typeof w.printHighlights === 'number') hl = hl.slice(0, w.printHighlights);
      var bullets = hl.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('');
      return '<div class="rs-row">' +
        '<div class="rs-when">' + esc(fmtDate(w.startDate)) + ' –<br>' + esc(fmtDate(w.endDate)) + '</div>' +
        '<div><h3 class="rs-title">' + esc(w.position) + '</h3><p class="rs-org">' + esc(w.name) + '</p>' +
        '<ul class="rs-bullets">' + bullets + '</ul></div></div>';
    }).join('');

    var edu = (r.education || []).map(function (e) {
      return '<div class="rs-row rs-edu">' +
        '<div class="rs-when">class of<br>' + esc((e.endDate || '').split('-')[0]) + '</div>' +
        '<div><h3 class="rs-title">' + esc(e.institution) + '</h3>' +
        '<p class="rs-org">' + esc(e.studyType) + ' · ' + esc(e.area) + '</p></div></div>';
    }).join('');

    var skills = (r.skills || []).map(function (s) {
      return '<dt>' + esc(s.name) + '</dt><dd>' + esc((s.keywords || []).join(', ')) + '</dd>';
    }).join('');

    document.title = b.name + ' · Résumé';
    page.innerHTML =
      '<header class="rs-head"><div>' +
        '<h1 class="rs-name">' + esc(b.name) + '</h1>' +
        '<p class="rs-role">' + esc(b.label) + '</p>' +
        (b.summary ? '<p class="rs-summary">' + esc(b.summary) + '</p>' : '') +
      '</div><ul class="rs-contact">' + contact.join('') + '</ul></header>' +
      '<section class="rs-section"><h2 class="rs-eyebrow"><span>01</span><span>Experience</span></h2>' + work + '</section>' +
      '<section class="rs-section"><h2 class="rs-eyebrow"><span>02</span><span>Education</span></h2>' + edu + '</section>' +
      '<section class="rs-section"><h2 class="rs-eyebrow"><span>03</span><span>Skills</span></h2><dl class="rs-skills">' + skills + '</dl></section>';
  }

  // Shrink the base size in small steps until the content fits the fixed-height sheet.
  function fit() {
    var size = 9.5;
    page.style.fontSize = size + 'pt';
    while (page.scrollHeight > page.clientHeight + 1 && size > 7.6) {
      size = Math.round((size - 0.1) * 10) / 10;
      page.style.fontSize = size + 'pt';
    }
    page.dataset.fit = page.scrollHeight <= page.clientHeight + 1 ? 'ok' : 'overflow';
    page.dataset.size = String(size);
  }

  fetch('data/resume.json', { cache: 'no-cache' })
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (r) {
      render(r);
      var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      return ready.then(function () {
        // Only fit on the sheet layout (wide screens and print); phones get a flowing page.
        if (window.matchMedia('print, (min-width: 8.6in)').matches) fit(); else page.dataset.fit = 'ok';
        document.documentElement.dataset.ready = 'true';
      });
    })
    .catch(function (e) { console.error(e); page.textContent = 'Could not load the résumé.'; });
})();
