'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Mode, QuizArtwork, QuizState, AnswerResult } from '@/types'
import ArtworkDisplay from './ArtworkDisplay'
import EasyMode from './EasyMode'
import HardMode from './HardMode'
import AnswerFeedback from './AnswerFeedback'
import QuizSummary from './QuizSummary'
import QuizProgress from './QuizProgress'

interface Props {
  mode: Mode
}

function preloadImages(artworks: QuizArtwork[]) {
  artworks.forEach((artwork) => {
    const url = `/_next/image?url=${encodeURIComponent(artwork.imageUrl)}&w=1080&q=75`
    const img = new window.Image()
    img.src = url
  })
}

export default function QuizGame({ mode }: Props) {
  const [state, setState] = useState<QuizState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuiz = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/quiz?mode=${mode}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load quiz')
      }
      const data = await res.json()
      setState({
        mode,
        artworks: data.artworks,
        currentIndex: 0,
        answers: [],
        phase: 'question',
      })
      preloadImages(data.artworks)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [mode])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  const handleGuess = useCallback((guess: string, hinted = false) => {
    if (!state) return
    const current = state.artworks[state.currentIndex]
    const correct =
      current.artistNameBasic === guess.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() ||
      current.artistName.toLowerCase() === guess.toLowerCase().trim()

    const result: AnswerResult = { artwork: current, guess, correct, hinted: hinted && correct }
    setState((prev) =>
      prev ? { ...prev, answers: [...prev.answers, result], phase: 'feedback' } : prev
    )
  }, [state])

  const handlePass = useCallback(() => {
    if (!state) return
    const current = state.artworks[state.currentIndex]
    const result: AnswerResult = { artwork: current, guess: '', correct: false, hinted: false }
    setState((prev) =>
      prev ? { ...prev, answers: [...prev.answers, result], phase: 'feedback' } : prev
    )
  }, [state])

  const handleNext = useCallback(() => {
    if (!state) return
    const nextIndex = state.currentIndex + 1
    if (nextIndex >= state.artworks.length) {
      setState((prev) => prev ? { ...prev, phase: 'summary' } : prev)
    } else {
      setState((prev) =>
        prev ? { ...prev, currentIndex: nextIndex, phase: 'question' } : prev
      )
    }
  }, [state])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-stone-400 text-sm tracking-widest uppercase animate-pulse">
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-stone-500">{error}</p>
        <button
          onClick={fetchQuiz}
          className="text-sm text-stone-800 underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!state) return null

  if (state.phase === 'summary') {
    return <QuizSummary answers={state.answers} mode={mode} onRestart={fetchQuiz} />
  }

  const currentArtwork = state.artworks[state.currentIndex]
  const lastAnswer = state.answers[state.answers.length - 1]

  return (
    <div className="space-y-8 animate-fade-in">
      <QuizProgress
        current={state.currentIndex + 1}
        total={state.artworks.length}
        answers={state.answers}
      />

      <ArtworkDisplay artwork={currentArtwork} revealed={state.phase === 'feedback'} />

      {state.phase === 'question' && (
        <div className="animate-slide-up">
          {mode === 'easy' ? (
            <EasyMode artwork={currentArtwork} onGuess={handleGuess} />
          ) : (
            <HardMode artwork={currentArtwork} onGuess={handleGuess} onPass={handlePass} />
          )}
        </div>
      )}

      {state.phase === 'feedback' && lastAnswer && (
        <AnswerFeedback answer={lastAnswer} onNext={handleNext} />
      )}
    </div>
  )
}
