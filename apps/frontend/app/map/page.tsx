"use client"

import { useState, useEffect } from "react"
import { IssueMap } from "@/components/map/issue-map"
import { Issue, Location } from "@/types/map"
import { Loader2, MapPin, AlertCircle, Navigation, Filter, Info, Search, X, Settings, Plus, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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

function MapPageContent() {
  const { user, logout, isAdmin } = useAuth()
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [demoIssues, setDemoIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationSource, setLocationSource] = useState<string>("")
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDistance, setSelectedDistance] = useState("all")

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleReportIssue = () => {
    router.push('/report')
  }

  const handleAdminPanel = () => {
    router.push('/admin')
  }

  const handleMyIssues = () => {
    router.push('/my-issues')
  }

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
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <Navigation className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Getting Your Location</h2>
          <p className="text-gray-400 text-sm">Please allow location access for accurate results</p>
        </div>
      </div>
    )
  }

  if (error && !userLocation) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-red-400 text-2xl font-semibold mb-4">Location Error</h2>
            <p className="text-gray-300 mb-6 text-lg">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!userLocation) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-white text-xl font-semibold">Unable to determine your location</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black flex">
      {/* Left Panel - Search & Filters */}
      <div className="w-1/2 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">Community Issues</h1>
                <p className="text-gray-400 text-sm">Find and report local issues</p>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReportIssue}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
              
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                >
                  <User className="w-4 h-4" />
                </Button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm text-gray-300 border-b border-gray-700">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMyIssues}
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      My Issues
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAdminPanel}
                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        Admin Panel
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h2 className="text-white font-semibold">Filters</h2>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Reported">Reported</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Roads & Infrastructure">Roads & Infrastructure</SelectItem>
                <SelectItem value="Water & Utilities">Water & Utilities</SelectItem>
                <SelectItem value="Lighting">Lighting</SelectItem>
                <SelectItem value="Waste Management">Waste Management</SelectItem>
                <SelectItem value="Parks & Environment">Parks & Environment</SelectItem>
                <SelectItem value="Safety & Security">Safety & Security</SelectItem>
                <SelectItem value="Public Buildings">Public Buildings</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Distance</label>
            <Select value={selectedDistance} onValueChange={setSelectedDistance}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Distances</SelectItem>
                <SelectItem value="1km">Within 1km</SelectItem>
                <SelectItem value="3km">Within 3km</SelectItem>
                <SelectItem value="5km">Within 5km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(selectedStatus !== "all" || selectedCategory !== "all" || selectedDistance !== "all" || searchQuery) && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStatus("all")
                setSelectedCategory("all")
                setSelectedDistance("all")
                setSearchQuery("")
              }}
              className="w-full bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Active Filters */}
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {selectedStatus !== "all" && (
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {selectedStatus}
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                {selectedCategory}
              </Badge>
            )}
            {selectedDistance !== "all" && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {selectedDistance}
              </Badge>
            )}
            {searchQuery && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                Search: {searchQuery}
              </Badge>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="mt-auto p-6 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Location Info</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Source:</span>
              <span className="text-white font-medium">{locationSource}</span>
            </div>
            {locationAccuracy && (
              <div className="flex justify-between">
                <span className="text-gray-400">Accuracy:</span>
                <span className="text-white font-medium">±{Math.round(locationAccuracy)}m</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Issues Found:</span>
              <span className="text-white font-medium">{demoIssues.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="w-1/2 relative">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-yellow-300 text-sm font-medium">{error}</p>
                <p className="text-yellow-400 text-xs">Location: {locationSource}</p>
              </div>
            </div>
          </div>
        )}
        
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

export default function MapPage() {
  return (
    <ProtectedRoute>
      <MapPageContent />
    </ProtectedRoute>
  )
}
