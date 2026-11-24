// Sanity checks for the content files, so a typo in the JSON fails before it ships.
// Usage: npm test
const fs = require('fs');
const path = require('path');

const read = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8'));
const errors = [];
const need = (cond, msg) => { if (!cond) errors.push(msg); };
const isDate = (d) => /^\d{4}(-\d{2})?(-\d{2})?$/.test(d);

const resume = read('resume.json');
need(resume.basics && resume.basics.name, 'resume.basics.name is required');
need(resume.basics && /@/.test(resume.basics.email || ''), 'resume.basics.email is required');
(resume.work || []).forEach((w, i) => {
  need(w.name && w.position, `work[${i}] needs name and position`);
  need(isDate(w.startDate || ''), `work[${i}].startDate must look like YYYY-MM`);
  need(!w.endDate || isDate(w.endDate), `work[${i}].endDate must look like YYYY-MM`);
  need(Array.isArray(w.highlights) && w.highlights.length, `work[${i}] needs at least one highlight`);
});

const site = read('site.json');
need(site.hero && site.hero.headline, 'site.hero.headline is required');
need(Array.isArray(site.projects) && site.projects.length >= 1 && site.projects.length <= 6, 'site.projects should hold 1 to 6 projects');
(site.projects || []).forEach((p, i) => {
  need(p.title && p.summary && p.meta, `projects[${i}] needs meta, title and summary`);
  need((p.tags || []).length + (p.ai ? 1 : 0) <= 3, `projects[${i}] has more than 3 tags (ai counts as one)`);
});
need((site.principles || []).length >= 3, 'site.principles needs at least 3 items');

if (errors.length) { console.error(errors.map((e) => '✗ ' + e).join('\n')); process.exit(1); }
console.log('✓ content files look good');
