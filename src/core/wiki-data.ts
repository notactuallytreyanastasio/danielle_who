/**
 * Tardis Wiki data types and utilities
 * Loads the enriched episode data from scraped wiki content
 */

export interface WikiEpisode {
  title: string
  story_number: string
  season: number | null
  series: number | null
  episode_count: number
  air_date_start: string | null
  air_date_end: string | null
  doctor: string | null
  companions: string[]
  enemies: string[]
  writer: string
  director: string
  producer: string
  script_editor: string | null
  composer: string | null
  production_code: string | null
  setting_location: string
  setting_time: string | null
  synopsis: string
  wiki_url: string
  missing_status: 'complete' | 'partial' | 'missing'
}

export interface WikiCompanion {
  name: string
  actor: string
  doctors: string[]
  first_appearance: string
  last_appearance: string
  description: string
  wiki_url: string
}

export interface WikiEnemy {
  name: string
  species: string
  first_appearance: string
  notable_appearances: string[]
  description: string
  wiki_url: string
}

export interface WikiData {
  episodes: WikiEpisode[]
  companions: WikiCompanion[]
  enemies: WikiEnemy[]
}

export interface WikiIndex {
  episodesByTitle: Map<string, WikiEpisode>
  episodesByNormalizedTitle: Map<string, WikiEpisode>
  companionsByName: Map<string, WikiCompanion>
  enemiesByName: Map<string, WikiEnemy>
}

/**
 * Normalize a title for matching (lowercase, remove punctuation, etc.)
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Build indexes for fast wiki data lookups
 */
export function buildWikiIndex(data: WikiData): WikiIndex {
  const episodesByTitle = new Map<string, WikiEpisode>()
  const episodesByNormalizedTitle = new Map<string, WikiEpisode>()
  const companionsByName = new Map<string, WikiCompanion>()
  const enemiesByName = new Map<string, WikiEnemy>()

  for (const episode of data.episodes) {
    episodesByTitle.set(episode.title, episode)
    episodesByNormalizedTitle.set(normalizeTitle(episode.title), episode)
  }

  for (const companion of data.companions) {
    companionsByName.set(companion.name.toLowerCase(), companion)
  }

  for (const enemy of data.enemies) {
    enemiesByName.set(enemy.name.toLowerCase(), enemy)
  }

  return {
    episodesByTitle,
    episodesByNormalizedTitle,
    companionsByName,
    enemiesByName,
  }
}

/**
 * Find a wiki episode by title (exact or normalized match)
 */
export function findEpisode(index: WikiIndex, title: string): WikiEpisode | undefined {
  // Try exact match first
  const exact = index.episodesByTitle.get(title)
  if (exact) return exact

  // Try normalized match
  const normalized = index.episodesByNormalizedTitle.get(normalizeTitle(title))
  if (normalized) return normalized

  // Try partial match (title contains search or vice versa)
  const normalizedSearch = normalizeTitle(title)
  for (const [normalizedTitle, episode] of index.episodesByNormalizedTitle) {
    if (normalizedTitle.includes(normalizedSearch) || normalizedSearch.includes(normalizedTitle)) {
      return episode
    }
  }

  return undefined
}

/**
 * Get companion info by name
 */
export function findCompanion(index: WikiIndex, name: string): WikiCompanion | undefined {
  return index.companionsByName.get(name.toLowerCase())
}

/**
 * Get enemy info by name
 */
export function findEnemy(index: WikiIndex, name: string): WikiEnemy | undefined {
  return index.enemiesByName.get(name.toLowerCase())
}

/**
 * Parse the Doctor from episode data
 */
export function parseDoctor(episode: WikiEpisode): string | null {
  if (episode.doctor) return episode.doctor

  // Try to extract from synopsis or title
  const doctorPatterns = [
    /First Doctor/i,
    /Second Doctor/i,
    /Third Doctor/i,
    /Fourth Doctor/i,
    /Fifth Doctor/i,
    /Sixth Doctor/i,
    /Seventh Doctor/i,
    /Eighth Doctor/i,
    /War Doctor/i,
    /Ninth Doctor/i,
    /Tenth Doctor/i,
    /Eleventh Doctor/i,
    /Twelfth Doctor/i,
    /Thirteenth Doctor/i,
    /Fourteenth Doctor/i,
    /Fifteenth Doctor/i,
  ]

  for (const pattern of doctorPatterns) {
    if (pattern.test(episode.synopsis)) {
      const match = episode.synopsis.match(pattern)
      if (match) return match[0]
    }
  }

  return null
}

/**
 * Get episodes by Doctor
 */
export function getEpisodesByDoctor(episodes: WikiEpisode[], doctor: string): WikiEpisode[] {
  const normalizedDoctor = doctor.toLowerCase()
  return episodes.filter(ep => {
    const epDoctor = parseDoctor(ep)?.toLowerCase()
    return epDoctor?.includes(normalizedDoctor)
  })
}

/**
 * Get episodes by companion
 */
export function getEpisodesByCompanion(episodes: WikiEpisode[], companion: string): WikiEpisode[] {
  const normalizedCompanion = companion.toLowerCase()
  return episodes.filter(ep =>
    ep.companions.some(c => c.toLowerCase().includes(normalizedCompanion))
  )
}

/**
 * Get episodes by enemy
 */
export function getEpisodesByEnemy(episodes: WikiEpisode[], enemy: string): WikiEpisode[] {
  const normalizedEnemy = enemy.toLowerCase()
  return episodes.filter(ep =>
    ep.enemies.some(e => e.toLowerCase().includes(normalizedEnemy))
  )
}

/**
 * Get episodes by writer
 */
export function getEpisodesByWriter(episodes: WikiEpisode[], writer: string): WikiEpisode[] {
  const normalizedWriter = writer.toLowerCase()
  return episodes.filter(ep => ep.writer.toLowerCase().includes(normalizedWriter))
}

/**
 * Get episodes by location
 */
export function getEpisodesByLocation(episodes: WikiEpisode[], location: string): WikiEpisode[] {
  const normalizedLocation = location.toLowerCase()
  return episodes.filter(ep => ep.setting_location.toLowerCase().includes(normalizedLocation))
}

/**
 * Get missing episodes
 */
export function getMissingEpisodes(episodes: WikiEpisode[]): WikiEpisode[] {
  return episodes.filter(ep => ep.missing_status !== 'complete')
}

/**
 * Get episode statistics
 */
export function getWikiStats(data: WikiData): {
  totalEpisodes: number
  totalCompanions: number
  totalEnemies: number
  missingCount: number
  byDoctor: Map<string, number>
  byWriter: Map<string, number>
} {
  const byDoctor = new Map<string, number>()
  const byWriter = new Map<string, number>()
  let missingCount = 0

  for (const ep of data.episodes) {
    const doctor = parseDoctor(ep) ?? 'Unknown'
    byDoctor.set(doctor, (byDoctor.get(doctor) ?? 0) + 1)

    if (ep.writer) {
      byWriter.set(ep.writer, (byWriter.get(ep.writer) ?? 0) + 1)
    }

    if (ep.missing_status !== 'complete') {
      missingCount++
    }
  }

  return {
    totalEpisodes: data.episodes.length,
    totalCompanions: data.companions.length,
    totalEnemies: data.enemies.length,
    missingCount,
    byDoctor,
    byWriter,
  }
}
