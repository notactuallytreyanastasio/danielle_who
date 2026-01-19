// Filming location data extracted from doctorwholocations.net
import type { FilmingLocation, EpisodeLocations } from './location-types'

// Key filming locations with coordinates
export const FILMING_LOCATIONS: readonly FilmingLocation[] = [
  // Cardiff - Primary filming base
  {
    id: 'cardiff-bay',
    name: 'Cardiff Bay',
    area: 'Cardiff Bay',
    city: 'Cardiff',
    country: 'Wales',
    coordinates: { lat: 51.4637, lng: -3.1634 },
    type: 'landmark',
    stillExists: true,
    episodes: [
      { episodeId: 'boomtown', episodeTitle: 'Boom Town', series: 'Series 1', doctor: 9, sceneDescription: 'The Millennium Centre and Bay area', isStudio: false },
      { episodeId: 'utopia', episodeTitle: 'Utopia', series: 'Series 3', doctor: 10, sceneDescription: 'Roald Dahl Plass - the Rift location', isStudio: false },
    ],
  },
  {
    id: 'brandon-estate',
    name: 'Brandon Estate',
    area: 'Kennington',
    city: 'London',
    country: 'England',
    coordinates: { lat: 51.4845, lng: -0.1056 },
    type: 'building',
    stillExists: true,
    episodes: [
      { episodeId: 'rose', episodeTitle: 'Rose', series: 'Series 1', doctor: 9, sceneDescription: 'The Powell Estate - Rose\'s home', filmingDates: ['28 Jul 2004', '29 Jul 2004', '30 Jul 2004'], isStudio: false },
      { episodeId: 'aliensoflondon', episodeTitle: 'Aliens of London', series: 'Series 1', doctor: 9, sceneDescription: 'The Powell Estate exterior', isStudio: false },
      { episodeId: 'fathersday', episodeTitle: 'Father\'s Day', series: 'Series 1', doctor: 9, sceneDescription: 'Estate scenes', isStudio: false },
    ],
    notes: 'The iconic Powell Estate where Rose Tyler lived',
  },
  {
    id: 'london-eye',
    name: 'London Eye',
    area: 'Southwark',
    city: 'London',
    country: 'England',
    coordinates: { lat: 51.5033, lng: -0.1196 },
    type: 'landmark',
    stillExists: true,
    episodes: [
      { episodeId: 'rose', episodeTitle: 'Rose', series: 'Series 1', doctor: 9, sceneDescription: 'The Nestene Consciousness transmitter', filmingDates: ['26 Jul 2004', '27 Jul 2004'], isStudio: false },
    ],
  },
  {
    id: 'westminster-bridge',
    name: 'Westminster Bridge',
    area: 'Westminster',
    city: 'London',
    country: 'England',
    coordinates: { lat: 51.5008, lng: -0.1218 },
    type: 'landmark',
    stillExists: true,
    episodes: [
      { episodeId: 'rose', episodeTitle: 'Rose', series: 'Series 1', doctor: 9, sceneDescription: 'The Doctor and Rose run across the bridge', filmingDates: ['26 Jul 2004'], isStudio: false },
      { episodeId: 'aliensoflondon', episodeTitle: 'Aliens of London', series: 'Series 1', doctor: 9, sceneDescription: 'Spaceship crashes near Big Ben', isStudio: false },
    ],
  },
  {
    id: 'trafalgar-square',
    name: 'Trafalgar Square',
    area: 'Westminster',
    city: 'London',
    country: 'England',
    coordinates: { lat: 51.5081, lng: -0.1281 },
    type: 'landmark',
    stillExists: true,
    episodes: [
      { episodeId: 'rose', episodeTitle: 'Rose', series: 'Series 1', doctor: 9, sceneDescription: 'Rose meets Mickey for lunch', filmingDates: ['26 Jul 2004'], isStudio: false },
      { episodeId: 'dayofthedoctor', episodeTitle: 'The Day of the Doctor', series: '50th Anniversary', doctor: 11, sceneDescription: 'UNIT operation to move the TARDIS', isStudio: false },
    ],
  },
  {
    id: 'fields-house-newport',
    name: 'Fields House',
    area: 'Allt-Yr-Yn',
    city: 'Newport',
    country: 'Wales',
    coordinates: { lat: 51.5869, lng: -3.0175 },
    type: 'building',
    stillExists: true,
    episodes: [
      { episodeId: 'blink', episodeTitle: 'Blink', series: 'Series 3', doctor: 10, sceneDescription: 'Wester Drumlins House - the Weeping Angels\' lair', filmingDates: ['23 Nov 2006', '24 Nov 2006', '25 Nov 2006', '29 Nov 2006', '30 Nov 2006'], isStudio: false },
    ],
    notes: 'The iconic creepy house from Blink',
  },
  {
    id: 'st-woolos-cemetery',
    name: 'St Woolos Cemetery',
    area: 'Newport',
    city: 'Newport',
    country: 'Wales',
    coordinates: { lat: 51.5847, lng: -2.9952 },
    type: 'exterior',
    stillExists: true,
    episodes: [
      { episodeId: 'blink', episodeTitle: 'Blink', series: 'Series 3', doctor: 10, sceneDescription: 'Sally visits Kathy\'s grave', filmingDates: ['29 Nov 2006'], isStudio: false },
    ],
  },
  {
    id: 'coal-exchange-cardiff',
    name: 'The Coal Exchange',
    area: 'Mount Stuart Square',
    city: 'Cardiff',
    country: 'Wales',
    coordinates: { lat: 51.4646, lng: -3.1647 },
    type: 'building',
    stillExists: true,
    episodes: [
      { episodeId: 'blink', episodeTitle: 'Blink', series: 'Series 3', doctor: 10, sceneDescription: 'Garage under the police station', filmingDates: ['21 Nov 2006'], isStudio: false },
    ],
  },
  {
    id: 'bad-wolf-bay',
    name: 'Southerndown Beach',
    area: 'Dunraven Bay',
    city: 'Bridgend',
    country: 'Wales',
    coordinates: { lat: 51.4443, lng: -3.6072 },
    type: 'beach',
    stillExists: true,
    episodes: [
      { episodeId: 'doomsday', episodeTitle: 'Doomsday', series: 'Series 2', doctor: 10, sceneDescription: 'Bad Wolf Bay - Rose\'s farewell', isStudio: false },
      { episodeId: 'journeysend', episodeTitle: 'Journey\'s End', series: 'Series 4', doctor: 10, sceneDescription: 'Bad Wolf Bay - Rose meets the Meta-Crisis Doctor', isStudio: false },
    ],
    notes: 'Famous as "Bad Wolf Bay" in Norway (actually Wales)',
  },
  {
    id: 'clearwell-caves',
    name: 'Clearwell Caves',
    area: 'Forest of Dean',
    city: 'Coleford',
    country: 'England',
    coordinates: { lat: 51.7767, lng: -2.6494 },
    type: 'interior',
    stillExists: true,
    episodes: [
      { episodeId: 'timeofdoctor', episodeTitle: 'The Time of the Doctor', series: 'Series 7 Special', doctor: 11, sceneDescription: 'Underground tunnels', isStudio: false },
      { episodeId: 'rebelflesh', episodeTitle: 'The Rebel Flesh', series: 'Series 6', doctor: 11, sceneDescription: 'The factory', isStudio: false },
    ],
  },
  {
    id: 'st-fagans',
    name: 'St Fagans National Museum of History',
    area: 'St Fagans',
    city: 'Cardiff',
    country: 'Wales',
    coordinates: { lat: 51.4875, lng: -3.2733 },
    type: 'exterior',
    stillExists: true,
    episodes: [
      { episodeId: 'unquietdead', episodeTitle: 'The Unquiet Dead', series: 'Series 1', doctor: 9, sceneDescription: 'Victorian Cardiff streets', isStudio: false },
      { episodeId: 'humannat', episodeTitle: 'Human Nature', series: 'Series 3', doctor: 10, sceneDescription: 'Village scenes', isStudio: false },
    ],
  },
  {
    id: 'upper-boat-studios',
    name: 'Upper Boat Studios',
    area: 'Pontypridd',
    city: 'Pontypridd',
    country: 'Wales',
    coordinates: { lat: 51.5917, lng: -3.3242 },
    type: 'studio',
    stillExists: true,
    episodes: [
      { episodeId: 'various', episodeTitle: 'Various (2006-2012)', series: 'Series 2-7', doctor: 10, sceneDescription: 'Main BBC Wales studio - TARDIS interior, standing sets', isStudio: true },
    ],
    notes: 'Primary Doctor Who studio 2006-2012',
  },
  {
    id: 'roath-lock-studios',
    name: 'Roath Lock Studios',
    area: 'Cardiff Bay',
    city: 'Cardiff',
    country: 'Wales',
    coordinates: { lat: 51.4669, lng: -3.1592 },
    type: 'studio',
    stillExists: true,
    episodes: [
      { episodeId: 'various', episodeTitle: 'Various (2012-present)', series: 'Series 8+', doctor: 12, sceneDescription: 'Current BBC Wales studio - TARDIS interior, standing sets', isStudio: true },
    ],
    notes: 'Current Doctor Who studio since 2012',
  },
  {
    id: 'millennium-centre',
    name: 'Wales Millennium Centre',
    area: 'Cardiff Bay',
    city: 'Cardiff',
    country: 'Wales',
    coordinates: { lat: 51.4649, lng: -3.1631 },
    type: 'landmark',
    stillExists: true,
    episodes: [
      { episodeId: 'boomtown', episodeTitle: 'Boom Town', series: 'Series 1', doctor: 9, sceneDescription: 'Cardiff landmark', isStudio: false },
      { episodeId: 'endoftime', episodeTitle: 'The End of Time', series: 'Series 4 Special', doctor: 10, sceneDescription: 'The Doctor visits Cardiff', isStudio: false },
    ],
    notes: 'Iconic Cardiff landmark frequently seen in the show',
  },
  {
    id: 'national-museum-cardiff',
    name: 'National Museum Cardiff',
    area: 'Cathays Park',
    city: 'Cardiff',
    country: 'Wales',
    coordinates: { lat: 51.4863, lng: -3.1766 },
    type: 'building',
    stillExists: true,
    episodes: [
      { episodeId: 'vincentandthedoctor', episodeTitle: 'Vincent and the Doctor', series: 'Series 5', doctor: 11, sceneDescription: 'Musée d\'Orsay interior', isStudio: false },
    ],
    notes: 'Doubled as the Musée d\'Orsay in Paris',
  },
  {
    id: 'caerphilly-castle',
    name: 'Caerphilly Castle',
    area: 'Caerphilly',
    city: 'Caerphilly',
    country: 'Wales',
    coordinates: { lat: 51.5760, lng: -3.2200 },
    type: 'landmark',
    stillExists: true,
    episodes: [
      { episodeId: 'robotsherwood', episodeTitle: 'Robot of Sherwood', series: 'Series 8', doctor: 12, sceneDescription: 'Sherwood Forest castle', isStudio: false },
    ],
    notes: 'One of the largest castles in Britain',
  },
  {
    id: 'margam-country-park',
    name: 'Margam Country Park',
    area: 'Port Talbot',
    city: 'Port Talbot',
    country: 'Wales',
    coordinates: { lat: 51.5583, lng: -3.7308 },
    type: 'park',
    stillExists: true,
    episodes: [
      { episodeId: 'girlinthefireplace', episodeTitle: 'The Girl in the Fireplace', series: 'Series 2', doctor: 10, sceneDescription: 'Versailles gardens', isStudio: false },
    ],
  },
  {
    id: 'canary-wharf',
    name: 'Canary Wharf',
    area: 'Tower Hamlets',
    city: 'London',
    country: 'England',
    coordinates: { lat: 51.5054, lng: -0.0235 },
    type: 'landmark',
    stillExists: true,
    episodes: [
      { episodeId: 'armyofghosts', episodeTitle: 'Army of Ghosts', series: 'Series 2', doctor: 10, sceneDescription: 'Torchwood Tower / One Canada Square', isStudio: false },
      { episodeId: 'doomsday', episodeTitle: 'Doomsday', series: 'Series 2', doctor: 10, sceneDescription: 'The Battle of Canary Wharf', isStudio: false },
    ],
    notes: 'Site of Torchwood One and the Battle of Canary Wharf',
  },
  {
    id: 'stonehenge',
    name: 'Stonehenge',
    area: 'Salisbury Plain',
    city: 'Amesbury',
    country: 'England',
    coordinates: { lat: 51.1789, lng: -1.8262 },
    type: 'landmark',
    stillExists: true,
    episodes: [
      { episodeId: 'pandoricaopens', episodeTitle: 'The Pandorica Opens', series: 'Series 5', doctor: 11, sceneDescription: 'The Pandorica beneath Stonehenge', isStudio: false },
    ],
    notes: 'CGI enhanced for the episode',
  },
  {
    id: 'tower-of-london',
    name: 'Tower of London',
    area: 'Tower Hill',
    city: 'London',
    country: 'England',
    coordinates: { lat: 51.5081, lng: -0.0759 },
    type: 'landmark',
    stillExists: true,
    episodes: [
      { episodeId: 'dayofthedoctor', episodeTitle: 'The Day of the Doctor', series: '50th Anniversary', doctor: 11, sceneDescription: 'UNIT Black Archive beneath the Tower', isStudio: false },
    ],
  },
]

