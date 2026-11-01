import { Page } from '@/components/Page'
import { PhotoGallery } from '@/components/PhotoGallery'
import { photos } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Photos', path: '/photos/' })

export default function PhotosPage() {
  return (
    <Page title="Photos" subtitle="Gallery">
      {photos.length > 0 ? <PhotoGallery photos={photos} /> : <p className="no-content">Photos coming soon!</p>}
    </Page>
  )
}
