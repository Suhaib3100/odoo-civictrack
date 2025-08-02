"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  ArrowLeft,
  Search,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  MessageSquare,
  Heart,
  Calendar,
  TrendingUp,
  FileText,
  Edit,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { apiService, type Issue } from "@/lib/api"

const mockUserIssues = [
  {
    id: 1,
    title: "Pothole on main road",
    description: "Large pothole causing traffic issues on C.G Road",
    category: "Roads & Infrastructure",
    status: "In Progress",
    priority: "High",
    reportedAt: "2025-06-02T10:34:00Z",
    location: "C.G Road, Ahmedabad",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    votes: 24,
    comments: 8,
    views: 156,
  },
  {
    id: 2,
    title: "Streetlight not working",
    description: "Street light has been out for 3 days on Oak Avenue",
    category: "Street Lighting",
    status: "Reported",
    priority: "Medium",
    reportedAt: "2025-07-28T14:20:00Z",
    location: "Oak Avenue & 5th Street",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    votes: 12,
    comments: 3,
    views: 89,
  },
  {
    id: 3,
    title: "Garbage collection missed",
    description: "Waste bins overflowing in residential area",
    category: "Waste Management",
    status: "Resolved",
    priority: "Low",
    reportedAt: "2025-07-25T09:15:00Z",
    location: "Pine Street Residential Area",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
    votes: 8,
    comments: 5,
    views: 67,
  },
  {
    id: 4,
    title: "Water leak on sidewalk",
    description: "Continuous water leak creating slippery conditions",
    category: "Water & Utilities",
    status: "In Progress",
    priority: "High",
    reportedAt: "2025-07-27T16:45:00Z",
    location: "Elm Street & 3rd Avenue",
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop",
    votes: 15,
    comments: 6,
    views: 123,
  },
  {
    id: 5,
    title: "Broken playground equipment",
    description: "Swing set chains are broken and unsafe",
    category: "Parks & Environment",
    status: "Reported",
    priority: "Medium",
    reportedAt: "2025-07-29T11:30:00Z",
    location: "Riverside Park",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    votes: 6,
    comments: 2,
    views: 45,
  },
]

export function MyIssuesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [apiIssues, setApiIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiService.getIssues({ limit: 100 }) // Get more issues
        setApiIssues(response.data.issues)
      } catch (err) {
        console.error('Failed to fetch issues:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch issues')
      } finally {
        setIsLoading(false)
      }
    }

    fetchIssues()
  }, [])

  // Convert API issues to match mock data format
  const convertApiIssueToMockFormat = (issue: Issue) => {
    // Map backend categories to frontend display names
    const categoryMap: Record<string, string> = {
      'INFRASTRUCTURE': 'Roads & Infrastructure',
      'UTILITIES': 'Water & Utilities',
      'PUBLIC_SERVICES': 'Waste Management',
      'SAFETY': 'Safety & Security',
      'ENVIRONMENT': 'Parks & Environment',
      'TRANSPORTATION': 'Public Transport',
      'OTHER': 'Other'
    }

    // Map backend status to frontend status
    const statusMap: Record<string, string> = {
      'REPORTED': 'Reported',
      'IN_PROGRESS': 'In Progress',
      'RESOLVED': 'Resolved',
      'CLOSED': 'Resolved'
    }

    // Map backend priority to frontend priority
    const priorityMap: Record<string, string> = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High',
      'URGENT': 'High'
    }

    return {
      id: parseInt(issue.id) || Math.random(), // Convert string ID to number for compatibility
      title: issue.title,
      description: issue.description,
      category: categoryMap[issue.category] || issue.category,
      status: statusMap[issue.status] || 'Reported',
      priority: priorityMap[issue.priority] || 'Medium',
      reportedAt: issue.createdAt,
      location: issue.address || 'Location not specified',
      image: issue.images?.[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop", // Default image
      votes: issue._count?.votes || 0,
      comments: issue._count?.comments || 0,
      views: Math.floor(Math.random() * 200) + 10, // Random views for now
    }
  }

  // Combine API issues with mock data
  const allIssues = [
    ...apiIssues.map(convertApiIssueToMockFormat),
    ...mockUserIssues
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reported":
        return "bg-red-500/15 text-red-300 border-red-500/30"
      case "In Progress":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30"
      case "Resolved":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      default:
        return "bg-gray-500/15 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Reported":
        return <AlertTriangle className="w-3 h-3" />
      case "In Progress":
        return <Clock className="w-3 h-3" />
      case "Resolved":
        return <CheckCircle className="w-3 h-3" />
      default:
        return <AlertTriangle className="w-3 h-3" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-400"
      case "Medium":
        return "text-yellow-400"
      case "Low":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusCount = (status: string) => {
    return allIssues.filter((issue) => issue.status === status).length
  }

  // Filter and sort issues
  const filteredIssues = allIssues
    .filter((issue) => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter
      const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
        case "oldest":
          return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime()
        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 }
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        case "votes":
          return b.votes - a.votes
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">My Issues</span>
              </div>
            </div>
            <Button className="bg-white text-black hover:bg-gray-100" asChild>
              <Link href="/report">
                <Plus className="w-4 h-4 mr-2" />
                Report New Issue
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/[0.02] border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{mockUserIssues.length}</p>
                    <p className="text-sm text-gray-400">Total Issues</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-amber-400">{getStatusCount("in-progress")}</p>
                    <p className="text-sm text-gray-400">In Progress</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">{getStatusCount("resolved")}</p>
                    <p className="text-sm text-gray-400">Resolved</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(
                        (mockUserIssues.reduce((sum, issue) => sum + issue.votes, 0) / mockUserIssues.length) * 10,
                      ) / 10}
                    </p>
                    <p className="text-sm text-gray-400">Avg Votes</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/[0.02] border border-white/10 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search your issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700 text-gray-300"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-gray-900/50 border-gray-700 text-gray-300">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700 text-gray-300">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Roads & Infrastructure">Roads & Infrastructure</SelectItem>
                      <SelectItem value="Street Lighting">Street Lighting</SelectItem>
                      <SelectItem value="Waste Management">Waste Management</SelectItem>
                      <SelectItem value="Water & Utilities">Water & Utilities</SelectItem>
                      <SelectItem value="Parks & Environment">Parks & Environment</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-36 bg-gray-900/50 border-gray-700 text-gray-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="most-voted">Most Voted</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 group overflow-hidden">
                  <div className="relative">
                    <img
                      src={issue.image || "/placeholder.svg"}
                      alt={issue.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge
                        className={`${getStatusColor(issue.status)} flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border backdrop-blur-md`}
                      >
                        {getStatusIcon(issue.status)}
                        {issue.status}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 bg-black/40 backdrop-blur-md hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 bg-black/40 backdrop-blur-md hover:bg-red-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors line-clamp-2">
                        {issue.title}
                      </h3>
                      <div className={`text-sm font-medium ${getPriorityColor(issue.priority)}`}>{issue.priority}</div>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{issue.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{issue.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(issue.reportedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{issue.votes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{issue.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{issue.views}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" asChild>
                        <Link href={`/issue/${issue.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No issues found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filters, or report a new issue.</p>
              <Button className="bg-white text-black hover:bg-gray-100" asChild>
                <Link href="/report">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Your First Issue
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
