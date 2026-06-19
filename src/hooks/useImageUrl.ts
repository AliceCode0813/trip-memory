import { useEffect, useState } from 'react'
import { getImage } from '../lib/db'

export function useImageUrl(imageId?: string) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined

    async function load() {
      if (!imageId) {
        setUrl(undefined)
        return
      }

      const image = await getImage(imageId)
      if (!active) return

      if (image) {
        objectUrl = URL.createObjectURL(image.blob)
        setUrl(objectUrl)
      } else {
        setUrl(undefined)
      }
    }

    void load()

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [imageId])

  return url
}
