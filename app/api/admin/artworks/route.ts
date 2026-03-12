import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const search = searchParams.get('search')?.trim() ?? ''
  const source = searchParams.get('source') ?? ''

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { artistName: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(source && { source }),
  }

  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where,
      include: { artist: { select: { id: true, name: true } } },
      orderBy: [{ artistName: 'asc' }, { year: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.artwork.count({ where }),
  ])

  return NextResponse.json({ artworks, total, page, pageSize: PAGE_SIZE })
}
