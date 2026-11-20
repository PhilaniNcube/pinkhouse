import * as React from 'react'
import { render } from '@react-email/render'
import { APIError, type CollectionConfig } from 'payload'

import { AdminInviteEmail } from '@/emails/admin-invite-email'
import {
  ADMIN_EMAIL_RECIPIENTS,
  getSiteBaseUrl,
} from '@/lib/email/config'

const ALLOWED_ADMINS_SET = new Set<string>(
  ADMIN_EMAIL_RECIPIENTS.map((email) => email.toLowerCase()),
)

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function isAllowedAdminEmail(email: string): boolean {
  return ALLOWED_ADMINS_SET.has(email.trim().toLowerCase())
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Admin user',
    plural: 'Admin users',
  },
  auth: {
    forgotPassword: {
      expiration: SEVEN_DAYS_MS,
      generateEmailSubject: () =>
        'Administrator access & password setup · The Pink House',
      generateEmailHTML: async (args) => {
        const token = args?.token || ''
        const user = (args?.user || {}) as { email?: string; name?: string }
        const baseUrl = getSiteBaseUrl()
        const setupUrl = `${baseUrl}/admin/reset/${token}`
        const loginUrl = `${baseUrl}/admin/login`

        return render(
          React.createElement(AdminInviteEmail, {
            name: user.name || 'Administrator',
            email: user.email || '',
            setupUrl,
            loginUrl,
          }),
        )
      },
    },
  },
  admin: {
    useAsTitle: 'email',
    group: 'House office',
    defaultColumns: ['name', 'email', 'updatedAt'],
    description:
      'Restricted to the three designated Pink House administrators: ncbphi001@gmail.com, pnavaya@yahoo.co.uk and everncube@gmail.com.',
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data
        const candidateEmail = String(
          data.email ?? originalDoc?.email ?? '',
        )
          .trim()
          .toLowerCase()

        if (!candidateEmail || !isAllowedAdminEmail(candidateEmail)) {
          throw new APIError(
            `Only the three designated Pink House administrators (${ADMIN_EMAIL_RECIPIENTS.join(', ')}) are permitted to have admin accounts.`,
            400,
          )
        }

        data.email = candidateEmail
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req, context }) => {
        if (context?.skipInviteEmail) return doc

        const shouldSendInvite =
          Boolean(doc?.sendInviteEmail) &&
          (operation === 'create' || !previousDoc?.sendInviteEmail)

        if (!shouldSendInvite || !doc?.email) return doc

        try {
          await req.payload.update({
            collection: 'users',
            id: doc.id,
            data: { sendInviteEmail: false },
            context: { skipInviteEmail: true },
            req,
          })

          await req.payload.forgotPassword({
            collection: 'users',
            data: { email: doc.email },
            expiration: SEVEN_DAYS_MS,
            req,
          })
        } catch (error) {
          console.error(
            `Failed to send admin invitation email to ${doc.email}:`,
            error,
          )
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full name',
      required: true,
    },
    {
      name: 'sendInviteEmail',
      type: 'checkbox',
      label: 'Send invitation / password setup email on save',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Check this box and click Save to email a 7-day password setup link to this administrator via Resend.',
      },
    },
  ],
}
