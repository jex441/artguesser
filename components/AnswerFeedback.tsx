'use client'

import type { AnswerResult } from '@/types'

interface Props {
  answer: AnswerResult
  onNext: () => void
}

export default function AnswerFeedback({ answer, onNext }: Props) {
  return (
    <div className="animate-slide-up space-y-6">
      <div
        className={`rounded-sm px-6 py-5 text-center border transition-all ${
          answer.correct
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <p
          className={`text-xs tracking-[0.25em] uppercase mb-2 ${
            answer.correct ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {answer.correct ? 'Correct' : 'Incorrect'}
        </p>
        <p className="font-serif text-xl text-stone-800">
          {answer.artwork.artistName}
        </p>
        {!answer.correct && (
          <p className="text-sm text-stone-400 mt-1">
            {answer.guess === '' ? 'Passed' : <>You guessed: <span className="italic">{answer.guess}</span></>}
          </p>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 border border-stone-800 text-stone-800 font-serif text-sm tracking-wider hover:bg-stone-800 hover:text-white transition-all duration-200 rounded-sm"
      >
        Next
      </button>
    </div>
  )
}
