import path from 'node:path'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Photograph',
    plural: 'Photographs',
  },
  admin: {
    group: 'House office',
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'credit', 'mimeType', 'filesize'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'public/media'),
    mimeTypes: ['image/*'],
    adminThumbnail: 'thumbnail',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
        height: 360,
        position: 'centre',
      },
      {
        name: 'card',
        width: 960,
        withoutEnlargement: true,
      },
      {
        name: 'wide',
        width: 1920,
        withoutEnlargement: true,
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Description for screen readers',
      required: true,
      admin: {
        description: 'Say what is in the photograph. This is used as the alt text.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Photographer or source',
      admin: {
        description: 'Kept for the photograph credit line in the website footer.',
      },
    },
    {
      name: 'creditUrl',
      type: 'text',
      label: 'Credit link',
      admin: {
        description: 'Optional link to the photographer or licence page.',
      },
    },
  ],
}
