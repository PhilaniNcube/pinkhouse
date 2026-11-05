import type { CollectionConfig } from 'payload'

const yearInHarare = () =>
  new Intl.DateTimeFormat('en', {
    timeZone: 'Africa/Harare',
    year: 'numeric',
  }).format(new Date())

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: 'Reservation',
    plural: 'Reservations',
  },
  admin: {
    useAsTitle: 'bookingReference',
    group: 'Front desk',
    defaultColumns: [
      'bookingReference',
      'guestName',
      'checkInDate',
      'bookingType',
      'finalTotalUSD',
      'status',
    ],
    description:
      'Reservation requests received from the website. Confirm each request directly with the guest.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req, operation }) => {
        if (!data) return data

        if (data.checkInDate && data.checkOutDate) {
          const checkIn = new Date(data.checkInDate).getTime()
          const checkOut = new Date(data.checkOutDate).getTime()
          data.nightsCount = Math.max(
            1,
            Math.round((checkOut - checkIn) / 86_400_000),
          )
        } else if (!data.nightsCount) {
          data.nightsCount = 1
        }

        if (!data.bookingReference) {
          if (operation === 'update' && originalDoc?.bookingReference) {
            data.bookingReference = originalDoc.bookingReference
            return data
          }

          const result = await req.payload.count({
            collection: 'bookings',
            req,
          })

          let sequence = result.totalDocs + 1
          let reference = `PH-${yearInHarare()}-${String(sequence).padStart(4, '0')}`

          for (let attempt = 0; attempt < 20; attempt += 1) {
            const existing = await req.payload.find({
              collection: 'bookings',
              where: { bookingReference: { equals: reference } },
              limit: 1,
              depth: 0,
              req,
            })

            if (existing.totalDocs === 0) break
            sequence += 1
            reference = `PH-${yearInHarare()}-${String(sequence).padStart(4, '0')}`
          }

          data.bookingReference = reference
        }

        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Reservation',
          fields: [
            {
              name: 'bookingReference',
              type: 'text',
              label: 'Reference',
              unique: true,
              index: true,
              admin: {
                readOnly: true,
                position: 'sidebar',
                description: 'Generated automatically, for example PH-2026-0042.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'bookingType',
                  type: 'select',
                  label: 'Booking type',
                  required: true,
                  options: [
                    { label: 'Overnight accommodation', value: 'accommodation' },
                    { label: 'Outdoor function', value: 'function' },
                    { label: 'Day service', value: 'day-service' },
                    { label: 'Special or bundle', value: 'special-bundle' },
                  ],
                },
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'pending',
                  options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Confirmed', value: 'confirmed' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ],
                },
              ],
            },
            {
              name: 'eventCategory',
              type: 'select',
              label: 'Event category',
              required: true,
              options: [
                { label: 'Overnight stay', value: 'overnight-stay' },
                { label: 'Roora / bride price', value: 'roora' },
                { label: 'Introductions', value: 'introductions' },
                { label: 'Naming ceremony', value: 'naming-ceremony' },
                { label: 'Hen night', value: 'hen-night' },
                { label: 'Bachelor party', value: 'bachelor-party' },
                { label: 'Baby shower', value: 'baby-shower' },
                { label: 'Birthday', value: 'birthday' },
                { label: 'Seminar', value: 'seminar' },
                { label: 'Photo shoot', value: 'photo-shoot' },
                { label: 'Filming', value: 'filming' },
                { label: 'Small church service', value: 'church-service' },
                { label: 'Daytime rest', value: 'day-rest' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'checkInDate',
                  type: 'date',
                  label: 'Check-in or event date',
                  required: true,
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd MMM yyyy',
                    },
                  },
                },
                {
                  name: 'checkOutDate',
                  type: 'date',
                  label: 'Check-out date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd MMM yyyy',
                    },
                    description:
                      'Required for overnight stays. Leave blank for a function or day service.',
                  },
                  validate: (
                    value: unknown,
                    { siblingData }: { siblingData: Record<string, unknown> },
                  ) => {
                    const bookingType = siblingData?.bookingType
                    if (
                      (bookingType === 'accommodation' ||
                        bookingType === 'special-bundle') &&
                      !value
                    ) {
                      return 'A check-out date is required for an overnight stay or bundle.'
                    }
                    return true
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'nightsCount',
                  type: 'number',
                  label: 'Nights',
                  defaultValue: 1,
                  min: 1,
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'guestCount',
                  type: 'number',
                  label: 'Guests',
                  required: true,
                  min: 1,
                  max: 30,
                  defaultValue: 1,
                },
              ],
            },
            {
              name: 'appliedSpecial',
              type: 'relationship',
              label: 'Applied special',
              relationTo: 'specials',
            },
            {
              name: 'promoCodeUsed',
              type: 'text',
              label: 'Promo code used',
            },
          ],
        },
        {
          label: 'Guest & pricing',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'guestName',
                  type: 'text',
                  label: 'Guest name',
                  required: true,
                },
                {
                  name: 'guestPhone',
                  type: 'text',
                  label: 'Phone / WhatsApp',
                  required: true,
                },
              ],
            },
            {
              name: 'guestEmail',
              type: 'email',
              label: 'Email address',
            },
            {
              name: 'notes',
              type: 'textarea',
              label: 'Special requests or notes',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'standardSubtotalUSD',
                  type: 'number',
                  label: 'Standard subtotal (USD)',
                  required: true,
                  min: 0,
                },
                {
                  name: 'discountAmountUSD',
                  type: 'number',
                  label: 'Special discount (USD)',
                  defaultValue: 0,
                  min: 0,
                },
                {
                  name: 'finalTotalUSD',
                  type: 'number',
                  label: 'Final total (USD)',
                  required: true,
                  min: 0,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
