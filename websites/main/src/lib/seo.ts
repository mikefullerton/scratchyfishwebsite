// The Jekyll site's _includes/seo.html as Next metadata: the same canonical, Open Graph,
// Twitter and robots tags, and the same JSON-LD, for every page.

import type { Metadata } from 'next'
import { SITE_DESCRIPTION, SITE_URL, albums, bio, site } from './content'
import { xmlSchema } from './dates'
import { stripHtml, truncate } from './excerpt'
import type { Post } from './posts'

interface PageSeo {
  /** The page's own title; the tab reads "<title> | Scratchy Fish". */
  title: string
  /** The page's path, with its trailing slash. */
  path: string
  /** og/twitter description; defaults to the site description. */
  description?: string
  /** og/twitter image; defaults to the site hero. */
  image?: string
  /** Set on news posts: og:type article and article:published_time. */
  published?: Date
}

function absolute(url: string): string {
  return url.startsWith('http') ? url : `${SITE_URL}${url}`
}

export function pageMetadata({ title, path, description, image, published }: PageSeo): Metadata {
  const fullTitle = `${title} | ${site.title}`
  const summary = truncate(stripHtml(description ?? SITE_DESCRIPTION), 160)
  const url = absolute(path)
  const picture = absolute(image ?? site.hero_image)
  return {
    title: { absolute: fullTitle },
    // seo.html's own description falls back through the excerpt, but default.html's
    // <meta name="description"> read only `page.description`, which no page sets.
    description: SITE_DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      type: published ? 'article' : 'website',
      url,
      title: fullTitle,
      description: summary,
      images: [picture],
      siteName: site.title,
      locale: 'en_US',
      ...(published ? { publishedTime: xmlSchema(published) } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: summary,
      images: [picture],
    },
    other: { 'twitter:url': url },
  }
}

export function postMetadata(post: Post): Metadata {
  return pageMetadata({
    title: post.title,
    path: post.url,
    description: post.excerpt,
    image: post.image,
    published: post.date,
  })
}

/** The MusicGroup record every page carries. */
export function musicGroupJsonLd(): Record<string, unknown> {
  const { social } = site
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: site.title,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    genre: ['Progressive Jazz', 'Jazz Rock', 'Fusion'],
    foundingLocation: { '@type': 'Place', name: 'San Jose, California' },
    image: bio.image,
    member: bio.members.map((member) => ({
      '@type': 'Person',
      name: member.name,
      roleName: member.role,
    })),
    album: albums.map((album) => ({
      '@type': 'MusicAlbum',
      name: album.title,
      datePublished: String(album.year),
      byArtist: { '@type': 'MusicGroup', name: album.artist },
    })),
    sameAs: [social.spotify, social.instagram, social.facebook, social.youtube, social.twitter].filter(Boolean),
  }
}

/** The BlogPosting record a news post adds. */
export function blogPostingJsonLd(post: Post): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: truncate(stripHtml(post.excerpt ?? SITE_DESCRIPTION), 160),
    datePublished: xmlSchema(post.date),
    author: { '@type': 'MusicGroup', name: site.title },
    publisher: { '@type': 'Organization', name: site.title },
    ...(post.image ? { image: post.image } : {}),
  }
}
