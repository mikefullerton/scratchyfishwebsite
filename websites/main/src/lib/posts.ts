// The news posts: one markdown file each in src/content/posts, named the Jekyll way
// (`YYYY-MM-DD-slug.md`) with the same front matter. Read at build time; every post page and
// news list is statically generated.

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { cardExcerpt } from './excerpt'
import { renderMarkdown } from './markdown'

const POSTS_DIR = join(process.cwd(), 'src', 'content', 'posts')
const FILENAME = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/

export interface Post {
  /** The source file name, which breaks ties between posts of the same date. */
  file: string
  slug: string
  year: string
  month: string
  day: string
  /** `/YYYY/MM/DD/slug/`, the Jekyll permalink. */
  url: string
  title: string
  date: Date
  eventDate?: Date
  image?: string
  /** The front-matter summary: the post's meta description. */
  excerpt?: string
  html: string
  /** The news card's teaser (HTML). */
  cardExcerpt: string
}

function asDate(value: unknown, field: string, file: string): Date {
  const date = value instanceof Date ? value : new Date(`${String(value)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) throw new Error(`${file}: invalid ${field} "${String(value)}"`)
  return date
}

function optionalString(value: unknown, field: string, file: string): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') throw new Error(`${file}: ${field} must be a string`)
  return value
}

function readPost(file: string): Post {
  const match = FILENAME.exec(file)
  if (!match) throw new Error(`${file}: post files are named YYYY-MM-DD-slug.md`)
  const [, year = '', month = '', day = '', slug = ''] = match
  const { data, content } = matter(readFileSync(join(POSTS_DIR, file), 'utf8'))
  const title = optionalString(data.title, 'title', file)
  if (!title) throw new Error(`${file}: title is required`)
  const html = renderMarkdown(content)
  return {
    file,
    slug,
    year,
    month,
    day,
    url: `/${year}/${month}/${day}/${slug}/`,
    title,
    date: asDate(data.date ?? `${year}-${month}-${day}`, 'date', file),
    eventDate: data.event_date === undefined ? undefined : asDate(data.event_date, 'event_date', file),
    image: optionalString(data.image, 'image', file),
    excerpt: optionalString(data.excerpt, 'excerpt', file),
    html,
    cardExcerpt: cardExcerpt(html),
  }
}

let cache: Post[] | undefined

/** Every post, newest first; same-date posts in reverse file-name order, as Jekyll listed them. */
export function allPosts(): Post[] {
  cache ??= readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map(readPost)
    .sort((a, b) => b.date.getTime() - a.date.getTime() || b.file.localeCompare(a.file))
  return cache
}

export function findPost(year: string, month: string, day: string, slug: string): Post | undefined {
  return allPosts().find((post) => post.year === year && post.month === month && post.day === day && post.slug === slug)
}

/** A post whose event has already happened, as of this build (Jekyll compared to `site.time`). */
export function isPastEvent(post: Post, now: Date = new Date()): boolean {
  return post.eventDate !== undefined && post.eventDate.getTime() < now.getTime()
}
