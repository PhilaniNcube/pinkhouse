import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/raleway/wght.css'

import { SITE } from '@/lib/site'
import './globals.css'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(
  /\/$/,
  '',
)

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      'The Pink House | Guesthouse & Garden Venue in Waterfalls, Harare',
    template: '%s | The Pink House, Harare',
  },
  description: SITE.description,
  applicationName: SITE.name,
  category: 'travel',
  classification: 'LodgingBusiness, VacationRental, EventVenue',
  keywords: [
    'The Pink House Harare',
    'The Pink House Waterfalls',
    'guesthouse in Waterfalls Harare',
    'Mainway Meadows accommodation',
    '4 bedroom guesthouse Harare',
    'private house rental Harare Zimbabwe',
    'self-catering accommodation Harare',
    'garden venue Harare',
    'outdoor function venue Harare',
    'roora venue Harare',
    'lobola venue Waterfalls Harare',
    'bridal shower venue Harare',
    'baby shower garden venue Harare',
    'intimate event venue Harare',
    'photo shoot location Harare',
    'day rest guesthouse Harare',
    '2007 Makoni St Mainway Meadows',
    'Mrs Ncube Pink House',
  ],
  authors: [{ name: SITE.host, url: siteUrl }],
  creator: SITE.name,
  publisher: SITE.name,
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-ZW': '/',
      en: '/',
      'x-default': '/',
    },
    types: {
      'text/markdown': '/llms.txt',
    },
  },
  openGraph: {
    title: 'The Pink House | Private 4-Bedroom Guesthouse & Garden Venue in Harare',
    description:
      'Whole-house overnight stays from $80/night and intimate outdoor garden functions for up to 30 guests at 2007 Makoni St, Mainway Meadows, Waterfalls, Harare.',
    url: '/',
    siteName: SITE.name,
    locale: SITE.locale,
    type: 'website',
    countryName: SITE.country,
    phoneNumbers: [SITE.phoneE164],
    emails: [SITE.email],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Pink House | Guesthouse & Garden Venue in Waterfalls, Harare',
    description:
      'A private four-bedroom guesthouse and neat garden venue at 2007 Makoni St, Mainway Meadows, Waterfalls, Harare. Stays from $80/night. Functions for up to 30 guests.',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    shortcut: ['/favicon.svg'],
  },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: 'default',
  },
  other: {
    'geo.region': 'ZW-HA',
    'geo.placename': 'Mainway Meadows, Waterfalls, Harare, Zimbabwe',
    'geo.position': `${SITE.coordinates.latitude};${SITE.coordinates.longitude}`,
    ICBM: `${SITE.coordinates.latitude}, ${SITE.coordinates.longitude}`,
    'llms-txt': `${siteUrl}/llms.txt`,
    'llms-full-txt': `${siteUrl}/llms-full.txt`,
    'ai-content-declaration': 'human-authored-live-availability',
    'booking:currency': SITE.currency,
    'booking:accommodation_rate_usd': String(SITE.standardAccommodationRate),
    'booking:function_rate_usd': String(SITE.standardFunctionRate),
    'booking:max_function_guests': String(SITE.functionMaxGuests),
    'contact:host': SITE.host,
    'contact:phone': SITE.phoneE164,
    'contact:address': `${SITE.address}, ${SITE.country}`,
  },
}

export const viewport: Viewport = {
  themeColor: '#4A1922',
  colorScheme: 'light',
}

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-ZW">
      <body>{children}</body>
    </html>
  )
}
