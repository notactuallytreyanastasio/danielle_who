#!/usr/bin/env python3
"""
Eyespider Doctor Who Complete Adventures Scraper

Scrapes the archived eyespider.org.uk site from the Wayback Machine
to extract comprehensive Doctor Who story data across all media formats.

Source: https://web.archive.org/web/20180306234334/eyespider.org.uk/drwho/compleat.html
"""

import json
import time
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# Configuration
ARCHIVE_BASE = "https://web.archive.org/web/20180306234334"
EYESPIDER_BASE = "http://eyespider.org.uk/drwho"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "scraped"
REQUEST_DELAY = 1.5  # Be nice to archive.org

# Doctor pages with their codes
DOCTOR_PAGES = [
    {"doctor": "First Doctor", "code": "wh", "number": 1},
    {"doctor": "Second Doctor", "code": "pt", "number": 2},
    {"doctor": "Third Doctor", "code": "jp", "number": 3},
    {"doctor": "Fourth Doctor", "code": "tb", "number": 4},
    {"doctor": "Fifth Doctor", "code": "pd", "number": 5},
    {"doctor": "Sixth Doctor", "code": "cb", "number": 6},
    {"doctor": "Seventh Doctor", "code": "sm", "number": 7},
    {"doctor": "Eighth Doctor", "code": "pm", "number": 8},
    {"doctor": "War Doctor", "code": "jh", "number": 0},  # Special case
    {"doctor": "Ninth Doctor", "code": "ce", "number": 9},
    {"doctor": "Tenth Doctor", "code": "dt", "number": 10},
    {"doctor": "Eleventh Doctor", "code": "ms", "number": 11},
    {"doctor": "Twelfth Doctor", "code": "pc", "number": 12},
]

# CSS class to format mapping
FORMAT_MAP = {
    "tv": "TV",
    "au": "Audio",
    "nv": "Novel",
    "cm": "Comic",
    "ft": "Flashback",
    "od": "Other",
    "ss": "Short Story",
}


@dataclass
class Story:
    """Represents a single Doctor Who story/adventure."""
    title: str
    format: str
    source: Optional[str] = None
    notes: Optional[str] = None
    is_flashback: bool = False


@dataclass
class DoctorData:
    """All adventure data for a single Doctor incarnation."""
    doctor: str
    doctor_number: int
    code: str
    stories: list[Story]
    stats: dict

    def to_dict(self) -> dict:
        return {
            "doctor": self.doctor,
            "doctorNumber": self.doctor_number,
            "code": self.code,
            "stories": [asdict(s) for s in self.stories],
            "stats": self.stats,
        }


