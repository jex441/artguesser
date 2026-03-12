/**
 * Normalize a string for fuzzy matching:
 * lowercase, remove accents, trim whitespace
 */
export function normalizeArtistName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Pick N random items from an array
 */
export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}
