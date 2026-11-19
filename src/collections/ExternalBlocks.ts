import type { CollectionConfig } from 'payload'

export const ExternalBlocks: CollectionConfig = {
  slug: 'external-blocks',
  labels: {
    singular: 'External block',
    plural: 'External blocks',
  },
  admin: {
    useAsTitle: 'externalUid',
    group: 'Front desk',
    defaultColumns: [
      'source',
      'startDate',
      'endDate',
      'summary',
      'externalUid',
    ],
    description:
      'Reservations pulled from OTA iCal feeds. These are maintained by the sync service; edit them at the source (Airbnb, Booking.com) instead of here.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'source',
      type: 'relationship',
      label: 'Calendar source',
      relationTo: 'calendar-sources',
      required: true,
      index: true,
    },
    {
      name: 'externalUid',
      type: 'text',
      label: 'External UID',
      required: true,
      index: true,
      admin: {
        description:
          'The VEVENT UID from the OTA feed. It makes repeated syncs idempotent and lets cancellations reopen dates.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Check-in',
          required: true,
          index: true,
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' },
            description: 'The first night the property is occupied.',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Check-out',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' },
            description:
              'Exclusive check-out date, exactly as the OTA sends DTEND. The night before this date is the last occupied night.',
          },
        },
      ],
    },
    {
      name: 'summary',
      type: 'text',
      label: 'Summary',
      admin: {
        description: 'The OTA summary, for example "Reserved" or "Not available".',
      },
    },
    {
      name: 'rawEvent',
      type: 'json',
      label: 'Raw event',
      admin: {
        description: 'The parsed VEVENT, kept for debugging.',
      },
    },
  ],
}
