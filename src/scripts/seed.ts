import 'dotenv/config'

import path from 'node:path'
import { getPayload } from 'payload'

import config from '../payload.config'

type SeedImage = {
  file: string
  alt: string
  credit: string
  creditUrl: string
}

type SeedGalleryItem = {
  title: string
  category: 'exterior' | 'lounge' | 'bedrooms' | 'dining' | 'kitchen' | 'garden'
  displayOrder: number
  image: SeedImage
}

const seedGallery: SeedGalleryItem[] = [
  {
    title: 'The house and its garden',
    category: 'exterior',
    displayOrder: 1,
    image: {
      file: 'country-gate.jpg',
      alt: 'A warm stone house behind a white garden gate, with pink roses in bloom',
      credit: 'Julian Paren',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Entrance_gate_to_the_front_of_Tarradale_House_-_geograph.org.uk_-_4704744.jpg',
    },
  },
  {
    title: 'The chandelier lounge',
    category: 'lounge',
    displayOrder: 2,
    image: {
      file: 'lounge.jpg',
      alt: 'A calm lounge with teak furniture, cane chairs and tall shuttered doors',
      credit: 'Basile Morin',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Lobby_lounge_of_Amantaka_Suite_Amantaka_luxury_Resort_%26_Hotel_Luang_Prabang_Laos.jpg',
    },
  },
  {
    title: 'Main bedroom, en-suite',
    category: 'bedrooms',
    displayOrder: 3,
    image: {
      file: 'bedroom.jpg',
      alt: 'A made-up four-poster bed with white linen and soft bedside light',
      credit: 'Basile Morin',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Canopy_bed_of_Amantaka_Suite_in_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos_5x4.jpg',
    },
  },
  {
    title: 'The dining room',
    category: 'dining',
    displayOrder: 4,
    image: {
      file: 'dining-room.jpg',
      alt: 'A round dining table set with white cloth and woven chairs in a bright room',
      credit: 'Basile Morin',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Restaurant_room_of_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos.jpg',
    },
  },
  {
    title: 'The fitted kitchen',
    category: 'kitchen',
    displayOrder: 5,
    image: {
      file: 'kitchen-white.jpg',
      alt: 'A bright fitted kitchen with white cabinetry and a long stone counter',
      credit: 'Rickson93',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Countertop_in_a_white_kitchen.jpg',
    },
  },
  {
    title: 'The neat garden',
    category: 'garden',
    displayOrder: 6,
    image: {
      file: 'garden-lawn.jpg',
      alt: 'A wide green lawn framed by mature trees and flowering shrubs',
      credit: 'Acabashi',
      creditUrl:
        'https://commons.wikimedia.org/wiki/File:Myddelton_House,_Enfield,_London_-_front_lawn_and_garden_01.jpg',
    },
  },
]

const today = new Date()
const day = (offset: number) => {
  const date = new Date(today)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString()
}

const validFrom = day(-30)
const validUntil = day(210)

async function upsertMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  image: SeedImage,
): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: image.alt } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs[0]) return existing.docs[0].id

  const created = await payload.create({
    collection: 'media',
    data: {
      alt: image.alt,
      credit: image.credit,
      creditUrl: image.creditUrl,
    },
    filePath: path.resolve(process.cwd(), 'public/photos', image.file),
  })

  return created.id
}

