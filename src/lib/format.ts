import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getCurrencySymbol } from './constants'

export function formatDate(value: string, pattern = 'M월 d일 (EEE)') {
  return format(parseISO(value), pattern, { locale: ko })
}

export function formatDateTime(value: string) {
  return format(parseISO(value), 'M월 d일 HH:mm', { locale: ko })
}

export function formatMoney(amount: number, currency: string) {
  const symbol = getCurrencySymbol(currency)
  const formatted = new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
  }).format(amount)

  if (currency === 'KRW') return `${symbol}${formatted}`
  return `${symbol}${formatted}`
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function createId() {
  return crypto.randomUUID()
}