class EyespiderScraper:
    """Scraper for the Eyespider Complete Adventures guide."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })

    def fetch_page(self, url: str) -> str:
        """Fetch a page with error handling and rate limiting."""
        print(f"  Fetching: {url}")
        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        return response.text

    def get_format_from_class(self, class_names: str) -> str:
        """Determine story format from CSS class names."""
        if not class_names:
            return "Short Story"

        for css_class, format_name in FORMAT_MAP.items():
            if css_class in class_names:
                return format_name

        return "Short Story"

    def clean_text(self, text: str) -> str:
        """Clean up extracted text."""
        if not text:
            return ""
        # Replace multiple whitespace with single space
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def parse_stories_from_html(self, html: str) -> list[Story]:
        """Parse stories using regex to handle malformed HTML."""
        stories = []

        # Pattern to match story rows - match until next <tr or end of table
        # HTML often has missing </tr> tags
        row_pattern = re.compile(
            r'<tr\s+class="([^"]+)"[^>]*>(.*?)(?=<tr\s|</table)',
            re.DOTALL | re.IGNORECASE
        )

        for match in row_pattern.finditer(html):
            row_class = match.group(1)
            row_content = match.group(2)

            # Skip flashback/footnote rows
            if 'ft' in row_class:
                continue

            # Skip header rows
            if '<th' in row_content:
                continue

            # Extract cells - HTML doesn't have closing </td> tags
            # Match <td> followed by content until next < that starts a tag
            cell_pattern = re.compile(r'<td[^>]*>([^<]+)', re.IGNORECASE)
            cells = cell_pattern.findall(row_content)

            if not cells:
                continue

            # Clean cell content
            def clean_cell(text: str) -> str:
                return re.sub(r'\s+', ' ', text).strip()

            # Check if first cell has colspan="2" (TV episodes)
            has_colspan2 = 'colspan="2"' in row_content[:200]

            if has_colspan2 and len(cells) >= 1:
                title = clean_cell(cells[0])
                source = None
                notes = clean_cell(cells[1]) if len(cells) > 1 else None
            elif len(cells) >= 2:
                title = clean_cell(cells[0])
                source = clean_cell(cells[1]) if cells[1] else None
                notes = clean_cell(cells[2]) if len(cells) > 2 else None
            else:
                continue

            # Skip empty or invalid titles
            if not title or len(title) < 2 or len(title) > 150:
                continue

            # Skip noise (including Wayback Machine toolbar elements)
            if any(re.search(p, title, re.IGNORECASE) for p in [
                r'^Return to', r'^THE COMPLETE', r'site index',
                r'^Adventures of', r'^Story Title$', r'^Location$',
                r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$',
                r'^\d{4}$',  # Years like 2017, 2018
                r'^Notes$', r'^\d{1,2}$',  # Single/double digit numbers
            ]):
                continue

            format_type = self.get_format_from_class(row_class)

            stories.append(Story(
                title=title,
                format=format_type,
                source=source if source else None,
                notes=notes if notes and len(notes) > 1 else None,
            ))

        # Also find rows without class (default short stories)
        # These are harder - look for simple <tr><td>Title</td><td>Source</td>... pattern
        simple_row = re.compile(
            r'<tr>\s*<td[^>]*>([^<]{3,100})</td>\s*<td[^>]*>([^<]{2,100})</td>',
            re.IGNORECASE
        )

        for match in simple_row.finditer(html):
            title = match.group(1).strip()
            source = match.group(2).strip()

            # Skip if already found or invalid
            if not title or len(title) < 3 or len(title) > 150:
                continue

            if any(re.search(p, title, re.IGNORECASE) for p in [
                r'^Return to', r'^THE COMPLETE', r'site index',
                r'^Adventures of', r'^Story Title$', r'^Feb$', r'^\d{4}$'
            ]):
                continue

            # Check if this title already exists
            if any(s.title == title for s in stories):
                continue

            stories.append(Story(
                title=title,
                format="Short Story",
                source=source if source else None,
            ))

        return stories

    def scrape_doctor_page(self, doctor_info: dict) -> Optional[DoctorData]:
        """Scrape all stories for a single Doctor."""
        url = f"{ARCHIVE_BASE}/{EYESPIDER_BASE}/{doctor_info['code']}/list.html"

        try:
            html = self.fetch_page(url)

            # Save raw HTML for debugging
            html_path = OUTPUT_DIR / f"eyespider-{doctor_info['code']}.html"
            html_path.write_text(html, encoding='utf-8')

            # Parse stories using regex (more reliable for this HTML)
            stories = self.parse_stories_from_html(html)

            # Count formats
            format_counts: dict[str, int] = {}
            for story in stories:
                format_counts[story.format] = format_counts.get(story.format, 0) + 1

            return DoctorData(
                doctor=doctor_info['doctor'],
                doctor_number=doctor_info['number'],
                code=doctor_info['code'],
                stories=stories,
                stats={
                    "total": len(stories),
                    "byFormat": format_counts,
                }
            )

        except Exception as e:
            print(f"    Error scraping {doctor_info['doctor']}: {e}")
            import traceback
            traceback.print_exc()
            return None

    def scrape_main_page(self) -> dict:
        """Scrape the main index page for metadata."""
        url = f"{ARCHIVE_BASE}/{EYESPIDER_BASE}/compleat.html"

        try:
            html = self.fetch_page(url)
            soup = BeautifulSoup(html, 'html.parser')

            # Save raw HTML
            html_path = OUTPUT_DIR / "eyespider-main.html"
            html_path.write_text(html, encoding='utf-8')

            title = soup.find('title')
            return {
                "title": title.get_text() if title else "Unknown",
                "url": url,
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            }
        except Exception as e:
            print(f"Error scraping main page: {e}")
            return {"error": str(e)}

    def run(self) -> dict:
        """Run the full scraping process."""
        print("=" * 60)
        print("EYESPIDER DOCTOR WHO COMPLETE ADVENTURES SCRAPER")
        print("=" * 60)
        print()

        # Ensure output directory exists
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        # Scrape main page
        print("Scraping main index page...")
        metadata = self.scrape_main_page()
        print(f"  Title: {metadata.get('title', 'Unknown')}")
        print()

        # Scrape each Doctor
        all_doctors: list[DoctorData] = []
        total_stories = 0
        all_formats: dict[str, int] = {}

        for doctor_info in DOCTOR_PAGES:
            print(f"Scraping {doctor_info['doctor']}...")

            doctor_data = self.scrape_doctor_page(doctor_info)

            if doctor_data:
                all_doctors.append(doctor_data)
                total_stories += doctor_data.stats['total']

                # Aggregate format counts
                for fmt, count in doctor_data.stats['byFormat'].items():
                    all_formats[fmt] = all_formats.get(fmt, 0) + count

                print(f"    Found {doctor_data.stats['total']} entries")
                print(f"    By format: {doctor_data.stats['byFormat']}")

            # Rate limiting
            time.sleep(REQUEST_DELAY)

        # Sort by doctor number (War Doctor = 0 goes between 8 and 9)
        all_doctors.sort(key=lambda d: (d.doctor_number if d.doctor_number != 0 else 8.5))

        # Build final result
        result = {
            "metadata": metadata,
            "summary": {
                "totalDoctors": len(all_doctors),
                "totalStories": total_stories,
                "byFormat": all_formats,
            },
            "doctors": [d.to_dict() for d in all_doctors],
        }

        # Save results
        json_path = OUTPUT_DIR / "eyespider-python.json"
        json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')

        # Also save a simplified version matching the TypeScript output format
        simple_result = [d.to_dict() for d in all_doctors]
        simple_path = OUTPUT_DIR / "eyespider-data-python.json"
        simple_path.write_text(json.dumps(simple_result, indent=2, ensure_ascii=False), encoding='utf-8')

        print()
        print("=" * 60)
        print("SCRAPING COMPLETE")
        print("=" * 60)
        print(f"Total Doctors: {len(all_doctors)}")
        print(f"Total Stories: {total_stories}")
        print(f"Format breakdown: {all_formats}")
        print()
        print(f"Full results saved to: {json_path}")
        print(f"Simple results saved to: {simple_path}")
        print(f"HTML files saved to: {OUTPUT_DIR}/eyespider-*.html")

        return result


def main():
    """Main entry point."""
    scraper = EyespiderScraper()
    scraper.run()


if __name__ == "__main__":
    main()
