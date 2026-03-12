import { notFound } from 'next/navigation'
import QuizGame from '@/components/QuizGame'
import type { Mode } from '@/types'

interface Props {
  params: { mode: string }
}

export default function QuizPage({ params }: Props) {
  const mode = params.mode as Mode
  if (mode !== 'easy' && mode !== 'hard') notFound()

  return <QuizGame mode={mode} />
}

export function generateStaticParams() {
  return [{ mode: 'easy' }, { mode: 'hard' }]
}
