import { connection } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { buildAvailabilityCalendar } from '@/lib/ical/export'
import { secretsMatch } from '@/lib/ical/security'

export async function GET(request: Request): Promise<Response> {
  // The feed must be generated for every request; never prerender or cache it.
  await connection()

  const expectedToken = process.env.CALENDAR_EXPORT_TOKEN

  if (expectedToken) {
    const token = new URL(request.url).searchParams.get('token')
    if (!secretsMatch(token, expectedToken)) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      })
    }
  }

  try {
    const payload = await getPayload({ config })
    const calendar = await buildAvailabilityCalendar(payload)

    return new Response(calendar, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="the-pink-house.ics"',
        'Cache-Control': 'no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch (error) {
    console.error('iCal export failed', error)
    return new Response('The calendar could not be generated.', {
      status: 500,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    })
  }
}
