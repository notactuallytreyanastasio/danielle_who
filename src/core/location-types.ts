// Types for Doctor Who filming locations

export interface FilmingLocation {
  readonly id: string
  readonly name: string
  readonly area: string
  readonly city: string
  readonly country: string
  readonly coordinates?: {
    readonly lat: number
    readonly lng: number
  }
  readonly episodes: readonly EpisodeAppearance[]
  readonly type: LocationType
  readonly stillExists: boolean
  readonly notes?: string
}

export interface EpisodeAppearance {
  readonly episodeId: string
  readonly episodeTitle: string
  readonly series: string
  readonly doctor: number
  readonly sceneDescription: string
  readonly filmingDates?: readonly string[]
  readonly isStudio: boolean
}

export type LocationType =
  | 'exterior'
  | 'interior'
  | 'street'
  | 'landmark'
  | 'building'
  | 'park'
  | 'studio'
  | 'quarry'
  | 'beach'
  | 'countryside'

export interface EpisodeLocations {
  readonly episodeId: string
  readonly episodeTitle: string
  readonly series: string
  readonly doctor: number
  readonly airDate: string
  readonly locations: readonly LocationUsage[]
  readonly studios: readonly StudioUsage[]
}

export interface LocationUsage {
  readonly locationId: string
  readonly locationName: string
  readonly area: string
  readonly sceneDescription: string
  readonly filmingDates: readonly string[]
  readonly doubledAs?: string
}

export interface StudioUsage {
  readonly studioName: string
  readonly location: string
  readonly dates: readonly string[]
  readonly scenes?: string
}

export type LocationView = 'by-episode' | 'by-location' | 'by-city'
