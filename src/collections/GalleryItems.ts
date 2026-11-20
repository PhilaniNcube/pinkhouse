import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'

const revalidateGalleryCache = () => {
  try {
    revalidateTag('gallery', 'max')
  } catch {
    // Ignore outside Next.js request context (e.g. CLI seed script)
  }
}

export const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  labels: {
    singular: 'Gallery photograph',
    plural: 'Gallery photographs',
  },
  admin: {
    useAsTitle: 'title',
    group: 'House office',
    defaultColumns: ['title', 'category', 'displayOrder'],
    description:
      'Photographs shown in the mosaic gallery. The room, garden and gate shots belong here.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [() => revalidateGalleryCache()],
    afterDelete: [() => revalidateGalleryCache()],
  },
  defaultSort: 'displayOrder',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Exterior', value: 'exterior' },
        { label: 'Lounge', value: 'lounge' },
        { label: 'Bedrooms', value: 'bedrooms' },
        { label: 'Dining', value: 'dining' },
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Garden', value: 'garden' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Photograph',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'displayOrder',
      type: 'number',
      label: 'Display order',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
