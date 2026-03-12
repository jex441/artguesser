'use client'

import { useState, useEffect, useRef } from 'react'
import type { QuizArtwork } from '@/types'

interface ArtistResult {
  id: number
  name: string
  nationality?: string | null
  birthYear?: number | null
  deathYear?: number | null
}

interface Props {
  artwork: QuizArtwork
  onGuess: (guess: string, hinted: boolean) => void
  onPass: () => void
}

const MAX_HINTS = 3

function getHints(artwork: QuizArtwork): string[] {
  const hints: string[] = []
  if (artwork.nationality) hints.push(artwork.nationality)
  if (artwork.birthYear) hints.push(`b. ${artwork.birthYear}`)
  const lastName = artwork.artistName.trim().split(' ').pop() ?? ''
  if (lastName) hints.push(`Last name starts with "${lastName[0].toUpperCase()}"`)
  return hints
}

export default function HardMode({ artwork, onGuess, onPass }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ArtistResult[]>([])
  const [selected, setSelected] = useState<ArtistResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hints = getHints(artwork)
  const canHint = hintsRevealed < Math.min(MAX_HINTS, hints.length)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.artists)
        if (!selected) setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 250)
  }, [query])

  const handleSelect = (artist: ArtistResult) => {
    setSelected(artist)
    setQuery(artist.name)
    setOpen(false)
  }

  const handleSubmit = () => {
    if (!selected) return
    onGuess(selected.name, hintsRevealed > 0)
  }

  const handleClear = () => {
    setSelected(null)
    setQuery('')
    setResults([])
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-stone-400 tracking-wider uppercase">
        Name the artist
      </p>

      {hintsRevealed > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {hints.slice(0, hintsRevealed).map((hint, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full tracking-wide"
            >
              {hint}
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelected(null)
              }}
              placeholder="Search for an artist..."
              className="w-full border border-stone-200 rounded-sm px-4 py-3 text-stone-800 font-serif placeholder:text-stone-300 focus:outline-none focus:border-stone-800 transition-colors"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs">
                ...
              </div>
            )}
          </div>
          {selected && (
            <button
              onClick={handleClear}
              className="px-3 text-stone-400 hover:text-stone-800 transition-colors text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-sm shadow-lg overflow-hidden">
            {results.map((artist) => (
              <button
                key={artist.id}
                onClick={() => handleSelect(artist)}
                className="w-full px-4 py-3 text-left hover:bg-stone-50 border-b border-stone-100 last:border-0 transition-colors"
              >
                <span className="font-serif text-stone-800">{artist.name}</span>
                {(artist.nationality || artist.birthYear) && (
                  <span className="ml-2 text-xs text-stone-400">
                    {[artist.nationality, artist.birthYear && `b. ${artist.birthYear}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {open && results.length === 0 && !loading && query.length >= 2 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-sm shadow-lg px-4 py-3 text-stone-400 text-sm">
            No artists found
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected}
        className={`
          w-full py-3 border rounded-sm font-serif text-sm tracking-wider transition-all duration-200
          ${selected
            ? 'border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white cursor-pointer'
            : 'border-stone-200 text-stone-300 cursor-default'
          }
        `}
      >
        Submit
      </button>

      <div className="flex gap-3">
        <button
          onClick={() => setHintsRevealed((n) => Math.min(n + 1, hints.length))}
          disabled={!canHint}
          className={`
            flex-1 py-3 border rounded-sm font-serif text-sm tracking-wider transition-all duration-200
            ${canHint
              ? 'border-amber-300 text-amber-700 hover:bg-amber-50 cursor-pointer'
              : 'border-stone-100 text-stone-300 cursor-default'
            }
          `}
        >
          {hintsRevealed === 0 ? 'Hint' : hintsRevealed >= hints.length ? 'No more hints' : 'Another hint'}
        </button>
        <button
          onClick={onPass}
          className="flex-1 py-3 border border-stone-200 text-stone-400 rounded-sm font-serif text-sm tracking-wider hover:border-stone-400 hover:text-stone-600 transition-all duration-200"
        >
          Pass
        </button>
      </div>
    </div>
  )
}
