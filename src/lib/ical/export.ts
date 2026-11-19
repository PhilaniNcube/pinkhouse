import type { Payload } from 'payload'

import { addDays, isAfter, todayISO, type ISODate } from '@/lib/dates'

interface ExportEvent {
  uid: string
  startDate: ISODate
  endDate: ISODate
  summary: string
  description?: string
}

/**
 * Build the public .ics feed for our own availability. It contains confirmed
 * direct stays and manual blocks that affect accommodation. OTA-sourced blocks
 * are deliberately excluded so Airbnb does not import its own reservations
 * back as new events.
 */
export async function buildAvailabilityCalendar(
  payload: Payload,
  now: Date = new Date(),
): Promise<string> {
  const [bookingsResult, blocksResult] = await Promise.all([
    payload.find({
      collection: 'bookings',
      where: {
        and: [
          { status: { equals: 'confirmed' } },
          { bookingType: { in: ['accommodation', 'special-bundle'] } },
        ],
      },
      limit: 2000,
      sort: 'checkInDate',
      depth: 0,
    }),
    payload.find({
      collection: 'availability-blocks',
      where: {
        blockScope: { in: ['full-premises', 'accommodation-only'] },
      },
      limit: 500,
      sort: 'startDate',
      depth: 0,
    }),
  ])

  const today = todayISO()
  const host = calendarHost()
  const events: ExportEvent[] = []

  for (const booking of bookingsResult.docs) {
    if (booking.status !== 'confirmed') continue
    if (
      booking.bookingType !== 'accommodation' &&
      booking.bookingType !== 'special-bundle'
    ) {
      continue
    }

    const startDate = String(booking.checkInDate ?? '').slice(0, 10)
    const endDate = String(booking.checkOutDate ?? '').slice(0, 10)
    if (!startDate || !endDate || !isAfter(endDate, startDate)) continue
    if (!isAfter(endDate, today)) continue

    events.push({
      uid: `booking-${booking.id}@${host}`,
      startDate,
      endDate,
      summary: 'Reserved (direct booking)',
      description: booking.bookingReference
        ? `Direct booking ${booking.bookingReference}`
        : 'Direct booking',
    })
  }

  for (const block of blocksResult.docs) {
    if (
      block.blockScope !== 'full-premises' &&
      block.blockScope !== 'accommodation-only'
    ) {
      continue
    }

    const startDate = String(block.startDate ?? '').slice(0, 10)
    const lastBlockedDate = String(block.endDate ?? '').slice(0, 10)
    if (!startDate || !lastBlockedDate) continue
    if (!isAfter(addDays(lastBlockedDate, 1), today)) continue

    events.push({
      uid: `block-${block.id}@${host}`,
      startDate,
      // Our admin blocks use an inclusive end date; iCal DTEND is exclusive.
      endDate: addDays(lastBlockedDate, 1),
      summary: `Blocked: ${block.title}`,
      description: 'Dates held by The Pink House',
    })
  }

  events.sort((a, b) => a.startDate.localeCompare(b.startDate))

  const stamp = utcStamp(now)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Pink House//Availability Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:The Pink House availability',
    'X-WR-TIMEZONE:Africa/Harare',
    'REFRESH-INTERVAL;VALUE=DURATION:PT15M',
    'X-PUBLISHED-TTL:PT15M',
  ]

  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compactDate(event.startDate)}`,
      `DTEND;VALUE=DATE:${compactDate(event.endDate)}`,
      `SUMMARY:${escapeText(event.summary)}`,
    )
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeText(event.description)}`)
    }
    lines.push('STATUS:CONFIRMED', 'TRANSP:OPAQUE', 'END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  return `${lines.map(foldLine).join('\r\n')}\r\n`
}

function calendarHost(): string {
  const fallback = 'thepinkhouse.co.zw'
  const raw = process.env.NEXT_PUBLIC_SITE_URL
  if (!raw) return fallback

  try {
    return new URL(raw).host || fallback
  } catch {
    return fallback
  }
}

function compactDate(date: ISODate): string {
  return date.replaceAll('-', '')
}

function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
}

const encoder = new TextEncoder()

function utf8Length(value: string): number {
  return encoder.encode(value).length
}

/**
 * RFC 5545 section 3.1: content lines are folded at 75 octets, continuing on
 * the next line after a single space. Folding on octets keeps multi-byte
 * characters intact.
 */
function foldLine(line: string): string {
  if (utf8Length(line) <= 75) return line

  const parts: string[] = []
  let current = ''
  for (const character of line) {
    const limit = parts.length === 0 ? 75 : 74
    if (utf8Length(current) + utf8Length(character) > limit) {
      parts.push(current)
      current = character
    } else {
      current += character
    }
  }
  parts.push(current)

  return parts.join('\r\n ')
}
