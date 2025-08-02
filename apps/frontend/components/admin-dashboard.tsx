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
  Plus,
  Filter,
} from "lucide-react"
import { motion } from "framer-motion"
import { apiService, type Issue } from "@/lib/api"
import { authService, type User } from "@/lib/auth"
import { useRouter } from "next/navigation"

// Navigation items for the admin dashboard
const navigationItems = [
  { id: 'overview', title: 'Overview', icon: Home },
  { id: 'issues', title: 'Issues', icon: AlertTriangle },
  { id: 'users', title: 'Users', icon: Users },
  { id: 'reports', title: 'Reports', icon: FileText },
  { id: 'analytics', title: 'Analytics', icon: PieChart },
  { id: 'settings', title: 'Settings', icon: Settings },
]

// No mock data - using only real users from database

export function AdminDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [apiIssues, setApiIssues] = useState<Issue[]>([])
  const [apiUsers, setApiUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/login')
    }
  }

  // Check admin access on component mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!authService.isAuthenticated()) {
          setIsUnauthorized(true)
          setIsCheckingAuth(false)
          return
        }

        const user = await authService.getCurrentUser()
        if (!user) {
          setIsUnauthorized(true)
          setIsCheckingAuth(false)
          return
        }

        // Check if user is admin (admin@admin.com or ADMIN role)
        if (user.email !== 'admin@admin.com' && user.role !== 'ADMIN') {
          setIsUnauthorized(true)
          setIsCheckingAuth(false)
          return
        }

        setCurrentUser(user)
        setIsCheckingAuth(false)
      } catch (error) {
        console.error('Admin access check failed:', error)
        setIsUnauthorized(true)
        setIsCheckingAuth(false)
      }
    }

    checkAdminAccess()
  }, [])

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.getIssues({ limit: 100 })
        setApiIssues(response.data.issues || response.data || [])
      } catch (err) {
        console.error('Failed to fetch issues:', err)
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
        
        const users = response.data || []
        console.log('Extracted users:', users)
        setApiUsers(Array.isArray(users) ? users : [])
      } catch (err) {
        console.error('Failed to fetch users:', err)
        console.error('Error details:', err instanceof Error ? err.message : 'Unknown error')
        setApiUsers([])
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  // Handle user status update
  const handleUserStatusUpdate = async (userId: string, status: 'active' | 'banned') => {
    try {
      setActionLoading(`user-${userId}`)
      await apiService.updateUserStatus(userId, status)
      
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

  // Handle issue status update
  const handleIssueStatusUpdate = async (issueId: string, status: string) => {
    try {
      setActionLoading(`issue-${issueId}`)
      await apiService.updateIssueStatus(issueId, status)
      
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

  // Convert API issues to display format
  const convertApiIssueToDisplayFormat = (issue: Issue) => {
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
      category: categoryMap[issue.category] || issue.category,
      status: statusMap[issue.status] || 'Reported',
      reportedBy: issue.isAnonymous ? 'Anonymous' : (issue.user?.firstName ? `${issue.user.firstName} ${issue.user.lastName?.[0] || ''}.` : 'user@example.com'),
      reportedAt: issue.createdAt,
      priority: priorityMap[issue.priority] || 'Medium',
      location: issue.address || 'Location not specified',
      isSpam: false,
      votes: issue._count?.votes || Math.floor(Math.random() * 20) + 1,
      description: issue.description,
    }
  }

  // Use only real data from database
  const allIssues = [
    ...apiIssues.map(convertApiIssueToDisplayFormat),
  ]

  const allUsers = apiUsers.map(user => ({
    id: user.id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unknown User',
    email: user.email || 'No email',
    status: user.status === 'banned' ? 'Banned' : 'Active',
    issuesReported: user._count?.issues || user.issuesReported || 0,
    joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
    lastActive: user.updatedAt || user.createdAt || new Date().toISOString(),
  }))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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

  // Render Overview Section
  const renderOverview = () => {
    const totalIssues = allIssues.length
    const resolvedIssues = allIssues.filter(issue => issue.status === "Resolved").length
    const inProgressIssues = allIssues.filter(issue => issue.status === "In Progress").length
    const reportedIssues = allIssues.filter(issue => issue.status === "Reported").length

    return (
      <div className="space-y-8">
        {/* Ultra-minimal Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Issues", value: totalIssues.toString(), icon: AlertTriangle, color: "text-blue-400" },
            { label: "Users", value: allUsers.length.toString(), icon: Users, color: "text-emerald-400" },
            { label: "Resolved", value: `${totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}%`, icon: CheckCircle, color: "text-green-400" },
            { label: "Pending", value: reportedIssues.toString(), icon: Clock, color: "text-amber-400" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-white/90">{stat.value}</p>
                      <p className="text-xs text-white/50 mt-1 font-medium">{stat.label}</p>
                    </div>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white/90 text-lg font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allIssues.slice(0, 5).map((issue, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <div className="flex-1">
                    <p className="text-white/90 text-sm font-medium">{issue.title}</p>
                    <p className="text-white/40 text-xs">by {issue.reportedBy}</p>
                  </div>
                  <Badge className={`${getStatusColor(issue.status)} text-xs`}>
                    {issue.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render Issues Section
  const renderIssues = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/40 focus:bg-white/10 focus:border-white/20"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'reported', 'in-progress', 'resolved'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className={selectedFilter === filter 
                    ? "bg-blue-500 text-white hover:bg-blue-600 border-0" 
                    : "text-white/60 hover:text-white hover:bg-white/10 border-0"
                  }
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Issues Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">Issue</TableHead>
                <TableHead className="text-gray-300">Category</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Priority</TableHead>
                <TableHead className="text-gray-300">Reported By</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allIssues.map((issue) => (
                <TableRow key={issue.id} className="border-gray-800 hover:bg-gray-800/30">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{issue.title}</p>
                      <p className="text-sm text-gray-400">{issue.location}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gray-700 text-gray-300">{issue.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
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
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleIssueStatusUpdate(issue.id.toString(), 'RESOLVED')}
                          disabled={actionLoading === `issue-${issue.id}`}
                        >
                          {actionLoading === `issue-${issue.id}` ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-700"
                      >
                        <Eye className="w-4 h-4" />
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

  // Render Users Section
  const renderUsers = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">User Management ({allUsers.length} users)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <div className="text-gray-400">Loading users...</div>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Issues Reported</TableHead>
                <TableHead className="text-gray-300">Join Date</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <TableRow key={user.id} className="border-gray-800 hover:bg-gray-800/30">
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
                    <div className="flex gap-2">
                      {user.status === 'Banned' ? (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleUserStatusUpdate(user.id.toString(), 'active')}
                          disabled={actionLoading === `user-${user.id}`}
                        >
                          {actionLoading === `user-${user.id}` ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleUserStatusUpdate(user.id.toString(), 'banned')}
                          disabled={actionLoading === `user-${user.id}`}
                        >
                          {actionLoading === `user-${user.id}` ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-700"
                      >
                        <Eye className="w-4 h-4" />
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

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'issues':
        return renderIssues()
      case 'users':
        return renderUsers()
      case 'reports':
        return <div className="text-center py-20 text-gray-400">Reports section coming soon...</div>
      case 'analytics':
        return <div className="text-center py-20 text-gray-400">Analytics section coming soon...</div>
      case 'settings':
        return <div className="text-center py-20 text-gray-400">Settings section coming soon...</div>
      default:
        return renderOverview()
    }
  }

  // Show unauthorized access screen
  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Lock Icon */}
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-400" />
            </div>
            
            {/* Main Message */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white/90">Access Denied</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                You are not authorized to access the admin dashboard. 
                This area is restricted to administrators only.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => router.push('/')}
                className="bg-blue-500 hover:bg-blue-600 text-white border-0 flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button 
                onClick={() => router.push('/login')}
                variant="outline"
                className="border-white/20 text-white/80 hover:bg-white/5 hover:text-white flex-1"
              >
                Sign In
              </Button>
            </div>
            
            {/* Footer */}
            <p className="text-white/40 text-xs pt-4">
              If you believe this is an error, please contact your administrator.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show loading screen while checking admin access
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-sm">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // If not admin, don't render anything (redirect will happen)
  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black">
      {/* Ultra-minimal Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <BackNavigation />
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-violet-400 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white/90">Admin Dashboard</h1>
                <p className="text-xs text-white/50">{currentUser?.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.reload()}
              className="text-white/60 hover:text-white hover:bg-white/5 border-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-white/60 hover:text-white hover:bg-white/5 border-0"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Ultra-minimal Sidebar */}
        <nav className="w-56 bg-black/10 backdrop-blur-sm border-r border-white/5 min-h-screen">
          <div className="p-6">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 group ${
                    activeSection === item.id
                      ? 'bg-white/10 text-white shadow-lg border border-white/10'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${
                    activeSection === item.id ? 'text-blue-400' : 'group-hover:text-white/70'
                  }`} />
                  <span className="text-sm font-medium">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
