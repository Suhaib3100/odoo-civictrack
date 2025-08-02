"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Issue, Location } from "@/types/map"

interface MapComponentProps {
  issues: Issue[]
  userLocation: Location
  onMarkerClick: (issue: Issue) => void
  totalIssues: number
  locationAccuracy?: number | null
  locationSource?: string
}

export default function MapComponent({ 
  issues, 
  userLocation, 
  onMarkerClick, 
  totalIssues,
  locationAccuracy,
  locationSource = "GPS"
}: MapComponentProps) {
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
        zoom: 16, // Closer zoom for better detail
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
        minZoom: 12,
      }).addTo(map)

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Create user location marker with larger, more visible icon
      const userLocationIcon = L.icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20" r="8" fill="white"/>
            <circle cx="20" cy="20" r="4" fill="#3b82f6"/>
          </svg>
        `)}`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      // Add user location marker
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { 
        icon: userLocationIcon,
        title: "Your Location",
        zIndexOffset: 1000 // Ensure user marker is always on top
      }).addTo(map)

      // Add accuracy circle if accuracy is available
      if (locationAccuracy && locationAccuracy > 0) {
        const accuracyCircle = L.circle([userLocation.lat, userLocation.lng], {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          weight: 2,
          radius: locationAccuracy
        }).addTo(map)
      }

      // Create popup content with accuracy info
      const accuracyText = locationAccuracy 
        ? `Accuracy: ±${Math.round(locationAccuracy)}m`
        : "Location accuracy unknown"
      
      userMarker.bindPopup(`
        <div style="text-align: center; padding: 16px; min-width: 240px;">
          <div style="font-weight: 700; color: #1f2937; margin-bottom: 8px; font-size: 18px;">📍 Your Location</div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">You are here</div>
          <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px; padding: 4px 8px; background: #f3f4f6; border-radius: 4px;">${accuracyText}</div>
          <div style="font-size: 12px; color: #9ca3af;">Source: ${locationSource}</div>
        </div>
      `)

      // Create issue markers with larger, more visible icons
      const statusColors = {
        'Reported': '#ef4444',
        'In Progress': '#f59e0b',
        'Resolved': '#10b981',
      }

      const statusSizes = {
        'Reported': 32, // Larger for reported issues
        'In Progress': 28,
        'Resolved': 24,
      }

      issues.forEach((issue, index) => {
        const size = statusSizes[issue.status]
        const issueIcon = L.icon({
          iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${statusColors[issue.status]}" stroke="white" stroke-width="2"/>
              <path d="M${size/2 - 4} ${size/2 - 6} L${size/2 + 4} ${size/2 - 6} L${size/2 + 4} ${size/2 + 6} L${size/2 - 4} ${size/2 + 6} Z" fill="white"/>
            </svg>
          `)}`,
          iconSize: [size, size],
          iconAnchor: [size/2, size],
        })

        const marker = L.marker([issue.location.lat, issue.location.lng], { 
          icon: issueIcon,
          title: issue.title
        }).addTo(map)

        // Create enhanced popup content
        const priorityColors = {
          'High': '#dc2626',
          'Medium': '#d97706',
          'Low': '#059669',
        }

        const popupContent = `
          <div style="padding: 20px; min-width: 320px; max-width: 400px;">
            <div style="margin-bottom: 16px;">
              <h3 style="font-weight: 700; color: #1f2937; font-size: 20px; line-height: 1.2; margin: 0 0 8px 0;">${issue.title}</h3>
              <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.5;">${issue.description || ''}</p>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
              <span style="padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 6px; background-color: ${issue.status === 'Reported' ? '#fef2f2' : issue.status === 'In Progress' ? '#fffbeb' : '#f0fdf4'}; color: ${issue.status === 'Reported' ? '#dc2626' : issue.status === 'In Progress' ? '#d97706' : '#059669'}; border: 1px solid ${issue.status === 'Reported' ? '#fecaca' : issue.status === 'In Progress' ? '#fed7aa' : '#bbf7d0'};">${issue.status}</span>
              <span style="padding: 6px 12px; font-size: 12px; border-radius: 6px; border: 1px solid #d1d5db; color: #374151; background: #f9fafb;">${issue.category}</span>
              ${issue.priority ? `<span style="padding: 6px 12px; font-size: 12px; border-radius: 6px; background-color: ${priorityColors[issue.priority]}; color: white; font-weight: 600;">${issue.priority} Priority</span>` : ''}
            </div>
            <div style="display: flex; justify-between; align-items: center; margin-bottom: 16px; padding: 8px 12px; background: #f9fafb; border-radius: 6px;">
              <span style="font-size: 12px; color: #6b7280;">Votes: ${issue.votes || 0}</span>
              <span style="font-size: 12px; color: #6b7280;">ID: ${issue.id}</span>
            </div>
            <div style="padding-top: 8px;">
              <a href="/issue/${issue.id}" style="display: block; width: 100%; background-color: #3b82f6; color: white; padding: 12px 16px; border-radius: 8px; text-decoration: none; text-align: center; font-size: 14px; font-weight: 600; transition: background-color 0.2s;">View Details</a>
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
  }, [userLocation, issues, onMarkerClick, cleanupMap, locationAccuracy, locationSource])

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
      <div className="absolute top-4 right-4 z-[1000] space-y-3">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-800">
          <div className="text-sm font-medium text-gray-300 mb-1">
            Issues Found
          </div>
          <div className="text-3xl font-bold text-white">
            {issues.length}
          </div>
          <div className="text-xs text-gray-400">
            of {totalIssues} total
          </div>
        </div>
        
        {/* Location Accuracy Info */}
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-800">
          <div className="text-sm font-medium text-gray-300 mb-1">
            Location
          </div>
          <div className="text-xs text-gray-400 mb-1">
            {locationSource}
          </div>
          {locationAccuracy && (
            <div className="text-xs text-gray-400 font-medium">
              ±{Math.round(locationAccuracy)}m
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-800">
        <div className="text-sm font-semibold text-white mb-3">Legend</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md"></div>
            <span className="text-gray-300 font-medium">Reported (Large)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 border-2 border-white shadow-md"></div>
            <span className="text-gray-300 font-medium">In Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
            <span className="text-gray-300 font-medium">Resolved</span>
          </div>
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-700">
            <div className="w-5 h-5 rounded-full bg-blue-500 border-3 border-white shadow-lg"></div>
            <span className="text-gray-300 font-medium">Your Location</span>
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