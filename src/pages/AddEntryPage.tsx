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
import { useImageUrl } from '../hooks/useImageUrl'
import { useTrips } from '../context/TripContext'
import { getEntry, getTrip, saveImage } from '../lib/db'
import { EXPENSE_CATEGORIES } from '../lib/constants'
import { createId, todayISO } from '../lib/format'
import type { Entry, EntryType, ExpenseCategory } from '../types'

export function AddEntryPage() {
  const { tripId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addEntry, editEntry } = useTrips()

  const typeParam = (searchParams.get('type') as EntryType) || 'expense'
  const entryId = searchParams.get('entryId')
  const isEdit = Boolean(entryId)

  const [entryType, setEntryType] = useState<EntryType>(typeParam)
  const [date, setDate] = useState(todayISO())
  const [amount, setAmount] = useState('')
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [caption, setCaption] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>()
  const [existingEntry, setExistingEntry] = useState<Entry | null>(null)
  const [loadingEntry, setLoadingEntry] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  const isExpense = entryType === 'expense'
  const previousImageId = existingEntry?.photoImageId ?? existingEntry?.receiptImageId
  const existingImageUrl = useImageUrl(previousImageId)
  const displayPreview = photoPreview ?? existingImageUrl

  useEffect(() => {
    async function loadPage() {
      const trip = await getTrip(tripId)
      if (!trip) {
        navigate('/')
        return
      }

      if (!entryId) {
        setEntryType(typeParam)
        setLoadingEntry(false)
        return
      }

      const entry = await getEntry(entryId)
      if (!entry || entry.tripId !== tripId) {
        navigate(`/trips/${tripId}`)
        return
      }

      setExistingEntry(entry)
      setEntryType(entry.type)
      setDate(entry.date)

      if (entry.type === 'memory') {
        setCaption(entry.caption ?? '')
      } else {
        setItemName(entry.itemName ?? '')
        setAmount(entry.amount != null ? String(entry.amount) : '')
        setCategory(entry.category ?? 'food')
      }

      setLoadingEntry(false)
    }

    void loadPage()
  }, [tripId, entryId, typeParam, navigate])

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(file ? URL.createObjectURL(file) : undefined)
  }

  function getReturnTab() {
    return isExpense ? 'expenses' : 'memories'
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)

    try {
      if (isEdit && existingEntry) {
        if (existingEntry.type === 'memory') {
          let photoImageId = existingEntry.photoImageId

          if (photoFile) {
            photoImageId = await saveImage(photoFile)
          }

          const updatedEntry: Entry = {
            ...existingEntry,
            date,
            caption: caption.trim() || undefined,
            photoImageId,
          }

          await editEntry(updatedEntry, previousImageId)
        } else {
          let receiptImageId = existingEntry.receiptImageId

          if (photoFile) {
            receiptImageId = await saveImage(photoFile)
          }

          const updatedEntry: Entry = {
            ...existingEntry,
            date,
            itemName: itemName.trim(),
            amount: Number(amount),
            category,
            receiptImageId,
          }

          await editEntry(updatedEntry, previousImageId)
        }

        navigate(`/trips/${tripId}?tab=${getReturnTab()}`)
        return
      }

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
        type: entryType,
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
      navigate(`/trips/${tripId}?tab=${getReturnTab()}`)
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = isEdit
    ? isExpense
      ? itemName.trim() && amount && Number(amount) > 0
      : caption.trim() || photoFile || existingEntry?.photoImageId
    : isExpense
      ? itemName.trim() && amount && Number(amount) > 0
      : caption.trim() || photoFile

  const photoSource = isExpense ? (isEdit ? 'gallery' : 'camera') : 'gallery'

  if (loadingEntry) {
    return (
      <Layout title="불러오는 중..." backTo={`/trips/${tripId}`} hideBrand>
        <div className="h-64 animate-pulse rounded-3xl bg-white/80" />
      </Layout>
    )
  }

  const title = isEdit
    ? isExpense
      ? '지출 · 영수증 수정'
      : '추억 수정'
    : isExpense
      ? '영수증 · 지출 기록'
      : '추억 사진 기록'

  const subtitle = isEdit
    ? isExpense
      ? '금액, 구매 내역, 영수증 사진을 수정할 수 있어요'
      : '사진과 메모를 수정할 수 있어요'
    : isExpense
      ? '무엇을 샀는지, 얼마를 썼는지 남겨요'
      : '갤러리에서 사진을 골라 추억을 남겨요'

  return (
    <Layout
      title={title}
      subtitle={subtitle}
      backTo={`/trips/${tripId}${isEdit ? `?tab=${getReturnTab()}` : ''}`}
      hideBrand
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <PhotoPicker
          previewUrl={displayPreview}
          label={
            isExpense
              ? isEdit
                ? '영수증 사진 변경'
                : '영수증 사진 찍기'
              : '갤러리에서 사진 선택'
          }
          hint={
            isExpense
              ? isEdit
                ? '갤러리에서 다른 영수증 사진을 선택할 수 있어요'
                : '카메라로 영수증을 바로 찍을 수 있어요'
              : '저장된 사진을 불러와 추억을 남겨요'
          }
          source={photoSource}
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
          {saving ? '저장 중...' : isEdit ? '수정 저장하기' : '기록 저장하기'}
        </PrimaryButton>
      </form>
    </Layout>
  )
}
