export type EntryType = 'expense' | 'memory'

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'lodging'
  | 'shopping'
  | 'activity'
  | 'other'

export interface Trip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate?: string
  currency: string
  coverImageId?: string
  note?: string
  createdAt: string
}

export interface Entry {
  id: string
  tripId: string
  type: EntryType
  date: string
  createdAt: string
  amount?: number
  itemName?: string
  category?: ExpenseCategory
  receiptImageId?: string
  caption?: string
  photoImageId?: string
}

export interface StoredImage {
  id: string
  blob: Blob
  mimeType: string
  createdAt: string
}

export interface TripWithStats extends Trip {
  totalSpent: number
  expenseCount: number
  memoryCount: number
}
