// Markdown to HTML the way kramdown (Jekyll's renderer) printed the posts.
//
// Two kramdown habits matter to what the site shows:
//   • Typographic quotes — `We're` becomes `We’re`. marked-smartypants does the same.
//   • Blocks are separated by a blank line and the document ends in one newline. The news
//     cards' excerpts turn every newline into a <br />, so the separator is visible there;
//     marked's single-newline join would close up the paragraph gaps the live cards show.
// Raw HTML blocks (the posts' <div class="video-embed"> iframes) pass through untouched.

import { Marked } from 'marked'
import { markedSmartypants } from 'marked-smartypants'

const marked = new Marked({ async: false }, markedSmartypants())

/**
 * The extensions' `postprocess` hooks (smartypants lives there). `marked.parse` runs them, but
 * `marked.parser` does not, and the per-block render below needs `parser`.
 */
function postprocess(html: string): string {
  const out = marked.defaults.hooks?.postprocess(html) ?? html
  if (typeof out !== 'string') throw new Error('markdown postprocess hook must be synchronous')
  return out
}

export function renderMarkdown(source: string): string {
  const blocks = marked
    .lexer(source)
    .filter((token) => token.type !== 'space')
    .map((token) => postprocess(marked.parser([token])).replace(/\n+$/, ''))
  return blocks.length === 0 ? '' : `${blocks.join('\n\n')}\n`
}
