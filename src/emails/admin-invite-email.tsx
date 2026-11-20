import * as React from 'react'
import { Button, Hr, Link, Section, Text } from '@react-email/components'

import { SITE } from '@/lib/site'

import { EMAIL_COLORS, EmailLayout } from './email-layout'

export interface AdminInviteEmailProps {
  name: string
  email: string
  setupUrl: string
  loginUrl: string
}

export function AdminInviteEmail({
  name,
  email,
  setupUrl,
  loginUrl,
}: AdminInviteEmailProps) {
  return (
    <EmailLayout
      previewText={`You have been invited as an administrator for ${SITE.name} (${SITE.domain}). Set your password to sign in.`}
      eyebrow="House Office · Administrator Access"
      heading={`Welcome to ${SITE.name} Admin, ${name}`}
      subheading={`Your administrator account (${email}) is ready. Use the button below to set your password and access the front desk dashboard for reservations, enquiries, rates, specials and availability.`}
    >
      <Section style={styles.cardBox}>
        <Text style={styles.cardLabel}>Administrator Account</Text>
        <Text style={styles.cardValue}>{email}</Text>
        <Text style={styles.cardMeta}>
          Full access to Reservations, Enquiries, Calendar Blocks, Specials &
          Gallery
        </Text>
      </Section>

      <Section style={styles.ctaSection}>
        <Button href={setupUrl} style={styles.primaryButton}>
          Set Your Admin Password
        </Button>
      </Section>

      <Text style={styles.bodyText}>
        Once you have chosen your password, you can sign in any time at{' '}
        <Link href={loginUrl} style={styles.inlineLink}>
          {loginUrl}
        </Link>
        .
      </Text>

      <Hr style={styles.rule} />

      <Text style={styles.smallText}>
        This setup link is valid for 7 days. If the button above does not open,
        copy and paste this link into your browser:{' '}
        <Link href={setupUrl} style={styles.inlineLink}>
          {setupUrl}
        </Link>
      </Text>
    </EmailLayout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  cardBox: {
    backgroundColor: EMAIL_COLORS.night,
    borderRadius: '3px',
    padding: '18px 20px',
    marginBottom: '24px',
  },
  cardLabel: {
    color: EMAIL_COLORS.nightMuted,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 4px 0',
  },
  cardValue: {
    color: EMAIL_COLORS.accent,
    fontSize: '18px',
    fontWeight: 700,
    margin: '0 0 6px 0',
  },
  cardMeta: {
    color: EMAIL_COLORS.nightInk,
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.45',
  },
  ctaSection: {
    margin: '24px 0',
  },
  primaryButton: {
    backgroundColor: EMAIL_COLORS.accent,
    color: EMAIL_COLORS.ink,
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    padding: '14px 24px',
    borderRadius: '3px',
    display: 'inline-block',
  },
  bodyText: {
    color: EMAIL_COLORS.inkSecondary,
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 20px 0',
  },
  rule: {
    borderColor: EMAIL_COLORS.rule,
    margin: '20px 0',
  },
  smallText: {
    color: EMAIL_COLORS.muted,
    fontSize: '12px',
    lineHeight: '1.55',
    margin: 0,
    wordBreak: 'break-all',
  },
  inlineLink: {
    color: EMAIL_COLORS.ink,
    fontWeight: 600,
    textDecoration: 'underline',
  },
}
