import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const body = await req.json()

  const allowed = ['title', 'artistName', 'year', 'medium', 'dimensions', 'description', 'museum', 'imageUrl']
  const data: Record<string, any> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key] === '' ? null : body[key]
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }

  const artwork = await prisma.artwork.update({ where: { id }, data })
  return NextResponse.json(artwork)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  await prisma.artwork.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
