import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import { SITE } from '@/lib/site'

export const EMAIL_COLORS = {
  paper: '#fdf9f9',
  paperWarm: '#f7eef0',
  paperDeep: '#efe0e3',
  ink: '#3a131b',
  inkSecondary: '#54202b',
  muted: '#78565d',
  rule: '#e5d3d7',
  accent: '#deb868',
  accentDeep: '#8f6a20',
  night: '#2a0e14',
  nightInk: '#faf3f4',
  nightMuted: '#cfbabc',
} as const

export const BOOKING_TYPE_LABELS: Record<string, string> = {
  accommodation: 'Overnight accommodation (Full house)',
  function: 'Outdoor garden function',
  'day-service': 'Day service / venue hire',
  'special-bundle': 'Special & stay bundle',
}

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  'overnight-stay': 'Overnight stay',
  roora: 'Roora / bride price ceremony',
  introductions: 'Family introductions',
  'naming-ceremony': 'Naming ceremony',
  'hen-night': 'Hen night',
  'bachelor-party': 'Bachelor party',
  'baby-shower': 'Baby shower',
  birthday: 'Birthday celebration',
  seminar: 'Seminar / workshop',
  'photo-shoot': 'Photo shoot',
  filming: 'Filming / video production',
  'church-service': 'Small church service',
  'day-rest': 'Daytime rest',
  other: 'Other gathering',
}

export const ENQUIRY_TOPIC_LABELS: Record<string, string> = {
  accommodation: 'Accommodation availability',
  function: 'Function package',
  specials: 'Current specials',
  'day-service': 'Day service or shoot quote',
  general: 'General question',
}

export function formatBookingTypeLabel(type: string): string {
  return BOOKING_TYPE_LABELS[type] || type
}

export function formatEventCategoryLabel(category: string): string {
  return EVENT_CATEGORY_LABELS[category] || category
}

export function formatEnquiryTopicLabel(topic: string): string {
  return ENQUIRY_TOPIC_LABELS[topic] || topic
}

export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })} USD`
}

interface EmailLayoutProps {
  previewText: string
  eyebrow: string
  heading: string
  subheading?: string
  children: React.ReactNode
}

export function EmailLayout({
  previewText,
  eyebrow,
  heading,
  subheading,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.outerContainer}>
          {/* Top burgundy banner with gold border */}
          <Section style={styles.headerBanner}>
            <Text style={styles.wordmark}>{SITE.name.toUpperCase()}</Text>
            <Text style={styles.addressPlaque}>
              2007 Makoni St · Mainway Meadows, Waterfalls, Harare
            </Text>
          </Section>

          {/* Editorial Hero Header */}
          <Section style={styles.heroSection}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.heading}>{heading}</Text>
            {subheading ? (
              <Text style={styles.subheading}>{subheading}</Text>
            ) : null}
          </Section>

          <Hr style={styles.divider} />

          {/* Main Content */}
          <Section style={styles.contentSection}>{children}</Section>

          {/* Burgundy Footer */}
          <Section style={styles.footerSection}>
            <Text style={styles.footerTitle}>
              {SITE.name} · Hosted by {SITE.host}
            </Text>
            <Text style={styles.footerText}>{SITE.address}</Text>
            <Text style={styles.footerLinks}>
              <Link href={SITE.phoneHref} style={styles.footerLink}>
                Call {SITE.phoneDisplay}
              </Link>
              {'  ·  '}
              <Link href={SITE.whatsappHref} style={styles.footerLink}>
                WhatsApp
              </Link>
              {'  ·  '}
              <Link href={SITE.url} style={styles.footerLink}>
                {SITE.domain}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: EMAIL_COLORS.paperWarm,
    color: EMAIL_COLORS.ink,
    fontFamily:
      "'Raleway', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: '32px 16px',
    WebkitFontSmoothing: 'antialiased',
  },
  outerContainer: {
    maxWidth: '620px',
    margin: '0 auto',
    backgroundColor: EMAIL_COLORS.paper,
    border: `1px solid ${EMAIL_COLORS.rule}`,
    borderRadius: '4px',
    overflow: 'hidden',
  },
  headerBanner: {
    backgroundColor: EMAIL_COLORS.night,
    borderTop: `4px solid ${EMAIL_COLORS.accent}`,
    padding: '22px 32px',
  },
  wordmark: {
    color: EMAIL_COLORS.nightInk,
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    margin: '0 0 4px 0',
  },
  addressPlaque: {
    color: EMAIL_COLORS.nightMuted,
    fontSize: '12px',
    margin: 0,
    lineHeight: '1.4',
  },
  heroSection: {
    padding: '32px 32px 20px 32px',
  },
  eyebrow: {
    display: 'inline-block',
    backgroundColor: EMAIL_COLORS.accent,
    color: EMAIL_COLORS.ink,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '4px 10px',
    borderRadius: '2px',
    margin: '0 0 14px 0',
  },
  heading: {
    color: EMAIL_COLORS.ink,
    fontSize: '26px',
    fontWeight: 400,
    letterSpacing: '-0.02em',
    lineHeight: '1.2',
    margin: '0 0 8px 0',
  },
  subheading: {
    color: EMAIL_COLORS.inkSecondary,
    fontSize: '15px',
    lineHeight: '1.55',
    margin: 0,
  },
  divider: {
    borderColor: EMAIL_COLORS.rule,
    borderWidth: '1px 0 0 0',
    margin: '0 32px',
  },
  contentSection: {
    padding: '24px 32px 32px 32px',
  },
  footerSection: {
    backgroundColor: EMAIL_COLORS.night,
    padding: '24px 32px',
    borderTop: `1px solid ${EMAIL_COLORS.rule}`,
  },
  footerTitle: {
    color: EMAIL_COLORS.nightInk,
    fontSize: '13px',
    fontWeight: 600,
    margin: '0 0 4px 0',
  },
  footerText: {
    color: EMAIL_COLORS.nightMuted,
    fontSize: '12px',
    margin: '0 0 12px 0',
    lineHeight: '1.45',
  },
  footerLinks: {
    color: EMAIL_COLORS.nightMuted,
    fontSize: '12px',
    margin: 0,
  },
  footerLink: {
    color: EMAIL_COLORS.accent,
    textDecoration: 'underline',
    fontWeight: 600,
  },
}
