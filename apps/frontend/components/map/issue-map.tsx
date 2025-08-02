"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { getDistance } from "geolib"
import { Issue, FilterOptions, Location } from "@/types/map"
import { Loader2 } from "lucide-react"

const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Loading map...</p>
      </div>
    </div>
  ),
})

interface IssueMapProps {
  issues: Issue[]
  userLocation: Location
  locationAccuracy?: number | null
  locationSource?: string
}

export function IssueMap({ issues, userLocation, locationAccuracy, locationSource }: IssueMapProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleMarkerClick = (issue: Issue) => {
    setSelectedIssue(issue)
  }

  return (
    <div className="h-full bg-black">
      {isClient ? (
        <MapComponent
          issues={issues}
          userLocation={userLocation}
          onMarkerClick={handleMarkerClick}
          totalIssues={issues.length}
          locationAccuracy={locationAccuracy}
          locationSource={locationSource}
        />
      ) : (
        <div className="h-full bg-black flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
} 