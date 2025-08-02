"use client"

import { useEffect, useRef } from "react"
import { Marker, Popup } from "react-leaflet"
import { Icon } from "leaflet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Eye, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { MapMarkerProps } from "@/types/map"
import Link from "next/link"

// Custom marker icons
const createCustomIcon = (color: string) => {
  if (typeof window === "undefined") return null
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  })
}

const statusIcons = {
  'Reported': AlertTriangle,
  'In Progress': Clock,
  'Resolved': CheckCircle,
}

const statusColors = {
  'Reported': '#ef4444',
  'In Progress': '#f59e0b',
  'Resolved': '#10b981',
}

export function MapMarker({ issue, userLocation, onMarkerClick }: MapMarkerProps) {
  const markerRef = useRef<any>(null)
  const iconColor = statusColors[issue.status]
  const StatusIcon = statusIcons[issue.status]

  useEffect(() => {
    if (markerRef.current && typeof window !== "undefined") {
      const icon = createCustomIcon(iconColor)
      if (icon) {
        markerRef.current.setIcon(icon)
      }
    }
  }, [iconColor])

  const handleMarkerClick = () => {
    onMarkerClick(issue)
  }

  // Don't render if not on client
  if (typeof window === "undefined") {
    return null
  }

  return (
    <Marker
      ref={markerRef}
      position={[issue.location.lat, issue.location.lng]}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup className="custom-popup">
        <div className="p-4 space-y-3 min-w-[280px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {issue.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {issue.description}
              </p>
            </div>
          </div>

          {/* Status and Category */}
          <div className="flex items-center gap-2">
            <Badge 
              className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium ${
                issue.status === 'Reported' 
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : issue.status === 'In Progress'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-green-100 text-green-700 border-green-200'
              }`}
            >
              <StatusIcon className="w-3 h-3" />
              {issue.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {issue.category}
            </Badge>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-sm text-gray-600">
            {issue.reportedBy && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Reported by:</span>
                <span>{issue.reportedBy}</span>
              </div>
            )}
            {issue.reportedAt && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Date:</span>
                <span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
              </div>
            )}
            {issue.priority && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Priority:</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    issue.priority === 'High' 
                      ? 'border-red-300 text-red-700'
                      : issue.priority === 'Medium'
                        ? 'border-yellow-300 text-yellow-700'
                        : 'border-green-300 text-green-700'
                  }`}
                >
                  {issue.priority}
                </Badge>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button asChild className="w-full">
              <Link href={`/issue/${issue.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  )
} 