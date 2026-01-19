/**
 * Processed data from Eyespider's Complete Adventures guide
 * Source: https://web.archive.org/web/20180306234334/eyespider.org.uk/drwho/compleat.html
 */

export type StoryFormat = 'TV' | 'Audio' | 'Novel' | 'Comic' | 'Short Story' | 'Other'

export interface EyespiderStory {
  title: string
  format: StoryFormat
  source?: string  // e.g., "BF CC 8.05", "DWM 231-233", "Virgin MA"
  notes?: string
}

export interface DoctorAdventures {
  doctor: string
  doctorNumber: number
  stories: EyespiderStory[]
  stats: {
    total: number
    byFormat: Record<StoryFormat, number>
  }
}

// Raw scraped data - will be populated from JSON
interface RawScrapedStory {
  title: string
  format: string
  source?: string
  notes?: string
  isFlashback?: boolean
}

interface RawScrapedDoctor {
  doctor: string
  stories: RawScrapedStory[]
  stats: {
    total: number
    byFormat: Record<string, number>
  }
}

// Filter patterns for noise
const NOISE_PATTERNS = [
  /^Return to/i,
  /^THE COMPLETE ADVENTURES/i,
  /site index/i,
  /^Adventures of the/i,
  /^Story Title$/i,
]

function isNoise(title: string): boolean {
  return NOISE_PATTERNS.some(pattern => pattern.test(title))
}

function cleanTitle(title: string): string {
  return title.replace(/\n/g, ' ').trim()
}

function getDoctorNumber(doctorName: string): number {
  const numberMap: Record<string, number> = {
    'First Doctor': 1,
    'Second Doctor': 2,
    'Third Doctor': 3,
    'Fourth Doctor': 4,
    'Fifth Doctor': 5,
    'Sixth Doctor': 6,
    'Seventh Doctor': 7,
    'Eighth Doctor': 8,
    'War Doctor': 9,  // Using 9 for sorting purposes
    'Ninth Doctor': 10,
    'Tenth Doctor': 11,
    'Eleventh Doctor': 12,
    'Twelfth Doctor': 13,
  }
  return numberMap[doctorName] ?? 0
}

function normalizeFormat(format: string): StoryFormat {
  const formatMap: Record<string, StoryFormat> = {
    'TV': 'TV',
    'Audio': 'Audio',
    'Novel': 'Novel',
    'Comic': 'Comic',
    'Short Story': 'Short Story',
    'Other': 'Other',
    'Flashback': 'Other',  // Group flashbacks with Other
  }
  return formatMap[format] ?? 'Other'
}

export function processRawData(rawData: RawScrapedDoctor[]): DoctorAdventures[] {
  return rawData.map(doc => {
    const cleanedStories: EyespiderStory[] = doc.stories
      .filter(story => !story.isFlashback)  // Skip flashbacks for main list
      .filter(story => !isNoise(story.title))
      .map(story => ({
        title: cleanTitle(story.title),
        format: normalizeFormat(story.format),
        source: story.source,
        notes: story.notes ? cleanTitle(story.notes) : undefined,
      }))

    // Compute clean stats
    const byFormat: Record<StoryFormat, number> = {
      'TV': 0,
      'Audio': 0,
      'Novel': 0,
      'Comic': 0,
      'Short Story': 0,
      'Other': 0,
    }

    for (const story of cleanedStories) {
      byFormat[story.format]++
    }

    return {
      doctor: doc.doctor,
      doctorNumber: getDoctorNumber(doc.doctor),
      stories: cleanedStories,
      stats: {
        total: cleanedStories.length,
        byFormat,
      },
    }
  }).sort((a, b) => a.doctorNumber - b.doctorNumber)
}

// Get summary stats across all Doctors
export function getOverallStats(data: DoctorAdventures[]): {
  totalStories: number
  byFormat: Record<StoryFormat, number>
  byDoctor: { doctor: string; count: number }[]
} {
  const byFormat: Record<StoryFormat, number> = {
    'TV': 0,
    'Audio': 0,
    'Novel': 0,
    'Comic': 0,
    'Short Story': 0,
    'Other': 0,
  }

  const byDoctor: { doctor: string; count: number }[] = []
  let totalStories = 0

  for (const doc of data) {
    totalStories += doc.stats.total
    byDoctor.push({ doctor: doc.doctor, count: doc.stats.total })

    for (const [format, count] of Object.entries(doc.stats.byFormat)) {
      byFormat[format as StoryFormat] += count
    }
  }

  return { totalStories, byFormat, byDoctor }
}

// Get stories for a specific Doctor by format
export function getStoriesByFormat(
  data: DoctorAdventures[],
  doctorNumber: number,
  format: StoryFormat
): EyespiderStory[] {
  const doctorData = data.find(d => d.doctorNumber === doctorNumber)
  if (!doctorData) return []
  return doctorData.stories.filter(s => s.format === format)
}

// Get all TV stories for a Doctor
export function getTVStories(data: DoctorAdventures[], doctorNumber: number): EyespiderStory[] {
  return getStoriesByFormat(data, doctorNumber, 'TV')
}

// Get notable stories (those with notes/annotations)
export function getNotableStories(data: DoctorAdventures[], doctorNumber: number): EyespiderStory[] {
  const doctorData = data.find(d => d.doctorNumber === doctorNumber)
  if (!doctorData) return []
  return doctorData.stories.filter(s => s.notes)
}

// Export format colors for UI
export const FORMAT_COLORS: Record<StoryFormat, string> = {
  'TV': '#4a90d9',      // TARDIS blue
  'Audio': '#9b59b6',   // Purple
  'Novel': '#27ae60',   // Green
  'Comic': '#e74c3c',   // Red
  'Short Story': '#f39c12', // Orange
  'Other': '#95a5a6',   // Gray
}
