'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import {
  addDays,
  formatDate,
  formatMonth,
  getCalendarCells,
  isAfter,
  isSameOrAfter,
  monthOf,
  todayISO,
  type ISODate,
} from '@/lib/dates'
import {
  unavailableSetFor,
  type AvailabilitySnapshot,
} from '@/lib/availability'
import {
  isDateWithinSpecial,
  isRangeBooking,
  nightsForQuote,
  specialMatchesBookingType,
  type BookingType,
  type PublicSpecial,
} from '@/lib/pricing'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface AvailabilityCalendarProps {
  month: string
  setMonth: (month: string) => void
  bookingType: BookingType
  checkIn: ISODate
  checkOut: ISODate | null
  snapshot: AvailabilitySnapshot
  specials: PublicSpecial[]
  onDateClick: (date: ISODate) => void
  error?: string
}

export function AvailabilityCalendar({
  month,
  setMonth,
  bookingType,
  checkIn,
  checkOut,
  snapshot,
  specials,
  onDateClick,
  error,
}: AvailabilityCalendarProps) {
  const today = todayISO()
  const firstBookable = addDays(today, 1)
  const minMonth = monthOf(today)
  const maxMonth = monthOf(addDays(today, 365))
  const cells = getCalendarCells(month)
  const unavailable = unavailableSetFor(snapshot, bookingType)
  const isRange = isRangeBooking(bookingType)

  function isSelected(date: ISODate): boolean {
    if (!checkIn) return false
    if (!isRange) return date === checkIn
    if (!checkOut) return date === checkIn
    return isSameOrAfter(date, checkIn) && !isAfter(date, checkOut)
  }

  function specialAvailable(date: ISODate): boolean {
    return specials.some((special) => {
      if (!specialMatchesBookingType(special, bookingType)) return false
      if (!isDateWithinSpecial(special, date)) return false
      if (
        bookingType === 'accommodation' &&
        special.minNights &&
        special.minNights > 1
      ) {
        const candidateOut = addDays(date, special.minNights)
        return nightsForQuote('accommodation', date, candidateOut) >=
          special.minNights
      }
      return true
    })
  }

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button
          type="button"
          className="calendar__nav"
          onClick={() => setMonth(monthOf(addDays(`${month}-01`, -1)))}
          disabled={month <= minMonth}
          aria-label="Previous month"
        >
          <ChevronLeft aria-hidden="true" size={18} strokeWidth={1.6} />
        </button>
        <p className="calendar__month">{formatMonth(month)}</p>
        <button
          type="button"
          className="calendar__nav"
          onClick={() => {
            const next = new Date(`${month}-01T00:00:00.000Z`)
            next.setUTCMonth(next.getUTCMonth() + 1)
            setMonth(next.toISOString().slice(0, 7))
          }}
          disabled={month >= maxMonth}
          aria-label="Next month"
        >
          <ChevronRight aria-hidden="true" size={18} strokeWidth={1.6} />
        </button>
      </div>

      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar__grid" role="grid" aria-label="Availability calendar">
        {cells.map((date, index) => {
          if (!date) {
            return <span key={`empty-${index}`} className="calendar__empty" />
          }

          const isPast = !isSameOrAfter(date, firstBookable)
          const isUnavailable = unavailable.has(date)
          const selected = isSelected(date)
          const isCheckOut = isRange && checkOut === date
          const hasSpecial = specialAvailable(date) && !isUnavailable
          const disabled = isPast || isUnavailable
          const labelParts = [formatDate(date)]
          if (isPast) labelParts.push('past')
          else if (isUnavailable) labelParts.push('unavailable')
          else labelParts.push('available')
          if (hasSpecial) labelParts.push('special offer applies')
          if (selected) labelParts.push('selected')

          return (
            <button
              key={date}
              type="button"
              className="calendar__day"
              data-selected={selected ? 'true' : undefined}
              data-checkout={isCheckOut ? 'true' : undefined}
              data-unavailable={isUnavailable ? 'true' : undefined}
              data-special={hasSpecial ? 'true' : undefined}
              aria-label={labelParts.join(', ')}
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onDateClick(date)}
            >
              <span className="num">{Number(date.slice(8, 10))}</span>
              {hasSpecial ? (
                <span className="calendar__special-dot" aria-hidden="true" />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="calendar__legend" aria-hidden="true">
        <span>
          <span className="legend-swatch legend-swatch--open" /> Open
        </span>
        <span>
          <span className="legend-swatch legend-swatch--booked" /> Booked
        </span>
        <span>
          <span className="legend-swatch legend-swatch--selected" /> Selected
        </span>
        <span>
          <span className="legend-swatch legend-swatch--special" /> Special
        </span>
      </div>
      {error ? (
        <p className="calendar__error" role="status">
          {error}
        </p>
      ) : !checkIn ? (
        <p className="calendar__hint">Choose a date.</p>
      ) : null}
    </div>
  )
}
