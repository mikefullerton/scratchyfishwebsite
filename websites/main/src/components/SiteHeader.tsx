'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { NavItem } from '@/lib/content'

/** Jekyll's `page.url`: the path with its trailing slash, which `trailingSlash` guarantees. */
function pageUrl(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

/**
 * The fixed site header: the logo, the nav, and the mobile burger that opens it. A link is
 * marked active when it is exactly the current page URL, the comparison the Jekyll header made.
 */
export function SiteHeader({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const current = pageUrl(pathname)
  const close = () => setOpen(false)

  return (
    <header className="site-header" style={scrolled ? { boxShadow: '0 2px 20px rgba(0,0,0,0.3)' } : undefined}>
      <div className="container">
        <Link href="/" className="site-logo" onClick={close}>
          {title}
        </Link>

        <button
          type="button"
          className={open ? 'nav-toggle active' : 'nav-toggle'}
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={open ? 'site-nav active' : 'site-nav'}>
          <ul>
            {items.map((item) => (
              <li key={item.url}>
                <Link href={item.url} className={current === item.url ? 'active' : undefined} onClick={close}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
