import type { CollectionConfig } from 'payload'

export const AvailabilityBlocks: CollectionConfig = {
  slug: 'availability-blocks',
  labels: {
    singular: 'Availability block',
    plural: 'Availability blocks',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Front desk',
    defaultColumns: ['title', 'startDate', 'endDate', 'blockScope'],
    description:
      'Block dates for phone bookings, private holds or maintenance. These dates cannot be booked on the website.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Reason',
      required: true,
      admin: {
        description: 'For example: Phone booking, Mrs Moyo Roora, or Maintenance.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Start date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'End date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayOnly' },
            description: 'The last date the property is unavailable.',
          },
        },
      ],
    },
    {
      name: 'blockScope',
      type: 'select',
      label: 'What is blocked',
      required: true,
      options: [
        { label: 'Full premises', value: 'full-premises' },
        { label: 'Accommodation only', value: 'accommodation-only' },
        { label: 'Outdoor venue only', value: 'outdoor-only' },
      ],
    },
    {
      name: 'linkedBooking',
      type: 'relationship',
      label: 'Linked reservation',
      relationTo: 'bookings',
      admin: {
        description: 'Optional. Link this block to the reservation it supports.',
      },
    },
  ],
}
