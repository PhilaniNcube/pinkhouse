'use client'

import { useState } from 'react'
import { Menu, MessageCircle, Phone } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS, SITE } from '@/lib/site'
import type { PublicSpecial } from '@/lib/pricing'

interface SiteHeaderProps {
  showBanner: boolean
  bannerHeadline: string
  featuredSpecial: PublicSpecial | null
}

function Wordmark() {
  return (
    <a className="wordmark" href="#top" aria-label="The Pink House, back to the top">
      <span className="wordmark__name">The Pink House</span>
      <span className="wordmark__sub">2007 Makoni St, Mainway Meadows</span>
    </a>
  )
}

export function SiteHeader({
  showBanner,
  bannerHeadline,
  featuredSpecial,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="site-header">
      {showBanner ? (
        <div className="announcement">
          <div className="container announcement__inner">
            <p>
              <span className="announcement__lead">Current special</span>
              <span>{bannerHeadline}</span>
            </p>
            <a href="#specials">View specials</a>
          </div>
        </div>
      ) : null}

      <header className="site-nav">
        <div className="container site-nav__inner">
          <Wordmark />

          <nav className="site-nav__links" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="site-nav__actions">
            <a className="phone-link" href={SITE.phoneHref}>
              <Phone aria-hidden="true" size={16} strokeWidth={1.7} />
              <span className="num">{SITE.phoneDisplay}</span>
            </a>
            <Button asChild size="small" className="site-nav__book">
              <a href="#booking">Book now</a>
            </Button>
            <button
              type="button"
              className="menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu aria-hidden="true" size={22} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="mobile-menu">
          <DialogTitle className="mobile-menu__title">
            The Pink House
          </DialogTitle>
          <DialogDescription className="mobile-menu__place">
            {SITE.address}
          </DialogDescription>

          <nav className="mobile-menu__links" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mobile-menu__contact">
            <a href={SITE.phoneHref}>
              <Phone aria-hidden="true" size={18} strokeWidth={1.6} />
              <span className="num">{SITE.phoneDisplay}</span>
            </a>
            <a href={SITE.whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" size={18} strokeWidth={1.6} />
              WhatsApp Mrs Ncube
            </a>
          </div>

          <Button asChild size="large" className="mobile-menu__book">
            <a href="#booking" onClick={() => setMenuOpen(false)}>
              Check availability
            </a>
          </Button>

          {featuredSpecial ? (
            <a
              className="mobile-menu__special"
              href="#specials"
              onClick={() => setMenuOpen(false)}
            >
              {featuredSpecial.badgeText}: {featuredSpecial.title}
            </a>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
