import { PostCard } from '@/components/Cards'
import { Page } from '@/components/Page'
import { allPosts } from '@/lib/posts'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'News', path: '/news/' })

export default function NewsPage() {
  return (
    <Page title="News" subtitle="Latest updates">
      <div className="posts-grid">
        {allPosts().map((post) => (
          <PostCard key={post.url} post={post} />
        ))}
      </div>
    </Page>
  )
}
