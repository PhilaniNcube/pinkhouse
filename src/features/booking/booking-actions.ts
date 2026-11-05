'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

import {
  buildAvailabilitySnapshot,
  isRangeAvailable,
  rangeWithinWindow,
  toBlockOccupancy,
  toBookingOccupancy,
} from '@/lib/availability'
import {
  addDays,
  isAfter,
  nightsBetween,
  todayISO,
  type ISODate,
} from '@/lib/dates'
import {
  autoSpecialForStay,
  getQuote,
  isDateWithinSpecial,
  specialMatchesBookingType,
  toPublicSpecial,
  toSitePricing,
  type BookingType,
  type PublicSpecial,
} from '@/lib/pricing'

export interface BookingActionState {
  status: 'idle' | 'error' | 'success'
  message?: string
  reference?: string
  fieldErrors?: Record<string, string>
}

const BOOKING_TYPES = [
  'accommodation',
  'function',
  'day-service',
  'special-bundle',
] as const

const EVENT_CATEGORIES = [
  'overnight-stay',
  'roora',
  'introductions',
  'naming-ceremony',
  'hen-night',
  'bachelor-party',
  'baby-shower',
  'birthday',
  'seminar',
  'photo-shoot',
  'filming',
  'church-service',
  'day-rest',
  'other',
] as const

const bookingSchema = z.object({
  bookingType: z.enum(BOOKING_TYPES),
  eventCategory: z.enum(EVENT_CATEGORIES),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.'),
  checkOutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  guestCount: z.coerce
    .number()
    .int()
    .min(1, 'At least one guest is required.')
    .max(30, 'The house and garden take up to 30 guests.'),
  guestName: z
    .string()
    .trim()
    .min(2, 'Please write your full name.')
    .max(120),
  guestPhone: z
    .string()
    .trim()
    .min(6, 'Please add a phone or WhatsApp number.')
    .max(40),
  guestEmail: z
    .string()
    .trim()
    .email('Check the email address.')
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  appliedSpecial: z.string().optional().or(z.literal('')),
  specialChoice: z.string().optional().or(z.literal('')),
  promoCode: z.string().trim().max(40).optional().or(z.literal('')),
})

