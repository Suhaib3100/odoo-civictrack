"use client"

import { useState, useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Icon } from "leaflet"
import { MapMarker } from "./map-marker"
import { Issue, Location } from "@/types/map"
import { Navigation } from "lucide-react"

// Leaflet CSS import
import "leaflet/dist/leaflet.css"

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// User location marker icon
const userLocationIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#3b82f6" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

interface MapComponentProps {
  issues: Issue[]
  userLocation: Location
  onMarkerClick: (issue: Issue) => void
  totalIssues: number
}

// Component to handle map center updates
function MapUpdater({ userLocation }: { userLocation: Location }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView([userLocation.lat, userLocation.lng], 13)
  }, [userLocation, map])
  
  return null
}

export default function MapComponent({ issues, userLocation, onMarkerClick, totalIssues }: MapComponentProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const handleMarkerClick = (issue: Issue) => {
    setSelectedIssue(issue)
    onMarkerClick(issue)
  }

  return (
    <div className="relative h-full">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        className="h-full w-full"
        style={{ background: '#1a1a1a' }}
      >
        {/* Map Updater for user location */}
        <MapUpdater userLocation={userLocation} />

        {/* Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userLocationIcon}
        >
          <Popup>
            <div className="p-2 text-center">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">Your Location</span>
              </div>
              <p className="text-sm text-gray-600">
                You are here
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Issue Markers */}
        {issues.map((issue) => (
          <MapMarker
            key={issue.id}
            issue={issue}
            userLocation={userLocation}
            onMarkerClick={handleMarkerClick}
          />
        ))}
      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-sm font-medium text-gray-900 mb-1">
            Issues Found
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {issues.length}
          </div>
          <div className="text-xs text-gray-600">
            of {totalIssues} total
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm font-medium text-gray-900 mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700">Reported</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Resolved</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
            <span className="text-gray-700">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  )
} 