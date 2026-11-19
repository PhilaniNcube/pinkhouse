import { revalidatePath } from 'next/cache'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { syncAllCalendars } from '@/lib/ical/sync'
import { bearerMatches } from '@/lib/ical/security'

export const maxDuration = 60

async function handleSync(request: Request): Promise<Response> {
  // Always run at request time; never try to prerender a cron endpoint.
  await connection()

  const secret = process.env.CRON_SECRET
  if (!secret) {
    return Response.json(
      { ok: false, error: 'CRON_SECRET is not configured.' },
      { status: 503 },
    )
  }

  if (!bearerMatches(request.headers.get('authorization'), secret)) {
    return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const report = await syncAllCalendars(payload)

    // Availability is derived per request, but clearing the path makes the
    // next visit pick up cancellations immediately after a sync.
    revalidatePath('/')

    return Response.json(report, {
      status: report.ok ? 200 : 502,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    })
  } catch (error) {
    console.error('iCal sync failed', error)
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'iCal sync failed.',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }
}

export async function GET(request: Request): Promise<Response> {
  return handleSync(request)
}

export async function POST(request: Request): Promise<Response> {
  return handleSync(request)
}
