import { SITE } from '@/lib/site'

/**
 * Default administrator email recipients for The Pink House.
 * All reservation and enquiry notifications are sent to these addresses
 * unless overridden by the ADMIN_NOTIFICATION_EMAILS environment variable.
 */
export const ADMIN_EMAIL_RECIPIENTS = [
  'ncbphi001@gmail.com',
  'pnavaya@yahoo.co.uk',
  'everncube@gmail.com',
] as const

export const DEFAULT_FROM_ADDRESS = 'notifications@thepinkhouse.co.zw'
export const DEFAULT_FROM_NAME = SITE.name

export function getAdminEmailRecipients(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS?.trim()
  if (!raw) {
    return [...ADMIN_EMAIL_RECIPIENTS]
  }

  const parsed = raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return parsed.length > 0 ? Array.from(new Set(parsed)) : [...ADMIN_EMAIL_RECIPIENTS]
}

export function getResendFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_ADDRESS
}

export function getResendFromName(): string {
  return process.env.RESEND_FROM_NAME?.trim() || DEFAULT_FROM_NAME
}

export function getFormattedFromHeader(): string {
  return `${getResendFromName()} <${getResendFromAddress()}>`
}

export function getDefaultReplyTo(): string {
  return process.env.RESEND_REPLY_TO?.trim() || ADMIN_EMAIL_RECIPIENTS[0]
}

export function getSiteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/$/, '')
}

/**
 * Formats a guest phone number into a WhatsApp click-to-chat URL.
 * Normalizes local Zimbabwe numbers (e.g. 0772... -> 263772...).
 */
export function buildGuestWhatsAppHref(
  phone: string,
  prefilledMessage?: string,
): string {
  const digits = phone.replace(/[^\d+]/g, '')
  let normalized = digits.replace(/^\+/, '')

  if (normalized.startsWith('00')) {
    normalized = normalized.slice(2)
  } else if (normalized.startsWith('0') && normalized.length >= 9) {
    normalized = `263${normalized.slice(1)}`
  }

  const base = `https://wa.me/${normalized}`
  if (!prefilledMessage) return base
  return `${base}?text=${encodeURIComponent(prefilledMessage)}`
}
