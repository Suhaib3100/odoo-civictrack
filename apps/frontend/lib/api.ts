const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  images: string[];
  tags: string[];
  isAnonymous: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  _count?: {
    comments: number;
    votes: number;
  };
}

export interface CreateIssueData {
  title: string;
  description: string;
  category: string;
  priority?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  images?: string[];
  tags?: string[];
  isAnonymous?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    issues: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth header if token exists
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // If there are validation details, include them in the error
      let errorMessage = data.error || data.message || 'An error occurred';
      if (data.details && Array.isArray(data.details)) {
        const validationErrors = data.details.map((detail: any) => detail.msg).join(', ');
        errorMessage += `: ${validationErrors}`;
      }
      throw new Error(errorMessage);
    }

    return data;
  }

  // Issues API methods
  async createIssue(issueData: CreateIssueData): Promise<ApiResponse<Issue>> {
    return this.makeRequest<ApiResponse<Issue>>('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

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
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/issues?${queryString}` : '/issues';
    
    return this.makeRequest<PaginatedResponse<Issue>>(endpoint);
  }

  async getIssue(id: string): Promise<ApiResponse<Issue>> {
    return this.makeRequest<ApiResponse<Issue>>(`/issues/${id}`);
  }

  async updateIssue(id: string, updateData: Partial<CreateIssueData>): Promise<ApiResponse<Issue>> {
    return this.makeRequest<ApiResponse<Issue>>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteIssue(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<ApiResponse<void>>(`/issues/${id}`, {
      method: 'DELETE',
    });
  }

  async voteOnIssue(id: string, type: 'UP' | 'DOWN'): Promise<ApiResponse<any>> {
    return this.makeRequest<ApiResponse<any>>(`/issues/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  async addComment(issueId: string, content: string, isPublic: boolean = true): Promise<ApiResponse<any>> {
    return this.makeRequest<ApiResponse<any>>(`/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, isPublic }),
    });
  }
}

export const apiService = new ApiService();
