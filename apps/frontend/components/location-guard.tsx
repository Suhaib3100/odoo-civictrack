"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  MapPin, 
  Navigation, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  Settings,
  Lock
} from "lucide-react"
import { motion } from "framer-motion"
import {
  getCurrentLocation,
  checkLocationPermission,
  getUserLocation,
  saveUserLocation,
  clearUserLocation,
  RADIUS_OPTIONS,
  type UserLocation,
  type RadiusOption
} from "@/lib/location"

interface LocationGuardProps {
  children: React.ReactNode
  requiredForAccess?: boolean
}

export function LocationGuard({ children, requiredForAccess = true }: LocationGuardProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [selectedRadius, setSelectedRadius] = useState<RadiusOption>(5)
  const [manualAddress, setManualAddress] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeLocation()
  }, [])

  const initializeLocation = async () => {
    setIsLoading(true)
    
    // Check if user has saved location
    const savedLocation = getUserLocation()
    if (savedLocation) {
      setUserLocation(savedLocation)
      setIsLoading(false)
      return
    }

    // Try to get GPS location
    try {
      const permission = await checkLocationPermission()
      if (permission.granted) {
        const location = await getCurrentLocation()
        if (location) {
          setUserLocation(location)
          saveUserLocation(location)
        } else {
          setShowSetup(true)
        }
      } else {
        setShowSetup(true)
      }
    } catch (err) {
      setShowSetup(true)
    }
    
    setIsLoading(false)
  }

  const handleGetGPSLocation = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const location = await getCurrentLocation()
      if (location) {
        // Auto-fetch address details using reverse geocoding (mock implementation)
        const address = await reverseGeocode(location.latitude, location.longitude)
        const enhancedLocation = {
          ...location,
          address: address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        }
        
        setUserLocation(enhancedLocation)
        saveUserLocation(enhancedLocation)
        setShowSetup(false)
      } else {
        setError("Unable to get GPS location. Please enable location services or enter manually.")
      }
    } catch (err) {
      setError("GPS location failed. Please try manual entry.")
    }
    
    setIsLoading(false)
  }

  // Mock reverse geocoding function (in production, use a real service like Google Maps API)
  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Mock implementation - in production, use actual geocoding service
      const mockAddresses = [
        "Satellite, Ahmedabad, Gujarat",
        "Vastrapur, Ahmedabad, Gujarat",
        "Bodakdev, Ahmedabad, Gujarat",
        "SG Highway, Ahmedabad, Gujarat",
        "Prahlad Nagar, Ahmedabad, Gujarat"
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return a mock address based on coordinates
      const index = Math.floor((lat + lng) * 1000) % mockAddresses.length
      return mockAddresses[index]
    } catch {
      return null
    }
  }

  const handleManualLocation = async () => {
    if (!manualAddress.trim()) {
      setError("Please enter your address")
      return
    }

    setIsLoading(true)
    setError(null)

    // For demo purposes, we'll use mock coordinates
    // In production, you'd use a geocoding service
    const mockLocation: UserLocation = {
      latitude: 23.0225 + (Math.random() - 0.5) * 0.1, // Ahmedabad area
      longitude: 72.5714 + (Math.random() - 0.5) * 0.1,
      address: manualAddress,
      isManual: true
    }

    setUserLocation(mockLocation)
    saveUserLocation(mockLocation)
    setShowSetup(false)
    setIsLoading(false)
  }

  const handleClearLocation = () => {
    clearUserLocation()
    setUserLocation(null)
    setShowSetup(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-sm">Setting up your neighborhood...</p>
        </div>
      </div>
    )
  }

  if (showSetup || (!userLocation && requiredForAccess)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/[0.02] border border-white/10 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">
                Neighborhood Access Required
              </CardTitle>
              <p className="text-gray-400 text-sm leading-relaxed">
                For your safety and community focus, you can only view and interact with civic issues within your local neighborhood (3-5 km radius).
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* GPS Location Option */}
              <div className="space-y-3">
                <Button
                  onClick={handleGetGPSLocation}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {isLoading ? "Getting Location..." : "Use GPS Location"}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Recommended for accurate neighborhood detection
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs text-gray-500">OR</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Manual Location Option */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="address" className="text-white text-sm mb-2 block">
                    Enter Your Address
                  </Label>
                  <Input
                    id="address"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="e.g., Satellite, Ahmedabad"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <Button
                  onClick={handleManualLocation}
                  disabled={isLoading || !manualAddress.trim()}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/5"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Set Manual Location
                </Button>
              </div>

              {/* Radius Selection */}
              <div className="space-y-3">
                <Label className="text-white text-sm">Neighborhood Radius</Label>
                <div className="grid grid-cols-3 gap-2">
                  {RADIUS_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedRadius === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRadius(option.value)}
                      className={
                        selectedRadius === option.value
                          ? "bg-white text-black"
                          : "border-white/20 text-white hover:bg-white/5"
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-400 leading-relaxed">
                    <strong className="text-white">Privacy Protected:</strong> Your location is stored locally and only used to filter neighborhood issues. We don't share or track your location data.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Show location status if user has location set
  return (
    <div className="relative">
      {userLocation && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-black/80 border border-white/20 rounded-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">
                {selectedRadius} km neighborhood
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearLocation}
              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </motion.div>
        </div>
      )}
      {children}
    </div>
  )
}

// Component to show when access is denied
export function AccessDeniedMessage({ 
  reason, 
  distance, 
  onLocationSetup 
}: { 
  reason: string
  distance?: number
  onLocationSetup: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-black flex items-center justify-center p-4"
    >
      <Card className="bg-white/[0.02] border border-red-500/20 backdrop-blur-sm max-w-md w-full">
        <CardContent className="text-center p-8">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-4">
            Access Restricted
          </h3>
          
          <p className="text-gray-400 mb-6 leading-relaxed">
            {reason}
          </p>
          
          {distance && (
            <Badge className="bg-red-500/10 text-red-300 border-red-500/20 mb-6">
              {distance} km away from your neighborhood
            </Badge>
          )}
          
          <div className="space-y-3">
            <Button
              onClick={onLocationSetup}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Update Location Settings
            </Button>
            
            <p className="text-xs text-gray-500">
              Only issues in your 3-5 km neighborhood are accessible for community safety
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
