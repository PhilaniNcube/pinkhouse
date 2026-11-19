import type {
  AvailabilityBlock,
  Booking,
  ExternalBlock,
} from '@/payload-types'

import {
  addDays,
  eachDateInclusive,
  isAfter,
  isBefore,
  isSameOrAfter,
  isSameOrBefore,
  nightsOfStay,
  todayISO,
  type ISODate,
} from './dates'
import type { BookingType } from './pricing'

export interface BookingOccupancy {
  bookingType: BookingType
  checkInDate: string
  checkOutDate: string | null
  status: string
}

export interface BlockOccupancy {
  startDate: string
  endDate: string
  blockScope: string
}

/**
 * A reservation pulled from an OTA iCal feed. `endDate` is the exclusive
 * DTEND from the feed, so a 10 to 12 November stay occupies 10 and 11
 * November and frees the property for a 12 November check-in.
 */
export interface ExternalBlockOccupancy {
  startDate: string
  endDate: string
}

export interface AvailabilitySnapshot {
  accommodation: ISODate[]
  function: ISODate[]
  dayService: ISODate[]
  bundle: ISODate[]
  generatedOn: ISODate
}

const ACTIVE_BOOKING_STATUSES = new Set(['pending', 'confirmed'])

function uniqueInOrder(dates: ISODate[]): ISODate[] {
  return Array.from(new Set(dates)).sort()
}

function bookingConflictsWith(
  bookingType: BookingType,
  existingBookingType: string,
): boolean {
  if (bookingType === 'special-bundle') return true
  if (bookingType === 'accommodation') {
    return (
      existingBookingType === 'accommodation' ||
      existingBookingType === 'special-bundle'
    )
  }
  return (
    existingBookingType === 'function' ||
    existingBookingType === 'day-service' ||
    existingBookingType === 'special-bundle'
  )
}

function blockConflictsWith(
  bookingType: BookingType,
  blockScope: string,
): boolean {
  if (bookingType === 'special-bundle') return true
  if (bookingType === 'accommodation') {
    return blockScope === 'full-premises' || blockScope === 'accommodation-only'
  }
  return blockScope === 'full-premises' || blockScope === 'outdoor-only'
}

function occupiedDatesForBooking(booking: BookingOccupancy): ISODate[] {
  const checkIn = booking.checkInDate.slice(0, 10)
  const checkOut = booking.checkOutDate
    ? booking.checkOutDate.slice(0, 10)
    : null

  if (booking.bookingType === 'accommodation') {
    return checkOut ? nightsOfStay(checkIn, checkOut) : [checkIn]
  }

  if (booking.bookingType === 'special-bundle') {
    return checkOut ? nightsOfStay(checkIn, checkOut) : [checkIn]
  }

  return [checkIn]
}

export function toBookingOccupancy(booking: Booking): BookingOccupancy | null {
  if (!booking.checkInDate) return null
  if (!ACTIVE_BOOKING_STATUSES.has(booking.status ?? 'pending')) return null
  return {
    bookingType: booking.bookingType,
    checkInDate: String(booking.checkInDate),
    checkOutDate: booking.checkOutDate
      ? String(booking.checkOutDate)
      : null,
    status: booking.status,
  }
}

export function toBlockOccupancy(
  block: AvailabilityBlock,
): BlockOccupancy | null {
  if (!block.startDate || !block.endDate) return null
  return {
    startDate: String(block.startDate).slice(0, 10),
    endDate: String(block.endDate).slice(0, 10),
    blockScope: block.blockScope,
  }
}

export function toExternalBlockOccupancy(
  block: Pick<ExternalBlock, 'startDate' | 'endDate'>,
): ExternalBlockOccupancy | null {
  const startDate = String(block.startDate ?? '').slice(0, 10)
  const endDate = String(block.endDate ?? '').slice(0, 10)
  if (!startDate || !endDate || !isAfter(endDate, startDate)) return null
  return { startDate, endDate }
}

export function unavailableDatesFor(
  bookingType: BookingType,
  bookings: BookingOccupancy[],
  blocks: BlockOccupancy[],
  externalBlocks: ExternalBlockOccupancy[] = [],
): ISODate[] {
  const dates = new Set<ISODate>()

  for (const booking of bookings) {
    if (!bookingConflictsWith(bookingType, booking.bookingType)) continue
    for (const date of occupiedDatesForBooking(booking)) dates.add(date)
  }

  for (const block of blocks) {
    if (!blockConflictsWith(bookingType, block.blockScope)) continue
    for (const date of eachDateInclusive(block.startDate, block.endDate)) {
      dates.add(date)
    }
  }

  // OTA feeds only sell the whole unit, so they always block accommodation.
  // A bundle includes a night in the house and is blocked as well. Functions
  // and day services in the garden remain possible unless a manual block or a
  // direct booking says otherwise.
  if (bookingType === 'accommodation' || bookingType === 'special-bundle') {
    for (const block of externalBlocks) {
      for (const date of nightsOfStay(block.startDate, block.endDate)) {
        dates.add(date)
      }
    }
  }

  return uniqueInOrder([...dates])
}

