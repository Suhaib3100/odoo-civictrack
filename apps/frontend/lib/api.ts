import { toast } from 'sonner';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'INFRASTRUCTURE' | 'SAFETY' | 'ENVIRONMENT' | 'TRANSPORTATION' | 'UTILITIES' | 'PUBLIC_SERVICES' | 'OTHER';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  images: string[];
  tags: string[];
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  _count: {
    comments: number;
    votes: number;
  };
  userVote?: 'UP' | 'DOWN' | null;
}

export interface Comment {
  id: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  user: User;
}

export interface Vote {
  id: string;
  type: 'UP' | 'DOWN';
  createdAt: string;
  user: User;
}

export interface IssueUpdate {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any[];
}

// Token Management
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'civictract_access_token';
  private static REFRESH_TOKEN_KEY = 'civictract_refresh_token';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// API Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = TokenManager.getAccessToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle token refresh
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request
          const newToken = TokenManager.getAccessToken();
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          };
          const retryResponse = await fetch(url, config);
          return await this.handleResponse<T>(retryResponse);
        }
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      // If it's already an Error object with a message, preserve it
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise, throw a generic network error
      throw new Error('Network error occurred');
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || 'An error occurred';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        TokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      } else {
        TokenManager.clearTokens();
        return false;
      }
    } catch (error) {
      TokenManager.clearTokens();
      return false;
    }
  }

  // Authentication Methods
  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse['data']>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success) {
      TokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response as AuthResponse;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse['data']>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      TokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response as AuthResponse;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      TokenManager.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    return response.data;
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<void> {
    await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Issues Methods
  async getIssues(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<PaginatedResponse<Issue>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await this.request<PaginatedResponse<Issue>>(`/issues?${searchParams}`);
    return response.data;
  }

  async getIssue(id: string): Promise<Issue & { comments: Comment[]; votes: Vote[]; updates: IssueUpdate[] }> {
    const response = await this.request<Issue & { comments: Comment[]; votes: Vote[]; updates: IssueUpdate[] }>(`/issues/${id}`);
    return response.data;
  }

  async createIssue(issueData: {
    title: string;
    description: string;
    category: Issue['category'];
    priority?: Issue['priority'];
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    images?: string[];
    tags?: string[];
    isAnonymous?: boolean;
  }): Promise<Issue> {
    const response = await this.request<Issue>('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
    return response.data;
  }

  async updateIssue(id: string, issueData: Partial<Issue>): Promise<Issue> {
    const response = await this.request<Issue>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(issueData),
    });
    return response.data;
  }

  async deleteIssue(id: string): Promise<void> {
    await this.request(`/issues/${id}`, { method: 'DELETE' });
  }

  async voteOnIssue(issueId: string, voteType: 'UP' | 'DOWN'): Promise<void> {
    await this.request(`/issues/${issueId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type: voteType }),
    });
  }

  async removeVote(issueId: string): Promise<void> {
    await this.request(`/issues/${issueId}/vote`, { method: 'DELETE' });
  }

  async addComment(issueId: string, content: string, isPublic: boolean = true): Promise<Comment> {
    const response = await this.request<Comment>(`/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, isPublic }),
    });
    return response.data;
  }

  async updateComment(issueId: string, commentId: string, content: string): Promise<Comment> {
    const response = await this.request<Comment>(`/issues/${issueId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return response.data;
  }

  async deleteComment(issueId: string, commentId: string): Promise<void> {
    await this.request(`/issues/${issueId}/comments/${commentId}`, { method: 'DELETE' });
  }

  // User Methods
  async getUserIssues(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }): Promise<PaginatedResponse<Issue>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await this.request<PaginatedResponse<Issue>>(`/users/issues?${searchParams}`);
    return response.data;
  }

  async getUserComments(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Comment>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await this.request<PaginatedResponse<Comment>>(`/users/comments?${searchParams}`);
    return response.data;
  }

  async getUserVotes(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Vote>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await this.request<PaginatedResponse<Vote>>(`/users/votes?${searchParams}`);
    return response.data;
  }

  async getUserStats(): Promise<{
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    totalComments: number;
    totalVotes: number;
    resolutionRate: string;
    issuesByCategory: any[];
    issuesByStatus: any[];
  }> {
    const response = await this.request<any>('/users/stats');
    return response.data;
  }

  async deleteAccount(): Promise<void> {
    await this.request('/users/account', { method: 'DELETE' });
    TokenManager.clearTokens();
  }

  // Admin Methods
  async getAdminDashboard(): Promise<{
    stats: {
      totalUsers: number;
      totalIssues: number;
      openIssues: number;
      resolvedIssues: number;
      resolutionRate: string;
    };
    recentIssues: Issue[];
    issuesByCategory: any[];
    issuesByStatus: any[];
  }> {
    const response = await this.request<any>('/admin/dashboard');
    return response.data;
  }

  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User & { _count: { issues: number; comments: number } }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await this.request<PaginatedResponse<User & { _count: { issues: number; comments: number } }>>(`/admin/users?${searchParams}`);
    return response.data;
  }

  async updateUserRole(userId: string, role: 'USER' | 'MODERATOR' | 'ADMIN'): Promise<User> {
    const response = await this.request<User>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return response.data;
  }

  async toggleUserStatus(userId: string): Promise<User> {
    const response = await this.request<User>(`/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
    });
    return response.data;
  }

  async getAdminIssues(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }): Promise<PaginatedResponse<Issue>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await this.request<PaginatedResponse<Issue>>(`/admin/issues?${searchParams}`);
    return response.data;
  }

  async updateIssueStatus(issueId: string, status: Issue['status'], comment?: string): Promise<Issue> {
    const response = await this.request<Issue>(`/admin/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment }),
    });
    return response.data;
  }

  async deleteIssueAdmin(issueId: string): Promise<void> {
    await this.request(`/admin/issues/${issueId}`, { method: 'DELETE' });
  }

  async getAdminAnalytics(period?: number): Promise<{
    userRegistrations: any[];
    issueCreations: any[];
    issuesByLocation: any[];
    avgResolutionTime: number;
    period: number;
  }> {
    const searchParams = new URLSearchParams();
    if (period) searchParams.append('period', period.toString());

    const response = await this.request<any>(`/admin/analytics?${searchParams}`);
    return response.data;
  }

  // Upload Methods
  async uploadImage(file: File, options?: { width?: number; height?: number; quality?: number }): Promise<{
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
  }> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value.toString());
      });
    }

    const response = await this.request<any>('/upload/image', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
    return response.data;
  }

  async uploadImages(files: File[], options?: { width?: number; height?: number; quality?: number }): Promise<{
    images: Array<{
      filename: string;
      originalName: string;
      size: number;
      mimetype: string;
      url: string;
    }>;
    totalProcessed: number;
  }> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value.toString());
      });
    }

    const response = await this.request<any>('/upload/images', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
    return response.data;
  }

  async uploadAvatar(file: File): Promise<{
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
  }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.request<any>('/upload/avatar', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
    return response.data;
  }

  async deleteFile(filename: string): Promise<void> {
    await this.request(`/upload/${filename}`, { method: 'DELETE' });
  }
}

// Create and export API instance
export const api = new ApiClient(API_BASE_URL);

// Export token manager for direct access
export { TokenManager }; 