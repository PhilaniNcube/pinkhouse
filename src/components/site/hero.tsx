import type { GalleryPhoto } from '@/features/home/home-data'

import { HeroCopy } from './hero-copy'
import { QuickBooking } from '@/features/booking/quick-booking'
import type { PublicSpecial, SitePricing } from '@/lib/pricing'
import type { AvailabilitySnapshot } from '@/lib/availability'

interface HeroProps {
  heroPhoto: GalleryPhoto | null
  pricing: SitePricing
  specials: PublicSpecial[]
  staySpecial: PublicSpecial | null
  functionBundleSpecial: PublicSpecial | null
  availability: AvailabilitySnapshot
  suggestedStay: { checkIn: string; checkOut: string } | null
  suggestedFunctionDate: string | null
  today: string
}

export function Hero({
  heroPhoto,
  pricing,
  specials,
  staySpecial,
  functionBundleSpecial,
  availability,
  suggestedStay,
  suggestedFunctionDate,
}: HeroProps) {
  const exterior = heroPhoto

  const checkIn = suggestedStay?.checkIn ?? availability.generatedOn
  const checkOut = suggestedStay?.checkOut ?? ''

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <HeroCopy
          pricing={pricing}
          staySpecial={staySpecial}
          functionBundleSpecial={functionBundleSpecial}
        />

        <div className="hero__media">
          {exterior ? (
            <figure className="hero__main-photo">
              <img
                src={exterior.src}
                alt={exterior.alt}
                width={exterior.width}
                height={exterior.height}
                fetchPriority="high"
              />
              <figcaption className="hero__plaque">
                <span className="hero__plaque-number">2007</span>
                <span className="hero__plaque-text">Makoni Street, Harare</span>
              </figcaption>
            </figure>
          ) : (
            <div className="hero__main-photo hero__main-photo--empty" />
          )}

          <div className="hero__media-note">
            <span>A private house</span>
            <span>and a neat garden</span>
          </div>
        </div>
      </div>

      <QuickBooking
        pricing={pricing}
        specials={specials}
        suggestedStay={suggestedStay}
        suggestedFunctionDate={suggestedFunctionDate}
        today={availability.generatedOn}
        defaultCheckIn={checkIn}
        defaultCheckOut={checkOut}
      />
    </section>
  )
}
