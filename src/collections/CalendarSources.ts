import type { CollectionConfig } from 'payload'

export const CalendarSources: CollectionConfig = {
  slug: 'calendar-sources',
  labels: {
    singular: 'Calendar source',
    plural: 'Calendar sources',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Integrations',
    defaultColumns: [
      'name',
      'provider',
      'isActive',
      'lastSyncedAt',
      'lastSyncStatus',
    ],
    description:
      'External OTA iCal feeds (Airbnb, Booking.com and others). The sync service pulls reservations from these feeds and reopens dates when they disappear.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        // Orphaned blocks would keep dates closed forever, so remove the
        // reservations that belong to this feed with it.
        await req.payload.delete({
          collection: 'external-blocks',
          where: { source: { equals: id } },
          overrideAccess: true,
          req,
        })
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: true,
          admin: {
            description:
              'A friendly label, for example "Airbnb main listing".',
          },
        },
        {
          name: 'provider',
          type: 'select',
          label: 'Provider',
          required: true,
          defaultValue: 'airbnb',
          index: true,
          options: [
            { label: 'Airbnb', value: 'airbnb' },
            { label: 'Booking.com', value: 'booking' },
            { label: 'Other OTA', value: 'other' },
          ],
        },
      ],
    },
    {
      name: 'icalUrl',
      type: 'text',
      label: 'iCal feed URL',
      required: true,
      admin: {
        description:
          'The private .ics export link from the OTA. This URL often contains a secret token, so treat it as a password. When AIRBNB_ICAL_URL or BOOKING_ICAL_URL is set, the sync service keeps the matching environment-managed source up to date.',
      },
    },
    {
      name: 'envKey',
      type: 'select',
      label: 'Linked environment variable',
      index: true,
      admin: {
        readOnly: true,
        description:
          'Set automatically for feeds created from AIRBNB_ICAL_URL or BOOKING_ICAL_URL. Leave blank for feeds added by hand.',
      },
      options: [
        { label: 'AIRBNB_ICAL_URL', value: 'airbnb' },
        { label: 'BOOKING_ICAL_URL', value: 'booking' },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Include in sync',
      defaultValue: true,
      index: true,
      admin: {
        description:
          'Turn this off to pause a feed without deleting its stored blocks.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'lastSyncedAt',
          type: 'date',
          label: 'Last synced',
          admin: {
            readOnly: true,
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'dd MMM yyyy HH:mm',
            },
          },
        },
        {
          name: 'lastSyncStatus',
          type: 'select',
          label: 'Last sync status',
          admin: { readOnly: true },
          options: [
            { label: 'Success', value: 'success' },
            { label: 'Error', value: 'error' },
          ],
        },
      ],
    },
    {
      name: 'lastError',
      type: 'textarea',
      label: 'Last error',
      admin: {
        readOnly: true,
        description: 'The most recent sync failure, if any.',
      },
    },
  ],
}
