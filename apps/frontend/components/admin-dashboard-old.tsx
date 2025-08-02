"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BackNavigation } from "@/components/ui/back-navigation"
import {
  Users,
  Flag,
  BarChart3,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Shield,
  Ban,
  TrendingUp,
  Activity,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  Settings,
  Home,
  FileText,
  PieChart,
} from "lucide-react"
import { motion } from "framer-motion"
import { apiService, type Issue } from "@/lib/api"

// Navigation items for the new admin dashboard
const navigationItems = [
  { id: 'overview', title: 'Overview', icon: Home },
  { id: 'issues', title: 'Issues', icon: AlertTriangle },
  { id: 'users', title: 'Users', icon: Users },
  { id: 'reports', title: 'Reports', icon: FileText },
  { id: 'analytics', title: 'Analytics', icon: PieChart },
  { id: 'settings', title: 'Settings', icon: Settings },
]

// Mock data for enhanced admin dashboard
const mockIssues = [
  {
    id: 1,
    title: "Pothole on Main Street",
    category: "Roads",
    status: "In Progress",
    reportedBy: "john.doe@email.com",
    reportedAt: "2024-01-15T10:30:00Z",
    priority: "High",
    location: "Main St & Oak Ave",
    isSpam: false,
    votes: 24,
    description: "Large pothole causing traffic delays and vehicle damage",
  },
  {
    id: 2,
    title: "Broken streetlight",
    category: "Lighting",
    status: "Reported",
    reportedBy: "Anonymous",
    reportedAt: "2024-01-15T08:15:00Z",
    priority: "Medium",
    location: "Pine Street",
    isSpam: false,
    votes: 18,
    description: "Streetlight not working for past 3 days",
  },
  {
    id: 3,
    title: "Garbage not collected",
    category: "Waste",
    status: "Resolved",
    reportedBy: "mary.smith@email.com",
    reportedAt: "2024-01-14T16:45:00Z",
    priority: "Low",
    location: "Elm Avenue",
    isSpam: false,
    votes: 12,
    description: "Garbage collection missed for 2 weeks",
  },
]

