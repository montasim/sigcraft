# Contributing to Sigcraft

Thanks for helping improve Sigcraft. This guide covers local setup, the checks every change must pass, and the conventions the codebase follows.

## Set up

Requirements: Node.js 22.13 or newer (CI and Netlify use 22.23.2) and pnpm 11 (`corepack enable` picks up the version from `package.json`).

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

No environment variables are needed for local development. See [`.env.example`](.env.example) for the one optional variable.

## Before you open a pull request

Run the same checks CI runs:

```bash
pnpm check        # formatting (Prettier)
pnpm lint         # ESLint
pnpm typecheck    # TypeScript
pnpm test         # Vitest unit tests
pnpm build        # production build
```

Run `pnpm format` to fix formatting automatically.

## Conventions

- **UI components:** use a shadcn/ui component wherever one exists for an HTML element. Add new ones with `pnpm dlx shadcn@latest add <component>`. If the CLI writes `import { cn } from "cn"` or adds a `cn` package, change the import to `@/lib/utils` and remove the package.
- **Icons:** import from `@/components/icons` (Hugeicons).
- **Signature HTML:** `src/features/signature/build-signature.ts` must keep emitting email-safe markup: tables and inline styles only, no classes, no SVG and no percentage widths. The tests in `build-signature.test.ts` guard these rules.
- **Icon drawings:** if you change `src/server/render-icon.ts`, bump `ICON_VERSION` in `src/features/signature/icon-styles.ts` so mail apps and the CDN fetch the new images.
- **Social preview image:** replace `public/og/sigcraft-og-v1.png` with a new versioned filename and update `src/lib/site.ts`, so crawlers don't keep the old image.

## Reporting bugs and security issues

Open a GitHub issue for bugs and feature requests. Report security problems privately as described in [SECURITY.md](SECURITY.md).
