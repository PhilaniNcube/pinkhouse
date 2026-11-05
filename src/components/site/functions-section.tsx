import { StartBookingButton } from './start-booking-button'
import { currency, type SitePricing } from '@/lib/pricing'

interface FunctionsSectionProps {
  pricing: SitePricing
}

const eventTypes = [
  'Roora and bride price functions',
  'Introductions and family gatherings',
  'Naming ceremonies',
  'Hen nights and bridal showers',
  'Bachelor parties',
  'Baby showers',
  'Birthdays and milestone celebrations',
]

export function FunctionsSection({ pricing }: FunctionsSectionProps) {
  return (
    <section className="section functions-section surface-dark" id="functions">
      <div className="container">
        <div className="functions-head">
          <h2>Host your milestone moments outdoors</h2>
          <p className="functions-tagline">
            You name it,
            <br />
            we can host it.
          </p>
        </div>

        <div className="functions-body">
          <p className="functions-intro">
            Bring your people; the garden and paved yard are yours.
          </p>
          <ul className="event-list">
            {eventTypes.map((eventType) => (
              <li key={eventType}>{eventType}</li>
            ))}
          </ul>
        </div>

        <div className="functions-price">
          <div className="functions-price__main">
            <span className="functions-price__amount num">
              {currency(pricing.functionBaseRateUSD)}
            </span>
            <div>
              <p className="functions-price__label">Standard venue hire</p>
              <p className="functions-price__meta">
                For up to {pricing.functionMaxGuests} guests
              </p>
            </div>
          </div>
          <StartBookingButton
            bookingType="function"
            size="large"
            className="functions-price__button"
          >
            Book function date
          </StartBookingButton>
        </div>
      </div>
    </section>
  )
}
