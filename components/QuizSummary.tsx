'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { AnswerResult, Mode } from '@/types'

interface Props {
  answers: AnswerResult[]
  mode: Mode
  onRestart: () => void
}

function getTitle(score: number, total: number): { title: string; subtitle: string } {
  const pct = total === 0 ? 0 : score / total
  if (pct === 1)    return { title: 'Aesthete',              subtitle: 'A perfect eye. The galleries weep with joy.' }
  if (pct >= 5/6)   return { title: 'Connoisseur',           subtitle: 'You know your Klimt from your Klee.' }
  if (pct >= 4/6)   return { title: 'Aficionado',            subtitle: 'Cultured. Sophisticated. Almost annoyingly so.' }
  if (pct >= 3/6)   return { title: 'Dilettante',            subtitle: 'You\'ve been to a museum. Several, perhaps.' }
  if (pct >= 2/6)   return { title: 'Appreciator',           subtitle: 'Art moves you. It just doesn\'t tell you its name.' }
  if (pct >= 1/6)   return { title: 'Museumgoer',            subtitle: 'You\'ve walked past many of these paintings.' }
  if (score === 1)   return { title: 'Gift Shop Enthusiast', subtitle: 'One right! The postcards are paying off.' }
  return              { title: 'IKEA Art Critic',             subtitle: 'A bold score. Very Björksta of you.' }
}

export default function QuizSummary({ answers, mode, onRestart }: Props) {
  const score = answers.filter((a) => a.correct).length
  const total = answers.length
  const { title, subtitle } = getTitle(score, total)

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400">Results</p>
        <div className="text-6xl font-serif text-stone-800">
          {score}<span className="text-stone-300 text-3xl">/{total}</span>
        </div>
        <p className="font-serif text-xl text-stone-700 tracking-wide">{title}</p>
        <p className="text-stone-400 text-sm italic">{subtitle}</p>
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
