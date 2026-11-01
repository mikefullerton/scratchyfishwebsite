import type { ReactNode } from 'react'
import { site } from '@/lib/content'

/** The full-bleed hero band with the site photo behind the title. */
export function Hero({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }) {
  return (
    <section className="hero" style={{ backgroundImage: `url('${image ?? site.hero_image}')` }}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
      </div>
    </section>
  )
}

/** A content page: the hero with the page's title, then its body in the page column. */
export function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <>
      <Hero title={title} subtitle={subtitle} />
      <div className="page-content">
        <div className="container">{children}</div>
      </div>
    </>
  )
}

/** A schema.org record as a JSON-LD script. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

/** The mailing-list signup, shown once `site.json` names a Mailchimp form action. */
export function MailchimpSignup() {
  if (site.mailchimp_form_action === '') return null
  return (
    <section className="mailchimp-signup">
      <div className="container">
        <h2>Stay in the Loop</h2>
        <p>Subscribe to our mailing list for updates on new music, shows, and more.</p>

        <form action={site.mailchimp_form_action} method="post" target="_blank" className="signup-form">
          <div className="form-group">
            <input type="email" name="EMAIL" placeholder="Enter your email" aria-label="Email address" required />
            <button type="submit">Subscribe</button>
          </div>
        </form>
      </div>
    </section>
  )
}
