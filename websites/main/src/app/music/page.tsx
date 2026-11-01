import { Page } from '@/components/Page'
import { albums, videos } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Music', path: '/music/' })

const YOUTUBE_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'

export default function MusicPage() {
  return (
    <Page title="Music" subtitle="Listen to our tracks">
      <div className="albums-list">
        {albums.map((album) => (
          <div key={album.title} className="album-card">
            {album.artwork ? (
              <div className="album-artwork">
                <img src={album.artwork} alt={album.title} />
              </div>
            ) : null}

            <div className="album-details">
              <h2>{album.title}</h2>
              <p className="album-meta">
                {album.artist} &middot; {album.year}
              </p>

              {album.bandcamp_embed ? (
                <div className="music-player bandcamp-player">
                  <h4>Listen on Bandcamp</h4>
                  <iframe
                    style={{ border: 0, width: '100%', height: '120px' }}
                    src={album.bandcamp_embed}
                    title={album.title}
                  ></iframe>
                </div>
              ) : null}

              {album.spotify_embed ? (
                <div className="music-player spotify-player">
                  <h4>Listen on Spotify</h4>
                  <iframe
                    style={{ borderRadius: '12px' }}
                    src={album.spotify_embed}
                    title={album.title}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>
              ) : null}

              {album.youtube_embed ? (
                <div className="music-player youtube-player">
                  <h4>Watch on YouTube</h4>
                  <div className="video-embed">
                    <iframe
                      src={album.youtube_embed}
                      title={album.title}
                      frameBorder="0"
                      allow={YOUTUBE_ALLOW}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ) : null}

              {album.tracks.length > 0 ? (
                <div className="track-list">
                  <h4>Track List</h4>
                  <ol>
                    {album.tracks.map((track) => (
                      <li key={track.title}>
                        <span className="track-title">{track.title}</span>
                        <span className="track-duration">{track.duration}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {videos.length > 0 ? (
        <section className="videos-section">
          <h2>Videos</h2>
          <div className="videos-grid">
            {videos.map((video) => (
              <div key={video.youtube_id} className="video-card">
                <div className="video-embed">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtube_id}`}
                    title={video.title}
                    frameBorder="0"
                    allow={YOUTUBE_ALLOW}
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  {video.description ? <p>{video.description}</p> : null}
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-small"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </Page>
  )
}
