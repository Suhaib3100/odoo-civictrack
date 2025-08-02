"use client"

import { useState, useEffect } from "react"
import { IssueMap } from "@/components/map/issue-map"
import { Issue, Location } from "@/types/map"
import { Loader2, MapPin, AlertCircle } from "lucide-react"

// Mock data for demonstration
const mockIssues: Issue[] = [
  {
    id: "1",
    title: "Large pothole on Main Street",
    category: "Roads",
    status: "Reported",
    location: { lat: 40.7128, lng: -74.0060 },
    description: "Deep pothole causing traffic delays and vehicle damage",
    reportedAt: "2024-01-15T10:30:00Z",
    reportedBy: "john.doe@email.com",
    priority: "High",
    votes: 24,
  },
  {
    id: "2",
    title: "Broken streetlight on Oak Avenue",
    category: "Lighting",
    status: "In Progress",
    location: { lat: 40.7135, lng: -74.0055 },
    description: "Streetlight not working for past 3 days",
    reportedAt: "2024-01-15T08:15:00Z",
    reportedBy: "mary.smith@email.com",
    priority: "Medium",
    votes: 18,
  },
  {
    id: "3",
    title: "Garbage not collected on Elm Street",
    category: "Waste",
    status: "Resolved",
    location: { lat: 40.7140, lng: -74.0065 },
    description: "Garbage collection missed for 2 weeks",
    reportedAt: "2024-01-14T16:45:00Z",
    reportedBy: "jane.wilson@email.com",
    priority: "Low",
    votes: 12,
  },
  {
    id: "4",
    title: "Water leak on Pine Street",
    category: "Water & Utilities",
    status: "Reported",
    location: { lat: 40.7120, lng: -74.0070 },
    description: "Continuous water leak from underground pipe",
    reportedAt: "2024-01-15T12:00:00Z",
    reportedBy: "david.brown@email.com",
    priority: "High",
    votes: 15,
  },
  {
    id: "5",
    title: "Damaged playground equipment",
    category: "Parks & Environment",
    status: "In Progress",
    location: { lat: 40.7130, lng: -74.0045 },
    description: "Swing set chains are broken and pose safety risk",
    reportedAt: "2024-01-15T09:30:00Z",
    reportedBy: "lisa.garcia@email.com",
    priority: "Medium",
    votes: 8,
  },
  {
    id: "6",
    title: "Missing stop sign at intersection",
    category: "Safety & Security",
    status: "Reported",
    location: { lat: 40.7145, lng: -74.0050 },
    description: "Stop sign was knocked down during recent storm",
    reportedAt: "2024-01-15T11:45:00Z",
    reportedBy: "tom.lee@email.com",
    priority: "High",
    votes: 22,
  },
  {
    id: "7",
    title: "Graffiti on public building",
    category: "Public Buildings",
    status: "Reported",
    location: { lat: 40.7125, lng: -74.0080 },
    description: "Large graffiti tags appeared on community center",
    reportedAt: "2024-01-15T07:20:00Z",
    reportedBy: "emma.davis@email.com",
    priority: "Low",
    votes: 5,
  },
  {
    id: "8",
    title: "Blocked storm drain",
    category: "Water & Utilities",
    status: "In Progress",
    location: { lat: 40.7138, lng: -74.0075 },
    description: "Storm drain is completely blocked with debris",
    reportedAt: "2024-01-15T06:15:00Z",
    reportedBy: "chris.parker@email.com",
    priority: "High",
    votes: 19,
  },
]

// Default locations for different regions
const defaultLocations = {
  newYork: { lat: 40.7128, lng: -74.0060 },
  london: { lat: 51.5074, lng: -0.1278 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
}

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationSource, setLocationSource] = useState<string>("")

  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if geolocation is supported
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by this browser.")
        }

        // Get user's current location with better options
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 15000, // 15 seconds
              maximumAge: 300000, // 5 minutes
            }
          )
        })

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setUserLocation(location)
        setLocationSource("GPS")
        setIsLoading(false)
      } catch (error: any) {
        console.error("Error getting location:", error)
        
        // Try to get location from IP address as fallback
        try {
          const ipResponse = await fetch("https://ipapi.co/json/")
          const ipData = await ipResponse.json()
          
          if (ipData.latitude && ipData.longitude) {
            const location = {
              lat: parseFloat(ipData.latitude),
              lng: parseFloat(ipData.longitude),
            }
            setUserLocation(location)
            setLocationSource("IP Address")
            setIsLoading(false)
            return
          }
        } catch (ipError) {
          console.error("Error getting IP location:", ipError)
        }

        // Use default location based on timezone or region
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        let defaultLocation: Location

        if (timezone.includes("America")) {
          defaultLocation = defaultLocations.newYork
        } else if (timezone.includes("Europe")) {
          defaultLocation = defaultLocations.london
        } else if (timezone.includes("Asia")) {
          defaultLocation = defaultLocations.bangalore
        } else {
          defaultLocation = defaultLocations.newYork
        }

        setUserLocation(defaultLocation)
        setLocationSource("Default")
        setError(`Unable to get your exact location. Showing ${timezone.includes("America") ? "New York" : timezone.includes("Europe") ? "London" : "Bangalore"} area.`)
        setIsLoading(false)
      }
    }

    getLocation()
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Getting your location...</p>
          <p className="text-gray-400 text-sm">Please allow location access for better experience</p>
        </div>
      </div>
    )
  }

  if (error && !userLocation) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-red-400 text-xl font-semibold mb-2">Location Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!userLocation) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white text-lg">Unable to determine your location</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-[1001] bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 text-sm">{error}</span>
            <span className="text-yellow-400 text-xs">(Location: {locationSource})</span>
          </div>
        </div>
      )}
      <IssueMap issues={mockIssues} userLocation={userLocation} />
    </div>
  )
}
