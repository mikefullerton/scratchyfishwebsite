# scratchyfish.com on Next.js + Vercel (phase 1)

Provenance: merge `df74210` ("Move scratchyfish.com to Next.js on the family stack, deployed
by Vercel", PR #1), range `bdc9370..df74210`. The pre-move Jekyll site was backed up to a branch
by the owner before the merge.

## Goal of phase 1

Move scratchyfish.com off GitHub Pages (Jekyll) onto the same stack and deploy model as the other
family sites (fishlamp, the adh sites), **as-is** — no content or design changes. Content and
design work is later phases.

## The site

- **Stack:** Next 16 / React 19 / TypeScript, pnpm 9 workspace rooted at `websites/`, the one app
  at `websites/main` (App Router). Same layout as fishlampwebsite.
- **Layout** (tiers declared in `.abstractr.json`):
  - `src/content/` — data JSON (site, navigation, albums, bio, photos, videos, friends, shows) and
    `posts/*.md`, copied unchanged from Jekyll's `_data/` and `_posts/`. Images live in
    `public/assets/images/`.
  - `src/lib/` — typed content access (`content.ts`, `posts.ts`), Liquid-compatible date and
    excerpt filters, a kramdown-compatible markdown renderer (`marked` + `marked-smartypants`),
    SEO/JSON-LD.
  - `src/styles/style.css` — the Jekyll stylesheet, verbatim.
  - `src/components/` — header, footer, page shell, cards, link lists, member grid, lightbox.
  - `src/app/` — one route per Jekyll page, plus the news posts (`[year]/…`), member pages,
    `sitemap.ts` and `robots.ts`.
- **Parity:** a check against a snapshot of the live Jekyll site matched text, titles, meta, links
  and images on all 29 pages. The one deliberate difference is the empty lightbox `<img>`.
- **Submodules** under `websites/external/` (outside the pnpm workspace glob — each is its own
  workspace), the same ones fishlamp uses: `adhsdk` and `whatsnowtoolkit`
  (private, `fishlampdesign/whatsnowtoolkit`). Vercel's install step runs
  `websites/tools/fetch_submodules.py`, which authenticates with the `GH_SUBMODULE_TOKEN` env var.
- **Local serving:** `.sites/suite.toml` registers the site with the `sites` CLI
  (`https://scratchyfish.sites.localhost`; worktrees get a branch-suffixed suite).

## Deploying

Three Vercel projects in team `mikefullertons-projects`, region `sfo1`, root dir `websites/main`
(`websites/main/vercel.json` sets install/build):

| project | git repo | branch | domain | previews |
|---|---|---|---|---|
| `scratchyfish-production` | `DeploymentRepos/scratchyfishwebsite-deployment` | production branch | `scratchyfish.com`, `www.scratchyfish.com` | off |
| `scratchyfish-staging` | `DeploymentRepos/scratchyfishwebsite-deployment` | staging branch | `staging.scratchyfish.com` | off |
| `scratchyfish-testing` | `mikefullerton/scratchyfishwebsite` (dev repo) | `testing` (created by `shipr deploy testing`) | `testing.scratchyfish.com` | on |

Why testing links to the dev repo: `.shipr` declares `[environments.testing] repo = "development"`,
the same arrangement as `fishlamp-testing`.

- **`tools/provision-vercel.py`** is the idempotent reconciler for all three projects: creates them,
  (re)links the git repo, sets the production branch, writes `DEPLOYMENT_ENV` (plain) and
  `GH_SUBMODULE_TOKEN` (encrypted; taken from the environment when set, otherwise it verifies the
  project already has one), attaches domains, and prints the DNS records each domain needs.
  Flags: `--dry-run`, `--only <tier>`, `--skip-domains`. Re-run it whenever repos/branches change.
- **`.shipr`** (JSON) declares `targets.scratchyfish = "vercel"`, `adh.vercel_team`, the testing
  environment's repo, and the build/test commands. It replaced the placeholder
  `[targets] name = "kind:vercel"` that `shipr register` had committed. shipr reads it from the
  deployment repo's main, which `shipr prepare` copies from dev main. Flow:
  dev main → prepared → deployment main → testing → staging → production.
- **Production is triggered only by the owner.** Nothing in this repo or its tooling ships prod
  automatically.

## DNS (Cloudflare)

Zone `scratchyfish.com` is on Cloudflare. All records are DNS-only (not proxied):

- `testing` CNAME → `f13237986f033767.vercel-dns-016.com`
- `staging` CNAME → `ec3fb1bd43e5f4a0.vercel-dns-016.com`

- apex `A` → `216.150.1.1`, `216.150.16.1`
- `www` CNAME → `fdc972f01c2eebcb.vercel-dns-016.com`; Vercel 308-redirects `www` to the apex
  (`REDIRECTS` in `tools/provision-vercel.py`).

Email is Google Workspace (MX `aspmx.l.google.com` + alts, DKIM at `google._domainkey`, DMARC
`p=quarantine`). SPF, added 2026-11-01: TXT `v=spf1 include:_spf.google.com ~all` — soft fail
because DMARC already enforces; the website itself sends no mail.

The registrar delegates to Cloudflare (`brenna`/`wilson`). The old GoDaddy zone
(`ns07/ns08.domaincontrol.com`) still exists but is not authoritative — edits there do nothing.

The `CLOUDFLARE_CLI_HELPER` token can read and write DNS records; `CLOUDFLARE_API_TOKEN` cannot read
them.

## Notes and gotchas

- GitHub Pages was disabled at cutover (2026-11-01); between the merge and the DNS switch the apex
  served a Pages 404, because Pages built from `main` and the Jekyll sources had left it.
- The first builds of all three Vercel projects failed with "Root Directory `websites/main` does not
  exist", because the deployment branches still held Jekyll content at the time. That was expected
  and clears once the Next app is shipped to those branches.
