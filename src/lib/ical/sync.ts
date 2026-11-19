import ical from 'node-ical'
import type { DateWithTimeZone, ParameterValue } from 'node-ical'
import type { Payload } from 'payload'

import {
  HARARE_TIME_ZONE,
  addDays,
  isAfter,
  type ISODate,
} from '@/lib/dates'
import type { CalendarSource, ExternalBlock } from '@/payload-types'

const FETCH_TIMEOUT_MS = 15_000
const USER_AGENT =
  'ThePinkHouseCalendarSync/1.0 (+https://thepinkhouse.co.zw; calendar sync)'

interface EnvCalendarConfig {
  envKey: 'airbnb' | 'booking'
  provider: 'airbnb' | 'booking'
  name: string
  envVar: string
}

const ENV_CALENDARS: EnvCalendarConfig[] = [
  {
    envKey: 'airbnb',
    provider: 'airbnb',
    name: 'Airbnb',
    envVar: 'AIRBNB_ICAL_URL',
  },
  {
    envKey: 'booking',
    provider: 'booking',
    name: 'Booking.com',
    envVar: 'BOOKING_ICAL_URL',
  },
]

export interface SourceSyncResult {
  sourceId: number
  name: string
  provider: string
  status: 'success' | 'error'
  events: number
  created: number
  updated: number
  unchanged: number
  deleted: number
  skipped: number
  error?: string
}

export interface SyncReport {
  startedAt: string
  finishedAt: string
  ok: boolean
  sources: SourceSyncResult[]
}

interface NormalizedEvent {
  externalUid: string
  startDate: ISODate
  endDate: ISODate
  summary: string | null
  rawEvent: Record<string, unknown>
}

let runningSync: Promise<SyncReport> | null = null

/**
 * Sync every active calendar source, including feeds configured through
 * AIRBNB_ICAL_URL and BOOKING_ICAL_URL. Concurrent calls share one run so a
 * cron retry cannot overlap with a slow feed.
 */
export function syncAllCalendars(payload: Payload): Promise<SyncReport> {
  if (runningSync) return runningSync

  runningSync = runSync(payload).finally(() => {
    runningSync = null
  })

  return runningSync
}

async function runSync(payload: Payload): Promise<SyncReport> {
  const startedAt = new Date().toISOString()

  await ensureEnvCalendarSources(payload)

  const sources = await payload.find({
    collection: 'calendar-sources',
    where: {
      and: [
        { isActive: { equals: true } },
        { icalUrl: { exists: true } },
      ],
    },
    sort: 'provider',
    pagination: false,
    depth: 0,
  })

  const results: SourceSyncResult[] = []
  for (const source of sources.docs) {
    if (!source.icalUrl?.trim()) continue
    results.push(await syncCalendarSource(payload, source))
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    ok: results.every((result) => result.status === 'success'),
    sources: results,
  }
}

/**
 * Keep the database in step with AIRBNB_ICAL_URL and BOOKING_ICAL_URL. Feeds
 * are matched by envKey, so changing the URL in the environment updates the
 * same source rather than creating a duplicate. A missing or empty environment
 * variable is skipped gracefully.
 */
