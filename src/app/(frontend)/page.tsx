import { Suspense } from 'react'

import { SiteHeader } from '@/components/site/site-header'
import { Hero } from '@/components/site/hero'
import { HouseSection } from '@/components/site/house-section'
import { FunctionsSection } from '@/components/site/functions-section'
import { DayServicesSection } from '@/components/site/day-services'
import { SpecialsSection } from '@/components/site/specials-section'
import { GallerySection } from '@/components/site/gallery-section'
import { FaqSection } from '@/components/site/faq-section'
import { SiteFooter } from '@/components/site/site-footer'
import { ContactSection } from '@/components/site/contact-section'
import { BookingEngine } from '@/features/booking/booking-engine'
import {
  DEFAULT_PRICING,
  getAvailabilityData,
  getGalleryData,
  getPricingBannerData,
  getSpecialsData,
} from '@/features/home/home-data'
import { nightlyFromSpecial } from '@/lib/pricing'
import { FAQS, SITE } from '@/lib/site'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(
  /\/$/,
  '',
)

function absolutePhotoUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src
  return `${siteUrl}${src.startsWith('/') ? '' : '/'}${src}`
}

function nightlyPriceSpecification(price: number) {
  return {
    '@type': 'UnitPriceSpecification',
    price,
    priceCurrency: SITE.currency,
    unitCode: 'DAY',
  }
}

/**
 * Google validates every `makesOffer` entry on a lodging business as an overnight
 * stay, so each rate needs both types, a check-in/out time and a priceSpecification.
 */
function lodgingOffer(price: number) {
  return {
    '@type': ['Offer', 'LodgingReservation'],
    checkinTime: SITE.checkinTime,
    checkoutTime: SITE.checkoutTime,
    price,
    priceCurrency: SITE.currency,
    priceSpecification: nightlyPriceSpecification(price),
    availability: 'https://schema.org/InStock',
  }
}

async function HeaderSectionServer() {
  const [pricingBanner, specialsData] = await Promise.all([
    getPricingBannerData(),
    getSpecialsData(),
  ])

  const featuredSpecial =
    specialsData.specials.find(
      (special) => special.id === pricingBanner.featuredSpecialId,
    ) ?? null

  return (
    <SiteHeader
      showBanner={
        pricingBanner.showSpecialsBannerFlag &&
        specialsData.specials.length > 0
      }
      bannerHeadline={pricingBanner.bannerHeadline}
      featuredSpecial={featuredSpecial}
    />
  )
}

function HeaderSectionFallback() {
  return (
    <SiteHeader
      showBanner={false}
      bannerHeadline=""
      featuredSpecial={null}
    />
  )
}

async function HeroSectionServer() {
  const [pricingBanner, specialsData, galleryData, availabilityData] =
    await Promise.all([
      getPricingBannerData(),
      getSpecialsData(),
      getGalleryData(),
      getAvailabilityData(),
    ])

  return (
    <Hero
      heroPhoto={galleryData.heroPhoto}
      pricing={pricingBanner.pricing}
      specials={specialsData.specials}
      staySpecial={specialsData.staySpecial}
      functionBundleSpecial={specialsData.functionBundleSpecial}
      availability={availabilityData.availability}
      suggestedStay={availabilityData.suggestedStay}
      suggestedFunctionDate={availabilityData.suggestedFunctionDate}
      today={availabilityData.today}
    />
  )
}

function HeroSectionFallback() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <h1 className="hero__title" id="hero-title">
            <span className="hero__welcome">Welcome to</span>
            <span className="hero__name">The Pink House</span>
          </h1>
          <p className="hero__lead">
            A spacious 4-bedroom guesthouse and neat garden venue in peaceful
            Mainway Meadows, Waterfalls, Harare — close to the airport.
          </p>
        </div>
        <div className="hero__media">
          <div className="hero__main-photo hero__main-photo--empty" />
        </div>
      </div>
    </section>
  )
}

async function HouseSectionServer() {
  const { bedroomPhoto } = await getGalleryData()
  return <HouseSection bedroom={bedroomPhoto} />
}

async function FunctionsSectionServer() {
  const { pricing } = await getPricingBannerData()
  return <FunctionsSection pricing={pricing} />
}

