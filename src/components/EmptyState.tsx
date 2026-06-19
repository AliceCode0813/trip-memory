import type { ReactNode } from 'react'

interface EmptyStateProps {
  emoji: string
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-brand-200 bg-white/70 px-6 py-12 text-center shadow-sm">
      <div className="mb-4 text-5xl">{emoji}</div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
