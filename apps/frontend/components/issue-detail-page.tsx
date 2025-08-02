"use client"

import { useState, useEffect } from "react"
import { apiService, type Issue } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Lens } from "@/components/ui/lens"
import {
  MapPin,
  ArrowLeft,
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Search,
  Flag,
  Share2,
  Heart,
  MoreHorizontal,
  Navigation,
  Phone,
  Mail,
  ExternalLink,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Camera,
  FileText,
  Users,
  Activity,
  MapIcon,
  Shield,
  Zap,
  TrendingUp,
  Info,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { motion } from "framer-motion"

// Enhanced mock data with more details
const mockIssues = [
  {
    id: 1,
    title: "Pothole on main road",
    description:
      "The main road in C.G Road, Ahmedabad, is riddled with multiple potholes of varying sizes, making it extremely dangerous and difficult to travel on. The road condition has deteriorated significantly over the past few months due to heavy monsoon rains and increased traffic load. Several potholes are over 6 inches deep and 2 feet wide, causing damage to vehicles and creating serious safety hazards for commuters, especially during night hours when visibility is poor.",
    category: "Roads & Infrastructure",
    subcategory: "Road Maintenance",
    status: "In Progress",
    priority: "High",
    severity: "Critical",
    reportedAt: "2025-06-02T10:34:00Z",
    reportedBy: "Anonymous",
    reporterId: "user_12345",
    location: "C.G Road, Ahmedabad, Gujarat 380009",
    coordinates: { lat: 23.0225, lng: 72.5714 },
    ward: "Ward 15 - Navrangpura",
    pincode: "380009",
    landmark: "Near Himalaya Mall",
    estimatedCost: "₹45,000",
    estimatedDuration: "5-7 days",
    assignedTo: "Road Maintenance Division",
    contactNumber: "+91-79-2658-4321",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop",
    ],
    votes: 24,
    upvotes: 28,
    downvotes: 4,
    views: 156,
    shares: 8,
    followers: 12,
    tags: ["road-safety", "infrastructure", "urgent", "traffic-hazard"],
    timeline: [
      {
        id: 1,
        status: "Reported",
        date: "2025-06-02T10:34:00Z",
        description: "Issue reported by citizen with photographic evidence",
        user: "Anonymous",
        userType: "citizen",
        details: "Initial report submitted with 4 photos and detailed description",
      },
      {
        id: 2,
        status: "Acknowledged",
        date: "2025-06-02T14:20:00Z",
        description: "Report acknowledged by municipal authority",
        user: "Municipal Control Room",
        userType: "official",
        details: "Issue verified and forwarded to Road Maintenance Division",
      },
      {
        id: 3,
        status: "Assigned",
        date: "2025-07-25T09:00:00Z",
        description: "Assigned to field inspection team",
        user: "Road Maintenance Division",
        userType: "official",
        details: "Team assigned for on-site assessment and cost estimation",
      },
      {
        id: 4,
        status: "Inspected",
        date: "2025-07-25T15:30:00Z",
        description: "Site inspection completed",
        user: "Field Inspector - Rajesh Kumar",
        userType: "official",
        details: "Inspection report filed. Estimated cost: ₹45,000. Priority: High",
      },
      {
        id: 5,
        status: "In Progress",
        date: "2025-07-28T16:15:00Z",
        description: "Repair work commenced",
        user: "Road Maintenance Team",
        userType: "official",
        details: "Materials procured. Work started on priority basis. Expected completion: 5-7 days",
      },
    ],
    comments: [
      {
        id: 1,
        author: "Municipal Authority",
        authorType: "official",
        content:
          "Thank you for reporting this critical infrastructure issue. We have assigned our priority response team to assess and repair the potholes. The work will be completed within 7 business days.",
        timestamp: "2025-07-25T10:00:00Z",
        isOfficial: true,
        likes: 12,
        replies: 2,
      },
      {
        id: 2,
        author: "Priya Sharma",
        authorType: "citizen",
        content:
          "This has been a major problem for months! My car's suspension got damaged last week. Really glad to see some action finally being taken. Thank you for the quick response!",
        timestamp: "2025-07-25T14:30:00Z",
        isOfficial: false,
        likes: 8,
        replies: 1,
      },
      {
        id: 3,
        author: "Road Maintenance Team",
        authorType: "official",
        content:
          "Work has begun on this section. We are using high-quality materials to ensure long-lasting repairs. Traffic diversions are in place during working hours (9 AM - 6 PM). Expected completion: 5-7 business days.",
        timestamp: "2025-07-28T16:30:00Z",
        isOfficial: true,
        likes: 15,
        replies: 0,
      },
      {
        id: 4,
        author: "Amit Patel",
        authorType: "citizen",
        content:
          "Great work by the team! Can you also check the drainage system nearby? Water logging during rains might be causing these potholes.",
        timestamp: "2025-07-29T09:15:00Z",
        isOfficial: false,
        likes: 6,
        replies: 0,
      },
    ],
    relatedIssues: [
      { id: 12, title: "Street light not working near C.G Road", distance: "0.2 km" },
      { id: 15, title: "Drainage blockage causing water logging", distance: "0.5 km" },
      { id: 18, title: "Traffic signal malfunction at intersection", distance: "0.8 km" },
    ],
    statistics: {
      avgResolutionTime: "12 days",
      similarIssuesInArea: 8,
      successRate: "89%",
      citizenSatisfaction: "4.2/5",
    },
  },
]

