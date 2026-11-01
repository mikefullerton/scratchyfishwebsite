import { Page } from '@/components/Page'
import { videos } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Video', path: '/video/' })

export default function VideoPage() {
  return (
    <Page title="Video" subtitle="Watch">
      {videos.length > 0 ? (
        <div className="video-gallery">
          {videos.map((video) => (
            <div key={video.youtube_id} className="video-item">
              <div className="video-embed">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtube_id}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                {video.description ? <p>{video.description}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-content">Videos coming soon!</p>
      )}
    </Page>
  )
}
