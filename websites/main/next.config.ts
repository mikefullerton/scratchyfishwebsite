import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

/** The pnpm workspace root (`websites/`), where the lockfile lives. */
const WORKSPACE_ROOT = dirname(fileURLToPath(new URL('.', import.meta.url)))

/**
 * Two cross-cutting concerns, the same as every family site's.
 *
 * 1. Promote the server-only `DEPLOYMENT_ENV` to the client-inlined `NEXT_PUBLIC_DEPLOYMENT_ENV`.
 *    Every tier's Vercel project makes `VERCEL_ENV=production` deployments of its branch, so
 *    Vercel's own label cannot tell production from staging; `DEPLOYMENT_ENV` can.
 *
 * 2. Pin Turbopack's workspace root, but only off Vercel. Next picks the OUTERMOST lockfile it
 *    finds walking up from the app, so a stray lockfile above the repo makes it watch the whole
 *    tree. On Vercel the checkout is the repo alone, and pinning `outputFileTracingRoot` to an
 *    ancestor of the project's Root Directory makes the builder look for `.next` one level too
 *    shallow and fail the deploy — hence the `VERCEL` early return.
 */
function frameConfig(config: NextConfig): NextConfig {
  const withEnv: NextConfig = {
    ...config,
    env: {
      NEXT_PUBLIC_DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV ?? process.env.NEXT_PUBLIC_DEPLOYMENT_ENV,
      ...config.env,
    },
  }
  if (process.env.VERCEL) return withEnv
  return {
    ...withEnv,
    turbopack: { ...config.turbopack, root: WORKSPACE_ROOT },
    outputFileTracingRoot: config.outputFileTracingRoot ?? WORKSPACE_ROOT,
  }
}

export default frameConfig({
  // The Jekyll site's URLs all end in `/` (`/news/`, `/2024/04/23/<slug>/`), and GitHub Pages
  // 301s the bare form to it. Keep both so no inbound link or search result changes.
  trailingSlash: true,
  // Hide the floating Next.js dev-tools indicator in `next dev`.
  devIndicators: false,
  // A second build directory when the environment names one (an e2e lane's `next dev`).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // The sites suite serves `next dev` behind Caddy; Next refuses its dev assets to any origin
  // not listed.
  allowedDevOrigins: ['*.sites.localhost', 'sites.localhost', '*.dev.local', 'dev.local', '127.0.0.1'],
})
