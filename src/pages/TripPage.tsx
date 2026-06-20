import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Camera, Receipt, Trash2 } from 'lucide-react'
import { DailyComparison } from '../components/DailyComparison'
import { EmptyState } from '../components/EmptyState'
import { Layout } from '../components/Layout'
import { TimelineItem } from '../components/TimelineItem'
import { useTrips } from '../context/TripContext'
import { getTrip, getTripStats } from '../lib/db'
import {
  EXPENSE_CATEGORIES,
} from '../lib/constants'
import { formatDate, formatMoney } from '../lib/format'
import type { Entry, Trip } from '../types'

type Tab = 'timeline' | 'daily' | 'expenses' | 'memories' | 'summary'

export function TripPage() {
  const { tripId = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { removeTrip, removeEntry, getEntries } = useTrips()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getTripStats>> | null>(null)
  const [loading, setLoading] = useState(true)

  const tab = (searchParams.get('tab') as Tab) || 'timeline'

  async function loadTripData() {
    setLoading(true)
    const nextTrip = await getTrip(tripId)
    if (!nextTrip) {
      navigate('/')
      return
    }

    const nextEntries = await getEntries(tripId)
    const nextStats = await getTripStats(tripId, nextTrip.currency)
    setTrip(nextTrip)
    setEntries(nextEntries)
    setStats(nextStats)
    setLoading(false)
  }

  useEffect(() => {
    void loadTripData()
  }, [tripId])

  useEffect(() => {
    function handleFocus() {
      void loadTripData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [tripId])

  const expenses = useMemo(
    () => entries.filter((entry) => entry.type === 'expense'),
    [entries],
  )
  const memories = useMemo(
    () => entries.filter((entry) => entry.type === 'memory'),
    [entries],
  )

  async function handleDeleteTrip() {
    if (!trip) return
    if (!window.confirm(`"${trip.title}" 여행 기록을 모두 삭제할까요?`)) return
    await removeTrip(trip.id)
    navigate('/')
  }

  async function handleDeleteEntry(id: string) {
    if (!window.confirm('이 기록을 삭제할까요?')) return
    await removeEntry(id)
    await loadTripData()
  }

  function handleEditEntry(entry: Entry) {
    navigate(`/trips/${tripId}/add?type=${entry.type}&entryId=${entry.id}`)
  }

  function setTab(nextTab: Tab) {
    setSearchParams({ tab: nextTab })
  }

  if (loading || !trip || !stats) {
    return (
      <Layout title="불러오는 중..." backTo="/">
        <div className="h-64 animate-pulse rounded-3xl bg-white/80" />
      </Layout>
    )
  }

  return (
    <Layout
      title={trip.title}
      subtitle={trip.destination}
      backTo="/"
      hideBrand
      action={
        <button
          type="button"
          onClick={handleDeleteTrip}
          className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          aria-label="여행 삭제"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      }
    >
      <section className="mb-5 overflow-hidden rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          {formatDate(trip.startDate, 'yyyy.M.d')}
          {trip.endDate ? ` – ${formatDate(trip.endDate, 'yyyy.M.d')}` : ''}
        </p>
        <p className="mt-3 text-3xl font-bold text-brand-800">
          {formatMoney(stats.totalSpent, trip.currency)}
        </p>
        <p className="mt-1 text-sm text-slate-500">총 지출 · {stats.expenseCount}건</p>
        {trip.note && <p className="mt-4 rounded-2xl bg-sand-50 px-4 py-3 text-sm text-slate-600">{trip.note}</p>}
      </section>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-sm">
        {([
          ['timeline', '타임라인'],
          ['daily', '일별'],
          ['expenses', '지출'],
          ['memories', '추억'],
          ['summary', '요약'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`shrink-0 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
              tab === value ? 'bg-brand-700 text-white' : 'text-slate-500 hover:bg-brand-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'daily' && (
        <DailyComparison
          trip={trip}
          entries={entries}
          onDeleteEntry={handleDeleteEntry}
          onEditEntry={handleEditEntry}
        />
      )}

      {tab === 'timeline' && (
        <div className="space-y-5">
          {entries.length === 0 ? (
            <EmptyState
              emoji="🗺️"
              title="아직 기록이 없어요"
              description="영수증을 찍거나, 여행 중 사진을 올려 첫 추억을 남겨보세요."
            />
          ) : (
            entries.map((entry) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                currency={trip.currency}
                onDelete={handleDeleteEntry}
                onEdit={handleEditEntry}
              />
            ))
          )}
        </div>
      )}

      {tab === 'expenses' && (
        <div className="space-y-5">
          {expenses.length === 0 ? (
            <EmptyState
              emoji="🧾"
              title="영수증 기록이 없어요"
              description="사진으로 영수증을 저장하고 무엇을 샀는지 적어두세요."
            />
          ) : (
            expenses.map((entry) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                currency={trip.currency}
                onDelete={handleDeleteEntry}
                onEdit={handleEditEntry}
              />
            ))
          )}
        </div>
      )}

      {tab === 'memories' && (
        <div className="grid grid-cols-2 gap-3">
          {memories.length === 0 ? (
            <div className="col-span-2">
              <EmptyState
                emoji="📷"
                title="추억 사진이 없어요"
                description="풍경, 음식, 친구들과의 순간을 사진으로 남겨보세요."
              />
            </div>
          ) : (
            memories.map((entry) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                currency={trip.currency}
                onDelete={handleDeleteEntry}
                onEdit={handleEditEntry}
              />
            ))
          )}
        </div>
      )}

      {tab === 'summary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">총 기록</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stats.entryCount}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">추억 사진</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stats.memoryCount}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">카테고리별 지출</h3>
            <div className="mt-4 space-y-3">
              {EXPENSE_CATEGORIES.map((category) => {
                const amount = stats.byCategory[category.value] ?? 0
                if (!amount) return null
                const ratio = stats.totalSpent ? Math.round((amount / stats.totalSpent) * 100) : 0

                return (
                  <div key={category.value}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>
                        {category.emoji} {category.label}
                      </span>
                      <span className="font-medium text-slate-700">
                        {formatMoney(amount, trip.currency)} · {ratio}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {stats.totalSpent === 0 && (
                <p className="text-sm text-slate-500">아직 지출 데이터가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 px-4 pb-5 safe-bottom">
        <div className="grid grid-cols-2 gap-3 rounded-[1.75rem] border border-white/70 bg-white/95 p-3 shadow-2xl backdrop-blur-xl">
          <Link
            to={`/trips/${trip.id}/add?type=expense`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white"
          >
            <Receipt className="h-4 w-4" />
            영수증 추가
          </Link>
          <Link
            to={`/trips/${trip.id}/add?type=memory`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
          >
            <Camera className="h-4 w-4" />
            추억 추가
          </Link>
        </div>
      </div>

      <div className="h-32" />
    </Layout>
  )
}
