# John King Online CV

This repository contains John King's current 2026 CV and software engineering portfolio site.

The primary public site is the static portfolio at `index.html`, supported by `css/style.css`, `js/`, `img/`, and the local library assets in `lib/`. It presents the current profile, skills, experience, education, portfolio work, certifications, contact details, and downloadable CV PDF.

## Primary entry points

- `index.html` - the active 2026 portfolio and CV site.
- `img/John_King_CV.pdf` - the downloadable CV linked from the site.
- `server.js` - optional dependency-free Node static server for local preview or Node-based hosting.
- `package.json` - project metadata for the portfolio site.

Canonical public URL: `https://johnh-king.github.io/Online-CV/`.

## Public HTML audit

- `index.html` - canonical 2026 CV page, with canonical metadata for the public URL.
- `hindex.html` - archived Node/Mongo demo, marked `noindex,nofollow` and linked back to the canonical CV.
- `render-html/index.html` - archived rendered CV experiment, marked `noindex,nofollow` and linked back to the canonical CV.
- `page4.html` and `page6.html` - archived Steam API tutorial pages, marked `noindex,nofollow` and linked back to the canonical CV.

## Run locally

The site can be opened directly from `index.html`, or served through Node:

```sh
npm start
```

Then open `http://localhost:8080`.

## Project layout

- `index.html` - current portfolio markup and active page metadata.
- `css/style.css` - current portfolio styling, including responsive layout and dark mode support.
- `img/` - profile images, certificates, portfolio screenshots, and CV PDFs.
- `lib/` - vendored Bootstrap, jQuery, and validation assets used by the site.

## Legacy material

Some older experiments are retained for historical reference, but they are not part of the active 2026 CV site:

- `hindex.html`, `render-html/`, `app.js`, `api/`, `models/`, and `routes/` contain earlier Node.js, MongoDB, and Heroku CV/API experiments.
- `page4.html`, `page6.html`, `js/script.js`, and `api/steam/` contain older API tutorial/demo code.
- Legacy HTML demo pages are marked with archive notices and `noindex` metadata so the root portfolio remains the clear primary site.
- Legacy Node demos may need their own dependency refresh before they can be run again.

Current portfolio changes should generally be made in `index.html`, `css/style.css`, `js/`, and `img/`.
