import type { CollectionConfig } from 'payload'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const Specials: CollectionConfig = {
  slug: 'specials',
  labels: {
    singular: 'Special',
    plural: 'Specials',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Offers & rates',
    defaultColumns: [
      'title',
      'category',
      'specialPriceUSD',
      'validUntil',
      'isActive',
    ],
    description:
      'Seasonal deals, multi-night discounts and function plus stay bundles shown on the website.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (!data.slug && data.title) data.slug = slugify(data.title)
        if (data.promoCode) data.promoCode = String(data.promoCode).toUpperCase().trim()
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'For example: Extended Stay Special.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Created from the title if left blank.',
      },
    },
    {
      name: 'promoCode',
      type: 'text',
      label: 'Promo code',
      admin: {
        position: 'sidebar',
        description: 'Optional. Guests can type this code in the booking engine.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Accommodation', value: 'accommodation' },
        { label: 'Outdoor function', value: 'function' },
        { label: 'Day service', value: 'day-service' },
        { label: 'Function and stay bundle', value: 'bundle' },
      ],
    },
    {
      name: 'pricingRule',
      type: 'select',
      label: 'Pricing rule',
      required: true,
      admin: {
        description:
          'How the special price is calculated against the standard rate.',
      },
      options: [
        { label: 'Fixed special price', value: 'fixed-special-price' },
        { label: 'Amount off', value: 'amount-off' },
        { label: 'Percentage off', value: 'percentage-off' },
        { label: 'Per-night override', value: 'per-night-override' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'standardPriceUSD',
          type: 'number',
          label: 'Standard price (USD)',
          required: true,
          min: 0,
          admin: {
            description: 'Shown crossed out on the special card.',
          },
        },
        {
          name: 'specialPriceUSD',
          type: 'number',
          label: 'Special price (USD)',
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: 'discountValue',
      type: 'number',
      label: 'Discount value',
      min: 0,
      admin: {
        description:
          'Dollars for an amount-off rule, or a percentage such as 15 for a percentage-off rule.',
      },
    },
    {
      name: 'minNights',
      type: 'number',
      label: 'Minimum nights',
      min: 0,
      admin: {
        description:
          'Accommodation specials with a minimum night count apply automatically once the stay is long enough.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'validFrom',
          type: 'date',
          label: 'Valid from',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'validUntil',
          type: 'date',
          label: 'Valid until',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    {
      name: 'badgeText',
      type: 'text',
      label: 'Gold badge text',
      required: true,
      admin: {
        description: 'A short label, for example: Save $35 or Limited Special.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'What is included in the special.',
      },
    },
    {
      name: 'termsAndConditions',
      type: 'textarea',
      label: 'Terms and conditions',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
