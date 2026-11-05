import type { GalleryPhoto } from '@/features/home/home-data'
import { StartBookingButton } from './start-booking-button'
import {
  bookingTypeForSpecial,
  currency,
  type PublicSpecial,
} from '@/lib/pricing'
import { formatDate } from '@/lib/dates'

interface SpecialsSectionProps {
  specials: PublicSpecial[]
  leadPhoto?: GalleryPhoto
}

function specialDate(date: string): string {
  return formatDate(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function SpecialsSection({ specials, leadPhoto }: SpecialsSectionProps) {
  return (
    <section className="section specials-section" id="specials">
      <div className="container">
        <div className="section-heading section-heading--split">
          <h2>Current specials &amp; bundles</h2>
          <p className="lead">
            Longer stays, bigger celebrations and quieter weekday bookings.
          </p>
        </div>

        {specials.length ? (
          <div className="specials-grid">
            {specials.map((special, index) => {
              const isLead = index === 0
              const bookingType = bookingTypeForSpecial(special.category)
              return (
                <article
                  key={special.id}
                  className={`special-card${isLead ? ' special-card--lead' : ''}`}
                >
                  <div className="special-card__top">
                    <span className="special-badge">{special.badgeText}</span>
                  </div>

                  <h3>{special.title}</h3>
                  <p className="special-card__description">
                    {special.description}
                  </p>

                  <div className="special-card__price">
                    <span className="special-card__standard num">
                      {currency(special.standardPriceUSD)}
                    </span>
                    <span className="special-card__special num">
                      {currency(special.specialPriceUSD)}
                    </span>
                    {special.minNights && special.minNights > 1 ? (
                      <span className="special-card__unit">
                        {special.minNights} nights
                      </span>
                    ) : special.category === 'bundle' ? (
                      <span className="special-card__unit">one night</span>
                    ) : null}
                  </div>

                  <div className="special-card__validity">
                    <span>
                      {specialDate(special.validFrom)} to{' '}
                      {specialDate(special.validUntil)}
                    </span>
                  </div>

                  {isLead && leadPhoto ? (
                    <figure className="special-card__photo">
                      <img
                        src={leadPhoto.src}
                        alt={leadPhoto.alt}
                        width={leadPhoto.width}
                        height={leadPhoto.height}
                        loading="lazy"
                      />
                    </figure>
                  ) : null}

                  <StartBookingButton
                    bookingType={bookingType}
                    specialId={special.id}
                    variant={isLead ? 'primary' : 'outline'}
                    className="special-card__button"
                  >
                    Book this special
                  </StartBookingButton>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="specials-empty">
            <p>
              There are no published specials today. Ask Mrs Ncube about the
              current seasonal rate for your dates.
            </p>
            <a className="quiet-link" href="#contact">
              Ask about seasonal rates
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
