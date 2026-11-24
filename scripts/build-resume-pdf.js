// Prints resume.html to resume/vuk-svilaric-resume.pdf (one Letter page) from data/resume.json.
// Usage: npm run resume:pdf   (needs Playwright with Chromium: npm i -D playwright && npx playwright install chromium)
const path = require('path');
const http = require('http');
const connect = require('connect');
const serveStatic = require('serve-static');

let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const out = path.join(root, 'resume', 'vuk-svilaric-resume.pdf');

(async () => {
  const server = http.createServer(connect().use(serveStatic(root))).listen(0);
  const port = server.address().port;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ media: 'print' });
    await page.goto(`http://localhost:${port}/resume.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('html[data-ready="true"]', { timeout: 15000 });
    const { fit, size } = await page.$eval('#page', (el) => ({ fit: el.dataset.fit, size: el.dataset.size }));
    if (fit !== 'ok') throw new Error('Résumé does not fit on one page even at the smallest type size. Trim some bullets.');
    await page.pdf({ path: out, format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1' });
    console.log(`Wrote ${path.relative(root, out)} (base type ${size}pt)`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
