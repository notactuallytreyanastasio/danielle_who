import { useState, useEffect } from 'react'
import type { Doctor, Companion, Enemy, Story } from '@core/timeline-types'
import { DOCTORS } from '@core/doctor-data'
import type { DoctorAdventures, StoryFormat } from '@core/eyespider-data'
import { processRawData, FORMAT_COLORS } from '@core/eyespider-data'

type ExpandedSection = 'companions' | 'enemies' | 'stories' | 'facts' | 'adventures' | null

// Hook to load eyespider data
function useEyespiderData(): DoctorAdventures[] {
  const [data, setData] = useState<DoctorAdventures[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/eyespider-data.json')
        if (response.ok) {
          const rawData = await response.json()
          const processed = processRawData(rawData)
          setData(processed)
        }
      } catch (err) {
        console.error('Failed to load eyespider data:', err)
      }
    }
    void loadData()
  }, [])

  return data
}

// Format breakdown bar chart
function AdventuresBreakdown({ adventures }: { adventures: DoctorAdventures | undefined }) {
  if (!adventures) {
    return <div className="adventures-loading">Loading adventure data...</div>
  }

  const formats: StoryFormat[] = ['TV', 'Audio', 'Novel', 'Comic', 'Short Story', 'Other']
  const maxCount = Math.max(...formats.map(f => adventures.stats.byFormat[f] || 0))

  return (
    <div className="adventures-breakdown">
      <div className="adventures-total">
        <span className="adventures-total__number">{adventures.stats.total}</span>
        <span className="adventures-total__label">Total Adventures</span>
      </div>

      <div className="adventures-formats">
        {formats.map(format => {
          const count = adventures.stats.byFormat[format] || 0
          if (count === 0) return null
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

          return (
            <div key={format} className="adventures-format">
              <div className="adventures-format__label">
                <span
                  className="adventures-format__dot"
                  style={{ backgroundColor: FORMAT_COLORS[format] }}
                />
                <span>{format}</span>
              </div>
              <div className="adventures-format__bar-container">
                <div
                  className="adventures-format__bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: FORMAT_COLORS[format],
                  }}
                />
              </div>
              <span className="adventures-format__count">{count}</span>
            </div>
          )
        })}
      </div>

      {adventures.stories.length > 0 && (
        <div className="adventures-sample">
          <h5>Sample Adventures:</h5>
          <div className="adventures-sample__list">
            {adventures.stories.slice(0, 6).map((story, i) => (
              <div key={i} className="adventure-chip">
                <span
                  className="adventure-chip__dot"
                  style={{ backgroundColor: FORMAT_COLORS[story.format] }}
                />
                <span className="adventure-chip__title">{story.title}</span>
                {story.source && (
                  <span className="adventure-chip__source">{story.source}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface DoctorNodeProps {
  doctor: Doctor
  isExpanded: boolean
  onToggle: () => void
  adventures: DoctorAdventures | undefined
}

function CompanionCard({ companion }: { companion: Companion }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`timeline-card timeline-card--companion ${expanded ? 'timeline-card--expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="timeline-card__header">
        <span className="timeline-card__icon">👤</span>
        <span className="timeline-card__name">{companion.name}</span>
        <span className="timeline-card__actor">{companion.actor}</span>
      </div>
      {expanded && (
        <div className="timeline-card__details">
          <p>{companion.description}</p>
          <p className="timeline-card__meta">First: {companion.firstAppearance}</p>
        </div>
      )}
    </div>
  )
}

function EnemyCard({ enemy }: { enemy: Enemy }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`timeline-card timeline-card--enemy ${expanded ? 'timeline-card--expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="timeline-card__header">
        <span className="timeline-card__icon">👾</span>
        <span className="timeline-card__name">{enemy.name}</span>
      </div>
      {expanded && (
        <div className="timeline-card__details">
          <p>{enemy.description}</p>
          {enemy.firstAppearance && (
            <p className="timeline-card__meta">First: {enemy.firstAppearance}</p>
          )}
          <div className="timeline-card__episodes">
            {enemy.notableEpisodes.map((ep) => (
              <span key={ep} className="timeline-tag">{ep}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StoryCard({ story }: { story: Story }) {
  return (
    <div className={`timeline-card timeline-card--story ${story.isLandmark ? 'timeline-card--landmark' : ''}`}>
      <div className="timeline-card__header">
        <span className="timeline-card__icon">{story.isLandmark ? '⭐' : '📺'}</span>
        <span className="timeline-card__name">{story.title}</span>
        <span className="timeline-card__year">{story.year}</span>
      </div>
      <div className="timeline-card__details">
        <p>{story.significance}</p>
        <span className="timeline-tag timeline-tag--type">{story.type}</span>
      </div>
    </div>
  )
}

function DoctorNode({ doctor, isExpanded, onToggle, adventures }: DoctorNodeProps) {
  const [activeSection, setActiveSection] = useState<ExpandedSection>(null)

  const toggleSection = (section: ExpandedSection) => {
    setActiveSection(activeSection === section ? null : section)
  }

  const displayNumber = doctor.number === 0 ? 'War' : doctor.number.toString()

  return (
    <div
      className={`doctor-node ${isExpanded ? 'doctor-node--expanded' : ''}`}
      style={{
        '--doctor-color': doctor.color,
        '--doctor-accent': doctor.accentColor,
      } as React.CSSProperties}
    >
      <div className="doctor-node__header" onClick={onToggle}>
        <div
          className="doctor-node__number"
          style={{ backgroundColor: doctor.color }}
        >
          {displayNumber}
        </div>
        <div className="doctor-node__info">
          <h3 className="doctor-node__name">{doctor.actor}</h3>
          <p className="doctor-node__years">{doctor.years}</p>
        </div>
        <div className="doctor-node__personality">
          {doctor.personality}
        </div>
        <div className="doctor-node__expand-icon">
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {isExpanded && (
        <div className="doctor-node__content">
          {doctor.catchphrase && (
            <div className="doctor-node__catchphrase">
              "{doctor.catchphrase}"
            </div>
          )}

          <div className="doctor-node__sections">
            <button
              className={`section-button ${activeSection === 'companions' ? 'section-button--active' : ''}`}
              onClick={() => toggleSection('companions')}
              style={{ borderColor: doctor.accentColor }}
            >
              <span>👤</span> Companions ({doctor.companions.length})
            </button>
            <button
              className={`section-button ${activeSection === 'enemies' ? 'section-button--active' : ''}`}
              onClick={() => toggleSection('enemies')}
              style={{ borderColor: doctor.accentColor }}
            >
              <span>👾</span> Enemies ({doctor.enemies.length})
            </button>
            <button
              className={`section-button ${activeSection === 'stories' ? 'section-button--active' : ''}`}
              onClick={() => toggleSection('stories')}
              style={{ borderColor: doctor.accentColor }}
            >
              <span>📺</span> Key Stories ({doctor.keyStories.length})
            </button>
            <button
              className={`section-button ${activeSection === 'facts' ? 'section-button--active' : ''}`}
              onClick={() => toggleSection('facts')}
              style={{ borderColor: doctor.accentColor }}
            >
              <span>💡</span> Facts ({doctor.facts.length})
            </button>
            {adventures && (
              <button
                className={`section-button section-button--highlight ${activeSection === 'adventures' ? 'section-button--active' : ''}`}
                onClick={() => toggleSection('adventures')}
                style={{ borderColor: doctor.accentColor }}
              >
                <span>📚</span> All Adventures ({adventures.stats.total})
              </button>
            )}
          </div>

          {activeSection === 'companions' && (
            <div className="doctor-node__section-content">
              <div className="timeline-cards">
                {doctor.companions.map((c) => (
                  <CompanionCard key={c.name} companion={c} />
                ))}
              </div>
            </div>
          )}

          {activeSection === 'enemies' && (
            <div className="doctor-node__section-content">
              <div className="timeline-cards">
                {doctor.enemies.map((e) => (
                  <EnemyCard key={e.name} enemy={e} />
                ))}
              </div>
            </div>
          )}

          {activeSection === 'stories' && (
            <div className="doctor-node__section-content">
              <div className="timeline-cards timeline-cards--stories">
                {doctor.keyStories.map((s) => (
                  <StoryCard key={s.title} story={s} />
                ))}
              </div>
            </div>
          )}

          {activeSection === 'facts' && (
            <div className="doctor-node__section-content">
              <ul className="doctor-node__facts">
                {doctor.facts.map((fact, i) => (
                  <li key={i}>{fact}</li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === 'adventures' && (
            <div className="doctor-node__section-content">
              <AdventuresBreakdown adventures={adventures} />
            </div>
          )}

          {doctor.regenerationCause && (
            <div className="doctor-node__regeneration">
              <span className="regeneration-icon">🔄</span>
              <span>Regeneration: {doctor.regenerationCause}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Timeline() {
  const [expandedDoctor, setExpandedDoctor] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'classic' | 'modern'>('all')
  const eyespiderData = useEyespiderData()

  // Map doctor number to eyespider data (handle War Doctor special case)
  const getAdventuresForDoctor = (doctorNumber: number): DoctorAdventures | undefined => {
    // Map our doctor numbers to eyespider's numbering
    // War Doctor (0 in our system) is doctorNumber 9 in eyespider
    const eyespiderNumber = doctorNumber === 0 ? 9 : (doctorNumber <= 8 ? doctorNumber : doctorNumber + 1)
    return eyespiderData.find(d => d.doctorNumber === eyespiderNumber)
  }

  const filteredDoctors = DOCTORS.filter((d) => {
    if (filter === 'all') return true
    if (filter === 'classic') return d.number >= 1 && d.number <= 8
    if (filter === 'modern') return d.number === 0 || d.number >= 9
    return true
  })

  const toggleDoctor = (num: number) => {
    setExpandedDoctor(expandedDoctor === num ? null : num)
  }

  return (
    <div className="timeline">
      <div className="timeline__header">
        <h2 className="timeline__title">The Doctors</h2>
        <p className="timeline__subtitle">Click on any Doctor to explore their era</p>

        <div className="timeline__filters">
          <button
            className={`timeline-filter ${filter === 'all' ? 'timeline-filter--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Doctors
          </button>
          <button
            className={`timeline-filter ${filter === 'classic' ? 'timeline-filter--active' : ''}`}
            onClick={() => setFilter('classic')}
          >
            Classic (1-8)
          </button>
          <button
            className={`timeline-filter ${filter === 'modern' ? 'timeline-filter--active' : ''}`}
            onClick={() => setFilter('modern')}
          >
            Modern (9+)
          </button>
        </div>
      </div>

      <div className="timeline__track">
        <div className="timeline__line" />
        {filteredDoctors.map((doctor) => (
          <DoctorNode
            key={doctor.number}
            doctor={doctor}
            isExpanded={expandedDoctor === doctor.number}
            onToggle={() => toggleDoctor(doctor.number)}
            adventures={getAdventuresForDoctor(doctor.number)}
          />
        ))}
      </div>
    </div>
  )
}
