import { describe, it, expect } from 'vitest'
import type { ChronologyEntry } from './types'
import {
  createEmptyFilter,
  filterEntries,
  computeStats,
  groupByEra,
  getUniqueShows,
  getUniqueFormats,
} from './filters'

const mockEntries: ChronologyEntry[] = [
  {
    id: 0,
    show: 'Doctor Who',
    format: 'BBC TV',
    title: 'Rose',
    isNote: false,
    isDoctorHeader: false,
    doctorInfo: { name: 'Ninth Doctor', actor: 'Christopher Eccleston', number: 'Ninth' },
  },
  {
    id: 1,
    show: 'Doctor Who',
    format: 'Big Finish',
    title: 'Blood of the Daleks',
    isNote: false,
    isDoctorHeader: false,
    doctorInfo: { name: 'Ninth Doctor', actor: 'Christopher Eccleston', number: 'Ninth' },
  },
  {
    id: 2,
    show: 'Torchwood',
    format: 'BBC TV',
    title: 'Everything Changes',
    isNote: false,
    isDoctorHeader: false,
    doctorInfo: null,
  },
  {
    id: 3,
    show: null,
    format: null,
    title: 'T E N T H   D O C T O R',
    isNote: false,
    isDoctorHeader: true,
    doctorInfo: { name: 'Tenth Doctor', actor: 'David Tennant', number: 'Tenth' },
  },
  {
    id: 4,
    show: 'Doctor Who',
    format: 'BBC TV',
    title: 'The Christmas Invasion',
    isNote: false,
    isDoctorHeader: false,
    doctorInfo: { name: 'Tenth Doctor', actor: 'David Tennant', number: 'Tenth' },
  },
]

describe('createEmptyFilter', () => {
  it('creates an empty filter', () => {
    const filter = createEmptyFilter()
    expect(filter.shows.size).toBe(0)
    expect(filter.formats.size).toBe(0)
    expect(filter.doctors.size).toBe(0)
    expect(filter.searchQuery).toBe('')
  })
})

describe('filterEntries', () => {
  it('returns all entries with empty filter', () => {
    const filter = createEmptyFilter()
    const result = filterEntries(mockEntries, filter)
    expect(result.length).toBe(mockEntries.length)
  })

  it('filters by show', () => {
    const filter = {
      ...createEmptyFilter(),
      shows: new Set(['Torchwood'] as const),
    }
    const result = filterEntries(mockEntries, filter)
    // Should include Torchwood entry + doctor header (headers always pass)
    const torchwoodEntries = result.filter((e) => e.show === 'Torchwood')
    expect(torchwoodEntries.length).toBe(1)
  })

  it('filters by search query', () => {
    const filter = {
      ...createEmptyFilter(),
      searchQuery: 'dalek',
    }
    const result = filterEntries(mockEntries, filter)
    const matched = result.filter((e) => !e.isDoctorHeader)
    expect(matched.length).toBe(1)
    expect(matched[0]?.title).toBe('Blood of the Daleks')
  })

  it('filters by format', () => {
    const filter = {
      ...createEmptyFilter(),
      formats: new Set(['Big Finish'] as const),
    }
    const result = filterEntries(mockEntries, filter)
    const bigFinishEntries = result.filter((e) => e.format === 'Big Finish')
    expect(bigFinishEntries.length).toBe(1)
  })
})

describe('computeStats', () => {
  it('computes correct stats', () => {
    const stats = computeStats(mockEntries)

    expect(stats.totalEntries).toBe(4) // Excludes header
    expect(stats.byShow.get('Doctor Who')).toBe(3)
    expect(stats.byShow.get('Torchwood')).toBe(1)
    expect(stats.byFormat.get('BBC TV')).toBe(3)
    expect(stats.byFormat.get('Big Finish')).toBe(1)
  })
})

describe('groupByEra', () => {
  it('groups entries by doctor era', () => {
    const eras = groupByEra(mockEntries)

    // We have entries before a doctor header, then a header, then more entries
    // This depends on the mock data structure
    expect(eras.length).toBeGreaterThanOrEqual(1)
  })
})

describe('getUniqueShows', () => {
  it('returns unique shows', () => {
    const shows = getUniqueShows(mockEntries)
    expect(shows).toContain('Doctor Who')
    expect(shows).toContain('Torchwood')
    expect(shows.length).toBe(2)
  })
})

describe('getUniqueFormats', () => {
  it('returns unique formats', () => {
    const formats = getUniqueFormats(mockEntries)
    expect(formats).toContain('BBC TV')
    expect(formats).toContain('Big Finish')
    expect(formats.length).toBe(2)
  })
})
