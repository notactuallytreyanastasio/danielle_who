import { describe, it, expect } from 'vitest'
import {
  parseShow,
  parseFormat,
  parseCSVLine,
  parseDoctorHeader,
  isNoteOrHeader,
  parseChronologyCSV,
} from './parser'

describe('parseShow', () => {
  it('parses valid show names', () => {
    expect(parseShow('Doctor Who')).toBe('Doctor Who')
    expect(parseShow('Torchwood')).toBe('Torchwood')
    expect(parseShow('Sarah Jane Adv.')).toBe('Sarah Jane Adv.')
    expect(parseShow('Class')).toBe('Class')
    expect(parseShow('UNIT')).toBe('UNIT')
  })

  it('handles case insensitivity', () => {
    expect(parseShow('doctor who')).toBe('Doctor Who')
    expect(parseShow('TORCHWOOD')).toBe('Torchwood')
  })

  it('returns null for empty strings', () => {
    expect(parseShow('')).toBeNull()
    expect(parseShow('   ')).toBeNull()
  })

  it('returns null for unknown shows', () => {
    expect(parseShow('Unknown Show')).toBeNull()
  })
})

describe('parseFormat', () => {
  it('parses valid format names', () => {
    expect(parseFormat('BBC TV')).toBe('BBC TV')
    expect(parseFormat('Big Finish')).toBe('Big Finish')
    expect(parseFormat('BBC Book')).toBe('BBC Book')
  })

  it('returns Unknown for unrecognized formats', () => {
    expect(parseFormat('Random Format')).toBe('Unknown')
  })

  it('returns null for empty strings', () => {
    expect(parseFormat('')).toBeNull()
  })
})

describe('parseCSVLine', () => {
  it('parses simple CSV lines', () => {
    expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('handles quoted fields with commas', () => {
    expect(parseCSVLine('a,"b,c",d')).toEqual(['a', 'b,c', 'd'])
  })

  it('handles escaped quotes', () => {
    expect(parseCSVLine('a,"b""c",d')).toEqual(['a', 'b"c', 'd'])
  })

  it('handles empty fields', () => {
    expect(parseCSVLine('a,,c')).toEqual(['a', '', 'c'])
  })
})

describe('parseDoctorHeader', () => {
  it('detects Ninth Doctor header', () => {
    const result = parseDoctorHeader(
      'N I N T H   D O C T O R  (Christopher Eccleston)'
    )
    expect(result).not.toBeNull()
    expect(result?.number).toBe('Ninth')
    expect(result?.actor).toBe('Christopher Eccleston')
  })

  it('detects Tenth Doctor header', () => {
    const result = parseDoctorHeader(
      'T E N T H   D O C T O R   ( D A V I D   T E N N A N T )'
    )
    expect(result).not.toBeNull()
    expect(result?.number).toBe('Tenth')
  })

  it('detects Time War header', () => {
    const result = parseDoctorHeader('T H E   T I M E   W A R')
    expect(result).not.toBeNull()
    expect(result?.number).toBe('Time War')
  })

  it('returns null for non-header lines', () => {
    expect(parseDoctorHeader('Rose')).toBeNull()
    expect(parseDoctorHeader('The Empty Child')).toBeNull()
  })
})

describe('isNoteOrHeader', () => {
  it('detects NOTE: prefix', () => {
    expect(isNoteOrHeader('NOTE: This timeline is rough')).toBe(true)
  })

  it('detects "To follow the timeline" instructions', () => {
    expect(isNoteOrHeader('To follow the timeline pause at 15:50')).toBe(true)
  })

  it('detects Doctor headers', () => {
    expect(isNoteOrHeader('N I N T H   D O C T O R')).toBe(true)
  })

  it('returns false for regular titles', () => {
    expect(isNoteOrHeader('Rose')).toBe(false)
    expect(isNoteOrHeader('The Empty Child')).toBe(false)
  })
})

describe('parseChronologyCSV', () => {
  it('parses a simple CSV', () => {
    const csv = `SHOW,FORMAT,TITLE
Doctor Who,BBC TV,Rose
,BBC Book,The Beast of Babylon`

    const entries = parseChronologyCSV(csv)

    expect(entries.length).toBe(2)
    expect(entries[0]?.show).toBe('Doctor Who')
    expect(entries[0]?.format).toBe('BBC TV')
    expect(entries[0]?.title).toBe('Rose')

    // Show should carry forward
    expect(entries[1]?.show).toBe('Doctor Who')
    expect(entries[1]?.format).toBe('BBC Book')
  })

  it('handles doctor headers', () => {
    const csv = `SHOW,FORMAT,TITLE
N I N T H   D O C T O R  (Christopher Eccleston),,
Doctor Who,BBC TV,Rose`

    const entries = parseChronologyCSV(csv)

    expect(entries[0]?.isDoctorHeader).toBe(true)
    expect(entries[0]?.doctorInfo?.number).toBe('Ninth')
    expect(entries[1]?.doctorInfo?.number).toBe('Ninth')
  })
})
