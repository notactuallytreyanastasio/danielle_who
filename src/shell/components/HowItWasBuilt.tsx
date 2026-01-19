export function HowItWasBuilt() {
  return (
    <div className="how-built">
      <div className="how-built__header">
        <h2>How This Was Built</h2>
        <p className="how-built__subtitle">
          The complete story of building Danielle's Doctor Explorer
        </p>
      </div>

      <div className="how-built__content">
        <section className="how-built__section">
          <h3>The Origin</h3>
          <blockquote className="how-built__quote">
            "Let's build a wildly in depth Doctor Who deciduous graph that can cover
            just about any questions or ideas or happenings from the entire show history
            so you can just ask about things from the series' vast amount of material"
          </blockquote>
          <p>
            The project started with a simple frustration: there was no true central,
            searchable, not ad-ridden, deeply covered Doctor Who knowledge site. Fan wikis
            exist but they're cluttered with ads and hard to navigate. Episode guides lack
            cross-referencing. So I decided to build one.
          </p>
        </section>

        <section className="how-built__section">
          <h3>Phase 1: Data Collection</h3>
          <p>
            Before building any interface, I needed comprehensive data. This involved
            scraping and processing from multiple sources:
          </p>

          <div className="how-built__data-source">
            <h4>Tardis Wiki Scraping</h4>
            <p>
              Using Python with BeautifulSoup, I scraped the Tardis Wiki (tardis.fandom.com)
              to extract structured data for all 384 TV episodes. Each episode entry includes:
            </p>
            <ul>
              <li>Story number, title, episode count</li>
              <li>Doctor incarnation</li>
              <li>Companions featured</li>
              <li>Enemies and villains</li>
              <li>Writer, Director, Producer credits</li>
              <li>Series/Season information</li>
              <li>Setting location and time period</li>
              <li>Full synopsis</li>
              <li>Missing episode status (for Classic Who)</li>
            </ul>
            <code className="how-built__code">scripts/scrape_tardis_wiki.py → data/tardis-wiki/tardis-wiki-tv-episodes.json</code>
          </div>

          <div className="how-built__data-source">
            <h4>Eyespider Complete Adventures</h4>
            <p>
              The Eyespider chronology at eyespider.org.uk catalogs every Doctor Who story
              ever told — not just TV, but audio dramas, novels, comics, and short stories.
              I scraped all 1,710+ entries to build a complete cross-media chronology:
            </p>
            <ul>
              <li>Stories organized by Doctor</li>
              <li>Format breakdown (TV, Audio, Novel, Comic, Short Story)</li>
              <li>Chronological ordering within each Doctor's era</li>
              <li>Source information (Big Finish, BBC Books, etc.)</li>
            </ul>
            <code className="how-built__code">scripts/scrape_eyespider.py → data/scraped/eyespider-python.json</code>
          </div>

          <div className="how-built__data-source">
            <h4>Filming Locations</h4>
            <p>
              Real-world Doctor Who filming locations were compiled from doctorwholocations.net,
              with GPS coordinates added for map display:
            </p>
            <ul>
              <li>100+ locations across the UK</li>
              <li>Categorized by type (studio, landmark, beach, exterior)</li>
              <li>Episode connections for each location</li>
              <li>Current status and accessibility notes</li>
            </ul>
            <code className="how-built__code">src/core/location-data.ts</code>
          </div>
        </section>

        <section className="how-built__section">
          <h3>Phase 2: Knowledge Graph Construction</h3>
          <p>
            With the raw data collected, the next step was building an interconnected
            knowledge graph using <a href="https://github.com/notactuallytreyanastasio/deciduous" target="_blank" rel="noopener noreferrer">Deciduous</a>,
            a CLI tool for tracking decisions and building knowledge graphs.
          </p>

          <div className="how-built__stats-grid">
            <div className="how-built__stat">
              <span className="how-built__stat-value">2,731</span>
              <span className="how-built__stat-label">Nodes Created</span>
            </div>
            <div className="how-built__stat">
              <span className="how-built__stat-value">7,728</span>
              <span className="how-built__stat-label">Edges Connected</span>
            </div>
          </div>

          <p>The knowledge graph includes nodes for:</p>
          <ul>
            <li><strong>All 16 Doctor incarnations</strong> — With actor info, years active, personality traits</li>
            <li><strong>70+ companions</strong> — From Susan Foreman to Ruby Sunday</li>
            <li><strong>50+ enemies</strong> — Daleks, Cybermen, The Master, and more</li>
            <li><strong>Key concepts</strong> — Regeneration, Time Lords, TARDIS mechanics</li>
            <li><strong>Locations</strong> — Gallifrey, Earth settings, alien planets</li>
            <li><strong>Story connections</strong> — How episodes relate to each other</li>
          </ul>

          <p>
            Every node is connected with meaningful edges — The Doctor leads to companions,
            companions appear in episodes, episodes feature enemies, and so on. This creates
            a navigable web of Doctor Who knowledge.
          </p>

          <code className="how-built__code">
            deciduous add observation "The Fourth Doctor (Tom Baker, 1974-1981)"<br/>
            deciduous link 10 1 -r "Part of Doctor Who universe"
          </code>
        </section>

        <section className="how-built__section">
          <h3>Phase 3: Web Application</h3>
          <p>
            With data and knowledge graph ready, I built a React application to make
            everything accessible and searchable.
          </p>

          <div className="how-built__tech">
            <h4>Tech Stack</h4>
            <ul>
              <li><strong>React 19</strong> — Latest React with TypeScript for type safety</li>
              <li><strong>Vite 7</strong> — Fast build tool and dev server</li>
              <li><strong>Leaflet</strong> — Interactive maps for filming locations</li>
              <li><strong>Custom CSS</strong> — TARDIS blue theme throughout</li>
            </ul>
          </div>

          <div className="how-built__features">
            <h4>Four Main Tabs</h4>

            <div className="how-built__feature">
              <strong>The Doctors</strong>
              <p>
                Timeline component showing all Doctor incarnations. Each Doctor
                expands to show companions, enemies, key stories, fun facts, and
                adventure statistics pulled from the Eyespider data. Filter by
                Classic (1-8) or Modern (9+) eras.
              </p>
            </div>

            <div className="how-built__feature">
              <strong>Filming Locations</strong>
              <p>
                Leaflet map with markers for 100+ UK filming locations. Quick
                navigation buttons for Cardiff and London. Filter by city or
                location type. Click markers to see which episodes were filmed there.
              </p>
            </div>

            <div className="how-built__feature">
              <strong>Full Chronology</strong>
              <p>
                Searchable list of all 384 TV episodes. Each card expands to show
                full metadata including synopsis, companions, enemies, and credits.
                Filter by Doctor, sort by various fields, or show only missing episodes.
              </p>
            </div>

            <div className="how-built__feature">
              <strong>Knowledge Graph</strong>
              <p>
                Two views: an embedded Deciduous graph viewer with multiple
                visualization modes (DAG, Timeline, Graph), and a simple node
                browser for searching and exploring connections.
              </p>
            </div>
          </div>
        </section>

        <section className="how-built__section">
          <h3>Phase 4: URL Routing</h3>
          <p>
            To make the app truly shareable, I implemented URL query parameter routing.
            Every view state is encoded in the URL:
          </p>
          <ul>
            <li><code>?tab=chronology</code> — Switch tabs</li>
            <li><code>?q=Daleks</code> — Search queries</li>
            <li><code>?doctor=Fourth</code> — Filter by Doctor</li>
            <li><code>?doc=4</code> — Expand specific Doctor</li>
            <li><code>?episode=100</code> — Expand specific episode</li>
          </ul>
          <p>
            This means you can share a link like <code>?tab=chronology&q=Cybermen&doctor=Tenth</code>
            and it will load exactly that view.
          </p>
        </section>

        <section className="how-built__section">
          <h3>Phase 5: Deployment</h3>
          <p>
            The final step was deploying to GitHub Pages:
          </p>
          <ol>
            <li>Configured Vite to build to <code>docs/</code> folder</li>
            <li>Set base path to <code>/danielle_who/</code> for GitHub Pages URL structure</li>
            <li>Added <code>.nojekyll</code> file to prevent Jekyll processing</li>
            <li>Embedded the Deciduous graph viewer in an iframe at <code>/graph/</code></li>
            <li>Created OG meta tags and social share image for link previews</li>
          </ol>
        </section>

        <section className="how-built__section">
          <h3>The Timeline</h3>
          <div className="how-built__timeline">
            <div className="how-built__timeline-item">
              <span className="how-built__timeline-marker"></span>
              <div className="how-built__timeline-content">
                <strong>Initial Setup</strong>
                <p>Created repo, added Deciduous for knowledge graph tracking</p>
              </div>
            </div>
            <div className="how-built__timeline-item">
              <span className="how-built__timeline-marker"></span>
              <div className="how-built__timeline-content">
                <strong>Data Scraping</strong>
                <p>Scraped Tardis Wiki (384 episodes) and Eyespider (1,710+ stories)</p>
              </div>
            </div>
            <div className="how-built__timeline-item">
              <span className="how-built__timeline-marker"></span>
              <div className="how-built__timeline-content">
                <strong>Knowledge Graph</strong>
                <p>Built 2,731 nodes with 7,728 edges covering the Whoniverse</p>
              </div>
            </div>
            <div className="how-built__timeline-item">
              <span className="how-built__timeline-marker"></span>
              <div className="how-built__timeline-content">
                <strong>React Application</strong>
                <p>Created 4-tab interface: Doctors, Locations, Chronology, Knowledge Graph</p>
              </div>
            </div>
            <div className="how-built__timeline-item">
              <span className="how-built__timeline-marker"></span>
              <div className="how-built__timeline-content">
                <strong>URL Routing</strong>
                <p>Added shareable URLs with query parameters for all view states</p>
              </div>
            </div>
            <div className="how-built__timeline-item">
              <span className="how-built__timeline-marker"></span>
              <div className="how-built__timeline-content">
                <strong>GitHub Pages</strong>
                <p>Deployed with embedded graph viewer, OG tags, and social share image</p>
              </div>
            </div>
          </div>
        </section>

        <section className="how-built__section">
          <h3>By the Numbers</h3>
          <div className="how-built__numbers">
            <div className="how-built__number-item">
              <span className="how-built__number">384</span>
              <span className="how-built__number-label">TV Episodes Indexed</span>
            </div>
            <div className="how-built__number-item">
              <span className="how-built__number">1,710+</span>
              <span className="how-built__number-label">Total Stories (All Media)</span>
            </div>
            <div className="how-built__number-item">
              <span className="how-built__number">2,731</span>
              <span className="how-built__number-label">Knowledge Graph Nodes</span>
            </div>
            <div className="how-built__number-item">
              <span className="how-built__number">7,728</span>
              <span className="how-built__number-label">Graph Connections</span>
            </div>
            <div className="how-built__number-item">
              <span className="how-built__number">100+</span>
              <span className="how-built__number-label">Filming Locations</span>
            </div>
            <div className="how-built__number-item">
              <span className="how-built__number">16</span>
              <span className="how-built__number-label">Doctor Incarnations</span>
            </div>
            <div className="how-built__number-item">
              <span className="how-built__number">60+</span>
              <span className="how-built__number-label">Years of Who History</span>
            </div>
            <div className="how-built__number-item">
              <span className="how-built__number">8</span>
              <span className="how-built__number-label">Git Commits</span>
            </div>
          </div>
        </section>

        <section className="how-built__section">
          <h3>Tools Used</h3>
          <ul className="how-built__tools">
            <li><strong>Deciduous</strong> — Knowledge graph CLI for tracking nodes and connections</li>
            <li><strong>Python + BeautifulSoup</strong> — Web scraping for wiki and chronology data</li>
            <li><strong>React 19 + TypeScript</strong> — Frontend framework</li>
            <li><strong>Vite 7</strong> — Build tool</li>
            <li><strong>Leaflet</strong> — Interactive mapping</li>
            <li><strong>GitHub Pages</strong> — Static hosting</li>
            <li><strong>Claude Code</strong> — AI pair programming assistant</li>
          </ul>
        </section>

        <section className="how-built__section how-built__section--final">
          <h3>The Result</h3>
          <p>
            A comprehensive, searchable, ad-free Doctor Who knowledge explorer that covers
            60+ years of the show's history. Search across all episodes, browse by Doctor,
            explore filming locations on a map, and navigate an interconnected knowledge
            graph of the entire Whoniverse.
          </p>
          <p>
            <strong>Because every fan deserves a proper database of their favorite show.</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
