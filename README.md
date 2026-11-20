# The Pink House

A warm, editorial website and booking engine for **The Pink House**, a private four-bedroom guesthouse and intimate garden venue at **2007 Makoni St, Mainway Meadows, Waterfalls, Harare**.

The project is a Next.js 16 App Router application with Payload CMS, Tailwind CSS and shadcn-style components. Property content, rates, specials, dates and guest messages live in Payload on a **Turso (libSQL/SQLite)** database. Photography is served from **Cloudflare R2** when the R2 environment variables are set.

## What is in the build

- A full marketing site: welcome, house, outdoor functions, day services, current specials, gallery, availability and booking, contact, footer.
- A live booking engine bound to the Payload collections:
  - overnight stays for the full house,
  - outdoor functions for up to 30 guests,
  - day services such as shoots and seminars,
  - function-and-stay special bundles.
- Two-way iCal availability sync: reservations are pulled from Airbnb (and Booking.com when enabled), and the site exposes its own `.ics` feed for OTAs to import.
- Availability derived from confirmed and pending reservations, manually entered blocks and OTA reservations.
- Special pricing with automatic minimum-night offers, fixed package prices, amount-off, percentage-off and per-night override rules.
- Server-side availability and price calculation on submission. Client values are never trusted.
- A real reservation request workflow, no online payment. Each request receives a reference such as `PH-2026-0042` and starts in `pending`.
- A database-backed contact enquiry form for Mrs Ncube.
- Payload admin for rates, the announcement strip, specials, gallery, media, reservations, enquiries and blocked dates.
- Complete SEO, AEO (Answer Engine Optimization) and LLM discovery for `https://www.thepinkhouse.co.zw`:
  - Canonical metadata, Open Graph, X/Twitter large summary cards, generated OG/Twitter social preview images, Apple touch icon, web manifest and Harare geo-coordinates.
  - Rich `@graph` JSON-LD (`WebSite`, `WebPage` with `SpeakableSpecification`, `BreadcrumbList`, `LodgingBusiness` + `VacationRental` + `EventVenue`, `House`, `Offer`s and `FAQPage`).
  - Visible on-page FAQ section (`#faq`) paired with `FAQPage` schema for direct answer engines and voice assistants.
  - Dynamic `/llms.txt` and `/llms-full.txt` endpoints serving live rates, specials, promo codes, amenities and booking rules in clean Markdown for AI crawlers and LLMs.
  - `/robots.txt` (with explicit allow rules for search and AI crawlers such as `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` and `Applebot-Extended`, while protecting `/admin` and `/api`) and `/sitemap.xml` with property image entries.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4, React 19 |
| Styling | Tailwind CSS 4, custom design tokens, shadcn-style primitives |
| CMS | Payload 3.93 embedded in Next.js |
| Database | Turso / libSQL via `@payloadcms/db-sqlite` |
| Images | Cloudflare R2 via the S3-compatible storage adapter, public bucket URL |
| Icons | Lucide |
| Fonts | Raleway Variable, served locally from `@fontsource-variable/raleway` |

## Getting started

```bash
npm install
cp .env.example .env
# fill in PAYLOAD_SECRET, DATABASE_URI and optionally the R2 values
npm run dev -- -p 3100
```

The local `NEXT_PUBLIC_SITE_URL` is currently set to `http://localhost:3100` because another application already uses port 3000 on this machine. The value must match the port or public address you actually serve from, because Payload uses it to build media and admin URLs.

Open:

- Website: `http://localhost:3100`
- Payload admin: `http://localhost:3100/admin`

The first admin account is created by the seed command from `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` and `SEED_ADMIN_NAME`. Use the credentials in your local `.env`; do not commit `.env`. Change the password after the first login and use a long random `PAYLOAD_SECRET` in production.

### Seeding

```bash
npm run seed
```

The seed is intended for a blank database. It creates the first admin, sample specials, the standard rates, six gallery entries and one sample maintenance block. It does **not** overwrite an existing gallery image. Add `--reset` only when you deliberately want to reset the global rate and banner settings.

For a new production database, create the owner account in `/admin` or run the seed once against the blank Turso database with production credentials. After that, manage content from Payload.

## Environment

See `.env.example`. The important values:

