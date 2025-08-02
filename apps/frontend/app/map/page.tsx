"use client"

import { useState, useEffect } from "react"
import { IssueMap } from "@/components/map/issue-map"
import { Issue, Location } from "@/types/map"
import { Loader2, MapPin, AlertCircle, Navigation, Filter, Info } from "lucide-react"

// Function to generate demo issues around a specific location
const generateDemoIssues = (centerLocation: Location): Issue[] => {
  const categories = [
    "Roads & Infrastructure",
    "Water & Utilities", 
    "Lighting",
    "Waste Management",
    "Parks & Environment",
    "Safety & Security",
    "Public Buildings",
    "Transportation"
  ]
  
  const statuses: Array<'Reported' | 'In Progress' | 'Resolved'> = ['Reported', 'In Progress', 'Resolved']
  
  const issueTitles = [
    "Large pothole on main road",
    "Broken streetlight",
    "Garbage not collected",
    "Water leak from pipe",
    "Damaged playground equipment",
    "Missing stop sign",
    "Graffiti on building",
    "Blocked storm drain",
    "Broken bench in park",
    "Damaged sidewalk",
    "Street sign knocked down",
    "Overflowing trash bin",
    "Broken water fountain",
    "Damaged bus stop",
    "Tree branches blocking path"
  ]

  const issues: Issue[] = []
  
  // Generate 8-10 issues within 1km radius for better visibility
  for (let i = 0; i < 10; i++) {
    // Generate random offset within 1km (0.01 degrees ≈ 1km)
    const latOffset = (Math.random() - 0.5) * 0.01
    const lngOffset = (Math.random() - 0.5) * 0.01
    
    const location = {
      lat: centerLocation.lat + latOffset,
      lng: centerLocation.lng + lngOffset
    }
    
    issues.push({
      id: `demo-${i + 1}`,
      title: issueTitles[i % issueTitles.length],
      category: categories[i % categories.length],
      status: statuses[i % statuses.length],
      location,
      description: `Demo issue ${i + 1} - This is a sample issue for demonstration purposes.`,
      reportedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      reportedBy: `user${i + 1}@demo.com`,
      priority: ['Low', 'Medium', 'High'][i % 3] as 'Low' | 'Medium' | 'High',
      votes: Math.floor(Math.random() * 50) + 1,
    })
  }
  
  return issues
}

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
  const [demoIssues, setDemoIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationSource, setLocationSource] = useState<string>("")
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if geolocation is supported
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by this browser.")
        }

        // Get user's current location with maximum accuracy
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true, // Request highest accuracy
              timeout: 20000, // 20 seconds timeout
              maximumAge: 60000, // Accept cached position up to 1 minute old
            }
          )
        })

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        console.log("GPS Location obtained:", location)
        console.log("Accuracy:", position.coords.accuracy, "meters")

        setUserLocation(location)
        setLocationSource("GPS")
        setLocationAccuracy(position.coords.accuracy)
        
        // Generate demo issues around the user's location
        const issues = generateDemoIssues(location)
        setDemoIssues(issues)
        
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
            console.log("IP Location obtained:", location)
            
            setUserLocation(location)
            setLocationSource("IP Address")
            setLocationAccuracy(5000) // IP location is typically accurate to ~5km
            
            // Generate demo issues around IP location
            const issues = generateDemoIssues(location)
            setDemoIssues(issues)
            
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

        console.log("Using default location:", defaultLocation)
        
        setUserLocation(defaultLocation)
        setLocationSource("Default")
        setLocationAccuracy(null) // No accuracy info for default location
        
        // Generate demo issues around default location
        const issues = generateDemoIssues(defaultLocation)
        setDemoIssues(issues)
        
        setError(`Unable to get your exact location. Showing ${timezone.includes("America") ? "New York" : timezone.includes("Europe") ? "London" : "Bangalore"} area.`)
        setIsLoading(false)
      }
    }

    getLocation()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <Navigation className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Getting Your Location</h2>
          <p className="text-gray-300 text-sm">Please allow location access for accurate results</p>
        </div>
      </div>
    )
  }

  if (error && !userLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 backdrop-blur-sm">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-red-400 text-2xl font-semibold mb-4">Location Error</h2>
            <p className="text-gray-300 mb-6 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-white text-xl font-semibold">Unable to determine your location</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Community Issues Map</h1>
              <p className="text-gray-300 text-sm">Find and report local issues</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
              <Filter className="w-4 h-4 inline mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 right-6 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Map Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Location Source:</span>
              <span className="font-medium">{locationSource}</span>
            </div>
            {locationAccuracy && (
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-medium">±{Math.round(locationAccuracy)}m</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Issues Found:</span>
              <span className="font-medium">{demoIssues.length}</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                Blue marker shows your location. Colored markers show reported issues in your area.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="absolute top-24 left-6 right-6 z-20 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-300 text-sm font-medium">{error}</p>
              <p className="text-yellow-400 text-xs">Location: {locationSource}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Container - Half Screen */}
      <div className="relative h-[calc(100vh-120px)]">
        <IssueMap 
          issues={demoIssues} 
          userLocation={userLocation}
          locationAccuracy={locationAccuracy}
          locationSource={locationSource}
        />
      </div>
    </div>
  )
}
