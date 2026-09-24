'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import type { QuizArtwork } from '@/types'

interface Props {
  artwork: QuizArtwork
  revealed: boolean
  /** Called once loading this image has definitively failed while it's still unrevealed (question phase). */
  onLoadFailed?: () => void
}

const LOAD_TIMEOUT_MS = 6000 // treat a stalled load (no error, no load event) as a failure
const MAX_RETRIES = 1 // one retry before giving up on this image

export default function ArtworkDisplay({ artwork, revealed, onLoadFailed }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)
  const revealedRef = useRef(revealed)
  revealedRef.current = revealed
  const failNotifiedRef = useRef(false)

  useEffect(() => {
    setLoaded(false)
    setZoomed(false)
    setAttempt(0)
    setFailed(false)
    failNotifiedRef.current = false
  }, [artwork.imageUrl])

  // Give up on a load that neither succeeds nor errors within the timeout —
  // covers stalled connections that never fire onError. Retriggers on every
  // new attempt so the previous attempt's timer is cleared and replaced.
  useEffect(() => {
    if (loaded || failed) return
    const timer = setTimeout(handleFailure, LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artwork.imageUrl, attempt, loaded, failed])

  function handleFailure() {
    if (attempt < MAX_RETRIES) {
      setAttempt((prev) => prev + 1)
      return
    }
    setFailed(true)
    if (!revealedRef.current && !failNotifiedRef.current) {
      failNotifiedRef.current = true
      onLoadFailed?.()
    }
  }

  // Cache-bust on retry so we don't just replay a cached failure.
  const src =
    attempt > 0
      ? `${artwork.imageUrl}${artwork.imageUrl.includes('?') ? '&' : '?'}retry=${attempt}`
      : artwork.imageUrl

  return (
    <div className="space-y-3">
      {/* Zoomed overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <Image
            src={src}
            alt={revealed ? `${artwork.title} by ${artwork.artistName}` : 'Artwork'}
            fill
            className="object-contain p-4"
            sizes="100vw"
            priority
          />
        </div>
      )}

      <div
        className="relative w-full overflow-hidden rounded-sm border border-stone-100 bg-stone-50 cursor-zoom-in"
        onClick={() => loaded && setZoomed(true)}
      >
        <div className="relative w-full" style={{ paddingBottom: '66%' }}>
          {!loaded && !failed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin" />
            </div>
          )}
          {failed ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-stone-300 text-xs tracking-widest uppercase">Image unavailable</p>
            </div>
          ) : (
            <Image
              key={`${artwork.id}-${attempt}`}
              src={src}
              alt={revealed ? `${artwork.title} by ${artwork.artistName}` : 'Artwork — guess the artist'}
              fill
              className={`object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 768px) 100vw, 672px"
              priority
              onLoad={() => setLoaded(true)}
              onError={handleFailure}
            />
          )}
        </div>
      </div>

      {revealed && (
        <div className="animate-slide-up text-center space-y-1">
          <p className="font-serif text-lg text-stone-800">{artwork.title}</p>
          {artwork.year && (
            <p className="text-sm text-stone-400">{artwork.year}</p>
          )}
          {artwork.medium && (
            <p className="text-xs text-stone-400 italic">{artwork.medium}</p>
          )}
          {artwork.museum && (
            <p className="text-xs text-stone-300">{artwork.museum}</p>
          )}
        </div>
      )}
    </div>
  )
}
