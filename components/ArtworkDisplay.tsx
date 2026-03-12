'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { QuizArtwork } from '@/types'

interface Props {
  artwork: QuizArtwork
  revealed: boolean
}

export default function ArtworkDisplay({ artwork, revealed }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setZoomed(false)
  }, [artwork.imageUrl])

  return (
    <div className="space-y-3">
      {/* Zoomed overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <Image
            src={artwork.imageUrl}
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
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin" />
            </div>
          )}
          <Image
            src={artwork.imageUrl}
            alt={revealed ? `${artwork.title} by ${artwork.artistName}` : 'Artwork — guess the artist'}
            fill
            className={`object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 768px) 100vw, 672px"
            priority
            onLoad={() => setLoaded(true)}
          />
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
