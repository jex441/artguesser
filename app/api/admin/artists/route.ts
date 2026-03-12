import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const PAGE_SIZE = 30

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const search = searchParams.get('search')?.trim() ?? ''
  const difficulty = searchParams.get('difficulty') ?? ''

  const where = {
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    ...(difficulty && { difficulty: parseInt(difficulty) }),
  }

  const [artists, total] = await Promise.all([
    prisma.artist.findMany({
      where,
      include: { _count: { select: { artworks: true } } },
      orderBy: { name: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.artist.count({ where }),
  ])

  return NextResponse.json({ artists, total, page, pageSize: PAGE_SIZE })
}
