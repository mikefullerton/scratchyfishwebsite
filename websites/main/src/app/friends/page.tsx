import { LinkList } from '@/components/LinkList'
import { Page } from '@/components/Page'
import { friends } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Friends', path: '/friends/' })

export default function FriendsPage() {
  return (
    <Page title="Friends" subtitle="Bands and artists we love">
      {friends.length > 0 ? (
        <div className="friends-grid">
          {friends.map((friend) => (
            <div key={friend.name} className="friend-card">
              {friend.image ? (
                <div className="friend-image">
                  <img src={friend.image} alt={friend.name} />
                </div>
              ) : null}
              <div className="friend-header">
                <div className="friend-title">
                  <h3>
                    <a href={friend.url} target="_blank" rel="noopener">
                      {friend.name}
                    </a>
                  </h3>
                  <p className="friend-description">{friend.description}</p>
                </div>
              </div>
              <div className="friend-links">
                {friend.links.length > 0 ? (
                  <div className="friend-links-list">
                    <LinkList links={friend.links} kind="friend" size={14} />
                  </div>
                ) : null}
                <a href={friend.url} target="_blank" rel="noopener" className="btn">
                  Visit Site &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-content">Coming soon!</p>
      )}
    </Page>
  )
}
