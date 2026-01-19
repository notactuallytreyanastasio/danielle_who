import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useUrlState } from '@core/use-url-state'
import L from 'leaflet'
import type { FilmingLocation } from '@core/location-types'
import { getAllCities, getLocationsWithCoordinates } from '@core/location-data'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const studioIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'studio-marker',
})

L.Marker.prototype.options.icon = defaultIcon

interface LocationMarkerProps {
  location: FilmingLocation
  onSelect: (location: FilmingLocation) => void
}

function LocationMarker({ location, onSelect }: LocationMarkerProps) {
  if (!location.coordinates) return null

  const icon = location.type === 'studio' ? studioIcon : defaultIcon

  return (
    <Marker
      position={[location.coordinates.lat, location.coordinates.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(location),
      }}
    >
      <Popup>
        <div className="map-popup">
          <h4>{location.name}</h4>
          <p className="map-popup__area">{location.area}, {location.city}</p>
          <p className="map-popup__episodes">
            {location.episodes.length} episode{location.episodes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

interface MapControlsProps {
  center: [number, number]
}

function MapControls({ center }: MapControlsProps) {
  const map = useMap()

  const flyTo = (coords: [number, number], zoom: number) => {
    map.flyTo(coords, zoom, { duration: 1.5 })
  }

  return (
    <div className="map-quick-nav">
      <button onClick={() => flyTo([51.4816, -3.1791], 11)} title="Cardiff">
        Cardiff
      </button>
      <button onClick={() => flyTo([51.5074, -0.1278], 12)} title="London">
        London
      </button>
      <button onClick={() => flyTo([51.5869, -3.0175], 13)} title="Newport">
        Newport
      </button>
      <button onClick={() => flyTo(center, 7)} title="All UK">
        All UK
      </button>
    </div>
  )
}

export function LocationsMap() {
  const [selectedLocationName, setSelectedLocationName] = useUrlState<string>('loc', '')
  const [cityFilter, setCityFilter] = useUrlState<string>('city', 'all')
  const [typeFilter, setTypeFilter] = useUrlState<string>('type', 'all')

  const cities = useMemo(() => getAllCities(), [])
  const locationsWithCoords = useMemo(() => getLocationsWithCoordinates(), [])

  // Derive selectedLocation from selectedLocationName
  const selectedLocation = useMemo(() => {
    if (!selectedLocationName) return null
    return locationsWithCoords.find(l => l.name === selectedLocationName) || null
  }, [locationsWithCoords, selectedLocationName])

  const setSelectedLocation = (location: FilmingLocation | null) => {
    setSelectedLocationName(location?.name || '')
  }

  const filteredLocations = useMemo(() => {
    return locationsWithCoords.filter((loc) => {
      if (cityFilter !== 'all' && loc.city !== cityFilter) return false
      if (typeFilter !== 'all' && loc.type !== typeFilter) return false
      return true
    })
  }, [locationsWithCoords, cityFilter, typeFilter])

  const center: [number, number] = [51.9, -2.5] // Centered on Wales/England

  return (
    <div className="locations-page">
      <div className="locations-header">
        <h2 className="locations-title">🗺️ Filming Locations</h2>
        <p className="locations-subtitle">
          Explore real-world Doctor Who filming locations across the UK
        </p>
      </div>

      <div className="locations-filters">
        <div className="filter-group">
          <label>City:</label>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="location-select"
          >
            <option value="all">All Cities ({locationsWithCoords.length})</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city} ({locationsWithCoords.filter((l) => l.city === city).length})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="location-select"
          >
            <option value="all">All Types</option>
            <option value="landmark">Landmarks</option>
            <option value="building">Buildings</option>
            <option value="street">Streets</option>
            <option value="studio">Studios</option>
            <option value="exterior">Exteriors</option>
            <option value="beach">Beaches</option>
          </select>
        </div>

        <div className="locations-count">
          Showing {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="locations-layout">
        <div className="map-container">
          <MapContainer
            center={center}
            zoom={7}
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapControls center={center} />
            {filteredLocations.map((location) => (
              <LocationMarker
                key={location.id}
                location={location}
                onSelect={setSelectedLocation}
              />
            ))}
          </MapContainer>
        </div>

        <div className="locations-sidebar">
          {selectedLocation ? (
            <div className="location-detail">
              <button
                className="location-detail__close"
                onClick={() => setSelectedLocation(null)}
              >
                ×
              </button>
              <h3>{selectedLocation.name}</h3>
              <p className="location-detail__area">
                {selectedLocation.area}, {selectedLocation.city}, {selectedLocation.country}
              </p>

              <div className="location-detail__meta">
                <span className={`location-type location-type--${selectedLocation.type}`}>
                  {selectedLocation.type}
                </span>
                {selectedLocation.stillExists ? (
                  <span className="location-status location-status--exists">Still exists</span>
                ) : (
                  <span className="location-status location-status--gone">No longer exists</span>
                )}
              </div>

              {selectedLocation.notes && (
                <p className="location-detail__notes">{selectedLocation.notes}</p>
              )}

              <h4>Appearances ({selectedLocation.episodes.length})</h4>
              <div className="location-episodes">
                {selectedLocation.episodes.map((ep, i) => (
                  <div key={i} className="location-episode">
                    <div className="location-episode__title">{ep.episodeTitle}</div>
                    <div className="location-episode__series">{ep.series}</div>
                    <div className="location-episode__scene">{ep.sceneDescription}</div>
                    {ep.filmingDates && ep.filmingDates.length > 0 && (
                      <div className="location-episode__dates">
                        Filmed: {ep.filmingDates.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="location-list">
              <h3>All Locations</h3>
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="location-list-item"
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="location-list-item__name">{location.name}</div>
                  <div className="location-list-item__area">
                    {location.city} • {location.episodes.length} episode{location.episodes.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="locations-footer">
        <p>
          Location data sourced from{' '}
          <a href="https://www.doctorwholocations.net/" target="_blank" rel="noopener noreferrer">
            The Locations Guide to Doctor Who
          </a>
        </p>
      </div>
    </div>
  )
}
