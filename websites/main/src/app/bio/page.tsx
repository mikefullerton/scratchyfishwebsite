import { MemberGrid } from '@/components/MemberGrid'
import { Page } from '@/components/Page'
import { bio, site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Bio', path: '/bio/' })

export default function BioPage() {
  return (
    <Page title="Bio" subtitle="Get to know the band">
      <div className="bio-content">
        {bio.image ? (
          <div className="bio-image">
            <img src={bio.image} alt={site.title} />
          </div>
        ) : null}

        <div className="bio-text" dangerouslySetInnerHTML={{ __html: bio.content }} />
      </div>

      {bio.members.length > 0 ? (
        <section className="band-members">
          <h2>The Band</h2>
          <MemberGrid members={bio.members} />
        </section>
      ) : null}
    </Page>
  )
}
