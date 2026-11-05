export const SITE = {
  name: 'The Pink House',
  wordmark: 'The Pink House',
  address: '2007 Makoni St, Mainway Meadows, Waterfalls, Harare',
  area: 'Mainway Meadows, Waterfalls, Harare',
  host: 'Mrs Ncube',
  phoneDisplay: '0772 964 425',
  phoneHref: 'tel:+263772964425',
  whatsappHref:
    'https://wa.me/263772964425?text=Hello%20Mrs%20Ncube%2C%20I%20would%20like%20to%20enquire%20about%20The%20Pink%20House.',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=2007+Makoni+St%2C+Mainway+Meadows%2C+Waterfalls%2C+Harare',
  standardAccommodationRate: 80,
  standardFunctionRate: 150,
  functionMaxGuests: 30,
} as const

export const NAV_ITEMS = [
  { href: '#the-house', label: 'The House' },
  { href: '#functions', label: 'Functions' },
  { href: '#day-services', label: 'Day Services' },
  { href: '#specials', label: 'Specials' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#booking', label: 'Check Availability' },
  { href: '#contact', label: 'Contact Us' },
] as const
