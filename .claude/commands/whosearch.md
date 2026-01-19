---
description: Query Doctor Who data - episodes, stories, companions, enemies, and the knowledge graph
allowed-tools: Bash, Read, Grep
argument-hint: <query> (e.g., "Daleks episodes", "Fourth Doctor companions", "stories with Sarah Jane")
---

# Doctor Who Data Query

**Search the comprehensive Doctor Who knowledge base.**

This skill queries multiple data sources:
- **Tardis Wiki data**: 384 TV episodes with metadata (companions, enemies, writers, locations)
- **Eyespider chronology**: 1,710 stories across all media in Doctor order
- **Knowledge graph**: 2,731 nodes with 7,728 connections
- **CSV chronology**: Timeline data for all media

## Query Types

Based on `$ARGUMENTS`, determine the query type and run the appropriate search:

### 1. Episode/Story Search
```bash
# Search TV episodes by title
cat data/tardis-wiki/tardis-wiki-tv-episodes.json | jq '.[] | select(.title | test("SEARCHTERM"; "i"))'

# Search Eyespider stories by title
cat data/scraped/eyespider-python.json | jq '.doctors[].stories[] | select(.title | test("SEARCHTERM"; "i"))'
```

### 2. Doctor-specific Queries
```bash
# Find all episodes featuring a specific Doctor
cat data/tardis-wiki/tardis-wiki-tv-episodes.json | jq '[.[] | select(.doctor | test("First|Second|Third|etc"; "i"))]'

# Count stories per Doctor from Eyespider
cat data/scraped/eyespider-python.json | jq '.doctors[] | {doctor, total: (.stories | length)}'
```

### 3. Companion Queries
```bash
# Find episodes with a companion
cat data/tardis-wiki/tardis-wiki-tv-episodes.json | jq '[.[] | select(.companions | contains(["COMPANION_NAME"]))]'

# Get companion list
cat data/tardis-wiki/tardis-wiki-companions.json | jq '.[] | select(.name | test("SEARCHTERM"; "i"))'
```

### 4. Enemy Queries
```bash
# Find episodes featuring an enemy
cat data/tardis-wiki/tardis-wiki-tv-episodes.json | jq '[.[] | select(.enemies | map(test("ENEMY"; "i")) | any)]'

# Get enemy details
cat data/tardis-wiki/tardis-wiki-enemies.json | jq '.[] | select(.name | test("SEARCHTERM"; "i"))'
```

### 5. Writer/Director Queries
```bash
# Find episodes by a writer
cat data/tardis-wiki/tardis-wiki-tv-episodes.json | jq '[.[] | select(.writer | test("SEARCHTERM"; "i"))] | .[] | {title, writer, director}'
```

### 6. Location Queries
```bash
# Find episodes set in a location
cat data/tardis-wiki/tardis-wiki-tv-episodes.json | jq '[.[] | select(.setting_location | test("SEARCHTERM"; "i"))] | .[] | {title, setting_location}'
```

### 7. Knowledge Graph Queries
```bash
# Search nodes by title
deciduous nodes | grep -i "SEARCHTERM"

# Find connections to a node
deciduous edges | grep "NODE_ID"

# Get nodes by type
deciduous nodes | grep -E "observation|goal|decision|action"
```

### 8. Format-specific Queries
```bash
# TV only from Eyespider
cat data/scraped/eyespider-python.json | jq '.doctors[].stories[] | select(.format == "TV")'

# Big Finish audios
cat data/scraped/eyespider-python.json | jq '.doctors[].stories[] | select(.format == "Audio")'
```

### 9. Missing Episodes
```bash
# Find missing/incomplete episodes
cat data/tardis-wiki/tardis-wiki-tv-episodes.json | jq '[.[] | select(.missing_status != "complete")] | .[] | {title, missing_status}'
```

### 10. Era Queries
```bash
# Classic Who (Doctors 1-7)
cat data/scraped/eyespider-python.json | jq '.doctors[0:7] | .[].stories | length'

# New Who (Doctors 9+)
cat data/tardis-wiki/tardis-wiki-tv-episodes.json | jq '[.[] | select(.series != null)]'
```

## Response Format

After running the query, present results in a readable format:
1. **Summary**: "Found X results for 'query'"
2. **Results**: List titles with key metadata
3. **Graph connections**: If relevant, show connected nodes from the knowledge graph

## Example Queries

- `whosearch Daleks` - All Dalek episodes/stories
- `whosearch Sarah Jane companion` - Sarah Jane's episodes
- `whosearch Fourth Doctor` - All Fourth Doctor content
- `whosearch Terry Nation writer` - Episodes by Terry Nation
- `whosearch Gallifrey location` - Episodes set on Gallifrey
- `whosearch missing episodes` - List missing classic episodes

**Run query for: $ARGUMENTS**
