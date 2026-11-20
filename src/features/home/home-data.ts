import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { GalleryItem, Media } from '@/payload-types'
import {
  buildAvailabilitySnapshot,
  findNextDate,
  findNextStay,
  toBlockOccupancy,
  toBookingOccupancy,
  toExternalBlockOccupancy,
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

export interface PricingBannerData {
  pricing: SitePricing
  bannerHeadline: string
  showSpecialsBannerFlag: boolean
  featuredSpecialId: number | null
}

export interface SpecialsBundleData {
  specials: PublicSpecial[]
  staySpecial: PublicSpecial | null
  functionBundleSpecial: PublicSpecial | null
}

export interface GalleryData {
  gallery: GalleryPhoto[]
  heroPhoto: GalleryPhoto | null
  bedroomPhoto: GalleryPhoto | undefined
  loungePhoto: GalleryPhoto | undefined
  credits: Array<{ name: string; url: string | null }>
}

export interface AvailabilityData {
  availability: AvailabilitySnapshot
  suggestedStay: { checkIn: string; checkOut: string } | null
  suggestedFunctionDate: string | null
  today: string
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

export const DEFAULT_PRICING: SitePricing = {
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

export async function getPricingBannerData(): Promise<PricingBannerData> {
  'use cache'
  cacheLife('hours')
  cacheTag('pricing-settings')

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({
    slug: 'pricing-settings',
    depth: 1,
  })

  const pricing = settings ? toSitePricing(settings) : DEFAULT_PRICING

  const featuredSpecialId =
    settings?.featuredSpecial && typeof settings.featuredSpecial === 'object'
      ? settings.featuredSpecial.id
      : typeof settings?.featuredSpecial === 'number'
        ? settings.featuredSpecial
        : null

  return {
    pricing,
    bannerHeadline:
      settings?.bannerHeadline ||
      'Book a function and a night in the house together, and save.',
    showSpecialsBannerFlag: settings?.showSpecialsBanner ?? true,
    featuredSpecialId,
  }
}

export async function getSpecialsData(): Promise<SpecialsBundleData> {
  'use cache'
  cacheLife('hours')
  cacheTag('specials')

  const payload = await getPayload({ config })
  const today = todayISO()

  const specialsResult = await payload.find({
    collection: 'specials',
    where: { isActive: { equals: true } },
    limit: 100,
    depth: 0,
    sort: 'createdAt',
  })

  const specials = specialsResult.docs
    .map(toPublicSpecial)
    .filter(
      (special) =>
        special.validFrom <= today && special.validUntil >= today,
    )

  const staySpecial =
    specials.find(
      (special) =>
        special.category === 'accommodation' && (special.minNights ?? 0) > 1,
    ) ?? null

  const functionBundleSpecial =
    specials.find((special) => special.category === 'bundle') ?? null

  return {
    specials,
    staySpecial,
    functionBundleSpecial,
  }
}

export async function getGalleryData(): Promise<GalleryData> {
  'use cache'
  cacheLife('hours')
  cacheTag('gallery')

  const payload = await getPayload({ config })
  const galleryResult = await payload.find({
    collection: 'gallery-items',
    limit: 24,
    depth: 2,
    sort: 'displayOrder',
  })

  const allGallery = galleryResult.docs.flatMap((item) => {
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
  const bedroomPhoto = gallery.find((photo) => photo.category === 'bedrooms')
  const loungePhoto = gallery.find((photo) => photo.category === 'lounge')

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

  return {
    gallery,
    heroPhoto,
    bedroomPhoto,
    loungePhoto,
    credits: Array.from(creditMap.values()),
  }
}

export async function getAvailabilityData(): Promise<AvailabilityData> {
  'use cache'
  cacheLife('minutes')
  cacheTag('availability')

  const payload = await getPayload({ config })
  const today = todayISO()

  const [bookingsResult, blocksResult, externalBlocksResult] =
    await Promise.all([
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
      payload.find({
        collection: 'external-blocks',
        where: { endDate: { greater_than_equal: today } },
        pagination: false,
        depth: 0,
      }),
    ])

  const occupancies = bookingsResult.docs.flatMap((booking) => {
    const occupancy = toBookingOccupancy(booking)
    return occupancy ? [occupancy] : []
  })

  const blocks = blocksResult.docs.flatMap((block) => {
    const occupancy = toBlockOccupancy(block)
    return occupancy ? [occupancy] : []
  })

  const externalBlocks = externalBlocksResult.docs.flatMap((block) => {
    const occupancy = toExternalBlockOccupancy(block)
    return occupancy ? [occupancy] : []
  })

  const availability = buildAvailabilitySnapshot(
    occupancies,
    blocks,
    externalBlocks,
  )
  const suggestedStay =
    findNextStay(availability, 3, 150) ??
    findNextStay(availability, 1, 150)
  const suggestedFunctionDate = findNextDate(availability, 'function', 150)

  return {
    availability,
    suggestedStay,
    suggestedFunctionDate,
    today,
  }
}

export async function getHomeData(): Promise<HomeData> {
  const [pricingBanner, specialsData, galleryData, availabilityData] =
    await Promise.all([
      getPricingBannerData(),
      getSpecialsData(),
      getGalleryData(),
      getAvailabilityData(),
    ])

  const featuredSpecial =
    specialsData.specials.find(
      (special) => special.id === pricingBanner.featuredSpecialId,
    ) ?? null

  return {
    pricing: pricingBanner.pricing,
    specials: specialsData.specials,
    featuredSpecial,
    bannerHeadline: pricingBanner.bannerHeadline,
    showSpecialsBanner:
      pricingBanner.showSpecialsBannerFlag && specialsData.specials.length > 0,
    gallery: galleryData.gallery,
    heroPhoto: galleryData.heroPhoto,
    credits: galleryData.credits,
    availability: availabilityData.availability,
    suggestedStay: availabilityData.suggestedStay,
    suggestedFunctionDate: availabilityData.suggestedFunctionDate,
    staySpecial: specialsData.staySpecial,
    functionBundleSpecial: specialsData.functionBundleSpecial,
    today: availabilityData.today,
  }
}

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
