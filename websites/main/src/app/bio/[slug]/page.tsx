import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LinkList } from '@/components/LinkList'
import { bio, memberBySlug } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

interface Params {
  slug: string
}

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return bio.members.map(({ slug }) => ({ slug }))
}

async function load(params: Promise<Params>) {
  const member = memberBySlug((await params).slug)
  if (!member) notFound()
  return member
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const member = await load(params)
  return pageMetadata({ title: member.name, path: `/bio/${member.slug}/` })
}

export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const member = await load(params)
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{member.name}</h1>
          <p className="hero-subtitle">{member.role}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="member-single">
            <div className="member-single-photo">
              <img src={member.photo} alt={member.name} />
            </div>
            <div className="member-single-info">
              <p className="member-single-bio">{member.bio}</p>
              {member.links && member.links.length > 0 ? (
                <div className="member-links">
                  <LinkList links={member.links} kind="member" size={16} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="member-single-nav">
            <Link href="/bio" className="btn">
              &larr; Back to Band
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
