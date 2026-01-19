#!/usr/bin/env npx ts-node
/**
 * Scraper for the Eyespider Doctor Who Complete Adventures guide
 * from the Internet Archive / Wayback Machine
 */

import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

const ARCHIVE_BASE = 'https://web.archive.org/web/20180306234334'
const EYESPIDER_BASE = 'http://eyespider.org.uk/drwho'

interface DoctorPage {
  doctor: string
  code: string
  url: string
}

const DOCTOR_PAGES: DoctorPage[] = [
  { doctor: 'First Doctor', code: 'wh', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/wh/list.html` },
  { doctor: 'Second Doctor', code: 'pt', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/pt/list.html` },
  { doctor: 'Third Doctor', code: 'jp', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/jp/list.html` },
  { doctor: 'Fourth Doctor', code: 'tb', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/tb/list.html` },
  { doctor: 'Fifth Doctor', code: 'pd', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/pd/list.html` },
  { doctor: 'Sixth Doctor', code: 'cb', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/cb/list.html` },
  { doctor: 'Seventh Doctor', code: 'sm', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/sm/list.html` },
  { doctor: 'Eighth Doctor', code: 'pm', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/pm/list.html` },
  { doctor: 'War Doctor', code: 'jh', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/jh/list.html` },
  { doctor: 'Ninth Doctor', code: 'ce', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/ce/list.html` },
  { doctor: 'Tenth Doctor', code: 'dt', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/dt/list.html` },
  { doctor: 'Eleventh Doctor', code: 'ms', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/ms/list.html` },
  { doctor: 'Twelfth Doctor', code: 'pc', url: `${ARCHIVE_BASE}/${EYESPIDER_BASE}/pc/list.html` },
]

interface ScrapedStory {
  title: string
  format: string
  source?: string  // e.g., "BF CC 8.05", "DWM 231-233", "Virgin MA"
  notes?: string
  isFlashback?: boolean  // References to this Doctor in other stories
}

interface ScrapedDoctor {
  doctor: string
  stories: ScrapedStory[]
  stats: {
    total: number
    byFormat: Record<string, number>
  }
}

async function fetchPage(url: string): Promise<string> {
  console.log(`Fetching: ${url}`)

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  return response.text()
}

async function scrapeMainPage(): Promise<void> {
  const mainUrl = `${ARCHIVE_BASE}/${EYESPIDER_BASE}/compleat.html`

  try {
    const html = await fetchPage(mainUrl)
    const $ = cheerio.load(html)

    console.log('\n=== EYESPIDER COMPLETE ADVENTURES ===\n')

    // Get the main content
    const content = $('body').text()
    console.log('Page title:', $('title').text())

    // Save raw HTML for inspection
    const outputDir = path.join(process.cwd(), 'data', 'scraped')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(path.join(outputDir, 'eyespider-main.html'), html)
    console.log(`\nSaved main page HTML to data/scraped/eyespider-main.html`)

    // Extract links to doctor pages
    const links: string[] = []
    $('a').each((_, el) => {
      const href = $(el).attr('href')
      if (href) links.push(href)
    })

    console.log(`\nFound ${links.length} links on main page`)
    console.log('Sample links:', links.slice(0, 10))

  } catch (error) {
    console.error('Error scraping main page:', error)
  }
}

// Map CSS class to format type
function getFormatFromClass(className: string): string {
  const classMap: Record<string, string> = {
    'tv': 'TV',
    'au': 'Audio',
    'nv': 'Novel',
    'cm': 'Comic',
    'ft': 'Flashback',  // References/flashbacks in other stories
    'od': 'Other',      // Apocryphal/merchandise
    'ss': 'Short Story', // Some pages use this for short stories
  }

  for (const [cls, format] of Object.entries(classMap)) {
    if (className.includes(cls)) {
      return format
    }
  }
  return 'Short Story'  // Default for rows without specific class
}

