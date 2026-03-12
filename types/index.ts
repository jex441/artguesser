export type Mode = 'easy' | 'hard'

export interface Artist {
  id: number
  name: string
  nameBasic: string
  nationality?: string | null
  birthYear?: number | null
  deathYear?: number | null
  difficulty: number
}

export interface Artwork {
  id: number
  title: string
  artistId: number
  artistName: string
  artistNameBasic: string
  imageUrl: string
  year?: number | null
  medium?: string | null
  dimensions?: string | null
  description?: string | null
  museum?: string | null
}

export interface QuizArtwork extends Artwork {
  choices?: string[] // easy mode: 4 artist name options
  nationality?: string | null
  birthYear?: number | null
}

export interface QuizState {
  mode: Mode
  artworks: QuizArtwork[]
  currentIndex: number
  answers: AnswerResult[]
  phase: 'question' | 'feedback' | 'summary'
}

export interface AnswerResult {
  artwork: QuizArtwork
  guess: string
  correct: boolean
  hinted?: boolean
}
