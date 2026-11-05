import {
  currency,
  nightlyFromSpecial,
  type PublicSpecial,
  type SitePricing,
} from '@/lib/pricing'

interface HeroCopyProps {
  pricing: SitePricing
  staySpecial: PublicSpecial | null
  functionBundleSpecial: PublicSpecial | null
}

export function HeroCopy({
  pricing,
  staySpecial,
  functionBundleSpecial,
}: HeroCopyProps) {
  const specialNightly = staySpecial ? nightlyFromSpecial(staySpecial) : null

  return (
    <div className="hero__copy">
      <h1 className="hero__title" id="hero-title">
        <span className="hero__welcome">Welcome to</span>
        <span className="hero__name">The Pink House</span>
      </h1>

      <p className="hero__lead">
        A spacious 4-bedroom guesthouse and neat garden venue in peaceful
        Mainway Meadows, Waterfalls, Harare.
      </p>

      <dl className="hero__rates">
        <div className="hero__rate">
          <dt>Overnight stays</dt>
          <dd>
            {specialNightly ? (
              <span className="hero__rate-price">
                <span className="hero__rate-old num">
                  {currency(pricing.accommodationNightlyRateUSD)}
                </span>
                <span className="num">{currency(specialNightly)}</span>
                <span className="hero__rate-unit">a night</span>
              </span>
            ) : (
              <span className="hero__rate-price">
                <span className="num">
                  {currency(pricing.accommodationNightlyRateUSD)}
                </span>
                <span className="hero__rate-unit">a night</span>
              </span>
            )}
          </dd>
          <div className="hero__rate-foot">
            {staySpecial ? (
              <>
                <span className="hero__rate-meta">
                  {staySpecial.minNights}+ nights
                </span>
                <span className="offer-pill">{staySpecial.badgeText}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="hero__rate">
          <dt>Outdoor functions</dt>
          <dd>
            <span className="hero__rate-price">
              <span className="num">{currency(pricing.functionBaseRateUSD)}</span>
            </span>
          </dd>
          <div className="hero__rate-foot">
            <span className="hero__rate-meta">
              {pricing.functionMaxGuests} guests
            </span>
            {functionBundleSpecial ? (
              <span className="offer-pill">
                Night from {currency(functionBundleSpecial.specialPriceUSD)}
              </span>
            ) : null}
          </div>
        </div>
      </dl>
    </div>
  )
}
