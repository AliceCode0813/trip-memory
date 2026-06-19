import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { Layout } from '../components/Layout'
import { PrimaryButton } from '../components/FormControls'
import { TripCard } from '../components/TripCard'
import { useTrips } from '../context/TripContext'

export function HomePage() {
  const { trips, loading } = useTrips()

  return (
    <Layout
      title="나의 여행 기록"
      subtitle="지출, 영수증, 추억을 한곳에"
      action={
        <Link
          to="/trips/new"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-white shadow-md transition hover:bg-brand-800"
          aria-label="새 여행 만들기"
        >
          <Plus className="h-5 w-5" />
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="h-52 animate-pulse rounded-3xl bg-white/80" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          emoji="🧳"
          title="첫 여행을 기록해 보세요"
          description="영수증 사진과 지출, 중간중간 찍은 사진까지 여행의 모든 순간을 TripMemo에 남길 수 있어요."
          action={
            <Link to="/trips/new">
              <PrimaryButton className="px-8">새 여행 시작하기</PrimaryButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl bg-gradient-to-r from-brand-700 to-brand-500 p-5 text-white shadow-lg">
            <p className="text-sm text-white/80">전체 여행</p>
            <p className="mt-1 text-2xl font-bold">{trips.length}개의 추억</p>
            <p className="mt-2 text-sm text-white/90">
              영수증 {trips.reduce((sum, trip) => sum + trip.expenseCount, 0)}장 · 사진{' '}
              {trips.reduce((sum, trip) => sum + trip.memoryCount, 0)}장
            </p>
          </div>

          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </Layout>
  )
}
