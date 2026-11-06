# Gio Lopez — Portfolio

A responsive React / TypeScript portfolio for **Jose Giovanni Miguel T. Lopez**, a BSIT student at National University – Baliwag seeking internship / OJT opportunities. Built directly in the existing Vite project. Nothing has been deployed or pushed.

## Run locally

Use Node.js 24 LTS and npm. In PowerShell on a machine that blocks `npm.ps1`, use `npm.cmd` as shown; changing your execution policy is unnecessary.

```powershell
npm.cmd install
npm.cmd run dev
```

Open the Local URL printed by Vite (normally `http://localhost:5173`). The development server includes the real `/api/contact` handler. Copy `.env.example` to `.env.local` when you are ready to configure it; restart Vite after changing environment variables.

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run preview
npm.cmd run test:e2e
```

`preview` serves the static production build only. It does **not** run Vercel functions; the contact section falls back to email. Use `dev` for local API checks or `vercel dev` if you later install the Vercel CLI. Browser tests use an installed Chrome browser and include desktop / mobile coverage with Playwright and axe. Change `channel: 'chrome'` in `playwright.config.ts` if your test environment uses another browser.

## Implemented

- Original ivory, charcoal, and teal visual design; a self-hosted DM Sans font; responsive desktop, tablet, and mobile layouts.
- Responsive navigation, active section indicators, skip link, visible focus states, reduced-motion support, and subtle scroll reveals.
- Hero, about, categorized verified skills, education and academic project experience, resume, contact, social links, and dynamic copyright.
- Four typed project records with POSEIDON featured first. Filters, detailed case studies, shareable `/?project=poseidon` URLs, browser history, native modal focus containment, Escape dismissal, and focus restoration.
- Actual-asset discovery, honest missing-asset states, screenshot galleries, and image-error fallbacks. No generated project screenshots, fabricated employment, or public phone number.
- Conditional PDF preview, download, open-in-new-tab, unsupported-browser fallback, and a clear missing-file state.
- Server-side Resend endpoint with validation, byte / field limits, honeypot, same-origin checks, rate limiting, provider timeouts, plain-text emails, reply-to, and idempotency.
- SEO and Open Graph metadata, a custom favicon, social artwork, static 404 page, and Vercel security headers.

## Source layout

```text
src/
  App.tsx, App.css, index.css
  components/    reusable project views, brand icons, contact form
  sections/      resume preview and missing-file state
  data/          typed content and generated asset manifest
  hooks/         scroll navigation and reduced-motion-aware reveals
