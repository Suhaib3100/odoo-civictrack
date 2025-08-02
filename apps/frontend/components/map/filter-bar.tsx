"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, MapPin, X } from "lucide-react"
import { FilterOptions, FilterBarProps } from "@/types/map"

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Reported', label: 'Reported' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
]

const distanceOptions = [
  { value: 'all', label: 'All Distances' },
  { value: '1km', label: 'Within 1km' },
  { value: '3km', label: 'Within 3km' },
  { value: '5km', label: 'Within 5km' },
]

export function FilterBar({ filters, onFilterChange, categories }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status: status as FilterOptions['status'] })
  }

  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category })
  }

  const handleDistanceChange = (distance: string) => {
    onFilterChange({ ...filters, distance: distance as FilterOptions['distance'] })
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
    <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Title and Filter Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Community Issues Map</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Active filters:</span>
              {filters.status !== 'all' && (
                <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30">
                  {filters.status}
                </Badge>
              )}
              {filters.category !== 'all' && (
                <Badge className="bg-green-500/15 text-green-300 border-green-500/30">
                  {filters.category}
                </Badge>
              )}
              {filters.distance !== 'all' && (
                <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30">
                  {filters.distance}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Expanded Filter Controls */}
        {isExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Status</label>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-gray-300 hover:text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Category</label>
              <Select value={filters.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="all" className="text-gray-300 hover:text-white">
                    All Categories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-gray-300 hover:text-white">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Distance Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Distance</label>
              <Select value={filters.distance} onValueChange={handleDistanceChange}>
                <SelectTrigger className="bg-gray-900/50 border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  {distanceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-gray-300 hover:text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 