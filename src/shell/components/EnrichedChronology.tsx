import { useState, useEffect, useMemo } from 'react'
import type { WikiEpisode, WikiData } from '@core/wiki-data'
import { getWikiStats, parseDoctor } from '@core/wiki-data'

// Get base path for GitHub Pages
const BASE_PATH = import.meta.env.BASE_URL || '/'

type SortBy = 'number' | 'title' | 'year' | 'doctor'
type FilterDoctor = 'all' | string

interface EpisodeCardProps {
  episode: WikiEpisode
  isExpanded: boolean
  onToggle: () => void
}

function EpisodeCard({ episode, isExpanded, onToggle }: EpisodeCardProps) {
  const doctor = parseDoctor(episode)

  const getDoctorColor = (doc: string | null): string => {
    if (!doc) return '#666'
    const colors: Record<string, string> = {
      'First': '#1a1a2e',
      'Second': '#16213e',
      'Third': '#1e5128',
      'Fourth': '#6b2d2d',
      'Fifth': '#c9a227',
      'Sixth': '#7b2cbf',
      'Seventh': '#582f0e',
      'Eighth': '#2d6a4f',
      'War': '#3d0000',
      'Ninth': '#023047',
      'Tenth': '#5c4033',
      'Eleventh': '#4a0e4e',
      'Twelfth': '#1a1a2e',
      'Thirteenth': '#1d3557',
      'Fourteenth': '#774936',
      'Fifteenth': '#e07a5f',
    }
    for (const [key, color] of Object.entries(colors)) {
      if (doc.includes(key)) return color
    }
    return '#003b6f'
  }

  const getMissingStatusBadge = () => {
    if (episode.missing_status === 'complete') return null
    return (
      <span className={`episode-status episode-status--${episode.missing_status}`}>
        {episode.missing_status === 'missing' ? '📼 Missing' : '📼 Partial'}
      </span>
    )
  }

  return (
    <div
      className={`episode-card ${isExpanded ? 'episode-card--expanded' : ''}`}
      style={{ borderLeftColor: getDoctorColor(doctor) }}
    >
      <div className="episode-card__main" onClick={onToggle}>
        <span className="episode-card__number">#{episode.story_number}</span>
        <div className="episode-card__info">
          <h3 className="episode-card__title">{episode.title}</h3>
          <div className="episode-card__meta">
            {doctor && <span className="episode-card__doctor">{doctor}</span>}
            {episode.episode_count > 1 && (
              <span className="episode-card__parts">{episode.episode_count} parts</span>
            )}
            {getMissingStatusBadge()}
          </div>
        </div>
        <div className="episode-card__expand">{isExpanded ? '−' : '+'}</div>
      </div>

      {isExpanded && (
        <div className="episode-card__details">
          {episode.companions && episode.companions.length > 0 && (
            <div className="episode-card__section">
              <h4>👤 Companions</h4>
              <div className="episode-card__tags">
                {episode.companions.map((c, i) => (
                  <span key={c + i} className="tag tag--companion">{c}</span>
                ))}
              </div>
            </div>
          )}

          {episode.enemies && episode.enemies.length > 0 && (
            <div className="episode-card__section">
              <h4>👾 Enemies</h4>
              <div className="episode-card__tags">
                {episode.enemies.map((e, i) => (
                  <span key={e + i} className="tag tag--enemy">{e}</span>
                ))}
              </div>
            </div>
          )}

          <div className="episode-card__section episode-card__section--grid">
            <div className="episode-card__field">
              <label>Writer</label>
              <span>{episode.writer || 'Unknown'}</span>
            </div>
            <div className="episode-card__field">
              <label>Director</label>
              <span>{episode.director || 'Unknown'}</span>
            </div>
            <div className="episode-card__field">
              <label>Producer</label>
              <span>{episode.producer || 'Unknown'}</span>
            </div>
            {episode.series && (
              <div className="episode-card__field">
                <label>Series</label>
                <span>Series {episode.series}</span>
              </div>
            )}
            {episode.season && (
              <div className="episode-card__field">
                <label>Season</label>
                <span>Season {episode.season}</span>
              </div>
            )}
          </div>

          {episode.setting_location && (
            <div className="episode-card__section">
              <h4>📍 Setting</h4>
              <p>{episode.setting_location}</p>
            </div>
          )}

          {episode.synopsis && (
            <div className="episode-card__section">
              <h4>📖 Synopsis</h4>
              <p className="episode-card__synopsis">
                {episode.synopsis.slice(0, 300)}
                {episode.synopsis.length > 300 ? '...' : ''}
              </p>
            </div>
          )}

          <div className="episode-card__footer">
            <a
              href={episode.wiki_url}
              target="_blank"
              rel="noopener noreferrer"
              className="episode-card__link"
            >
              View on Tardis Wiki →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export function EnrichedChronology() {
  const [wikiData, setWikiData] = useState<WikiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('number')
  const [filterDoctor, setFilterDoctor] = useState<FilterDoctor>('all')
  const [showMissingOnly, setShowMissingOnly] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${BASE_PATH}data/wiki-episodes.json`)
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status}`)
        }
        const episodes: WikiEpisode[] = await response.json()
        setWikiData({
          episodes,
          companions: [],
          enemies: [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  const stats = useMemo(() => {
    if (!wikiData) return null
    return getWikiStats(wikiData)
  }, [wikiData])

  const doctors = useMemo(() => {
    if (!stats) return []
    return Array.from(stats.byDoctor.keys()).sort((a, b) => {
      const order = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'War', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth']
      const aIdx = order.findIndex(o => a.includes(o))
      const bIdx = order.findIndex(o => b.includes(o))
      return aIdx - bIdx
    })
  }, [stats])

  const filteredEpisodes = useMemo(() => {
    if (!wikiData) return []

    let episodes = [...wikiData.episodes]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      episodes = episodes.filter(ep =>
        ep.title?.toLowerCase().includes(query) ||
        ep.companions?.some(c => c?.toLowerCase().includes(query)) ||
        ep.enemies?.some(e => e?.toLowerCase().includes(query)) ||
        ep.writer?.toLowerCase().includes(query) ||
        ep.setting_location?.toLowerCase().includes(query)
      )
    }

    // Filter by Doctor
    if (filterDoctor !== 'all') {
      episodes = episodes.filter(ep => {
        const doctor = parseDoctor(ep)
        return doctor?.includes(filterDoctor)
      })
    }

    // Filter missing only
    if (showMissingOnly) {
      episodes = episodes.filter(ep => ep.missing_status !== 'complete')
    }

    // Sort
    switch (sortBy) {
      case 'title':
        episodes.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'doctor':
        episodes.sort((a, b) => {
          const docA = parseDoctor(a) ?? 'ZZZ'
          const docB = parseDoctor(b) ?? 'ZZZ'
          return docA.localeCompare(docB)
        })
        break
      case 'number':
      default:
        episodes.sort((a, b) => {
          const numA = parseInt(a.story_number) || 9999
          const numB = parseInt(b.story_number) || 9999
          return numA - numB
        })
        break
    }

    return episodes
  }, [wikiData, searchQuery, sortBy, filterDoctor, showMissingOnly])

  if (loading) {
    return (
      <div className="enriched-chronology">
        <div className="loading">
          <div className="loading__spinner" />
          <div className="loading__text">Loading episode data...</div>
        </div>
      </div>
    )
  }

  if (error || !wikiData) {
    return (
      <div className="enriched-chronology">
        <div className="loading">
          <div className="loading__text" style={{ color: 'var(--class-accent)' }}>
            Error: {error ?? 'Failed to load data'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="enriched-chronology">
      <div className="enriched-chronology__header">
        <h2>TV Episode Guide</h2>
        <p className="enriched-chronology__subtitle">
          {stats?.totalEpisodes} TV stories from 1963 to present
        </p>
      </div>

      {stats && (
        <div className="enriched-chronology__stats">
          <div className="stat-chip">
            <span className="stat-chip__value">{stats.totalEpisodes}</span>
            <span className="stat-chip__label">Stories</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__value">{stats.missingCount}</span>
            <span className="stat-chip__label">Missing/Partial</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__value">{stats.byDoctor.size}</span>
            <span className="stat-chip__label">Doctors</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__value">{stats.byWriter.size}</span>
            <span className="stat-chip__label">Writers</span>
          </div>
        </div>
      )}

      <div className="enriched-chronology__controls">
        <input
          type="text"
          className="enriched-chronology__search"
          placeholder="Search episodes, companions, enemies, writers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="enriched-chronology__filters">
          <div className="filter-group">
            <label>Doctor:</label>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doc => (
                <option key={doc} value={doc.split(' ')[0]}>{doc}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="filter-select"
            >
              <option value="number">Story Number</option>
              <option value="title">Title</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={showMissingOnly}
              onChange={(e) => setShowMissingOnly(e.target.checked)}
            />
            Missing episodes only
          </label>
        </div>
      </div>

      <div className="enriched-chronology__count">
        Showing {filteredEpisodes.length} of {wikiData.episodes.length} stories
      </div>

      <div className="enriched-chronology__list">
        {filteredEpisodes.map((episode) => (
          <EpisodeCard
            key={episode.story_number + episode.title}
            episode={episode}
            isExpanded={expandedId === episode.story_number}
            onToggle={() => setExpandedId(
              expandedId === episode.story_number ? null : episode.story_number
            )}
          />
        ))}
      </div>
    </div>
  )
}
