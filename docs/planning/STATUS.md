# Status

Last updated 2026-11-01 after merge `df74210` (PR #1). Design:
[nextjs-on-vercel.md](../designs/nextjs-on-vercel.md).

## Done (phase 1)

- Site ported from Jekyll to Next 16 on the family stack (`websites/main`), with content parity
  checked on all 29 pages.
- Submodules `agenticdevelopertoolkit` and `whatsnowtoolkit` are under `websites/external/`.
- Vercel projects `scratchyfish-production`, `-staging` and `-testing` are provisioned by
  `tools/provision-vercel.py`, including domains, `DEPLOYMENT_ENV` and `GH_SUBMODULE_TOKEN`.
- `.shipr` declares the Vercel target and the testing environment.
- DNS: the `testing` and `staging` CNAMEs point at Vercel.

## Open (owner-triggered)

- **Ship to the deployment repo.** Run shipr/deploy from `~/Deployments/websites/scratchyfishwebsite-deployment`.
  This brings the Next app to staging and production, and those builds then stop failing on the
  missing `websites/main`.
- **Production DNS switch** in Cloudflare:
  - Replace the apex A records (GitHub Pages `185.199.108–111.153`) with `216.150.1.1` and
    `216.150.16.1`.
  - Point `www` CNAME → `fdc972f01c2eebcb.vercel-dns-016.com`.
  - After the switch, turn off GitHub Pages for the repo.
- **`testing` branch.** The dev repo has no `testing` branch yet, so `scratchyfish-testing`'s
  production branch is `main`. Once shipr/testr creates the branch, re-run
  `python3 tools/provision-vercel.py --only testing`.

## Later phases

- Content and design updates. Phase 1 was a deliberately as-is port.