export function buildAvailabilitySnapshot(
  bookings: BookingOccupancy[],
  blocks: BlockOccupancy[],
  externalBlocks: ExternalBlockOccupancy[] = [],
): AvailabilitySnapshot {
  return {
    accommodation: unavailableDatesFor(
      'accommodation',
      bookings,
      blocks,
      externalBlocks,
    ),
    function: unavailableDatesFor('function', bookings, blocks, externalBlocks),
    dayService: unavailableDatesFor(
      'day-service',
      bookings,
      blocks,
      externalBlocks,
    ),
    bundle: unavailableDatesFor(
      'special-bundle',
      bookings,
      blocks,
      externalBlocks,
    ),
    generatedOn: todayISO(),
  }
}

export function unavailableSetFor(
  snapshot: AvailabilitySnapshot,
  bookingType: BookingType,
): Set<ISODate> {
  if (bookingType === 'accommodation') return new Set(snapshot.accommodation)
  if (bookingType === 'function') return new Set(snapshot.function)
  if (bookingType === 'day-service') return new Set(snapshot.dayService)
  return new Set(snapshot.bundle)
}

export function isDateAvailable(
  snapshot: AvailabilitySnapshot,
  bookingType: BookingType,
  date: ISODate,
): boolean {
  return !unavailableSetFor(snapshot, bookingType).has(date)
}

export function isStayAvailable(
  snapshot: AvailabilitySnapshot,
  checkIn: ISODate,
  checkOut: ISODate,
): boolean {
  if (!checkIn || !checkOut || !isAfter(checkOut, checkIn)) return false
  const unavailable = unavailableSetFor(snapshot, 'accommodation')
  return nightsOfStay(checkIn, checkOut).every(
    (date) => !unavailable.has(date),
  )
}

export function isRangeAvailable(
  snapshot: AvailabilitySnapshot,
  bookingType: BookingType,
  checkIn: ISODate,
  checkOut?: ISODate | null,
): boolean {
  const unavailable = unavailableSetFor(snapshot, bookingType)

  if (bookingType === 'accommodation') {
    if (!checkOut) return false
    return nightsOfStay(checkIn, checkOut).every(
      (date) => !unavailable.has(date),
    )
  }

  if (bookingType === 'special-bundle') {
    return !unavailable.has(checkIn)
  }

  return !unavailable.has(checkIn)
}

export function findNextStay(
  snapshot: AvailabilitySnapshot,
  nights = 3,
  searchDays = 120,
): { checkIn: ISODate; checkOut: ISODate } | null {
  const start = addDays(todayISO(), 1)
  for (let offset = 0; offset < searchDays; offset += 1) {
    const checkIn = addDays(start, offset)
    const checkOut = addDays(checkIn, nights)
    if (isStayAvailable(snapshot, checkIn, checkOut)) {
      return { checkIn, checkOut }
    }
  }
  return null
}

export function findNextDate(
  snapshot: AvailabilitySnapshot,
  bookingType: BookingType,
  searchDays = 90,
): ISODate | null {
  const start = addDays(todayISO(), 1)
  const unavailable = unavailableSetFor(snapshot, bookingType)
  for (let offset = 0; offset < searchDays; offset += 1) {
    const date = addDays(start, offset)
    if (!unavailable.has(date)) return date
  }
  return null
}

export function dateIsPast(date: ISODate): boolean {
  return isBeforeToday(date)
}

function isBeforeToday(date: ISODate): boolean {
  return date < todayISO()
}

export function rangeWithinWindow(
  checkIn: ISODate,
  checkOut: ISODate | null | undefined,
  days = 400,
): boolean {
  const today = todayISO()
  if (isSameOrBefore(checkIn, today)) return false
  const limit = addDays(today, days)
  if (isAfter(checkIn, limit)) return false
  if (checkOut && isAfter(checkOut, limit)) return false
  return true
}

export function datesOverlap(
  aStart: ISODate,
  aEnd: ISODate,
  bStart: ISODate,
  bEnd: ISODate,
): boolean {
  return isSameOrAfter(aEnd, bStart) && isSameOrBefore(aStart, bEnd)
}

/**
 * Standard hospitality overlap test with exclusive check-out dates:
 * `requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn`.
 * A same-day check-out and check-in therefore do not overlap.
 */
export function rangesOverlap(
  requestedCheckIn: ISODate,
  requestedCheckOut: ISODate,
  existingCheckIn: ISODate,
  existingCheckOut: ISODate,
): boolean {
  return (
    isBefore(requestedCheckIn, existingCheckOut) &&
    isAfter(requestedCheckOut, existingCheckIn)
  )
}
