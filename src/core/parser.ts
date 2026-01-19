// Pure functions for parsing chronology data
import type {
  ChronologyEntry,
  Show,
  Format,
  DoctorInfo,
  DoctorNumber,
} from './types'

const SHOWS: readonly Show[] = [
  'Doctor Who',
  'Torchwood',
  'Sarah Jane Adv.',
  'Class',
  'UNIT',
]

const FORMATS: readonly Format[] = [
  'BBC TV',
  'Big Finish',
  'BBC Book',
  'BBC Audio',
  'Comic',
  'Webcast',
  'BBC Webcast',
  'Online Episode',
  'BBC DVD',
  'Video Game',
  'BBC Audio Drama',
  'Titan Comics',
  'Theatrical Release',
  'BBC Interactive Game',
  'Game',
  'Multi',
]

interface DoctorPattern {
  readonly pattern: RegExp
  readonly number: DoctorNumber
  readonly actor: string
}

const DOCTOR_PATTERNS: readonly DoctorPattern[] = [
  { pattern: /T\s*H\s*E\s+T\s*I\s*M\s*E\s+W\s*A\s*R/i, number: 'Time War', actor: 'Various' },
  { pattern: /W\s*A\s*R\s+D\s*O\s*C\s*T\s*O\s*R/i, number: 'War', actor: 'John Hurt' },
  { pattern: /N\s*I\s*N\s*T\s*H\s+D\s*O\s*C\s*T\s*O\s*R/i, number: 'Ninth', actor: 'Christopher Eccleston' },
  { pattern: /T\s*E\s*N\s*T\s*H\s+D\s*O\s*C\s*T\s*O\s*R/i, number: 'Tenth', actor: 'David Tennant' },
  { pattern: /ELEVENTH\s*DOCTOR/i, number: 'Eleventh', actor: 'Matt Smith' },
  { pattern: /TWEL[FV]TH\s*DOCTOR/i, number: 'Twelfth', actor: 'Peter Capaldi' },
  { pattern: /THIRTEENTH\s*DOCTOR/i, number: 'Thirteenth', actor: 'Jodie Whittaker' },
  { pattern: /FOURTEENTH\s*DOCTOR/i, number: 'Fourteenth', actor: 'David Tennant' },
  { pattern: /FIFTEENTH\s*DOCTOR/i, number: 'Fifteenth', actor: 'Ncuti Gatwa' },
]

export function parseShow(value: string): Show | null {
  const trimmed = value.trim()
  if (trimmed === '') return null

  const found = SHOWS.find(
    (show) => show.toLowerCase() === trimmed.toLowerCase()
  )
  return found ?? null
}

export function parseFormat(value: string): Format | null {
  const trimmed = value.trim()
  if (trimmed === '') return null

  const found = FORMATS.find(
    (format) => format.toLowerCase() === trimmed.toLowerCase()
  )
  return found ?? ('Unknown' as Format)
}

export function parseDoctorHeader(line: string): DoctorInfo | null {
  for (const { pattern, number, actor } of DOCTOR_PATTERNS) {
    if (pattern.test(line)) {
      return {
        name: `${number} Doctor`,
        actor,
        number,
      }
    }
  }
  return null
}

export function isNoteOrHeader(title: string): boolean {
  const trimmed = title.trim().toUpperCase()
  return (
    trimmed.startsWith('NOTE:') ||
    trimmed.startsWith('TO FOLLOW') ||
    trimmed.includes('D O C T O R') ||
    trimmed.includes('T I M E  W A R') ||
    trimmed.startsWith('AT THIS POINT')
  )
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

export function parseChronologyCSV(csvContent: string): ChronologyEntry[] {
  const lines = csvContent.split('\n')
  const entries: ChronologyEntry[] = []
  let currentShow: Show | null = null
  let currentDoctor: DoctorInfo | null = null
  let id = 0

  for (const line of lines) {
    if (line.trim() === '') continue

    const [showCol, formatCol, titleCol] = parseCSVLine(line)

    // Check if this is a doctor header line
    const doctorInfo = parseDoctorHeader(line)
    if (doctorInfo) {
      currentDoctor = doctorInfo
      entries.push({
        id: id++,
        show: null,
        format: null,
        title: line.replace(/,/g, ' ').trim(),
        isNote: false,
        isDoctorHeader: true,
        doctorInfo,
      })
      continue
    }

    // Skip header row
    if (showCol === 'SHOW' && formatCol === 'FORMAT') continue

    // Update current show if specified
    const parsedShow = parseShow(showCol ?? '')
    if (parsedShow) {
      currentShow = parsedShow
    }

    const format = parseFormat(formatCol ?? '')
    const title = titleCol?.trim() ?? ''

    // Skip empty titles
    if (!title) continue

    const isNote = isNoteOrHeader(title)

    entries.push({
      id: id++,
      show: currentShow,
      format: isNote ? null : format,
      title,
      isNote,
      isDoctorHeader: false,
      doctorInfo: currentDoctor,
    })
  }

  return entries
}
