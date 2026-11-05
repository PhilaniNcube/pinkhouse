import { StartBookingButton } from './start-booking-button'
import type { SitePricing } from '@/lib/pricing'
import { currency } from '@/lib/pricing'

interface DayServicesSectionProps {
  pricing: SitePricing
}

const dayServices = [
  {
    title: 'Daytime rest',
    description: 'Private daytime use',
  },
  {
    title: 'Seminars and workshops',
    description: 'Indoor room and garden',
  },
  {
    title: 'Photo shoots',
    description: 'Chandelier and garden backdrops',
  },
  {
    title: 'Filming and video productions',
    description: 'Private, gated setting',
  },
  {
    title: 'Small church services',
    description: 'An intimate service',
  },
]

export function DayServicesSection({ pricing }: DayServicesSectionProps) {
  return (
    <section
      className="section day-services-section"
      id="day-services"
      aria-labelledby="day-services-title"
    >
      <div className="container">
        <div className="section-heading section-heading--split">
          <h2 id="day-services-title">
            Day services, productions &amp; gatherings
          </h2>
          <p className="lead">
            The house is available by day for work, worship, a shoot or a
            quiet rest.
          </p>
        </div>

        <ol className="day-services-list">
          {dayServices.map((service, index) => (
            <li key={service.title}>
              <span className="day-services-index num">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </li>
          ))}
        </ol>

        <div className="day-services-footer">
          <div>
            <p>Day rates are quoted around your hours and set-up.</p>
            {pricing.dayServiceStartingRateUSD ? (
              <p className="day-services-rate">
                Day bookings from{' '}
                <span className="num">
                  {currency(pricing.dayServiceStartingRateUSD)}
                </span>
              </p>
            ) : null}
          </div>
          <StartBookingButton
            bookingType="day-service"
            variant="outline"
            size="default"
          >
            Book a day service
          </StartBookingButton>
        </div>
      </div>
    </section>
  )
}
