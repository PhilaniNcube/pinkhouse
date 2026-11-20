import * as React from 'react'
import { Button, Column, Link, Row, Section, Text } from '@react-email/components'

import { formatDate, type ISODate } from '@/lib/dates'
import { buildGuestWhatsAppHref } from '@/lib/email/config'

import {
  EMAIL_COLORS,
  EmailLayout,
  formatEnquiryTopicLabel,
} from './email-layout'

export interface EnquiryEmailData {
  id: number | string
  fullName: string
  phone: string
  email?: string | null
  topic: string
  preferredDate?: ISODate | null
  message: string
  adminUrl: string
}

export function EnquiryAdminEmail(props: EnquiryEmailData) {
  const {
    fullName,
    phone,
    email,
    topic,
    preferredDate,
    message,
    adminUrl,
  } = props

  const topicLabel = formatEnquiryTopicLabel(topic)
  const formattedDate = preferredDate ? formatDate(preferredDate) : null

  const whatsappReplyUrl = buildGuestWhatsAppHref(
    phone,
    `Hello ${fullName}, thank you for contacting The Pink House regarding ${topicLabel.toLowerCase()}.`,
  )

  return (
    <EmailLayout
      previewText={`New enquiry from ${fullName} regarding ${topicLabel}${
        formattedDate ? ` (${formattedDate})` : ''
      }`}
      eyebrow={`New Website Enquiry · ${topicLabel}`}
      heading={`${fullName} sent an enquiry`}
      subheading={`Received via the contact form on The Pink House website${
        formattedDate ? ` for preferred date ${formattedDate}` : ''
      }.`}
    >
      {/* Contact & Topic Summary */}
      <Text style={styles.sectionTitle}>Sender & Enquiry Details</Text>
      <Section style={styles.tableSection}>
        <DetailRow label="Full name" value={fullName} />
        <DetailRow
          label="Phone / WhatsApp"
          value={
            <>
              <Link
                href={`tel:${phone.replace(/\s+/g, '')}`}
                style={styles.inlineLink}
              >
                {phone}
              </Link>
              {' · '}
              <Link href={whatsappReplyUrl} style={styles.inlineLink}>
                Open in WhatsApp
              </Link>
            </>
          }
        />
        <DetailRow
          label="Email address"
          value={
            email ? (
              <Link href={`mailto:${email}`} style={styles.inlineLink}>
                {email}
              </Link>
            ) : (
              'Not provided'
            )
          }
        />
        <DetailRow label="Topic" value={topicLabel} />
        <DetailRow
          label="Preferred date"
          value={formattedDate || 'Not specified'}
        />
      </Section>

      {/* Message Body */}
      <Text style={styles.sectionTitle}>Message</Text>
      <Section style={styles.messageBox}>
        <Text style={styles.messageText}>{message}</Text>
      </Section>

      {/* Action Buttons */}
      <Section style={styles.ctaSection}>
        <Button href={adminUrl} style={styles.primaryButton}>
          Open Enquiry in Admin
        </Button>
        <Button href={whatsappReplyUrl} style={styles.secondaryButton}>
          Reply on WhatsApp
        </Button>
      </Section>
    </EmailLayout>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <Row style={styles.detailRow}>
      <Column style={styles.detailLabelCol}>
        <Text style={styles.detailLabel}>{label}</Text>
      </Column>
      <Column style={styles.detailValueCol}>
        <Text style={styles.detailValue}>{value}</Text>
      </Column>
    </Row>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sectionTitle: {
    color: EMAIL_COLORS.ink,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: '8px 0 8px 0',
  },
  tableSection: {
    borderTop: `1px solid ${EMAIL_COLORS.rule}`,
    marginBottom: '20px',
  },
  detailRow: {
    borderBottom: `1px solid ${EMAIL_COLORS.rule}`,
    padding: '10px 0',
  },
  detailLabelCol: {
    width: '38%',
    verticalAlign: 'top',
    paddingRight: '12px',
  },
  detailValueCol: {
    width: '62%',
    verticalAlign: 'top',
  },
  detailLabel: {
    color: EMAIL_COLORS.muted,
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.45',
  },
  detailValue: {
    color: EMAIL_COLORS.ink,
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    lineHeight: '1.45',
  },
  inlineLink: {
    color: EMAIL_COLORS.inkSecondary,
    textDecoration: 'underline',
    fontWeight: 600,
  },
  messageBox: {
    backgroundColor: EMAIL_COLORS.paperWarm,
    border: `1px solid ${EMAIL_COLORS.rule}`,
    borderLeft: `3px solid ${EMAIL_COLORS.accent}`,
    borderRadius: '3px',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  messageText: {
    color: EMAIL_COLORS.ink,
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  ctaSection: {
    marginTop: '20px',
  },
  primaryButton: {
    backgroundColor: EMAIL_COLORS.accent,
    color: EMAIL_COLORS.ink,
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    padding: '13px 22px',
    borderRadius: '3px',
    display: 'inline-block',
    marginRight: '12px',
    marginBottom: '8px',
  },
  secondaryButton: {
    backgroundColor: EMAIL_COLORS.night,
    color: EMAIL_COLORS.nightInk,
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    padding: '13px 22px',
    borderRadius: '3px',
    display: 'inline-block',
    marginBottom: '8px',
  },
}
