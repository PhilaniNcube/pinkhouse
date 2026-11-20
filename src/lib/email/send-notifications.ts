import 'server-only'

import * as React from 'react'
import { render } from '@react-email/render'
import type { BasePayload } from 'payload'
import { Resend } from 'resend'

import {
  EnquiryAdminEmail,
  type EnquiryEmailData,
} from '@/emails/enquiry-admin-email'
import { EnquiryGuestEmail } from '@/emails/enquiry-guest-email'
import {
  formatBookingTypeLabel,
  formatEnquiryTopicLabel,
  formatUSD,
} from '@/emails/email-layout'
import {
  ReservationAdminEmail,
  type ReservationEmailData,
} from '@/emails/reservation-admin-email'
import { ReservationGuestEmail } from '@/emails/reservation-guest-email'
import { formatDate, formatDateRange, type ISODate } from '@/lib/dates'
import {
  getAdminEmailRecipients,
  getDefaultReplyTo,
  getFormattedFromHeader,
  getSiteBaseUrl,
} from '@/lib/email/config'

export interface DispatchEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
  replyTo?: string
  payload?: BasePayload
}

let resendClient: Resend | null = null

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

/**
 * Renders a React Email template to HTML & plain text and sends it through
 * Payload's configured Resend email adapter (or the Resend SDK fallback).
 */
export async function dispatchReactEmail({
  to,
  subject,
  react,
  replyTo,
  payload,
}: DispatchEmailOptions): Promise<void> {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean)
  if (recipients.length === 0) return

  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ])

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = getFormattedFromHeader()
  const effectiveReplyTo = replyTo || getDefaultReplyTo()

  if (!apiKey) {
    console.info(
      `[Email skipped — RESEND_API_KEY not configured] To: ${recipients.join(', ')} | Subject: "${subject}"`,
    )
    return
  }

  if (payload) {
    await payload.sendEmail({
      to: recipients,
      from,
      replyTo: effectiveReplyTo,
      subject,
      html,
      text,
    })
    return
  }

  const resend = getResendClient()
  if (!resend) return

  const { error } = await resend.emails.send({
    from,
    to: recipients,
    replyTo: effectiveReplyTo,
    subject,
    html,
    text,
  })

  if (error) {
    throw new Error(`Resend error (${error.name}): ${error.message}`)
  }
}

export interface SendReservationNotificationsInput {
  payload?: BasePayload
  id: number | string
  bookingReference: string
  bookingType: string
  eventCategory: string
  checkInDate: ISODate
  checkOutDate?: ISODate | null
  nightsCount: number
  guestCount: number
  guestName: string
  guestPhone: string
  guestEmail?: string | null
  notes?: string | null
  appliedSpecialTitle?: string | null
  promoCodeUsed?: string | null
  standardSubtotalUSD: number
  discountAmountUSD: number
  finalTotalUSD: number
}

export async function sendReservationNotifications(
  input: SendReservationNotificationsInput,
): Promise<void> {
  const siteBaseUrl = getSiteBaseUrl()
  const adminUrl = `${siteBaseUrl}/admin/collections/bookings/${input.id}`
  const adminRecipients = getAdminEmailRecipients()

  const templateProps: ReservationEmailData = {
    ...input,
    adminUrl,
  }

  const dateSummary = input.checkOutDate
    ? formatDateRange(input.checkInDate, input.checkOutDate)
    : formatDate(input.checkInDate)

  const bookingTypeLabel = formatBookingTypeLabel(input.bookingType)

  const adminSubject = `[Reservation #${input.bookingReference}] ${input.guestName} · ${bookingTypeLabel} (${dateSummary}) — ${formatUSD(input.finalTotalUSD)}`

  const tasks: Array<Promise<void>> = [
    dispatchReactEmail({
      payload: input.payload,
      to: adminRecipients,
      replyTo: input.guestEmail || getDefaultReplyTo(),
      subject: adminSubject,
      react: React.createElement(ReservationAdminEmail, templateProps),
    }),
  ]

  if (input.guestEmail) {
    const guestSubject = `Your Reservation Request #${input.bookingReference} at The Pink House (${dateSummary})`
    tasks.push(
      dispatchReactEmail({
        payload: input.payload,
        to: input.guestEmail,
        replyTo: getDefaultReplyTo(),
        subject: guestSubject,
        react: React.createElement(ReservationGuestEmail, templateProps),
      }),
    )
  }

  const results = await Promise.allSettled(tasks)
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Failed to send reservation notification email:', result.reason)
    }
  }
}

export interface SendEnquiryNotificationsInput {
  payload?: BasePayload
  id: number | string
  fullName: string
  phone: string
  email?: string | null
  topic: string
  preferredDate?: ISODate | null
  message: string
}

export async function sendEnquiryNotifications(
  input: SendEnquiryNotificationsInput,
): Promise<void> {
  const siteBaseUrl = getSiteBaseUrl()
  const adminUrl = `${siteBaseUrl}/admin/collections/contact-enquiries/${input.id}`
  const adminRecipients = getAdminEmailRecipients()

  const templateProps: EnquiryEmailData = {
    ...input,
    adminUrl,
  }

  const topicLabel = formatEnquiryTopicLabel(input.topic)
  const adminSubject = `[Website Enquiry] ${input.fullName} · ${topicLabel}`

  const tasks: Array<Promise<void>> = [
    dispatchReactEmail({
      payload: input.payload,
      to: adminRecipients,
      replyTo: input.email || getDefaultReplyTo(),
      subject: adminSubject,
      react: React.createElement(EnquiryAdminEmail, templateProps),
    }),
  ]

  if (input.email) {
    const guestSubject = `We have received your enquiry · The Pink House`
    tasks.push(
      dispatchReactEmail({
        payload: input.payload,
        to: input.email,
        replyTo: getDefaultReplyTo(),
        subject: guestSubject,
        react: React.createElement(EnquiryGuestEmail, templateProps),
      }),
    )
  }

  const results = await Promise.allSettled(tasks)
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Failed to send enquiry notification email:', result.reason)
    }
  }
}
