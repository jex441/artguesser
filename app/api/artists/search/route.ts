import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizeArtistName } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') ?? ''
  if (query.trim().length < 2) {
    return NextResponse.json({ artists: [] })
  }

  const normalized = normalizeArtistName(query)

  const artists = await prisma.artist.findMany({
    where: {
      nameBasic: {
        contains: normalized,
        mode: 'insensitive',
      },
    },
    select: { id: true, name: true, nationality: true, birthYear: true, deathYear: true },
    orderBy: { difficulty: 'asc' },
    take: 8,
  })

  return NextResponse.json({ artists })
}
