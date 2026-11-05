export const HARARE_TIME_ZONE = 'Africa/Harare'

export type ISODate = string

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: HARARE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function todayISO(): ISODate {
  const parts = isoDateFormatter.formatToParts(new Date())
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  return `${year}-${month}-${day}`
}

export function toISODate(value: string | Date | null | undefined): ISODate {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: HARARE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return [
    parts.find((part) => part.type === 'year')?.value,
    parts.find((part) => part.type === 'month')?.value,
    parts.find((part) => part.type === 'day')?.value,
  ].join('-')
}

export function fromISO(date: ISODate): Date {
  return new Date(`${date}T00:00:00.000Z`)
}

export function addDays(date: ISODate, days: number): ISODate {
  const next = fromISO(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}

export function addMonths(month: string, amount: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, monthNumber - 1 + amount, 1))
  return date.toISOString().slice(0, 7)
}

export function monthOf(date: ISODate): string {
  return date.slice(0, 7)
}

export function currentMonthISO(): string {
  return monthOf(todayISO())
}

export function nightsBetween(checkIn: ISODate, checkOut: ISODate): number {
  if (!checkIn || !checkOut) return 0
  const start = fromISO(checkIn).getTime()
  const end = fromISO(checkOut).getTime()
  return Math.max(0, Math.round((end - start) / 86_400_000))
}

export function compareISO(a: ISODate, b: ISODate): number {
  return a.localeCompare(b)
}

export function isBefore(a: ISODate, b: ISODate): boolean {
  return compareISO(a, b) < 0
}

export function isAfter(a: ISODate, b: ISODate): boolean {
  return compareISO(a, b) > 0
}

export function isSameOrAfter(a: ISODate, b: ISODate): boolean {
  return compareISO(a, b) >= 0
}

export function isSameOrBefore(a: ISODate, b: ISODate): boolean {
  return compareISO(a, b) <= 0
}

export function isWithin(date: ISODate, start: ISODate, end: ISODate): boolean {
  return isSameOrAfter(date, start) && isSameOrBefore(date, end)
}

export function eachDateInclusive(start: ISODate, end: ISODate): ISODate[] {
  if (!start || !end || isAfter(start, end)) return []
  const dates: ISODate[] = []
  let cursor = start
  while (isSameOrBefore(cursor, end)) {
    dates.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return dates
}

export function nightsOfStay(checkIn: ISODate, checkOut: ISODate): ISODate[] {
  if (!checkIn || !checkOut) return []
  const nights: ISODate[] = []
  let cursor = checkIn
  while (isBefore(cursor, checkOut)) {
    nights.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return nights
}

export function formatDate(
  date: ISODate,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    ...options,
  }).format(fromISO(date))
}

export function formatShortDate(date: ISODate): string {
  return formatDate(date, { day: 'numeric', month: 'short' })
}

export function formatDateRange(start: ISODate, end?: ISODate | null): string {
  if (!start) return ''
  if (!end) return formatDate(start)
  return `${formatShortDate(start)} to ${formatDate(end)}`
}

export function formatMonth(month: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${month}-01T00:00:00.000Z`))
}

export function getCalendarCells(month: string): Array<ISODate | null> {
  const [year, monthNumber] = month.split('-').map(Number)
  const first = new Date(Date.UTC(year, monthNumber - 1, 1))
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const startOffset = (first.getUTCDay() + 6) % 7
  const cells: Array<ISODate | null> = []

  for (let index = 0; index < startOffset; index += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(
      `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    )
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function weekdayIndex(date: ISODate): number {
  const day = fromISO(date).getUTCDay()
  return (day + 6) % 7
}

export function addYears(date: ISODate, years: number): ISODate {
  const source = fromISO(date)
  const next = new Date(
    Date.UTC(
      source.getUTCFullYear() + years,
      source.getUTCMonth(),
      source.getUTCDate(),
    ),
  )
  return next.toISOString().slice(0, 10)
}
