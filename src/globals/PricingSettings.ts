import type { GlobalConfig } from 'payload'

export const PricingSettings: GlobalConfig = {
  slug: 'pricing-settings',
  label: 'Rates & website banner',
  admin: {
    group: 'Offers & rates',
    description:
      'The standard property rates and the announcement strip at the top of the website.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'accommodationNightlyRateUSD',
          type: 'number',
          label: 'Accommodation rate per night (USD)',
          required: true,
          defaultValue: 80,
          min: 0,
        },
        {
          name: 'functionBaseRateUSD',
          type: 'number',
          label: 'Function venue rate (USD)',
          required: true,
          defaultValue: 150,
          min: 0,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'functionMaxGuests',
          type: 'number',
          label: 'Maximum function guests',
          required: true,
          defaultValue: 30,
          min: 1,
          max: 100,
        },
        {
          name: 'dayServiceStartingRateUSD',
          type: 'number',
          label: 'Day service starting rate (USD)',
          min: 0,
          admin: {
            description:
              'Optional. When set, the booking engine shows this as the starting day rate.',
          },
        },
      ],
    },
    {
      name: 'showSpecialsBanner',
      type: 'checkbox',
      label: 'Show the specials banner',
      defaultValue: true,
    },
    {
      name: 'bannerHeadline',
      type: 'text',
      label: 'Banner headline',
      admin: {
        description:
          'The announcement strip copy. Keep it short enough for a phone screen.',
      },
    },
    {
      name: 'featuredSpecial',
      type: 'relationship',
      label: 'Featured special',
      relationTo: 'specials',
      admin: {
        description: 'The special the banner link points to.',
      },
    },
  ],
}