async function scrapeDoctorPage(doctorPage: DoctorPage): Promise<ScrapedDoctor | null> {
  try {
    const html = await fetchPage(doctorPage.url)
    const $ = cheerio.load(html)

    const stories: ScrapedStory[] = []
    const formatCounts: Record<string, number> = {}

    // Target the main story table - find table containing "Story Title" header
    // Different pages use different classes (ss, au, etc.)
    let storyTable: cheerio.Cheerio<cheerio.Element> | null = null

    $('table').each((_, table) => {
      const $table = $(table)
      const headerText = $table.find('th').first().text().trim()
      if (headerText === 'Story Title') {
        storyTable = $table
        return false // break
      }
    })

    if (!storyTable) {
      console.log('  Warning: Could not find story table')
      return {
        doctor: doctorPage.doctor,
        stories: [],
        stats: { total: 0, byFormat: {} },
      }
    }

    storyTable.find('tr').each((_, el) => {
      const $row = $(el)
      const className = $row.attr('class') || ''

      // Skip header row
      if ($row.find('th').length > 0) return

      const $cells = $row.find('td')
      if ($cells.length === 0) return

      // Check if it's a footnote row (colspan="3" with class "ft")
      const firstCell = $cells.first()
      const colspan = firstCell.attr('colspan')

      if (colspan === '3' || className === 'ft') {
        // This is a flashback/footnote reference
        const text = $row.text().trim()
        if (text.length > 10 && text.length < 1000) {
          stories.push({
            title: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
            format: 'Flashback',
            isFlashback: true,
          })
          formatCounts['Flashback'] = (formatCounts['Flashback'] || 0) + 1
        }
        return
      }

      // Regular story row - extract title, source, notes
      const titleCell = $cells.eq(0)
      const sourceCell = $cells.eq(1)
      const notesCell = $cells.eq(2)

      const title = titleCell.text().trim()
      const source = sourceCell.text().trim()
      const notes = notesCell.text().trim()

      if (!title || title.length < 2) return

      const format = getFormatFromClass(className)

      const story: ScrapedStory = {
        title,
        format,
      }

      if (source) story.source = source
      if (notes && notes.length > 1) story.notes = notes

      stories.push(story)
      formatCounts[format] = (formatCounts[format] || 0) + 1
    })

    // Save raw HTML
    const outputDir = path.join(process.cwd(), 'data', 'scraped')
    fs.writeFileSync(
      path.join(outputDir, `eyespider-${doctorPage.code}.html`),
      html
    )

    return {
      doctor: doctorPage.doctor,
      stories,
      stats: {
        total: stories.length,
        byFormat: formatCounts,
      },
    }
  } catch (error) {
    console.error(`Error scraping ${doctorPage.doctor}:`, error)
    return null
  }
}

async function main(): Promise<void> {
  console.log('Starting Eyespider scraper...\n')

  // First scrape the main page
  await scrapeMainPage()

  // Then scrape ALL doctor pages
  const results: ScrapedDoctor[] = []
  let totalStories = 0

  for (const doctorPage of DOCTOR_PAGES) {
    console.log(`\nScraping ${doctorPage.doctor}...`)
    const result = await scrapeDoctorPage(doctorPage)
    if (result) {
      results.push(result)
      totalStories += result.stats.total
      console.log(`  Found ${result.stats.total} entries`)
      console.log(`  By format:`, result.stats.byFormat)
    }

    // Be nice to the archive - 1.5 second delay
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  // Save results
  const outputPath = path.join(process.cwd(), 'data', 'scraped', 'eyespider-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\n=== SCRAPING COMPLETE ===`)
  console.log(`Total Doctors: ${results.length}`)
  console.log(`Total Stories: ${totalStories}`)
  console.log(`Saved to: ${outputPath}`)

  // Print format breakdown across all Doctors
  const allFormats: Record<string, number> = {}
  for (const doc of results) {
    for (const [format, count] of Object.entries(doc.stats.byFormat)) {
      allFormats[format] = (allFormats[format] || 0) + count
    }
  }
  console.log(`\nFormat breakdown:`, allFormats)
}

main().catch(console.error)
