// Pure functions for filtering and analyzing chronology data
import type {
  ChronologyEntry,
  ChronologyFilter,
  ChronologyStats,
  Show,
  Format,
  DoctorNumber,
  Era,
} from './types'

export function createEmptyFilter(): ChronologyFilter {
  return {
    shows: new Set(),
    formats: new Set(),
    doctors: new Set(),
    searchQuery: '',
  }
}

export function filterEntries(
  entries: readonly ChronologyEntry[],
  filter: ChronologyFilter
): ChronologyEntry[] {
  const hasShowFilter = filter.shows.size > 0
  const hasFormatFilter = filter.formats.size > 0
  const hasDoctorFilter = filter.doctors.size > 0
  const hasSearchQuery = filter.searchQuery.trim().length > 0
  const query = filter.searchQuery.trim().toLowerCase()

  return entries.filter((entry) => {
    // Always show doctor headers and notes for context
    if (entry.isDoctorHeader || entry.isNote) return true

    // Show filter - if active, entry must have a matching show
    if (hasShowFilter) {
      if (!entry.show || !filter.shows.has(entry.show)) {
        return false
      }
    }

    // Format filter - if active, entry must have a matching format
    if (hasFormatFilter) {
      if (!entry.format || !filter.formats.has(entry.format)) {
        return false
      }
    }

    // Doctor filter - if active, entry must belong to a matching doctor era
    if (hasDoctorFilter) {
      if (!entry.doctorInfo || !filter.doctors.has(entry.doctorInfo.number)) {
        return false
      }
    }

    // Search query - if active, entry must match query in title, show, or format
    if (hasSearchQuery) {
      const matchesTitle = entry.title.toLowerCase().includes(query)
      const matchesShow = entry.show?.toLowerCase().includes(query) ?? false
      const matchesFormat = entry.format?.toLowerCase().includes(query) ?? false
      if (!matchesTitle && !matchesShow && !matchesFormat) {
        return false
      }
    }

    return true
  })
}

export function computeStats(
  entries: readonly ChronologyEntry[]
): ChronologyStats {
  const byShow = new Map<Show, number>()
  const byFormat = new Map<Format, number>()
  const byDoctor = new Map<DoctorNumber, number>()

  let contentEntries = 0

  for (const entry of entries) {
    if (entry.isDoctorHeader || entry.isNote) continue

    contentEntries++

    if (entry.show) {
      byShow.set(entry.show, (byShow.get(entry.show) ?? 0) + 1)
    }

    if (entry.format) {
      byFormat.set(entry.format, (byFormat.get(entry.format) ?? 0) + 1)
    }

    if (entry.doctorInfo) {
      byDoctor.set(
        entry.doctorInfo.number,
        (byDoctor.get(entry.doctorInfo.number) ?? 0) + 1
      )
    }
  }

  return {
    totalEntries: contentEntries,
    byShow,
    byFormat,
    byDoctor,
  }
}

interface PartialEra {
  name: string
  doctor: DoctorNumber
  startIndex: number
  entries: ChronologyEntry[]
}

export function groupByEra(entries: readonly ChronologyEntry[]): Era[] {
  const eras: Era[] = []
  let currentEra: PartialEra | null = null

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index]
    if (!entry) continue

    if (entry.isDoctorHeader && entry.doctorInfo) {
      // Save previous era
      if (currentEra) {
        eras.push({
          name: currentEra.name,
          doctor: currentEra.doctor,
          startIndex: currentEra.startIndex,
          endIndex: index - 1,
          entries: currentEra.entries,
        })
      }

      // Start new era
      currentEra = {
        name: entry.doctorInfo.name,
        doctor: entry.doctorInfo.number,
        startIndex: index,
        entries: [],
      }
    } else if (currentEra) {
      currentEra.entries.push(entry)
    }
  }

  // Don't forget the last era
  if (currentEra) {
    eras.push({
      name: currentEra.name,
      doctor: currentEra.doctor,
      startIndex: currentEra.startIndex,
      endIndex: entries.length - 1,
      entries: currentEra.entries,
    })
  }

  return eras
}

export function getUniqueShows(
  entries: readonly ChronologyEntry[]
): readonly Show[] {
  const shows = new Set<Show>()
  for (const entry of entries) {
    if (entry.show) shows.add(entry.show)
  }
  return Array.from(shows).sort()
}

export function getUniqueFormats(
  entries: readonly ChronologyEntry[]
): readonly Format[] {
  const formats = new Set<Format>()
  for (const entry of entries) {
    if (entry.format) formats.add(entry.format)
  }
  return Array.from(formats).sort()
}
