"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Issue, Location } from "@/types/map"

interface MapComponentProps {
  issues: Issue[]
  userLocation: Location
  onMarkerClick: (issue: Issue) => void
  totalIssues: number
}

export default function MapComponent({ issues, userLocation, onMarkerClick, totalIssues }: MapComponentProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  // Cleanup function
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (typeof window === "undefined" || !mapRef.current) return

    try {
      setMapError(null)
      
      // Import Leaflet
      const L = await import("leaflet")
      
      // Cleanup existing map
      cleanupMap()

      // Create map instance
      const map = L.map(mapRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true,
      })

      // Store map instance
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 3,
      }).addTo(map)

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Create user location marker
      const userLocationIcon = L.icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>
        `)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      // Add user location marker
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { 
        icon: userLocationIcon,
        title: "Your Location"
      }).addTo(map)

      userMarker.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">Your Location</div>
          <div style="font-size: 14px; color: #6b7280;">You are here</div>
        </div>
      `)

      // Create issue markers
      const statusColors = {
        'Reported': '#ef4444',
        'In Progress': '#f59e0b',
        'Resolved': '#10b981',
      }

      issues.forEach((issue) => {
        const issueIcon = L.icon({
          iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${statusColors[issue.status]}"/>
            </svg>
          `)}`,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        })

        const marker = L.marker([issue.location.lat, issue.location.lng], { 
          icon: issueIcon,
          title: issue.title
        }).addTo(map)

        // Create popup content
        const popupContent = `
          <div style="padding: 16px; min-width: 280px;">
            <div style="margin-bottom: 12px;">
              <h3 style="font-weight: 600; color: #1f2937; font-size: 18px; line-height: 1.2; margin: 0 0 8px 0;">${issue.title}</h3>
              <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.4;">${issue.description || ''}</p>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <span style="padding: 4px 8px; font-size: 12px; font-weight: 500; border-radius: 4px; background-color: ${issue.status === 'Reported' ? '#fef2f2' : issue.status === 'In Progress' ? '#fffbeb' : '#f0fdf4'}; color: ${issue.status === 'Reported' ? '#dc2626' : issue.status === 'In Progress' ? '#d97706' : '#059669'}; border: 1px solid ${issue.status === 'Reported' ? '#fecaca' : issue.status === 'In Progress' ? '#fed7aa' : '#bbf7d0'};">${issue.status}</span>
              <span style="padding: 4px 8px; font-size: 12px; border-radius: 4px; border: 1px solid #d1d5db; color: #374151;">${issue.category}</span>
            </div>
            <div style="padding-top: 8px;">
              <a href="/issue/${issue.id}" style="display: block; width: 100%; background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 14px; font-weight: 500;">View Details</a>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)

        // Add click handler
        marker.on('click', () => {
          onMarkerClick(issue)
        })
      })

      // Force map to resize after initialization
      setTimeout(() => {
        map.invalidateSize()
      }, 100)

      setIsMapLoaded(true)
    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError('Failed to load map. Please refresh the page.')
    }
  }, [userLocation, issues, onMarkerClick, cleanupMap])

  // Initialize map on mount and when dependencies change
  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMap()
    }
  }, [cleanupMap])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current.invalidateSize()
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="h-full w-full"
        style={{ 
          background: '#1a1a1a',
          minHeight: '400px'
        }}
      />

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

      {/* Loading State */}
      {!isMapLoaded && !mapError && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[1001]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[1001]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <h2 className="text-red-400 text-xl font-semibold mb-2">Map Error</h2>
              <p className="text-gray-300 mb-4">{mapError}</p>
              <button
                onClick={() => {
                  setMapError(null)
                  setIsMapLoaded(false)
                  initializeMap()
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 