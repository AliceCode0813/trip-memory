import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Entry, StoredImage, Trip, TripWithStats } from '../types'

interface TripMemoDB extends DBSchema {
  trips: {
    key: string
    value: Trip
    indexes: { 'by-createdAt': string }
  }
  entries: {
    key: string
    value: Entry
    indexes: { 'by-tripId': string; 'by-date': string }
  }
  images: {
    key: string
    value: StoredImage
  }
}

const DB_NAME = 'trip-memo-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<TripMemoDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<TripMemoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const tripStore = db.createObjectStore('trips', { keyPath: 'id' })
        tripStore.createIndex('by-createdAt', 'createdAt')

        const entryStore = db.createObjectStore('entries', { keyPath: 'id' })
        entryStore.createIndex('by-tripId', 'tripId')
        entryStore.createIndex('by-date', 'date')

        db.createObjectStore('images', { keyPath: 'id' })
      },
    })
  }

  return dbPromise
}

export async function saveImage(file: File) {
  const db = await getDb()
  const image: StoredImage = {
    id: crypto.randomUUID(),
    blob: file,
    mimeType: file.type || 'image/jpeg',
    createdAt: new Date().toISOString(),
  }
  await db.put('images', image)
  return image.id
}

export async function getImage(id: string) {
  const db = await getDb()
  return db.get('images', id)
}

export async function deleteImage(id: string) {
  const db = await getDb()
  await db.delete('images', id)
}

export async function createTrip(trip: Trip) {
  const db = await getDb()
  await db.put('trips', trip)
  return trip
}

export async function updateTrip(trip: Trip) {
  const db = await getDb()
  await db.put('trips', trip)
  return trip
}

export async function deleteTrip(id: string) {
  const db = await getDb()
  const entries = await db.getAllFromIndex('entries', 'by-tripId', id)

  for (const entry of entries) {
    if (entry.receiptImageId) await deleteImage(entry.receiptImageId)
    if (entry.photoImageId) await deleteImage(entry.photoImageId)
    await db.delete('entries', entry.id)
  }

  const trip = await db.get('trips', id)
  if (trip?.coverImageId) await deleteImage(trip.coverImageId)
  await db.delete('trips', id)
}

export async function getTrip(id: string) {
  const db = await getDb()
  return db.get('trips', id)
}

export async function listTrips(): Promise<TripWithStats[]> {
  const db = await getDb()
  const trips = await db.getAll('trips')
  const entries = await db.getAll('entries')

  return trips
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((trip) => {
      const tripEntries = entries.filter((entry) => entry.tripId === trip.id)
      const expenses = tripEntries.filter((entry) => entry.type === 'expense')

      return {
        ...trip,
        totalSpent: expenses.reduce((sum, entry) => sum + (entry.amount ?? 0), 0),
        expenseCount: expenses.length,
        memoryCount: tripEntries.filter((entry) => entry.type === 'memory').length,
      }
    })
}

export async function createEntry(entry: Entry) {
  const db = await getDb()
  await db.put('entries', entry)
  return entry
}

export async function deleteEntry(id: string) {
  const db = await getDb()
  const entry = await db.get('entries', id)
  if (!entry) return

  if (entry.receiptImageId) await deleteImage(entry.receiptImageId)
  if (entry.photoImageId) await deleteImage(entry.photoImageId)
  await db.delete('entries', id)
}

export async function listEntries(tripId: string) {
  const db = await getDb()
  const entries = await db.getAllFromIndex('entries', 'by-tripId', tripId)
  return entries.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export async function getTripStats(tripId: string, currency: string) {
  const entries = await listEntries(tripId)
  const expenses = entries.filter((entry) => entry.type === 'expense')

  const byCategory = expenses.reduce<Record<string, number>>((acc, entry) => {
    const key = entry.category ?? 'other'
    acc[key] = (acc[key] ?? 0) + (entry.amount ?? 0)
    return acc
  }, {})

  return {
    currency,
    totalSpent: expenses.reduce((sum, entry) => sum + (entry.amount ?? 0), 0),
    expenseCount: expenses.length,
    memoryCount: entries.filter((entry) => entry.type === 'memory').length,
    entryCount: entries.length,
    byCategory,
  }
}
