import type { HomeData } from '@/features/home/home-data'
import { Button } from '@/components/ui/button'
import { SITE } from '@/lib/site'

interface SiteFooterProps {
  credits: HomeData['credits']
}

const footerLinks = [
  { href: '#the-house', label: 'The House' },
  { href: '#functions', label: 'Functions' },
  { href: '#day-services', label: 'Day Services' },
  { href: '#specials', label: 'Specials' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#booking', label: 'Check Availability' },
  { href: '#contact', label: 'Contact' },
]

export function SiteFooter({ credits }: SiteFooterProps) {
  return (
    <footer className="site-footer surface-dark">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <a className="footer-wordmark" href="#top">
              The Pink House
            </a>
            <p>
              A private four-bedroom guesthouse and intimate garden venue in
              Mainway Meadows, Waterfalls, Harare.
            </p>
          </div>

          <div className="site-footer__links">
            <div>
              <p className="footer-heading">Explore</p>
              <nav aria-label="Footer navigation">
                {footerLinks.slice(0, 4).map((link) => (
                  <a key={link.href} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            <div>
              <p className="footer-heading">Plan your stay</p>
              <nav aria-label="Footer planning links">
                {footerLinks.slice(4).map((link) => (
                  <a key={link.href} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          <div className="site-footer__contact">
            <p className="footer-heading">At the gate</p>
            <address>
              2007 Makoni St
              <br />
              Mainway Meadows, Waterfalls
              <br />
              Harare
            </address>
            <a href={SITE.phoneHref} className="footer-phone num">
              {SITE.phoneDisplay}
            </a>
            <Button asChild variant="primary" size="small">
              <a href="#booking">Book your dates</a>
            </Button>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© 2026 The Pink House, Harare.</p>
          {credits.length ? (
            <p className="photo-credits" data-credits>
              Photography:{' '}
              {credits.map((credit, index) => (
                <span key={credit.name}>
                  {credit.url ? (
                    <a
                      href={credit.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {credit.name}
                    </a>
                  ) : (
                    credit.name
                  )}
                  {index < credits.length - 1 ? ', ' : ''}
                </span>
              ))}
              .
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
