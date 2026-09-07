# tinytools

**Tiny Tools** — the portfolio hub / discovery homepage for the whole collection
of small web tools and games.

**Live:** https://tinytools.correia95.workers.dev/

## How it works

- [`src/registry.json`](src/registry.json) is the **single source of truth** for the
  app listing (slug, name, category, action verb, featured flag, launch date,
  description). `PORTFOLIO.md` in the repo root is the prose companion.
- [`src/config.ts`](src/config.ts) holds `PORTFOLIO_ORIGIN` — the one place the
  production domain lives. When a real domain is bought, change it there and
  redeploy; nothing else hard-codes the domain.
- The page is a single static React view: hero → featured → searchable/filterable
  grid of everything. Client-side only, no backend.
- `public/sitemap.xml` is generated from the registry (a node one-liner in the
  build notes) and lists the hub plus every app URL.

## Adding a new app (do this on every launch)

1. Add an entry to `src/registry.json` (slug, name, category, action, description,
   launched, featured).
2. Regenerate `public/sitemap.xml` from the registry.
3. `npm run deploy`.
4. Open the live hub and confirm the new card shows in its category and in search.

## Develop / deploy

```bash
npm install
npm run dev
npm run deploy
```
