// Liquid's date filters, as the Jekyll site used them. Jekyll on GitHub Pages builds in UTC, so
// every date here is read and printed in UTC: a post dated 2023-09-06 is that day everywhere.

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function monthName(date: Date): string {
  const name = MONTHS[date.getUTCMonth()]
  if (name === undefined) throw new Error(`invalid date: ${String(date)}`)
  return name
}

/** A `YYYY-MM-DD` string (shows.json) as midnight UTC. */
export function parseDay(day: string): Date {
  const date = new Date(`${day}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) throw new Error(`invalid date "${day}"`)
  return date
}

/** `date: "%B %d, %Y"` — "September 06, 2023". */
export function longDate(date: Date): string {
  return `${monthName(date)} ${pad(date.getUTCDate())}, ${date.getUTCFullYear()}`
}

/** `date: "%b"` — "Feb". */
export function shortMonth(date: Date): string {
  return monthName(date).slice(0, 3)
}

/** `date: "%d"` — "06". */
export function dayOfMonth(date: Date): string {
  return pad(date.getUTCDate())
}

/** `date_to_xmlschema` — "2023-09-06T00:00:00+00:00". */
export function xmlSchema(date: Date): string {
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}+00:00`
  )
}