const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    status: "Active",
    issuesReported: 15,
    joinDate: "2023-06-15",
    lastActive: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Mary Smith",
    email: "mary.smith@email.com",
    status: "Active",
    issuesReported: 8,
    joinDate: "2023-08-22",
    lastActive: "2024-01-14T16:45:00Z",
  },
]

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [apiIssues, setApiIssues] = useState<Issue[]>([])
  const [apiUsers, setApiUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.getIssues({ limit: 100 })
        setApiIssues(response.data.issues)
      } catch (err) {
        console.error('Failed to fetch issues:', err)
        // Continue with just mock data if API fails
      } finally {
        setIsLoading(false)
      }
    }

    fetchIssues()
  }, [])

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true)
        console.log('Fetching users from API...')
        const response = await apiService.getUsers({ limit: 100 })
        console.log('Users API response:', response)
        
        // Try different response structures
        const users = response.data || []
        console.log('Extracted users:', users)
        setApiUsers(Array.isArray(users) ? users : [])
      } catch (err) {
        console.error('Failed to fetch users:', err)
        console.error('Error details:', err instanceof Error ? err.message : 'Unknown error')
        // Continue with just mock data if API fails
        setApiUsers([])
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  // Handle user status update (ban/activate)
  const handleUserStatusUpdate = async (userId: string, status: 'active' | 'banned') => {
    try {
      setActionLoading(`user-${userId}`)
      await apiService.updateUserStatus(userId, status)
      
      // Update local state
      setApiUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: status === 'active' ? 'Active' : 'Banned' } : user
      ))
      
      alert(`User ${status === 'active' ? 'activated' : 'banned'} successfully!`)
    } catch (err) {
      console.error('Failed to update user status:', err)
      alert('Failed to update user status. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle issue status update (resolve)
  const handleIssueStatusUpdate = async (issueId: string, status: string) => {
    try {
      setActionLoading(`issue-${issueId}`)
      await apiService.updateIssueStatus(issueId, status)
      
      // Update local state
      setApiIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status } : issue
      ))
      
      alert(`Issue ${status.toLowerCase()} successfully!`)
    } catch (err) {
      console.error('Failed to update issue status:', err)
      alert('Failed to update issue status. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Convert API issues to match mock data format
  const convertApiIssueToMockFormat = (issue: Issue) => {
    const categoryMap: Record<string, string> = {
      'INFRASTRUCTURE': 'Roads',
      'UTILITIES': 'Water',
      'PUBLIC_SERVICES': 'Waste',
      'SAFETY': 'Lighting',
      'ENVIRONMENT': 'Parks',
      'TRANSPORTATION': 'Transport',
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
      category: categoryMap[issue.category] || issue.category,
      status: statusMap[issue.status] || 'Reported',
      reportedBy: issue.isAnonymous ? 'Anonymous' : (issue.user?.firstName ? `${issue.user.firstName} ${issue.user.lastName?.[0] || ''}.` : 'user@example.com'),
      reportedAt: issue.createdAt,
      priority: priorityMap[issue.priority] || 'Medium',
      location: issue.address || 'Location not specified',
      isSpam: false, // API issues are not spam by default
      votes: issue._count?.votes || Math.floor(Math.random() * 20) + 1,
      description: issue.description,
    }
  }

  // Combine API issues with mock data
  const allIssues = [
    ...apiIssues.map(convertApiIssueToMockFormat),
    ...mockIssues
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/15 text-red-300 border-red-500/30"
      case "Medium":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30"
      case "Low":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      default:
        return "bg-gray-500/15 text-gray-300 border-gray-500/30"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredIssues = allIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "spam" && issue.isSpam) ||
                         (selectedFilter === "valid" && !issue.isSpam)
    return matchesSearch && matchesFilter
  })

  const renderOverviewTab = () => {
    const totalIssues = allIssues.length
    const resolvedIssues = allIssues.filter(issue => issue.status === "Resolved").length
    const inProgressIssues = allIssues.filter(issue => issue.status === "In Progress").length
    const reportedIssues = allIssues.filter(issue => issue.status === "Reported").length
    const spamIssues = allIssues.filter(issue => issue.isSpam).length

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Issues", value: totalIssues.toString(), icon: AlertTriangle, trend: "+12%", color: "text-red-400" },
            { label: "Active Users", value: "892", icon: Users, trend: "+8%", color: "text-blue-400" },
            { label: "Resolution Rate", value: `${totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}%`, icon: CheckCircle, trend: "+3%", color: "text-green-400" },
            { label: "Spam Reports", value: spamIssues.toString(), icon: Flag, trend: "-15%", color: "text-orange-400" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-white/80" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${stat.color}`}>
                      {stat.trend}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/[0.02] border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-500/50">
                <Flag className="w-4 h-4 mr-2" />
                Review Spam Reports
              </Button>
              <Button className="bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button className="bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20 hover:border-green-500/50">
                <Download className="w-4 h-4 mr-2" />
                Export Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderIssuesTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-white/[0.02] border border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-800 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
                className={selectedFilter === "all" ? "bg-white text-black" : "bg-gray-900/50 border-gray-800 text-gray-300"}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === "valid" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("valid")}
                className={selectedFilter === "valid" ? "bg-white text-black" : "bg-gray-900/50 border-gray-800 text-gray-300"}
              >
                Valid
              </Button>
              <Button
                variant={selectedFilter === "spam" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("spam")}
                className={selectedFilter === "spam" ? "bg-white text-black" : "bg-gray-900/50 border-gray-800 text-gray-300"}
              >
                Spam
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="bg-white/[0.02] border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Issues ({filteredIssues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-300">Issue</TableHead>
                <TableHead className="text-gray-300">Category</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Priority</TableHead>
                <TableHead className="text-gray-300">Votes</TableHead>
                <TableHead className="text-gray-300">Reported By</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{issue.title}</p>
                      <p className="text-sm text-gray-400">{issue.location}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gray-500/15 text-gray-300 border-gray-500/30">{issue.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-white font-medium">{issue.votes}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-300">{issue.reportedBy}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-400">{formatDate(issue.reportedAt)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {issue.status !== 'Resolved' && (
                        <Button 
                          size="sm" 
                          className="bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20"
                          onClick={() => handleIssueStatusUpdate(issue.id.toString(), 'RESOLVED')}
                          disabled={actionLoading === `issue-${issue.id}`}
                        >
                          {actionLoading === `issue-${issue.id}` ? (
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Resolve
                        </Button>
                      )}
                      {issue.status === 'Reported' && (
                        <Button 
                          size="sm" 
                          className="bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                          onClick={() => handleIssueStatusUpdate(issue.id.toString(), 'IN_PROGRESS')}
                          disabled={actionLoading === `issue-${issue.id}`}
                        >
                          {actionLoading === `issue-${issue.id}` ? (
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4 mr-1" />
                          )}
                          In Progress
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderSpamTab = () => {
    const spamIssues = allIssues.filter(issue => issue.isSpam)

    return (
      <div className="space-y-6">
        <Card className="bg-white/[0.02] border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Spam & Invalid Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <Flag className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{spamIssues.length}</p>
                <p className="text-sm text-gray-400">Spam Reports</p>
              </div>
              <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <XCircle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-sm text-gray-400">Invalid Reports</p>
              </div>
              <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">156</p>
                <p className="text-sm text-gray-400">Valid Reports</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-300">Issue</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Reported By</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spamIssues.map((issue) => (
                  <TableRow key={issue.id} className="border-white/5 hover:bg-white/[0.02]">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{issue.title}</p>
                        <p className="text-sm text-gray-400">{issue.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-500/15 text-red-300 border-red-500/30">Spam</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-300">{issue.reportedBy}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400">{formatDate(issue.reportedAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20">
                          <Ban className="w-4 h-4 mr-1" />
                          Ban User
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-700 text-gray-300">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}

  const renderUsersTab = () => {
    console.log('Rendering users tab. API users:', apiUsers)
    console.log('Is loading users:', isLoadingUsers)
    
    // Combine API users with mock users for display
    const allUsers = [
      ...apiUsers.map(user => {
        console.log('Processing API user:', user)
        return {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unknown User',
          email: user.email || 'No email',
          status: user.status === 'banned' ? 'Banned' : 'Active',
          issuesReported: user._count?.issues || user.issuesReported || 0,
          joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
          lastActive: user.updatedAt || user.createdAt || new Date().toISOString(),
        }
      }),
      ...mockUsers
    ]
    
    console.log('All users for display:', allUsers)

    return (
      <div className="space-y-6">
        <Card className="bg-white/[0.02] border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Management ({allUsers.length} users)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers && (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading users...</div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Issues Reported</TableHead>
                  <TableHead className="text-gray-300">Join Date</TableHead>
                  <TableHead className="text-gray-300">Last Active</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02]">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={user.status === "Active" 
                          ? "bg-green-500/15 text-green-300 border-green-500/30" 
                          : "bg-red-500/15 text-red-300 border-red-500/30"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-white font-medium">{user.issuesReported}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400">{user.joinDate}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400">{formatDate(user.lastActive)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.status === 'Banned' ? (
                          <Button 
                            size="sm" 
                            className="bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20"
                            onClick={() => handleUserStatusUpdate(user.id.toString(), 'active')}
                            disabled={actionLoading === `user-${user.id}`}
                          >
                            {actionLoading === `user-${user.id}` ? (
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <UserCheck className="w-4 h-4 mr-1" />
                            )}
                            Activate
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20"
                            onClick={() => handleUserStatusUpdate(user.id.toString(), 'banned')}
                            disabled={actionLoading === `user-${user.id}`}
                          >
                            {actionLoading === `user-${user.id}` ? (
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4 mr-1" />
                            )}
                            Ban
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderAnalyticsTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/[0.02] border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Most Reported Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Roads & Infrastructure", percentage: 45, color: "bg-blue-500" },
                { category: "Street Lighting", percentage: 23, color: "bg-yellow-500" },
                { category: "Waste Management", percentage: 18, color: "bg-green-500" },
                { category: "Water & Utilities", percentage: 14, color: "bg-purple-500" },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.category}</span>
                    <span className="text-white font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Response Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Response</span>
                <span className="text-white font-medium">24 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Fastest Response</span>
                <span className="text-white font-medium">2 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Resolution Time</span>
                <span className="text-white font-medium">5.2 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Satisfaction Rate</span>
                <span className="text-white font-medium">92%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Top Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { area: "Downtown", issues: 34, trend: "+12%" },
                { area: "Riverside", issues: 28, trend: "+8%" },
                { area: "Oak Hill", issues: 19, trend: "-3%" },
                { area: "West End", issues: 15, trend: "+5%" },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-300">{item.area}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{item.issues} issues</span>
                    <span className={`text-xs ${item.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/[0.02] border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New issue reported", user: "john.doe@email.com", time: "2 minutes ago", type: "issue" },
              { action: "User banned", user: "spammer@fake.com", time: "15 minutes ago", type: "ban" },
              { action: "Issue resolved", user: "mary.smith@email.com", time: "1 hour ago", type: "resolve" },
              { action: "Spam report flagged", user: "admin", time: "2 hours ago", type: "spam" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'issue' ? 'bg-blue-500' :
                  activity.type === 'ban' ? 'bg-red-500' :
                  activity.type === 'resolve' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.user}</p>
                </div>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return renderOverviewTab()
      case 1:
        return renderIssuesTab()
      case 2:
        return renderSpamTab()
      case 3:
        return renderUsersTab()
      case 4: // Analytics is at index 4 after separator
        return renderAnalyticsTab()
      default:
        return renderOverviewTab()
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.02] backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackNavigation />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CivicTrack Admin</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <motion.h1 
            className="text-4xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="relative">
              Admin Dashboard
              <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 300 20" fill="none">
                <path
                  d="M5 12C80 2, 120 15, 180 8C220 3, 260 10, 295 6"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </motion.h1>
          <motion.p 
            className="text-gray-400 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Manage civic issues, monitor community engagement, and maintain platform integrity
          </motion.p>
        </div>

        <div className="mb-6">
          <ExpandableTabs 
            tabs={adminTabs} 
            onChange={setActiveTab} 
            activeColor="text-blue-400" 
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}

