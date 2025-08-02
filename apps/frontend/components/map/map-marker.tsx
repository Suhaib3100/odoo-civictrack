"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Eye, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { MapMarkerProps } from "@/types/map"
import Link from "next/link"

// This component is now unused since we're using vanilla Leaflet
// Keeping it for potential future use
export function MapMarker({ issue, userLocation, onMarkerClick }: MapMarkerProps) {
  const markerRef = useRef<any>(null)

  const handleMarkerClick = () => {
    onMarkerClick(issue)
  }

  // Don't render if not on client
  if (typeof window === "undefined") {
    return null
  }

  return (
    <div className="hidden">
      {/* This component is not used in the current implementation */}
      {/* We're using vanilla Leaflet markers instead */}
    </div>
  )
} 