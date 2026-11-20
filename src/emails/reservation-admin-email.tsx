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

import { formatDate, formatDateRange, type ISODate } from '@/lib/dates'
import { buildGuestWhatsAppHref } from '@/lib/email/config'

import {
  EMAIL_COLORS,
  EmailLayout,
  formatBookingTypeLabel,
  formatEventCategoryLabel,
  formatUSD,
} from './email-layout'

export interface ReservationEmailData {
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
  adminUrl: string
}

export function ReservationAdminEmail(props: ReservationEmailData) {
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
    guestEmail,
    notes,
    appliedSpecialTitle,
    promoCodeUsed,
    standardSubtotalUSD,
    discountAmountUSD,
    finalTotalUSD,
    adminUrl,
  } = props

  const bookingTypeLabel = formatBookingTypeLabel(bookingType)
  const eventCategoryLabel = formatEventCategoryLabel(eventCategory)
  const dateSummary = checkOutDate
    ? `${formatDateRange(checkInDate, checkOutDate)} (${nightsCount} ${
        nightsCount === 1 ? 'night' : 'nights'
      })`
    : formatDate(checkInDate)

  const whatsappReplyUrl = buildGuestWhatsAppHref(
    guestPhone,
    `Hello ${guestName}, thank you for your reservation request at The Pink House (Ref #${bookingReference} for ${dateSummary}).`,
  )

  return (
    <EmailLayout
      previewText={`New reservation #${bookingReference} from ${guestName} (${dateSummary}) — ${formatUSD(finalTotalUSD)}`}
      eyebrow={`New Reservation · #${bookingReference}`}
      heading={`${guestName} requested ${bookingTypeLabel.toLowerCase()}`}
      subheading={`Submitted for ${dateSummary} (${guestCount} ${
        guestCount === 1 ? 'guest' : 'guests'
      }). Dates are now held as pending until confirmed in the admin.`}
    >
      {/* Reference & Status Ledger Card */}
      <Section style={styles.ledgerBox}>
        <Row>
          <Column style={styles.ledgerColumn}>
            <Text style={styles.ledgerLabel}>Reference</Text>
            <Text style={styles.ledgerValue}>#{bookingReference}</Text>
          </Column>
          <Column style={styles.ledgerColumn}>
            <Text style={styles.ledgerLabel}>Status</Text>
            <Text style={styles.ledgerBadge}>Pending Confirmation</Text>
          </Column>
          <Column style={styles.ledgerColumnRight}>
            <Text style={styles.ledgerLabel}>Quoted Total</Text>
            <Text style={styles.ledgerTotal}>{formatUSD(finalTotalUSD)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Reservation Details */}
      <Text style={styles.sectionTitle}>Reservation Details</Text>
      <Section style={styles.tableSection}>
        <DetailRow label="Booking type" value={bookingTypeLabel} />
        <DetailRow label="Event / occasion" value={eventCategoryLabel} />
        <DetailRow
          label={checkOutDate ? 'Check-in date' : 'Event date'}
          value={formatDate(checkInDate)}
        />
        {checkOutDate ? (
          <DetailRow
            label="Check-out date"
            value={`${formatDate(checkOutDate)} (${nightsCount} ${
              nightsCount === 1 ? 'night' : 'nights'
            })`}
          />
        ) : null}
        <DetailRow
          label="Number of guests"
          value={`${guestCount} ${guestCount === 1 ? 'guest' : 'guests'}`}
        />
        {appliedSpecialTitle ? (
          <DetailRow label="Applied special" value={appliedSpecialTitle} />
        ) : null}
        {promoCodeUsed ? (
          <DetailRow label="Promo code used" value={promoCodeUsed} />
        ) : null}
      </Section>

      {/* Guest Contact Information */}
      <Text style={styles.sectionTitle}>Guest Contact</Text>
      <Section style={styles.tableSection}>
        <DetailRow label="Full name" value={guestName} />
        <DetailRow
          label="Phone / WhatsApp"
          value={
            <>
              <Link
                href={`tel:${guestPhone.replace(/\s+/g, '')}`}
                style={styles.inlineLink}
              >
                {guestPhone}
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
            guestEmail ? (
              <Link href={`mailto:${guestEmail}`} style={styles.inlineLink}>
                {guestEmail}
              </Link>
            ) : (
              'Not provided'
            )
          }
        />
      </Section>

      {/* Guest Notes */}
      {notes ? (
        <>
          <Text style={styles.sectionTitle}>Special Requests & Notes</Text>
          <Section style={styles.notesBox}>
            <Text style={styles.notesText}>{notes}</Text>
          </Section>
        </>
      ) : null}

      {/* Pricing Summary */}
      <Text style={styles.sectionTitle}>Pricing Breakdown</Text>
      <Section style={styles.pricingBox}>
        <Row style={styles.pricingRow}>
          <Column>
            <Text style={styles.pricingLabel}>Standard subtotal</Text>
          </Column>
          <Column align="right">
            <Text style={styles.pricingValue}>
              {formatUSD(standardSubtotalUSD)}
            </Text>
          </Column>
        </Row>
        {discountAmountUSD > 0 ? (
          <Row style={styles.pricingRow}>
            <Column>
              <Text style={styles.pricingDiscountLabel}>
                Special discount
                {appliedSpecialTitle ? ` (${appliedSpecialTitle})` : ''}
              </Text>
            </Column>
            <Column align="right">
              <Text style={styles.pricingDiscountValue}>
                -{formatUSD(discountAmountUSD)}
              </Text>
            </Column>
          </Row>
        ) : null}
        <Hr style={styles.pricingDivider} />
        <Row>
          <Column>
            <Text style={styles.pricingTotalLabel}>Final total due</Text>
          </Column>
          <Column align="right">
            <Text style={styles.pricingTotalValue}>
              {formatUSD(finalTotalUSD)}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Action Buttons */}
      <Section style={styles.ctaSection}>
        <Button href={adminUrl} style={styles.primaryButton}>
          Open Reservation in Admin
        </Button>
        <Button href={whatsappReplyUrl} style={styles.secondaryButton}>
          Confirm via WhatsApp
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
  ledgerBox: {
    backgroundColor: EMAIL_COLORS.night,
    borderRadius: '3px',
    padding: '18px 20px',
    marginBottom: '24px',
  },
  ledgerColumn: {
    verticalAlign: 'top',
  },
  ledgerColumnRight: {
    verticalAlign: 'top',
    textAlign: 'right',
  },
  ledgerLabel: {
    color: EMAIL_COLORS.nightMuted,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 4px 0',
  },
  ledgerValue: {
    color: EMAIL_COLORS.nightInk,
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
  },
  ledgerBadge: {
    color: EMAIL_COLORS.accent,
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
  },
  ledgerTotal: {
    color: EMAIL_COLORS.accent,
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
    marginBottom: '16px',
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
  notesBox: {
    backgroundColor: EMAIL_COLORS.paperWarm,
    border: `1px solid ${EMAIL_COLORS.rule}`,
    borderLeft: `3px solid ${EMAIL_COLORS.accent}`,
    borderRadius: '3px',
    padding: '14px 16px',
    marginBottom: '16px',
  },
  notesText: {
    color: EMAIL_COLORS.ink,
    fontSize: '14px',
    lineHeight: '1.55',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  pricingBox: {
    backgroundColor: EMAIL_COLORS.paperWarm,
    border: `1px solid ${EMAIL_COLORS.rule}`,
    borderRadius: '3px',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  pricingRow: {
    marginBottom: '6px',
  },
  pricingLabel: {
    color: EMAIL_COLORS.inkSecondary,
    fontSize: '13px',
    margin: 0,
  },
  pricingValue: {
    color: EMAIL_COLORS.ink,
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
  },
  pricingDiscountLabel: {
    color: EMAIL_COLORS.accentDeep,
    fontSize: '13px',
    fontWeight: 600,
    margin: 0,
  },
  pricingDiscountValue: {
    color: EMAIL_COLORS.accentDeep,
    fontSize: '14px',
    fontWeight: 700,
    margin: 0,
  },
  pricingDivider: {
    borderColor: EMAIL_COLORS.rule,
    margin: '10px 0',
  },
  pricingTotalLabel: {
    color: EMAIL_COLORS.ink,
    fontSize: '15px',
    fontWeight: 700,
    margin: 0,
  },
  pricingTotalValue: {
    color: EMAIL_COLORS.ink,
    fontSize: '18px',
    fontWeight: 700,
    margin: 0,
  },
  ctaSection: {
    marginTop: '24px',
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
