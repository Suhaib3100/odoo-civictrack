// Shared types for CivicTrack application

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Issue {
  id: string
  title: string
  description: string
  category: string
  status: 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  isAnonymous: boolean
  address?: string
  city?: string
  state?: string
  zipCode?: string
  latitude?: number
  longitude?: number
  images?: string[]
  tags?: string[]
  createdAt: string
  updatedAt: string
  user?: User
  _count?: {
    votes: number
    comments: number
  }
  upvotes?: number
  downvotes?: number
}

export interface Vote {
  id: string
  userId: string
  issueId: string
  voteType: 'UPVOTE' | 'DOWNVOTE'
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  userId?: string
  issueId: string
  parentId?: string
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
  user?: User
  replies?: Comment[]
}

export interface Location {
  latitude: number
  longitude: number
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

// Issue creation types
export interface CreateIssueRequest {
  title: string
  description: string
  category: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isAnonymous?: boolean
  address?: string
  city?: string
  state?: string
  zipCode?: string
  latitude?: number
  longitude?: number
  images?: string[]
  tags?: string[]
}

export interface UpdateIssueRequest {
  title?: string
  description?: string
  category?: string
  status?: 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  tags?: string[]
}

// Voting types
export interface VoteRequest {
  issueId: string
  voteType: 'UPVOTE' | 'DOWNVOTE'
}

// Comment types
export interface CreateCommentRequest {
  content: string
  issueId: string
  parentId?: string
  isAnonymous?: boolean
}

// Search and filter types
export interface IssueFilters {
  category?: string
  status?: string
  priority?: string
  location?: {
    latitude: number
    longitude: number
    radius: number // in kilometers
  }
  dateRange?: {
    from: string
    to: string
  }
  tags?: string[]
}

export interface SearchParams {
  query?: string
  filters?: IssueFilters
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'votes'
  sortOrder?: 'asc' | 'desc'
}

// Statistics types
export interface IssueStats {
  total: number
  byStatus: Record<string, number>
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  recentTrends: {
    period: string
    count: number
  }[]
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  usersByRole: Record<string, number>
}

export interface SystemStats {
  issues: IssueStats
  users: UserStats
  engagement: {
    totalVotes: number
    totalComments: number
    averageResolutionTime: number
  }
}