interface IssueDetailPageProps {
  issueId: string
}

export function IssueDetailPage({ issueId }: IssueDetailPageProps) {
  const [issue, setIssue] = useState(mockIssues[0])
  const [isRealIssue, setIsRealIssue] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedDistance, setSelectedDistance] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch issue data on component mount
  useEffect(() => {
    const fetchIssueData = async () => {
      try {
        setIsLoading(true)
        
        // Check if issueId is a number (mock issue) or string (real issue)
        const isNumericId = !isNaN(Number(issueId))
        
        if (isNumericId) {
          // Mock issue - use mock data
          const mockIssue = mockIssues.find(issue => issue.id === parseInt(issueId))
          if (mockIssue) {
            setIssue(mockIssue)
            setIsRealIssue(false)
          }
        } else {
          // Real issue - fetch from API
          try {
            const response = await apiService.getIssue(issueId)
            const apiIssue = response.data
            
            // Convert API issue to mock format for display
            const convertedIssue = {
              id: parseInt(apiIssue.id) || Math.random(),
              title: apiIssue.title,
              description: apiIssue.description,
              category: apiIssue.category,
              status: apiIssue.status === 'RESOLVED' ? 'Resolved' : 
                      apiIssue.status === 'IN_PROGRESS' ? 'In Progress' : 'Reported',
              priority: apiIssue.priority === 'HIGH' ? 'High' : 
                       apiIssue.priority === 'MEDIUM' ? 'Medium' : 'Low',
              severity: apiIssue.priority === 'HIGH' ? 'Critical' : 'Moderate',
              reportedAt: apiIssue.createdAt,
              reportedBy: apiIssue.isAnonymous ? 'Anonymous' : 
                         (apiIssue.user?.firstName ? `${apiIssue.user.firstName} ${apiIssue.user.lastName || ''}` : 'User'),
              location: apiIssue.address || `${apiIssue.city || ''}, ${apiIssue.state || ''}`,
              coordinates: { lat: apiIssue.latitude, lng: apiIssue.longitude },
              images: apiIssue.images || [],
              votes: apiIssue._count?.votes || 0,
              upvotes: Math.floor((apiIssue._count?.votes || 0) * 0.8),
              downvotes: Math.floor((apiIssue._count?.votes || 0) * 0.2),
              views: Math.floor(Math.random() * 100) + 50,
              shares: Math.floor(Math.random() * 10) + 1,
              followers: Math.floor(Math.random() * 20) + 5,
              tags: apiIssue.tags || [],
              // Use default values for fields not available in API
              subcategory: 'General',
              reporterId: apiIssue.userId,
              ward: 'N/A',
              pincode: apiIssue.zipCode || 'N/A',
              landmark: 'N/A',
              estimatedCost: 'Under Review',
              estimatedDuration: 'TBD',
              assignedTo: 'Municipal Authority',
              contactNumber: '+91-79-2658-4321',
              timeline: [
                {
                  id: 1,
                  status: 'Reported',
                  date: apiIssue.createdAt,
                  description: 'Issue reported by citizen',
                  user: apiIssue.isAnonymous ? 'Anonymous' : 
                        (apiIssue.user?.firstName ? `${apiIssue.user.firstName} ${apiIssue.user.lastName || ''}` : 'User'),
                  userType: 'citizen',
                  details: 'Initial report submitted with details'
                }
              ],
              comments: [],
              relatedIssues: [],
              statistics: {
                avgResolutionTime: '12 days',
                similarIssuesInArea: Math.floor(Math.random() * 10) + 1,
                successRate: '89%',
                citizenSatisfaction: '4.2/5'
              }
            }
            
            setIssue(convertedIssue)
            setIsRealIssue(true)
          } catch (error) {
            console.error('Failed to fetch real issue:', error)
            // Fallback to first mock issue if API fails
            setIssue(mockIssues[0])
            setIsRealIssue(false)
          }
        }
      } catch (error) {
        console.error('Error fetching issue data:', error)
        setIssue(mockIssues[0])
        setIsRealIssue(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIssueData()
  }, [issueId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reported":
        return "bg-red-500/15 text-red-300 border-red-500/30"
      case "Acknowledged":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30"
      case "Assigned":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30"
      case "Inspected":
        return "bg-orange-500/15 text-orange-300 border-orange-500/30"
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
        return <AlertTriangle className="w-4 h-4" />
      case "Acknowledged":
        return <Eye className="w-4 h-4" />
      case "Assigned":
        return <User className="w-4 h-4" />
      case "Inspected":
        return <Search className="w-4 h-4" />
      case "In Progress":
        return <Clock className="w-4 h-4" />
      case "Resolved":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-600/20 text-red-300 border-red-500/40"
      case "High":
        return "bg-orange-600/20 text-orange-300 border-orange-500/40"
      case "Medium":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-500/40"
      case "Low":
        return "bg-green-600/20 text-green-300 border-green-500/40"
      default:
        return "bg-gray-600/20 text-gray-300 border-gray-500/40"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-sm">Loading issue details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Enhanced Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Issues
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6 bg-gray-700" />
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-black" />
                </div>
                <span className="text-lg font-semibold text-white">CivicTrack</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-700 text-red-300 hover:bg-red-900/20 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-36 bg-gray-900/50 border-gray-700 text-gray-300">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="roads">Roads & Infrastructure</SelectItem>
                  <SelectItem value="lighting">Street Lighting</SelectItem>
                  <SelectItem value="waste">Waste Management</SelectItem>
                  <SelectItem value="water">Water & Utilities</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32 bg-gray-900/50 border-gray-700 text-gray-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                <SelectTrigger className="w-32 bg-gray-900/50 border-gray-700 text-gray-300">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Distance</SelectItem>
                  <SelectItem value="1km">Within 1km</SelectItem>
                  <SelectItem value="5km">Within 5km</SelectItem>
                  <SelectItem value="10km">Within 10km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search Issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-gray-300 focus:border-gray-600"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content - 3 columns */}
            <div className="lg:col-span-3 space-y-8">
              {/* Issue Header Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="bg-white/[0.02] border border-white/10 overflow-hidden">
                  {/* Hero Image */}
                  <div className="relative">
                    <Lens zoomFactor={2.5} lensSize={250}>
                      <img
                        src={issue.images[0] || "/placeholder.svg"}
                        alt={issue.title}
                        className="w-full h-96 object-cover"
                      />
                    </Lens>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Status & Priority Badges */}
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                      <Badge
                        className={`${getStatusColor(issue.status)} flex items-center gap-2 px-4 py-2 text-sm font-medium border backdrop-blur-md`}
                      >
                        {getStatusIcon(issue.status)}
                        {issue.status}
                      </Badge>
                      <Badge
                        className={`${getPriorityColor(issue.priority)} flex items-center gap-2 px-4 py-2 text-sm font-medium border backdrop-blur-md`}
                      >
                        <Zap className="w-4 h-4" />
                        {issue.priority} Priority
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsLiked(!isLiked)}
                        className={`backdrop-blur-md ${isLiked ? "text-red-400 bg-red-500/20" : "text-gray-300 bg-black/40"} hover:bg-black/60`}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                        {issue.upvotes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`backdrop-blur-md ${isFollowing ? "text-blue-400 bg-blue-500/20" : "text-gray-300 bg-black/40"} hover:bg-black/60`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 bg-black/40 backdrop-blur-md hover:bg-black/60"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-300 bg-black/40 backdrop-blur-md hover:bg-black/60"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 border-gray-700">
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Flag className="w-4 h-4 mr-2" />
                            Report Spam
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in Maps
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Engagement Stats */}
                    <div className="absolute bottom-6 right-6 flex items-center gap-4 text-sm text-white/80 backdrop-blur-md bg-black/40 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{issue.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>{issue.shares}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{issue.followers}</span>
                      </div>
                    </div>
                  </div>

                  {/* Issue Details */}
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{issue.title}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(issue.reportedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Reported by: {issue.reportedBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{issue.ward}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-green-400">
                            <ThumbsUp className="w-5 h-5" />
                            <span className="text-xl font-bold">{issue.upvotes}</span>
                          </div>
                          <span className="text-xs text-gray-500">Upvotes</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-red-400">
                            <ThumbsDown className="w-5 h-5" />
                            <span className="text-xl font-bold">{issue.downvotes}</span>
                          </div>
                          <span className="text-xs text-gray-500">Downvotes</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                      <p className="text-gray-300 leading-relaxed text-lg">{issue.description}</p>
                    </div>

                    {/* Key Details Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-blue-400" />
                          <span className="text-sm font-medium text-gray-400">Severity</span>
                        </div>
                        <span className="text-lg font-semibold text-white">{issue.severity}</span>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-amber-400" />
                          <span className="text-sm font-medium text-gray-400">Est. Duration</span>
                        </div>
                        <span className="text-lg font-semibold text-white">{issue.estimatedDuration}</span>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium text-gray-400">Est. Cost</span>
                        </div>
                        <span className="text-lg font-semibold text-white">{issue.estimatedCost}</span>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-purple-400" />
                          <span className="text-sm font-medium text-gray-400">Assigned To</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{issue.assignedTo}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {issue.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Additional Images */}
                    {issue.images.length > 1 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Additional Photos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {issue.images.slice(1).map((image, index) => (
                            <Lens key={index} zoomFactor={2} lensSize={150}>
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Issue photo ${index + 2}`}
                                className="w-full h-40 object-cover rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
                              />
                            </Lens>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category & Subcategory */}
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 px-4 py-2">
                        <FileText className="w-4 h-4 mr-2" />
                        {issue.category}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300 px-4 py-2">
                        {issue.subcategory}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tabbed Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-800">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Activity
                    </TabsTrigger>
                    <TabsTrigger
                      value="comments"
                      className="data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comments ({issue.comments.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Details
                    </TabsTrigger>
                  </TabsList>

                  {/* Activity Timeline */}
                  <TabsContent value="overview" className="mt-6">
                    <Card className="bg-white/[0.02] border border-white/10">
                      <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Progress Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          {issue.timeline.map((event, index) => (
                            <div key={event.id} className="flex items-start gap-4">
                              <div className="relative">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(event.status)} border-2`}
                                >
                                  {getStatusIcon(event.status)}
                                </div>
                                {index < issue.timeline.length - 1 && (
                                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-700"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-lg font-semibold text-white">{event.status}</h4>
                                  <span className="text-sm text-gray-500">{formatDateShort(event.date)}</span>
                                </div>
                                <p className="text-gray-300 mb-2">{event.description}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${event.userType === "official" ? "border-blue-500/30 text-blue-300" : "border-gray-600 text-gray-400"}`}
                                    >
                                      {event.userType === "official" ? "Official" : "Citizen"}
                                    </Badge>
                                    <span className="text-sm text-gray-400">{event.user}</span>
                                  </div>
                                </div>
                                {event.details && <p className="text-sm text-gray-500 mt-2 italic">{event.details}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Comments Section */}
                  <TabsContent value="comments" className="mt-6">
                    <Card className="bg-white/[0.02] border border-white/10">
                      <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Comments & Updates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-6 mb-8">
                          {issue.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className={`p-6 rounded-lg border ${comment.isOfficial ? "bg-blue-500/5 border-blue-500/20" : "bg-gray-800/30 border-gray-700"}`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-300" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`font-semibold ${comment.isOfficial ? "text-blue-300" : "text-white"}`}
                                      >
                                        {comment.author}
                                      </span>
                                      {comment.isOfficial && (
                                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                          Official
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-500">{formatDateShort(comment.timestamp)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    {comment.likes}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    Reply
                                  </Button>
                                </div>
                              </div>
                              <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                            </div>
                          ))}
                        </div>

                        {/* Add Comment */}
                        <div className="border-t border-gray-800 pt-6">
                          <h4 className="text-lg font-semibold text-white mb-4">Add a Comment</h4>
                          <Textarea
                            placeholder="Share your thoughts, ask questions, or provide updates..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={4}
                            className="bg-gray-900/50 border-gray-700 text-gray-300 mb-4"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-700 text-gray-300 bg-transparent"
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Add Photo
                              </Button>
                            </div>
                            <Button className="bg-white text-black hover:bg-gray-100">Post Comment</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Detailed Information */}
                  <TabsContent value="details" className="mt-6">
                    <Card className="bg-white/[0.02] border border-white/10">
                      <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          <Info className="w-5 h-5" />
                          Detailed Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Issue ID</h4>
                              <p className="text-white font-mono">#{issue.id.toString().padStart(6, "0")}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Reporter ID</h4>
                              <p className="text-white font-mono">{issue.reporterId}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Location Details</h4>
                              <div className="space-y-1">
                                <p className="text-white">{issue.location}</p>
                                <p className="text-gray-400">Landmark: {issue.landmark}</p>
                                <p className="text-gray-400">PIN: {issue.pincode}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Coordinates</h4>
                              <p className="text-white font-mono">
                                {issue.coordinates.lat}, {issue.coordinates.lng}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Contact Information</h4>
                              <p className="text-white">{issue.contactNumber}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Area Statistics</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Avg Resolution Time:</span>
                                  <span className="text-white">{issue.statistics.avgResolutionTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Similar Issues:</span>
                                  <span className="text-white">{issue.statistics.similarIssuesInArea}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Success Rate:</span>
                                  <span className="text-green-400">{issue.statistics.successRate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Satisfaction:</span>
                                  <span className="text-yellow-400">{issue.statistics.citizenSatisfaction}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>

            {/* Enhanced Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Location Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-white/[0.02] border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-400" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-300 font-medium">{issue.location}</p>
                        <p className="text-sm text-gray-500">{issue.landmark}</p>
                      </div>

                      {/* Enhanced Map Thumbnail */}
                      <div className="relative rounded-lg overflow-hidden border border-gray-800">
                        <img
                          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop"
                          alt="Map location"
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          {issue.coordinates.lat.toFixed(4)}, {issue.coordinates.lng.toFixed(4)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Directions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                          <MapIcon className="w-4 h-4 mr-2" />
                          Full Map
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Related Issues */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white/[0.02] border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Related Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-3">
                      {issue.relatedIssues.map((relatedIssue) => (
                        <Link
                          key={relatedIssue.id}
                          href={`/issue/${relatedIssue.id}`}
                          className="block p-3 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 hover:border-gray-600 transition-all"
                        >
                          <p className="text-sm text-white font-medium line-clamp-2">{relatedIssue.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{relatedIssue.distance} away</p>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Support */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-white/[0.02] border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call: {issue.contactNumber}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white/[0.02] border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-3">
                      <Button className="w-full bg-white text-black hover:bg-gray-100" asChild>
                        <Link href="/report">Report Similar Issue</Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Report Spam
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Issue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
