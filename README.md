# Sigcraft

Sigcraft builds a professional, Gmail-ready email signature and gives you ready-to-send email templates. Fill in your details, pick one of 12 layouts and any colour, then copy the signature and paste it into Gmail's settings. The preview shows exactly what Gmail will get.

It's for anyone who wants a clean signature without hand-writing email HTML, especially people sending job applications, recruiter replies and client emails.

> **Status:** pre-release (`0.1.0`), not yet deployed. Copied signatures load their icons and photo from `https://sigcraft.netlify.app`, so they show images only once the site is live there (or at the address set in [`VITE_SITE_URL`](#configuration)).

## What you can do

**Signature generator** (`/`), in four steps with a live preview in a mail window:

- **Details:** name, job title, department, company, pronouns, a slogan of up to 120 characters, office and mobile phone, website, email, address, and seven social profiles (LinkedIn, GitHub, X, Facebook, Instagram, YouTube, WhatsApp).
- **Images:** show or hide a profile photo, set its public URL, shape (circle, rounded, square) and size.
- **Templates:** 12 layouts arranging photo, name, contacts, social icons and an optional button.
- **Styles:** any theme colour (nine presets or a custom hex), text and link colours, eight email-safe fonts, three font sizes, icon styles (contact: soft circle, solid circle, outline; social: the same three plus brand colours), your own icon images, the slogan's position (a footer line below the signature, or under your name) and style (italic, plain or accent), and an optional call-to-action button.
- **Create signature:** copy it as rich HTML (for pasting into Gmail), raw HTML or plain text, with the Gmail setup steps and a character count against Gmail's 10,000-character limit.

**Email templates** (`/templates`): eight emails for job search (applying, recruiter reply, follow-up, interview thank-you, referral request, declining an offer), client work (project inquiry) and meetings. It uses the same editor layout as the signature generator: a **Templates** tab to pick the email, and a **Details** tab whose form asks for the details the chosen email needs (name, company, role, days, times and so on; name and role start with the signature's defaults) and fills them in as you type, so the subject and body are ready to copy. Anything still empty stays highlighted, and the details you enter carry over to every template that uses them. **Create email** opens the copy buttons with steps to send it from Gmail or save it as a Gmail template.

Your details are saved only in your own browser. The app has a light, dark and system theme.

## Quick start

**Requirements:** Node.js 22.13 or newer and pnpm 11. With Corepack, `corepack enable` picks up the exact pnpm version from `package.json`.

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. You should see the signature generator with a sample signature in the preview; the email templates are at <http://localhost:3000/templates>.

`pnpm dev` loads its variables from Infisical, so you also need the [Infisical CLI](https://infisical.com/docs/cli/overview), signed in with `infisical login` and with access to the linked project (see [Configuration](#configuration)). Without access, run `pnpm exec vite dev --port 3000` instead; the app falls back to its defaults.

## Use your signature in Gmail

1. In Sigcraft, click **Create signature**, then **Copy signature**.
2. In Gmail, open **Settings → See all settings**.
3. On **General**, scroll to **Signature** and click **Create new**.
4. Click in the editor and press **Ctrl + V** (not "paste as plain text").
5. Under **Signature defaults**, choose it for new emails and for replies.
6. Tick **Insert signature before quoted text**, which also removes the `--` line Gmail adds.
7. Click **Save Changes**.

Gmail loads the photo and icons from the web each time an email is shown, so they appear only while the site that serves them is online.

## Configuration

| Variable        | Required | Default                        | Purpose                                                                                                                                        |
| --------------- | -------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL` | No       | `https://sigcraft.netlify.app` | Public address that copied signatures load their photo and icons from, and the base for canonical and social-preview URLs. Read at build time. |

Variables live in the Infisical project linked by [`.infisical.yaml`](.infisical.yaml): the `dev` environment for local work and `prod` for the deployed site, both at path `/`. [`.env.example`](.env.example) lists names and example values only; don't copy it to a local secrets file, because Vite's `.env` loading is turned off.

- **Locally,** `pnpm dev` and `pnpm preview` fetch the `dev` variables with `infisical run` and pass them to Vite. Restart the command after changing a value.
- **On Netlify,** the build reads the site's environment variables. Keep them in step with Infisical's `prod` environment, either with an [Infisical Netlify secret sync](https://infisical.com/docs/integrations/secret-syncs/netlify) or by copying the values under **Site configuration → Environment variables**. `VITE_SITE_URL` is read at build time, so redeploy after changing it.
- `pnpm build`, the tests and the static checks don't need Infisical; without the variable, the default address is used.

## How it works

- **Email-safe HTML.** [`src/features/signature/build-signature.ts`](src/features/signature/build-signature.ts) turns the editor state into tables with inline styles only: no classes, no SVG and no percentage widths. Gmail keeps that markup, and the signature stays the same size in any window.
- **One markup, two image hosts.** The preview and the copied signature are built from the same markup. The preview loads images from this site's own paths; the copy uses absolute URLs on `VITE_SITE_URL`, which Gmail can fetch.
- **Icons drawn on request.** [`src/routes/api/icon/v1/$style/$color/$file.ts`](src/routes/api/icon/v1/$style/$color/$file.ts) serves PNG icons such as `/api/icon/v1/soft/ff4800/phone.png`. [`src/server/render-icon.ts`](src/server/render-icon.ts) draws the Hugeicons glyph at 4× display size with no image libraries. Each URL fully describes its image, so responses are cached for a year and Netlify's CDN serves repeat requests.
- **Social previews.** Each page sets its title, description, canonical URL, Open Graph and Twitter Card tags in the server-rendered HTML ([`src/lib/site.ts`](src/lib/site.ts)), with a 1200×630 PNG at [`public/og/sigcraft-og-v1.png`](public/og/sigcraft-og-v1.png).
- **Support button.** [`src/components/support-widget.tsx`](src/components/support-widget.tsx) loads the SupportKori widget once after hydration, opens it in an in-page panel, and adds keyboard and screen-reader support to its trigger. Its styling follows the app's primary button.

```
src/
  routes/                  pages (/ and /templates), the icon API route, and the root layout
  features/signature/      editor steps, signature builder, icon styles, config and state
  features/email-templates/ email template data and page
  server/render-icon.ts    PNG icon renderer used by the icon route
  components/              header, theme toggle, support widget, shadcn/ui components
  lib/                     site metadata, clipboard helpers, cn()
  start.ts                 security headers for server responses
public/                    photo, favicons, web manifest and social preview image
```

Built with [TanStack Start](https://tanstack.com/start), React 19, TypeScript, Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com) with Hugeicons.

## Scripts

| Command          | What it does                                           |
| ---------------- | ------------------------------------------------------ |
| `pnpm dev`       | Start the dev server on port 3000                      |
| `pnpm build`     | Production build (client, server and Netlify function) |
| `pnpm preview`   | Preview the production build locally                   |
| `pnpm test`      | Run the Vitest unit tests                              |
| `pnpm lint`      | Run ESLint                                             |
| `pnpm typecheck` | Run the TypeScript compiler without emitting           |
| `pnpm format`    | Format with Prettier                                   |
| `pnpm check`     | Check formatting without writing                       |

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs `check`, `lint`, `typecheck`, `test` and `build` on every push to `main` and on pull requests.

## Deployment

Sigcraft is a server-rendered app deployed on Netlify through the official `@netlify/vite-plugin-tanstack-start` adapter. [`netlify.toml`](netlify.toml) holds the whole build setup:

- build command `pnpm build`, publish directory `dist/client`, with Node 22.23.2 and pnpm 11.7.0;
- the server function is generated at build time; no SPA redirect is needed;
- security headers (HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) on static files, with the same set added to server responses by [`src/start.ts`](src/start.ts);
- long-lived caching for fingerprinted assets and cross-origin access for the signature photo.

To deploy, connect the GitHub repository in Netlify and name the site `sigcraft`, or set `VITE_SITE_URL` to the address you use.

## Limitations

- **Images depend on the live site.** If the site serving `/api/icon` and the photo goes offline or moves, images break in every email already sent. Custom icon and photo URLs must also stay public.
- **Email clients differ.** Gmail shows the signature as previewed. Outlook on Windows shows round photos and icons as squares.
- **No content security policy yet.** The page loads Google Fonts and the SupportKori widget; a CSP should be added once those origins are confirmed on the deployed site.
- **Privacy.** There are no accounts or server-side storage. Signature details stay in the visitor's browser (`localStorage`); clearing site data or using another browser starts fresh.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks and code conventions. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

This repository does not include a license file yet, so no reuse rights are granted beyond what GitHub's terms allow for viewing and forking.
