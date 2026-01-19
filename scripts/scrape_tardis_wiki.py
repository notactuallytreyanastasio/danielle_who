#!/usr/bin/env python3
"""
Tardis Wiki Comprehensive Scraper

Scrapes the Tardis Wiki (tardis.fandom.com) to extract comprehensive
Doctor Who data including TV episodes, Doctors, companions, and enemies.

This creates the ultimate Doctor Who museum database.
"""

import json
import time
import re
import hashlib
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, quote

import requests
from bs4 import BeautifulSoup, Tag

# Configuration
BASE_URL = "https://tardis.fandom.com"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "tardis-wiki"
CACHE_DIR = OUTPUT_DIR / "cache"
REQUEST_DELAY = 1.0  # Be respectful to the wiki

# User agent to identify ourselves
USER_AGENT = (
    "DanielleWhoMuseum/1.0 (Doctor Who fan project; "
    "https://github.com/example/danielle-who) Python/3.11"
)


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class TVEpisode:
    """A Doctor Who TV episode/story."""
    title: str
    story_number: Optional[str] = None
    season: Optional[str] = None
    series: Optional[str] = None
    episode_count: Optional[int] = None
    air_date_start: Optional[str] = None
    air_date_end: Optional[str] = None
    doctor: Optional[str] = None
    companions: list[str] = field(default_factory=list)
    enemies: list[str] = field(default_factory=list)
    writer: Optional[str] = None
    director: Optional[str] = None
    producer: Optional[str] = None
    script_editor: Optional[str] = None
    composer: Optional[str] = None
    production_code: Optional[str] = None
    setting_location: Optional[str] = None
    setting_time: Optional[str] = None
    synopsis: Optional[str] = None
    wiki_url: Optional[str] = None
    missing_status: Optional[str] = None  # "complete", "partial", "missing"


@dataclass
class Doctor:
    """A Doctor incarnation."""
    name: str
    number: Optional[int] = None
    actor: Optional[str] = None
    other_actors: list[str] = field(default_factory=list)
    first_appearance: Optional[str] = None
    last_appearance: Optional[str] = None
    first_episode: Optional[str] = None
    last_episode: Optional[str] = None
    seasons: list[str] = field(default_factory=list)
    companions: list[str] = field(default_factory=list)
    era_start: Optional[str] = None
    era_end: Optional[str] = None
    key_enemies: list[str] = field(default_factory=list)
    regeneration_story: Optional[str] = None
    wiki_url: Optional[str] = None
    bio_summary: Optional[str] = None


@dataclass
class Companion:
    """A Doctor Who companion."""
    name: str
    full_name: Optional[str] = None
    actor: Optional[str] = None
    species: Optional[str] = None
    doctors_traveled_with: list[str] = field(default_factory=list)
    first_appearance: Optional[str] = None
    last_appearance: Optional[str] = None
    first_episode: Optional[str] = None
    last_episode: Optional[str] = None
    status: Optional[str] = None  # How they left
    home: Optional[str] = None
    occupation: Optional[str] = None
    wiki_url: Optional[str] = None
    bio_summary: Optional[str] = None


@dataclass
class Enemy:
    """A Doctor Who enemy or species."""
    name: str
    species_type: Optional[str] = None  # Individual, Species, Organization
    aliases: list[str] = field(default_factory=list)
    origin: Optional[str] = None
    first_appearance: Optional[str] = None
    first_episode: Optional[str] = None
    notable_individuals: list[str] = field(default_factory=list)
    affiliated_with: list[str] = field(default_factory=list)
    key_stories: list[str] = field(default_factory=list)
    wiki_url: Optional[str] = None
    description: Optional[str] = None


# =============================================================================
# Scraper Class
# =============================================================================

