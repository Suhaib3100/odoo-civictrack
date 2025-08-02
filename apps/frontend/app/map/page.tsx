"use client"

import { useState, useEffect } from "react"
import { IssueMap } from "@/components/map/issue-map"
import { Issue, Location } from "@/types/map"
import { Loader2, MapPin, AlertCircle, Navigation, Filter, Info, Search, X, Settings, Plus, LogOut, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
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
      <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-400/30 border-t-transparent rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
            <Navigation className="w-10 h-10 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Locating Your Area
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            We're pinpointing your location to show you the most relevant community issues
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !userLocation) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-10 backdrop-blur-sm">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-red-400/10 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-red-400 text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Location Unavailable
            </h2>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
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
      <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gray-400/10 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-white text-3xl font-bold mb-4 bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
            Location Not Found
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            We couldn't determine your location. Please check your browser settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black flex overflow-hidden">
      {/* Left Panel - Search & Filters */}
      <div className="w-1/2 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-sm border-r border-gray-800/50 flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-black/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Navigation className="w-7 h-7 text-white" />
                </div>
                <div className="absolute inset-0 w-12 h-12 bg-blue-400/20 rounded-xl animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Community Issues
                </h1>
                <p className="text-gray-400 text-sm font-medium">Discover and report local problems</p>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleReportIssue}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
              
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-gray-700/50 transition-all duration-300"
                >
                  <User className="w-5 h-5 text-gray-300" />
                </Button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-14 w-56 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4 border-b border-gray-700/50">
                    <p className="text-white font-semibold text-sm">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}</p>
                    <p className="text-gray-400 text-xs mt-1">{user?.email}</p>
                  </div>
                  <div className="p-3 space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMyIssues}
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      My Issues
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAdminPanel}
                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Admin Panel
                      </Button>
                    )}
                    <div className="border-t border-gray-700/50 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search for issues, categories, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:bg-gray-800/70 rounded-xl transition-all duration-300 text-lg"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-white text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Filters & Options
            </h2>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Issue Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 text-white rounded-xl py-3 hover:border-blue-500/50 transition-all duration-300">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl">
                <SelectItem value="all" className="text-white hover:bg-gray-700/50">All Status</SelectItem>
                <SelectItem value="Reported" className="text-white hover:bg-gray-700/50">Reported</SelectItem>
                <SelectItem value="In Progress" className="text-white hover:bg-gray-700/50">In Progress</SelectItem>
                <SelectItem value="Resolved" className="text-white hover:bg-gray-700/50">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Issue Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 text-white rounded-xl py-3 hover:border-purple-500/50 transition-all duration-300">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl">
                <SelectItem value="all" className="text-white hover:bg-gray-700/50">All Categories</SelectItem>
                <SelectItem value="Roads & Infrastructure" className="text-white hover:bg-gray-700/50">Roads & Infrastructure</SelectItem>
                <SelectItem value="Water & Utilities" className="text-white hover:bg-gray-700/50">Water & Utilities</SelectItem>
                <SelectItem value="Lighting" className="text-white hover:bg-gray-700/50">Lighting</SelectItem>
                <SelectItem value="Waste Management" className="text-white hover:bg-gray-700/50">Waste Management</SelectItem>
                <SelectItem value="Parks & Environment" className="text-white hover:bg-gray-700/50">Parks & Environment</SelectItem>
                <SelectItem value="Safety & Security" className="text-white hover:bg-gray-700/50">Safety & Security</SelectItem>
                <SelectItem value="Public Buildings" className="text-white hover:bg-gray-700/50">Public Buildings</SelectItem>
                <SelectItem value="Transportation" className="text-white hover:bg-gray-700/50">Transportation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Distance Range</label>
            <Select value={selectedDistance} onValueChange={setSelectedDistance}>
              <SelectTrigger className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 text-white rounded-xl py-3 hover:border-green-500/50 transition-all duration-300">
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl">
                <SelectItem value="all" className="text-white hover:bg-gray-700/50">All Distances</SelectItem>
                <SelectItem value="1km" className="text-white hover:bg-gray-700/50">Within 1km</SelectItem>
                <SelectItem value="3km" className="text-white hover:bg-gray-700/50">Within 3km</SelectItem>
                <SelectItem value="5km" className="text-white hover:bg-gray-700/50">Within 5km</SelectItem>
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
              className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:border-red-500/50 rounded-xl py-3 transition-all duration-300 font-semibold"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Active Filters */}
        <div className="px-8 pb-6">
          <div className="flex flex-wrap gap-3">
            {selectedStatus !== "all" && (
              <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30 px-3 py-1 rounded-full font-medium">
                {selectedStatus}
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-500/30 px-3 py-1 rounded-full font-medium">
                {selectedCategory}
              </Badge>
            )}
            {selectedDistance !== "all" && (
              <Badge className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border-purple-500/30 px-3 py-1 rounded-full font-medium">
                {selectedDistance}
              </Badge>
            )}
            {searchQuery && (
              <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1 rounded-full font-medium">
                Search: {searchQuery}
              </Badge>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="mt-auto p-8 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/30 to-black/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Location Details</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg border border-gray-700/30">
              <span className="text-gray-400 font-medium">Source:</span>
              <span className="text-white font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {locationSource}
              </span>
            </div>
            {locationAccuracy && (
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg border border-gray-700/30">
                <span className="text-gray-400 font-medium">Accuracy:</span>
                <span className="text-white font-semibold">±{Math.round(locationAccuracy)}m</span>
              </div>
            )}
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg border border-gray-700/30">
              <span className="text-gray-400 font-medium">Issues Found:</span>
              <span className="text-white font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                {demoIssues.length}
              </span>
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