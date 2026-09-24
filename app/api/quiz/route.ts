import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { shuffle, pickRandom } from '@/lib/utils'
import type { QuizArtwork } from '@/types'

const QUIZ_SIZE = 7
const SPARE_SIZE = 4 // extra artworks sent along so the client can swap out any that fail to load
const CHOICES_COUNT = 4

// Sources whose images are currently unreachable and shouldn't be served.
// "aic" (Art Institute of Chicago): as of 2026-09, artic.edu put its IIIF
// image endpoint behind Cloudflare bot-challenge, which returns a 403 HTML
// page instead of the image for any non-interactive request — so every
// artwork from this source is permanently broken until that changes or
// they're re-seeded from a different image source. Data is left in the DB.
const EXCLUDED_SOURCES = ['aic']

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('mode') as 'easy' | 'hard'
  if (mode !== 'easy' && mode !== 'hard') {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  }

  try {
    const availableFilter = { source: { notIn: EXCLUDED_SOURCES } }
    const totalArtworks = await prisma.artwork.count({ where: availableFilter })
    if (totalArtworks < QUIZ_SIZE) {
      return NextResponse.json(
        { error: 'Not enough artworks in database. Run the seed script first.' },
        { status: 503 }
      )
    }

    // Pick random artworks by selecting random IDs (a few spares included)
    const allIds = await prisma.artwork.findMany({ where: availableFilter, select: { id: true } })
    const selectedIds = pickRandom(allIds, Math.min(QUIZ_SIZE + SPARE_SIZE, allIds.length)).map((r) => r.id)

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
          nationality: aw.artist.nationality,
          birthYear: aw.artist.birthYear,
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

    return NextResponse.json({
      artworks: quizArtworks.slice(0, QUIZ_SIZE),
      spares: quizArtworks.slice(QUIZ_SIZE),
      mode,
    })
  } catch (err) {
    console.error('Quiz route error:', err)
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 })
  }
}
