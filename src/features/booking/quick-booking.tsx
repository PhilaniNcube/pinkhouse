'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { CalendarDays, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  addDays,
  formatDate,
  type ISODate,
} from '@/lib/dates'
import {
  currency,
  type BookingType,
  type PublicSpecial,
  type SitePricing,
} from '@/lib/pricing'

type QuickType = 'accommodation' | 'function' | 'day-service' | 'special'

interface QuickBookingProps {
  pricing: SitePricing
  specials: PublicSpecial[]
  suggestedStay: { checkIn: string; checkOut: string } | null
  suggestedFunctionDate: string | null
  today: string
  defaultCheckIn: string
  defaultCheckOut: string
}

interface BookingEventDetail {
  bookingType: BookingType
  checkInDate: ISODate
  checkOutDate?: ISODate | null
  guestCount: number
  specialId?: number | null
}

const quickTypes: Array<{ value: QuickType; label: string; meta: string }> = [
  { value: 'accommodation', label: 'Overnight stay', meta: 'from $80' },
  { value: 'function', label: 'Outdoor function', meta: '$150' },
  { value: 'day-service', label: 'Day service', meta: 'by quote' },
  { value: 'special', label: 'Special packages', meta: 'current offers' },
]

function bookingTypeForSpecial(special: PublicSpecial): BookingType {
  if (special.category === 'accommodation') return 'accommodation'
  if (special.category === 'function') return 'function'
  if (special.category === 'day-service') return 'day-service'
  return 'special-bundle'
}

function deriveQuickType(type: QuickType, special: PublicSpecial | null): BookingType {
  if (type === 'special') {
    return special ? bookingTypeForSpecial(special) : 'special-bundle'
  }
  return type
}

