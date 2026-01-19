import { Timeline } from './Timeline'
import { LocationsMap } from './LocationsMap'
import { KnowledgeGraph } from './KnowledgeGraph'
import { EnrichedChronology } from './EnrichedChronology'
import { HowItWasBuilt } from './HowItWasBuilt'
import { useUrlState } from '@core/use-url-state'

type ViewTab = 'chronology' | 'timeline' | 'locations' | 'knowledge' | 'about'

export function App() {
  const [activeTab, setActiveTab] = useUrlState<ViewTab>('tab', 'timeline')

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">
          <span>🌀</span>
          Danielle's Doctor Explorer
        </h1>
        <p className="header__subtitle">
          Explore the complete history of the Whoniverse
        </p>
      </header>

      <main className="main">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'timeline' ? 'nav-tab--active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            🎬 The Doctors
          </button>
          <button
            className={`nav-tab ${activeTab === 'locations' ? 'nav-tab--active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            🗺️ Filming Locations
          </button>
          <button
            className={`nav-tab ${activeTab === 'chronology' ? 'nav-tab--active' : ''}`}
            onClick={() => setActiveTab('chronology')}
          >
            📚 Full Chronology
          </button>
          <button
            className={`nav-tab ${activeTab === 'knowledge' ? 'nav-tab--active' : ''}`}
            onClick={() => setActiveTab('knowledge')}
          >
            🧠 Knowledge Graph
          </button>
          <button
            className={`nav-tab ${activeTab === 'about' ? 'nav-tab--active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            📖 How It Was Built
          </button>
        </div>

        {activeTab === 'timeline' && <Timeline />}

        {activeTab === 'locations' && <LocationsMap />}

        {activeTab === 'knowledge' && <KnowledgeGraph />}

        {activeTab === 'chronology' && <EnrichedChronology />}

        {activeTab === 'about' && <HowItWasBuilt />}
      </main>
    </div>
  )
}
