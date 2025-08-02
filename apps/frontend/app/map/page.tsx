"use client"

import { useState, useEffect } from "react"
import { IssueMap } from "@/components/map/issue-map"
import { Issue, Location } from "@/types/map"
import { Loader2 } from "lucide-react"

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

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Unable to get your location. Please enable location services.")
          // Fallback to a default location (New York City)
          setUserLocation({ lat: 40.7128, lng: -74.0060 })
          setIsLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      )
    } else {
      setError("Geolocation is not supported by this browser.")
      // Fallback to a default location
      setUserLocation({ lat: 40.7128, lng: -74.0060 })
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Getting your location...</p>
          <p className="text-gray-400 text-sm mt-2">Please allow location access</p>
        </div>
      </div>
    )
  }

  if (error && !userLocation) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
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
          <p className="text-white text-lg">Unable to determine your location</p>
        </div>
      </div>
    )
  }

  return <IssueMap issues={mockIssues} userLocation={userLocation} />
}
