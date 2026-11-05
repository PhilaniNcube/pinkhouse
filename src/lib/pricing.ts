import type {
  Booking,
  PricingSetting,
  Special,
} from '@/payload-types'

import {
  addDays,
  isAfter,
  isSameOrAfter,
  isSameOrBefore,
  nightsBetween,
  nightsOfStay,
  type ISODate,
} from './dates'

export type BookingType = NonNullable<Booking['bookingType']>
export type SpecialCategory = NonNullable<Special['category']>
export type PricingRule = NonNullable<Special['pricingRule']>
export type BookingEventCategory = NonNullable<Booking['eventCategory']>

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  accommodation: 'Overnight stay',
  function: 'Outdoor function',
  'day-service': 'Day service',
  'special-bundle': 'Special package',
}

export const EVENT_CATEGORIES: Array<{
  value: BookingEventCategory
  label: string
}> = [
  { value: 'overnight-stay', label: 'Overnight stay' },
  { value: 'roora', label: 'Roora / bride price' },
  { value: 'introductions', label: 'Introductions' },
  { value: 'naming-ceremony', label: 'Naming ceremony' },
  { value: 'hen-night', label: 'Hen night' },
  { value: 'bachelor-party', label: 'Bachelor party' },
  { value: 'baby-shower', label: 'Baby shower' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'photo-shoot', label: 'Photo shoot' },
  { value: 'filming', label: 'Filming' },
  { value: 'church-service', label: 'Small church service' },
  { value: 'day-rest', label: 'Daytime rest' },
  { value: 'other', label: 'Other' },
]

export interface SitePricing {
  accommodationNightlyRateUSD: number
  functionBaseRateUSD: number
  functionMaxGuests: number
  dayServiceStartingRateUSD: number | null
}

export interface PublicSpecial {
  id: number
  title: string
  slug: string
  promoCode: string | null
  category: SpecialCategory
  pricingRule: PricingRule
  standardPriceUSD: number
  specialPriceUSD: number
  discountValue: number | null
  minNights: number | null
  validFrom: string
  validUntil: string
  badgeText: string
  description: string
  termsAndConditions: string | null
  isActive: boolean
}

export interface Quote {
  nightsCount: number
  standardSubtotalUSD: number
  discountAmountUSD: number
  finalTotalUSD: number
  standardLabel: string
  specialLabel: string | null
  appliedSpecial: PublicSpecial | null
}

export interface QuoteInput {
  bookingType: BookingType
  checkInDate: ISODate
  checkOutDate?: ISODate | null
  guestCount: number
  special?: PublicSpecial | null
  pricing: SitePricing
}

export function toSitePricing(settings: PricingSetting): SitePricing {
  return {
    accommodationNightlyRateUSD: settings.accommodationNightlyRateUSD ?? 80,
    functionBaseRateUSD: settings.functionBaseRateUSD ?? 150,
    functionMaxGuests: settings.functionMaxGuests ?? 30,
    dayServiceStartingRateUSD: settings.dayServiceStartingRateUSD ?? null,
  }
}

export function toPublicSpecial(special: Special): PublicSpecial {
  return {
    id: special.id,
    title: special.title,
    slug: special.slug,
    promoCode: special.promoCode ?? null,
    category: special.category,
    pricingRule: special.pricingRule,
    standardPriceUSD: special.standardPriceUSD,
    specialPriceUSD: special.specialPriceUSD,
    discountValue: special.discountValue ?? null,
    minNights: special.minNights ?? null,
    validFrom: String(special.validFrom).slice(0, 10),
    validUntil: String(special.validUntil).slice(0, 10),
    badgeText: special.badgeText,
    description: special.description,
    termsAndConditions: special.termsAndConditions ?? null,
    isActive: special.isActive ?? true,
  }
}

export function bookingTypeForSpecial(
  category: SpecialCategory,
): BookingType {
  if (category === 'accommodation') return 'accommodation'
  if (category === 'function') return 'function'
  if (category === 'day-service') return 'day-service'
  return 'special-bundle'
}

