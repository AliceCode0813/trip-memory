import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'

interface LayoutProps {
  title: string
  subtitle?: string
  backTo?: string
  action?: ReactNode
  children: ReactNode
  hideBrand?: boolean
}

export function Layout({
  title,
  subtitle,
  backTo,
  action,
  children,
  hideBrand = false,
}: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col safe-top">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 pt-2 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3 px-4 pb-4">
          <div className="flex min-w-0 items-start gap-3">
            {backTo && (
              <Link
                to={backTo}
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100"
                aria-label="뒤로 가기"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <div className="min-w-0">
              {!hideBrand && !backTo && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                  TripMemo
                </p>
              )}
              <h1 className="truncate text-xl font-bold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{subtitle}</span>
                </p>
              )}
            </div>
          </div>
          {action}
        </div>
      </header>

      <main className="flex-1 px-4 py-5 safe-bottom">{children}</main>
    </div>
  )
}
