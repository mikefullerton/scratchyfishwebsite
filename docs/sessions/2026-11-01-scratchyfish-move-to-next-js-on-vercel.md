# Session: moving scratchyfish.com from GitHub Pages to Next.js on Vercel (phase 1)

- **Date:** 2026-11-01
- **Session:** `5ec3fa8c-e2ff-4a1c-9efb-6c25d8ba8ca0`
- **Branch:** `site-move-phase-1`

## Orientation

The owner's phase-1 plan for this session had four parts:

1. Move scratchyfish.com to Vercel, with testing, staging and production projects like the adh sites.
2. Point DNS at Vercel and add `staging` and `testing` subdomains.
3. Convert the site to Next.js on the family stack, as-is.
4. Bring in the same submodules fishlampwebsite uses.

All four are done and merged to `main` as squashed commit `df74210` (PR #1). What's left is
owner-triggered: shipping to the deployment repo and the production DNS cutover.
[STATUS](../planning/STATUS.md) has the current list.

## Decisions

- **Port as-is, with checked parity.** The content files and `style.css` were copied verbatim, and
  the rendering mimics Liquid/kramdown (smartypants, date and excerpt filters). The point of phase 1
  is to change the platform, not the site. A diff against a snapshot of the live site covered all 29
  pages, and its only deviation is the empty lightbox `<img>`.
- **Same workspace shape as fishlamp:** `websites/` pnpm workspace, `websites/main` app, and
  submodules in `websites/external/` outside the workspace glob. Shared tooling (the `sites` CLI,
  abstractr tiers, shipr) works without special-casing.
- **Production and staging build from `DeploymentRepos/scratchyfishwebsite-deployment`.** Testing
  builds from the dev repo, per `.shipr` `[environments.testing] repo = "development"`. This mirrors
  `fishlamp-testing`. Testing was at first linked to the deployment repo by mistake and then
  relinked.
- **`GH_SUBMODULE_TOKEN` was copied from an existing Vercel project's env, not minted.** The owner
  asked for it to come "from the sf vercel project". It was verified against the private
  whatsnowtoolkit repo and never printed.
- **Provisioning is a repeatable Python script** (`tools/provision-vercel.py`), not one-off
  API calls. It is idempotent, which lets the testing-branch fix be a re-run.
- **`.shipr` is JSON with a real Vercel target.** It replaced the placeholder `name = "kind:vercel"`
  that `shipr register` had put on main. The two collided as a rebase conflict, which was resolved
  to the JSON version. It was validated with shipr's own declaration parser.
- **Merged with squash.** The owner asked for `/ship` with squash, even though `/ship` normally
  lands commits unsquashed. Before merging, the owner backed up the Jekyll site to a branch, because
  GitHub Pages builds from `main`.

## Considered and rejected

- **The `CLOUDFLARE_API_TOKEN`** couldn't read DNS records. `CLOUDFLARE_CLI_HELPER` was used
  instead.
- **Changing the apex DNS during this session** was rejected: production cutover belongs to the
  owner.

## Open threads

- The owner will ship from `~/Deployments/websites/scratchyfishwebsite-deployment`. Until then the
  Vercel builds of the deployment branches fail with "Root Directory websites/main does not exist".
- The owner will do the production DNS switch: apex A `216.150.1.1` / `216.150.16.1`, and `www`
  CNAME `fdc972f01c2eebcb.vercel-dns-016.com`. After that, GitHub Pages gets disabled.
- The dev repo has no `testing` branch yet. Once it exists, re-run
  `tools/provision-vercel.py --only testing`.
- Phase 2+: content and design.

## Pointers

- Design: [nextjs-on-vercel.md](../designs/nextjs-on-vercel.md)
- Status: [STATUS.md](../planning/STATUS.md)
- PR #1 → `df74210` on `main`. Code: `websites/main/`, `tools/provision-vercel.py`, `.shipr`.
