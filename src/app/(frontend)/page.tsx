import { Suspense } from 'react'
import { connection } from 'next/server'

import { SiteHeader } from '@/components/site/site-header'
import { Hero } from '@/components/site/hero'
import { HouseSection } from '@/components/site/house-section'
import { FunctionsSection } from '@/components/site/functions-section'
import { DayServicesSection } from '@/components/site/day-services'
import { SpecialsSection } from '@/components/site/specials-section'
import { GallerySection } from '@/components/site/gallery-section'
import { SiteFooter } from '@/components/site/site-footer'
import { ContactSection } from '@/components/site/contact-section'
import { BookingEngine } from '@/features/booking/booking-engine'
import { getHomeData } from '@/features/home/home-data'
import { SITE } from '@/lib/site'

async function HomePage() {
  await connection()
  const data = await getHomeData()
  const bedroom = data.gallery.find((photo) => photo.category === 'bedrooms')
  const lounge = data.gallery.find((photo) => photo.category === 'lounge')
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: SITE.name,
    description:
      'A private four-bedroom guesthouse and garden venue in Mainway Meadows, Waterfalls, Harare.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2007 Makoni St',
      addressLocality: 'Harare',
      addressRegion: 'Harare',
      addressCountry: 'ZW',
    },
    telephone: '+263772964425',
    priceRange: `$${data.pricing.accommodationNightlyRateUSD} to $${data.pricing.functionBaseRateUSD}`,
    makesOffer: [
      {
        '@type': 'Offer',
        name: 'Overnight accommodation, full house',
        price: data.pricing.accommodationNightlyRateUSD,
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Outdoor venue hire',
        price: data.pricing.functionBaseRateUSD,
        priceCurrency: 'USD',
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

        <ContactSection />
      </main>

      <SiteFooter credits={data.credits} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
