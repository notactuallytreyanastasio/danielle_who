import type { ChronologyFilter, Show, Format } from '@core/types'

interface SearchBarProps {
  filter: ChronologyFilter
  shows: readonly Show[]
  formats: readonly Format[]
  onFilterChange: (filter: ChronologyFilter) => void
}

export function SearchBar({
  filter,
  shows,
  formats,
  onFilterChange,
}: SearchBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      searchQuery: e.target.value,
    })
  }

  const toggleShow = (show: Show) => {
    const newShows = new Set(filter.shows)
    if (newShows.has(show)) {
      newShows.delete(show)
    } else {
      newShows.add(show)
    }
    onFilterChange({ ...filter, shows: newShows })
  }

  const toggleFormat = (format: Format) => {
    const newFormats = new Set(filter.formats)
    if (newFormats.has(format)) {
      newFormats.delete(format)
    } else {
      newFormats.add(format)
    }
    onFilterChange({ ...filter, formats: newFormats })
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search episodes, stories, books..."
        value={filter.searchQuery}
        onChange={handleSearchChange}
      />

      <div className="filter-group">
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
          Shows:
        </span>
        {shows.map((show) => (
          <button
            key={show}
            className={`filter-chip ${filter.shows.has(show) ? 'filter-chip--active' : ''}`}
            onClick={() => toggleShow(show)}
          >
            {show}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
          Formats:
        </span>
        {formats.slice(0, 8).map((format) => (
          <button
            key={format}
            className={`filter-chip ${filter.formats.has(format) ? 'filter-chip--active' : ''}`}
            onClick={() => toggleFormat(format)}
          >
            {format}
          </button>
        ))}
      </div>
    </div>
  )
}
