/**
 * Authentication utilities and API client
 */

const API_BASE_URL = 'http://localhost:8000';

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthCheckResponse {
  requires_init: boolean;
  admin_exists: boolean;
  auth_required: boolean;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token and user from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        this.clearAuth();
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  setAuth(token: string, user: User) {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async checkAuthStatus(): Promise<AuthCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/check`);
    if (!response.ok) {
      throw new Error('Failed to check auth status');
    }
    return response.json();
  }

  async initializeAdmin(username: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/admin/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to initialize admin');
    }

    return response.json();
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.setAuth(data.access_token, data.user);
    return data;
  }

  async register(username: string, email: string, password: string): Promise<User> {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
      }
      throw new Error('Failed to get current user');
    }

    const user = await response.json();
    this.user = user;
    localStorage.setItem('auth_user', JSON.stringify(user));
    return user;
  }

  logout() {
    this.clearAuth();
  }

  // Helper to add auth header to fetch requests
  async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${this.token}`);

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

export const authService = new AuthService();

