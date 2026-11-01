import type { ExternalLink } from '@/lib/content'
import { LinkIcon } from './LinkIcon'

/** A member's or friend's outbound links, each with its mark. */
export function LinkList({ links, kind, size }: { links: ExternalLink[]; kind: 'member' | 'friend'; size: number }) {
  return links.map((link) => (
    <a
      key={link.url}
      href={link.url}
      target="_blank"
      rel="noopener"
      className={`${kind}-link ${kind}-link-${link.type}`}
    >
      <LinkIcon type={link.type} size={size} /> {link.label}
    </a>
  ))
}
