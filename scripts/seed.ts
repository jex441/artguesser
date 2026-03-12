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

  // Italian Renaissance
  { name: 'Raphael', nationality: 'Italian', birthYear: 1483, deathYear: 1520, difficulty: 2 },
  { name: 'Titian', nationality: 'Italian', birthYear: 1488, deathYear: 1576, difficulty: 2 },
  { name: 'Tintoretto', nationality: 'Italian', birthYear: 1518, deathYear: 1594, difficulty: 3 },
  { name: 'Paolo Veronese', nationality: 'Italian', birthYear: 1528, deathYear: 1588, difficulty: 3 },
  { name: 'Correggio', nationality: 'Italian', birthYear: 1489, deathYear: 1534, difficulty: 3 },
  { name: 'Bronzino', nationality: 'Italian', birthYear: 1503, deathYear: 1572, difficulty: 3 },
  { name: 'Botticelli', nationality: 'Italian', birthYear: 1445, deathYear: 1510, difficulty: 2 },
  { name: 'Fra Angelico', nationality: 'Italian', birthYear: 1395, deathYear: 1455, difficulty: 3 },
  { name: 'Giovanni Bellini', nationality: 'Italian', birthYear: 1430, deathYear: 1516, difficulty: 3 },
  { name: 'Andrea Mantegna', nationality: 'Italian', birthYear: 1431, deathYear: 1506, difficulty: 3 },
  { name: 'Lorenzo Lotto', nationality: 'Italian', birthYear: 1480, deathYear: 1557, difficulty: 4 },
  { name: 'Artemisia Gentileschi', nationality: 'Italian', birthYear: 1593, deathYear: 1656, difficulty: 3 },
  { name: 'Giovanni Battista Tiepolo', nationality: 'Italian', birthYear: 1696, deathYear: 1770, difficulty: 3 },
  { name: 'Canaletto', nationality: 'Italian', birthYear: 1697, deathYear: 1768, difficulty: 3 },

  // Spanish
  { name: 'Diego Velázquez', nationality: 'Spanish', birthYear: 1599, deathYear: 1660, difficulty: 2 },
  { name: 'El Greco', nationality: 'Greek-Spanish', birthYear: 1541, deathYear: 1614, difficulty: 2 },
  { name: 'Bartolomé Esteban Murillo', nationality: 'Spanish', birthYear: 1617, deathYear: 1682, difficulty: 3 },
  { name: 'Jusepe de Ribera', nationality: 'Spanish', birthYear: 1591, deathYear: 1652, difficulty: 4 },

  // French Old Masters
  { name: 'Nicolas Poussin', nationality: 'French', birthYear: 1594, deathYear: 1665, difficulty: 3 },
  { name: 'Claude Lorrain', nationality: 'French', birthYear: 1600, deathYear: 1682, difficulty: 3 },
  { name: 'Antoine Watteau', nationality: 'French', birthYear: 1684, deathYear: 1721, difficulty: 3 },
  { name: 'Jean-Honoré Fragonard', nationality: 'French', birthYear: 1732, deathYear: 1806, difficulty: 3 },
  { name: 'François Boucher', nationality: 'French', birthYear: 1703, deathYear: 1770, difficulty: 3 },
  { name: 'Jacques-Louis David', nationality: 'French', birthYear: 1748, deathYear: 1825, difficulty: 3 },
  { name: 'Jean-Baptiste-Siméon Chardin', nationality: 'French', birthYear: 1699, deathYear: 1779, difficulty: 3 },
  { name: 'Élisabeth Vigée Le Brun', nationality: 'French', birthYear: 1755, deathYear: 1842, difficulty: 3 },
  { name: 'Gustave Courbet', nationality: 'French', birthYear: 1819, deathYear: 1877, difficulty: 3 },
  { name: 'Henri de Toulouse-Lautrec', nationality: 'French', birthYear: 1864, deathYear: 1901, difficulty: 3 },

  // British
  { name: 'Thomas Gainsborough', nationality: 'British', birthYear: 1727, deathYear: 1788, difficulty: 3 },
  { name: 'Joshua Reynolds', nationality: 'British', birthYear: 1723, deathYear: 1792, difficulty: 3 },
  { name: 'J.M.W. Turner', nationality: 'British', birthYear: 1775, deathYear: 1851, difficulty: 2 },
  { name: 'John Constable', nationality: 'British', birthYear: 1776, deathYear: 1837, difficulty: 2 },
  { name: 'William Hogarth', nationality: 'British', birthYear: 1697, deathYear: 1764, difficulty: 3 },
  { name: 'George Romney', nationality: 'British', birthYear: 1734, deathYear: 1802, difficulty: 4 },

  // German/Northern European
  { name: 'Albrecht Dürer', nationality: 'German', birthYear: 1471, deathYear: 1528, difficulty: 2 },
  { name: 'Lucas Cranach the Elder', nationality: 'German', birthYear: 1472, deathYear: 1553, difficulty: 3 },
  { name: 'Hans Holbein the Younger', nationality: 'German', birthYear: 1497, deathYear: 1543, difficulty: 3 },

  // More Dutch Golden Age
  { name: 'Frans Hals', nationality: 'Dutch', birthYear: 1582, deathYear: 1666, difficulty: 2 },
  { name: 'Pieter de Hooch', nationality: 'Dutch', birthYear: 1629, deathYear: 1684, difficulty: 3 },
  { name: 'Jacob van Ruisdael', nationality: 'Dutch', birthYear: 1628, deathYear: 1682, difficulty: 3 },
  { name: 'Gabriel Metsu', nationality: 'Dutch', birthYear: 1629, deathYear: 1667, difficulty: 4 },
  { name: 'Gerrit Dou', nationality: 'Dutch', birthYear: 1613, deathYear: 1675, difficulty: 4 },
  { name: 'Pieter Claesz', nationality: 'Dutch', birthYear: 1597, deathYear: 1660, difficulty: 4 },
  { name: 'Willem Claesz. Heda', nationality: 'Dutch', birthYear: 1594, deathYear: 1680, difficulty: 4 },
  { name: 'Jan Davidsz. de Heem', nationality: 'Dutch', birthYear: 1606, deathYear: 1684, difficulty: 4 },

  // American Landscape & Genre (Hudson River / Luminism)
  { name: 'Frederic Edwin Church', nationality: 'American', birthYear: 1826, deathYear: 1900, difficulty: 3 },
  { name: 'Albert Bierstadt', nationality: 'American', birthYear: 1830, deathYear: 1902, difficulty: 3 },
  { name: 'Thomas Cole', nationality: 'American', birthYear: 1801, deathYear: 1848, difficulty: 3 },
  { name: 'Asher B. Durand', nationality: 'American', birthYear: 1796, deathYear: 1886, difficulty: 4 },
  { name: 'Martin Johnson Heade', nationality: 'American', birthYear: 1819, deathYear: 1904, difficulty: 4 },
  { name: 'George Inness', nationality: 'American', birthYear: 1825, deathYear: 1894, difficulty: 4 },
  { name: 'William Sidney Mount', nationality: 'American', birthYear: 1807, deathYear: 1868, difficulty: 4 },
  { name: 'George Caleb Bingham', nationality: 'American', birthYear: 1811, deathYear: 1879, difficulty: 4 },
]

