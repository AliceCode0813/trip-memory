import type { ExpenseCategory } from '../types'

export const EXPENSE_CATEGORIES: {
  value: ExpenseCategory
  label: string
  emoji: string
}[] = [
  { value: 'food', label: '식비', emoji: '🍜' },
  { value: 'transport', label: '교통', emoji: '🚕' },
  { value: 'lodging', label: '숙박', emoji: '🏨' },
  { value: 'shopping', label: '쇼핑', emoji: '🛍️' },
  { value: 'activity', label: '관광', emoji: '🎫' },
  { value: 'other', label: '기타', emoji: '📝' },
]

export const CURRENCY_OPTIONS = [
  { value: 'KRW', label: '원 (KRW)', symbol: '₩' },
  { value: 'USD', label: '달러 (USD)', symbol: '$' },
  { value: 'JPY', label: '엔 (JPY)', symbol: '¥' },
  { value: 'EUR', label: '유로 (EUR)', symbol: '€' },
  { value: 'CNY', label: '위안 (CNY)', symbol: '¥' },
  { value: 'THB', label: '바트 (THB)', symbol: '฿' },
]

export function getCategoryLabel(category?: ExpenseCategory) {
  return EXPENSE_CATEGORIES.find((item) => item.value === category)?.label ?? '기타'
}

export function getCategoryEmoji(category?: ExpenseCategory) {
  return EXPENSE_CATEGORIES.find((item) => item.value === category)?.emoji ?? '📝'
}

export function getCurrencySymbol(currency: string) {
  return CURRENCY_OPTIONS.find((item) => item.value === currency)?.symbol ?? currency
}