export function specialMatchesBookingType(
  special: PublicSpecial,
  bookingType: BookingType,
): boolean {
  return bookingTypeForSpecial(special.category) === bookingType
}

export function isDateWithinSpecial(
  special: PublicSpecial,
  date: ISODate,
): boolean {
  if (!date) return false
  return (
    isSameOrAfter(date, special.validFrom) &&
    isSameOrBefore(date, special.validUntil)
  )
}

export function isSpecialActive(
  special: PublicSpecial,
  date: ISODate,
): boolean {
  return special.isActive && isDateWithinSpecial(special, date)
}

export function nightsForQuote(
  bookingType: BookingType,
  checkInDate: ISODate,
  checkOutDate?: ISODate | null,
): number {
  if (bookingType === 'accommodation') {
    return Math.max(1, nightsBetween(checkInDate, checkOutDate || ''))
  }
  return 1
}

export function bookingNights(
  bookingType: BookingType,
  checkInDate: ISODate,
  checkOutDate?: ISODate | null,
): ISODate[] {
  if (bookingType === 'accommodation') {
    return nightsOfStay(checkInDate, checkOutDate || '')
  }
  if (bookingType === 'special-bundle') {
    return [checkInDate]
  }
  return [checkInDate]
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function standardSubtotal(
  bookingType: BookingType,
  nights: number,
  pricing: SitePricing,
): number {
  if (bookingType === 'accommodation') {
    return roundMoney(nights * pricing.accommodationNightlyRateUSD)
  }
  if (bookingType === 'function') {
    return roundMoney(pricing.functionBaseRateUSD)
  }
  if (bookingType === 'day-service') {
    return roundMoney(pricing.dayServiceStartingRateUSD ?? 0)
  }
  return roundMoney(
    pricing.functionBaseRateUSD + pricing.accommodationNightlyRateUSD,
  )
}

export function standardLabel(
  bookingType: BookingType,
  nights: number,
  pricing: SitePricing,
): string {
  if (bookingType === 'accommodation') {
    return `${nights} ${nights === 1 ? 'night' : 'nights'} × $${pricing.accommodationNightlyRateUSD}`
  }
  if (bookingType === 'function') {
    return `Outdoor function, up to ${pricing.functionMaxGuests} guests`
  }
  if (bookingType === 'day-service') {
    return pricing.dayServiceStartingRateUSD
      ? 'Day service, starting rate'
      : 'Day service, quoted on request'
  }
  return 'Function venue hire and one night in the house'
}

export function discountForSpecial(
  special: PublicSpecial,
  standard: number,
  nights: number,
): number {
  if (special.pricingRule === 'fixed-special-price') {
    return Math.max(0, roundMoney(standard - special.specialPriceUSD))
  }
  if (special.pricingRule === 'amount-off') {
    return Math.max(0, roundMoney(special.discountValue ?? 0))
  }
  if (special.pricingRule === 'percentage-off') {
    return Math.max(
      0,
      roundMoney(standard * ((special.discountValue ?? 0) / 100)),
    )
  }
  if (special.pricingRule === 'per-night-override') {
    return Math.max(
      0,
      roundMoney(standard - special.specialPriceUSD * nights),
    )
  }
  return 0
}

export function canApplySpecial(
  special: PublicSpecial,
  input: Pick<QuoteInput, 'bookingType' | 'checkInDate' | 'guestCount' | 'pricing'> & {
    nights?: number
  },
): boolean {
  if (!specialMatchesBookingType(special, input.bookingType)) return false
  if (!isSpecialActive(special, input.checkInDate)) return false
  if (
    input.bookingType === 'function' &&
    input.guestCount > input.pricing.functionMaxGuests
  ) {
    return false
  }
  if (special.minNights && input.bookingType === 'accommodation') {
    const nights =
      input.nights ?? nightsForQuote(input.bookingType, input.checkInDate)
    if (nights < special.minNights) return false
  }
  return true
}

export function getQuote(input: QuoteInput): Quote {
  const nights = nightsForQuote(
    input.bookingType,
    input.checkInDate,
    input.checkOutDate,
  )
  let standard = standardSubtotal(input.bookingType, nights, input.pricing)
  const special = input.special

  if (
    special &&
    input.bookingType === 'day-service' &&
    standard === 0
  ) {
    standard = special.standardPriceUSD
  }

  if (
    !special ||
    !canApplySpecial(special, {
      bookingType: input.bookingType,
      checkInDate: input.checkInDate,
      guestCount: input.guestCount,
      pricing: input.pricing,
      nights,
    })
  ) {
    return {
      nightsCount: nights,
      standardSubtotalUSD: standard,
      discountAmountUSD: 0,
      finalTotalUSD: standard,
      standardLabel: standardLabel(input.bookingType, nights, input.pricing),
      specialLabel: null,
      appliedSpecial: null,
    }
  }

  const discount = discountForSpecial(special, standard, nights)
  return {
    nightsCount: nights,
    standardSubtotalUSD: standard,
    discountAmountUSD: discount,
    finalTotalUSD: Math.max(0, roundMoney(standard - discount)),
    standardLabel: standardLabel(input.bookingType, nights, input.pricing),
    specialLabel: special.title,
    appliedSpecial: special,
  }
}

export function autoSpecialForStay(
  specials: PublicSpecial[],
  bookingType: BookingType,
  checkInDate: ISODate,
  nights: number,
  pricing: SitePricing,
): PublicSpecial | null {
  if (bookingType !== 'accommodation' || !checkInDate) return null

  const eligible = specials
    .filter((special) => special.isActive)
    .filter((special) => special.category === 'accommodation')
    .filter((special) => Boolean(special.minNights))
    .filter((special) => nights >= (special.minNights ?? 0))
    .filter((special) => isDateWithinSpecial(special, checkInDate))
    .filter((special) =>
      canApplySpecial(special, {
        bookingType,
        checkInDate,
        guestCount: 1,
        pricing,
        nights,
      }),
    )
    .map((special) => ({
      special,
      saving: discountForSpecial(
        special,
        standardSubtotal(bookingType, nights, pricing),
        nights,
      ),
    }))
    .sort((a, b) => b.saving - a.saving)

  return eligible[0]?.special ?? null
}

export function findSpecialByPromoCode(
  specials: PublicSpecial[],
  code: string,
  date: ISODate,
): PublicSpecial | null {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return null
  return (
    specials.find(
      (special) =>
        special.promoCode?.toUpperCase() === normalized &&
        isDateWithinSpecial(special, date),
    ) ?? null
  )
}

export function currency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function nightlyFromSpecial(special: PublicSpecial): number | null {
  if (!special.minNights || special.minNights < 1) return null
  if (special.pricingRule === 'per-night-override') {
    return special.specialPriceUSD
  }
  if (special.pricingRule === 'fixed-special-price') {
    return Math.round(special.specialPriceUSD / special.minNights)
  }
  if (special.pricingRule === 'amount-off') {
    return Math.round(
      (special.standardPriceUSD - (special.discountValue ?? 0)) /
        special.minNights,
    )
  }
  return Math.round(
    (special.standardPriceUSD * (1 - (special.discountValue ?? 0) / 100)) /
      special.minNights,
  )
}

export function formatValidity(special: PublicSpecial): string {
  return `${special.validFrom} to ${special.validUntil}`
}

export function getFunctionStayCheckOut(checkIn: ISODate): ISODate {
  return addDays(checkIn, 1)
}

export function isBundle(bookingType: BookingType): boolean {
  return bookingType === 'special-bundle'
}

export function isRangeBooking(bookingType: BookingType): boolean {
  return bookingType === 'accommodation'
}

export function isPastSpecial(special: PublicSpecial, date: ISODate): boolean {
  return !isSpecialActive(special, date) || isAfter(date, special.validUntil)
}
