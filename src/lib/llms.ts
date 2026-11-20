import 'server-only'

import {
  getHomeData,
  specialValidityLabel,
  type HomeData,
} from '@/features/home/home-data'
import { currency } from '@/lib/pricing'
import { FAQS, SITE } from '@/lib/site'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(
  /\/$/,
  '',
)

async function safeGetHomeData(): Promise<HomeData | null> {
  try {
    return await getHomeData()
  } catch {
    return null
  }
}

export async function buildLlmsIndexMarkdown(): Promise<string> {
  const data = await safeGetHomeData()
  const stayRate =
    data?.pricing.accommodationNightlyRateUSD ?? SITE.standardAccommodationRate
  const functionRate =
    data?.pricing.functionBaseRateUSD ?? SITE.standardFunctionRate
  const maxGuests =
    data?.pricing.functionMaxGuests ?? SITE.functionMaxGuests
  const specials = data?.specials ?? []

  const specialsLines = specials.length
    ? specials.map((special) => {
        const promo = special.promoCode ? ` (Promo code: \`${special.promoCode}\`)` : ''
        const minNights =
          special.minNights && special.minNights > 1
            ? ` · Minimum ${special.minNights} nights`
            : ''
        return `- **${special.title}** (${special.badgeText}): ${currency(special.specialPriceUSD)} USD (standard ${currency(special.standardPriceUSD)} USD)${minNights}${promo} — ${special.description} Valid ${specialValidityLabel(special)}.`
      })
    : [
        `- **Seasonal Offers**: Ask ${SITE.host} directly for seasonal multi-night stay and function-plus-stay bundle rates.`,
      ]

  return `# ${SITE.name}

> ${SITE.description}

${SITE.name} (${siteUrl}) is a private, gated four-bedroom guesthouse and neat outdoor garden venue located at ${SITE.address}, ${SITE.country}. Every overnight reservation grants exclusive use of the entire house and garden under one key ("the whole house, one key"), hosted personally by ${SITE.host}.

## Quick Facts

- **Official Website**: ${siteUrl}
- **Property Type**: Private whole-house guesthouse (4 double bedrooms) & outdoor garden function venue
- **Address**: ${SITE.address}, ${SITE.country}
- **Suburb / Area**: ${SITE.area}
- **Host**: ${SITE.host}
- **Phone & WhatsApp**: ${SITE.phoneE164} (Local display: ${SITE.phoneDisplay})
- **WhatsApp Direct Link**: ${SITE.whatsappHref}
- **Google Maps**: ${SITE.mapsHref}
- **Overnight Accommodation Rate**: ${currency(stayRate)} USD per night (entire 4-bedroom house, sleeps up to ${SITE.accommodationMaxGuests} guests)
- **Outdoor Function Venue Hire**: ${currency(functionRate)} USD standard venue hire (up to ${maxGuests} guests)
- **Day Services**: Available by day for daytime rest, photo shoots, filming, seminars, workshops and small church services${
    data?.pricing.dayServiceStartingRateUSD
      ? ` (from ${currency(data.pricing.dayServiceStartingRateUSD)} USD)`
      : ' (quoted around your hours and setup)'
  }
- **Booking & Payment Policy**: Live availability calendar and instant booking requests online at ${siteUrl}/#booking. No online card payment is collected; each request receives a reference number (e.g. \`PH-2026-0042\`) and ${SITE.host} confirms directly.

## Key Sections & Resources

- [Homepage & Live Booking Engine](${siteUrl}/): Full property overview, rates, photo gallery, real-time availability calendar and reservation request form.
- [Full LLM Property Reference](${siteUrl}/llms-full.txt): Complete, structured plain-text documentation of ${SITE.name}, including room-by-room inventory, event capabilities, active specials, booking rules and FAQs.
- [The House (Accommodation)](${siteUrl}/#the-house): 4 plush double bedrooms with fitted wardrobes, main bedroom en-suite, 2 additional toilets (1 with shower), chandelier lounge, 8-seater dining room, fitted self-catering kitchen, paved yard and gated perimeter.
- [Outdoor Functions & Garden Venue](${siteUrl}/#functions): Garden and paved outdoor venue for up to ${maxGuests} guests—roora/lobola, family introductions, naming ceremonies, bridal showers, hen nights, bachelor parties, baby showers and milestone birthdays.
- [Day Services & Productions](${siteUrl}/#day-services): Daytime rest, seminars, workshops, photography shoots, video/film productions and intimate church services.
- [Current Specials & Bundles](${siteUrl}/#specials): Active multi-night discounts, celebration-and-stay bundles and midweek offers.
- [Check Availability & Book](${siteUrl}/#booking): Interactive calendar synced with direct bookings and OTA reservations.
- [Frequently Asked Questions](${siteUrl}/#faq): Direct answers to common questions about location, capacity, rates, self-catering and booking.
- [Contact ${SITE.host}](${siteUrl}/#contact): Direct phone, WhatsApp and online enquiry form.

## Active Specials & Packages

${specialsLines.join('\n')}

## Frequently Asked Questions

${FAQS.map((item) => `### ${item.question}\n${item.answer}`).join('\n\n')}
`
}

export async function buildLlmsFullMarkdown(): Promise<string> {
  const data = await safeGetHomeData()
  const stayRate =
    data?.pricing.accommodationNightlyRateUSD ?? SITE.standardAccommodationRate
  const functionRate =
    data?.pricing.functionBaseRateUSD ?? SITE.standardFunctionRate
  const maxGuests =
    data?.pricing.functionMaxGuests ?? SITE.functionMaxGuests
  const specials = data?.specials ?? []
  const nextStay = data?.suggestedStay

  return `# ${SITE.name} — Complete AI & LLM Reference Guide

> ${SITE.description}

---

## 1. Identity & Location

- **Name**: ${SITE.name}
- **Canonical URL**: ${siteUrl}
- **Category**: LodgingBusiness / VacationRental / EventVenue
- **Street Address**: ${SITE.streetAddress}
- **Neighbourhood / Suburb**: ${SITE.suburb}
- **City**: ${SITE.city}
- **Country**: ${SITE.country} (${SITE.countryCode})
- **Full Address**: ${SITE.address}, ${SITE.country}
- **Geographic Coordinates**: Latitude ${SITE.coordinates.latitude}, Longitude ${SITE.coordinates.longitude}
- **Google Maps URL**: ${SITE.mapsHref}
- **Host / Proprietor**: ${SITE.host}
- **Telephone (E.164)**: ${SITE.phoneE164}
- **Telephone (Local Zimbabwe)**: ${SITE.phoneDisplay}
- **WhatsApp Direct**: ${SITE.whatsappHref}
- **Email**: ${SITE.email}
- **Gate Policy**: Private residential property with a secure gated perimeter. Guests and visitors are asked to arrange their arrival with ${SITE.host} before coming through the gate.

---

## 2. The House — Whole-House Overnight Accommodation

**Tagline**: "The whole house, one key — Comfort for families & groups."

When guests book overnight accommodation at ${SITE.name}, they receive exclusive use of the entire house and grounds. Rooms are never rented individually to separate parties at the same time.

### Room & Amenity Inventory
1. **Bedrooms (4 total)**:
   - Four plush double bedrooms, each with a made-up double bed and fitted wardrobes.
   - Comfortably sleeps up to ${SITE.accommodationMaxGuests} overnight guests.
2. **Bathrooms (3 toilets / 2 showers)**:
   - Main bedroom is en-suite.
   - Two further toilets in the house, one of which includes a shower.
3. **Living & Dining**:
   - Chandelier lounge with comfortable seating for families and groups.
   - Eight-seater dining room.
4. **Fitted Self-Catering Kitchen**:
   - Double-door refrigerator
   - Stove and oven
   - Microwave
   - Electric kettle
   - Fitted cabinetry and stone countertop preparation space
5. **Outdoors & Security**:
   - Neat year-round lawn and garden
   - Spacious paved outdoor yard and parking
   - Quiet residential street in Mainway Meadows, Waterfalls
   - Secure gated perimeter

### Overnight Pricing
- **Standard Nightly Rate**: ${currency(stayRate)} USD per night for the full 4-bedroom house.
- **Currency**: United States Dollars (USD).
- **Check-in / Check-out Calculation**: Date selection is exclusive of the check-out date (for example, checking in on 6 November and checking out on 9 November is a 3-night stay occupying the nights of 6, 7 and 8 November).

---

## 3. Outdoor Functions & Intimate Garden Venue

**Tagline**: "Host your milestone moments outdoors — You name it, we can host it."

The neat lawn, garden and spacious paved yard are available for private daytime and outdoor milestone celebrations.

### Event Types Hosted
- Roora (lobola) and bride price functions
- Family introductions and gatherings
- Naming ceremonies
- Hen nights and bridal showers
- Bachelor parties
- Baby showers
- Birthdays and milestone celebrations

### Function Capacity & Pricing
- **Maximum Function Capacity**: Up to ${maxGuests} guests.
- **Standard Venue Hire Rate**: ${currency(functionRate)} USD per function date.
- **Function + Overnight Stay Bundle**: Guests hosting a function can bundle venue hire with one night in the four-bedroom house at a discounted package rate (see Active Specials below).

---

## 4. Day Services, Productions & Gatherings

**Tagline**: "The house is available by day for work, worship, a shoot or a quiet rest."

### Available Day Services
1. **Daytime rest**: Private daytime use of the house in a calm, gated setting.
2. **Seminars and workshops**: Indoor room and outdoor garden breakout space.
3. **Photo shoots**: Chandelier lounge, bedrooms, garden gate and lawn backdrops.
4. **Filming and video productions**: Private, quiet, gated residential setting.
5. **Small church services**: An intimate setting for a small congregation or fellowship.

### Day Service Pricing
- Day rates are quoted around the guest's hours, headcount and setup requirements.${
    data?.pricing.dayServiceStartingRateUSD
      ? `\n- **Starting Day Rate**: From ${currency(data.pricing.dayServiceStartingRateUSD)} USD.`
      : ''
  }

