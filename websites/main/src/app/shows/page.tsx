import { ShowItem } from '@/components/Cards'
import { Page } from '@/components/Page'
import { shows } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Shows', path: '/shows/' })

export default function ShowsPage() {
  return (
    <Page title="Shows" subtitle="Catch us live">
      <section className="upcoming-shows">
        <h2>Upcoming Shows</h2>
        {shows.upcoming.length > 0 ? (
          <div className="shows-list full-list">
            {shows.upcoming.map((show) => (
              <ShowItem key={`${show.date}-${show.venue}`} show={show} />
            ))}
          </div>
        ) : (
          <p className="no-content">No upcoming shows at the moment. Check back soon!</p>
        )}
      </section>

      {shows.past.length > 0 ? (
        <section className="past-shows">
          <h2>Past Shows</h2>
          <div className="shows-list full-list past">
            {shows.past.map((show) => (
              // A show already played offers no tickets, as on the original page.
              <ShowItem key={`${show.date}-${show.venue}`} show={{ ...show, ticket_url: '' }} />
            ))}
          </div>
        </section>
      ) : null}
    </Page>
  )
}
