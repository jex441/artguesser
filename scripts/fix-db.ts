import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalizeArtistName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Medium strings that indicate the artwork is definitely NOT a painting
const NON_PAINTING_PATTERNS = [
  /\bsculptur/i,
  /\bbronze\b/i,
  /\bmarble\b/i,
  /\bterracotta\b/i,
  /\bceramic/i,
  /\bporcelain\b/i,
  /\betching\b/i,
  /\bengraving\b/i,
  /\blithograph/i,
  /\bwoodcut\b/i,
  /\bscreenprint/i,
  /\bsilkscreen\b/i,
  /\bphotograph/i,
  /\bgelatin silver\b/i,
  /\bgelatin print\b/i,
  /\bchromogenic\b/i,
  /\bdrawing\b/i,
  /\bpencil\b/i,
  /\bcharcoal\b/i,
  /\bink on paper\b/i,
  /\btapestry\b/i,
  /\btextile\b/i,
  /\bembroidery\b/i,
  /\bcast iron\b/i,
  /\bsteel\b/i,
  /\bwood carv/i,
  /\brelief\b/i,
  /\bprint\b/i,
]

function isNotPainting(medium: string | null): boolean {
  if (!medium) return false // can't tell — keep it
  return NON_PAINTING_PATTERNS.some((re) => re.test(medium))
}

async function fixChildsBath() {
  console.log('\n--- Fix: "The Child\'s Bath" → Mary Cassatt ---')

  const artwork = await prisma.artwork.findFirst({
    where: { title: { contains: "Child's Bath", mode: 'insensitive' } },
    include: { artist: true },
  })

  if (!artwork) {
    console.log('Artwork not found, skipping.')
    return
  }

  console.log(`Found "${artwork.title}" currently attributed to "${artwork.artist.name}"`)

  // Find or create Mary Cassatt
  let cassatt = await prisma.artist.findFirst({
    where: { name: { equals: 'Mary Cassatt', mode: 'insensitive' } },
  })

  if (!cassatt) {
    console.log('Creating Mary Cassatt artist record...')
    cassatt = await prisma.artist.create({
      data: {
        name: 'Mary Cassatt',
        nameBasic: normalizeArtistName('Mary Cassatt'),
        nationality: 'American',
        birthYear: 1844,
        deathYear: 1926,
        difficulty: 2,
      },
    })
    console.log(`Created Mary Cassatt (id=${cassatt.id})`)
  } else {
    console.log(`Found existing Mary Cassatt (id=${cassatt.id})`)
  }

  await prisma.artwork.update({
    where: { id: artwork.id },
    data: {
      artistId: cassatt.id,
      artistName: cassatt.name,
      artistNameBasic: cassatt.nameBasic,
    },
  })

  console.log(`Reassigned "${artwork.title}" to Mary Cassatt.`)
}

async function removeWrongMichelangeloSelfPortrait() {
  console.log('\n--- Fix: Remove incorrectly attributed Michelangelo self portrait ---')

  const michelangelo = await prisma.artist.findFirst({
    where: { name: { equals: 'Michelangelo', mode: 'insensitive' } },
  })

  if (!michelangelo) {
    console.log('Michelangelo artist not found, skipping.')
    return
  }

  const portrait = await prisma.artwork.findFirst({
    where: {
      artistId: michelangelo.id,
      title: { contains: 'self portrait', mode: 'insensitive' },
    },
  })

  if (!portrait) {
    console.log('No self portrait found under Michelangelo, skipping.')
    return
  }

  console.log(`Deleting "${portrait.title}" (id=${portrait.id}) from Michelangelo.`)
  await prisma.artwork.delete({ where: { id: portrait.id } })
  console.log('Deleted.')
}

async function removeWrongDaVinciSaintLuke() {
  console.log('\n--- Fix: Remove incorrectly attributed da Vinci "Saint Luke Drawing the Virgin" ---')

  const davinci = await prisma.artist.findFirst({
    where: { name: { equals: 'Leonardo da Vinci', mode: 'insensitive' } },
  })

  if (!davinci) {
    console.log('Leonardo da Vinci artist not found, skipping.')
    return
  }

  const painting = await prisma.artwork.findFirst({
    where: {
      artistId: davinci.id,
      title: { contains: 'Saint Luke', mode: 'insensitive' },
    },
  })

  if (!painting) {
    console.log('Painting not found under Leonardo da Vinci, skipping.')
    return
  }

  console.log(`Deleting "${painting.title}" (id=${painting.id}) from Leonardo da Vinci.`)
  await prisma.artwork.delete({ where: { id: painting.id } })
  console.log('Deleted.')
}

async function removeNonPaintings() {
  console.log('\n--- Removing non-painting artworks based on medium ---')

  const artworks = await prisma.artwork.findMany({
    select: { id: true, title: true, medium: true, artistName: true },
  })

  const toDelete = artworks.filter((a) => isNotPainting(a.medium))

  if (toDelete.length === 0) {
    console.log('No non-painting artworks found.')
    return
  }

  console.log(`Found ${toDelete.length} non-paintings to remove:`)
  for (const a of toDelete) {
    console.log(`  [${a.id}] "${a.title}" by ${a.artistName} — medium: ${a.medium}`)
  }

  await prisma.artwork.deleteMany({
    where: { id: { in: toDelete.map((a) => a.id) } },
  })

  console.log(`Deleted ${toDelete.length} non-painting artworks.`)
}

async function main() {
  await fixChildsBath()
  await removeWrongMichelangeloSelfPortrait()
  await removeWrongDaVinciSaintLuke()
  await removeNonPaintings()

  const totalArtworks = await prisma.artwork.count()
  console.log(`\nDone. ${totalArtworks} artworks remaining in DB.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
