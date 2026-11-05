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
- Availability derived from confirmed and pending reservations plus manually entered availability blocks.
- Special pricing with automatic minimum-night offers, fixed package prices, amount-off, percentage-off and per-night override rules.
- Server-side availability and price calculation on submission. Client values are never trusted.
- A real reservation request workflow, no online payment. Each request receives a reference such as `PH-2026-0042` and starts in `pending`.
- A database-backed contact enquiry form for Mrs Ncube.
- Payload admin for rates, the announcement strip, specials, gallery, media, reservations, enquiries and blocked dates.
- SEO metadata, LodgingBusiness JSON-LD, a skip link and an accessible calendar and forms.

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
NEXT_PUBLIC_SITE_URL=https://thepinkhouse.co.zw
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
```

When all four non-public R2 values are present, the media collection uploads to R2 and file URLs use `R2_PUBLIC_URL`. The bucket must permit public reads, or you must serve it through a Cloudflare custom domain.

## Content model

Payload types are generated into `src/payload-types.ts` with `npm run generate:types`.

- **Pricing settings** (global): accommodation nightly rate, function rate and guest cap, optional day rate, banner toggle, banner copy and featured special.
- **Specials**: title, unique slug, optional promo code, category, pricing rule, standard/special prices, discount value, minimum nights, validity dates, badge text, description, terms and active state.
- **Bookings**: reference, booking type, event category, dates, nights, guest count, applied special, promo code, itemized totals, guest details, notes and status.
- **Contact enquiries**: contact details, topic, preferred date, optional interested special, message, status and private follow-up notes.
- **Availability blocks**: title, start/end dates and scope (`full-premises`, `accommodation-only`, `outdoor-only`).
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

## Commands

```bash
npm run dev          # local dev (add -p 3100 in this workspace)
npm run build        # production build
npm run start        # serve the production build
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run seed         # seed a blank database
npm run generate:types
npm run generate:importmap
```

## Photography handoff

The gallery is wired to Payload media and each item has a media credit. The repository includes licensed stand-in photography for the less specific rooms and garden; the media library already contains exterior and lounge photographs that can be used as the starting point.

Replace any remaining stand-in images in **Admin → Gallery photographs** with original photographs of the actual house: all four bedrooms, the two extra toilets, the dining room, fitted kitchen, paved outdoor area, garden and the gated entrance. The footer credit line is generated from the media credit fields.

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
src/app/(frontend)/globals.css              Design tokens and page system
src/scripts/seed.ts                         Safe blank-database seed
```