async function seed() {
  const payload = await getPayload({ config })

  const users = await payload.find({ collection: 'users', limit: 1, depth: 0 })
  if (!users.docs.length) {
    const email = process.env.SEED_ADMIN_EMAIL
    const password = process.env.SEED_ADMIN_PASSWORD
    if (!email || !password) {
      throw new Error(
        'Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before seeding the first admin user.',
      )
    }
    await payload.create({
      collection: 'users',
      data: {
        name: process.env.SEED_ADMIN_NAME || 'Mrs Ncube',
        email,
        password,
      },
    })
    console.log(`Created admin user ${email}. Change the password after first login.`)
  } else {
    console.log('Admin user already exists, leaving it untouched.')
  }

  const galleryPosts = []
  for (const item of seedGallery) {
    const imageId = await upsertMedia(payload, item.image)
    const existing = await payload.find({
      collection: 'gallery-items',
      where: { title: { equals: item.title } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs[0]) {
      galleryPosts.push(existing.docs[0])
    } else {
      const created = await payload.create({
        collection: 'gallery-items',
        data: {
          title: item.title,
          category: item.category,
          image: imageId,
          displayOrder: item.displayOrder,
        },
      })
      galleryPosts.push(created)
    }
  }
  console.log(`Prepared ${galleryPosts.length} gallery photographs.`)

  async function upsertSpecial(slug: string, data: Record<string, unknown>) {
    const existing = await payload.find({
      collection: 'specials',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) return existing.docs[0]
    return payload.create({
      collection: 'specials',
      data: data as never,
    })
  }

  const extendedStay = await upsertSpecial('extended-stay-special', {
    title: 'The Extended Stay',
    slug: 'extended-stay-special',
    promoCode: 'PINKSTAY3',
    category: 'accommodation',
    pricingRule: 'amount-off',
    standardPriceUSD: 240,
    specialPriceUSD: 210,
    discountValue: 30,
    minNights: 3,
    validFrom,
    validUntil,
    badgeText: 'Save $30',
    description:
      'Three nights or more in the full house, with $30 off the stay.',
    termsAndConditions:
      'Minimum three nights. Subject to availability. Cannot be combined with another offer.',
    isActive: true,
  })

  const celebrationBundle = await upsertSpecial('celebration-stay-bundle', {
    title: 'The Celebration & Stay',
    slug: 'celebration-stay-bundle',
    promoCode: 'BUNDLE30',
    category: 'bundle',
    pricingRule: 'fixed-special-price',
    standardPriceUSD: 230,
    specialPriceUSD: 195,
    discountValue: 35,
    minNights: 1,
    validFrom,
    validUntil,
    badgeText: 'Save $35',
    description:
      'An outdoor function for up to 30 guests, plus one night in the house.',
    termsAndConditions:
      'One function date and one night in the house. Subject to availability. Venue hire includes up to 30 guests.',
    isActive: true,
  })

  await upsertSpecial('midweek-day-special', {
    title: 'The Midweek Day',
    slug: 'midweek-day-special',
    promoCode: 'MIDWEEK',
    category: 'day-service',
    pricingRule: 'fixed-special-price',
    standardPriceUSD: 100,
    specialPriceUSD: 75,
    discountValue: 25,
    validFrom,
    validUntil,
    badgeText: 'Midweek Offer',
    description:
      'A weekday rate for shoots, seminars and small services.',
    termsAndConditions:
      'Monday to Friday, subject to availability. Quoted for your hours and set-up. Cannot be combined with another offer.',
    isActive: true,
  })
  console.log('Prepared 3 active specials.')

  const settings = await payload.findGlobal({
    slug: 'pricing-settings',
    depth: 0,
  })

  const shouldUpdateSettings =
    process.argv.includes('--reset') || !settings?.bannerHeadline

  if (shouldUpdateSettings) {
    await payload.updateGlobal({
      slug: 'pricing-settings',
      data: {
        accommodationNightlyRateUSD: 80,
        functionBaseRateUSD: 150,
        functionMaxGuests: 30,
        dayServiceStartingRateUSD: null,
        showSpecialsBanner: true,
        bannerHeadline:
          'Book a function and a night, from $195.',
        featuredSpecial: celebrationBundle.id,
      },
    })
    console.log('Saved the standard rates and banner settings.')
  } else {
    console.log('Pricing settings already configured, leaving them untouched.')
  }

  const blocks = await payload.find({
    collection: 'availability-blocks',
    limit: 1,
    depth: 0,
  })
  if (!blocks.docs.length) {
    await payload.create({
      collection: 'availability-blocks',
      data: {
        title: 'Garden maintenance (sample block)',
        startDate: day(35),
        endDate: day(36),
        blockScope: 'outdoor-only',
      },
    })
    console.log('Added a sample garden availability block, 35 days from today.')
  }

  console.log('')
  console.log('The Pink House is ready.')
  console.log(`Frontend: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`)
  console.log('Admin:    http://localhost:3000/admin')
  console.log(`Featured special: ${celebrationBundle.title}`)
  console.log(`Extended stay: ${extendedStay.title}`)
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
