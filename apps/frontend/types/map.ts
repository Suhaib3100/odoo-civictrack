export interface Location {
  lat: number
  lng: number
}

export interface Issue {
  id: string
  title: string
  category: string
  status: 'Reported' | 'In Progress' | 'Resolved'
  location: Location
  description?: string
  reportedAt?: string
  reportedBy?: string
  priority?: 'Low' | 'Medium' | 'High'
  votes?: number
}

export interface FilterOptions {
  status: 'all' | 'Reported' | 'In Progress' | 'Resolved'
  category: 'all' | string
  distance: 'all' | '1km' | '3km' | '5km'
}

export interface MapMarkerProps {
  issue: Issue
  userLocation: Location
  onMarkerClick: (issue: Issue) => void
}

export interface FilterBarProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  categories: string[]
} 