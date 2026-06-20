import { Link } from 'react-router-dom'
import { useImageUrl } from '../hooks/useImageUrl'
import { formatDate } from '../lib/format'
import type { Entry } from '../types'

interface MemoryCardProps {
  entry: Entry
  tripId: string
}

export function MemoryCard({ entry, tripId }: MemoryCardProps) {
  const imageUrl = useImageUrl(entry.photoImageId)

  return (
    <Link
      to={`/trips/${tripId}/memories/${entry.id}`}
      className="group block overflow-hidden rounded-3xl border border-white bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-brand-100 to-sand-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">📷</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs font-medium text-white/80">{formatDate(entry.date, 'M월 d일')}</p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5">
            {entry.caption || '여행의 한 순간'}
          </p>
        </div>
      </div>
    </Link>
  )
}
