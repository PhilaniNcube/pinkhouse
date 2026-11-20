import { Suspense } from 'react'
import { connection } from 'next/server'

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
import { getHomeData } from '@/features/home/home-data'
import { FAQS, SITE } from '@/lib/site'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(
  /\/$/,
  '',
)

function absolutePhotoUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src
  return `${siteUrl}${src.startsWith('/') ? '' : '/'}${src}`
}

async function HomePage() {
  await connection()
  const data = await getHomeData()
  const bedroom = data.gallery.find((photo) => photo.category === 'bedrooms')
  const lounge = data.gallery.find((photo) => photo.category === 'lounge')

  const imageUrls = Array.from(
    new Set(
      [
        ...(data.heroPhoto ? [absolutePhotoUrl(data.heroPhoto.src)] : []),
        ...data.gallery.map((photo) => absolutePhotoUrl(photo.src)),
        `${siteUrl}/photos/country-gate.jpg`,
      ].filter(Boolean),
    ),
  )

  const specialOffers = data.specials.map((special) => ({
    '@type': 'Offer',
    '@id': `${siteUrl}/#special-${special.slug}`,
    name: `${special.title} (${special.badgeText})`,
    description: special.description,
    price: special.specialPriceUSD,
    priceCurrency: SITE.currency,
    validFrom: special.validFrom,
    priceValidUntil: special.validUntil,
    availability: 'https://schema.org/InStock',
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
  }))

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
        name: 'The Pink House | Guesthouse & Garden Venue in Waterfalls, Harare',
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
        priceRange: `$${data.pricing.accommodationNightlyRateUSD} - $${data.pricing.functionBaseRateUSD} USD`,
        currenciesAccepted: SITE.currency,
        paymentAccepted: 'Cash, Bank Transfer, Direct Arrangement with Host',
        maximumAttendeeCapacity: data.pricing.functionMaxGuests,
        numberOfRooms: SITE.bedrooms,
        petsAllowed: false,
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
          '@type': 'House',
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
        ],
        makesOffer: [
          {
            '@type': 'Offer',
            '@id': `${siteUrl}/#offer-accommodation`,
            name: 'Overnight accommodation — full 4-bedroom house',
            description:
              'Exclusive overnight stay in the full four-bedroom house, chandelier lounge, dining room, fitted kitchen and garden.',
            price: data.pricing.accommodationNightlyRateUSD,
            priceCurrency: SITE.currency,
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/#booking`,
            itemOffered: {
              '@type': 'LodgingReservation',
              name: 'Whole-house overnight stay at The Pink House',
            },
          },
          {
            '@type': 'Offer',
            '@id': `${siteUrl}/#offer-function`,
            name: `Outdoor garden & venue hire (up to ${data.pricing.functionMaxGuests} guests)`,
            description:
              'Private outdoor garden and paved venue hire for roora/lobola, family introductions, naming ceremonies, bridal showers, baby showers and milestone birthdays.',
            price: data.pricing.functionBaseRateUSD,
            priceCurrency: SITE.currency,
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/#booking`,
            eligibleQuantity: {
              '@type': 'QuantitativeValue',
              maxValue: data.pricing.functionMaxGuests,
              unitText: 'guests',
            },
          },
          {
            '@type': 'Offer',
            '@id': `${siteUrl}/#offer-day-services`,
            name: 'Day services, photo shoots, filming & seminars',
            description:
              'Daytime property hire for daytime rest, seminars, workshops, photo shoots, video/film productions and small church services.',
            ...(data.pricing.dayServiceStartingRateUSD
              ? {
                  price: data.pricing.dayServiceStartingRateUSD,
                  priceCurrency: SITE.currency,
                }
              : {}),
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/#day-services`,
          },
          ...specialOffers,
        ],
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
    <>
      <SiteHeader
        showBanner={data.showSpecialsBanner}
        bannerHeadline={data.bannerHeadline}
        featuredSpecial={data.featuredSpecial}
      />

      <main id="main">
        <Hero
          heroPhoto={data.heroPhoto}
          pricing={data.pricing}
          specials={data.specials}
          staySpecial={data.staySpecial}
          functionBundleSpecial={data.functionBundleSpecial}
          availability={data.availability}
          suggestedStay={data.suggestedStay}
          suggestedFunctionDate={data.suggestedFunctionDate}
          today={data.today}
        />

        <HouseSection bedroom={bedroom} />

        <FunctionsSection pricing={data.pricing} />

        <DayServicesSection pricing={data.pricing} />

        <SpecialsSection specials={data.specials} leadPhoto={lounge} />

        <GallerySection photos={data.gallery} />

        <section className="section booking-section" id="booking">
          <div className="container">
            <div className="section-heading section-heading--split">
              <h2>Check availability</h2>
              <p className="lead">
                Pick your dates and special, then send a request.
              </p>
            </div>

            <BookingEngine
              pricing={data.pricing}
              specials={data.specials}
              availability={data.availability}
              suggestedStay={data.suggestedStay}
            />
          </div>
        </section>

        <FaqSection />

        <ContactSection />
      </main>

      <SiteFooter credits={data.credits} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
    </>
  )
}

function HomePageLoading() {
  return (
    <div className="loading-shell" role="status">
      Loading The Pink House…
    </div>
  )
}

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Suspense fallback={<HomePageLoading />}>
        <HomePage />
      </Suspense>
    </>
  )
}
