import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../payload.config'
import { syncAllCalendars } from '../lib/ical/sync'

async function main() {
  const payload = await getPayload({ config })
  const report = await syncAllCalendars(payload)

  console.log(JSON.stringify(report, null, 2))

  process.exit(report.ok ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