export function QuickBooking({
  pricing,
  specials,
  suggestedStay,
  suggestedFunctionDate,
  today,
  defaultCheckIn,
  defaultCheckOut,
}: QuickBookingProps) {
  const [type, setType] = useState<QuickType>('accommodation')
  const [checkIn, setCheckIn] = useState(defaultCheckIn)
  const [checkOut, setCheckOut] = useState(defaultCheckOut)
  const [guests, setGuests] = useState('4')
  const [specialId, setSpecialId] = useState(() =>
    String(specials[0]?.id ?? ''),
  )
  const [error, setError] = useState('')

  const selectedSpecial = useMemo(
    () => specials.find((special) => String(special.id) === specialId) ?? null,
    [specialId, specials],
  )

  const resolvedType = deriveQuickType(type, selectedSpecial)
  const showsCheckout =
    resolvedType === 'accommodation' &&
    (type !== 'special' || selectedSpecial?.category === 'accommodation')
  const firstNight = addDays(today, 1)
  const cheapestSpecial = useMemo(() => {
    if (!specials.length) return null
    return [...specials].sort(
      (a, b) => a.specialPriceUSD - b.specialPriceUSD,
    )[0]
  }, [specials])

  const cheapestStaySpecial = useMemo(() => {
    const stays = specials.filter(
      (special) => special.category === 'accommodation',
    )
    if (!stays.length) return null
    return [...stays].sort(
      (a, b) => a.specialPriceUSD - b.specialPriceUSD,
    )[0]
  }, [specials])

  function selectType(next: QuickType) {
    setType(next)
    setError('')
    if (next === 'function' && suggestedFunctionDate) {
      setCheckIn(suggestedFunctionDate)
      setCheckOut('')
    }
    if (next === 'accommodation') {
      setCheckIn(suggestedStay?.checkIn ?? defaultCheckIn)
      setCheckOut(suggestedStay?.checkOut ?? defaultCheckOut)
    }
    if (next === 'special' && specials[0]) {
      const first = specials[0]
      setSpecialId(String(first.id))
      setCheckOut(
        first.category === 'accommodation'
          ? addDays(checkIn || today, first.minNights ?? 1)
          : '',
      )
    }
    if (next === 'day-service') {
      setCheckOut('')
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!checkIn) {
      setError('Choose a date for your booking.')
      return
    }
    if (showsCheckout && (!checkOut || checkOut <= checkIn)) {
      setError('Choose a check-out date after your arrival.')
      return
    }
    if (type === 'special' && !selectedSpecial) {
      setError('Choose a special first.')
      return
    }

    const detail: BookingEventDetail = {
      bookingType: resolvedType,
      checkInDate: checkIn,
      checkOutDate: showsCheckout
        ? checkOut
        : resolvedType === 'special-bundle'
          ? addDays(checkIn, 1)
          : null,
      guestCount: Math.min(
        pricing.functionMaxGuests,
        Math.max(1, Number(guests) || 1),
      ),
      specialId: selectedSpecial?.id ?? null,
    }

    window.dispatchEvent(
      new CustomEvent<BookingEventDetail>('pinkhouse:book', { detail }),
    )

    document.getElementById('booking')?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="quick-booking-wrap">
      <div className="container">
        <form className="quick-booking" onSubmit={submit}>
          <div className="quick-booking__tabs" role="group" aria-label="Booking type">
            {quickTypes.map((item) => (
              <button
                key={item.value}
                type="button"
                className="quick-booking__tab"
                data-active={type === item.value ? 'true' : undefined}
                aria-pressed={type === item.value}
                onClick={() => selectType(item.value)}
              >
                <span>{item.label}</span>
                <small>
                  {item.value === 'accommodation' && cheapestStaySpecial
                    ? `from ${currency(cheapestStaySpecial.specialPriceUSD / Math.max(1, cheapestStaySpecial.minNights ?? 1))}`
                    : item.value === 'special' && cheapestSpecial
                      ? `from ${currency(cheapestSpecial.specialPriceUSD)}`
                      : item.value === 'function'
                        ? currency(pricing.functionBaseRateUSD)
                        : item.value === 'day-service'
                          ? 'by quote'
                          : item.meta}
                </small>
              </button>
            ))}
          </div>

          <div className="quick-booking__fields">
            <div className="quick-booking__field">
              <Label htmlFor="quick-check-in">
                {resolvedType === 'function' ||
                resolvedType === 'day-service' ||
                resolvedType === 'special-bundle'
                  ? 'Event date'
                  : 'Check-in'}
              </Label>
              <div className="field-with-icon date-field">
                <CalendarDays aria-hidden="true" size={16} strokeWidth={1.6} />
                <Input
                  id="quick-check-in"
                  name="quickCheckIn"
                  type="date"
                  min={firstNight}
                  value={checkIn}
                  onChange={(event) => {
                    setCheckIn(event.target.value)
                    if (showsCheckout && checkOut && event.target.value >= checkOut) {
                      setCheckOut('')
                    }
                  }}
                  required
                  className="num"
                />
                <span className="date-display" aria-hidden="true">
                  {checkIn
                    ? formatDate(checkIn, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Choose a date'}
                </span>
              </div>
            </div>

            {showsCheckout ? (
              <div className="quick-booking__field">
                <Label htmlFor="quick-check-out">Check-out</Label>
                <div className="field-with-icon date-field">
                  <CalendarDays aria-hidden="true" size={16} strokeWidth={1.6} />
                  <Input
                    id="quick-check-out"
                    name="quickCheckOut"
                    type="date"
                    min={checkIn ? addDays(checkIn, 1) : firstNight}
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                    required
                    className="num"
                  />
                  <span className="date-display" aria-hidden="true">
                    {checkOut
                      ? formatDate(checkOut, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Choose a date'}
                  </span>
                </div>
              </div>
            ) : null}

            {type === 'special' ? (
              <div className="quick-booking__field quick-booking__field--special">
                <Label htmlFor="quick-special">Special</Label>
                <select
                  id="quick-special"
                  className="ph-native-select"
                  value={specialId}
                  onChange={(event) => {
                    const next = specials.find(
                      (item) => String(item.id) === event.target.value,
                    )
                    setSpecialId(event.target.value)
                    setError('')
                    setCheckOut(
                      next?.category === 'accommodation'
                        ? addDays(checkIn || today, next.minNights ?? 1)
                        : '',
                    )
                  }}
                >
                  {specials.length ? null : (
                    <option value="">No active specials</option>
                  )}
                  {specials.map((special) => (
                    <option key={special.id} value={special.id}>
                      {special.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="quick-booking__field">
                <Label htmlFor="quick-guests">Guests</Label>
                <div className="field-with-icon">
                  <Users aria-hidden="true" size={16} strokeWidth={1.6} />
                  <Input
                    id="quick-guests"
                    name="quickGuests"
                    type="number"
                    min={1}
                    max={pricing.functionMaxGuests}
                    value={guests}
                    onChange={(event) => setGuests(event.target.value)}
                    inputMode="numeric"
                    required
                    className="num"
                  />
                </div>
              </div>
            )}

            {type === 'special' ? (
              <div className="quick-booking__field quick-booking__field--guests">
                <Label htmlFor="quick-special-guests">Guests</Label>
                <div className="field-with-icon">
                  <Users aria-hidden="true" size={16} strokeWidth={1.6} />
                  <Input
                    id="quick-special-guests"
                    name="quickSpecialGuests"
                    type="number"
                    min={1}
                    max={pricing.functionMaxGuests}
                    value={guests}
                    onChange={(event) => setGuests(event.target.value)}
                    inputMode="numeric"
                    required
                    className="num"
                  />
                </div>
              </div>
            ) : null}

            <div className="quick-booking__submit">
              <Button type="submit" size="large">
                Check availability & specials
              </Button>
            </div>
          </div>

          {error ? (
            <p className="quick-booking__error" aria-live="polite">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  )
}