```dotenv
NEXT_PUBLIC_SITE_URL=https://www.thepinkhouse.co.zw
PAYLOAD_SECRET=replace-with-a-long-random-string

# Turso. A file: URL is supported for local development.
DATABASE_URI=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=...

# Cloudflare R2. Leave blank to store media in public/media during local work.
R2_BUCKET=
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_URL=https://pub-<hash>.r2.dev

# OTA iCal feeds. Add Booking.com later simply by filling its URL.
AIRBNB_ICAL_URL=https://www.airbnb.com/calendar/ical/<listing-id>.ics?s=<token>
BOOKING_ICAL_URL=

# Protects the sync endpoint.
CRON_SECRET=replace-with-a-long-random-string

# Optional protection for the outbound feed.
CALENDAR_EXPORT_TOKEN=
```

When all four non-public R2 values are present, the media collection uploads to R2 and file URLs use `R2_PUBLIC_URL`. The bucket must permit public reads, or you must serve it through a Cloudflare custom domain.

## Content model

Payload types are generated into `src/payload-types.ts` with `npm run generate:types`.

- **Pricing settings** (global): accommodation nightly rate, function rate and guest cap, optional day rate, banner toggle, banner copy and featured special.
- **Specials**: title, unique slug, optional promo code, category, pricing rule, standard/special prices, discount value, minimum nights, validity dates, badge text, description, terms and active state.
- **Bookings**: reference, booking type, event category, dates, nights, guest count, applied special, promo code, itemized totals, guest details, notes and status.
- **Contact enquiries**: contact details, topic, preferred date, optional interested special, message, status and private follow-up notes.
- **Availability blocks**: title, start/end dates and scope (`full-premises`, `accommodation-only`, `outdoor-only`).
- **Calendar sources**: provider, feed URL, active state, last sync time, status and error. Feeds come from `AIRBNB_ICAL_URL` / `BOOKING_ICAL_URL` or can be added by hand in the admin.
- **External blocks**: reservations synced from an OTA, keyed by the feed's `UID`, with exclusive check-out date and the raw event for debugging.
- **Gallery items**: title, category, media relationship and display order.
- **Media**: image, alt text, photographer credit and credit URL.

## Booking logic

`src/lib/pricing.ts` is the single pricing model shared by the client summary and the server action. `src/lib/availability.ts` defines how reservations and blocked dates affect each service.

- Date selection is exclusive of the check-out night: a 6 to 9 November stay occupies 6, 7 and 8 November.
- Pending and confirmed reservations both hold dates. Cancelled and completed reservations do not.
- Public requests are written by server actions with Payload's local API; the public REST endpoints for bookings and enquiries are not open.
- The confirmation state appears only after a successful database write.
- Availability blocks can be used for phone bookings, private holds or maintenance.
- No card payment is collected. Mrs Ncube confirms each request in the admin.

## Two-way iCal sync

### Inbound: pulling OTA reservations

Set `AIRBNB_ICAL_URL` to the private export link from the Airbnb listing. `BOOKING_ICAL_URL` is optional: when it is empty the sync skips Booking.com without failing, and adding the value later is the only step needed to enable it. Feeds can also be managed in **Admin → Integrations → Calendar sources**; environment-managed feeds are created and kept up to date automatically.

Run the sync with:

```bash
npm run sync:ical
```

