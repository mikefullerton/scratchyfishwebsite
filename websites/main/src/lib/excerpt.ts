// The Liquid filter chains the Jekyll templates ran over post text, reproduced so the news
// cards and meta descriptions read exactly as they did.

/** Liquid `strip_html`: drop scripts, styles, comments and tags; keep the text between. */
export function stripHtml(html: string): string {
  return html
    .replace(/<script.*?<\/script>/gis, '')
    .replace(/<!--.*?-->/gs, '')
    .replace(/<style.*?<\/style>/gis, '')
    .replace(/<.*?>/gs, '')
}

/** Liquid `newline_to_br`. */
export function newlineToBr(text: string): string {
  return text.replace(/\r?\n/g, '<br />\n')
}

/** Liquid `truncatewords`: past `count` words, the first `count` joined by spaces plus "...". */
export function truncateWords(text: string, count: number): string {
  const words = text.trim().split(/\s+/)
  if (words.length <= count) return text
  return `${words.slice(0, count).join(' ')}...`
}

/** Liquid `truncate`: past `length` characters, cut so the result with "..." is `length` long. */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, Math.max(0, length - 3))}...`
}

/**
 * A news card's teaser: `post.content | strip_html | newline_to_br | truncatewords: 80`.
 * The result is HTML (it carries the <br />s), rendered as such.
 */
export function cardExcerpt(postHtml: string): string {
  return truncateWords(newlineToBr(stripHtml(postHtml)), 80)
}
