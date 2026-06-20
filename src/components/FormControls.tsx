import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

const baseInput =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseInput} ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${baseInput} min-h-28 resize-none ${props.className ?? ''}`} />
}

export function SelectInput(props: InputHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${baseInput} ${props.className ?? ''}`} />
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center rounded-2xl bg-brand-700 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${className}`}
    >
      {children}
    </button>
  )
}

export function PhotoPicker({
  previewUrl,
  label,
  hint,
  onChange,
  source = 'gallery',
}: {
  previewUrl?: string
  label: string
  hint: string
  onChange: (file: File | null) => void
  source?: 'camera' | 'gallery'
}) {
  return (
    <label className="block cursor-pointer">
      <input
        type="file"
        accept="image/*"
        {...(source === 'camera' ? { capture: 'environment' } : {})}
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <div className="overflow-hidden rounded-3xl border border-dashed border-brand-300 bg-brand-50/60">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="max-h-72 w-full object-cover" />
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 text-4xl">📸</div>
            <p className="font-semibold text-brand-800">{label}</p>
            <p className="mt-2 text-sm text-slate-500">{hint}</p>
          </div>
        )}
      </div>
    </label>
  )
}
