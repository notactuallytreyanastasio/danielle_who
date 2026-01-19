# Danielle's Doctor Explorer

A comprehensive Doctor Who knowledge explorer featuring 384 TV episodes, 1,710+ stories across all media, and a knowledge graph with 2,731 interconnected nodes covering the entire Whoniverse from 1963 to present.

## Features

### The Doctors Tab
An interactive timeline of all 15 Doctor incarnations (plus the War Doctor), featuring:

- **Doctor Profiles** - Each Doctor's actor, years active, personality description, and signature catchphrase
- **Companions** - Full companion roster for each era with actors and first appearances
- **Enemies** - Major villains and monsters faced by each Doctor with notable episode appearances
- **Key Stories** - Landmark episodes and serials with significance notes
- **Fun Facts** - Era-defining trivia and behind-the-scenes information
- **Regeneration Details** - How each Doctor met their end
- **Adventure Statistics** - Powered by Eyespider data showing total adventures broken down by format (TV, Audio, Novel, Comic, Short Story)

Filter by Classic (1-8) or Modern (9+) Doctors.

### Filming Locations Tab
Interactive map of real-world Doctor Who filming locations featuring:

- **Map View** - Leaflet-powered map with location markers
- **Location Details** - Address, type (landmark, building, studio, beach, exterior), and current status
- **Episode Connections** - Which episodes were filmed at each location
- **Quick Navigation** - Jump to Cardiff, London, or other key filming areas
- **Filtering** - Filter by location type or search by name

### Full Chronology Tab
Comprehensive TV episode guide with 384 stories from the Tardis Wiki:

- **Episode Cards** - Story number, title, Doctor, episode count
- **Expandable Details**:
  - Companions featured (tagged for easy browsing)
  - Enemies/villains (tagged)
  - Writer, Director, Producer credits
  - Series/Season information
  - Setting location and time period
  - Synopsis excerpt
  - Direct link to Tardis Wiki
- **Missing Episodes** - Classic episodes flagged as missing or partially missing with visual indicators
- **Search** - Full-text search across titles, companions, enemies, writers, and locations
- **Filters**:
  - Filter by Doctor (First through Fifteenth)
  - Sort by story number, title, or Doctor
  - Toggle to show only missing episodes

### Knowledge Graph Tab
Explore the interconnected Doctor Who knowledge base with 2,731 nodes and 7,728 edges:

- **Node Types** - Goals, decisions, actions, outcomes, observations, and more
- **Categories**:
  - Doctors - All incarnations with metadata
  - Companions - Every traveling companion
  - Enemies - Daleks, Cybermen, The Master, and hundreds more
  - Locations - Gallifrey, Earth locations, alien planets
  - Stories - Episode and story nodes
- **Search** - Full-text search across all nodes
- **Connection Browsing** - Click any node to see what it's connected to
- **Node Details** - Type, status, creation date, and full connection graph

## Data Sources

### Tardis Wiki Data (`data/tardis-wiki/`)
Scraped from the official Doctor Who wiki:
- `tardis-wiki-tv-episodes.json` - 384 TV stories with full metadata
- `tardis-wiki-companions.json` - Companion profiles
- `tardis-wiki-enemies.json` - Enemy/villain profiles
- `tardis-wiki-doctors.json` - Doctor incarnation data

### Eyespider Chronology (`data/scraped/`)
From the Complete Adventures guide:
- `eyespider-python.json` - 1,710 stories across all media in chronological order
- Covers TV, Audio (Big Finish), Novels, Comics, Short Stories
- Organized by Doctor with format breakdowns

### Knowledge Graph (`.deciduous/`)
Built using the Deciduous CLI:
- 2,731 nodes covering characters, episodes, concepts, locations
- 7,728 edges connecting related entities
- Queryable via CLI or web interface

### Location Data (`src/core/location-data.ts`)
Real-world filming locations with GPS coordinates and episode connections.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Custom CSS with Doctor Who theme (TARDIS blue palette)
- **Maps**: Leaflet for filming locations
- **Data**: JSON, CSV, SQLite (via Deciduous)
- **Build**: Vite 7.x

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## CLI Skills

### `/whosearch` - Query Doctor Who Data
Search across all data sources from the command line:

```bash
# Search episodes by enemy
/whosearch Daleks

# Find companion appearances
/whosearch Sarah Jane

# Search by writer
/whosearch Terry Nation

# Find episodes by location
/whosearch Gallifrey
```

### `/decision` - Manage Knowledge Graph
Track decisions and connections:

```bash
deciduous nodes              # List all nodes
deciduous edges              # List all connections
deciduous nodes | grep -i "dalek"  # Search nodes
deciduous serve              # View graph in browser
```

## Project Structure

```
danielle_who/
├── src/
│   ├── core/                 # Pure business logic
│   │   ├── types.ts          # Domain types
│   │   ├── doctor-data.ts    # DOCTORS array with full profiles
│   │   ├── eyespider-data.ts # Story processing utilities
│   │   ├── wiki-data.ts      # Wiki data types and queries
│   │   ├── graph-data.ts     # Knowledge graph utilities
│   │   ├── search-index.ts   # Client-side search indexing
│   │   ├── location-data.ts  # Filming location data
│   │   └── filters.ts        # Data filtering functions
│   ├── shell/
│   │   └── components/       # React UI components
│   │       ├── App.tsx
│   │       ├── Timeline.tsx           # Doctors tab
│   │       ├── LocationsMap.tsx       # Locations tab
│   │       ├── EnrichedChronology.tsx # Chronology tab
│   │       └── KnowledgeGraph.tsx     # Graph tab
│   └── index.css             # All styles
├── public/data/              # Static data for web app
│   ├── wiki-episodes.json    # 384 TV episodes
│   ├── eyespider-data.json   # 1,710 stories
│   ├── graph-data.json       # Knowledge graph export
│   └── who-chronology.csv    # Timeline data
├── data/                     # Raw scraped data
│   ├── tardis-wiki/          # Wiki scrapes
│   └── scraped/              # Eyespider data
├── .deciduous/               # Knowledge graph database
├── .claude/
│   ├── commands/             # CLI skills
│   │   └── whosearch.md      # Data query skill
│   └── agents.toml           # Agent configuration
└── docs/
    └── graph-data.json       # Exported graph for GitHub Pages
```

## Statistics

| Data Type | Count |
|-----------|-------|
| TV Episodes | 384 |
| Total Stories (all media) | 1,710 |
| Knowledge Graph Nodes | 2,731 |
| Knowledge Graph Edges | 7,728 |
| Doctor Incarnations | 16 |
| Filming Locations | 100+ |

## Citations & Data Sources

- **Chronology**: [Google Sheets Timeline](https://docs.google.com/spreadsheets/d/1nhIivCVVJE0IP_pjCRE8VBrLsFvIWf3M9k3FryO7RAk/edit?gid=0#gid=0)
- **Complete Adventures**: [Eyespider.org](http://eyespider.org.uk/drwho/compleat.html)
- **Timeline Infographic**: [Cool Infographics](https://coolinfographics.com/blog/2012/1/3/the-timeline-of-doctor-who.html)
- **Filming Locations**: [Doctor Who Locations](https://www.doctorwholocations.net/)
- **Wiki Data**: [Tardis Wiki](https://tardis.fandom.com/)

## License

This is a fan project for educational purposes. Doctor Who is a trademark of the BBC.
