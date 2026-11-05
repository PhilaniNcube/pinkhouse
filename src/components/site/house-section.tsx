import type { GalleryPhoto } from '@/features/home/home-data'
import { StartBookingButton } from './start-booking-button'

interface HouseSectionProps {
  bedroom: GalleryPhoto | undefined
}

const houseFeatures = [
  'Four plush double bedrooms, fitted wardrobes',
  'Main bedroom en-suite',
  'Two further toilets, one with a shower',
  'Chandelier lounge and eight-seater dining room',
  'Fitted kitchen: double-door fridge, stove, oven, microwave, kettle',
  'Spacious paved outdoors and a neat garden',
  'Quiet street, secure gated perimeter',
]

export function HouseSection({ bedroom }: HouseSectionProps) {
  return (
    <section className="section house-section" id="the-house">
      <div className="container">
        <div className="section-heading section-heading--split">
          <h2>Spacious comfort for families &amp; groups</h2>
          <p className="lead">
            Four bedrooms, a chandelier lounge and a full kitchen.
          </p>
        </div>

        <div className="house-body">
          <div className="house-copy">
            <ul className="feature-list">
              {houseFeatures.map((feature) => (
                <li key={feature}>
                  <span className="feature-list__mark" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="section-actions">
              <StartBookingButton
                bookingType="accommodation"
                variant="outline"
              >
                Book the house
              </StartBookingButton>
              <a className="quiet-link" href="#contact">
                Ask Mrs Ncube a question
              </a>
            </div>
          </div>

          <figure className="house-photo">
            {bedroom ? (
              <img
                src={bedroom.src}
                alt={bedroom.alt}
                width={bedroom.width}
                height={bedroom.height}
                loading="lazy"
              />
            ) : (
              <div className="photo-placeholder" aria-hidden="true" />
            )}
            <figcaption>
              <span>The main bedroom</span>
              <span>Double bed, fitted wardrobe, en-suite</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