api/contact.ts   Vercel entry point
server/contact.ts shared server-only handler; also used by local Vite
scripts/prepare-assets.mjs
tests/contact.test.ts
tests/browser/portfolio.spec.ts
public/images/
public/projects/{poseidon,hanap,brewbite,rizal}/
public/resume/
```

Existing starter assets remain in place and are no longer referenced. Private documentation and credentials should never be placed in `public/`.

## Add the real assets

| Asset                  | Required path / instructions                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Professional photo     | `public/images/gio-lopez.webp` (also accepts `.avif`, `.jpg`, `.jpeg`, `.png`; use one). Portrait crop, preferably around 680 × 820, compressed for the web. |
| Resume                 | **`public/resume/Gio-Lopez-Resume.pdf`**. The asset scanner checks the PDF header.                                                                           |
| POSEIDON screenshots   | Actual images in `public/projects/poseidon/`                                                                                                                 |
| HANAP screenshots      | Actual images in `public/projects/hanap/`                                                                                                                    |
| BrewBite screenshots   | Actual images in `public/projects/brewbite/`                                                                                                                 |
| Rizal game screenshots | Actual images in `public/projects/rizal/`                                                                                                                    |

The scanner runs before `dev` and `build`. After adding assets, restart the dev server or run `npm.cmd run assets`. It only references files that exist. Missing images produce labeled typographic placeholders; missing PDFs produce an email request link instead of a broken download.

Screenshots accept AVIF, WebP, PNG, and JPEG. Files are sorted by name, so use names such as `01-dashboard.webp`, `02-mobile.webp`. The first image is the card cover. Add a `captions.json` in the same project directory for descriptive alt text and captions:

```json
{
  "01-dashboard.webp": "POSEIDON dashboard showing water quality readings",
  "02-mobile.webp": "POSEIDON mobile application pond overview"
}
```

Use captions that describe the images you actually supply. Optimize screenshots, remove credentials, and avoid exposing worker / client personal information. See `public/ASSETS.md` for the remaining asset checklist.

## Content that still needs verification

All supplied details are centralized in `src/data/content.ts`. UI copy distinguishes Gio’s individual academic work from team work.

- **POSEIDON:** project description, technology stack, features, three-member team, and Gio’s responsibilities come from the supplied brief. No capstone paper, code, or screenshots were available. Do not upload the entire paper into `public/` without approval. The supplied admin login URL could not be reached in this environment; it is labeled login-protected and availability-unverified in the case study. Set `demoVerified: true` only after confirming the site works; that enables the card’s live-demo button.
- **HANAP:** Gio reports an individual full-stack / UI design project. Its listed features await confirmation against screenshots or code. No repository or demo was supplied.
- **BrewBite-MVC:** the supplied GitHub link returned 404 through the GitHub connector. Only PHP and MVC architecture are confirmed. Purpose, target users, features, database use, exact MVC structure, and Gio’s contributions remain unverified. The supplied URL is retained in typed data. Visitor-facing repository buttons remain hidden until access is confirmed and `repoVerified` is set to `true`.
- **Rizal game:** original source is unavailable. No screenshots, engine, mechanics, technologies, or detailed individual role were supplied.
- The reference site `juliansantos.site` could not be reached; the design was developed from the requested visual direction.
- No dates of attendance, graduation year, employment, awards, certificates, outcomes, or proficiency percentages have been invented.

## Resend configuration

Email delivery has **not been tested**. With absent configuration, the form is disabled, `/api/contact` reports `configured: false`, POST requests return a truthful error, and visitors can use `mailto:lopezjgm999@gmail.com`.

1. Purchase a domain you control when ready. Add a sending domain or subdomain, such as `mail.your-domain.com`, to Resend.
2. Add the exact DNS verification records Resend provides to that domain’s DNS provider. Wait for Resend to show it as verified. Use the provider’s current records, including SPF / DKIM and any return-path requirements; do not guess DNS values. Set a suitable DMARC policy separately.
3. Create a Resend sending API key. Put it in `.env.local` locally and in Vercel Project Settings → Environment Variables for the desired environments.
4. Set these **server-only** variables:

```dotenv
RESEND_API_KEY=your-real-key
CONTACT_FROM_EMAIL=portfolio@mail.your-domain.com
CONTACT_TO_EMAIL=lopezjgm999@gmail.com
```

`CONTACT_FROM_EMAIL` must be a plain email address on your verified domain; consumer email addresses, display-name formats, and `resend.dev` test senders are intentionally rejected by this app. The visitor’s email is sent as Resend’s `reply_to`, never as the authenticated sender. The endpoint uses Resend’s HTTP API directly, so no Resend SDK dependency is needed.

5. For rate limiting shared across Vercel instances, create an Upstash Redis database and set **both** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. The server uses an atomic expiring counter: five valid submission attempts per IP per ten minutes. IPs are HMAC-hashed; raw IPs and messages are not stored in Redis. When configured, storage failures stop sending. Without Upstash, a bounded in-memory limiter exists, but it resets on cold starts and is **not a deployment-wide rate limit**. Configure persistent storage before publicly enabling the form.
6. `CONTACT_ALLOWED_ORIGIN` is optional. By default, browser requests must match the request host, including preview URLs. Set an exact origin only if you want to restrict the endpoint to one canonical domain. Vercel’s client-IP header must remain platform-controlled; review proxy trust if hosting elsewhere.
7. Restart locally or redeploy after changing variables. `configured: true` checks configuration shape only; it cannot verify your API key, DNS, or actual delivery. Send a controlled test, check Resend’s accepted/delivered status, and confirm inbox receipt before describing delivery as working.

The form blocks concurrent submissions. Retrying the same payload reuses its Resend idempotency key. Success means the provider accepted the message; it does not guarantee inbox delivery. Plain-text email bodies prevent visitor-supplied HTML from being rendered as email markup. Secrets never use `VITE_` variables and are excluded from Git. No credentials have been created or stored.

Official references: [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email), [domain verification](https://resend.com/docs/dashboard/domains/introduction), [Upstash Redis REST](https://upstash.com/docs/redis/features/restapi).

## Vercel and custom domain — when authorized later

No deployment, Git commit, or push was performed.

1. Complete the asset and content items above; run lint, API tests, browser checks, and build.
2. When you authorize publishing, import this existing repository into Vercel. Use the Vite preset, the repository root, `npm run build`, output `dist`, and Node.js 24. `vercel.json` includes the function and security headers. No SPA catch-all rewrite is required: case studies use query parameters on `/`.
3. Add the Resend and optional Upstash environment variables in Vercel. Scope preview and production credentials intentionally. Keep the form unconfigured until the sending domain is verified.
4. Review a preview deployment. Verify the API is deployed separately from static assets, all project views work, resume links work, and the form’s unconfigured / error / accepted states are accurate.
5. Add your purchased website domain in Vercel Project Settings → Domains. Apply the exact A / CNAME / verification records Vercel provides at your DNS provider, choose a canonical apex or `www` hostname, and wait for DNS and HTTPS provisioning. Website hosting DNS and Resend sending DNS serve different purposes and may coexist.
6. Set `og:url`, a canonical `<link>`, and absolute social-image URLs in `index.html` to the final HTTPS domain. Social artwork is supplied as editable SVG and a 1200 × 630 PNG for crawler support. Do not add a fictional production URL. Add a sitemap after choosing the domain.
7. Confirm keyboard navigation, actual mobile devices, a real resume PDF in multiple browsers, and a controlled contact-form delivery test. Publish production only once these are ready.

Vercel references: [Vite deployments](https://vercel.com/docs/frameworks/frontend/vite), [Node.js functions](https://vercel.com/docs/functions/runtimes/node-js), [custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

## Dependencies and checks

Added runtime dependencies: `lucide-react`, `@fontsource-variable/dm-sans`. Added development dependencies: `@playwright/test`, `@axe-core/playwright`. React, TypeScript, Vite, and ESLint remain the existing stack. Styling uses plain CSS; no animation or CSS framework dependency is required.

The API tests use Node’s built-in test runner and mocked HTTP responses; they never send real emails. Browser tests cover responsive widths from 320–1440px, navigation, all project cards, case-study history / Escape / focus restoration, missing-file states, submission errors, and automated WCAG 2.2 AA checks. Automated checks do not replace manual screen-reader and real-device review.

Validation completed: `npm run lint` and `npm run build` pass; all **15 API tests** and **10 desktop/mobile browser tests** pass. Automated axe checks found no WCAG 2.2 AA violations on the homepage and POSEIDON case study in the tested desktop/mobile configurations. Overflow checks pass at 320, 375, 768, 1024, and 1440 pixels. Production assets were visually reviewed. Actual resume rendering and real email delivery remain untested because those inputs are missing.

`npm audit --omit=dev` reports **zero vulnerabilities**. The full dependency audit reported a moderate `minimatch` advisory propagated through the existing ESLint / TypeScript ESLint development tree (10 reported entries, one underlying advisory). These tools are not part of the deployed browser or contact API. A forced tooling downgrade has not been applied. Review upstream compatible fixes before introducing dependency overrides.
