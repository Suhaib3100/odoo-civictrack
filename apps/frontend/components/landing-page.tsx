"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { HeroSectionComponent } from "@/components/ui/hero-section-5"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  Search,
  TrendingUp,
  Users,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { apiService, type Issue } from "@/lib/api"
import { authService } from "@/lib/auth"
import { LocationGuard } from "@/components/location-guard"
import { 
  filterIssuesInRadius, 
  getUserLocation, 
  canAccessIssue,
  type UserLocation 
} from "@/lib/location"

const mockIssues = [
  {
    id: 1,
    title: "Streetlight malfunction on Oak Avenue",
    description:
      "Multiple streetlights have been out for over a week, creating safety concerns for pedestrians during evening hours.",
    category: "Safety & Security",
    status: "In Progress",
    location: "Oak Avenue & 5th Street",
    reportedAt: "2 hours ago",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    priority: "High",
    votes: 24,
    reportedBy: "Sarah M.",
  },
  {
    id: 2,
    title: "Large pothole causing traffic delays",
    description:
      "A significant pothole has formed on the main thoroughfare, causing vehicles to swerve and creating potential safety hazards.",
    category: "Infrastructure",
    status: "Reported",
    location: "Main Street near City Hall",
    reportedAt: "5 hours ago",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    priority: "High",
    votes: 18,
    reportedBy: "Mike R.",
  },
  {
    id: 3,
    title: "Overflowing waste bins in Central Park",
    description:
      "Several waste bins in the park have been overflowing for days, attracting pests and creating unsanitary conditions.",
    category: "Waste Management",
    status: "Resolved",
    location: "Central Park - Main Entrance",
    reportedAt: "1 day ago",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
    priority: "Medium",
    votes: 12,
    reportedBy: "Anna K.",
  },
  {
    id: 4,
    title: "Water leak on Elm Street sidewalk",
    description: "Continuous water leak from underground pipe creating slippery conditions and potential water waste.",
    category: "Water & Utilities",
    status: "In Progress",
    location: "Elm Street & 3rd Avenue",
    reportedAt: "3 hours ago",
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop",
    priority: "High",
    votes: 15,
    reportedBy: "David L.",
  },
  {
    id: 5,
    title: "Broken playground equipment",
    description: "Swing set chains are broken and pose safety risk to children using the playground.",
    category: "Parks & Environment",
    status: "Reported",
    location: "Riverside Park",
    reportedAt: "6 hours ago",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    priority: "Medium",
    votes: 8,
    reportedBy: "Lisa T.",
  },
  {
    id: 6,
    title: "Missing stop sign at intersection",
    description:
      "Stop sign was knocked down during recent storm and hasn't been replaced, creating traffic safety hazard.",
    category: "Safety & Security",
    status: "Reported",
    location: "Maple Street & Oak Avenue",
    reportedAt: "4 hours ago",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    priority: "High",
    votes: 22,
    reportedBy: "Tom W.",
  },
  {
    id: 7,
    title: "Graffiti on public building wall",
    description: "Large graffiti tags appeared on the side of the community center building over the weekend.",
    category: "Public Buildings",
    status: "Reported",
    location: "Community Center - West Wall",
    reportedAt: "8 hours ago",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
    priority: "Low",
    votes: 5,
    reportedBy: "Emma S.",
  },
  {
    id: 8,
    title: "Blocked storm drain causing flooding",
    description: "Storm drain is completely blocked with debris, causing water to pool during rain.",
    category: "Water & Utilities",
    status: "In Progress",
    location: "Pine Street & 2nd Avenue",
    reportedAt: "12 hours ago",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop",
    priority: "High",
    votes: 19,
    reportedBy: "Chris P.",
  },
  {
    id: 9,
    title: "Damaged park bench needs replacement",
    description: "Wooden park bench has several broken slats and is unsafe for public use.",
    category: "Parks & Environment",
    status: "Resolved",
    location: "Central Park - North Path",
    reportedAt: "2 days ago",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    priority: "Low",
    votes: 7,
    reportedBy: "Rachel M.",
  },
]