async function DayServicesSectionServer() {
  const { pricing } = await getPricingBannerData()
  return <DayServicesSection pricing={pricing} />
}

async function SpecialsSectionServer() {
  const [{ specials }, { loungePhoto }] = await Promise.all([
    getSpecialsData(),
    getGalleryData(),
  ])
  return <SpecialsSection specials={specials} leadPhoto={loungePhoto} />
}

async function GallerySectionServer() {
  const { gallery } = await getGalleryData()
  return <GallerySection photos={gallery} />
}

async function BookingEngineServer() {
  const [{ pricing }, { specials }, availabilityData] = await Promise.all([
    getPricingBannerData(),
    getSpecialsData(),
    getAvailabilityData(),
  ])

  return (
    <BookingEngine
      pricing={pricing}
      specials={specials}
      availability={availabilityData.availability}
      suggestedStay={availabilityData.suggestedStay}
    />
  )
}

function BookingEngineFallback() {
  return (
    <div className="booking-engine" role="status" aria-label="Loading availability calendar">
      <div className="booking-engine__left">
        <p className="lead">Loading availability calendar…</p>
      </div>
      <div className="booking-engine__right" />
    </div>
  )
}

async function FooterSectionServer() {
  const { credits } = await getGalleryData()
  return <SiteFooter credits={credits} />
}

