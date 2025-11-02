import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

console.log('[API Configuration]', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_BASE_URL,
  environment: process.env.NODE_ENV
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, displayName: string) => {
    const response = await api.post('/auth/register', { email, password, displayName });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
};

// Tournament API
export const tournamentAPI = {
  getTournaments: async (params?: {
    status?: string;
    game?: string;
    format?: string;
    limit?: number;
    skip?: number;
  }) => {
    const response = await api.get('/tournaments', { params });
    return response.data;
  },

  getTournament: async (tournamentId: string) => {
    const response = await api.get(`/tournaments/${tournamentId}`);
    return response.data;
  },

  createTournament: async (tournamentData: any) => {
    const response = await api.post('/tournaments', tournamentData);
    return response.data;
  },

  updateTournament: async (tournamentId: string, updates: any) => {
    const response = await api.put(`/tournaments/${tournamentId}`, updates);
    return response.data;
  },

  deleteTournament: async (tournamentId: string) => {
    const response = await api.delete(`/tournaments/${tournamentId}`);
    return response.data;
  },

  registerForTournament: async (tournamentId: string) => {
    const response = await api.post(`/tournaments/${tournamentId}/register`);
    return response.data;
  },

  unregisterFromTournament: async (tournamentId: string) => {
    const response = await api.delete(`/tournaments/${tournamentId}/register`);
    return response.data;
  },

  startTournament: async (tournamentId: string) => {
    const response = await api.post(`/tournaments/${tournamentId}/start`);
    return response.data;
  },

  getTournamentBracket: async (tournamentId: string) => {
    const response = await api.get(`/tournaments/${tournamentId}/bracket`);
    return response.data;
  },

  checkInForTournament: async (tournamentId: string) => {
    const response = await api.post(`/tournaments/${tournamentId}/check-in`);
    return response.data;
  },
};

// User API
export const userAPI = {
  getUserProfile: async (userId: string) => {
    const response = await api.get(`/users/profile/${userId}`);
    return response.data;
  },

  getLeaderboard: async (params?: { limit?: number; game?: string }) => {
    const response = await api.get('/users/leaderboard', { params });
    return response.data;
  },

  searchUsers: async (query: string, limit?: number) => {
    const response = await api.get('/users/search', {
      params: { q: query, limit }
    });
    return response.data;
  },

  getUserTournaments: async (params?: {
    status?: string;
    limit?: number;
    skip?: number;
  }) => {
    const response = await api.get('/users/me/tournaments', { params });
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/users/me/stats');
    return response.data;
  },

  updateUserPreferences: async (preferences: any) => {
    const response = await api.put('/users/me/preferences', preferences);
    return response.data;
  },

  getUserAchievements: async () => {
    const response = await api.get('/users/me/achievements');
    return response.data;
  },
};

// League API
export const leagueAPI = {
  getLeagues: async (params?: {
    type?: string;
    game?: string;
    limit?: number;
    skip?: number;
  }) => {
    const response = await api.get('/leagues', { params });
    return response.data;
  },

  getLeague: async (leagueId: string) => {
    const response = await api.get(`/leagues/${leagueId}`);
    return response.data;
  },

  createLeague: async (leagueData: any) => {
    const response = await api.post('/leagues', leagueData);
    return response.data;
  },

  joinLeague: async (leagueId: string, divisionName?: string) => {
    const response = await api.post(`/leagues/${leagueId}/join`, { divisionName });
    return response.data;
  },

  leaveLeague: async (leagueId: string) => {
    const response = await api.post(`/leagues/${leagueId}/leave`);
    return response.data;
  },
};

export default api;
