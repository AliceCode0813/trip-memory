import { Camera, Receipt, Trash2 } from 'lucide-react'
import { useImageUrl } from '../hooks/useImageUrl'
import { getCategoryEmoji, getCategoryLabel } from '../lib/constants'
import { formatDateTime, formatMoney } from '../lib/format'
import type { Entry } from '../types'

interface TimelineItemProps {
  entry: Entry
  currency: string
  onDelete?: (id: string) => void
}

export function TimelineItem({ entry, currency, onDelete }: TimelineItemProps) {
  const imageId = entry.type === 'expense' ? entry.receiptImageId : entry.photoImageId
  const imageUrl = useImageUrl(imageId)
  const isExpense = entry.type === 'expense'

  return (
    <article className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:h-[calc(100%-8px)] before:w-px before:bg-brand-100 last:before:hidden">
      <div className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-brand-50">
        {isExpense ? (
          <Receipt className="h-3.5 w-3.5 text-coral-500" />
        ) : (
          <Camera className="h-3.5 w-3.5 text-brand-600" />
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        {imageUrl && (
          <img src={imageUrl} alt="" className="max-h-56 w-full object-cover" />
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">{formatDateTime(entry.createdAt)}</p>
              {isExpense ? (
                <>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {entry.itemName || '지출'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {getCategoryEmoji(entry.category)} {getCategoryLabel(entry.category)}
                  </p>
                </>
              ) : (
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {entry.caption || '여행 추억'}
                </h3>
              )}
            </div>

            <div className="flex shrink-0 items-start gap-2">
              {isExpense && entry.amount != null && (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-800">
                  {formatMoney(entry.amount, currency)}
                </span>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
