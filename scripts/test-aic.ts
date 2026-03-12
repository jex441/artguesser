/**
 * Verification script — checks AIC artist ID lookup and artwork attribution
 * for a small set of artists before committing to a full seed.
 *
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-aic.ts
 */

const TEST_ARTISTS = [
  'Vincent van Gogh',
  'Claude Monet',
  'Georges Seurat',
  'Winslow Homer',
  'Mary Cassatt',
]

const AIC_HEADERS = { 'AIC-User-Agent': 'Artle/1.0 (art guessing game)' }

async function lookupArtistId(name: string): Promise<{ id: number; title: string } | null> {
  const url = new URL('https://api.artic.edu/api/v1/agents/search')
  url.searchParams.set('q', name)
  url.searchParams.set('fields', 'id,title')
  url.searchParams.set('limit', '5')

  const res = await fetch(url.toString(), { headers: AIC_HEADERS })
  if (!res.ok) {
    console.log(`  Agent search HTTP ${res.status}`)
    return null
  }
  const data = await res.json()
  const agents: { id: number; title: string }[] = data.data ?? []

  console.log(`  Agent candidates: ${agents.map((a) => `"${a.title}" (${a.id})`).join(', ')}`)

  const normalized = name.toLowerCase()
  const exact = agents.find((a) => a.title?.toLowerCase() === normalized)
  return exact ?? agents[0] ?? null
}

async function fetchArtworksByArtistId(artistId: number): Promise<any[]> {
  const url = new URL('https://api.artic.edu/api/v1/artworks/search')
  url.searchParams.set('fields', 'id,title,artist_display,date_display,date_start,medium_display,classification_titles,image_id')
  url.searchParams.set('limit', '5')
  url.searchParams.set('query[term][artist_id]', String(artistId))

  const res = await fetch(url.toString(), { headers: AIC_HEADERS })
  if (!res.ok) {
    console.log(`  Artworks search HTTP ${res.status}`)
    return []
  }
  const data = await res.json()
  return data.data ?? []
}

async function main() {
  for (const name of TEST_ARTISTS) {
    console.log(`\n═══ ${name} ═══`)

    const agent = await lookupArtistId(name)
    if (!agent) {
      console.log('  ✗ No agent found')
      continue
    }
    console.log(`  ✓ Using agent: "${agent.title}" (id=${agent.id})`)

    const artworks = await fetchArtworksByArtistId(agent.id)
    if (artworks.length === 0) {
      console.log('  ✗ No artworks found for this agent ID')
      continue
    }

    for (const aw of artworks) {
      const isPainting = (aw.classification_titles ?? []).some(
        (c: string) => c.toLowerCase() === 'painting'
      )
      const hasImage = !!aw.image_id
      console.log(`  ${isPainting && hasImage ? '✓' : '~'} "${aw.title}"`)
      console.log(`      artist_display: ${aw.artist_display}`)
      console.log(`      date: ${aw.date_display} (start=${aw.date_start})`)
      console.log(`      medium: ${aw.medium_display}`)
      console.log(`      classifications: ${(aw.classification_titles ?? []).join(', ')}`)
      console.log(`      has image: ${hasImage}`)
    }

    await new Promise((r) => setTimeout(r, 500))
  }

  console.log('\nDone. Review output above — if artist_display matches and dates look right, AIC seeding is safe to run.')
}

main().catch(console.error)
