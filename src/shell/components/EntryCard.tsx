import { useState } from 'react'
import type { ChronologyEntry } from '@core/types'

interface EntryCardProps {
  entry: ChronologyEntry
  index?: number
}

function getShowClass(show: string | null): string {
  if (!show) return ''
  const normalized = show.toLowerCase().replace(/[^a-z]/g, '-')
  if (normalized.includes('torchwood')) return 'entry-card--torchwood'
  if (normalized.includes('sarah')) return 'entry-card--sarah-jane'
  if (normalized.includes('class')) return 'entry-card--class'
  if (normalized.includes('unit')) return 'entry-card--unit'
  return 'entry-card--doctor-who'
}

function getFormatInfo(format: string | null): { icon: string; className: string; label: string } {
  if (!format) return { icon: '📄', className: 'entry-card__format--other', label: 'Other' }
  const lower = format.toLowerCase()

  if (lower.includes('tv') || lower.includes('bbc tv')) {
    return { icon: '📺', className: 'entry-card__format--tv', label: format }
  }
  if (lower.includes('big finish')) {
    return { icon: '🎧', className: 'entry-card__format--audio', label: 'Big Finish' }
  }
  if (lower.includes('audio')) {
    return { icon: '🎧', className: 'entry-card__format--audio', label: format }
  }
  if (lower.includes('book')) {
    return { icon: '📚', className: 'entry-card__format--book', label: format }
  }
  if (lower.includes('comic') || lower.includes('titan')) {
    return { icon: '💬', className: 'entry-card__format--comic', label: format }
  }
  if (lower.includes('webcast')) {
    return { icon: '🌐', className: 'entry-card__format--webcast', label: format }
  }
  if (lower.includes('game')) {
    return { icon: '🎮', className: 'entry-card__format--game', label: format }
  }
  if (lower.includes('theatrical')) {
    return { icon: '🎬', className: 'entry-card__format--theatrical', label: format }
  }
  return { icon: '📄', className: 'entry-card__format--other', label: format }
}

function getShowIcon(show: string | null): string {
  if (!show) return '🌀'
  const lower = show.toLowerCase()
  if (lower.includes('torchwood')) return '🔫'
  if (lower.includes('sarah')) return '👩'
  if (lower.includes('class')) return '🏫'
  if (lower.includes('unit')) return '🎖️'
  return '🌀'
}

// Doctor era colors
const DOCTOR_COLORS: Record<string, string> = {
  'War': '#8B0000',
  'Ninth': '#1a1a2e',
  'Tenth': '#4a2c2a',
  'Eleventh': '#2d4a3e',
  'Twelfth': '#1a3a5c',
  'Thirteenth': '#4a3b6b',
  'Fourteenth': '#5c3a1a',
  'Fifteenth': '#2a4a5c',
  'Time War': '#4a0000',
}

export function EntryCard({ entry, index }: EntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (entry.isDoctorHeader && entry.doctorInfo) {
    const color = DOCTOR_COLORS[entry.doctorInfo.number] || '#003b6f'
    return (
      <div
        className="doctor-header"
        style={{
          '--doctor-era-color': color,
          borderLeftColor: color,
        } as React.CSSProperties}
      >
        <div className="doctor-header__icon">
          {entry.doctorInfo.number === 'War' ? '⚔️' : '🌀'}
        </div>
        <div className="doctor-header__content">
          <div className="doctor-header__name">
            {entry.doctorInfo.number === 'Time War' ? 'The Time War Era' : `${entry.doctorInfo.number} Doctor`}
          </div>
          <div className="doctor-header__actor">{entry.doctorInfo.actor}</div>
        </div>
        <div className="doctor-header__decoration" style={{ backgroundColor: color }} />
      </div>
    )
  }

  if (entry.isNote) {
    return (
      <div className="entry-note">
        <span className="entry-note__icon">📝</span>
        <span className="entry-note__text">{entry.title}</span>
      </div>
    )
  }

  const formatInfo = getFormatInfo(entry.format)
  const showIcon = getShowIcon(entry.show)

  return (
    <div
      className={`entry-card ${getShowClass(entry.show)} ${isExpanded ? 'entry-card--expanded' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="entry-card__main">
        <span className="entry-card__number">#{index ?? '?'}</span>
        <span className={`entry-card__format ${formatInfo.className}`}>
          <span className="entry-card__format-icon">{formatInfo.icon}</span>
          <span className="entry-card__format-label">{formatInfo.label}</span>
        </span>
        <span className="entry-card__title">{entry.title}</span>
        {entry.show && (
          <span className="entry-card__show">
            <span className="entry-card__show-icon">{showIcon}</span>
            {entry.show}
          </span>
        )}
        <span className="entry-card__expand">{isExpanded ? '−' : '+'}</span>
      </div>

      {isExpanded && (
        <div className="entry-card__details">
          <div className="entry-card__detail-row">
            <span className="entry-card__detail-label">Format:</span>
            <span className="entry-card__detail-value">{entry.format || 'Unknown'}</span>
          </div>
          <div className="entry-card__detail-row">
            <span className="entry-card__detail-label">Series:</span>
            <span className="entry-card__detail-value">{entry.show || 'Doctor Who'}</span>
          </div>
          <div className="entry-card__detail-row">
            <span className="entry-card__detail-label">Chronology #:</span>
            <span className="entry-card__detail-value">{index ?? 'N/A'}</span>
          </div>
          <div className="entry-card__media-type">
            {formatInfo.icon} {formatInfo.label === 'Big Finish' ? 'Audio Drama' : formatInfo.label}
          </div>
        </div>
      )}
    </div>
  )
}
