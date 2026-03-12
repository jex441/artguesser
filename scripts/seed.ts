import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalizeArtistName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Curated list of artists with difficulty ratings
const ARTISTS: Array<{
  name: string
  nationality?: string
  birthYear?: number
  deathYear?: number
  difficulty: 1 | 2 | 3 | 4
  bio?: string
}> = [
  // Difficulty 1 - Most famous
  { name: 'Vincent van Gogh', nationality: 'Dutch', birthYear: 1853, deathYear: 1890, difficulty: 1 },
  { name: 'Leonardo da Vinci', nationality: 'Italian', birthYear: 1452, deathYear: 1519, difficulty: 1 },
  { name: 'Pablo Picasso', nationality: 'Spanish', birthYear: 1881, deathYear: 1973, difficulty: 1 },
  { name: 'Claude Monet', nationality: 'French', birthYear: 1840, deathYear: 1926, difficulty: 1 },
  { name: 'Rembrandt van Rijn', nationality: 'Dutch', birthYear: 1606, deathYear: 1669, difficulty: 1 },
  { name: 'Michelangelo', nationality: 'Italian', birthYear: 1475, deathYear: 1564, difficulty: 1 },
  { name: 'Salvador Dalí', nationality: 'Spanish', birthYear: 1904, deathYear: 1989, difficulty: 1 },
  { name: 'Frida Kahlo', nationality: 'Mexican', birthYear: 1907, deathYear: 1954, difficulty: 1 },
  { name: 'Andy Warhol', nationality: 'American', birthYear: 1928, deathYear: 1987, difficulty: 1 },
  { name: 'Édouard Manet', nationality: 'French', birthYear: 1832, deathYear: 1883, difficulty: 1 },

  // Difficulty 2
  { name: 'Johannes Vermeer', nationality: 'Dutch', birthYear: 1632, deathYear: 1675, difficulty: 2 },
  { name: 'Pierre-Auguste Renoir', nationality: 'French', birthYear: 1841, deathYear: 1919, difficulty: 2 },
  { name: 'Edgar Degas', nationality: 'French', birthYear: 1834, deathYear: 1917, difficulty: 2 },
  { name: 'Paul Cézanne', nationality: 'French', birthYear: 1839, deathYear: 1906, difficulty: 2 },
  { name: 'Georges Seurat', nationality: 'French', birthYear: 1859, deathYear: 1891, difficulty: 2 },
  { name: 'Paul Gauguin', nationality: 'French', birthYear: 1848, deathYear: 1903, difficulty: 2 },
  { name: 'Henri Matisse', nationality: 'French', birthYear: 1869, deathYear: 1954, difficulty: 2 },
  { name: 'Wassily Kandinsky', nationality: 'Russian', birthYear: 1866, deathYear: 1944, difficulty: 2 },
  { name: 'Edward Hopper', nationality: 'American', birthYear: 1882, deathYear: 1967, difficulty: 2 },
  { name: 'Jackson Pollock', nationality: 'American', birthYear: 1912, deathYear: 1956, difficulty: 2 },
  { name: 'Grant Wood', nationality: 'American', birthYear: 1891, deathYear: 1942, difficulty: 2 },
  { name: "Georgia O'Keeffe", nationality: 'American', birthYear: 1887, deathYear: 1986, difficulty: 2 },
  { name: 'Marc Chagall', nationality: 'Belarusian-French', birthYear: 1887, deathYear: 1985, difficulty: 2 },
  { name: 'Gustav Klimt', nationality: 'Austrian', birthYear: 1862, deathYear: 1918, difficulty: 2 },
  { name: 'Egon Schiele', nationality: 'Austrian', birthYear: 1890, deathYear: 1918, difficulty: 2 },

  // Difficulty 3
  { name: 'Hieronymus Bosch', nationality: 'Dutch', birthYear: 1450, deathYear: 1516, difficulty: 3 },
  { name: 'Francisco Goya', nationality: 'Spanish', birthYear: 1746, deathYear: 1828, difficulty: 3 },
  { name: 'Eugène Delacroix', nationality: 'French', birthYear: 1798, deathYear: 1863, difficulty: 3 },
  { name: 'Caravaggio', nationality: 'Italian', birthYear: 1571, deathYear: 1610, difficulty: 3 },
  { name: 'Paul Klee', nationality: 'Swiss-German', birthYear: 1879, deathYear: 1940, difficulty: 3 },
  { name: 'Piet Mondrian', nationality: 'Dutch', birthYear: 1872, deathYear: 1944, difficulty: 3 },
  { name: 'Joan Miró', nationality: 'Spanish', birthYear: 1893, deathYear: 1983, difficulty: 3 },
  { name: 'René Magritte', nationality: 'Belgian', birthYear: 1898, deathYear: 1967, difficulty: 3 },
  { name: 'Mark Rothko', nationality: 'American', birthYear: 1903, deathYear: 1970, difficulty: 3 },
  { name: 'Jean-Michel Basquiat', nationality: 'American', birthYear: 1960, deathYear: 1988, difficulty: 3 },
  { name: 'Cy Twombly', nationality: 'American', birthYear: 1928, deathYear: 2011, difficulty: 3 },
  { name: 'Lucian Freud', nationality: 'British', birthYear: 1922, deathYear: 2011, difficulty: 3 },

  // Difficulty 4 - Most obscure
  { name: 'Luca Signorelli', nationality: 'Italian', birthYear: 1450, deathYear: 1523, difficulty: 4 },
  { name: 'Rogier van der Weyden', nationality: 'Flemish', birthYear: 1400, deathYear: 1464, difficulty: 4 },
  { name: 'Hans Memling', nationality: 'Flemish', birthYear: 1430, deathYear: 1494, difficulty: 4 },
  { name: 'Gentile da Fabriano', nationality: 'Italian', birthYear: 1370, deathYear: 1427, difficulty: 4 },
  { name: 'Hendrick Goltzius', nationality: 'Dutch', birthYear: 1558, deathYear: 1617, difficulty: 4 },
  { name: 'Adriaen Brouwer', nationality: 'Flemish', birthYear: 1605, deathYear: 1638, difficulty: 4 },
  { name: 'Odd Nerdrum', nationality: 'Norwegian', birthYear: 1944, difficulty: 4 },
  { name: 'Balthus', nationality: 'French', birthYear: 1908, deathYear: 2001, difficulty: 4 },
]

