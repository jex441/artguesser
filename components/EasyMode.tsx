'use client'

import { useState } from 'react'
import type { QuizArtwork } from '@/types'

interface Props {
  artwork: QuizArtwork
  onGuess: (guess: string) => void
}

export default function EasyMode({ artwork, onGuess }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (choice: string) => {
    if (selected) return
    setSelected(choice)
    setTimeout(() => onGuess(choice), 200)
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-stone-400 tracking-wider uppercase">
        Who is the artist?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(artwork.choices ?? []).map((choice) => (
          <button
            key={choice}
            onClick={() => handleSelect(choice)}
            disabled={!!selected}
            className={`
              w-full px-4 py-4 border rounded-sm text-left font-serif text-stone-800
              transition-all duration-200
              ${selected
                ? 'opacity-40 cursor-default'
                : 'border-stone-200 hover:border-stone-800 hover:bg-stone-50 cursor-pointer'
              }
              ${selected === choice ? 'opacity-100 border-stone-800 bg-stone-50' : ''}
            `}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}
