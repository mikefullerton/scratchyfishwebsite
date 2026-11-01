import type { MetadataRoute } from 'next'
import { bio, SITE_URL } from '@/lib/content'
import { allPosts } from '@/lib/posts'

/** The same URLs and priorities as the Jekyll site's hand-written sitemap.xml. */
const PAGES: ReadonlyArray<readonly [path: string, priority: number]> = [
  ['/', 1.0],
  ['/news/', 0.8],
  ['/bio/', 0.8],
  ['/music/', 0.9],
  ['/shows/', 0.8],
  ['/photos/', 0.7],
  ['/video/', 0.7],
  ['/friends/', 0.5],
  ['/contact/', 0.6],
]

export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date()
  return [
    ...PAGES.map(([path, priority]) => ({
      url: `${SITE_URL}${path}`,
      lastModified: built,
      priority,
    })),
    ...allPosts().map((post) => ({
      url: `${SITE_URL}${post.url}`,
      lastModified: post.date,
      priority: 0.6,
    })),
    ...bio.members.map((member) => ({
      url: `${SITE_URL}/bio/${member.slug}/`,
      lastModified: built,
      priority: 0.5,
    })),
  ]
}