const TARGET_PER_ARTIST = 20
const SKIP_THRESHOLD = 15

// ---- AIC (Art Institute of Chicago) ----
const AIC_HEADERS = { 'AIC-User-Agent': 'Artle/1.0 (art guessing game)' }

async function fetchAICArtistId(name: string): Promise<number | null> {
  const url = new URL('https://api.artic.edu/api/v1/agents/search')
  url.searchParams.set('q', name)
  url.searchParams.set('fields', 'id,title')
  url.searchParams.set('limit', '5')
  const res = await fetch(url.toString(), { headers: AIC_HEADERS })
  if (!res.ok) return null
  const agents: { id: number; title: string }[] = (await res.json()).data ?? []
  const exact = agents.find((a) => a.title?.toLowerCase() === name.toLowerCase())
  return exact?.id ?? agents[0]?.id ?? null
}

async function fetchAICPaintingsByArtistId(artistId: number, page = 1): Promise<any[]> {
  const url = new URL('https://api.artic.edu/api/v1/artworks/search')
  url.searchParams.set('fields', 'id,title,artist_display,date_start,medium_display,dimensions,image_id,description,classification_titles')
  url.searchParams.set('limit', '25')
  url.searchParams.set('page', String(page))
  url.searchParams.set('query[term][artist_id]', String(artistId))
  const res = await fetch(url.toString(), { headers: AIC_HEADERS })
  if (!res.ok) return []
  return (await res.json()).data ?? []
}

