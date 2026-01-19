# Danielle's Doctor Explorer

**[Live Site](https://notactuallytreyanastasio.github.io/danielle_who/)**

There was no true central, searchable, not ad-ridden, deeply covered Doctor Who knowledge site, so I made one. Search the full chronology with time overlaps and jumps, across all doctors and episodes, with over 1,000 stories documented from the show in the process. Browse information from all doctors as well, and filming locations too.

---

## At a Glance

| | |
|---|---|
| **TV Episodes** | 384 stories from 1963-present |
| **Total Stories** | 1,710+ across all media (TV, Audio, Novel, Comic, Short Story) |
| **Knowledge Graph** | 2,731 nodes with 7,728 connections |
| **Doctors** | All 16 incarnations (including War Doctor) |
| **Filming Locations** | 100+ real-world UK locations mapped |

---

## Features

### The Doctors

An interactive timeline of every Doctor incarnation with:

- **Doctor Profiles** — Actor, years active, personality, signature catchphrase
- **Companions** — Full roster for each era with actors and first appearances
- **Enemies** — Major villains faced by each Doctor
- **Key Stories** — Landmark episodes with significance notes
- **Fun Facts** — Era-defining trivia and behind-the-scenes info
- **Regeneration Details** — How each Doctor met their end
- **Adventure Statistics** — Total adventures broken down by format (TV, Audio, Novel, Comic, Short Story)

Filter by Classic (1-8) or Modern (9+) eras.

**Shareable URLs:**
```
?tab=timeline&era=classic      # Classic Doctors only
?tab=timeline&doc=4            # Fourth Doctor expanded
```

### Filming Locations

Interactive Leaflet map of real-world Doctor Who filming locations:

- **Map View** — Markers for 100+ locations across the UK
- **Location Details** — Address, type (landmark, studio, beach, exterior), status
- **Episode Connections** — Which episodes were filmed at each location
- **Quick Navigation** — Jump to Cardiff, London, or other key areas
- **Filtering** — Filter by city or location type

**Shareable URLs:**
```
?tab=locations&city=Cardiff    # Cardiff locations only
?tab=locations&type=studio     # Studios only
```

### Full Chronology

Comprehensive TV episode guide with 384 stories:

- **Episode Cards** — Story number, title, Doctor, episode count
- **Expandable Details:**
  - Companions and enemies (tagged)
  - Writer, Director, Producer credits
  - Series/Season information
  - Setting location and time period
  - Full synopsis
  - Direct link to Tardis Wiki
- **Missing Episodes** — Classic episodes flagged as missing or partially missing
- **Search** — Full-text search across titles, companions, enemies, writers, locations
- **Filters** — By Doctor, sort order, missing episodes only

**Shareable URLs:**
```
?tab=chronology&q=Daleks           # Search for Daleks
?tab=chronology&doctor=Fourth      # Fourth Doctor episodes
?tab=chronology&missing=1          # Missing episodes only
?tab=chronology&episode=100        # Expand story #100
```

### Knowledge Graph

Explore the interconnected Whoniverse with 2,731 nodes and 7,728 edges:

- **Interactive Graph Viewer** — Full Deciduous visualization with multiple views (DAG, Chains, Timeline, Graph, Roadmap, Story)
- **Browse Mode** — Searchable list of all nodes
- **Categories** — Doctors, Companions, Enemies, Locations, Stories
- **Connection Browsing** — Click any node to explore its connections
- **Node Details** — Type, status, metadata, and relationship graph

**Shareable URLs:**
```
?tab=knowledge&view=graph          # Interactive graph view
?tab=knowledge&view=browse         # Browse mode
?tab=knowledge&cat=enemies         # Filter to enemies
?tab=knowledge&gq=Dalek            # Search nodes
?tab=knowledge&node=42             # Select specific node
```

---

## URL Routing

Every view state is encoded in the URL, making it easy to share specific searches, filters, and selections:

| Parameter | Tab | Description |
|-----------|-----|-------------|
| `tab` | All | `timeline`, `locations`, `chronology`, `knowledge` |
| `era` | Doctors | `all`, `classic`, `modern` |
| `doc` | Doctors | Doctor number to expand (e.g., `4`) |
| `city` | Locations | Filter by city |
| `type` | Locations | Filter by location type |
| `loc` | Locations | Select specific location |
| `q` | Chronology | Search query |
| `doctor` | Chronology | Filter by Doctor |
| `sort` | Chronology | `number`, `title`, `doctor` |
| `missing` | Chronology | `1` to show only missing |
| `episode` | Chronology | Story number to expand |
| `view` | Knowledge | `graph` or `browse` |
| `cat` | Knowledge | Category filter |
| `gq` | Knowledge | Node search query |
| `node` | Knowledge | Selected node ID |

---

## Data Sources

### Tardis Wiki
384 TV stories scraped from the official Doctor Who wiki with full metadata including companions, enemies, writers, directors, synopses, and missing episode status.

### Eyespider Complete Adventures
1,710+ stories across all media in chronological order from [Eyespider.org](http://eyespider.org.uk/drwho/compleat.html). Covers TV, Audio (Big Finish), Novels, Comics, and Short Stories organized by Doctor.

### Knowledge Graph
Built using [Deciduous](https://github.com/notactuallytreyanastasio/deciduous) — 2,731 nodes covering characters, episodes, concepts, and locations with 7,728 edges connecting related entities.

### Filming Locations
100+ real-world UK filming locations with GPS coordinates and episode connections from [Doctor Who Locations](https://www.doctorwholocations.net/).

---

## Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build:** Vite 7
- **Styling:** Custom CSS with TARDIS blue theme
- **Maps:** Leaflet
- **Graph:** Deciduous
- **Hosting:** GitHub Pages

---

## Development

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

### Project Structure

```
danielle_who/
├── src/
│   ├── core/                     # Business logic & data
│   │   ├── doctor-data.ts        # Doctor profiles
│   │   ├── location-data.ts      # Filming locations
│   │   ├── wiki-data.ts          # Episode data types
│   │   ├── graph-data.ts         # Knowledge graph utilities
│   │   ├── eyespider-data.ts     # Story processing
│   │   └── use-url-state.ts      # URL routing hooks
│   └── shell/components/         # React components
│       ├── App.tsx               # Main app with tab routing
│       ├── Timeline.tsx          # Doctors tab
│       ├── LocationsMap.tsx      # Locations tab
│       ├── EnrichedChronology.tsx # Chronology tab
│       └── KnowledgeGraph.tsx    # Knowledge Graph tab
├── public/data/                  # Static JSON data
├── docs/                         # GitHub Pages build output
│   └── graph/                    # Deciduous viewer
└── .deciduous/                   # Knowledge graph database
```

---

## Citations

- [Tardis Wiki](https://tardis.fandom.com/) — Episode data and synopses
- [Eyespider Complete Adventures](http://eyespider.org.uk/drwho/compleat.html) — Cross-media chronology
- [Doctor Who Locations](https://www.doctorwholocations.net/) — Filming location data
- [Deciduous](https://github.com/notactuallytreyanastasio/deciduous) — Knowledge graph tooling

---

## License

This is a fan project for educational purposes. Doctor Who is a trademark of the BBC. All episode data, character names, and related content are property of their respective owners.
