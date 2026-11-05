'use client'

import {
  useEffect,
  useMemo,
  useState,
  useActionState,
  type FormEvent,
} from 'react'
import { CalendarDays, Check, Users } from 'lucide-react'

import { AvailabilityCalendar } from './availability-calendar'
import {
  createBookingAction,
  type BookingActionState,
} from './booking-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  addDays,
  formatDate,
  isAfter,
  monthOf,
  nightsBetween,
  todayISO,
  type ISODate,
} from '@/lib/dates'
import {
  findNextDate,
  findNextStay,
  isDateAvailable,
  isRangeAvailable,
  isStayAvailable,
  type AvailabilitySnapshot,
} from '@/lib/availability'
import {
  autoSpecialForStay,
  canApplySpecial,
  currency,
  EVENT_CATEGORIES,
  getQuote,
  isDateWithinSpecial,
  isRangeBooking,
  specialMatchesBookingType,
  type BookingEventCategory,
  type BookingType,
  type PublicSpecial,
  type SitePricing,
} from '@/lib/pricing'

interface BookingEngineProps {
  pricing: SitePricing
  specials: PublicSpecial[]
  availability: AvailabilitySnapshot
  suggestedStay: { checkIn: string; checkOut: string } | null
}

interface BookingEventDetail {
  bookingType?: BookingType
  checkInDate?: ISODate
  checkOutDate?: ISODate | null
  guestCount?: number
  specialId?: number | null
}

const initialState: BookingActionState = { status: 'idle' }

const bookingTypes: Array<{
  value: BookingType
  title: string
  meta: string
}> = [
  {
    value: 'accommodation',
    title: 'Overnight stay',
    meta: '$80 a night',
  },
  {
    value: 'function',
    title: 'Outdoor function',
    meta: '$150 venue hire',
  },
  {
    value: 'day-service',
    title: 'Day service',
    meta: 'Quoted for your day',
  },
  {
    value: 'special-bundle',
    title: 'Special package',
    meta: 'Bundle and save',
  },
]

const eventCategoryDefaults: Record<BookingType, BookingEventCategory> = {
  accommodation: 'overnight-stay',
  function: 'birthday',
  'day-service': 'seminar',
  'special-bundle': 'birthday',
}

