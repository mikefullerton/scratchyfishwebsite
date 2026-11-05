import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { JsonLd } from '@/components/Page'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { SITE_DESCRIPTION, SITE_URL, navigation, site } from '@/lib/content'
import { musicGroupJsonLd } from '@/lib/seo'
import { PostHogAnalytics } from '@adh-sdk/analytics'
import '@/styles/style.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: site.title,
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true },
  authors: [{ name: site.title }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Open+Sans:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={musicGroupJsonLd()} />
      </head>
      <body>
        <SiteHeader title={site.title} items={navigation} />

        <main>{children}</main>

        <SiteFooter title={site.title} social={site.social} />
        <PostHogAnalytics />
      </body>
    </html>
  )
}
