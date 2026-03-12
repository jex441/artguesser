import { PrismaClient } from '@prisma/client'
import { normalizeArtistName } from '../lib/utils'

const prisma = new PrismaClient()

async function main() {
  // Find the incorrectly named artist
  // List all artists for debugging
  const all = await prisma.artist.findMany({ select: { id: true, name: true } })
  console.log('All artists:', all.map(a => `${a.id}: ${a.name}`).join('\n'))

  const wrong = await prisma.artist.findFirst({
    where: {
      OR: [
        { name: { contains: 'Merisi', mode: 'insensitive' } },
        { name: { contains: 'Michelangelo', mode: 'insensitive' } },
      ],
    },
    include: { artworks: true },
  })

  if (!wrong) {
    console.log('No matching artist found — nothing to fix.')
    return
  }

  console.log(`\nProceeding with: "${wrong.name}" (id=${wrong.id})`)

  console.log(`Found: "${wrong.name}" (id=${wrong.id}) with ${wrong.artworks.length} artworks`)

  // Check if a proper Caravaggio entry already exists
  const caravaggio = await prisma.artist.findFirst({
    where: { name: { equals: 'Caravaggio', mode: 'insensitive' } },
  })

  if (caravaggio && caravaggio.id !== wrong.id) {
    // Merge: move artworks to the existing Caravaggio entry, delete the wrong one
    console.log(`Merging into existing Caravaggio (id=${caravaggio.id})`)
    await prisma.artwork.updateMany({
      where: { artistId: wrong.id },
      data: {
        artistId: caravaggio.id,
        artistName: caravaggio.name,
        artistNameBasic: caravaggio.nameBasic,
      },
    })
    await prisma.artist.delete({ where: { id: wrong.id } })
    console.log(`Moved ${wrong.artworks.length} artworks to Caravaggio and deleted duplicate.`)
  } else {
    // Rename in place
    const updated = await prisma.artist.update({
      where: { id: wrong.id },
      data: {
        name: 'Caravaggio',
        nameBasic: normalizeArtistName('Caravaggio'),
      },
    })
    await prisma.artwork.updateMany({
      where: { artistId: wrong.id },
      data: {
        artistName: updated.name,
        artistNameBasic: updated.nameBasic,
      },
    })
    console.log(`Renamed to "Caravaggio" and updated ${wrong.artworks.length} artworks.`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
