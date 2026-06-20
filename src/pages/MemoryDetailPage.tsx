import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { useImageUrl } from '../hooks/useImageUrl'
import { useTrips } from '../context/TripContext'
import { getEntry, getTrip } from '../lib/db'
import { formatDate, formatDateTime } from '../lib/format'
import type { Entry, Trip } from '../types'

export function MemoryDetailPage() {
  const { tripId = '', entryId = '' } = useParams()
  const navigate = useNavigate()
  const { removeEntry } = useTrips()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)

  const imageUrl = useImageUrl(entry?.photoImageId)

  useEffect(() => {
    async function load() {
      const nextTrip = await getTrip(tripId)
      const nextEntry = await getEntry(entryId)

      if (!nextTrip || !nextEntry || nextEntry.tripId !== tripId || nextEntry.type !== 'memory') {
        navigate(`/trips/${tripId}?tab=memories`)
        return
      }

      setTrip(nextTrip)
      setEntry(nextEntry)
      setLoading(false)
    }

    void load()
  }, [tripId, entryId, navigate])

  async function handleDelete() {
    if (!entry) return
    if (!window.confirm('이 추억을 삭제할까요?')) return

    await removeEntry(entry.id)
    navigate(`/trips/${tripId}?tab=memories`)
  }

  if (loading || !trip || !entry) {
    return (
      <div className="safe-top min-h-dvh bg-slate-900">
        <div className="mx-auto h-96 max-w-lg animate-pulse bg-slate-800" />
      </div>
    )
  }

  return (
    <div className="safe-top mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-slate-950 text-white">
      <header className="absolute left-0 right-0 top-0 z-20 bg-gradient-to-b from-black/60 to-transparent px-4 pb-8 pt-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link
            to={`/trips/${tripId}?tab=memories`}
            className="inline-flex h-10 items-center rounded-full bg-black/30 px-4 text-sm font-medium backdrop-blur-md transition hover:bg-black/45"
          >
            ← 추억 목록
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="max-h-[70dvh] w-full object-cover" />
          ) : (
            <div className="flex h-[50dvh] items-center justify-center bg-gradient-to-br from-brand-900 to-slate-900 text-6xl">
              📷
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/10" />
        </div>

        <section className="relative -mt-16 px-5 pb-8">
          <p className="text-sm font-medium text-brand-200">{trip.destination}</p>
          <p className="mt-2 text-2xl font-bold">{formatDate(entry.date, 'yyyy년 M월 d일 EEEE')}</p>
          <p className="mt-1 text-xs text-slate-400">기록 {formatDateTime(entry.createdAt)}</p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
              Memory
            </p>
            <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-slate-100">
              {entry.caption?.trim() || '말 없이도 좋았던 순간.'}
            </p>
          </div>
        </section>
      </main>

      <footer className="safe-bottom sticky bottom-0 border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur-xl">
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/trips/${tripId}/add?type=memory&entryId=${entry.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            <Pencil className="h-4 w-4" />
            수정
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </button>
        </div>
      </footer>
    </div>
  )
}
