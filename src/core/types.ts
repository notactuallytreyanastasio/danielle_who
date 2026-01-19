// Core domain types for Doctor Who universe exploration

export type Show =
  | 'Doctor Who'
  | 'Torchwood'
  | 'Sarah Jane Adv.'
  | 'Class'
  | 'UNIT'

export type Format =
  | 'BBC TV'
  | 'Big Finish'
  | 'BBC Book'
  | 'BBC Audio'
  | 'Comic'
  | 'Webcast'
  | 'BBC Webcast'
  | 'Online Episode'
  | 'BBC DVD'
  | 'Video Game'
  | 'BBC Audio Drama'
  | 'Titan Comics'
  | 'Theatrical Release'
  | 'BBC Interactive Game'
  | 'Game'
  | 'Multi'
  | 'Unknown'

export interface ChronologyEntry {
  readonly id: number
  readonly show: Show | null
  readonly format: Format | null
  readonly title: string
  readonly isNote: boolean
  readonly isDoctorHeader: boolean
  readonly doctorInfo: DoctorInfo | null
}

export interface DoctorInfo {
  readonly name: string
  readonly actor: string
  readonly number: DoctorNumber
}

export type DoctorNumber =
  | 'War'
  | 'Ninth'
  | 'Tenth'
  | 'Eleventh'
  | 'Twelfth'
  | 'Thirteenth'
  | 'Fourteenth'
  | 'Fifteenth'
  | 'Time War'

export interface ChronologyFilter {
  readonly shows: ReadonlySet<Show>
  readonly formats: ReadonlySet<Format>
  readonly doctors: ReadonlySet<DoctorNumber>
  readonly searchQuery: string
}

export interface ChronologyStats {
  readonly totalEntries: number
  readonly byShow: ReadonlyMap<Show, number>
  readonly byFormat: ReadonlyMap<Format, number>
  readonly byDoctor: ReadonlyMap<DoctorNumber, number>
}

// Era groupings for navigation
export interface Era {
  readonly name: string
  readonly doctor: DoctorNumber
  readonly startIndex: number
  readonly endIndex: number
  readonly entries: readonly ChronologyEntry[]
}
