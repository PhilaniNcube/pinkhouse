import * as React from 'react'
import { Button, Column, Link, Row, Section, Text } from '@react-email/components'

import { formatDate } from '@/lib/dates'
import { SITE } from '@/lib/site'

import {
  EMAIL_COLORS,
  EmailLayout,
  formatEnquiryTopicLabel,
} from './email-layout'
import type { EnquiryEmailData } from './enquiry-admin-email'

export function EnquiryGuestEmail(props: EnquiryEmailData) {
  const { fullName, phone, topic, preferredDate, message } = props

  const topicLabel = formatEnquiryTopicLabel(topic)
  const formattedDate = preferredDate ? formatDate(preferredDate) : null

  return (
    <EmailLayout
      previewText={`Thank you for contacting The Pink House, ${fullName}. ${SITE.host} has received your enquiry.`}
      eyebrow={`Enquiry Received · ${topicLabel}`}
      heading={`We have received your message, ${fullName}`}
      subheading={`Thank you for getting in touch with ${SITE.name}. ${SITE.host} has received your enquiry and will reply directly on ${phone}.`}
    >
      <Text style={styles.sectionTitle}>Your Enquiry Details</Text>
      <Section style={styles.tableSection}>
        <SummaryRow label="Topic" value={topicLabel} />
        {formattedDate ? (
          <SummaryRow label="Preferred date" value={formattedDate} />
        ) : null}
        <SummaryRow label="Phone / WhatsApp" value={phone} />
      </Section>

      <Text style={styles.sectionTitle}>Your Message</Text>
      <Section style={styles.messageBox}>
        <Text style={styles.messageText}>{message}</Text>
      </Section>

      <Section style={styles.noteBox}>
        <Text style={styles.noteText}>
          If your enquiry is urgent, you can call or WhatsApp {SITE.host}{' '}
          directly on{' '}
          <Link href={SITE.phoneHref} style={styles.inlineLink}>
            {SITE.phoneDisplay} ({SITE.phoneE164})
          </Link>
          .
        </Text>
      </Section>

      <Section style={styles.ctaSection}>
        <Button href={SITE.whatsappHref} style={styles.primaryButton}>
          Chat with {SITE.host} on WhatsApp
        </Button>
      </Section>
    </EmailLayout>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
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
    margin: '12px 0 8px 0',
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
  messageBox: {
    backgroundColor: EMAIL_COLORS.paperWarm,
    border: `1px solid ${EMAIL_COLORS.rule}`,
    borderLeft: `3px solid ${EMAIL_COLORS.accent}`,
    borderRadius: '3px',
    padding: '16px 20px',
    marginBottom: '20px',
  },
  messageText: {
    color: EMAIL_COLORS.ink,
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  noteBox: {
    marginBottom: '20px',
  },
  noteText: {
    color: EMAIL_COLORS.inkSecondary,
    fontSize: '13px',
    lineHeight: '1.55',
    margin: 0,
  },
  inlineLink: {
    color: EMAIL_COLORS.ink,
    fontWeight: 700,
    textDecoration: 'underline',
  },
  ctaSection: {
    marginTop: '12px',
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
  },
}
