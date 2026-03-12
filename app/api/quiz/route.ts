import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { shuffle, pickRandom } from '@/lib/utils'
import type { QuizArtwork } from '@/types'

const QUIZ_SIZE = 7
const CHOICES_COUNT = 4

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('mode') as 'easy' | 'hard'
  if (mode !== 'easy' && mode !== 'hard') {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  }

  try {
    const totalArtworks = await prisma.artwork.count()
    if (totalArtworks < QUIZ_SIZE) {
      return NextResponse.json(
        { error: 'Not enough artworks in database. Run the seed script first.' },
        { status: 503 }
      )
    }

    // Pick random artworks by selecting random IDs
    const allIds = await prisma.artwork.findMany({ select: { id: true } })
    const selectedIds = pickRandom(allIds, QUIZ_SIZE).map((r) => r.id)

    const artworks = await prisma.artwork.findMany({
      where: { id: { in: selectedIds } },
      include: { artist: true },
    })

    const quizArtworks: QuizArtwork[] = await Promise.all(
      artworks.map(async (aw) => {
        const base: QuizArtwork = {
          id: aw.id,
          title: aw.title,
          artistId: aw.artistId,
          artistName: aw.artistName,
          artistNameBasic: aw.artistNameBasic,
          imageUrl: aw.imageUrl,
          year: aw.year,
          medium: aw.medium,
          dimensions: aw.dimensions,
          description: aw.description,
          museum: aw.museum,
        }

        if (mode === 'easy') {
          // Get 3 wrong answers — prefer artists from a similar era (±75 years)
          // and similar difficulty, so choices are plausible
          const ERA_RANGE = 75
          const birthYear = aw.artist.birthYear

          let wrongArtists = await prisma.artist.findMany({
            where: {
              id: { not: aw.artistId },
              ...(birthYear != null && {
                birthYear: {
                  gte: birthYear - ERA_RANGE,
                  lte: birthYear + ERA_RANGE,
                },
              }),
              difficulty: {
                gte: Math.max(1, aw.artist.difficulty - 1),
                lte: Math.min(4, aw.artist.difficulty + 1),
              },
            },
            select: { name: true },
          })

          // Widen era window if not enough candidates
          if (wrongArtists.length < 3 && birthYear != null) {
            wrongArtists = await prisma.artist.findMany({
              where: {
                id: { not: aw.artistId },
                birthYear: {
                  gte: birthYear - ERA_RANGE * 2,
                  lte: birthYear + ERA_RANGE * 2,
                },
              },
              select: { name: true },
            })
          }

          // Final fallback: any other artist
          if (wrongArtists.length < 3) {
            wrongArtists = await prisma.artist.findMany({
              where: { id: { not: aw.artistId } },
              select: { name: true },
            })
          }

          const wrongs = pickRandom(wrongArtists, 3).map((a) => a.name)
          base.choices = shuffle([aw.artistName, ...wrongs])
        }

        return base
      })
    )

    return NextResponse.json({ artworks: quizArtworks, mode })
  } catch (err) {
    console.error('Quiz route error:', err)
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 })
  }
}
