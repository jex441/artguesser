'use client'

import type { AnswerResult } from '@/types'

interface Props {
  current: number
  total: number
  answers: AnswerResult[]
}

export default function QuizProgress({ current, total, answers }: Props) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-stone-400 tracking-widest uppercase whitespace-nowrap">
        {current} / {total}
      </span>
      <div className="flex gap-1.5 flex-1">
        {Array.from({ length: total }).map((_, i) => {
          const answer = answers[i]
          return (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                answer === undefined
                  ? i === current - 1
                    ? 'bg-stone-300'
                    : 'bg-stone-100'
                  : answer.correct
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
