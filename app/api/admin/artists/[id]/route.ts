import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizeArtistName } from '@/lib/utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const body = await req.json()

  const allowed = ['name', 'nationality', 'birthYear', 'deathYear', 'difficulty', 'bio']
  const data: Record<string, any> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key] === '' ? null : body[key]
  }
  if ('name' in data && data.name) {
    data.nameBasic = normalizeArtistName(data.name)
  }
  if ('birthYear' in data && data.birthYear !== null) data.birthYear = parseInt(data.birthYear)
  if ('deathYear' in data && data.deathYear !== null) data.deathYear = parseInt(data.deathYear)
  if ('difficulty' in data && data.difficulty !== null) data.difficulty = parseInt(data.difficulty)

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }

  const artist = await prisma.artist.update({ where: { id }, data })
  return NextResponse.json(artist)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  // Delete artworks first to avoid FK constraint
  await prisma.artwork.deleteMany({ where: { artistId: id } })
  await prisma.artist.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