export function LandingPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiIssues, setApiIssues] = useState<Issue[]>([])
  const [isLoadingIssues, setIsLoadingIssues] = useState(true)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [selectedRadius, setSelectedRadius] = useState(5) // 5 km default
  const issuesPerPage = 9

  // Initialize user location and authentication
  useEffect(() => {
    const initializeApp = async () => {
      // Check authentication
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      
      // Get user location
      const location = getUserLocation()
      setUserLocation(location)
    }
    
    initializeApp()
  }, [])

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoadingIssues(true)
        const response = await apiService.getIssues({ limit: 50 })
        setApiIssues(response.data.issues)
      } catch (err) {
        console.error('Failed to fetch issues:', err)
        // Continue with just mock data if API fails
      } finally {
        setIsLoadingIssues(false)
      }
    }

    fetchIssues()
  }, [])

  // Convert API issues to match mock data format
  const convertApiIssueToMockFormat = (issue: Issue) => {
    const categoryMap: Record<string, string> = {
      'INFRASTRUCTURE': 'Infrastructure',
      'UTILITIES': 'Water & Utilities',
      'PUBLIC_SERVICES': 'Waste Management',
      'SAFETY': 'Safety & Security',
      'ENVIRONMENT': 'Parks & Environment',
      'TRANSPORTATION': 'Public Transport',
      'OTHER': 'Other'
    }

    const statusMap: Record<string, string> = {
      'REPORTED': 'Reported',
      'IN_PROGRESS': 'In Progress',
      'RESOLVED': 'Resolved',
      'CLOSED': 'Resolved'
    }

    const priorityMap: Record<string, string> = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High',
      'URGENT': 'High'
    }

    return {
      id: parseInt(issue.id) || Math.random(),
      title: issue.title,
      description: issue.description,
      category: categoryMap[issue.category] || issue.category,
      status: statusMap[issue.status] || 'Reported',
      location: issue.address || 'Location not specified',
      reportedAt: new Date(issue.createdAt).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        day: 'numeric',
        month: 'short'
      }),
      image: issue.images?.[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      priority: priorityMap[issue.priority] || 'Medium',
      votes: issue._count?.votes || Math.floor(Math.random() * 20) + 1,
      reportedBy: issue.isAnonymous ? 'Anonymous' : (issue.user?.firstName ? `${issue.user.firstName} ${issue.user.lastName?.[0] || ''}.` : 'User'),
    }
  }

  // Combine mock and API issues
  const allIssuesRaw = [
    ...mockIssues,
    ...apiIssues.map(convertApiIssueToMockFormat)
  ]

  // For now, show all mock issues (location filtering disabled)
  const allIssues = allIssuesRaw

  const totalPages = Math.ceil(allIssues.length / issuesPerPage)

  const currentIssues = allIssues.slice((currentPage - 1) * issuesPerPage, currentPage * issuesPerPage)

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

  return (
    <LocationGuard requiredForAccess={true}>
      <div className="min-h-screen bg-black">
      {/* Hero Section with Navigation */}
      <HeroSectionComponent isLoggedIn={isAuthenticated} />

      {/* Map Feature Highlight Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black border-y border-white/10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MapPin className="w-4 h-4" />
                    New Feature
                  </motion.div>
                  
                  <motion.h2 
                    className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    Explore Issues on 
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Interactive Map
                    </span>
                  </motion.h2>
                  
                  <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
                    Discover civic issues in your neighborhood with our powerful map visualization. 
                    See real-time locations, track progress, and find issues near you.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                        asChild
                      >
                        <Link href="/map" className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Try Interactive Map
                        </Link>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                        asChild
                      >
                        <Link href="#features" className="flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Learn More
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-8 lg:p-12 border border-white/10 backdrop-blur-sm">
                  {/* Mock Map Preview */}
                  <div className="aspect-square bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30" />
                    
                    {/* Enhanced Map Pins */}
                    <motion.div 
                      className="absolute top-1/4 left-1/3 w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-3 border-white shadow-2xl"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          "0 0 20px rgba(239, 68, 68, 0.6)",
                          "0 0 30px rgba(239, 68, 68, 0.8)",
                          "0 0 20px rgba(239, 68, 68, 0.6)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="absolute inset-0 bg-white rounded-full scale-50 opacity-80"></div>
                    </motion.div>
                    <motion.div 
                      className="absolute top-1/2 right-1/4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-3 border-white shadow-2xl"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          "0 0 20px rgba(251, 191, 36, 0.6)",
                          "0 0 30px rgba(251, 191, 36, 0.8)",
                          "0 0 20px rgba(251, 191, 36, 0.6)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <div className="absolute inset-0 bg-white rounded-full scale-50 opacity-80"></div>
                    </motion.div>
                    <motion.div 
                      className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full border-3 border-white shadow-2xl"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          "0 0 20px rgba(34, 197, 94, 0.6)",
                          "0 0 30px rgba(34, 197, 94, 0.8)",
                          "0 0 20px rgba(34, 197, 94, 0.6)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      <div className="absolute inset-0 bg-white rounded-full scale-50 opacity-80"></div>
                    </motion.div>
                    
                    {/* Additional smaller pins for more activity */}
                    <motion.div 
                      className="absolute top-3/4 left-1/4 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white shadow-xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
                    />
                    <motion.div 
                      className="absolute top-1/6 right-1/3 w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-white shadow-xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 2 }}
                    />
                    
                    {/* Grid Lines */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="grid grid-cols-6 grid-rows-6 h-full w-full">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div key={i} className="border border-white/10" />
                        ))}
                      </div>
                    </div>
                    
                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <MapPin className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    {[
                      { icon: MapPin, text: "Real-time Locations" },
                      { icon: Users, text: "Community Reports" },
                      { icon: TrendingUp, text: "Progress Tracking" }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/80"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                        transition={{ duration: 0.2 }}
                      >
                        <feature.icon className="w-4 h-4" />
                        {feature.text}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { label: "Active Citizens", value: "12,847", icon: Users },
              { label: "Issues Reported", value: "3,429", icon: AlertTriangle },
              { label: "Issues Resolved", value: "2,891", icon: CheckCircle },
              { label: "Success Rate", value: "84%", icon: TrendingUp },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/5 border border-white/10 rounded-2xl mb-6 group-hover:bg-white/10 transition-all duration-300">
                      <stat.icon className="w-7 h-7 text-white/80" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2 tracking-tight">{stat.value}</div>
                    <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Issues Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Recent Community Reports</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              See what your neighbors are reporting and track the progress of issues in your area.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search issues in your community..."
                className="pl-12 h-14 text-lg border-gray-800 bg-gray-900/50 text-white rounded-xl focus:border-gray-700 focus:bg-gray-900/70 transition-all"
              />
              <Button className="absolute right-2 top-2 h-10 px-6 bg-white text-black hover:bg-gray-100">Search</Button>
            </div>
          </div>

          {/* Issues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {currentIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/issue/${issue.id}`} className="block h-full">
                  <Card className="h-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 group cursor-pointer overflow-hidden backdrop-blur-sm hover:scale-[1.02]">
                    {/* Rest of the card content remains the same */}
                    <div className="relative overflow-hidden">
                      <img
                        src={issue.image || "/placeholder.svg"}
                        alt={issue.title}
                        className="w-full h-52 object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Status Badge */}
                      <div className="absolute top-5 left-5">
                        <Badge
                          className={`${getStatusColor(issue.status)} flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border backdrop-blur-md`}
                        >
                          {getStatusIcon(issue.status)}
                          {issue.status}
                        </Badge>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-5 right-5">
                        <Badge className="bg-black/40 text-white/90 border-0 backdrop-blur-md px-3 py-1.5 text-xs font-medium">
                          {issue.category}
                        </Badge>
                      </div>

                      {/* Priority Indicator */}
                      <div className="absolute bottom-4 right-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            issue.priority === "High"
                              ? "bg-red-400"
                              : issue.priority === "Medium"
                                ? "bg-yellow-400"
                                : "bg-green-400"
                          } shadow-lg`}
                        />
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors line-clamp-2 leading-tight">
                        {issue.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{issue.description}</p>

                      {/* Location & Time */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate font-medium">{issue.location}</span>
                        </div>
                        <span className="flex-shrink-0 text-gray-400">{issue.reportedAt}</span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-semibold text-white">{issue.votes}</span>
                            <span>votes</span>
                          </div>
                          <span className="text-gray-500">by {issue.reportedBy}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
                }
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to make a difference?</h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-400 leading-relaxed">
              Join thousands of citizens who are actively improving their communities. Your voice matters, and together
              we can create positive change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 bg-white text-black hover:bg-gray-100 shadow-lg"
                    asChild
                  >
                    <Link href="/report">Report New Issue</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 border-2 border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white bg-transparent transition-all duration-200"
                    asChild
                  >
                    <Link href="/my-issues">My Issues</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 bg-white text-black hover:bg-gray-100 shadow-lg"
                    asChild
                  >
                    <Link href="/report">Report Your First Issue</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 border-2 border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white bg-transparent transition-all duration-200"
                    asChild
                  >
                    <Link href="/login">Sign In to Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      </div>
    </LocationGuard>
  )
}
