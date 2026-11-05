import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/raleway/wght.css'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ),
  title: 'The Pink House | Guesthouse & Garden Venue in Waterfalls, Harare',
  description:
    'A private four-bedroom guesthouse and neat garden venue at 2007 Makoni St, Mainway Meadows, Waterfalls, Harare. Stays from $80 a night. Outdoor functions for up to 30 guests.',
  openGraph: {
    title: 'The Pink House, Harare',
    description:
      'A private four-bedroom guesthouse and intimate garden venue in Mainway Meadows, Waterfalls.',
    locale: 'en_ZW',
    type: 'website',
    siteName: 'The Pink House',
  },
  icons: {
    icon: '/favicon.svg',
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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
