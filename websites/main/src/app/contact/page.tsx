import { MailchimpSignup, Page } from '@/components/Page'
import { site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({ title: 'Contact', path: '/contact/' })

const EMAIL = 'hello@scratchyfish.com'

const SOCIAL = [
  { url: site.social.instagram, label: 'Instagram' },
  { url: site.social.facebook, label: 'Facebook' },
  { url: site.social.twitter, label: 'Twitter/X' },
] as const

export default function ContactPage() {
  return (
    <Page title="Contact" subtitle="Get in touch">
      <div className="contact-content">
        <div className="contact-info">
          <h2>Connect With Us</h2>
          <p>
            For booking inquiries, press, or just to say hello, reach out through our social media channels or drop us
            an email.
          </p>

          <a href={`mailto:${EMAIL}`} className="btn contact-email-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            {EMAIL}
          </a>

          <div className="contact-social">
            {SOCIAL.filter(({ url }) => url !== '').map(({ url, label }) => (
              <a key={label} href={url} target="_blank" rel="noopener" className="social-link">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <MailchimpSignup />
    </Page>
  )
}
