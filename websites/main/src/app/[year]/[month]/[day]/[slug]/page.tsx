import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/Page'
import { longDate } from '@/lib/dates'
import { allPosts, findPost } from '@/lib/posts'
import { blogPostingJsonLd, postMetadata } from '@/lib/seo'

interface Params {
  year: string
  month: string
  day: string
  slug: string
}

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return allPosts().map(({ year, month, day, slug }) => ({
    year,
    month,
    day,
    slug,
  }))
}

async function load(params: Promise<Params>) {
  const { year, month, day, slug } = await params
  const post = findPost(year, month, day, slug)
  if (!post) notFound()
  return post
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return postMetadata(await load(params))
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const post = await load(params)
  return (
    <section className="post-hero" style={post.image ? { backgroundImage: `url('${post.image}')` } : undefined}>
      <JsonLd data={blogPostingJsonLd(post)} />
      <div className="post-hero-overlay"></div>
      <div className="container post-hero-content">
        <h1>{post.title}</h1>
        <p className="post-date">{longDate(post.date)}</p>
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        <div className="post-nav">
          <Link href="/news" className="btn">
            &larr; Back to News
          </Link>
        </div>
      </div>
    </section>
  )
}
