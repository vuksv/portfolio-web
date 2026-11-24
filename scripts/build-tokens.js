// Regenerates css/tokens.css from design/tokens.json (a copy of the design system's tokens).
// Usage: npm run tokens
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const t = JSON.parse(fs.readFileSync(path.join(root, 'design/tokens.json'), 'utf8'));

const themed = [...t.color.tokens, ...((t.shadow && t.shadow.tokens) || [])];
const light = themed.map((x) => `  --${x.name}: ${typeof x.value === 'string' ? x.value : x.value.light};`);
const dark = themed.map((x) => `  --${x.name}: ${typeof x.value === 'string' ? x.value : x.value.dark || x.value.light};`);
const fixed = [
  ...Object.entries(t.type.families).map(([k, v]) => `  --font-${k}: ${v};`),
  ...t.spacing.tokens.map((x) => `  --${x.name}: ${x.value};`),
  ...t.radius.tokens.map((x) => `  --${x.name}: ${x.value};`),
];

const css = `/* ${t.name} — generated from design/tokens.json by scripts/build-tokens.js. Do not edit by hand. */
:root {
${fixed.join('\n')}
  --ease: cubic-bezier(.2,.7,.2,1);
  color-scheme: light;
${light.join('\n')}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${dark.map((l) => '  ' + l).join('\n')}
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
${dark.join('\n')}
}
`;
fs.writeFileSync(path.join(root, 'css/tokens.css'), css);
console.log('Wrote css/tokens.css');
