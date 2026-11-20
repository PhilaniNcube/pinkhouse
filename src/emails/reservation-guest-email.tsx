import * as React from 'react'
import {
  Button,
  Column,
  Hr,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components'

import { formatDate, formatDateRange } from '@/lib/dates'
import { SITE } from '@/lib/site'

import {
  EMAIL_COLORS,
  EmailLayout,
  formatBookingTypeLabel,
  formatEventCategoryLabel,
  formatUSD,
} from './email-layout'
import type { ReservationEmailData } from './reservation-admin-email'

export function ReservationGuestEmail(props: ReservationEmailData) {
  const {
    bookingReference,
    bookingType,
    eventCategory,
    checkInDate,
    checkOutDate,
    nightsCount,
    guestCount,
    guestName,
    guestPhone,
    notes,
    appliedSpecialTitle,
    standardSubtotalUSD,
    discountAmountUSD,
    finalTotalUSD,
  } = props

  const bookingTypeLabel = formatBookingTypeLabel(bookingType)
  const eventCategoryLabel = formatEventCategoryLabel(eventCategory)
  const dateSummary = checkOutDate
    ? `${formatDateRange(checkInDate, checkOutDate)} (${nightsCount} ${
        nightsCount === 1 ? 'night' : 'nights'
      })`
    : formatDate(checkInDate)

  const guestWhatsAppToHost = `https://wa.me/263772964425?text=${encodeURIComponent(
    `Hello Mrs Ncube, I just submitted reservation request #${bookingReference} for ${dateSummary} under ${guestName}.`,
  )}`

  return (
    <EmailLayout
      previewText={`We have received your reservation request #${bookingReference} for ${dateSummary} at The Pink House.`}
      eyebrow={`Reservation Request Received · #${bookingReference}`}
      heading={`Thank you, ${guestName}`}
      subheading={`Your request for ${dateSummary} has been saved under reference #${bookingReference}. ${SITE.host} will contact you shortly on ${guestPhone} to confirm your dates and payment arrangements.`}
    >
      {/* Reference Card */}
      <Section style={styles.referenceBox}>
        <Row>
          <Column>
            <Text style={styles.refLabel}>Your Reference</Text>
            <Text style={styles.refCode}>#{bookingReference}</Text>
          </Column>
          <Column align="right">
            <Text style={styles.refLabel}>Quoted Total</Text>
            <Text style={styles.refTotal}>{formatUSD(finalTotalUSD)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Summary of request */}
      <Text style={styles.sectionTitle}>Your Request Summary</Text>
      <Section style={styles.tableSection}>
        <SummaryRow label="Booking type" value={bookingTypeLabel} />
        <SummaryRow label="Occasion" value={eventCategoryLabel} />
        <SummaryRow
          label={checkOutDate ? 'Check-in date' : 'Event date'}
          value={formatDate(checkInDate)}
        />
        {checkOutDate ? (
          <SummaryRow
            label="Check-out date"
            value={`${formatDate(checkOutDate)} (${nightsCount} ${
              nightsCount === 1 ? 'night' : 'nights'
            })`}
          />
        ) : null}
        <SummaryRow
          label="Guests"
          value={`${guestCount} ${guestCount === 1 ? 'guest' : 'guests'}`}
        />
        {appliedSpecialTitle ? (
          <SummaryRow label="Special offer" value={appliedSpecialTitle} />
        ) : null}
        {discountAmountUSD > 0 ? (
          <SummaryRow
            label="Savings applied"
            value={`-${formatUSD(discountAmountUSD)} (off ${formatUSD(standardSubtotalUSD)})`}
          />
        ) : null}
        {notes ? <SummaryRow label="Your notes" value={notes} /> : null}
      </Section>

      {/* Next Steps Note */}
      <Section style={styles.nextStepsBox}>
        <Text style={styles.nextStepsHeading}>What happens next</Text>
        <Text style={styles.nextStepsText}>
          No online payment was taken on the website. Your selected dates are
          held in our calendar while {SITE.host} reviews your request and gets in
          touch with you directly to finalize your booking.
        </Text>
        <Hr style={styles.innerRule} />
        <Text style={styles.nextStepsText}>
          Need to reach {SITE.host} right away? Call or WhatsApp{' '}
          <Link href={SITE.phoneHref} style={styles.inlineLink}>
            {SITE.phoneDisplay} ({SITE.phoneE164})
          </Link>{' '}
          and mention reference <strong>#{bookingReference}</strong>.
        </Text>
      </Section>

      <Section style={styles.ctaSection}>
        <Button href={guestWhatsAppToHost} style={styles.primaryButton}>
          Message {SITE.host} on WhatsApp
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
  referenceBox: {
    backgroundColor: EMAIL_COLORS.night,
    borderRadius: '3px',
    padding: '18px 20px',
    marginBottom: '24px',
  },
  refLabel: {
    color: EMAIL_COLORS.nightMuted,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 4px 0',
  },
  refCode: {
    color: EMAIL_COLORS.accent,
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
  },
  refTotal: {
    color: EMAIL_COLORS.nightInk,
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
  },
  sectionTitle: {
    color: EMAIL_COLORS.ink,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: '20px 0 8px 0',
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
    whiteSpace: 'pre-wrap',
  },
  nextStepsBox: {
    backgroundColor: EMAIL_COLORS.paperWarm,
    border: `1px solid ${EMAIL_COLORS.rule}`,
    borderLeft: `3px solid ${EMAIL_COLORS.accent}`,
    borderRadius: '3px',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  nextStepsHeading: {
    color: EMAIL_COLORS.ink,
    fontSize: '14px',
    fontWeight: 700,
    margin: '0 0 6px 0',
  },
  nextStepsText: {
    color: EMAIL_COLORS.inkSecondary,
    fontSize: '13px',
    lineHeight: '1.55',
    margin: 0,
  },
  innerRule: {
    borderColor: EMAIL_COLORS.rule,
    margin: '12px 0',
  },
  inlineLink: {
    color: EMAIL_COLORS.ink,
    fontWeight: 700,
    textDecoration: 'underline',
  },
  ctaSection: {
    marginTop: '16px',
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