---

## 5. Current Specials & Promo Codes

${
  specials.length
    ? specials
        .map(
          (special, index) => `### 5.${index + 1} ${special.title} (${special.badgeText})
- **Category**: ${special.category}
- **Special Price**: ${currency(special.specialPriceUSD)} USD (Standard price: ${currency(special.standardPriceUSD)} USD)
- **Minimum Nights**: ${special.minNights ?? 1}
- **Promo Code**: ${special.promoCode ? `\`${special.promoCode}\`` : 'Applied automatically when eligible'}
- **Validity Window**: ${specialValidityLabel(special)}
- **Summary**: ${special.description}
${special.termsAndConditions ? `- **Terms & Conditions**: ${special.termsAndConditions}` : ''}`,
        )
        .join('\n\n')
    : `No published specials are active today. Contact ${SITE.host} on ${SITE.phoneE164} for seasonal rates.`
}

---

## 6. How to Check Availability & Book

1. **Online via the Live Booking Engine**:
   - Visit ${siteUrl}/#booking
   - Choose the service type: **Overnight stay**, **Outdoor function**, **Day service**, or **Special package**.
   - Select available dates from the live calendar (synced two-way with direct reservations and Airbnb/OTA calendars).${
     nextStay
       ? `\n   - *Current next suggested available stay window*: ${nextStay.checkIn} to ${nextStay.checkOut}.`
       : ''
   }
   - Choose an eligible special or enter a promo code (e.g. \`PINKSTAY3\`, \`BUNDLE30\`, \`MIDWEEK\`).
   - Submit your name, phone/WhatsApp number, guest count (up to ${maxGuests}) and occasion.
   - Receive an immediate booking reference (format: \`PH-YYYY-NNNN\`).
2. **Direct via Phone or WhatsApp**:
   - Call ${SITE.host} on ${SITE.phoneE164} (${SITE.phoneDisplay})
   - Message on WhatsApp: ${SITE.whatsappHref}
3. **Payment & Confirmation**:
   - No online card payment is required to submit a booking request.
   - Every submitted request holds the requested dates in pending status while ${SITE.host} contacts the guest directly to confirm arrangements.

---

## 7. Frequently Asked Questions (AEO Knowledge Base)

${FAQS.map((item, i) => `### Q${i + 1}: ${item.question}\n**Answer**: ${item.answer}`).join('\n\n')}
`
}
