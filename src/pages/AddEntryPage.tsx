import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { getTrip, saveImage } from '../lib/db'
import { EXPENSE_CATEGORIES } from '../lib/constants'
import { createId, todayISO } from '../lib/format'
import type { Entry, EntryType, ExpenseCategory } from '../types'

export function AddEntryPage() {
  const { tripId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addEntry } = useTrips()

  const type = (searchParams.get('type') as EntryType) || 'expense'
  const isExpense = type === 'expense'

  const [date, setDate] = useState(todayISO())
  const [amount, setAmount] = useState('')
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [caption, setCaption] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function verifyTrip() {
      const trip = await getTrip(tripId)
      if (!trip) navigate('/')
    }

    void verifyTrip()
  }, [tripId, navigate])

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(file ? URL.createObjectURL(file) : undefined)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)

    try {
      let receiptImageId: string | undefined
      let photoImageId: string | undefined

      if (photoFile) {
        const imageId = await saveImage(photoFile)
        if (isExpense) receiptImageId = imageId
        else photoImageId = imageId
      }

      const entry: Entry = {
        id: createId(),
        tripId,
        type,
        date,
        createdAt: new Date().toISOString(),
        amount: isExpense ? Number(amount) : undefined,
        itemName: isExpense ? itemName.trim() : undefined,
        category: isExpense ? category : undefined,
        receiptImageId,
        caption: !isExpense ? caption.trim() : undefined,
        photoImageId,
      }

      await addEntry(entry)
      navigate(`/trips/${tripId}?tab=${isExpense ? 'expenses' : 'memories'}`)
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = isExpense
    ? itemName.trim() && amount && Number(amount) > 0
    : caption.trim() || photoFile

  return (
    <Layout
      title={isExpense ? '영수증 · 지출 기록' : '추억 사진 기록'}
      subtitle={isExpense ? '무엇을 샀는지, 얼마를 썼는지 남겨요' : '그 순간을 사진과 글로 남겨요'}
      backTo={`/trips/${tripId}`}
      hideBrand
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <PhotoPicker
          previewUrl={photoPreview}
          label={isExpense ? '영수증 사진 찍기' : '추억 사진 올리기'}
          hint="카메라로 바로 찍거나 갤러리에서 선택할 수 있어요"
          onChange={handlePhotoChange}
        />

        <Field label="날짜">
          <TextInput
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </Field>

        {isExpense ? (
          <>
            <Field label="구매한 것">
              <TextInput
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
                placeholder="예: 라멘, 기념품, 택시"
                required
              />
            </Field>

            <Field label="금액">
              <TextInput
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                required
              />
            </Field>

            <Field label="카테고리">
              <SelectInput
                value={category}
                onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
              >
                {EXPENSE_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </>
        ) : (
          <Field label="추억 메모">
            <TextArea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="예: 도톤보리 야경, 맛있었던 타코야키"
            />
          </Field>
        )}

        <PrimaryButton type="submit" disabled={saving || !canSubmit}>
          {saving ? '저장 중...' : '기록 저장하기'}
        </PrimaryButton>
      </form>
    </Layout>
  )
}