function isAICPainting(item: any): boolean {
  return (item.classification_titles ?? []).some((c: string) => c.toLowerCase() === 'painting')
}

function aicImageUrl(imageId: string): string {
  return `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`
}

async function seedPaintingsFromAIC(artist: { id: number; name: string }, needed: number): Promise<number> {
  console.log(`  [AIC] Looking up artist...`)
  const aicId = await fetchAICArtistId(artist.name)
  if (!aicId) {
    console.log(`  [AIC] No agent found, skipping.`)
    return 0
  }
  console.log(`  [AIC] Agent id=${aicId}, fetching paintings...`)

  let count = 0
  for (let page = 1; page <= 4 && count < needed; page++) {
    const items = await fetchAICPaintingsByArtistId(aicId, page)
    if (items.length === 0) break

    for (const item of items) {
      if (count >= needed) break
      if (!item.image_id || !isAICPainting(item)) continue

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
            description: item.description ? item.description.replace(/<[^>]*>/g, '').slice(0, 500) : null,
            museum: 'Art Institute of Chicago',
            source: 'aic',
            sourceId: String(item.id),
          },
        })
        count++
      } catch {
        // skip duplicate
      }
    }
    await new Promise((r) => setTimeout(r, 300))
  }

  console.log(`  [AIC] Added ${count} paintings`)
  return count
}

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

// Met department IDs for paintings — narrows search results so we fetch far
// fewer individual object pages (the main cause of rate limiting).
// 11 = European Paintings, 21 = Modern Art, 1 = American Paintings & Sculpture
function paintingDepartmentId(nationality: string | undefined): number | null {
  if (!nationality) return null
  const n = nationality.toLowerCase()
  if (n.includes('american')) return 1
  if (
    n.includes('french') || n.includes('dutch') || n.includes('flemish') ||
    n.includes('italian') || n.includes('spanish') || n.includes('german') ||
    n.includes('british') || n.includes('austrian') || n.includes('belgian') ||
    n.includes('norwegian') || n.includes('russian') || n.includes('belarusian') ||
    n.includes('greek') || n.includes('swiss') || n.includes('mexican')
  ) return 11
  return null
}

async function fetchMetArtworksByArtist(
  artistName: string,
  nationality: string | undefined,
  limit = 40,
): Promise<number[]> {
  const deptId = paintingDepartmentId(nationality)
  const base = `https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&isPublicDomain=true`
  const dept = deptId != null ? `&departmentId=${deptId}` : ''
  const url = `${base}${dept}&q=${encodeURIComponent(artistName)}`
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
  artist: { id: number; name: string; nationality?: string },
  needed: number,
): Promise<number> {
  console.log(`  [Met] Fetching paintings for ${artist.name}...`)
  const objectIds = await fetchMetArtworksByArtist(artist.name, artist.nationality)
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
  const batchArg = process.argv.find((a) => a.startsWith('--batch='))
  const batchSize = batchArg ? parseInt(batchArg.split('=')[1]) : null
  const artists = batchSize ? ARTISTS.slice(0, batchSize) : ARTISTS

  console.log(`Starting seed... (${artists.length} artists${batchSize ? ' — test batch' : ''})`)

  for (const artistData of artists) {
    console.log(`\nProcessing: ${artistData.name}`)
    const artist = await seedArtist(artistData)

    const existing = await prisma.artwork.count({ where: { artistId: artist.id } })
    if (existing >= SKIP_THRESHOLD) {
      console.log(`  Already has ${existing} artworks, skipping`)
      continue
    }

    const needed = TARGET_PER_ARTIST - existing

    // Try AIC first, top up with Met
    const aicAdded = await seedPaintingsFromAIC(artist, needed)
    const stillNeeded = needed - aicAdded
    if (stillNeeded > 0) {
      await seedPaintingsFromMet(
        { ...artist, nationality: artist.nationality ?? undefined },
        stillNeeded,
      )
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