const TARGET_PER_ARTIST = 20
const SKIP_THRESHOLD = 15

// ---- AIC (Art Institute of Chicago) ----

// Look up the AIC internal artist ID so we can filter artworks precisely by artist,
// avoiding the full-text search misattribution problem.
async function fetchAICArtistId(artistName: string): Promise<number | null> {
  const url = new URL('https://api.artic.edu/api/v1/agents/search')
  url.searchParams.set('q', artistName)
  url.searchParams.set('fields', 'id,title')
  url.searchParams.set('limit', '5')

  const res = await fetch(url.toString(), {
    headers: { 'AIC-User-Agent': 'Artle/1.0 (art guessing game)' },
  })
  if (!res.ok) return null
  const data = await res.json()
  const agents: any[] = data.data ?? []

  // Pick the agent whose name most closely matches (case-insensitive exact first)
  const normalized = artistName.toLowerCase()
  const exact = agents.find((a) => a.title?.toLowerCase() === normalized)
  return exact?.id ?? agents[0]?.id ?? null
}

async function fetchAICPageByArtistId(artistId: number, page = 1, perPage = 25): Promise<any[]> {
  const url = new URL('https://api.artic.edu/api/v1/artworks/search')
  url.searchParams.set('fields', 'id,title,artist_display,date_start,medium_display,dimensions,image_id,description,classification_titles')
  url.searchParams.set('limit', String(perPage))
  url.searchParams.set('page', String(page))
  // Filter strictly to this artist's ID — no full-text bleed
  url.searchParams.set('query[term][artist_id]', String(artistId))

  const res = await fetch(url.toString(), {
    headers: { 'AIC-User-Agent': 'Artle/1.0 (art guessing game)' },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.data ?? []
}

function isPainting(item: any): boolean {
  const classifications: string[] = item.classification_titles ?? []
  return classifications.some((c: string) => c.toLowerCase() === 'painting')
}

function aicImageUrl(imageId: string): string {
  return `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`
}

// ---- Met Museum ----
async function fetchMetArtworksByArtist(artistName: string, limit = 60): Promise<number[]> {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&q=${encodeURIComponent(artistName)}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return (data.objectIDs ?? []).slice(0, limit)
}

async function fetchMetObject(objectId: number): Promise<any> {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

// Verify the Met object's artist matches who we expect (handles misattributions from broad search)
function metArtistMatches(obj: any, artistName: string): boolean {
  const display: string = obj.artistDisplayName ?? ''
  if (!display) return false
  const normalized = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  return normalized(display).includes(normalized(artistName)) ||
    normalized(artistName).includes(normalized(display))
}

async function seedArtist(artistData: typeof ARTISTS[number]) {
  const artist = await prisma.artist.upsert({
    where: { name: artistData.name },
    update: {
      difficulty: artistData.difficulty,
      nationality: artistData.nationality,
      birthYear: artistData.birthYear,
      deathYear: artistData.deathYear,
    },
    create: {
      name: artistData.name,
      nameBasic: normalizeArtistName(artistData.name),
      nationality: artistData.nationality,
      birthYear: artistData.birthYear,
      deathYear: artistData.deathYear,
      difficulty: artistData.difficulty,
    },
  })
  return artist
}

async function seedPaintingsFromAIC(
  artist: { id: number; name: string },
  needed: number,
): Promise<number> {
  console.log(`  [AIC] Fetching paintings for ${artist.name}...`)

  const aicArtistId = await fetchAICArtistId(artist.name)
  if (!aicArtistId) {
    console.log(`  [AIC] No AIC artist record found for ${artist.name}, skipping.`)
    return 0
  }
  console.log(`  [AIC] Found AIC artist id=${aicArtistId}`)

  let count = 0
  const maxPages = 4

  for (let page = 1; page <= maxPages && count < needed; page++) {
    const items = await fetchAICPageByArtistId(aicArtistId, page, 25)
    if (items.length === 0) break

    for (const item of items) {
      if (count >= needed) break
      if (!item.image_id) continue
      if (!isPainting(item)) continue

      const existing = await prisma.artwork.findFirst({
        where: { source: 'aic', sourceId: String(item.id) },
      })
      if (existing) continue

      try {
        await prisma.artwork.create({
          data: {
            title: item.title ?? 'Untitled',
            artistId: artist.id,
            artistName: artist.name,
            artistNameBasic: normalizeArtistName(artist.name),
            imageUrl: aicImageUrl(item.image_id),
            year: item.date_start ?? null,
            medium: item.medium_display ?? null,
            dimensions: item.dimensions ?? null,
            description: item.description
              ? item.description.replace(/<[^>]*>/g, '').slice(0, 500)
              : null,
            museum: 'Art Institute of Chicago',
            source: 'aic',
            sourceId: String(item.id),
          },
        })
        count++
      } catch {
        // skip duplicate or error
      }
    }

    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`  [AIC] Added ${count} paintings for ${artist.name}`)
  return count
}

async function seedPaintingsFromMet(
  artist: { id: number; name: string },
  needed: number,
): Promise<number> {
  console.log(`  [Met] Fetching paintings for ${artist.name}...`)
  const objectIds = await fetchMetArtworksByArtist(artist.name, 80)
  let count = 0

  for (const objectId of objectIds) {
    if (count >= needed) break

    const existing = await prisma.artwork.findFirst({
      where: { source: 'met', sourceId: String(objectId) },
    })
    if (existing) continue

    const obj = await fetchMetObject(objectId)
    if (!obj || !obj.primaryImage) continue
    // Only paintings
    if (obj.objectName !== 'Painting') continue
    // Verify the Met's own attribution matches the artist we're seeding
    if (!metArtistMatches(obj, artist.name)) continue

    try {
      await prisma.artwork.create({
        data: {
          title: obj.title ?? 'Untitled',
          artistId: artist.id,
          artistName: artist.name,
          artistNameBasic: normalizeArtistName(artist.name),
          imageUrl: obj.primaryImage,
          year: obj.objectBeginDate ?? null,
          medium: obj.medium ?? null,
          dimensions: obj.dimensions ?? null,
          description: null,
          museum: 'The Metropolitan Museum of Art',
          source: 'met',
          sourceId: String(objectId),
        },
      })
      count++
    } catch {
      // skip
    }

    await new Promise((r) => setTimeout(r, 100))
  }

  console.log(`  [Met] Added ${count} paintings for ${artist.name}`)
  return count
}

async function main() {
  const reseed = process.argv.includes('--reseed')
  const metOnly = process.argv.includes('--met-only')
  console.log(`Starting seed...${reseed ? ' (--reseed)' : ''}${metOnly ? ' (--met-only)' : ''}`)

  if (reseed) {
    const deleted = await prisma.artwork.deleteMany({})
    console.log(`Cleared ${deleted.count} artworks from DB.`)
  }

  for (const artistData of ARTISTS) {
    console.log(`\nProcessing: ${artistData.name}`)
    const artist = await seedArtist(artistData)

    const existing = await prisma.artwork.count({ where: { artistId: artist.id } })
    if (existing >= SKIP_THRESHOLD) {
      console.log(`  Already has ${existing} artworks, skipping`)
      continue
    }

    const needed = TARGET_PER_ARTIST - existing

    if (!metOnly) {
      await seedPaintingsFromAIC(artist, needed)
    }

    const afterAIC = await prisma.artwork.count({ where: { artistId: artist.id } })
    const stillNeeded = TARGET_PER_ARTIST - afterAIC
    if (stillNeeded > 0) {
      await seedPaintingsFromMet(artist, stillNeeded)
    }

    await new Promise((r) => setTimeout(r, 300))
  }

  const totalArtists = await prisma.artist.count()
  const totalArtworks = await prisma.artwork.count()
  console.log(`\nDone! ${totalArtists} artists, ${totalArtworks} artworks in DB.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
