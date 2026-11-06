import 'server-only'

import { cache } from 'react'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { GalleryItem, Media } from '@/payload-types'
import {
  buildAvailabilitySnapshot,
  findNextDate,
  findNextStay,
  toBlockOccupancy,
  toBookingOccupancy,
  type AvailabilitySnapshot,
} from '@/lib/availability'
import { formatDate, todayISO } from '@/lib/dates'
import {
  currency,
  nightlyFromSpecial,
  toPublicSpecial,
  toSitePricing,
  type PublicSpecial,
  type SitePricing,
} from '@/lib/pricing'

export interface GalleryPhoto {
  id: number
  title: string
  category: string
  src: string
  thumbnail: string
  alt: string
  width: number
  height: number
  credit: string | null
  creditUrl: string | null
}

export interface HomeData {
  pricing: SitePricing
  specials: PublicSpecial[]
  featuredSpecial: PublicSpecial | null
  bannerHeadline: string
  showSpecialsBanner: boolean
  gallery: GalleryPhoto[]
  heroPhoto: GalleryPhoto | null
  credits: Array<{ name: string; url: string | null }>
  availability: AvailabilitySnapshot
  suggestedStay: { checkIn: string; checkOut: string } | null
  suggestedFunctionDate: string | null
  staySpecial: PublicSpecial | null
  functionBundleSpecial: PublicSpecial | null
  today: string
}

const DEFAULT_PRICING: SitePricing = {
  accommodationNightlyRateUSD: 80,
  functionBaseRateUSD: 150,
  functionMaxGuests: 30,
  dayServiceStartingRateUSD: null,
}

function mediaSource(media: number | Media | null | undefined): {
  src: string
  thumbnail: string
  alt: string
  width: number
  height: number
  credit: string | null
  creditUrl: string | null
} | null {
  if (!media || typeof media === 'number') return null

  const src = media.url || media.sizes?.wide?.url || media.sizes?.card?.url
  if (!src) return null

  return {
    src,
    thumbnail: media.sizes?.card?.url || src,
    alt: media.alt || '',
    width: media.width || 1600,
    height: media.height || 1067,
    credit: media.credit || null,
    creditUrl: media.creditUrl || null,
  }
}

function toGalleryPhoto(item: GalleryItem): GalleryPhoto | null {
  const source = mediaSource(item.image)
  if (!source) return null

  return {
    id: item.id,
    title: item.title,
    category: item.category,
    ...source,
    alt:
      source.alt && source.alt.trim().split(/\s+/).length > 2
        ? source.alt
        : `${item.title} at The Pink House`,
  }
}

export const getHomeData = cache(async (): Promise<HomeData> => {
  const payload = await getPayload({ config })
  const today = todayISO()

  const [settings, specialsResult, galleryResult, bookingsResult, blocksResult] =
    await Promise.all([
      payload.findGlobal({ slug: 'pricing-settings', depth: 1 }),
      payload.find({
        collection: 'specials',
        where: { isActive: { equals: true } },
        limit: 100,
        depth: 0,
        sort: 'createdAt',
      }),
      payload.find({
        collection: 'gallery-items',
        limit: 24,
        depth: 2,
        sort: 'displayOrder',
      }),
      payload.find({
        collection: 'bookings',
        where: { status: { in: ['pending', 'confirmed'] } },
        limit: 1000,
        depth: 0,
      }),
      payload.find({
        collection: 'availability-blocks',
        limit: 500,
        depth: 0,
      }),
    ])

  const pricing = settings ? toSitePricing(settings) : DEFAULT_PRICING

  const allSpecials = specialsResult.docs
    .map(toPublicSpecial)
    .filter(
      (special) =>
        special.validFrom <= today && special.validUntil >= today,
    )

  const featuredSpecialId =
    settings?.featuredSpecial && typeof settings.featuredSpecial === 'object'
      ? settings.featuredSpecial.id
      : typeof settings?.featuredSpecial === 'number'
        ? settings.featuredSpecial
        : null

  const featuredSpecial =
    allSpecials.find((special) => special.id === featuredSpecialId) ?? null

  const galleryDocs = galleryResult.docs
  const allGallery = galleryDocs.flatMap((item) => {
    const photo = toGalleryPhoto(item)
    return photo ? [photo] : []
  })
  const heroPhoto =
    allGallery.find((photo) => photo.category === 'exterior') ??
    allGallery[0] ??
    null

  const categoryOrder = [
    'exterior',
    'lounge',
    'bedrooms',
    'dining',
    'kitchen',
    'garden',
  ] as const

  const selectedGallery = categoryOrder.flatMap((category) => {
    const candidates = allGallery.filter(
      (item) => item.category === category,
    )
    if (!candidates.length) return []
    if (category === 'exterior' && heroPhoto) {
      const alternate = candidates.find(
        (candidate) => candidate.id !== heroPhoto.id,
      )
      if (alternate) return [alternate]
    }
    if (category === 'lounge') {
      const ownerLounge = candidates.find(
        (candidate) => !/chandelier/i.test(candidate.title),
      )
      if (ownerLounge) return [ownerLounge]
    }
    if (category === 'bedrooms') {
      const main = candidates.find((item) =>
        /main|en-suite|ensuite/i.test(item.title),
      )
      return [main ?? candidates[0]]
    }
    return [candidates[0]]
  })

  const gallery = selectedGallery.slice(0, 6)

  const creditMap = new Map<string, { name: string; url: string | null }>()
  for (const item of [...gallery, ...(heroPhoto ? [heroPhoto] : [])]) {
    if (!item.credit) continue
    if (!creditMap.has(item.credit)) {
      creditMap.set(item.credit, {
        name: item.credit,
        url: item.creditUrl,
      })
    }
  }

  const occupancies = bookingsResult.docs.flatMap((booking) => {
    const occupancy = toBookingOccupancy(booking)
    return occupancy ? [occupancy] : []
  })

  const blocks = blocksResult.docs.flatMap((block) => {
    const occupancy = toBlockOccupancy(block)
    return occupancy ? [occupancy] : []
  })

  const availability = buildAvailabilitySnapshot(occupancies, blocks)
  const suggestedStay =
    findNextStay(availability, 3, 150) ??
    findNextStay(availability, 1, 150)

  const staySpecial =
    allSpecials.find(
      (special) =>
        special.category === 'accommodation' && (special.minNights ?? 0) > 1,
    ) ?? null

  const functionBundleSpecial =
    allSpecials.find((special) => special.category === 'bundle') ?? null

  // The day-service date is derived on the client from the same snapshot.
  const suggestedFunctionDate = findNextDate(availability, 'function', 150)

  return {
    pricing,
    specials: allSpecials,
    featuredSpecial,
    bannerHeadline:
      settings?.bannerHeadline ||
      'Book a function and a night in the house together, and save.',
    showSpecialsBanner:
      (settings?.showSpecialsBanner ?? true) && allSpecials.length > 0,
    gallery,
    heroPhoto,
    credits: Array.from(creditMap.values()),
    availability,
    suggestedStay,
    suggestedFunctionDate,
    staySpecial,
    functionBundleSpecial,
    today,
  }
})

export function specialCardPriceLabel(special: PublicSpecial): string {
  return currency(special.specialPriceUSD)
}

export function specialNightlyLabel(special: PublicSpecial): string | null {
  const nightly = nightlyFromSpecial(special)
  if (!nightly) return null
  return `${currency(nightly)} a night`
}

export function specialValidityLabel(special: PublicSpecial): string {
  return `${formatDate(special.validFrom, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} to ${formatDate(special.validUntil, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`
}