class TardisWikiScraper:
    """Comprehensive scraper for Tardis Wiki."""

    def __init__(self, use_cache: bool = True):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })
        self.use_cache = use_cache
        self.request_count = 0

        # Ensure directories exist
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        if use_cache:
            CACHE_DIR.mkdir(parents=True, exist_ok=True)

    def _get_cache_path(self, url: str) -> Path:
        """Get cache file path for a URL."""
        url_hash = hashlib.md5(url.encode()).hexdigest()
        return CACHE_DIR / f"{url_hash}.html"

    def fetch_page(self, url: str) -> str:
        """Fetch a page with caching and rate limiting."""
        # Check cache first
        if self.use_cache:
            cache_path = self._get_cache_path(url)
            if cache_path.exists():
                return cache_path.read_text(encoding='utf-8')

        # Rate limiting
        if self.request_count > 0:
            time.sleep(REQUEST_DELAY)

        print(f"  Fetching: {url}")
        self.request_count += 1

        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        html = response.text

        # Cache the response
        if self.use_cache:
            cache_path = self._get_cache_path(url)
            cache_path.write_text(html, encoding='utf-8')

        return html

    def parse_soup(self, html: str) -> BeautifulSoup:
        """Parse HTML into BeautifulSoup."""
        return BeautifulSoup(html, 'html.parser')

    def clean_text(self, text: str) -> str:
        """Clean up extracted text."""
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\[.*?\]', '', text)  # Remove [edit] links etc
        return text.strip()

    def get_infobox_value(self, soup: BeautifulSoup, label: str) -> Optional[str]:
        """Extract a value from the page's infobox."""
        # Fandom wikis use data-source attribute
        infobox = soup.find('aside', class_='portable-infobox')
        if not infobox:
            return None

        # Try data-source attribute first
        item = infobox.find(attrs={'data-source': label})
        if item:
            value_div = item.find('div', class_='pi-data-value')
            if value_div:
                return self.clean_text(value_div.get_text())

        # Try finding by label text
        for item in infobox.find_all('div', class_='pi-data'):
            label_elem = item.find('h3', class_='pi-data-label')
            if label_elem and label.lower() in label_elem.get_text().lower():
                value_elem = item.find('div', class_='pi-data-value')
                if value_elem:
                    return self.clean_text(value_elem.get_text())

        return None

    def get_infobox_list(self, soup: BeautifulSoup, label: str) -> list[str]:
        """Extract a list of values from the infobox."""
        infobox = soup.find('aside', class_='portable-infobox')
        if not infobox:
            return []

        item = infobox.find(attrs={'data-source': label})
        if not item:
            # Try by label text
            for data_item in infobox.find_all('div', class_='pi-data'):
                label_elem = data_item.find('h3', class_='pi-data-label')
                if label_elem and label.lower() in label_elem.get_text().lower():
                    item = data_item
                    break

        if not item:
            return []

        value_div = item.find('div', class_='pi-data-value')
        if not value_div:
            return []

        # Get all links as list items
        links = value_div.find_all('a')
        if links:
            return [self.clean_text(a.get_text()) for a in links if a.get_text().strip()]

        # Or split by commas/newlines
        text = value_div.get_text()
        items = re.split(r'[,\n]', text)
        return [self.clean_text(item) for item in items if item.strip()]

    # =========================================================================
    # TV Episodes Scraping
    # =========================================================================

    def scrape_tv_episode_list(self) -> list[dict]:
        """Scrape the main TV episode list page."""
        print("\n" + "=" * 60)
        print("SCRAPING TV EPISODE LIST")
        print("=" * 60)

        url = f"{BASE_URL}/wiki/List_of_Doctor_Who_television_stories"
        html = self.fetch_page(url)
        soup = self.parse_soup(html)

        episodes = []
        seen_titles = set()  # Avoid duplicates
        current_doctor = None
        current_season = None

        # Find all tables with episode data
        tables = soup.find_all('table', class_='wikitable')

        for table in tables:
            rows = table.find_all('tr')

            # First check the header row to understand table structure
            header_row = rows[0] if rows else None
            has_story_num_col = False
            if header_row:
                headers = [th.get_text().strip().lower() for th in header_row.find_all('th')]
                has_story_num_col = 'story' in headers and len(headers) >= 4

            for row in rows:
                # Check for section header rows (have th with colspan)
                header = row.find('th', colspan=True)
                if header:
                    header_text = header.get_text().strip()
                    if 'Doctor' in header_text:
                        match = re.search(r'(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|War|Ninth|Tenth|Eleventh|Twelfth|Thirteenth|Fourteenth|Fifteenth)\s+Doctor', header_text, re.IGNORECASE)
                        if match:
                            current_doctor = match.group(0)
                    elif 'Season' in header_text or 'Series' in header_text:
                        current_season = header_text.strip()
                    continue

                # Skip pure header rows (all th, no td) like "Story | Title | Episodes | Airdates"
                tds = row.find_all('td')
                if not tds:
                    continue

                # Data rows have: 1 th (story number) + 3 td (title, episodes, dates)
                ths = row.find_all('th')
                story_num = self.clean_text(ths[0].get_text()) if ths else None

                cells = tds
                if len(cells) < 2:
                    continue

                # Find cell with TV story link (usually first cell)
                title = None
                wiki_url = None
                title_cell_idx = None

                for idx, cell in enumerate(cells):
                    # Look for first link that's a TV story
                    for link in cell.find_all('a'):
                        href = link.get('href', '')
                        link_text = self.clean_text(link.get_text())

                        # Skip release date links and other non-story links
                        if '(releases)' in href or 'Category:' in href or 'File:' in href:
                            continue

                        # TV story links contain (TV_story)
                        if '(TV_story)' in href:
                            title = link_text
                            wiki_url = urljoin(BASE_URL, href)
                            title_cell_idx = idx
                            break

                    if title:
                        break

                if not title or len(title) < 3:
                    continue

                # Skip duplicates
                if title in seen_titles:
                    continue
                seen_titles.add(title)

                # Parse other columns: cells are [Title] [Episodes] [Airdates]
                # story_num was already extracted from th element
                ep_count = None
                air_date = None

                # Title is in cell 0, episodes in cell 1, dates in cell 2
                if len(cells) >= 2:
                    ep_text = self.clean_text(cells[1].get_text())
                    if ep_text.isdigit():
                        ep_count = int(ep_text)
                if len(cells) >= 3:
                    air_date = self.clean_text(cells[2].get_text())

                # Check for missing episodes marker
                row_text = row.get_text()
                missing_status = "complete"
                if '†' in row_text:
                    missing_status = "missing"
                elif '‡' in row_text:
                    missing_status = "partial"

                episodes.append({
                    'title': title,
                    'story_number': story_num,
                    'season': current_season,
                    'doctor': current_doctor,
                    'episode_count': ep_count,
                    'air_date': air_date,
                    'wiki_url': wiki_url,
                    'missing_status': missing_status,
                })

        print(f"  Found {len(episodes)} episodes in list")
        return episodes

    def scrape_episode_details(self, episode_stub: dict) -> TVEpisode:
        """Scrape detailed info for a single episode."""
        title = episode_stub['title']
        wiki_url = episode_stub.get('wiki_url')

        episode = TVEpisode(
            title=title,
            story_number=episode_stub.get('story_number'),
            season=episode_stub.get('season'),
            doctor=episode_stub.get('doctor'),
            episode_count=episode_stub.get('episode_count'),
            wiki_url=wiki_url,
            missing_status=episode_stub.get('missing_status'),
        )

        if not wiki_url:
            return episode

        try:
            html = self.fetch_page(wiki_url)
            soup = self.parse_soup(html)

            # Extract from infobox
            episode.writer = self.get_infobox_value(soup, 'writer')
            episode.director = self.get_infobox_value(soup, 'director')
            episode.producer = self.get_infobox_value(soup, 'producer')
            episode.script_editor = self.get_infobox_value(soup, 'script editor')
            episode.composer = self.get_infobox_value(soup, 'composer')
            episode.production_code = self.get_infobox_value(soup, 'production code')

            # Get companions and enemies from infobox
            episode.companions = self.get_infobox_list(soup, 'companion')
            episode.enemies = self.get_infobox_list(soup, 'enemy') or self.get_infobox_list(soup, 'main enemy')

            # Setting
            episode.setting_location = self.get_infobox_value(soup, 'setting')
            episode.setting_time = self.get_infobox_value(soup, 'time')

            # Get series/season from infobox if not already set
            if not episode.series:
                episode.series = self.get_infobox_value(soup, 'series')

            # Extract synopsis - first paragraph after infobox
            content_div = soup.find('div', class_='mw-parser-output')
            if content_div:
                # Find first paragraph
                for p in content_div.find_all('p', recursive=False):
                    text = self.clean_text(p.get_text())
                    if len(text) > 50 and not text.startswith('You may'):
                        episode.synopsis = text[:500]  # Limit length
                        break

            # Try to extract air dates more precisely
            premiere = self.get_infobox_value(soup, 'first broadcast')
            if premiere:
                episode.air_date_start = premiere

        except Exception as e:
            print(f"    Error scraping {title}: {e}")

        return episode

    def scrape_all_tv_episodes(self, limit: Optional[int] = None) -> list[TVEpisode]:
        """Scrape all TV episodes with full details."""
        episode_list = self.scrape_tv_episode_list()

        if limit:
            episode_list = episode_list[:limit]

        print(f"\nScraping details for {len(episode_list)} episodes...")
        episodes = []

        for i, stub in enumerate(episode_list):
            print(f"  [{i+1}/{len(episode_list)}] {stub['title']}")
            episode = self.scrape_episode_details(stub)
            episodes.append(episode)

        return episodes

    # =========================================================================
    # Doctors Scraping
    # =========================================================================

    def get_doctor_urls(self) -> list[dict]:
        """Get URLs for all Doctor incarnation pages."""
        doctors = [
            {"name": "First Doctor", "number": 1, "path": "/wiki/First_Doctor"},
            {"name": "Second Doctor", "number": 2, "path": "/wiki/Second_Doctor"},
            {"name": "Third Doctor", "number": 3, "path": "/wiki/Third_Doctor"},
            {"name": "Fourth Doctor", "number": 4, "path": "/wiki/Fourth_Doctor"},
            {"name": "Fifth Doctor", "number": 5, "path": "/wiki/Fifth_Doctor"},
            {"name": "Sixth Doctor", "number": 6, "path": "/wiki/Sixth_Doctor"},
            {"name": "Seventh Doctor", "number": 7, "path": "/wiki/Seventh_Doctor"},
            {"name": "Eighth Doctor", "number": 8, "path": "/wiki/Eighth_Doctor"},
            {"name": "War Doctor", "number": 0, "path": "/wiki/War_Doctor"},
            {"name": "Ninth Doctor", "number": 9, "path": "/wiki/Ninth_Doctor"},
            {"name": "Tenth Doctor", "number": 10, "path": "/wiki/Tenth_Doctor"},
            {"name": "Eleventh Doctor", "number": 11, "path": "/wiki/Eleventh_Doctor"},
            {"name": "Twelfth Doctor", "number": 12, "path": "/wiki/Twelfth_Doctor"},
            {"name": "Thirteenth Doctor", "number": 13, "path": "/wiki/Thirteenth_Doctor"},
            {"name": "Fourteenth Doctor", "number": 14, "path": "/wiki/Fourteenth_Doctor"},
            {"name": "Fifteenth Doctor", "number": 15, "path": "/wiki/Fifteenth_Doctor"},
        ]
        return doctors

    def scrape_doctor(self, doctor_info: dict) -> Doctor:
        """Scrape details for a single Doctor."""
        url = BASE_URL + doctor_info['path']

        doctor = Doctor(
            name=doctor_info['name'],
            number=doctor_info['number'],
            wiki_url=url,
        )

        try:
            html = self.fetch_page(url)
            soup = self.parse_soup(html)

            # Main actor
            doctor.actor = self.get_infobox_value(soup, 'main actor') or \
                          self.get_infobox_value(soup, 'actor')

            # Other actors
            other_actors = self.get_infobox_list(soup, 'other actor')
            if other_actors:
                doctor.other_actors = other_actors

            # First appearance
            doctor.first_appearance = self.get_infobox_value(soup, 'first appearance')

            # Last appearance
            doctor.last_appearance = self.get_infobox_value(soup, 'final appearance') or \
                                     self.get_infobox_value(soup, 'last appearance')

            # Companions - try multiple sources
            companions = self.get_infobox_list(soup, 'companion')
            if companions:
                doctor.companions = companions

            # Key enemies
            enemies = self.get_infobox_list(soup, 'enemy')
            if enemies:
                doctor.key_enemies = enemies

            # Extract bio summary
            content_div = soup.find('div', class_='mw-parser-output')
            if content_div:
                for p in content_div.find_all('p', recursive=False):
                    text = self.clean_text(p.get_text())
                    if len(text) > 100 and 'incarnation' in text.lower():
                        doctor.bio_summary = text[:600]
                        break

        except Exception as e:
            print(f"    Error scraping {doctor_info['name']}: {e}")

        return doctor

    def scrape_all_doctors(self) -> list[Doctor]:
        """Scrape all Doctor incarnations."""
        print("\n" + "=" * 60)
        print("SCRAPING DOCTOR INCARNATIONS")
        print("=" * 60)

        doctor_urls = self.get_doctor_urls()
        doctors = []

        for info in doctor_urls:
            print(f"  Scraping {info['name']}...")
            doctor = self.scrape_doctor(info)
            doctors.append(doctor)

        return doctors

    # =========================================================================
    # Companions Scraping
    # =========================================================================

    def get_companion_urls(self) -> list[dict]:
        """Get URLs for major companions."""
        # Major TV companions
        companions = [
            # Classic era
            {"name": "Susan Foreman", "path": "/wiki/Susan_Foreman"},
            {"name": "Barbara Wright", "path": "/wiki/Barbara_Wright"},
            {"name": "Ian Chesterton", "path": "/wiki/Ian_Chesterton"},
            {"name": "Vicki Pallister", "path": "/wiki/Vicki_Pallister"},
            {"name": "Steven Taylor", "path": "/wiki/Steven_Taylor"},
            {"name": "Katarina", "path": "/wiki/Katarina"},
            {"name": "Sara Kingdom", "path": "/wiki/Sara_Kingdom"},
            {"name": "Dodo Chaplet", "path": "/wiki/Dodo_Chaplet"},
            {"name": "Polly Wright", "path": "/wiki/Polly_Wright"},
            {"name": "Ben Jackson", "path": "/wiki/Ben_Jackson"},
            {"name": "Jamie McCrimmon", "path": "/wiki/Jamie_McCrimmon"},
            {"name": "Victoria Waterfield", "path": "/wiki/Victoria_Waterfield"},
            {"name": "Zoe Heriot", "path": "/wiki/Zoe_Heriot"},
            {"name": "Liz Shaw", "path": "/wiki/Liz_Shaw"},
            {"name": "Jo Grant", "path": "/wiki/Jo_Grant"},
            {"name": "Sarah Jane Smith", "path": "/wiki/Sarah_Jane_Smith"},
            {"name": "Harry Sullivan", "path": "/wiki/Harry_Sullivan"},
            {"name": "Leela", "path": "/wiki/Leela"},
            {"name": "K9", "path": "/wiki/K9"},
            {"name": "Romana I", "path": "/wiki/Romana_I"},
            {"name": "Romana II", "path": "/wiki/Romana_II"},
            {"name": "Adric", "path": "/wiki/Adric"},
            {"name": "Nyssa", "path": "/wiki/Nyssa_of_Traken"},
            {"name": "Tegan Jovanka", "path": "/wiki/Tegan_Jovanka"},
            {"name": "Vislor Turlough", "path": "/wiki/Vislor_Turlough"},
            {"name": "Kamelion", "path": "/wiki/Kamelion"},
            {"name": "Peri Brown", "path": "/wiki/Peri_Brown"},
            {"name": "Melanie Bush", "path": "/wiki/Melanie_Bush"},
            {"name": "Ace", "path": "/wiki/Ace"},
            {"name": "Grace Holloway", "path": "/wiki/Grace_Holloway"},
            # Revival era
            {"name": "Rose Tyler", "path": "/wiki/Rose_Tyler"},
            {"name": "Mickey Smith", "path": "/wiki/Mickey_Smith"},
            {"name": "Adam Mitchell", "path": "/wiki/Adam_Mitchell"},
            {"name": "Jack Harkness", "path": "/wiki/Jack_Harkness"},
            {"name": "Donna Noble", "path": "/wiki/Donna_Noble"},
            {"name": "Martha Jones", "path": "/wiki/Martha_Jones"},
            {"name": "Astrid Peth", "path": "/wiki/Astrid_Peth"},
            {"name": "Wilfred Mott", "path": "/wiki/Wilfred_Mott"},
            {"name": "Amy Pond", "path": "/wiki/Amy_Pond"},
            {"name": "Rory Williams", "path": "/wiki/Rory_Williams"},
            {"name": "River Song", "path": "/wiki/River_Song"},
            {"name": "Craig Owens", "path": "/wiki/Craig_Owens"},
            {"name": "Clara Oswald", "path": "/wiki/Clara_Oswald"},
            {"name": "Danny Pink", "path": "/wiki/Danny_Pink"},
            {"name": "Nardole", "path": "/wiki/Nardole"},
            {"name": "Bill Potts", "path": "/wiki/Bill_Potts"},
            {"name": "Yasmin Khan", "path": "/wiki/Yasmin_Khan"},
            {"name": "Ryan Sinclair", "path": "/wiki/Ryan_Sinclair"},
            {"name": "Graham O'Brien", "path": "/wiki/Graham_O%27Brien"},
            {"name": "Dan Lewis", "path": "/wiki/Dan_Lewis"},
            {"name": "Ruby Sunday", "path": "/wiki/Ruby_Sunday"},
        ]
        return companions

    def scrape_companion(self, companion_info: dict) -> Companion:
        """Scrape details for a single companion."""
        url = BASE_URL + companion_info['path']

        companion = Companion(
            name=companion_info['name'],
            wiki_url=url,
        )

        try:
            html = self.fetch_page(url)
            soup = self.parse_soup(html)

            # Full name
            companion.full_name = self.get_infobox_value(soup, 'full name')

            # Actor
            companion.actor = self.get_infobox_value(soup, 'main actor') or \
                             self.get_infobox_value(soup, 'actor')

            # Species
            companion.species = self.get_infobox_value(soup, 'species')

            # First/last appearance
            companion.first_appearance = self.get_infobox_value(soup, 'first appearance')
            companion.last_appearance = self.get_infobox_value(soup, 'final appearance') or \
                                        self.get_infobox_value(soup, 'last appearance')

            # Home/origin
            companion.home = self.get_infobox_value(soup, 'place of origin') or \
                            self.get_infobox_value(soup, 'home')

            # Occupation
            occupation = self.get_infobox_value(soup, 'job') or \
                        self.get_infobox_value(soup, 'occupation')
            if occupation:
                companion.occupation = occupation

            # Extract bio summary
            content_div = soup.find('div', class_='mw-parser-output')
            if content_div:
                for p in content_div.find_all('p', recursive=False):
                    text = self.clean_text(p.get_text())
                    if len(text) > 100:
                        companion.bio_summary = text[:600]
                        break

            # Try to extract which Doctors they traveled with from bio
            if companion.bio_summary:
                doctors_found = []
                for d in ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
                         'Seventh', 'Eighth', 'War', 'Ninth', 'Tenth', 'Eleventh',
                         'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth']:
                    if d in companion.bio_summary:
                        doctors_found.append(f"{d} Doctor")
                if doctors_found:
                    companion.doctors_traveled_with = doctors_found

        except Exception as e:
            print(f"    Error scraping {companion_info['name']}: {e}")

        return companion

    def scrape_all_companions(self) -> list[Companion]:
        """Scrape all companions."""
        print("\n" + "=" * 60)
        print("SCRAPING COMPANIONS")
        print("=" * 60)

        companion_urls = self.get_companion_urls()
        companions = []

        for info in companion_urls:
            print(f"  Scraping {info['name']}...")
            companion = self.scrape_companion(info)
            companions.append(companion)

        return companions

    # =========================================================================
    # Enemies Scraping
    # =========================================================================

    def get_enemy_urls(self) -> list[dict]:
        """Get URLs for major enemies and species."""
        enemies = [
            # Major recurring enemies
            {"name": "Daleks", "path": "/wiki/Dalek", "type": "Species"},
            {"name": "Cybermen", "path": "/wiki/Cyberman", "type": "Species"},
            {"name": "The Master", "path": "/wiki/The_Master", "type": "Individual"},
            {"name": "Weeping Angels", "path": "/wiki/Weeping_Angel", "type": "Species"},
            {"name": "Sontarans", "path": "/wiki/Sontaran", "type": "Species"},
            {"name": "Silurians", "path": "/wiki/Silurian", "type": "Species"},
            {"name": "Ice Warriors", "path": "/wiki/Ice_Warrior", "type": "Species"},
            {"name": "Autons", "path": "/wiki/Auton", "type": "Species"},
            {"name": "Zygons", "path": "/wiki/Zygon", "type": "Species"},
            {"name": "Ood", "path": "/wiki/Ood", "type": "Species"},
            {"name": "Judoon", "path": "/wiki/Judoon", "type": "Species"},
            {"name": "The Silence", "path": "/wiki/Silent", "type": "Species"},
            {"name": "Davros", "path": "/wiki/Davros", "type": "Individual"},
            {"name": "The Rani", "path": "/wiki/The_Rani", "type": "Individual"},
            {"name": "Rassilon", "path": "/wiki/Rassilon", "type": "Individual"},
            {"name": "Omega", "path": "/wiki/Omega", "type": "Individual"},
            {"name": "The Great Intelligence", "path": "/wiki/Great_Intelligence", "type": "Entity"},
            {"name": "The Black Guardian", "path": "/wiki/Black_Guardian", "type": "Entity"},
            {"name": "The Valeyard", "path": "/wiki/The_Valeyard", "type": "Individual"},
            {"name": "Missy", "path": "/wiki/Missy", "type": "Individual"},
            {"name": "The Toymaker", "path": "/wiki/The_Toymaker", "type": "Individual"},
            # Classic era threats
            {"name": "Yeti", "path": "/wiki/Yeti", "type": "Species"},
            {"name": "Sea Devils", "path": "/wiki/Sea_Devil", "type": "Species"},
            {"name": "Draconian", "path": "/wiki/Draconian", "type": "Species"},
            {"name": "Ogrons", "path": "/wiki/Ogron", "type": "Species"},
            {"name": "Mechanoids", "path": "/wiki/Mechanoid", "type": "Species"},
            # Revival era threats
            {"name": "Slitheen", "path": "/wiki/Slitheen", "type": "Species"},
            {"name": "The Beast", "path": "/wiki/Beast_(planet)", "type": "Entity"},
            {"name": "Vashta Nerada", "path": "/wiki/Vashta_Nerada", "type": "Species"},
            {"name": "The Flood", "path": "/wiki/Flood", "type": "Species"},
        ]
        return enemies

    def scrape_enemy(self, enemy_info: dict) -> Enemy:
        """Scrape details for a single enemy."""
        url = BASE_URL + enemy_info['path']

        enemy = Enemy(
            name=enemy_info['name'],
            species_type=enemy_info.get('type'),
            wiki_url=url,
        )

        try:
            html = self.fetch_page(url)
            soup = self.parse_soup(html)

            # Aliases
            aliases = self.get_infobox_list(soup, 'alias') or \
                     self.get_infobox_list(soup, 'main alias')
            if aliases:
                enemy.aliases = aliases

            # Origin
            enemy.origin = self.get_infobox_value(soup, 'place of origin') or \
                          self.get_infobox_value(soup, 'origin')

            # First appearance
            enemy.first_appearance = self.get_infobox_value(soup, 'first appearance')

            # Notable individuals
            individuals = self.get_infobox_list(soup, 'notable individual')
            if individuals:
                enemy.notable_individuals = individuals

            # Affiliated organizations
            affiliated = self.get_infobox_list(soup, 'affiliation') or \
                        self.get_infobox_list(soup, 'affiliated')
            if affiliated:
                enemy.affiliated_with = affiliated

            # Extract description
            content_div = soup.find('div', class_='mw-parser-output')
            if content_div:
                for p in content_div.find_all('p', recursive=False):
                    text = self.clean_text(p.get_text())
                    if len(text) > 100:
                        enemy.description = text[:600]
                        break

        except Exception as e:
            print(f"    Error scraping {enemy_info['name']}: {e}")

        return enemy

    def scrape_all_enemies(self) -> list[Enemy]:
        """Scrape all enemies."""
        print("\n" + "=" * 60)
        print("SCRAPING ENEMIES & SPECIES")
        print("=" * 60)

        enemy_urls = self.get_enemy_urls()
        enemies = []

        for info in enemy_urls:
            print(f"  Scraping {info['name']}...")
            enemy = self.scrape_enemy(info)
            enemies.append(enemy)

        return enemies

    # =========================================================================
    # Main Run Method
    # =========================================================================

    def run(self, episode_limit: Optional[int] = None) -> dict:
        """Run the full scraping process."""
        print("=" * 60)
        print("TARDIS WIKI COMPREHENSIVE SCRAPER")
        print("The Ultimate Doctor Who Museum Database")
        print("=" * 60)

        results = {
            "metadata": {
                "source": "Tardis Wiki (tardis.fandom.com)",
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "scraper_version": "1.0",
            },
            "doctors": [],
            "companions": [],
            "enemies": [],
            "tv_episodes": [],
            "stats": {},
        }

        # Scrape Doctors first (quick)
        doctors = self.scrape_all_doctors()
        results["doctors"] = [asdict(d) for d in doctors]
        print(f"  Total Doctors: {len(doctors)}")

        # Scrape Companions
        companions = self.scrape_all_companions()
        results["companions"] = [asdict(c) for c in companions]
        print(f"  Total Companions: {len(companions)}")

        # Scrape Enemies
        enemies = self.scrape_all_enemies()
        results["enemies"] = [asdict(e) for e in enemies]
        print(f"  Total Enemies: {len(enemies)}")

        # Scrape TV Episodes (most time-consuming)
        episodes = self.scrape_all_tv_episodes(limit=episode_limit)
        results["tv_episodes"] = [asdict(e) for e in episodes]
        print(f"  Total Episodes: {len(episodes)}")

        # Compute stats
        results["stats"] = {
            "total_doctors": len(doctors),
            "total_companions": len(companions),
            "total_enemies": len(enemies),
            "total_tv_episodes": len(episodes),
            "total_requests": self.request_count,
        }

        # Save results
        print("\n" + "=" * 60)
        print("SAVING RESULTS")
        print("=" * 60)

        # Full combined data
        full_path = OUTPUT_DIR / "tardis-wiki-full.json"
        full_path.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')
        print(f"  Full data: {full_path}")

        # Individual files for easier use
        for key in ["doctors", "companions", "enemies", "tv_episodes"]:
            path = OUTPUT_DIR / f"tardis-wiki-{key.replace('_', '-')}.json"
            path.write_text(json.dumps(results[key], indent=2, ensure_ascii=False), encoding='utf-8')
            print(f"  {key}: {path}")

        print("\n" + "=" * 60)
        print("SCRAPING COMPLETE")
        print("=" * 60)
        print(f"Total Doctors: {len(doctors)}")
        print(f"Total Companions: {len(companions)}")
        print(f"Total Enemies: {len(enemies)}")
        print(f"Total TV Episodes: {len(episodes)}")
        print(f"Total HTTP Requests: {self.request_count}")
        print(f"Output directory: {OUTPUT_DIR}")

        return results


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Scrape Tardis Wiki for Doctor Who data")
    parser.add_argument("--no-cache", action="store_true", help="Disable caching")
    parser.add_argument("--episode-limit", type=int, help="Limit number of episodes to scrape")
    parser.add_argument("--quick", action="store_true", help="Quick mode: only scrape doctors/companions/enemies, skip episode details")
    args = parser.parse_args()

    scraper = TardisWikiScraper(use_cache=not args.no_cache)

    if args.quick:
        # Quick mode - just scrape the main entities without episode details
        print("Running in QUICK mode (no episode details)")
        results = {
            "metadata": {
                "source": "Tardis Wiki (tardis.fandom.com)",
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "mode": "quick",
            },
            "doctors": [asdict(d) for d in scraper.scrape_all_doctors()],
            "companions": [asdict(c) for c in scraper.scrape_all_companions()],
            "enemies": [asdict(e) for e in scraper.scrape_all_enemies()],
        }

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        path = OUTPUT_DIR / "tardis-wiki-quick.json"
        path.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')
        print(f"\nSaved to: {path}")
    else:
        scraper.run(episode_limit=args.episode_limit)


if __name__ == "__main__":
    main()
