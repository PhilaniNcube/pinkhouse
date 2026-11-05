import type { CollectionConfig } from 'payload'

export const ContactEnquiries: CollectionConfig = {
  slug: 'contact-enquiries',
  labels: {
    singular: 'Enquiry',
    plural: 'Enquiries',
  },
  admin: {
    useAsTitle: 'fullName',
    group: 'Front desk',
    defaultColumns: ['fullName', 'topic', 'preferredDate', 'status', 'createdAt'],
    description: 'Messages sent from the contact form on the website.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'fullName',
          type: 'text',
          label: 'Full name',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone number',
          required: true,
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email address',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'topic',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Accommodation availability',
              value: 'accommodation',
            },
            { label: 'Function package', value: 'function' },
            { label: 'Current specials', value: 'specials' },
            { label: 'Day service or shoot quote', value: 'day-service' },
            { label: 'General question', value: 'general' },
          ],
        },
        {
          name: 'preferredDate',
          type: 'date',
          label: 'Preferred date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'dd MMM yyyy',
            },
          },
        },
      ],
    },
    {
      name: 'interestedSpecial',
      type: 'relationship',
      label: 'Interested in special',
      relationTo: 'specials',
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Enquiry status',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Replied', value: 'replied' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Follow-up notes',
      admin: {
        description: 'Private notes for Mrs Ncube. Not shown on the website.',
      },
    },
  ],
}
