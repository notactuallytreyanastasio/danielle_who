// Types for the interactive Doctor Who timeline

export interface Doctor {
  readonly number: number
  readonly name: string
  readonly actor: string
  readonly years: string
  readonly color: string
  readonly accentColor: string
  readonly companions: readonly Companion[]
  readonly enemies: readonly Enemy[]
  readonly keyStories: readonly Story[]
  readonly facts: readonly string[]
  readonly regenerationCause?: string
  readonly catchphrase?: string
  readonly personality: string
}

export interface Companion {
  readonly name: string
  readonly actor: string
  readonly years?: string
  readonly description: string
  readonly firstAppearance: string
}

export interface Enemy {
  readonly name: string
  readonly description: string
  readonly firstAppearance?: string
  readonly notableEpisodes: readonly string[]
}

export interface Story {
  readonly title: string
  readonly year: number
  readonly type: 'serial' | 'episode' | 'special' | 'movie'
  readonly significance: string
  readonly isLandmark?: boolean
}

export interface TimelineNode {
  readonly id: string
  readonly type: 'doctor' | 'companion' | 'enemy' | 'story' | 'event'
  readonly title: string
  readonly subtitle?: string
  readonly year?: number
  readonly description: string
  readonly expanded: boolean
}

export type TimelineView = 'overview' | 'doctor' | 'companions' | 'enemies'
