'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { AnswerResult, Mode } from '@/types'

interface Props {
  answers: AnswerResult[]
  mode: Mode
  onRestart: () => void
}

export default function QuizSummary({ answers, mode, onRestart }: Props) {
  const score = answers.filter((a) => a.correct).length
  const total = answers.length

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400">Results</p>
        <div className="text-6xl font-serif text-stone-800">
          {score}<span className="text-stone-300 text-3xl">/{total}</span>
        </div>
        <p className="text-stone-500 text-sm">
          {score === total
            ? 'Perfect score!'
            : score >= total * 0.7
            ? 'Well done.'
            : score >= total * 0.4
            ? 'Not bad.'
            : 'Keep practicing.'}
        </p>
      </div>

      <div className="space-y-6">
        {answers.map((answer, i) => (
          <div
            key={i}
            className={`flex gap-4 border-b border-stone-100 pb-6 last:border-0 ${
              answer.correct ? '' : 'opacity-80'
            }`}
          >
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-sm border border-stone-100 bg-stone-50">
              <Image
                src={answer.artwork.imageUrl}
                alt={answer.artwork.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-serif text-stone-800 leading-tight">
                  {answer.artwork.title}
                </p>
                <span
                  className={`text-xs flex-shrink-0 px-2 py-0.5 rounded-full ${
                    answer.correct
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  }`}
                >
                  {answer.correct ? '✓' : '✗'}
                </span>
              </div>
              <p className="text-sm text-stone-600 font-serif">{answer.artwork.artistName}</p>
              {answer.artwork.year && (
                <p className="text-xs text-stone-400">{answer.artwork.year}</p>
              )}
              {answer.artwork.medium && (
                <p className="text-xs text-stone-400 italic">{answer.artwork.medium}</p>
              )}
              {answer.artwork.museum && (
                <p className="text-xs text-stone-300">{answer.artwork.museum}</p>
              )}
              {!answer.correct && (
                <p className="text-xs text-stone-400">
                  Your guess: <span className="italic">{answer.guess}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3 border border-stone-800 text-stone-800 font-serif text-sm tracking-wider hover:bg-stone-800 hover:text-white transition-all duration-200 rounded-sm"
        >
          Play again
        </button>
        <Link href="/" className="flex-1">
          <button className="w-full py-3 border border-stone-200 text-stone-500 font-serif text-sm tracking-wider hover:border-stone-400 transition-all duration-200 rounded-sm">
            Change mode
          </button>
        </Link>
      </div>
    </div>
  )
}
