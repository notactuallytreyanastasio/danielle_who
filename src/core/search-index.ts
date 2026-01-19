/**
 * Search index for Doctor Who data
 * Provides fast client-side searching with pre-built indexes
 */

export interface SearchableItem {
  id: string
  type: 'episode' | 'story' | 'companion' | 'enemy' | 'doctor' | 'location' | 'graph-node'
  title: string
  keywords: string[]
  metadata: Record<string, unknown>
}

export interface SearchIndex {
  items: SearchableItem[]
  byType: Map<string, SearchableItem[]>
  byKeyword: Map<string, Set<string>> // keyword -> item ids
  byDoctor: Map<number, SearchableItem[]>
}

export interface SearchResult {
  item: SearchableItem
  score: number
  matchedKeywords: string[]
}

/**
 * Build a search index from searchable items
 */
export function buildSearchIndex(items: SearchableItem[]): SearchIndex {
  const byType = new Map<string, SearchableItem[]>()
  const byKeyword = new Map<string, Set<string>>()
  const byDoctor = new Map<number, SearchableItem[]>()

  for (const item of items) {
    // Index by type
    const typeItems = byType.get(item.type) ?? []
    typeItems.push(item)
    byType.set(item.type, typeItems)

    // Index by keyword (lowercase)
    for (const keyword of item.keywords) {
      const lowerKeyword = keyword.toLowerCase()
      const ids = byKeyword.get(lowerKeyword) ?? new Set()
      ids.add(item.id)
      byKeyword.set(lowerKeyword, ids)
    }

    // Index by doctor number if available
    const doctorNum = item.metadata.doctorNumber as number | undefined
    if (doctorNum !== undefined) {
      const doctorItems = byDoctor.get(doctorNum) ?? []
      doctorItems.push(item)
      byDoctor.set(doctorNum, doctorItems)
    }
  }

  return { items, byType, byKeyword, byDoctor }
}

/**
 * Tokenize a search query into terms
 */
function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 1)
    .map(term => term.replace(/[^a-z0-9]/g, ''))
}

/**
 * Search the index with a query string
 */