export async function ensureEnvCalendarSources(
  payload: Payload,
): Promise<CalendarSource[]> {
  const ensured: CalendarSource[] = []

  for (const config of ENV_CALENDARS) {
    const url = process.env[config.envVar]?.trim()
    if (!url) continue

    const existing = await payload.find({
      collection: 'calendar-sources',
      where: { envKey: { equals: config.envKey } },
      limit: 1,
      depth: 0,
    })

    const current = existing.docs[0]
    if (current) {
      if (current.icalUrl !== url) {
        const updated = await payload.update({
          collection: 'calendar-sources',
          id: current.id,
          data: { icalUrl: url },
          depth: 0,
        })
        ensured.push(updated)
      } else {
        ensured.push(current)
      }
      continue
    }

    // Adopt a source the owner already added by hand with the same URL,
    // rather than syncing the same feed twice.
    const sameFeed = await payload.find({
      collection: 'calendar-sources',
      where: {
        and: [
          { provider: { equals: config.provider } },
          { icalUrl: { equals: url } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    const adopted = sameFeed.docs[0]
    if (adopted) {
      const updated = await payload.update({
        collection: 'calendar-sources',
        id: adopted.id,
        data: { envKey: config.envKey },
        depth: 0,
      })
      ensured.push(updated)
      continue
    }

    const created = await payload.create({
      collection: 'calendar-sources',
      data: {
        name: config.name,
        provider: config.provider,
        icalUrl: url,
        envKey: config.envKey,
        isActive: true,
      },
      depth: 0,
    })
    ensured.push(created)
  }

  return ensured
}

export async function syncCalendarSource(
  payload: Payload,
  source: CalendarSource,
): Promise<SourceSyncResult> {
  const result: SourceSyncResult = {
    sourceId: source.id,
    name: source.name,
    provider: source.provider,
    status: 'success',
    events: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    deleted: 0,
    skipped: 0,
  }

  try {
    const text = await fetchCalendar(source.icalUrl)
    const parsedFeed = parseCalendar(text, source.name)
    const events = parsedFeed.events
    result.events = events.length
    result.skipped = parsedFeed.skipped

    const existing = await payload.find({
      collection: 'external-blocks',
      where: { source: { equals: source.id } },
      pagination: false,
      depth: 0,
    })

    const existingByUid = new Map<string, ExternalBlock>()
    for (const block of existing.docs) {
      existingByUid.set(block.externalUid, block)
    }

    for (const event of events) {
      const current = existingByUid.get(event.externalUid)

      if (!current) {
        await payload.create({
          collection: 'external-blocks',
          data: {
            source: source.id,
            externalUid: event.externalUid,
            startDate: event.startDate,
            endDate: event.endDate,
            summary: event.summary,
            rawEvent: event.rawEvent,
          },
          depth: 0,
        })
        result.created += 1
        continue
      }

      const startDate = String(current.startDate).slice(0, 10)
      const endDate = String(current.endDate).slice(0, 10)
      const summary = current.summary ?? null

      if (
        startDate === event.startDate &&
        endDate === event.endDate &&
        summary === event.summary
      ) {
        result.unchanged += 1
        continue
      }

      await payload.update({
        collection: 'external-blocks',
        id: current.id,
        data: {
          startDate: event.startDate,
          endDate: event.endDate,
          summary: event.summary,
          rawEvent: event.rawEvent,
        },
        depth: 0,
      })
      result.updated += 1
    }

    // Anything we stored before but that is missing from this feed was
    // cancelled in the OTA. Removing it reopens those dates on our site.
    const seen = new Set(events.map((event) => event.externalUid))
    const staleIds = existing.docs
      .filter((block) => !seen.has(block.externalUid))
      .map((block) => block.id)

    for (let index = 0; index < staleIds.length; index += 100) {
      await payload.delete({
        collection: 'external-blocks',
        where: { id: { in: staleIds.slice(index, index + 100) } },
        depth: 0,
      })
    }
    result.deleted = staleIds.length

    await payload.update({
      collection: 'calendar-sources',
      id: source.id,
      data: {
        lastSyncedAt: new Date().toISOString(),
        lastSyncStatus: 'success',
        lastError: null,
      },
      depth: 0,
    })
  } catch (error) {
    const message = sanitizeError(error, source.icalUrl)
    result.status = 'error'
    result.error = message

    try {
      await payload.update({
        collection: 'calendar-sources',
        id: source.id,
        data: {
          lastSyncedAt: new Date().toISOString(),
          lastSyncStatus: 'error',
          lastError: message,
        },
        depth: 0,
      })
    } catch (updateError) {
      console.error('Could not record iCal sync failure', updateError)
    }
  }

  return result
}

async function fetchCalendar(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/calendar, text/plain;q=0.9, */*;q=0.8',
      'Cache-Control': 'no-cache',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`The feed returned HTTP ${response.status}.`)
  }

  const text = (await response.text()).replace(/^\uFEFF/, '')
  if (!text.includes('BEGIN:VCALENDAR')) {
    throw new Error('The feed did not return a valid iCalendar document.')
  }

  return text
}

function parseCalendar(
  text: string,
  sourceName: string,
): { events: NormalizedEvent[]; skipped: number } {
  const parsed = ical.sync.parseICS(text)
  const events = new Map<string, NormalizedEvent>()
  let skipped = 0

  for (const component of Object.values(parsed)) {
    if (!component || component.type !== 'VEVENT') continue

    const event = component
    if (event.status === 'CANCELLED') {
      // A cancelled VEVENT is not part of the active set, so the stale-block
      // pass below removes any copy we stored earlier.
      skipped += 1
      continue
    }

    const externalUid = event.uid?.trim()
    if (!externalUid) {
      skipped += 1
      continue
    }

    if (!event.start) {
      skipped += 1
      continue
    }

    const startDate = calendarDate(event.start)
    if (!startDate) {
      skipped += 1
      continue
    }

    let endDate = event.end ? calendarDate(event.end) : ''
    if (!endDate || !isAfter(endDate, startDate)) {
      // A missing or zero-length DTEND still means the OTA holds the night.
      endDate = addDays(startDate, 1)
    }

    events.set(externalUid, {
      externalUid,
      startDate,
      endDate,
      summary: textValue(event.summary),
      rawEvent: {
        source: sourceName,
        uid: externalUid,
        summary: textValue(event.summary),
        description: textValue(event.description),
        location: textValue(event.location),
        status: event.status ?? null,
        datetype: event.datetype ?? null,
        start: event.start.toISOString(),
        end: event.end?.toISOString() ?? null,
        startDate,
        endDate,
      },
    })
  }

  return { events: Array.from(events.values()), skipped }
}

/**
 * Read the calendar day from a node-ical Date. VALUE=DATE values are created
 * with local getters and marked `dateOnly`; timed values are converted in their
 * own TZID where possible, otherwise in the property's timezone (Harare).
 */
function calendarDate(value: DateWithTimeZone): ISODate {
  if (value.dateOnly) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
    ].join('-')
  }

  if (value.tz) {
    const inZone = formatInZone(value, value.tz)
    if (inZone) return inZone
  }

  return formatInZone(value, HARARE_TIME_ZONE) ?? ''
}

function formatInZone(value: Date, timeZone: string): ISODate | null {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(value)

    const year = parts.find((part) => part.type === 'year')?.value
    const month = parts.find((part) => part.type === 'month')?.value
    const day = parts.find((part) => part.type === 'day')?.value
    if (!year || !month || !day) return null
    return `${year}-${month}-${day}`
  } catch {
    return null
  }
}

function textValue(value: ParameterValue | undefined): string | null {
  if (!value) return null
  if (typeof value === 'string') return value.trim() || null
  return value.val?.trim() || null
}

function sanitizeError(error: unknown, icalUrl: string): string {
  const raw = error instanceof Error ? error.message : String(error)
  return raw.split(icalUrl).join('[redacted feed URL]').slice(0, 4000)
}
