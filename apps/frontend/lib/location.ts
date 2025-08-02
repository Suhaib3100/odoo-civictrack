/**
 * Location Service for Neighborhood-Based Issue Filtering
 * Only shows civic issues within 3-5 km radius of user's location
 */

export interface UserLocation {
  latitude: number
  longitude: number
  address?: string
  isManual?: boolean
}

export interface LocationPermission {
  granted: boolean
  error?: string
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

/**
 * Get user's current GPS location
 */
export async function getCurrentLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isManual: false
        })
      },
      (error) => {
        console.error('GPS location error:', error)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

/**
 * Check if location permission is granted
 */
export async function checkLocationPermission(): Promise<LocationPermission> {
  if (!navigator.permissions) {
    return { granted: false, error: 'Permissions API not supported' }
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' })
    return {
      granted: permission.state === 'granted',
      error: permission.state === 'denied' ? 'Location permission denied' : undefined
    }
  } catch (error) {
    return { granted: false, error: 'Failed to check location permission' }
  }
}

/**
 * Filter issues within neighborhood radius (3-5 km)
 */
export function filterIssuesInRadius(
  issues: any[],
  userLocation: UserLocation,
  radiusKm: number = 5
): any[] {
  if (!userLocation) return []

  return issues.filter((issue) => {
    if (!issue.latitude || !issue.longitude) return false

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      issue.latitude,
      issue.longitude
    )

    return distance <= radiusKm
  })
}

/**
 * Check if user can access a specific issue based on location
 */
export function canAccessIssue(
  issue: any,
  userLocation: UserLocation | null,
  radiusKm: number = 5
): { canAccess: boolean; distance?: number; reason?: string } {
  if (!userLocation) {
    return {
      canAccess: false,
      reason: 'Location required to view neighborhood issues'
    }
  }

  if (!issue.latitude || !issue.longitude) {
    return {
      canAccess: false,
      reason: 'Issue location not available'
    }
  }

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    issue.latitude,
    issue.longitude
  )

  if (distance > radiusKm) {
    return {
      canAccess: false,
      distance: Math.round(distance * 10) / 10,
      reason: `This issue is ${Math.round(distance * 10) / 10} km away, outside your ${radiusKm} km neighborhood zone`
    }
  }

  return {
    canAccess: true,
    distance: Math.round(distance * 10) / 10
  }
}

/**
 * Get user's location from localStorage or prompt for new location
 */
export function getUserLocation(): UserLocation | null {
  try {
    const stored = localStorage.getItem('userLocation')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/**
 * Save user's location to localStorage
 */
export function saveUserLocation(location: UserLocation): void {
  try {
    localStorage.setItem('userLocation', JSON.stringify(location))
  } catch (error) {
    console.error('Failed to save user location:', error)
  }
}

/**
 * Clear saved user location
 */
export function clearUserLocation(): void {
  try {
    localStorage.removeItem('userLocation')
  } catch (error) {
    console.error('Failed to clear user location:', error)
  }
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${Math.round(distanceKm * 10) / 10} km`
}

/**
 * Get neighborhood radius options
 */
export const RADIUS_OPTIONS = [
  { value: 3, label: '3 km radius' },
  { value: 4, label: '4 km radius' },
  { value: 5, label: '5 km radius' }
] as const

export type RadiusOption = typeof RADIUS_OPTIONS[number]['value']
