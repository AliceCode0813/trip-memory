import { eachDayOfInterval, format, parseISO } from 'date-fns'
import type { Entry, Trip } from '../types'
import { todayISO } from './format'

export interface DaySummary {
  date: string
  dayNumber: number
  label: string
  weekday: string
  spent: number
  expenseCount: number
  memoryCount: number
  entryCount: number
  entries: Entry[]
  deltaFromPrev: number | null
}

function toISODate(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export function getTripDayDates(trip: Trip, entries: Entry[]): string[] {
  const start = parseISO(trip.startDate)
  let end = trip.endDate ? parseISO(trip.endDate) : start

  for (const entry of entries) {
    const entryDate = parseISO(entry.date)
    if (entryDate > end) end = entryDate
  }

  if (!trip.endDate) {
    const today = parseISO(todayISO())
    if (today > end) end = today
  }

  if (end < start) end = start

  return eachDayOfInterval({ start, end }).map(toISODate)
}

export function buildDailySummaries(trip: Trip, entries: Entry[]): DaySummary[] {
  const dayDates = getTripDayDates(trip, entries)

  return dayDates.map((date, index) => {
    const dayEntries = entries
      .filter((entry) => entry.date === date)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const expenses = dayEntries.filter((entry) => entry.type === 'expense')
    const spent = expenses.reduce((sum, entry) => sum + (entry.amount ?? 0), 0)
    const parsed = parseISO(date)

    return {
      date,
      dayNumber: index + 1,
      label: format(parsed, 'M/d'),
      weekday: format(parsed, 'EEE'),
      spent,
      expenseCount: expenses.length,
      memoryCount: dayEntries.filter((entry) => entry.type === 'memory').length,
      entryCount: dayEntries.length,
      entries: dayEntries,
      deltaFromPrev: null,
    }
  }).map((day, index, all) => {
    if (index === 0) return day
    return {
      ...day,
      deltaFromPrev: day.spent - all[index - 1].spent,
    }
  })
}

export function getDailyInsights(days: DaySummary[]) {
  const daysWithSpending = days.filter((day) => day.spent > 0)
  const totalSpent = days.reduce((sum, day) => sum + day.spent, 0)
  const averageSpent =
    daysWithSpending.length > 0 ? totalSpent / daysWithSpending.length : 0

  const highestDay =
    daysWithSpending.length > 0
      ? daysWithSpending.reduce((max, day) => (day.spent > max.spent ? day : max))
      : null

  const lowestDay =
    daysWithSpending.length > 0
      ? daysWithSpending.reduce((min, day) => (day.spent < min.spent ? day : min))
      : null

  return { totalSpent, averageSpent, highestDay, lowestDay, daysWithSpending }
}