// Episode-centric location data for detailed views
export const EPISODE_LOCATIONS: readonly EpisodeLocations[] = [
  {
    episodeId: 'rose',
    episodeTitle: 'Rose',
    series: 'Series 1',
    doctor: 9,
    airDate: '2005-03-26',
    locations: [
      { locationId: 'howells-cardiff', locationName: 'Howell\'s / House of Fraser', area: 'Cardiff', sceneDescription: 'Henrik\'s Department Store exterior', filmingDates: ['20 Jul 2004'] },
      { locationId: 'wharton-street', locationName: 'Wharton Street', area: 'Cardiff', sceneDescription: 'Rose runs from the Doctor', filmingDates: ['20 Jul 2004'] },
      { locationId: 'working-street', locationName: 'Working Street', area: 'Cardiff', sceneDescription: 'London street doubles', filmingDates: ['20 Jul 2004', '22 Jul 2004'], doubledAs: 'London' },
      { locationId: 'queens-arcade', locationName: 'Queen\'s Arcade', area: 'Cardiff', sceneDescription: 'Shopping centre scenes', filmingDates: ['21 Jul 2004', '22 Jul 2004'] },
      { locationId: 'trafalgar-square', locationName: 'Trafalgar Square', area: 'London', sceneDescription: 'Rose meets Mickey for lunch', filmingDates: ['26 Jul 2004'] },
      { locationId: 'westminster-bridge', locationName: 'Westminster Bridge', area: 'London', sceneDescription: 'Running to the London Eye', filmingDates: ['26 Jul 2004'] },
      { locationId: 'london-eye', locationName: 'London Eye', area: 'London', sceneDescription: 'Nestene transmitter', filmingDates: ['26 Jul 2004', '27 Jul 2004'] },
      { locationId: 'brandon-estate', locationName: 'Brandon Estate', area: 'Kennington, London', sceneDescription: 'Powell Estate', filmingDates: ['28 Jul 2004', '29 Jul 2004', '30 Jul 2004'] },
      { locationId: 'ely-paper-mill', locationName: 'Ely Paper Mill', area: 'Cardiff', sceneDescription: 'Nestene lair', filmingDates: ['23 Aug 2004', '24 Aug 2004', '25 Aug 2004'] },
    ],
    studios: [
      { studioName: 'Unit Q2', location: 'Newport', dates: ['20 Aug 2004', '26 Aug 2004', '1-3 Sep 2004'] },
    ],
  },
  {
    episodeId: 'blink',
    episodeTitle: 'Blink',
    series: 'Series 3',
    doctor: 10,
    airDate: '2007-06-09',
    locations: [
      { locationId: 'fields-house', locationName: 'Fields House', area: 'Newport', sceneDescription: 'Wester Drumlins House', filmingDates: ['23-25 Nov 2006', '29-30 Nov 2006'] },
      { locationId: 'coal-exchange', locationName: 'The Coal Exchange', area: 'Cardiff Bay', sceneDescription: 'Police station garage', filmingDates: ['21 Nov 2006'] },
      { locationId: 'diverse-music', locationName: 'Diverse Music', area: 'Newport', sceneDescription: 'Banto\'s DVD Store', filmingDates: ['27-28 Nov 2006'] },
      { locationId: 'st-woolos', locationName: 'St Woolos Cemetery', area: 'Newport', sceneDescription: 'Kathy\'s grave', filmingDates: ['29 Nov 2006'] },
      { locationId: 'district-miners', locationName: 'District Miners Hospital', area: 'Caerphilly', sceneDescription: 'Welgrove Hospice', filmingDates: ['22 Nov 2006'] },
    ],
    studios: [
      { studioName: 'BBC Studios Upper Boat', location: 'Pontypridd', dates: ['7 Nov 2006', '22 Nov 2006', '1-2 Dec 2006'] },
    ],
  },
  {
    episodeId: 'doomsday',
    episodeTitle: 'Doomsday',
    series: 'Series 2',
    doctor: 10,
    airDate: '2006-07-08',
    locations: [
      { locationId: 'canary-wharf', locationName: 'Canary Wharf', area: 'London', sceneDescription: 'Torchwood Tower / Battle of Canary Wharf', filmingDates: [] },
      { locationId: 'bad-wolf-bay', locationName: 'Southerndown Beach', area: 'Bridgend', sceneDescription: 'Bad Wolf Bay - Rose\'s farewell', filmingDates: [], doubledAs: 'Dårlig Ulv Stranden, Norway' },
    ],
    studios: [],
  },
  {
    episodeId: 'dayofthedoctor',
    episodeTitle: 'The Day of the Doctor',
    series: '50th Anniversary Special',
    doctor: 11,
    airDate: '2013-11-23',
    locations: [
      { locationId: 'trafalgar-square', locationName: 'Trafalgar Square', area: 'London', sceneDescription: 'UNIT operation', filmingDates: [] },
      { locationId: 'tower-of-london', locationName: 'Tower of London', area: 'London', sceneDescription: 'UNIT Black Archive', filmingDates: [] },
    ],
    studios: [
      { studioName: 'Roath Lock Studios', location: 'Cardiff', dates: [] },
    ],
  },
]

// Helper functions
export function getLocationById(id: string): FilmingLocation | undefined {
  return FILMING_LOCATIONS.find((loc) => loc.id === id)
}

export function getLocationsByCity(city: string): readonly FilmingLocation[] {
  return FILMING_LOCATIONS.filter(
    (loc) => loc.city.toLowerCase() === city.toLowerCase()
  )
}

export function getLocationsByEpisode(episodeId: string): readonly FilmingLocation[] {
  return FILMING_LOCATIONS.filter((loc) =>
    loc.episodes.some((ep) => ep.episodeId === episodeId)
  )
}

export function getEpisodeLocations(episodeId: string): EpisodeLocations | undefined {
  return EPISODE_LOCATIONS.find((ep) => ep.episodeId === episodeId)
}

export function getAllCities(): readonly string[] {
  const cities = new Set(FILMING_LOCATIONS.map((loc) => loc.city))
  return Array.from(cities).sort()
}

export function getLocationsWithCoordinates(): readonly FilmingLocation[] {
  return FILMING_LOCATIONS.filter((loc) => loc.coordinates !== undefined)
}
