"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Navigation, 
  Shield, 
  CheckCircle, 
  Loader2, 
  Map, 
  Users, 
  Heart, 
  Star, 
  Zap, 
  Lock, 
  Globe, 
  Smartphone,
  ArrowRight,
  Eye,
  Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LocationGuardProps {
  children: React.ReactNode
  requiredForAccess?: boolean
}

export function LocationGuard({ children, requiredForAccess = false }: LocationGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasLocation, setHasLocation] = useState(false)
  const [showPermissionScreen, setShowPermissionScreen] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    // Check if user already has location saved
    const savedLocation = localStorage.getItem('civictrack-location')
    if (savedLocation) {
      setHasLocation(true)
      setIsLoading(false)
    } else {
      setShowPermissionScreen(true)
      setIsLoading(false)
    }
  }, [])

  const handleGetLocation = async () => {
    setIsGettingLocation(true)
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: address || 'Current Location',
          timestamp: Date.now()
        }
        
        localStorage.setItem('civictrack-location', JSON.stringify(location))
        setHasLocation(true)
        setShowPermissionScreen(false)
        setIsGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please check your browser settings.')
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const handleManualLocation = () => {
    if (!address.trim()) {
      alert('Please enter your address')
      return
    }

    const location = {
      latitude: 0, // We'll use a default or geocode this in a real app
      longitude: 0,
      address: address.trim(),
      timestamp: Date.now(),
      manual: true
    }
    
    localStorage.setItem('civictrack-location', JSON.stringify(location))
    setHasLocation(true)
    setShowPermissionScreen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    )
  }

  if (showPermissionScreen && (!hasLocation || requiredForAccess)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <MapPin className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Welcome to CivicTrack
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-sm leading-relaxed"
                >
                  To show you relevant civic issues in your neighborhood, we need to know your location.
                </motion.p>
              </div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 mb-8"
              >
                {[
                  { icon: Shield, text: "Your privacy is protected", color: "text-green-400" },
                  { icon: Users, text: "Connect with your community", color: "text-blue-400" },
                  { icon: Target, text: "See issues within 5km radius", color: "text-purple-400" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    <span className="text-gray-300 text-sm">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Location Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="space-y-4 mb-6"
              >
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Enter your address (optional)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-white/15 transition-all"
                  />
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Use My Current Location
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleManualLocation}
                  variant="outline"
                  className="w-full border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Continue with Address
                </Button>
              </motion.div>

              {/* Privacy Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-300 font-medium mb-1">Privacy First</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Your location is stored locally on your device and used only to show relevant community issues. We never share your location data.
                    </p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
