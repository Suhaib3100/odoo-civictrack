"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterOptions } from "@/types/map"
import { Filter, X } from "lucide-react"

interface FilterBarProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  categories: string[]
}

export function FilterBar({ filters, onFilterChange, categories }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFilterChange({
      status: 'all',
      category: 'all',
      distance: 'all'
    })
  }

  const hasActiveFilters = filters.status !== 'all' || filters.category !== 'all' || filters.distance !== 'all'

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Filter Controls */}
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Reported">Reported</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Distance Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Distance:</span>
              <Select value={filters.distance} onValueChange={(value) => handleFilterChange('distance', value)}>
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1km">1 km</SelectItem>
                  <SelectItem value="3km">3 km</SelectItem>
                  <SelectItem value="5km">5 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-3 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Active:</span>
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.status}
                  </Badge>
                )}
                {filters.category !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    {filters.category}
                  </Badge>
                )}
                {filters.distance !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    {filters.distance}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 