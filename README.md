# portfolio-web

Vuk Svilaric's portfolio site, built on the "Vuk Svilaric" design system (cobalt accent, Instrument Sans + IBM Plex Mono, Daylight and Night themes).

It is a static site with no build step: plain HTML, CSS and one script that renders the page from two JSON files. `index.js` serves it locally and on App Engine.

## Updating content

All copy lives in `data/`, so editing the résumé never means touching markup.

| File | What it holds |
| --- | --- |
| `data/resume.json` | Work history, skills, education, contact details and profiles, in the [JSON Resume](https://jsonresume.org/schema) format. The Experience section and footer render from it, and it is served as-is at `/data/resume.json`. |
| `data/site.json` | Portfolio copy: availability chip, hero, thesis, selected work cards, principles and the contact section. |

Notes:

- Wrap a phrase in `*asterisks*` in `hero.headline` to set it in the accent color.
- Set `"status"` to `null` in `site.json` to hide the availability chip.
- Project cards are impact panels, not screenshots: `stat` (`{"value": "10M+", "label": "monthly active users"}`, or `null` to show the index numeral) and `flow` (three short steps shown as `a → b → c`). An optional `image` (a path under `img/`) replaces the panel. Add `href` to link a card to a case study.
- The name everywhere comes from `basics.name` in `resume.json`. `"ai": true` adds the single accent `ai-native` tag.
- Run `npm test` after editing to catch a broken JSON file or a missing field.

## Printable résumé

`resume.html` renders the same `data/resume.json` as a one-page Letter résumé in the site's design language, shrinking the type (never below 7.6pt) until it fits. Add `"printHighlights": N` to a `work` entry to keep only its first N bullets on the printed page; the site still shows them all.

After editing the résumé, regenerate the PDF the site links to:

```sh
npm i -D playwright && npx playwright install chromium   # once
npm run resume:pdf                                        # writes resume/vuk-svilaric-resume.pdf
```

## Design tokens

`design/tokens.json` is a copy of the design system's tokens. After changing it, run `npm run tokens` to regenerate `css/tokens.css`. `css/components.css` is the design system's component stylesheet (`vk-` classes); `css/site.css` holds page layout only.

## Running locally

```sh
npm install
npm start   # http://localhost:8080
```

## Deploying

Pushes to `master` deploy to App Engine through GitHub Actions. One-time Google Cloud setup: [docs/deploy.md](docs/deploy.md).