async function StructuredDataServer() {
  const [pricingBanner, specialsData, galleryData] = await Promise.all([
    getPricingBannerData(),
    getSpecialsData(),
    getGalleryData(),
  ])

  const imageUrls = Array.from(
    new Set(
      [
        ...(galleryData.heroPhoto
          ? [absolutePhotoUrl(galleryData.heroPhoto.src)]
          : []),
        ...galleryData.gallery.map((photo) => absolutePhotoUrl(photo.src)),
        `${siteUrl}/photos/country-gate.jpg`,
      ].filter(Boolean),
    ),
  )

  const staySpecialOffers = specialsData.specials
    .filter((special) => special.category === 'accommodation')
    .map((special) => {
      const nightlyRate =
        nightlyFromSpecial(special) ?? special.specialPriceUSD

      return {
        ...lodgingOffer(nightlyRate),
        '@id': `${siteUrl}/#special-${special.slug}`,
        name: `${special.title} (${special.badgeText})`,
        description: special.description,
        validFrom: special.validFrom,
        priceValidUntil: special.validUntil,
        url: `${siteUrl}/#specials`,
        ...(special.minNights && special.minNights > 1
          ? {
              eligibleDuration: {
                '@type': 'QuantitativeValue',
                minValue: special.minNights,
                unitCode: 'DAY',
              },
            }
          : {}),
      }
    })

  const otherSpecialOffers = specialsData.specials
    .filter((special) => special.category !== 'accommodation')
    .map((special) => ({
      '@type': 'Offer',
      '@id': `${siteUrl}/#special-${special.slug}`,
      name: `${special.title} (${special.badgeText})`,
      description: special.description,
      price: special.specialPriceUSD,
      priceCurrency: SITE.currency,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: special.specialPriceUSD,
        priceCurrency: SITE.currency,
      },
      validFrom: special.validFrom,
      priceValidUntil: special.validUntil,
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/#specials`,
    }))

  const nearestAirportEntity = {
    '@type': 'Airport',
    name: SITE.nearestAirport.name,
    alternateName: [...SITE.nearestAirport.alternateNames],
    iataCode: SITE.nearestAirport.iataCode,
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE.name,
        alternateName: 'The Pink House Harare',
        description: SITE.description,
        inLanguage: 'en-ZW',
        publisher: {
          '@id': `${siteUrl}/#lodging`,
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: siteUrl,
        name: 'The Pink House | Guesthouse & Garden Venue Near Harare Airport',
        description: SITE.description,
        isPartOf: {
          '@id': `${siteUrl}/#website`,
        },
        about: {
          '@id': `${siteUrl}/#lodging`,
        },
        mainEntity: {
          '@id': `${siteUrl}/#lodging`,
        },
        mentions: [nearestAirportEntity],
        inLanguage: 'en-ZW',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: [
            '#hero-title',
            '.hero__lead',
            '#the-house h2',
            '#functions h2',
            '#faq-title',
          ],
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: SITE.name,
            item: siteUrl,
          },
        ],
      },
      {
        '@type': ['LodgingBusiness', 'VacationRental', 'EventVenue'],
        '@id': `${siteUrl}/#lodging`,
        identifier: 'the-pink-house-harare',
        additionalType: 'House',
        name: SITE.name,
        alternateName: 'The Pink House Guesthouse & Garden Venue',
        description: SITE.description,
        slogan: 'The whole house, one key.',
        url: siteUrl,
        telephone: SITE.phoneE164,
        email: SITE.email,
        image: imageUrls,
        logo: `${siteUrl}/favicon.svg`,
        hasMap: SITE.mapsHref,
        sameAs: [SITE.whatsappHref, SITE.mapsHref],
        priceRange: `$${pricingBanner.pricing.accommodationNightlyRateUSD} - $${pricingBanner.pricing.functionBaseRateUSD} USD`,
        currenciesAccepted: SITE.currency,
        paymentAccepted: 'Cash, Bank Transfer, Direct Arrangement with Host',
        maximumAttendeeCapacity: pricingBanner.pricing.functionMaxGuests,
        numberOfRooms: SITE.bedrooms,
        petsAllowed: false,
        checkinTime: SITE.checkinTime,
        checkoutTime: SITE.checkoutTime,
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE.streetAddress,
          addressLocality: SITE.city,
          addressRegion: 'Harare Province',
          addressCountry: SITE.countryCode,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: SITE.coordinates.latitude,
          longitude: SITE.coordinates.longitude,
        },
        areaServed: [
          {
            '@type': 'Place',
            name: 'Mainway Meadows, Waterfalls, Harare',
          },
          {
            '@type': 'City',
            name: 'Harare',
          },
          {
            '@type': 'Country',
            name: 'Zimbabwe',
          },
          nearestAirportEntity,
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'reservations',
            name: SITE.host,
            telephone: SITE.phoneE164,
            email: SITE.email,
            url: `${siteUrl}/#contact`,
            availableLanguage: ['en', 'sn'],
            areaServed: 'ZW',
          },
        ],
        containsPlace: {
          '@type': ['Accommodation', 'House'],
          additionalType: 'EntirePlace',
          '@id': `${siteUrl}/#house`,
          name: 'The Pink House — Full Four-Bedroom Residence',
          description:
            'Exclusive whole-house rental with four double bedrooms, en-suite main bedroom, two further toilets (one with shower), chandelier lounge, eight-seater dining room, fitted self-catering kitchen, paved yard and garden.',
          numberOfBedrooms: SITE.bedrooms,
          numberOfBathroomsTotal: 3,
          numberOfFullBathrooms: 2,
          occupancy: {
            '@type': 'QuantitativeValue',
            value: SITE.accommodationMaxGuests,
            maxValue: SITE.accommodationMaxGuests,
            unitText: 'overnight guests',
          },
          floorSize: {
            '@type': 'QuantitativeValue',
            unitCode: 'MTK',
          },
        },
        amenityFeature: [
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Exclusive whole-house access (one key)',
            value: true,
          },
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Four double bedrooms with fitted wardrobes',
            value: true,
          },
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Main bedroom en-suite bathroom',
            value: true,
          },
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Chandelier lounge and eight-seater dining room',
            value: true,
          },
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Fitted self-catering kitchen (double-door fridge, stove, oven, microwave, kettle)',
            value: true,
          },
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Neat lawn, garden and spacious paved outdoor venue',
            value: true,
          },
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Secure gated perimeter on a quiet street',
            value: true,
          },
          {
            '@type': 'LocationFeatureSpecification',
            name: SITE.nearestAirport.proximityLabel,
            value: true,
          },
        ],
        makesOffer: [
          {
            ...lodgingOffer(
              pricingBanner.pricing.accommodationNightlyRateUSD,
            ),
            '@id': `${siteUrl}/#offer-accommodation`,
            name: 'Overnight accommodation — full 4-bedroom house',
            description:
              'Exclusive overnight stay in the full four-bedroom house, chandelier lounge, dining room, fitted kitchen and garden — conveniently located close to Robert Gabriel Mugabe International Airport (HRE) in Waterfalls, Harare.',
            url: `${siteUrl}/#booking`,
          },
          ...staySpecialOffers,
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Garden venue hire, day services and event offers',
          itemListElement: [
            {
              '@type': 'Offer',
              '@id': `${siteUrl}/#offer-function`,
              name: `Outdoor garden & venue hire (up to ${pricingBanner.pricing.functionMaxGuests} guests)`,
              description:
                'Private outdoor garden and paved venue hire for roora/lobola, family introductions, naming ceremonies, bridal showers, baby showers and milestone birthdays.',
              price: pricingBanner.pricing.functionBaseRateUSD,
              priceCurrency: SITE.currency,
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: pricingBanner.pricing.functionBaseRateUSD,
                priceCurrency: SITE.currency,
                unitText: 'per function',
              },
              availability: 'https://schema.org/InStock',
              url: `${siteUrl}/#booking`,
              eligibleQuantity: {
                '@type': 'QuantitativeValue',
                maxValue: pricingBanner.pricing.functionMaxGuests,
                unitText: 'guests',
              },
            },
            {
              '@type': 'Offer',
              '@id': `${siteUrl}/#offer-day-services`,
              name: 'Day services, photo shoots, filming & seminars',
              description:
                'Daytime property hire for daytime rest, seminars, workshops, photo shoots, video/film productions and small church services.',
              ...(pricingBanner.pricing.dayServiceStartingRateUSD
                ? {
                    price: pricingBanner.pricing.dayServiceStartingRateUSD,
                    priceCurrency: SITE.currency,
                    priceSpecification: {
                      '@type': 'UnitPriceSpecification',
                      price: pricingBanner.pricing.dayServiceStartingRateUSD,
                      priceCurrency: SITE.currency,
                      unitText: 'per day',
                    },
                  }
                : {}),
              availability: 'https://schema.org/InStock',
              url: `${siteUrl}/#day-services`,
            },
            ...otherSpecialOffers,
          ],
        },
        potentialAction: {
          '@type': 'ReserveAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/#booking`,
            actionPlatform: [
              'https://schema.org/DesktopWebPlatform',
              'https://schema.org/MobileWebPlatform',
            ],
          },
          result: {
            '@type': 'LodgingReservation',
            name: 'Reservation request at The Pink House',
          },
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faqpage`,
        url: `${siteUrl}/#faq`,
        isPartOf: {
          '@id': `${siteUrl}/#webpage`,
        },
        about: {
          '@id': `${siteUrl}/#lodging`,
        },
        mainEntity: FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
      }}
    />
  )
}

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Suspense fallback={<HeaderSectionFallback />}>
        <HeaderSectionServer />
      </Suspense>

      <main id="main">
        <Suspense fallback={<HeroSectionFallback />}>
          <HeroSectionServer />
        </Suspense>

        <Suspense fallback={<HouseSection bedroom={undefined} />}>
          <HouseSectionServer />
        </Suspense>

        <Suspense fallback={<FunctionsSection pricing={DEFAULT_PRICING} />}>
          <FunctionsSectionServer />
        </Suspense>

        <Suspense fallback={<DayServicesSection pricing={DEFAULT_PRICING} />}>
          <DayServicesSectionServer />
        </Suspense>

        <Suspense fallback={<SpecialsSection specials={[]} />}>
          <SpecialsSectionServer />
        </Suspense>

        <Suspense fallback={<GallerySection photos={[]} />}>
          <GallerySectionServer />
        </Suspense>

        <section className="section booking-section" id="booking">
          <div className="container">
            <div className="section-heading section-heading--split">
              <h2>Check availability</h2>
              <p className="lead">
                Pick your dates and special, then send a request.
              </p>
            </div>

            <Suspense fallback={<BookingEngineFallback />}>
              <BookingEngineServer />
            </Suspense>
          </div>
        </section>

        <FaqSection />

        <ContactSection />
      </main>

      <Suspense fallback={<SiteFooter credits={[]} />}>
        <FooterSectionServer />
      </Suspense>

      <Suspense fallback={null}>
        <StructuredDataServer />
      </Suspense>
    </>
  )
}