export function BookingEngine({
  pricing,
  specials,
  availability,
  suggestedStay,
}: BookingEngineProps) {
  const today = todayISO()
  const fallbackStay =
    suggestedStay ??
    (() => {
      const next = findNextStay(availability, 1)
      return next ?? { checkIn: addDays(today, 1), checkOut: addDays(today, 2) }
    })()

  const [bookingType, setBookingType] = useState<BookingType>('accommodation')
  const [checkIn, setCheckIn] = useState<ISODate>(fallbackStay.checkIn)
  const [checkOut, setCheckOut] = useState<ISODate | null>(
    fallbackStay.checkOut,
  )
  const [guestCount, setGuestCount] = useState('4')
  const [specialChoice, setSpecialChoice] = useState('auto')
  const [promoCode, setPromoCode] = useState('')
  const [promoNotice, setPromoNotice] = useState<{
    status: 'success' | 'error'
    message: string
  } | null>(null)
  const [eventCategory, setEventCategory] =
    useState<BookingEventCategory>('overnight-stay')
  const [month, setMonth] = useState(monthOf(fallbackStay.checkIn))
  const [dateError, setDateError] = useState('')
  const [state, formAction, isPending] = useActionState(
    createBookingAction,
    initialState,
  )

  const matchingSpecials = useMemo(
    () =>
      specials.filter((special) =>
        specialMatchesBookingType(special, bookingType),
      ),
    [bookingType, specials],
  )

  const manualSpecial =
    specialChoice !== 'auto' && specialChoice !== 'none'
      ? matchingSpecials.find(
          (special) => String(special.id) === specialChoice,
        ) ?? null
      : null

  const autoSpecial = useMemo(() => {
    if (!checkIn) return null
    if (bookingType === 'accommodation') {
      return autoSpecialForStay(
        specials,
        bookingType,
        checkIn,
        checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 1,
        pricing,
      )
    }
    if (bookingType === 'special-bundle') {
      return (
        matchingSpecials.find((special) =>
          isDateWithinSpecial(special, checkIn),
        ) ?? null
      )
    }
    return null
  }, [
    bookingType,
    checkIn,
    checkOut,
    matchingSpecials,
    pricing,
    specials,
  ])

  const selectedSpecial =
    specialChoice === 'none'
      ? null
      : specialChoice === 'auto'
        ? autoSpecial
        : manualSpecial

  const quote = getQuote({
    bookingType,
    checkInDate: checkIn,
    checkOutDate: bookingType === 'special-bundle' ? addDays(checkIn, 1) : checkOut,
    guestCount: Math.max(1, Number(guestCount) || 1),
    special: selectedSpecial,
    pricing,
  })

  const manualSpecialIsValid =
    !manualSpecial ||
    canApplySpecial(manualSpecial, {
      bookingType,
      checkInDate: checkIn,
      guestCount: Number(guestCount) || 1,
      pricing,
      nights:
        bookingType === 'accommodation' && checkOut
          ? nightsBetween(checkIn, checkOut)
          : 1,
    })

  const showPrice =
    bookingType !== 'day-service' || Boolean(quote.appliedSpecial) || quote.standardSubtotalUSD > 0

  const selectedNights =
    bookingType === 'accommodation' && checkOut
      ? nightsBetween(checkIn, checkOut)
      : 1

  useEffect(() => {
    function handleBooking(event: Event) {
      const detail = (event as CustomEvent<BookingEventDetail>).detail
      if (!detail) return

      const nextType = detail.bookingType ?? 'accommodation'
      const nextSpecial = detail.specialId
        ? specials.find((special) => special.id === detail.specialId)
        : null
      const defaultDate =
        nextType === 'accommodation'
          ? (suggestedStay?.checkIn ??
            findNextStay(availability, 3)?.checkIn ??
            addDays(today, 1))
          : (findNextDate(availability, nextType) ?? addDays(today, 1))

      let nextCheckIn = detail.checkInDate || defaultDate
      let nextCheckOut: ISODate | null =
        detail.checkOutDate ??
        (nextType === 'accommodation'
          ? addDays(nextCheckIn, 3)
          : nextType === 'special-bundle'
            ? addDays(nextCheckIn, 1)
            : null)

      if (
        nextType === 'accommodation' &&
        (!nextCheckOut || !isAfter(nextCheckOut, nextCheckIn))
      ) {
        nextCheckOut = addDays(nextCheckIn, 3)
      }
      if (nextType === 'special-bundle') {
        nextCheckOut = addDays(nextCheckIn, 1)
      }
      if (nextType === 'function' || nextType === 'day-service') {
        nextCheckOut = null
      }

      if (
        nextType === 'accommodation' &&
        nextCheckOut &&
        !isStayAvailable(availability, nextCheckIn, nextCheckOut)
      ) {
        const openStay =
          findNextStay(availability, 3) ?? findNextStay(availability, 1)
        if (openStay) {
          nextCheckIn = openStay.checkIn
          nextCheckOut = openStay.checkOut
        }
      }

      if (
        nextType !== 'accommodation' &&
        !isDateAvailable(availability, nextType, nextCheckIn)
      ) {
        nextCheckIn = findNextDate(availability, nextType) ?? nextCheckIn
        nextCheckOut = nextType === 'special-bundle' ? addDays(nextCheckIn, 1) : null
      }

      setBookingType(nextType)
      setCheckIn(nextCheckIn)
      setCheckOut(nextCheckOut)
      setMonth(monthOf(nextCheckIn))
      setSpecialChoice(
        detail.specialId
          ? String(detail.specialId)
          : nextType === 'special-bundle'
            ? 'auto'
            : 'auto',
      )
      setPromoCode('')
      setPromoNotice(null)
      setDateError('')
      setEventCategory(eventCategoryDefaults[nextType])
      if (detail.guestCount) setGuestCount(String(detail.guestCount))
      if (nextSpecial) {
        setSpecialChoice(String(nextSpecial.id))
      }
    }

    window.addEventListener('pinkhouse:book', handleBooking)
    return () => window.removeEventListener('pinkhouse:book', handleBooking)
  }, [availability, specials, suggestedStay, today])

  function changeBookingType(next: BookingType) {
    setBookingType(next)
    setSpecialChoice('auto')
    setPromoCode('')
    setPromoNotice(null)
    setDateError('')
    setEventCategory(eventCategoryDefaults[next])

    if (next === 'accommodation') {
      const nextIn =
        checkIn && isDateAvailable(availability, 'accommodation', checkIn)
          ? checkIn
          : (findNextStay(availability, 3)?.checkIn ??
            findNextDate(availability, 'accommodation') ??
            addDays(today, 1))
      const desiredOut = checkOut && isAfter(checkOut, nextIn)
        ? checkOut
        : addDays(nextIn, 3)
      const safeOut = isStayAvailable(availability, nextIn, desiredOut)
        ? desiredOut
        : (findNextStay(availability, 3)?.checkOut ?? addDays(nextIn, 1))
      setCheckIn(nextIn)
      setCheckOut(safeOut)
      setMonth(monthOf(nextIn))
      return
    }

    if (next === 'special-bundle') {
      const defaultDate = findNextDate(availability, 'special-bundle')
      const nextIn =
        checkIn && isDateAvailable(availability, 'special-bundle', checkIn)
          ? checkIn
          : (defaultDate ?? addDays(today, 1))
      setCheckIn(nextIn)
      setCheckOut(addDays(nextIn, 1))
      setMonth(monthOf(nextIn))
      return
    }

    const defaultDate = findNextDate(availability, next)
    const nextIn =
      checkIn && isDateAvailable(availability, next, checkIn)
        ? checkIn
        : (defaultDate ?? addDays(today, 1))
    setCheckIn(nextIn)
    setCheckOut(null)
    setMonth(monthOf(nextIn))
  }

  function handleDateClick(date: ISODate) {
    setDateError('')
    if (!isDateAvailable(availability, bookingType, date)) return

    if (isRangeBooking(bookingType)) {
      if (!checkIn || (checkIn && checkOut) || !isAfter(date, checkIn)) {
        setCheckIn(date)
        setCheckOut(null)
        return
      }

      if (!isStayAvailable(availability, checkIn, date)) {
        setDateError(
          'One of those nights is already taken. Please choose a later check-out date.',
        )
        return
      }

      setCheckOut(date)
      return
    }

    setCheckIn(date)
    setCheckOut(
      bookingType === 'special-bundle' ? addDays(date, 1) : null,
    )
  }

  function applyPromoCode() {
    setPromoNotice(null)
    const code = promoCode.trim().toUpperCase()
    if (!code) {
      setPromoNotice({
        status: 'error',
        message: 'Type the promo code from the special.',
      })
      return
    }

    const match = specials.find(
      (special) => special.promoCode?.toUpperCase() === code,
    )
    if (!match) {
      setPromoNotice({
        status: 'error',
        message: 'That code is not active right now. Check the special details.',
      })
      return
    }

    if (!isDateWithinSpecial(match, checkIn)) {
      setPromoNotice({
        status: 'error',
        message: `This code is valid from ${formatDate(match.validFrom, {
          day: 'numeric',
          month: 'short',
        })} to ${formatDate(match.validUntil, {
          day: 'numeric',
          month: 'short',
        })}.`,
      })
      return
    }

    const targetType =
      match.category === 'accommodation'
        ? 'accommodation'
        : match.category === 'function'
          ? 'function'
          : match.category === 'day-service'
            ? 'day-service'
            : 'special-bundle'

    if (targetType !== bookingType) {
      changeBookingType(targetType)
    }

    if (
      targetType === 'accommodation' &&
      match.minNights &&
      selectedNights < match.minNights
    ) {
      setPromoNotice({
        status: 'error',
        message: `${match.title} needs at least ${match.minNights} nights. Choose a longer stay.`,
      })
      return
    }

    setSpecialChoice(String(match.id))
    setPromoNotice({
      status: 'success',
      message: `${match.title} applied. ${match.badgeText}.`,
    })
    if (targetType !== 'special-bundle') {
      setDateError('')
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (!checkIn) {
      event.preventDefault()
      setDateError('Choose a date in the calendar before sending your request.')
      return
    }
    if (
      (bookingType === 'accommodation' || bookingType === 'special-bundle') &&
      !checkOut
    ) {
      event.preventDefault()
      setDateError('Choose a check-out date before sending your request.')
      return
    }
    if (
      !isRangeAvailable(availability, bookingType, checkIn, checkOut)
    ) {
      event.preventDefault()
      setDateError(
        'Those dates are not available. Please choose another date.',
      )
    }
  }

  return (
    <div className="booking-engine">
      <div className="booking-engine__left">
        <div className="booking-types" role="group" aria-label="Service type">
          {bookingTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              className="booking-type"
              data-active={bookingType === type.value ? 'true' : undefined}
              aria-pressed={bookingType === type.value}
              onClick={() => changeBookingType(type.value)}
            >
              <span>{type.title}</span>
              <small>
                {type.value === 'accommodation'
                  ? currency(pricing.accommodationNightlyRateUSD)
                  : type.value === 'function'
                    ? currency(pricing.functionBaseRateUSD)
                    : type.value === 'day-service'
                      ? 'Quoted'
                      : 'From $195'}
              </small>
            </button>
          ))}
        </div>

        <div className="booking-calendar-label">
          <h3>Dates</h3>
        </div>

        <AvailabilityCalendar
          month={month}
          setMonth={setMonth}
          bookingType={bookingType}
          checkIn={checkIn}
          checkOut={checkOut}
          snapshot={availability}
          specials={specials}
          onDateClick={handleDateClick}
          error={dateError}
        />

        <div className="booking-offer">
          <div className="booking-offer__heading">
            <Label htmlFor="booking-special">Special or promo</Label>
          </div>

          <Select
            value={specialChoice}
            onValueChange={(value) => {
              setSpecialChoice(value)
              setPromoNotice(null)
              setDateError('')
            }}
          >
            <SelectTrigger id="booking-special" aria-label="Choose a special">
              <SelectValue placeholder="Choose a special" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Best eligible special</SelectItem>
              {matchingSpecials.map((special) => (
                <SelectItem key={special.id} value={String(special.id)}>
                  {special.title}
                </SelectItem>
              ))}
              {bookingType !== 'special-bundle' ? (
                <SelectItem value="none">Standard rate, no special</SelectItem>
              ) : null}
            </SelectContent>
          </Select>

          {manualSpecial && !manualSpecialIsValid ? (
            <p className="booking-offer__warning" role="status">
              {manualSpecial.title} does not fit these dates
              {manualSpecial.minNights
                ? `. Choose at least ${manualSpecial.minNights} nights.`
                : '.'}
            </p>
          ) : null}

          <div className="promo-row">
            <div className="promo-row__field">
              <Label htmlFor="booking-promo">Promo code</Label>
              <Input
                id="booking-promo"
                value={promoCode}
                onChange={(event) => {
                  setPromoCode(event.target.value.toUpperCase())
                  setPromoNotice(null)
                }}
                placeholder="PINKSTAY3"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={applyPromoCode}
              className="promo-row__button"
            >
              Apply code
            </Button>
          </div>
          {promoNotice ? (
            <p
              className={`promo-notice promo-notice--${promoNotice.status}`}
              role="status"
            >
              {promoNotice.message}
            </p>
          ) : null}
        </div>

        <div className="price-summary" aria-live="polite">
          <div className="price-summary__top">
            <span>
              {selectedNights} {selectedNights === 1 ? 'night' : 'nights'}
            </span>
            {quote.appliedSpecial ? (
              <span className="price-summary__badge">
                <Check aria-hidden="true" size={13} strokeWidth={2.2} />
                {quote.appliedSpecial.title}
              </span>
            ) : (
              <span className="price-summary__badge price-summary__badge--quiet">
                Standard rate
              </span>
            )}
          </div>

          <dl className="price-summary__lines">
            <div>
              <dt>{quote.standardLabel}</dt>
              <dd className="num">
                {showPrice ? currency(quote.standardSubtotalUSD) : 'On request'}
              </dd>
            </div>
            {quote.discountAmountUSD > 0 && quote.appliedSpecial ? (
              <div className="price-summary__discount">
                <dt>{quote.appliedSpecial.title}</dt>
                <dd className="num">
                  -{currency(quote.discountAmountUSD)}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="price-summary__total">
            <span>Final total due</span>
            <strong className="num">
              {showPrice ? currency(quote.finalTotalUSD) : 'On request'}
            </strong>
          </div>
        </div>
      </div>

      <div className="booking-engine__right">
        <div className="booking-form__heading">
          <h3>Send your request</h3>
        </div>

        {state.status === 'success' ? (
          <div className="form-success" role="status">
            <span className="form-success__mark" aria-hidden="true">
              <Check size={18} strokeWidth={2.2} />
            </span>
            <div>
              <strong>Request received</strong>
              <p>{state.message}</p>
            </div>
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="form-error" role="alert">
            {state.message}
          </div>
        ) : null}

        <form
          action={formAction}
          className="booking-form"
          onSubmit={handleFormSubmit}
          noValidate={false}
        >
          <input
            type="hidden"
            name="checkInDate"
            value={checkIn}
          />
          <input
            type="hidden"
            name="checkOutDate"
            value={checkOut ?? ''}
          />
          <input type="hidden" name="bookingType" value={bookingType} />
          <input type="hidden" name="eventCategory" value={eventCategory} />
          <input type="hidden" name="specialChoice" value={specialChoice} />
          <input
            type="hidden"
            name="appliedSpecial"
            value={quote.appliedSpecial?.id ?? ''}
          />
          <input type="hidden" name="promoCode" value={promoCode} />
          <div className="form-honeypot" aria-hidden="true" hidden>
            <label htmlFor="booking-website">Leave this field empty</label>
            <input
              id="booking-website"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="booking-form__fields">
            <div className="form-field">
              <Label htmlFor="guestName">Full name</Label>
              <Input
                id="guestName"
                name="guestName"
                type="text"
                autoComplete="name"
                required
                aria-invalid={Boolean(state.fieldErrors?.guestName)}
              />
              {state.fieldErrors?.guestName ? (
                <p className="field-error">{state.fieldErrors.guestName}</p>
              ) : null}
            </div>

            <div className="booking-form__row">
              <div className="form-field">
                <Label htmlFor="guestPhone">Phone / WhatsApp</Label>
                <Input
                  id="guestPhone"
                  name="guestPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  aria-invalid={Boolean(state.fieldErrors?.guestPhone)}
                />
                {state.fieldErrors?.guestPhone ? (
                  <p className="field-error">{state.fieldErrors.guestPhone}</p>
                ) : null}
              </div>

              <div className="form-field">
                <Label htmlFor="guestEmail">Email (optional)</Label>
                <Input
                  id="guestEmail"
                  name="guestEmail"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(state.fieldErrors?.guestEmail)}
                />
                {state.fieldErrors?.guestEmail ? (
                  <p className="field-error">{state.fieldErrors.guestEmail}</p>
                ) : null}
              </div>
            </div>

            <div className="booking-form__row">
              <div className="form-field">
                <Label htmlFor="guestCount">Guests</Label>
                <div className="field-with-icon">
                  <Users aria-hidden="true" size={16} strokeWidth={1.6} />
                  <Input
                    id="guestCount"
                    name="guestCount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={30}
                    value={guestCount}
                    onChange={(event) => setGuestCount(event.target.value)}
                    required
                    className="num"
                    aria-invalid={Boolean(state.fieldErrors?.guestCount)}
                    aria-describedby="guest-count-help"
                  />
                </div>
                <p id="guest-count-help" className="field-help">
                  Max {pricing.functionMaxGuests}
                </p>
                {state.fieldErrors?.guestCount ? (
                  <p className="field-error">{state.fieldErrors.guestCount}</p>
                ) : null}
              </div>

              <div className="form-field">
                <Label htmlFor="eventCategory">Occasion</Label>
                <Select
                  value={eventCategory}
                  onValueChange={(value) =>
                    setEventCategory(value as BookingEventCategory)
                  }
                >
                  <SelectTrigger id="eventCategory">
                    <SelectValue placeholder="Choose an occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="applied-special">
              <span>Special applied</span>
              <strong>
                {quote.appliedSpecial
                  ? `${quote.appliedSpecial.title}: ${quote.appliedSpecial.badgeText}`
                  : 'None. Standard rate applies.'}
              </strong>
            </div>

            <div className="form-field">
              <Label htmlFor="booking-notes">
                Special requests or notes
              </Label>
              <Textarea
                id="booking-notes"
                name="notes"
                rows={3}
                maxLength={2000}
                placeholder="Tell Mrs Ncube about your day, your setup, or anything you need."
              />
            </div>

            <div className="booking-dates">
              <CalendarDays aria-hidden="true" size={17} strokeWidth={1.6} />
              <span>
                {bookingType === 'accommodation'
                  ? `${formatDate(checkIn)} to ${formatDate(checkOut || checkIn)}`
                  : bookingType === 'special-bundle'
                    ? `${formatDate(checkIn)} with one night in the house`
                    : formatDate(checkIn)}
              </span>
            </div>

            <Button
              type="submit"
              size="large"
              className="booking-submit"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? 'Sending request…' : 'Confirm booking request'}
            </Button>

            <p className="booking-form__fineprint">
              No payment online.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
