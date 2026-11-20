export const SITE = {
  name: 'The Pink House',
  wordmark: 'The Pink House',
  domain: 'www.thepinkhouse.co.zw',
  url: 'https://www.thepinkhouse.co.zw',
  tagline: 'Private 4-Bedroom Guesthouse & Intimate Garden Venue in Harare',
  description:
    'A private four-bedroom guesthouse and neat garden venue at 2007 Makoni St, Mainway Meadows, Waterfalls, Harare, Zimbabwe. Full-house overnight stays from $80 a night and outdoor functions for up to 30 guests from $150.',
  shortDescription:
    'A private four-bedroom guesthouse and intimate garden venue in Mainway Meadows, Waterfalls, Harare.',
  address: '2007 Makoni St, Mainway Meadows, Waterfalls, Harare',
  streetAddress: '2007 Makoni St',
  suburb: 'Mainway Meadows, Waterfalls',
  city: 'Harare',
  country: 'Zimbabwe',
  countryCode: 'ZW',
  area: 'Mainway Meadows, Waterfalls, Harare',
  coordinates: {
    latitude: -17.9189,
    longitude: 31.0458,
  },
  host: 'Mrs Ncube',
  email: 'mrs.ncube@thepinkhouse.co.zw',
  phoneDisplay: '0772 964 425',
  phoneE164: '+263772964425',
  phoneHref: 'tel:+263772964425',
  whatsappHref:
    'https://wa.me/263772964425?text=Hello%20Mrs%20Ncube%2C%20I%20would%20like%20to%20enquire%20about%20The%20Pink%20House.',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=2007+Makoni+St%2C+Mainway+Meadows%2C+Waterfalls%2C+Harare',
  standardAccommodationRate: 80,
  standardFunctionRate: 150,
  functionMaxGuests: 30,
  bedrooms: 4,
  accommodationMaxGuests: 8,
  currency: 'USD',
  locale: 'en_ZW',
} as const

export const NAV_ITEMS = [
  { href: '#the-house', label: 'The House' },
  { href: '#functions', label: 'Functions' },
  { href: '#day-services', label: 'Day Services' },
  { href: '#specials', label: 'Specials' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#booking', label: 'Check Availability' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact Us' },
] as const

export interface FaqItem {
  question: string
  answer: string
}

export const FAQS: readonly FaqItem[] = [
  {
    question: 'Where is The Pink House located in Harare?',
    answer:
      'The Pink House is located at 2007 Makoni Street, Mainway Meadows, Waterfalls, Harare, Zimbabwe. It sits on a quiet residential street with a secure gated perimeter and paved outdoor parking, easily reached from Harare city centre and Robert Gabriel Mugabe International Airport.',
  },
  {
    question: 'Do we get the whole house to ourselves when we book a stay?',
    answer:
      'Yes. Every overnight reservation gives your family or group exclusive use of the entire four-bedroom house, chandelier lounge, eight-seater dining room, fitted kitchen, paved yard and garden under one key. No indoor rooms are shared with other guests.',
  },
  {
    question: 'How many bedrooms and bathrooms does The Pink House have?',
    answer:
      'The house has four plush double bedrooms with fitted wardrobes, comfortably sleeping up to 8 overnight guests. The main bedroom is en-suite, and there are two additional toilets in the house, one of which includes a shower.',
  },
  {
    question: 'What are the rates for overnight stays and outdoor functions?',
    answer:
      'Standard full-house overnight accommodation is $80 USD per night. Standard outdoor garden and venue hire is $150 USD for up to 30 guests. Seasonal specials and bundle packages—such as multi-night stay discounts or combining an outdoor function with one night in the house—are available in the live booking calendar.',
  },
  {
    question: 'What types of events and functions can be hosted at The Pink House?',
    answer:
      'The neat garden and spacious paved outdoor area host intimate celebrations for up to 30 guests, including roora (lobola) and bride price ceremonies, family introductions, naming ceremonies, bridal showers, hen nights, bachelor parties, baby showers, birthdays and milestone gatherings.',
  },
  {
    question: 'Can we book The Pink House for daytime services or photo shoots?',
    answer:
      'Yes. The property is available by day for photo shoots, filming and video productions, seminars, workshops, small intimate church services and quiet daytime rest. Day rates are quoted around your hours and setup requirements, with midweek offers available.',
  },
  {
    question: 'Is the kitchen equipped for self-catering?',
    answer:
      'Yes. Guests have full use of a bright fitted kitchen equipped with a double-door fridge, stove, oven, microwave, kettle, countertop prep space and an adjacent eight-seater dining room.',
  },
  {
    question: 'How do reservations and payments work?',
    answer:
      'You can check live dates and submit a reservation request directly on www.thepinkhouse.co.zw, or contact the host, Mrs Ncube, by phone or WhatsApp on +263 772 964 425 (0772 964 425). No online card payment is taken on the website; your request receives a booking reference (such as PH-2026-0042) and Mrs Ncube confirms availability and payment arrangements directly with you.',
  },
] as const