or hit the protected endpoint (Vercel Cron does this automatically from `vercel.json`, every 15 minutes):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://www.thepinkhouse.co.zw/api/cron/sync-ical
```

The endpoint returns a per-source report. Each run:

- fetches every active feed with a 15 second timeout and an identifying User-Agent,
- parses each `VEVENT` with `node-ical`,
- upserts blocks by `(source, UID)`, so repeated runs do not duplicate anything,
- deletes blocks whose `UID` disappeared from the feed, so a cancelled OTA booking reopens the dates immediately,
- records `lastSyncedAt`, `lastSyncStatus` and `lastError` on the calendar source.

OTA `DTEND` is exclusive. A 10 to 12 November stay blocks the nights of 10 and 11 November and allows a new check-in on 12 November. The unified availability check applies the same exclusive check-out rule to direct bookings, manual admin blocks and OTA blocks, using `(requestedCheckIn < existingCheckOut) AND (requestedCheckOut > existingCheckIn)`.

OTA reservations occupy the whole unit, so they block overnight stays and stay bundles. They do not automatically block a garden-only function or day service; use a full-premises availability block when the whole property must be held.

> Vercel Hobby only allows daily cron jobs. If the project is on Hobby, call `/api/cron/sync-ical` from an external scheduler every 10–15 minutes, or keep the Vercel schedule once the project is on a plan that supports minute-level crons.

### Outbound: exposing our calendar

`GET /api/calendar/export.ics` returns a valid RFC 5545 calendar containing confirmed direct stays and manual blocks that affect accommodation. OTA-sourced blocks are excluded to prevent feedback loops. Pending requests and garden-only blocks are also excluded.

Use the feed URL in Airbnb's and Booking.com's calendar import settings:

```text
https://www.thepinkhouse.co.zw/api/calendar/export.ics?token=$CALENDAR_EXPORT_TOKEN
```

When `CALENDAR_EXPORT_TOKEN` is empty the feed is public. Set it to a long random string to stop bots scraping the booking schedule. The response is sent with `Content-Type: text/calendar; charset=utf-8` and `Cache-Control: no-store, max-age=0`, and dates are exported as all-day `DTSTART;VALUE=DATE` / `DTEND;VALUE=DATE` pairs.

## Commands

```bash
npm run dev          # local dev (add -p 3100 in this workspace)
npm run build        # production build
npm run start        # serve the production build
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run seed         # seed a blank database
npm run sync:ical    # pull all active OTA iCal feeds now
npm run generate:types
npm run generate:importmap
```

## Photography handoff

The gallery is wired to Payload media and each item has a media credit. The repository includes licensed stand-in photography for the less specific rooms and garden; the media library already contains exterior and lounge photographs that can be used as the starting point.

Replace any remaining stand-in images in **Admin → Gallery photographs** with original photographs of the actual house: all four bedrooms, the two extra toilets, the dining room, fitted kitchen, paved outdoor area, garden and the gated entrance. The footer credit line is generated from the media credit fields. The homepage mosaic renders one photograph from each category, in this order: exterior, lounge, bedrooms, dining, kitchen, garden. Additional photographs can stay in the media library and be surfaced later.

## Deployment notes

- Set every environment variable in the hosting platform. Never commit `.env`.
- Run Next.js on the same public origin as `NEXT_PUBLIC_SITE_URL`.
- Point Cloudflare R2 at a public custom domain and set `R2_PUBLIC_URL` to it.
- The Payload SQLite adapter currently uses `push: true` so the schema follows the collections automatically. For a long-lived production database, generate and apply Payload migrations instead, then disable push.
- The site uses Next.js Cache Components and Partial Prefetching. The home route is dynamically streamed because availability must stay live.

## Key files

```text
src/payload.config.ts                       Payload config, SQLite/Turso, R2
src/collections/                            Content collections and hooks
src/globals/PricingSettings.ts              Base rates and banner
src/features/home/home-data.ts              Server query for all public data
src/features/booking/booking-actions.ts     Validated reservation creation
src/features/enquiries/enquiry-actions.ts   Contact enquiry creation
src/features/booking/booking-engine.tsx     Booking UI and price summary
src/lib/pricing.ts                          Special and quote rules
src/lib/availability.ts                     Calendar and conflict logic
src/lib/ical/sync.ts                        Inbound OTA feed sync and upserts
src/lib/ical/export.ts                      RFC 5545 availability calendar
src/app/api/cron/sync-ical/route.ts         Protected sync endpoint
src/app/api/calendar/export.ics/route.ts    Public/tokenized outbound feed
src/app/llms.txt/route.ts                   Concise LLM index (llms.txt standard)
src/app/llms-full.txt/route.ts              Comprehensive LLM property guide
src/app/robots.ts                           Search & AI crawler rules
src/app/sitemap.ts                          XML & image sitemap
src/app/manifest.ts                         Web application manifest
src/app/(frontend)/opengraph-image.tsx      Generated 1200x630 Open Graph card
src/app/(frontend)/twitter-image.tsx        Generated 1200x630 X/Twitter card
src/app/(frontend)/apple-icon.tsx           Generated 180x180 Apple touch icon
src/components/site/faq-section.tsx         On-page AEO FAQ accordion
src/lib/llms.ts                             Live Markdown builder for LLMs
src/app/(frontend)/globals.css              Design tokens and page system
src/scripts/seed.ts                         Safe blank-database seed
src/scripts/sync-ical.ts                    Manual sync command
```
