import path from 'node:path'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { resendAdapter } from '@payloadcms/email-resend'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { AvailabilityBlocks } from './collections/AvailabilityBlocks'
import { Bookings } from './collections/Bookings'
import { CalendarSources } from './collections/CalendarSources'
import { ContactEnquiries } from './collections/ContactEnquiries'
import { ExternalBlocks } from './collections/ExternalBlocks'
import { GalleryItems } from './collections/GalleryItems'
import { Media } from './collections/Media'
import { Specials } from './collections/Specials'
import { Users } from './collections/Users'
import { PricingSettings } from './globals/PricingSettings'
import {
  getResendFromAddress,
  getResendFromName,
} from './lib/email/config'

const siteURL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thepinkhouse.co.zw'
const resendApiKey = process.env.RESEND_API_KEY?.trim()
const r2Bucket = process.env.R2_BUCKET
const r2Endpoint = process.env.R2_ENDPOINT
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const r2Enabled = Boolean(
  r2Bucket && r2Endpoint && r2AccessKeyId && r2SecretAccessKey,
)

const publicMediaBase = (
  process.env.R2_PUBLIC_URL ||
  (r2Endpoint && r2Bucket ? `${r2Endpoint.replace(/\/$/, '')}/${r2Bucket}` : '')
).replace(/\/$/, '')

export default buildConfig({
  serverURL: siteURL,
  secret: process.env.PAYLOAD_SECRET || '',
  telemetry: false,
  sharp,
  email: resendApiKey
    ? resendAdapter({
        apiKey: resendApiKey,
        defaultFromAddress: getResendFromAddress(),
        defaultFromName: getResendFromName(),
      })
    : undefined,
  admin: {
    user: Users.slug,
    theme: 'light',
    meta: {
      titleSuffix: ' | The Pink House',
      description: 'The Pink House, Waterfalls, Harare',
    },
  },
  collections: [
    Users,
    Media,
    Specials,
    Bookings,
    ContactEnquiries,
    AvailabilityBlocks,
    CalendarSources,
    ExternalBlocks,
    GalleryItems,
  ],
  globals: [PricingSettings],
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./pinkhouse.db',
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    },
    push: true,
    wal: !process.env.DATABASE_URI?.startsWith('libsql://'),
  }),
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src/payload-types.ts'),
  },
  plugins: [
    s3Storage({
      enabled: r2Enabled,
      bucket: r2Bucket || 'the-pink-house',
      collections: {
        media: {
          prefix: 'media',
          generateFileURL: ({ filename, prefix }) => {
            const key = [prefix, filename].filter(Boolean).join('/')
            return `${publicMediaBase}/${key}`
          },
        },
      },
      config: {
        region: 'auto',
        endpoint: r2Endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: r2AccessKeyId || '',
          secretAccessKey: r2SecretAccessKey || '',
        },
      },
    }),
  ],
})
