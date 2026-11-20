import type { MetadataRoute } from 'next'

import { SITE } from '@/lib/site'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(
  /\/$/,
  '',
)

const PROPERTY_IMAGES = [
  `${siteUrl}/photos/country-gate.jpg`,
  `${siteUrl}/photos/lounge.jpg`,
  `${siteUrl}/photos/bedroom.jpg`,
  `${siteUrl}/photos/dining-room.jpg`,
  `${siteUrl}/photos/kitchen-white.jpg`,
  `${siteUrl}/photos/garden-lawn.jpg`,
]

const LAST_MODIFIED = '2026-11-20'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1,
      images: PROPERTY_IMAGES,
    },
    {
      url: `${siteUrl}/llms.txt`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/llms-full.txt`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]
}
