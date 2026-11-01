import Link from 'next/link'
import type { Show } from '@/lib/content'
import { dayOfMonth, longDate, parseDay, shortMonth, xmlSchema } from '@/lib/dates'
import { isPastEvent, type Post } from '@/lib/posts'

/** A news card: image, date, title, teaser; dimmed with a badge once its event is over. */
export function PostCard({ post }: { post: Post }) {
  const past = isPastEvent(post)
  return (
    <article className={past ? 'post-card past-event' : 'post-card'}>
      {past ? <div className="past-event-overlay">Past Event</div> : null}
      {post.image ? (
        <div className="post-image">
          <Link href={post.url}>
            <img src={post.image} alt={post.title} />
          </Link>
        </div>
      ) : null}
      <div className="post-content">
        <time dateTime={xmlSchema(post.date)}>{longDate(post.date)}</time>
        <h3>
          <Link href={post.url}>{post.title}</Link>
        </h3>
        <p dangerouslySetInnerHTML={{ __html: post.cardExcerpt }} />
        <Link href={post.url} className="read-more">
          Read more &rarr;
        </Link>
      </div>
    </article>
  )
}

/**
 * One show. The shows page lists the year and the city as `.show-city`; the home page's
 * compact list leaves the year off and offers a small ticket button.
 */
export function ShowItem({ show, compact = false }: { show: Show; compact?: boolean }) {
  const date = parseDay(show.date)
  const tickets = show.ticket_url ?? ''
  return (
    <div className="show-item">
      <div className="show-date">
        <span className="month">{shortMonth(date)}</span>
        <span className="day">{dayOfMonth(date)}</span>
        {compact ? null : <span className="year">{date.getUTCFullYear()}</span>}
      </div>
      <div className="show-info">
        <h3>{show.venue}</h3>
        <p className={compact ? undefined : 'show-city'}>{show.city}</p>
        {show.details ? <p className="show-details">{show.details}</p> : null}
      </div>
      {tickets === '' ? null : compact ? (
        <a href={tickets} className="btn btn-small" target="_blank" rel="noopener">
          Tickets
        </a>
      ) : (
        <a href={tickets} className="btn" target="_blank" rel="noopener">
          Get Tickets
        </a>
      )}
    </div>
  )
}