function isISODate(value: string): value is ISODate {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

async function resolveSpecial(args: {
  payload: Awaited<ReturnType<typeof getPayload>>
  bookingType: BookingType
  checkInDate: ISODate
  checkOutDate: ISODate | null
  choice: string
  promoCode: string
  guestCount: number
  pricing: ReturnType<typeof toSitePricing>
  specials: PublicSpecial[]
}): Promise<
  | { special: PublicSpecial | null; promoCodeUsed: string | null; error?: string }
  | { error: string }
> {
  const {
    bookingType,
    checkInDate,
    checkOutDate,
    choice,
    promoCode,
    guestCount,
    pricing,
    specials,
  } = args
  const nights =
    bookingType === 'accommodation' && checkOutDate
      ? nightsBetween(checkInDate, checkOutDate)
      : 1

  if (promoCode) {
    const match = specials.find(
      (special) =>
        special.promoCode?.toUpperCase() === promoCode.toUpperCase() &&
        isDateWithinSpecial(special, checkInDate),
    )

    if (!match) {
      return { error: 'That promo code is not active for these dates.' }
    }
    if (!specialMatchesBookingType(match, bookingType)) {
      return {
        error: `That promo code applies to ${match.category.replace('-', ' ')} bookings. Choose the matching booking type.`,
      }
    }
    if (
      bookingType === 'accommodation' &&
      match.minNights &&
      nights < match.minNights
    ) {
      return {
        error: `${match.title} needs at least ${match.minNights} nights.`,
      }
    }
    if (
      bookingType === 'function' &&
      guestCount > pricing.functionMaxGuests
    ) {
      return {
        error: `The garden can host up to ${pricing.functionMaxGuests} guests.`,
      }
    }
    return { special: match, promoCodeUsed: match.promoCode ?? promoCode }
  }

  if (choice === 'none') {
    if (bookingType === 'special-bundle') {
      return { error: 'Choose a special package for this booking type.' }
    }
    return { special: null, promoCodeUsed: null }
  }

  if (choice && choice !== 'auto') {
    const selected = specials.find((special) => String(special.id) === choice)
    if (!selected) {
      return { error: 'That special is no longer available. Choose another.' }
    }
    if (!specialMatchesBookingType(selected, bookingType)) {
      return {
        error: 'The selected special does not match this booking type.',
      }
    }
    if (!isDateWithinSpecial(selected, checkInDate)) {
      return { error: 'The selected special is not valid for this date.' }
    }
    if (
      bookingType === 'accommodation' &&
      selected.minNights &&
      nights < selected.minNights
    ) {
      return {
        error: `${selected.title} needs at least ${selected.minNights} nights.`,
      }
    }
    return { special: selected, promoCodeUsed: null }
  }

  if (bookingType === 'accommodation') {
    const auto = autoSpecialForStay(
      specials,
      bookingType,
      checkInDate,
      nights,
      pricing,
    )
    return { special: auto, promoCodeUsed: null }
  }

  if (bookingType === 'special-bundle') {
    const bundle = specials.find(
      (special) =>
        special.category === 'bundle' &&
        isDateWithinSpecial(special, checkInDate),
    )
    if (!bundle) {
      return { error: 'There is no active bundle for this date.' }
    }
    return { special: bundle, promoCodeUsed: null }
  }

  return { special: null, promoCodeUsed: null }
}

export async function createBookingAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  // Honeypot field. Real guests never see or fill this.
  if (String(formData.get('website') || '').trim()) {
    return {
      status: 'error',
      message: 'This request could not be sent. Please call Mrs Ncube.',
    }
  }

  const parsed = bookingSchema.safeParse({
    bookingType: formData.get('bookingType'),
    eventCategory: formData.get('eventCategory'),
    checkInDate: formData.get('checkInDate'),
    checkOutDate: formData.get('checkOutDate') || '',
    guestCount: formData.get('guestCount'),
    guestName: formData.get('guestName'),
    guestPhone: formData.get('guestPhone'),
    guestEmail: formData.get('guestEmail') || '',
    notes: formData.get('notes') || '',
    appliedSpecial: formData.get('appliedSpecial') || '',
    specialChoice: formData.get('specialChoice') || '',
    promoCode: formData.get('promoCode') || '',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] || 'form')
      if (!fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return {
      status: 'error',
      message: 'Please check the highlighted details and try again.',
      fieldErrors,
    }
  }

  const data = parsed.data
  const bookingType = data.bookingType as BookingType
  const today = todayISO()
  const checkInDate = data.checkInDate as ISODate
  let checkOutDate: ISODate | null =
    data.checkOutDate && data.checkOutDate !== ''
      ? (data.checkOutDate as ISODate)
      : null

  if (!isISODate(checkInDate)) {
    return { status: 'error', message: 'Choose a valid date.' }
  }

  if (!rangeWithinWindow(checkInDate, checkOutDate)) {
    return {
      status: 'error',
      message:
        'Choose a date within the next 12 months. Dates need at least 24 hours notice.',
    }
  }

  if (bookingType === 'accommodation' || bookingType === 'special-bundle') {
    if (bookingType === 'special-bundle') {
      checkOutDate = addDays(checkInDate, 1)
    }
    if (!checkOutDate || !isAfter(checkOutDate, checkInDate)) {
      return {
        status: 'error',
        message: 'Choose a check-out date after your check-in date.',
        fieldErrors: { checkOutDate: 'Choose a check-out date.' },
      }
    }
    if (nightsBetween(checkInDate, checkOutDate) > 30) {
      return {
        status: 'error',
        message: 'For stays longer than 30 nights, please call Mrs Ncube.',
      }
    }
  } else {
    checkOutDate = null
  }

  const payload = await getPayload({ config })

  const [settings, specialsResult] = await Promise.all([
    payload.findGlobal({ slug: 'pricing-settings', depth: 0 }),
    payload.find({
      collection: 'specials',
      where: { isActive: { equals: true } },
      limit: 100,
      depth: 0,
    }),
  ])

  const pricing = settings ? toSitePricing(settings) : {
    accommodationNightlyRateUSD: 80,
    functionBaseRateUSD: 150,
    functionMaxGuests: 30,
    dayServiceStartingRateUSD: null,
  }

  if (data.guestCount > pricing.functionMaxGuests) {
    return {
      status: 'error',
      message: `The property takes up to ${pricing.functionMaxGuests} guests.`,
      fieldErrors: {
        guestCount: `Choose up to ${pricing.functionMaxGuests} guests.`,
      },
    }
  }

  const specials = specialsResult.docs
    .map(toPublicSpecial)
    .filter(
      (special) =>
        special.validFrom <= today && special.validUntil >= today,
    )

  const specialChoice = data.specialChoice || 'auto'
  const resolved = await resolveSpecial({
    payload,
    bookingType,
    checkInDate,
    checkOutDate,
    choice: specialChoice,
    promoCode: data.promoCode?.trim() ?? '',
    guestCount: data.guestCount,
    pricing,
    specials,
  })

  if ('error' in resolved) {
    const message =
      resolved.error || 'The selected special could not be applied.'
    return {
      status: 'error',
      message,
      fieldErrors: message.toLowerCase().includes('promo')
        ? { promoCode: message }
        : undefined,
    }
  }

  const [bookingsResult, blocksResult] = await Promise.all([
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

  const bookings = bookingsResult.docs.flatMap((booking) => {
    const value = toBookingOccupancy(booking)
    return value ? [value] : []
  })
  const blocks = blocksResult.docs.flatMap((block) => {
    const value = toBlockOccupancy(block)
    return value ? [value] : []
  })
  const availability = buildAvailabilitySnapshot(bookings, blocks)

  if (
    !isRangeAvailable(availability, bookingType, checkInDate, checkOutDate)
  ) {
    return {
      status: 'error',
      message:
        'Those dates are already booked or held. Please choose another date.',
      fieldErrors: {
        checkInDate: 'Those dates are unavailable. Choose another date.',
      },
    }
  }

  const quote = getQuote({
    bookingType,
    checkInDate,
    checkOutDate,
    guestCount: data.guestCount,
    special: resolved.special,
    pricing,
  })

  try {
    const booking = await payload.create({
      collection: 'bookings',
      depth: 0,
      data: {
        bookingType,
        eventCategory: data.eventCategory,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate || undefined,
        nightsCount: quote.nightsCount,
        guestCount: data.guestCount,
        appliedSpecial: resolved.special?.id,
        promoCodeUsed: resolved.promoCodeUsed || undefined,
        standardSubtotalUSD: quote.standardSubtotalUSD,
        discountAmountUSD: quote.discountAmountUSD,
        finalTotalUSD: quote.finalTotalUSD,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail || undefined,
        notes: data.notes || undefined,
        status: 'pending',
      },
    })

    revalidatePath('/')

    const reference = booking.bookingReference || ''

    return {
      status: 'success',
      reference,
      message: `Your booking request has been saved. Reference #${reference}. Mrs Ncube will confirm shortly.`,
    }
  } catch (error) {
    console.error('Booking request failed', error)
    return {
      status: 'error',
      message:
        'The request did not go through. Please try again or WhatsApp Mrs Ncube on 0772 964 425.',
    }
  }
}
