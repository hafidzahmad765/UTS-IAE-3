import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API calls
export const userApi = {
  getUsers: () => apiClient.get('/api/users'),
  getUser: (id: string) => apiClient.get(`/api/users/${id}`),
  // --- PERUBAHAN DI SINI ---
  createUser: (userData: { name: string; email: string; age: number; password: string }) => 
    apiClient.post('/api/users', userData),
  // --- AKHIR PERUBAHAN ---
  updateUser: (id: string, userData: { name?: string; email?: string; age?: number }) => 
    apiClient.put(`/api/users/${id}`, userData),
  deleteUser: (id: string) => apiClient.delete(`/api/users/${id}`),
};

// Auth API calls
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/api/auth/login', credentials),
  register: (userData: { username: string; email: string; password: string }) =>
    apiClient.post('/api/auth/register', userData),
};