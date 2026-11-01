# Status

Last updated 2026-11-01, after the production cutover. Design:
[nextjs-on-vercel.md](../designs/nextjs-on-vercel.md).

## Done (phase 1)

- Site ported from Jekyll to Next 16 on the family stack (`websites/main`), with content parity
  checked on all 29 pages.
- Submodules `agenticdevelopertoolkit` and `whatsnowtoolkit` are under `websites/external/`.
- Vercel projects `scratchyfish-production`, `-staging` and `-testing` are provisioned by
  `tools/provision-vercel.py`, including domains, `DEPLOYMENT_ENV` and `GH_SUBMODULE_TOKEN`.
- `.shipr` declares the Vercel target and the testing environment.
- DNS: the `testing` and `staging` CNAMEs point at Vercel.

## Production cutover — done 2026-11-01

- shipr shipped `05a2592` to testing, staging and production (all READY on Vercel).
- Cloudflare: apex A records now `216.150.1.1` / `216.150.16.1` (GitHub Pages records
  removed); `www` CNAME → `fdc972f01c2eebcb.vercel-dns-016.com`. MX untouched.
- `www.scratchyfish.com` 308-redirects to `scratchyfish.com` (set by
  `tools/provision-vercel.py`, `REDIRECTS`).
- GitHub Pages is disabled for the repo. The Jekyll site lives on the
  `2026-github-pages-legacy-site` branch.
- `scratchyfish-testing` now tracks the dev repo's `testing` branch (shipr created it), so
  testing updates on `shipr deploy testing`, not on pushes to `main`.

## Later phases

- Content and design updates. Phase 1 was a deliberately as-is port.
