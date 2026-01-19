import type { ChronologyStats } from '@core/types'

interface StatsBarProps {
  stats: ChronologyStats
  filteredCount: number
}

export function StatsBar({ stats, filteredCount }: StatsBarProps) {
  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat__value">{filteredCount.toLocaleString()}</span>
        <span className="stat__label">Showing</span>
      </div>
      <div className="stat">
        <span className="stat__value">{stats.totalEntries.toLocaleString()}</span>
        <span className="stat__label">Total Entries</span>
      </div>
      <div className="stat">
        <span className="stat__value">{stats.byShow.size}</span>
        <span className="stat__label">Shows</span>
      </div>
      <div className="stat">
        <span className="stat__value">{stats.byFormat.size}</span>
        <span className="stat__label">Formats</span>
      </div>
      <div className="stat">
        <span className="stat__value">{stats.byDoctor.size}</span>
        <span className="stat__label">Doctors</span>
      </div>
    </div>
  )
}
