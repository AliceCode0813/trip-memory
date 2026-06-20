import { useEffect, useMemo, useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { buildDailySummaries, getDailyInsights } from '../lib/tripDays'
import { formatDate, formatMoney, todayISO } from '../lib/format'
import type { Entry, Trip } from '../types'
import { EmptyState } from './EmptyState'
import { TimelineItem } from './TimelineItem'

interface DailyComparisonProps {
  trip: Trip
  entries: Entry[]
  onDeleteEntry?: (id: string) => void
  onEditEntry?: (entry: Entry) => void
}

export function DailyComparison({ trip, entries, onDeleteEntry, onEditEntry }: DailyComparisonProps) {
  const days = useMemo(() => buildDailySummaries(trip, entries), [trip, entries])
  const insights = useMemo(() => getDailyInsights(days), [days])
  const maxSpent = useMemo(() => Math.max(...days.map((day) => day.spent), 1), [days])

  const defaultSelected = useMemo(() => {
    return (
      days.find((day) => day.date === todayISO())?.date ??
      days.find((day) => day.entryCount > 0)?.date ??
      days[0]?.date
    )
  }, [days])

  const [selectedDate, setSelectedDate] = useState<string>()

  useEffect(() => {
    if (!selectedDate || !days.some((day) => day.date === selectedDate)) {
      setSelectedDate(defaultSelected)
    }
  }, [defaultSelected, days, selectedDate])

  const selectedDay = days.find((day) => day.date === selectedDate) ?? days[0]

  if (days.length === 0) {
    return (
      <EmptyState
        emoji="📅"
        title="여행 일정이 없어요"
        description="여행 시작일을 설정하면 하루하루 비교할 수 있어요."
      />
    )
  }

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-3 gap-2">
        <InsightCard
          label="하루 평균"
          value={formatMoney(Math.round(insights.averageSpent), trip.currency)}
          hint={`${insights.daysWithSpending.length}일 지출`}
        />
        <InsightCard
          label="최다 지출"
          value={
            insights.highestDay
              ? formatMoney(insights.highestDay.spent, trip.currency)
              : '-'
          }
          hint={
            insights.highestDay
              ? `${insights.highestDay.dayNumber}일차 · ${insights.highestDay.label}`
              : '기록 없음'
          }
          accent="coral"
        />
        <InsightCard
          label="최소 지출"
          value={
            insights.lowestDay
              ? formatMoney(insights.lowestDay.spent, trip.currency)
              : '-'
          }
          hint={
            insights.lowestDay
              ? `${insights.lowestDay.dayNumber}일차 · ${insights.lowestDay.label}`
              : '기록 없음'
          }
        />
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">날마다 지출 비교</h3>
            <p className="mt-1 text-sm text-slate-500">막대가 길수록 그날 더 많이 썼어요</p>
          </div>
          <p className="text-xs text-slate-400">{days.length}일</p>
        </div>

        <div className="flex items-end justify-between gap-1.5 overflow-x-auto pb-1">
          {days.map((day) => {
            const height = day.spent > 0 ? Math.max(12, (day.spent / maxSpent) * 100) : 6
            const isSelected = day.date === selectedDate
            const isHighest = insights.highestDay?.date === day.date && day.spent > 0

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDate(day.date)}
                className="group flex min-w-[2.6rem] flex-1 flex-col items-center gap-2"
              >
                <span
                  className={`min-h-[2rem] text-[10px] font-semibold leading-tight ${
                    isSelected ? 'text-brand-700' : 'text-slate-400'
                  }`}
                >
                  {day.spent > 0 ? formatCompactMoney(day.spent, trip.currency) : '·'}
                </span>
                <div className="flex h-24 w-full items-end justify-center">
                  <div
                    className={`w-full max-w-[2rem] rounded-t-xl transition ${
                      isSelected
                        ? 'bg-brand-600'
                        : isHighest
                          ? 'bg-coral-400 group-hover:bg-coral-500'
                          : day.spent > 0
                            ? 'bg-brand-200 group-hover:bg-brand-300'
                            : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="text-center">
                  <p
                    className={`text-[11px] font-bold ${
                      isSelected ? 'text-brand-800' : 'text-slate-600'
                    }`}
                  >
                    {day.dayNumber}일
                  </p>
                  <p className="text-[10px] text-slate-400">{day.label}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {selectedDay && (
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-brand-600">
                {selectedDay.dayNumber}일차 · {formatDate(selectedDay.date)}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatMoney(selectedDay.spent, trip.currency)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                지출 {selectedDay.expenseCount}건 · 추억 {selectedDay.memoryCount}장
              </p>
            </div>

            {selectedDay.deltaFromPrev != null && selectedDay.dayNumber > 1 && (
              <DeltaBadge delta={selectedDay.deltaFromPrev} currency={trip.currency} />
            )}
          </div>

          {selectedDay.dayNumber > 1 && selectedDay.deltaFromPrev != null && (
            <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {selectedDay.deltaFromPrev > 0 && (
                <>전날보다 {formatMoney(selectedDay.deltaFromPrev, trip.currency)} 더 썼어요.</>
              )}
              {selectedDay.deltaFromPrev < 0 && (
                <>전날보다 {formatMoney(Math.abs(selectedDay.deltaFromPrev), trip.currency)} 덜 썼어요.</>
              )}
              {selectedDay.deltaFromPrev === 0 && <>전날과 지출이 같아요.</>}
            </p>
          )}

          {insights.averageSpent > 0 && selectedDay.spent > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              여행 평균 대비{' '}
              {selectedDay.spent > insights.averageSpent
                ? `+${Math.round(((selectedDay.spent - insights.averageSpent) / insights.averageSpent) * 100)}%`
                : selectedDay.spent < insights.averageSpent
                  ? `-${Math.round(((insights.averageSpent - selectedDay.spent) / insights.averageSpent) * 100)}%`
                  : '동일'}
            </p>
          )}
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          {selectedDay ? `${selectedDay.dayNumber}일차 기록` : '기록'}
        </h3>

        {!selectedDay || selectedDay.entryCount === 0 ? (
          <EmptyState
            emoji="✨"
            title="이 날은 아직 기록이 없어요"
            description="영수증이나 추억 사진을 추가하면 이곳에서 하루 단위로 볼 수 있어요."
          />
        ) : (
          <div className="space-y-5">
            {selectedDay.entries.map((entry) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                currency={trip.currency}
                onDelete={onDeleteEntry}
                onEdit={onEditEntry}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function InsightCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint: string
  accent?: 'coral'
}) {
  return (
    <div
      className={`rounded-2xl p-3 ${
        accent === 'coral' ? 'bg-orange-50' : 'bg-white shadow-sm'
      }`}
    >
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-[10px] text-slate-400">{hint}</p>
    </div>
  )
}

function DeltaBadge({ delta, currency }: { delta: number; currency: string }) {
  const isUp = delta > 0
  const isDown = delta < 0

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
        isUp
          ? 'bg-red-50 text-red-600'
          : isDown
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-slate-100 text-slate-600'
      }`}
    >
      {isUp && <TrendingUp className="h-3.5 w-3.5" />}
      {isDown && <TrendingDown className="h-3.5 w-3.5" />}
      {delta === 0
        ? '전날과 동일'
        : `${isUp ? '+' : '-'}${formatMoney(Math.abs(delta), currency)}`}
    </div>
  )
}

function formatCompactMoney(amount: number, currency: string) {
  if (currency === 'KRW' || currency === 'JPY') {
    if (amount >= 10000) return `${Math.round(amount / 10000)}만`
    if (amount >= 1000) return `${Math.round(amount / 1000)}천`
  }
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`
  return String(Math.round(amount))
}
