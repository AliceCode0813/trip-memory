import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Field,
  PhotoPicker,
  PrimaryButton,
  SelectInput,
  TextArea,
  TextInput,
} from '../components/FormControls'
import { Layout } from '../components/Layout'
import { useTrips } from '../context/TripContext'
import { saveImage } from '../lib/db'
import { CURRENCY_OPTIONS } from '../lib/constants'
import { createId, todayISO } from '../lib/format'
import type { Trip } from '../types'

export function NewTripPage() {
  const navigate = useNavigate()
  const { addTrip } = useTrips()
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState('')
  const [currency, setCurrency] = useState('KRW')
  const [note, setNote] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>()
  const [saving, setSaving] = useState(false)

  function handleCoverChange(file: File | null) {
    setCoverFile(file)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview(file ? URL.createObjectURL(file) : undefined)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !destination.trim()) return

    setSaving(true)
    try {
      let coverImageId: string | undefined
      if (coverFile) coverImageId = await saveImage(coverFile)

      const trip: Trip = {
        id: createId(),
        title: title.trim(),
        destination: destination.trim(),
        startDate,
        endDate: endDate || undefined,
        currency,
        note: note.trim() || undefined,
        coverImageId,
        createdAt: new Date().toISOString(),
      }

      await addTrip(trip)
      navigate(`/trips/${trip.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout title="새 여행 만들기" backTo="/">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <PhotoPicker
          previewUrl={coverPreview}
          label="커버 사진 추가"
          hint="여행 대표 사진을 올려보세요"
          onChange={handleCoverChange}
        />

        <Field label="여행 이름">
          <TextInput
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 오사카 가족여행"
            required
          />
        </Field>

        <Field label="여행지">
          <TextInput
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="예: 일본 오사카"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="시작일">
            <TextInput
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </Field>
          <Field label="종료일 (선택)">
            <TextInput
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </Field>
        </div>

        <Field label="기본 통화">
          <SelectInput value={currency} onChange={(event) => setCurrency(event.target.value)}>
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="메모 (선택)">
          <TextArea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="이번 여행에서 기록하고 싶은 것들..."
          />
        </Field>

        <PrimaryButton type="submit" disabled={saving || !title.trim() || !destination.trim()}>
          {saving ? '저장 중...' : '여행 시작하기'}
        </PrimaryButton>
      </form>
    </Layout>
  )
}
