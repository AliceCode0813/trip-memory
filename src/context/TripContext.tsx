import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createEntry,
  createTrip,
  deleteEntry,
  deleteImage,
  deleteTrip,
  listEntries,
  listTrips,
  updateEntry,
} from '../lib/db'
import type { Entry, Trip, TripWithStats } from '../types'

interface TripContextValue {
  trips: TripWithStats[]
  loading: boolean
  refreshTrips: () => Promise<void>
  addTrip: (trip: Trip) => Promise<void>
  removeTrip: (id: string) => Promise<void>
  addEntry: (entry: Entry) => Promise<void>
  editEntry: (entry: Entry, previousImageId?: string) => Promise<void>
  removeEntry: (id: string) => Promise<void>
  getEntries: (tripId: string) => Promise<Entry[]>
}

const TripContext = createContext<TripContextValue | null>(null)

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<TripWithStats[]>([])
  const [loading, setLoading] = useState(true)

  const refreshTrips = useCallback(async () => {
    const nextTrips = await listTrips()
    setTrips(nextTrips)
  }, [])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      await refreshTrips()
      setLoading(false)
    })()
  }, [refreshTrips])

  const addTrip = useCallback(
    async (trip: Trip) => {
      await createTrip(trip)
      await refreshTrips()
    },
    [refreshTrips],
  )

  const removeTrip = useCallback(
    async (id: string) => {
      await deleteTrip(id)
      await refreshTrips()
    },
    [refreshTrips],
  )

  const addEntry = useCallback(
    async (entry: Entry) => {
      await createEntry(entry)
      await refreshTrips()
    },
    [refreshTrips],
  )

  const editEntry = useCallback(
    async (entry: Entry, previousImageId?: string) => {
      const currentImageId = entry.photoImageId ?? entry.receiptImageId

      if (previousImageId && currentImageId && previousImageId !== currentImageId) {
        await deleteImage(previousImageId)
      }

      await updateEntry(entry)
      await refreshTrips()
    },
    [refreshTrips],
  )

  const removeEntry = useCallback(
    async (id: string) => {
      await deleteEntry(id)
      await refreshTrips()
    },
    [refreshTrips],
  )

  const getEntries = useCallback(async (tripId: string) => listEntries(tripId), [])

  const value = useMemo(
    () => ({
      trips,
      loading,
      refreshTrips,
      addTrip,
      removeTrip,
      addEntry,
      editEntry,
      removeEntry,
      getEntries,
    }),
    [trips, loading, refreshTrips, addTrip, removeTrip, addEntry, editEntry, removeEntry, getEntries],
  )

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTrips() {
  const context = useContext(TripContext)
  if (!context) throw new Error('useTrips must be used within TripProvider')
  return context
}
