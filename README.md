# portfolio-web

Vuk Svilarić's portfolio site, built on the "Vuk Svilarić" design system (cobalt accent, Instrument Sans + IBM Plex Mono, Daylight and Night themes).

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
- A project card shows its index numeral over the dot grid until you give it an `image` (a path under `img/`). Add `href` to link it to a case study. `"ai": true` adds the single accent `ai-native` tag.
- Run `npm test` after editing to catch a broken JSON file or a missing field.

## Design tokens

`design/tokens.json` is a copy of the design system's tokens. After changing it, run `npm run tokens` to regenerate `css/tokens.css`. `css/components.css` is the design system's component stylesheet (`vk-` classes); `css/site.css` holds page layout only.

## Running locally

```sh
npm install
npm start   # http://localhost:8080
```
