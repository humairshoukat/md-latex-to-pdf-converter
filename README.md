# MathPaper

A static Markdown + LaTeX to PDF converter. Copy the visible AI prompt, append it to your AI request, paste the response, and check the preview. Click **Save PDF**, then choose **Save as PDF** in your browser's print dialog. Use Chrome or Edge, A4 paper, and disable browser-added headers and footers if shown.

All rendering happens in the browser. There are no conversion APIs, document uploads, database, API keys or external fonts. Only `static/` is deployed. There is no build step or package installation.

## Run locally

```sh
npm start
```

Open <http://127.0.0.1:8765/>. The local server requires Python 3. The checked-in static files need no dependency installation to run. For another port, use `python3 -m http.server 8766 --bind 127.0.0.1 --directory static`.

## Edit and test

The app has four editable files:

- `static/index.html` — layout and the visible AI prompt.
- `static/styles.css` — screen and PDF styles.
- `static/app.js` — preview, copy and print controls.
- `static/converter.js` — Markdown/LaTeX rendering and validation.

Changes work immediately after refreshing the browser. Run `npm test` with Node.js 22 or newer to check the converter; no `npm install` is needed.

`static/vendor/` contains the prepackaged Markdown and maths libraries, Unicode symbol compatibility code, and their license/version notices. Keep these files: they provide the actual maths support. Regression checks are in `tests/`. To rebuild the libraries, run `npm install` followed by `npm run vendor`. Regenerate Unicode substitutions with `python3 scripts/generate-math-variants.py`.

## Deploy

**GitHub Pages:** Push to `main` and select **Settings > Pages > GitHub Actions**. The included workflow tests and deploys `static/` directly. Change the workflow branch if needed.

**Vercel:** Import the repository, disable installation and build commands, and set the output directory to `static/`.

Other static hosts can serve `static/` directly. Hosting bandwidth and plan limits still apply; conversions use no server computation.

## Input

Use Markdown headings and numbered questions, `$...$` for inline maths, and `$$...$$` for display maths. Leave blank lines around display equations and indent them by three spaces inside numbered questions. `\(...\)` and `\[...\]` are also accepted. The app removes a single enclosing Markdown code fence automatically.

Images, diagrams, embedded code blocks and full LaTeX documents are not supported. The app reports unsupported notation; it cannot verify mathematical truth or the intended placement of valid brackets. Split very wide equations manually if they do not fit the PDF page.
