import { Link } from 'react-router-dom'
import { Camera, Receipt, Wallet } from 'lucide-react'
import { useImageUrl } from '../hooks/useImageUrl'
import { formatDate, formatMoney } from '../lib/format'
import type { TripWithStats } from '../types'

interface TripCardProps {
  trip: TripWithStats
}

export function TripCard({ trip }: TripCardProps) {
  const coverUrl = useImageUrl(trip.coverImageId)
  const dateLabel = trip.endDate
    ? `${formatDate(trip.startDate, 'yyyy.M.d')} – ${formatDate(trip.endDate, 'yyyy.M.d')}`
    : formatDate(trip.startDate, 'yyyy.M.d')

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-3xl border border-white bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">✈️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-xs font-medium text-white/80">{dateLabel}</p>
          <h3 className="mt-1 text-xl font-bold">{trip.title}</h3>
          <p className="text-sm text-white/90">{trip.destination}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-4 text-center text-sm">
        <div className="rounded-2xl bg-brand-50 px-2 py-3">
          <Wallet className="mx-auto mb-1 h-4 w-4 text-brand-700" />
          <p className="font-semibold text-slate-900">{formatMoney(trip.totalSpent, trip.currency)}</p>
          <p className="text-xs text-slate-500">총 지출</p>
        </div>
        <div className="rounded-2xl bg-sand-50 px-2 py-3">
          <Receipt className="mx-auto mb-1 h-4 w-4 text-coral-500" />
          <p className="font-semibold text-slate-900">{trip.expenseCount}</p>
          <p className="text-xs text-slate-500">영수증</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-2 py-3">
          <Camera className="mx-auto mb-1 h-4 w-4 text-slate-600" />
          <p className="font-semibold text-slate-900">{trip.memoryCount}</p>
          <p className="text-xs text-slate-500">추억</p>
        </div>
      </div>
    </Link>
  )
}
