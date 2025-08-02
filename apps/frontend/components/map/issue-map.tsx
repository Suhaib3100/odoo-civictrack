"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { getDistance } from "geolib"
import { FilterBar } from "./filter-bar"
import { Issue, FilterOptions, Location } from "@/types/map"
import { MapPin, Navigation } from "lucide-react"

// Dynamically import the entire map component to avoid SSR issues
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading map...</p>
      </div>
    </div>
  ),
})

interface IssueMapProps {
  issues: Issue[]
  userLocation: Location
}

export function IssueMap({ issues, userLocation }: IssueMapProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    category: 'all',
    distance: 'all'
  })

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  // Get unique categories from issues
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(issues.map(issue => issue.category))]
    return uniqueCategories.sort()
  }, [issues])

  // Filter issues based on current filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Status filter
      if (filters.status !== 'all' && issue.status !== filters.status) {
        return false
      }

      // Category filter
      if (filters.category !== 'all' && issue.category !== filters.category) {
        return false
      }

      // Distance filter
      if (filters.distance !== 'all') {
        const distanceInMeters = getDistance(
          { latitude: userLocation.lat, longitude: userLocation.lng },
          { latitude: issue.location.lat, longitude: issue.location.lng }
        )
        
        const maxDistance = filters.distance === '1km' ? 1000 : 
                           filters.distance === '3km' ? 3000 : 
                           filters.distance === '5km' ? 5000 : Infinity
        
        if (distanceInMeters > maxDistance) {
          return false
        }
      }

      return true
    })
  }, [issues, filters, userLocation])

  const handleMarkerClick = (issue: Issue) => {
    setSelectedIssue(issue)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  return (
    <div className="h-screen bg-black">
      {/* Filter Bar */}
      <FilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
      />

      {/* Map Component */}
      <MapComponent 
        issues={filteredIssues}
        userLocation={userLocation}
        onMarkerClick={handleMarkerClick}
        totalIssues={issues.length}
      />
    </div>
  )
} 