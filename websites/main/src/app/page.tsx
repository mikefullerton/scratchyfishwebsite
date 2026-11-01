import Link from 'next/link'
import { PostCard, ShowItem } from '@/components/Cards'
import { Hero, MailchimpSignup } from '@/components/Page'
import { albums, shows, site } from '@/lib/content'
import { allPosts } from '@/lib/posts'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Home', path: '/' })

export default function HomePage() {
  const latestAlbums = albums.slice(0, 3)
  const upcoming = shows.upcoming.slice(0, 3)
  return (
    <>
      <Hero title={site.title} subtitle={site.tagline} />

      <section className="section news-section">
        <div className="container">
          <h2>Latest News</h2>
          <div className="posts-grid">
            {allPosts()
              .slice(0, 3)
              .map((post) => (
                <PostCard key={post.url} post={post} />
              ))}
          </div>
          <Link href="/news" className="btn">
            View All News
          </Link>
        </div>
      </section>

      {latestAlbums.length > 0 ? (
        <section className="section music-section">
          <div className="container">
            <h2>Latest Music</h2>
            <div className="music-list">
              {latestAlbums.map((album) => (
                <div key={album.title} className="music-list-item">
                  <div className="music-list-info">
                    <h3>{album.post_url ? <Link href={album.post_url}>{album.title}</Link> : album.title}</h3>
                    <p className="album-artist">
                      {album.artist} &middot; {album.year}
                    </p>
                  </div>
                  <div className="music-list-player">
                    {album.youtube_embed ? (
                      <div className="music-player">
                        <iframe
                          width="100%"
                          height="152"
                          src={album.youtube_embed}
                          title={album.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        ></iframe>
                      </div>
                    ) : null}

                    {album.bandcamp_embed ? (
                      <div className="music-player">
                        <iframe
                          style={{ border: 0, width: '100%', height: '120px' }}
                          src={album.bandcamp_embed}
                          title={album.title}
                        ></iframe>
                      </div>
                    ) : null}

                    {album.spotify_embed ? (
                      <div className="music-player">
                        <iframe
                          style={{ borderRadius: '12px' }}
                          src={album.spotify_embed}
                          title={album.title}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                        ></iframe>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/music" className="btn">
              View All Music
            </Link>
          </div>
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section className="section shows-section">
          <div className="container">
            <h2>Upcoming Shows</h2>
            <div className="shows-list">
              {upcoming.map((show) => (
                <ShowItem key={`${show.date}-${show.venue}`} show={show} compact />
              ))}
            </div>
            <Link href="/shows" className="btn">
              View All Shows
            </Link>
          </div>
        </section>
      ) : null}

      <MailchimpSignup />
    </>
  )
}