export function search(
  index: SearchIndex,
  query: string,
  options: {
    types?: string[]
    doctorNumber?: number
    limit?: number
  } = {}
): SearchResult[] {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  const scores = new Map<string, { score: number; matches: string[] }>()

  // Score each item based on keyword matches
  for (const term of terms) {
    // Exact keyword match
    const exactMatches = index.byKeyword.get(term)
    if (exactMatches) {
      for (const id of exactMatches) {
        const current = scores.get(id) ?? { score: 0, matches: [] }
        current.score += 10
        current.matches.push(term)
        scores.set(id, current)
      }
    }

    // Partial keyword matches
    for (const [keyword, ids] of index.byKeyword) {
      if (keyword.includes(term) || term.includes(keyword)) {
        for (const id of ids) {
          const current = scores.get(id) ?? { score: 0, matches: [] }
          current.score += 3
          if (!current.matches.includes(term)) {
            current.matches.push(term)
          }
          scores.set(id, current)
        }
      }
    }
  }

  // Title matching (boost for matches in title)
  for (const item of index.items) {
    const titleLower = item.title.toLowerCase()
    for (const term of terms) {
      if (titleLower.includes(term)) {
        const current = scores.get(item.id) ?? { score: 0, matches: [] }
        current.score += 15
        if (!current.matches.includes(term)) {
          current.matches.push(term)
        }
        scores.set(item.id, current)
      }
    }
  }

  // Build results
  const itemMap = new Map(index.items.map(i => [i.id, i]))
  let results: SearchResult[] = []

  for (const [id, { score, matches }] of scores) {
    const item = itemMap.get(id)
    if (!item) continue

    // Filter by type if specified
    if (options.types && !options.types.includes(item.type)) continue

    // Filter by doctor if specified
    if (options.doctorNumber !== undefined) {
      const docNum = item.metadata.doctorNumber as number | undefined
      if (docNum !== options.doctorNumber) continue
    }

    results.push({
      item,
      score,
      matchedKeywords: matches,
    })
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  // Apply limit
  if (options.limit) {
    results = results.slice(0, options.limit)
  }

  return results
}

/**
 * Get items by type
 */
export function getByType(index: SearchIndex, type: string): SearchableItem[] {
  return index.byType.get(type) ?? []
}

/**
 * Get items for a specific Doctor
 */
export function getByDoctor(index: SearchIndex, doctorNumber: number): SearchableItem[] {
  return index.byDoctor.get(doctorNumber) ?? []
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): string[] {
  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'it', 'its', 'this', 'that', 'these', 'those', 'he', 'she', 'they',
    'them', 'their', 'his', 'her', 'i', 'we', 'you', 'who', 'which', 'what',
    'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'also',
  ])

  return text
    .toLowerCase()
    .split(/[\s,;:.!?()\[\]{}'"]+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter((word, i, arr) => arr.indexOf(word) === i) // unique
}

/**
 * Create searchable item from episode data
 */
export function episodeToSearchable(episode: {
  title: string
  story_number?: string
  doctor?: string | null
  companions?: string[]
  enemies?: string[]
  writer?: string
  director?: string
  setting_location?: string
}): SearchableItem {
  const keywords = [
    ...extractKeywords(episode.title),
    ...(episode.companions ?? []).flatMap(c => extractKeywords(c)),
    ...(episode.enemies ?? []).flatMap(e => extractKeywords(e)),
    ...(episode.writer ? extractKeywords(episode.writer) : []),
    ...(episode.director ? extractKeywords(episode.director) : []),
    ...(episode.setting_location ? extractKeywords(episode.setting_location) : []),
  ]

  // Extract doctor number from title or doctor field
  let doctorNumber: number | undefined
  const doctorMatch = episode.doctor?.match(/(\w+)\s*Doctor/i)
  if (doctorMatch && doctorMatch[1]) {
    const numberWords: Record<string, number> = {
      'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5,
      'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10,
      'eleventh': 11, 'twelfth': 12, 'thirteenth': 13, 'fourteenth': 14, 'fifteenth': 15,
      'war': 0,
    }
    doctorNumber = numberWords[doctorMatch[1].toLowerCase()]
  }

  return {
    id: `episode-${episode.story_number ?? episode.title}`,
    type: 'episode',
    title: episode.title,
    keywords,
    metadata: {
      storyNumber: episode.story_number,
      doctor: episode.doctor,
      companions: episode.companions,
      enemies: episode.enemies,
      writer: episode.writer,
      director: episode.director,
      settingLocation: episode.setting_location,
      doctorNumber,
    },
  }
}

/**
 * Create searchable item from Eyespider story
 */
export function storyToSearchable(story: {
  title: string
  format: string
  source?: string
  notes?: string
}, doctorNumber: number, doctorName: string): SearchableItem {
  const keywords = [
    ...extractKeywords(story.title),
    story.format.toLowerCase(),
    ...(story.source ? extractKeywords(story.source) : []),
    ...(story.notes ? extractKeywords(story.notes) : []),
    doctorName.toLowerCase(),
  ]

  return {
    id: `story-${doctorNumber}-${story.title}`,
    type: 'story',
    title: story.title,
    keywords,
    metadata: {
      format: story.format,
      source: story.source,
      notes: story.notes,
      doctorNumber,
      doctorName,
    },
  }
}

/**
 * Create searchable item from graph node
 */
export function graphNodeToSearchable(node: {
  id: number
  type: string
  title: string
  status?: string
}): SearchableItem {
  const keywords = [
    ...extractKeywords(node.title),
    node.type,
    node.status ?? '',
  ].filter(Boolean) as string[]

  return {
    id: `graph-${node.id}`,
    type: 'graph-node',
    title: node.title,
    keywords,
    metadata: {
      nodeId: node.id,
      nodeType: node.type,
      status: node.status,
    },
  }
}
