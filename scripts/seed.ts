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

  // Dutch Golden Age
  { name: 'Gerard ter Borch', nationality: 'Dutch', birthYear: 1617, deathYear: 1681, difficulty: 3 },
  { name: 'Aelbert Cuyp', nationality: 'Dutch', birthYear: 1620, deathYear: 1691, difficulty: 3 },
  { name: 'Adriaen van Ostade', nationality: 'Dutch', birthYear: 1610, deathYear: 1685, difficulty: 3 },
  { name: 'Meindert Hobbema', nationality: 'Dutch', birthYear: 1638, deathYear: 1709, difficulty: 3 },
  { name: 'Jan Steen', nationality: 'Dutch', birthYear: 1626, deathYear: 1679, difficulty: 3 },
  { name: 'Frans van Mieris the Elder', nationality: 'Dutch', birthYear: 1635, deathYear: 1681, difficulty: 4 },

  // French Academic & Realist
  { name: 'Jean-Baptiste-Camille Corot', nationality: 'French', birthYear: 1796, deathYear: 1875, difficulty: 3 },
  { name: 'Jean-Léon Gérôme', nationality: 'French', birthYear: 1824, deathYear: 1904, difficulty: 3 },
  { name: 'William-Adolphe Bouguereau', nationality: 'French', birthYear: 1825, deathYear: 1905, difficulty: 3 },
  { name: 'Thomas Couture', nationality: 'French', birthYear: 1815, deathYear: 1879, difficulty: 4 },
  { name: 'Jean-Auguste-Dominique Ingres', nationality: 'French', birthYear: 1780, deathYear: 1867, difficulty: 3 },
  { name: 'Carolus-Duran', nationality: 'French', birthYear: 1837, deathYear: 1917, difficulty: 4 },

  // French Impressionists
  { name: 'Alfred Sisley', nationality: 'French', birthYear: 1839, deathYear: 1899, difficulty: 3 },
  { name: 'Camille Pissarro', nationality: 'French', birthYear: 1830, deathYear: 1903, difficulty: 3 },
  { name: 'Gustave Caillebotte', nationality: 'French', birthYear: 1848, deathYear: 1894, difficulty: 3 },
  { name: 'Berthe Morisot', nationality: 'French', birthYear: 1841, deathYear: 1895, difficulty: 3 },
  { name: 'Mary Cassatt', nationality: 'American', birthYear: 1844, deathYear: 1926, difficulty: 2 },
  { name: 'Armand Guillaumin', nationality: 'French', birthYear: 1841, deathYear: 1927, difficulty: 4 },

  // American
  { name: 'William Merritt Chase', nationality: 'American', birthYear: 1849, deathYear: 1916, difficulty: 3 },
  { name: 'Eastman Johnson', nationality: 'American', birthYear: 1824, deathYear: 1906, difficulty: 3 },
  { name: 'Thomas Eakins', nationality: 'American', birthYear: 1844, deathYear: 1916, difficulty: 3 },
  { name: 'Winslow Homer', nationality: 'American', birthYear: 1836, deathYear: 1910, difficulty: 2 },
  { name: 'John Singer Sargent', nationality: 'American', birthYear: 1856, deathYear: 1925, difficulty: 2 },
  { name: 'Childe Hassam', nationality: 'American', birthYear: 1859, deathYear: 1935, difficulty: 3 },
]

const TARGET_PER_ARTIST = 20
const SKIP_THRESHOLD = 15

// ---- Met Museum ----
async function fetchWithRetry(url: string, retries = 4, baseDelay = 2000): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url)
    if (res.ok) return res
    if (res.status === 403 || res.status === 429) {
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`  [Met] HTTP ${res.status} — waiting ${delay / 1000}s before retry ${attempt + 1}/${retries}...`)
      await new Promise((r) => setTimeout(r, delay))
    } else {
      return null // non-retryable error
    }
  }
  return null
}

async function fetchMetArtworksByArtist(artistName: string, limit = 60): Promise<number[]> {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&isPublicDomain=true&q=${encodeURIComponent(artistName)}`
  const res = await fetchWithRetry(url)
  if (!res) return []
  const data = await res.json()
  return (data.objectIDs ?? []).slice(0, limit)
}

async function fetchMetObject(objectId: number): Promise<any> {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
  const res = await fetchWithRetry(url)
  if (!res) return null
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
    if (obj.objectName !== 'Painting') continue
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

    await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`  [Met] Added ${count} paintings for ${artist.name}`)
  return count
}

async function main() {
  const reseed = process.argv.includes('--reseed')
  console.log(`Starting seed...${reseed ? ' (--reseed)' : ''}`)

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
    await seedPaintingsFromMet(artist, needed)

    await new Promise((r) => setTimeout(r, 300))
  }

  const totalArtists = await prisma.artist.count()
  const totalArtworks = await prisma.artwork.count()
  console.log(`\nDone! ${totalArtists} artists, ${totalArtworks} artworks in DB.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
