'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

// ── Types ──────────────────────────────────────────────────────────────────

interface ArtworkRow {
  id: number
  title: string
  artistId: number
  artistName: string
  year: number | null
  medium: string | null
  dimensions: string | null
  description: string | null
  museum: string | null
  imageUrl: string
  source: string | null
  sourceId: string | null
}

interface ArtistRow {
  id: number
  name: string
  nationality: string | null
  birthYear: number | null
  deathYear: number | null
  difficulty: number
  bio: string | null
  _count: { artworks: number }
}

// ── Shared helpers ─────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function Pagination({
  page, total, pageSize, onChange,
}: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  return (
    <div className="flex items-center gap-2 text-sm text-stone-500">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-2 py-1 border border-stone-200 rounded-sm disabled:opacity-30 hover:border-stone-400"
      >←</button>
      <span>{page} / {pages} <span className="text-stone-400">({total} total)</span></span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="px-2 py-1 border border-stone-200 rounded-sm disabled:opacity-30 hover:border-stone-400"
      >→</button>
    </div>
  )
}

// ── Artwork row ────────────────────────────────────────────────────────────

function ArtworkRow({ row, onSave, onDelete }: {
  row: ArtworkRow
  onSave: (id: number, data: Partial<ArtworkRow>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(row)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function set(field: keyof ArtworkRow, value: string) {
    setDraft((d) => ({ ...d, [field]: value }))
  }

  async function save() {
    setSaving(true)
    await onSave(row.id, {
      title: draft.title,
      artistName: draft.artistName,
      year: draft.year ? Number(draft.year) : null,
      medium: draft.medium || null,
      dimensions: draft.dimensions || null,
      museum: draft.museum || null,
      imageUrl: draft.imageUrl,
    })
    setSaving(false)
    setEditing(false)
  }

  function cancel() {
    setDraft(row)
    setEditing(false)
    setConfirming(false)
  }

  const field = 'border-b border-stone-200 bg-white px-1 py-0.5 text-sm w-full focus:outline-none focus:border-stone-500'

  return (
    <tr className="border-b border-stone-100 hover:bg-stone-50/50 group">
      {/* Thumbnail */}
      <td className="py-2 px-3 w-16">
        <div className="relative w-12 h-12 bg-stone-100 rounded-sm overflow-hidden flex-shrink-0">
          <Image src={row.imageUrl} alt={row.title} fill className="object-cover" sizes="48px" />
        </div>
      </td>

      {/* Title */}
      <td className="py-2 px-3">
        {editing ? (
          <input className={field} value={draft.title} onChange={(e) => set('title', e.target.value)} />
        ) : (
          <span className="text-sm font-serif text-stone-800">{row.title}</span>
        )}
      </td>

      {/* Artist */}
      <td className="py-2 px-3">
        {editing ? (
          <input className={field} value={draft.artistName} onChange={(e) => set('artistName', e.target.value)} />
        ) : (
          <span className="text-sm text-stone-600">{row.artistName}</span>
        )}
      </td>

      {/* Year */}
      <td className="py-2 px-3 w-20">
        {editing ? (
          <input className={field} type="number" value={draft.year ?? ''} onChange={(e) => set('year', e.target.value)} />
        ) : (
          <span className="text-sm text-stone-500">{row.year ?? '—'}</span>
        )}
      </td>

      {/* Medium */}
      <td className="py-2 px-3">
        {editing ? (
          <input className={field} value={draft.medium ?? ''} onChange={(e) => set('medium', e.target.value)} />
        ) : (
          <span className="text-xs text-stone-400 italic">{row.medium ?? '—'}</span>
        )}
      </td>

      {/* Museum */}
      <td className="py-2 px-3">
        {editing ? (
          <input className={field} value={draft.museum ?? ''} onChange={(e) => set('museum', e.target.value)} />
        ) : (
          <span className="text-xs text-stone-400">{row.museum ?? '—'}</span>
        )}
      </td>

      {/* Source badge */}
      <td className="py-2 px-3 w-14">
        <span className="text-xs uppercase tracking-wide text-stone-400">{row.source ?? '—'}</span>
      </td>

      {/* Actions */}
      <td className="py-2 px-3 w-32">
        {confirming ? (
          <div className="flex gap-1">
            <button onClick={() => onDelete(row.id)} className="text-xs text-red-600 border border-red-200 px-2 py-0.5 rounded-sm hover:bg-red-50">Delete</button>
            <button onClick={cancel} className="text-xs text-stone-500 border border-stone-200 px-2 py-0.5 rounded-sm hover:bg-stone-50">Cancel</button>
          </div>
        ) : editing ? (
          <div className="flex gap-1">
            <button onClick={save} disabled={saving} className="text-xs text-stone-800 border border-stone-400 px-2 py-0.5 rounded-sm hover:bg-stone-100 disabled:opacity-50">
              {saving ? '…' : 'Save'}
            </button>
            <button onClick={cancel} className="text-xs text-stone-400 border border-stone-200 px-2 py-0.5 rounded-sm hover:bg-stone-50">Cancel</button>
          </div>
        ) : (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="text-xs text-stone-600 border border-stone-200 px-2 py-0.5 rounded-sm hover:bg-stone-100">Edit</button>
            <button onClick={() => setConfirming(true)} className="text-xs text-stone-400 border border-stone-200 px-2 py-0.5 rounded-sm hover:text-red-500 hover:border-red-200">Delete</button>
          </div>
        )}
      </td>
    </tr>
  )
}

// ── Artist row ─────────────────────────────────────────────────────────────

function ArtistRow({ row, onSave, onDelete }: {
  row: ArtistRow
  onSave: (id: number, data: Partial<ArtistRow>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(row)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function set(field: keyof ArtistRow, value: string | number) {
    setDraft((d) => ({ ...d, [field]: value }))
  }

  async function save() {
    setSaving(true)
    await onSave(row.id, {
      name: draft.name,
      nationality: draft.nationality || null,
      birthYear: draft.birthYear ? Number(draft.birthYear) : null,
      deathYear: draft.deathYear ? Number(draft.deathYear) : null,
      difficulty: Number(draft.difficulty),
    })
    setSaving(false)
    setEditing(false)
  }

  function cancel() {
    setDraft(row)
    setEditing(false)
    setConfirming(false)
  }

  const field = 'border-b border-stone-200 bg-white px-1 py-0.5 text-sm w-full focus:outline-none focus:border-stone-500'

  return (
    <tr className="border-b border-stone-100 hover:bg-stone-50/50 group">
      <td className="py-2 px-3">
        {editing ? (
          <input className={field} value={draft.name} onChange={(e) => set('name', e.target.value)} />
        ) : (
          <span className="text-sm font-serif text-stone-800">{row.name}</span>
        )}
      </td>

      <td className="py-2 px-3">
        {editing ? (
          <input className={field} value={draft.nationality ?? ''} onChange={(e) => set('nationality', e.target.value)} />
        ) : (
          <span className="text-sm text-stone-500">{row.nationality ?? '—'}</span>
        )}
      </td>

      <td className="py-2 px-3 w-24">
        {editing ? (
          <input className={field} type="number" value={draft.birthYear ?? ''} onChange={(e) => set('birthYear', e.target.value)} />
        ) : (
          <span className="text-sm text-stone-500">{row.birthYear ?? '—'}</span>
        )}
      </td>

      <td className="py-2 px-3 w-24">
        {editing ? (
          <input className={field} type="number" value={draft.deathYear ?? ''} onChange={(e) => set('deathYear', e.target.value)} />
        ) : (
          <span className="text-sm text-stone-500">{row.deathYear ?? '—'}</span>
        )}
      </td>

      <td className="py-2 px-3 w-28">
        {editing ? (
          <select className={field} value={draft.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
            <option value={1}>1 — Famous</option>
            <option value={2}>2 — Well known</option>
            <option value={3}>3 — Intermediate</option>
            <option value={4}>4 — Obscure</option>
          </select>
        ) : (
          <span className="text-sm text-stone-500">{row.difficulty}</span>
        )}
      </td>

      <td className="py-2 px-3 w-20 text-center">
        <span className="text-sm text-stone-400">{row._count.artworks}</span>
      </td>

      <td className="py-2 px-3 w-32">
        {confirming ? (
          <div className="flex gap-1">
            <button onClick={() => onDelete(row.id)} className="text-xs text-red-600 border border-red-200 px-2 py-0.5 rounded-sm hover:bg-red-50">
              Delete + works
            </button>
            <button onClick={cancel} className="text-xs text-stone-500 border border-stone-200 px-2 py-0.5 rounded-sm hover:bg-stone-50">Cancel</button>
          </div>
        ) : editing ? (
          <div className="flex gap-1">
            <button onClick={save} disabled={saving} className="text-xs text-stone-800 border border-stone-400 px-2 py-0.5 rounded-sm hover:bg-stone-100 disabled:opacity-50">
              {saving ? '…' : 'Save'}
            </button>
            <button onClick={cancel} className="text-xs text-stone-400 border border-stone-200 px-2 py-0.5 rounded-sm hover:bg-stone-50">Cancel</button>
          </div>
        ) : (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="text-xs text-stone-600 border border-stone-200 px-2 py-0.5 rounded-sm hover:bg-stone-100">Edit</button>
            <button onClick={() => setConfirming(true)} className="text-xs text-stone-400 border border-stone-200 px-2 py-0.5 rounded-sm hover:text-red-500 hover:border-red-200">Delete</button>
          </div>
        )}
      </td>
    </tr>
  )
}

// ── Artworks tab ───────────────────────────────────────────────────────────

function ArtworksTab() {
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ artworks: ArtworkRow[]; total: number; pageSize: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebounce(search)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (source) params.set('source', source)
    const res = await fetch(`/api/admin/artworks?${params}`)
    setData(await res.json())
    setLoading(false)
  }, [page, debouncedSearch, source])

  useEffect(() => { setPage(1) }, [debouncedSearch, source])
  useEffect(() => { load() }, [load])

  async function handleSave(id: number, updates: Partial<ArtworkRow>) {
    await fetch(`/api/admin/artworks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    load()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/admin/artworks/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 items-center">
        <input
          type="search"
          placeholder="Search title or artist…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone-200 px-3 py-1.5 text-sm rounded-sm w-64 focus:outline-none focus:border-stone-400"
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border border-stone-200 px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-stone-400"
        >
          <option value="">All sources</option>
          <option value="aic">AIC</option>
          <option value="met">Met</option>
        </select>
        {data && (
          <span className="text-sm text-stone-400 ml-auto">{data.total} artworks</span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-stone-100 rounded-sm">
        <table className="w-full text-left min-w-[900px]">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal w-16"></th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal">Title</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal">Artist</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal w-20">Year</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal">Medium</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal">Museum</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal w-14">Source</th>
              <th className="py-2 px-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-stone-400 text-sm">Loading…</td></tr>
            ) : data?.artworks.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-stone-400 text-sm">No artworks found</td></tr>
            ) : (
              data?.artworks.map((row) => (
                <ArtworkRow key={row.id} row={row} onSave={handleSave} onDelete={handleDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <Pagination page={page} total={data.total} pageSize={data.pageSize} onChange={setPage} />
      )}
    </div>
  )
}

// ── Artists tab ────────────────────────────────────────────────────────────

function ArtistsTab() {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ artists: ArtistRow[]; total: number; pageSize: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebounce(search)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (difficulty) params.set('difficulty', difficulty)
    const res = await fetch(`/api/admin/artists?${params}`)
    setData(await res.json())
    setLoading(false)
  }, [page, debouncedSearch, difficulty])

  useEffect(() => { setPage(1) }, [debouncedSearch, difficulty])
  useEffect(() => { load() }, [load])

  async function handleSave(id: number, updates: Partial<ArtistRow>) {
    await fetch(`/api/admin/artists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    load()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/admin/artists/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 items-center">
        <input
          type="search"
          placeholder="Search artist…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone-200 px-3 py-1.5 text-sm rounded-sm w-64 focus:outline-none focus:border-stone-400"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border border-stone-200 px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-stone-400"
        >
          <option value="">All difficulties</option>
          <option value="1">1 — Famous</option>
          <option value="2">2 — Well known</option>
          <option value="3">3 — Intermediate</option>
          <option value="4">4 — Obscure</option>
        </select>
        {data && (
          <span className="text-sm text-stone-400 ml-auto">{data.total} artists</span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-stone-100 rounded-sm">
        <table className="w-full text-left">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal">Name</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal">Nationality</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal w-24">Born</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal w-24">Died</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal w-28">Difficulty</th>
              <th className="py-2 px-3 text-xs uppercase tracking-wide text-stone-400 font-normal w-20 text-center">Works</th>
              <th className="py-2 px-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-stone-400 text-sm">Loading…</td></tr>
            ) : data?.artists.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-stone-400 text-sm">No artists found</td></tr>
            ) : (
              data?.artists.map((row) => (
                <ArtistRow key={row.id} row={row} onSave={handleSave} onDelete={handleDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <Pagination page={page} total={data.total} pageSize={data.pageSize} onChange={setPage} />
      )}
    </div>
  )
}

// ── Main client ────────────────────────────────────────────────────────────

export default function CatalogueClient() {
  const [tab, setTab] = useState<'artworks' | 'artists'>('artworks')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-serif text-2xl text-stone-800 tracking-wide">Catalogue Raisonné</h2>
        <p className="text-sm text-stone-400 mt-1">Manage artworks and artists in the database</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-stone-200">
        {(['artworks', 'artists'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm capitalize tracking-wide border-b-2 transition-colors ${
              tab === t
                ? 'border-stone-800 text-stone-800'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'artworks' ? <ArtworksTab /> : <ArtistsTab />}
    </div>
  )
}
