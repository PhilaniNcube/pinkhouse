import 'dotenv/config'

import crypto from 'node:crypto'
import { getPayload } from 'payload'

import { isAllowedAdminEmail } from '../collections/Users'
import { getSiteBaseUrl } from '../lib/email/config'
import config from '../payload.config'

const DESIGNATED_ADMINS = [
  { email: 'ncbphi001@gmail.com', name: 'Philemon Ncube', sendInvite: false },
  { email: 'pnavaya@yahoo.co.uk', name: 'P. Navaya', sendInvite: true },
  { email: 'everncube@gmail.com', name: 'Mrs Ncube', sendInvite: true },
] as const

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

async function inviteAdmins() {
  const payload = await getPayload({ config })
  const baseUrl = getSiteBaseUrl()
  const hasResendKey = Boolean(process.env.RESEND_API_KEY?.trim())

  // 1. Remove any non-designated users so ONLY the 3 allowed admins exist
  const existingUsers = await payload.find({
    collection: 'users',
    limit: 100,
    depth: 0,
  })

  for (const user of existingUsers.docs) {
    if (!isAllowedAdminEmail(user.email)) {
      await payload.delete({
        collection: 'users',
        id: user.id,
      })
      console.log(`Removed non-designated admin user: ${user.email}`)
    }
  }

  // 2. Ensure all 3 designated admin accounts exist and generate invite links
  for (const admin of DESIGNATED_ADMINS) {
    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: admin.email } },
      limit: 1,
      depth: 0,
    })

    if (!found.docs[0]) {
      const tempPassword =
        process.env.SEED_ADMIN_PASSWORD ||
        `Ph-${crypto.randomBytes(16).toString('hex')}!9A`
      await payload.create({
        collection: 'users',
        context: { skipInviteEmail: true },
        data: {
          name: admin.name,
          email: admin.email,
          password: tempPassword,
        },
      })
      console.log(`Created admin account for ${admin.email}`)
    }

    if (admin.sendInvite) {
      const token = await payload.forgotPassword({
        collection: 'users',
        data: { email: admin.email },
        expiration: SEVEN_DAYS_MS,
        disableEmail: !hasResendKey,
      })

      const setupUrl = `${baseUrl}/admin/reset/${token}`
      console.log('')
      console.log(`Admin:      ${admin.name} <${admin.email}>`)
      console.log(`Setup URL:  ${setupUrl} (valid for 7 days)`)
      console.log(
        `Email sent: ${
          hasResendKey
            ? 'Yes (sent via Resend)'
            : 'Skipped (set RESEND_API_KEY in .env to email automatically, or share the Setup URL above)'
        }`,
      )
    }
  }

  console.log('')
  console.log(
    'Done. Only ncbphi001@gmail.com, pnavaya@yahoo.co.uk and everncube@gmail.com are administrators.',
  )
  if (typeof payload.db?.destroy === 'function') {
    await payload.db.destroy()
  }
  setTimeout(() => process.exit(0), 100)
}

inviteAdmins().catch((error) => {
  console.error(error)
  process.exit(1)
})
