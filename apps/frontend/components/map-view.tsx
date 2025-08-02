"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ExpandableTabs } from "@/components/ui/expandable-tabs"
import {
  MapPin,
  ArrowLeft,
  Search,
  Construction,
  Droplets,
  Shield,
  Trash2,
  Lightbulb,
  TreePine,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

const mockIssues = [
  {
    id: 1,
    title: "Pothole on Main Street",
    category: "Roads",
    status: "In Progress",
    location: { lat: 40.7128, lng: -74.006 },
    description: "Large pothole causing traffic issues",
    reportedAt: "2 hours ago",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Broken streetlight",
    category: "Lighting",
    status: "Reported",
    location: { lat: 40.7589, lng: -73.9851 },
    description: "Street light not working for 3 days",
    reportedAt: "5 hours ago",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Garbage not collected",
    category: "Waste",
    status: "Resolved",
    location: { lat: 40.7505, lng: -73.9934 },
    description: "Garbage bins overflowing",
    reportedAt: "1 day ago",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
  },
]

const filterTabs = [
  { title: "Roads", icon: Construction },
  { title: "Water", icon: Droplets },
  { title: "Safety", icon: Shield },
  { type: "separator" as const },
  { title: "Waste", icon: Trash2 },
  { title: "Lighting", icon: Lightbulb },
  { title: "Parks", icon: TreePine },
]

const statusTabs = [
  { title: "Reported", icon: AlertTriangle },
  { title: "In Progress", icon: Clock },
  { title: "Resolved", icon: CheckCircle },
]

export function MapView() {
  const [selectedIssue, setSelectedIssue] = useState<(typeof mockIssues)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reported":
        return "bg-red-100 text-red-700 border-red-200"
      case "In Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Resolved":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CivicTrack</span>
            </div>
          </div>
          <Button asChild>
            <Link href="/report">Report Issue</Link>
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <ExpandableTabs 
                  tabs={filterTabs} 
                  className="w-full"
                  activeColor="text-blue-600"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <ExpandableTabs 
                  tabs={statusTabs} 
                  className="w-full"
                  activeColor="text-green-600"
                />
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Recent Issues</h3>
              {mockIssues.map((issue) => (
                <Card 
                  key={issue.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedIssue?.id === issue.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedIssue(issue)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={issue.image || "/placeholder.svg"} 
                        alt={issue.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{issue.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                          <span className="text-xs text-gray-500">{issue.reportedAt}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          {/* Mock Map */}
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden">
            {/* Map placeholder with pins */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23e5e7eb\" fillOpacity=\"0.3\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            
            {/* Issue Pins */}
            {mockIssues.map((issue, index) => (
              <div
                key={issue.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
                  selectedIssue?.id === issue.id ? 'scale-125 z-10' : ''
                }`}
                style={{
                  left: `${30 + index * 15}%`,
                  top: `${40 + index * 10}%`
                }}
                onClick={() => setSelectedIssue(issue)}
              >
                <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                  issue.status === 'Resolved' ? 'bg-green-500' :
                  issue.status === 'In Progress' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}

            {/* Issue Details Popup */}
            {selectedIssue && (
              <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto">
                <Card className="shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedIssue.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{selectedIssue.description}</p>
                      </div>
                      <Badge className={getStatusColor(selectedIssue.status)}>
                        {selectedIssue.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <img 
                      src={selectedIssue.image || "/placeholder.svg"} 
                      alt={selectedIssue.title}
                      className="w-full h-32 rounded-lg object-cover mb-3"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Reported {selectedIssue.reportedAt}</span>
                      <Button asChild size="sm">
                        <Link href={`/issue/${selectedIssue.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
