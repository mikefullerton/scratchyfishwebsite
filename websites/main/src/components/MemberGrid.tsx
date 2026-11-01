'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Member } from '@/lib/content'
import { LinkList } from './LinkList'

/**
 * One band member. Each card has two faces: the silly bio beside the dog photo, and the
 * serious bio beside the person photo. "...translate" and the photo button flip both together.
 * Both bios are held to the taller one's height so the card does not jump when it flips.
 */
function MemberCard({ member }: { member: Member }) {
  const [serious, setSerious] = useState(false)
  const sillyRef = useRef<HTMLParagraphElement>(null)
  const seriousRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    function equalize() {
      const silly = sillyRef.current
      const grave = seriousRef.current
      if (!silly || !grave) return
      // `display` belongs to React; `minHeight` is only ever set here.
      const shown = [silly.style.display, grave.style.display] as const
      silly.style.minHeight = ''
      grave.style.minHeight = ''
      silly.style.display = ''
      grave.style.display = ''
      const height = `${Math.max(silly.offsetHeight, grave.offsetHeight)}px`
      silly.style.display = shown[0]
      grave.style.display = shown[1]
      silly.style.minHeight = height
      grave.style.minHeight = height
    }
    equalize()
    window.addEventListener('resize', equalize)
    return () => window.removeEventListener('resize', equalize)
  }, [])

  const flip = () => setSerious((value) => !value)
  const href = `/bio/${member.slug}/`
  const hidden = { display: 'none' } as const

  return (
    <div className="member-card">
      <div className="member-photo">
        <Link href={href}>
          {member.photo_dog ? (
            <>
              <img
                className="photo-main"
                src={member.photo_dog}
                alt={`${member.name}'s dog`}
                style={serious ? hidden : undefined}
              />
              <img className="photo-person" src={member.photo} alt={member.name} style={serious ? undefined : hidden} />
            </>
          ) : (
            <img className="photo-main" src={member.photo} alt={member.name} />
          )}
        </Link>
        {member.photo_dog ? (
          <button
            type="button"
            className={serious ? 'photo-toggle active' : 'photo-toggle'}
            onClick={flip}
            title="Show person photo"
            aria-pressed={serious}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="member-info">
        <h3>
          <Link href={href}>{member.name}</Link>
        </h3>
        <p className="member-role">{member.role}</p>
        <div className="member-bio-container">
          <p ref={sillyRef} className="member-bio member-bio-silly" style={serious ? hidden : undefined}>
            {member.bio_silly}
          </p>
          <p ref={seriousRef} className="member-bio member-bio-serious" style={serious ? undefined : hidden}>
            {member.bio_serious}
          </p>
          {/* An anchor, as on the Jekyll page: style.css styles `.translate-link` as a text link. */}
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            role="button"
            className="translate-link"
            onClick={(event) => {
              event.preventDefault()
              flip()
            }}
          >
            {serious ? '...translate back' : '...translate'}
          </a>
        </div>
        {member.links && member.links.length > 0 ? (
          <div className="member-links">
            <LinkList links={member.links} kind="member" size={16} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function MemberGrid({ members }: { members: Member[] }) {
  return (
    <div className="members-grid">
      {members.map((member) => (
        <MemberCard key={member.slug} member={member} />
      ))}
    </div>
  )
}
