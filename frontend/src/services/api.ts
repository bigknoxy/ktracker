import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse, User, WeightEntry, Workout, Task } from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:3000/api'; // Adjust for production

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private extractErrorMessage(error: unknown): string {
    type ErrorResponse = {
      response?: {
        data?: {
          error?: {
            name?: string;
            message?: string;
          } | string;
        };
        status?: number;
      };
    };

    if (error && typeof error === 'object' && 'response' in error) {
      const err = error as ErrorResponse;

      if (err.response?.data?.error) {
        const errorData = err.response.data.error;

        if (typeof errorData === 'object' && errorData !== null && 'name' in errorData && errorData.name === 'ZodError') {
          if ('message' in errorData && typeof errorData.message === 'string') {
            try {
              const errorArray = JSON.parse(errorData.message);
              if (Array.isArray(errorArray)) {
                const messages = errorArray
                  .filter((err: { message?: string }) => err && err.message)
                  .map((err: { message?: string }) => err.message);
                if (messages.length > 0) {
                  return messages.join(', ');
                }
              }
            } catch (parseError) {
              console.warn('Failed to parse ZodError message:', parseError);
            }
          }
        } else if (typeof errorData === 'string') {
          return errorData;
        } else if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof errorData.message === 'string') {
          return errorData.message;
        }
      }

      if (err.response?.status === 400) return 'Invalid request data';
      if (err.response?.status === 401) return 'Authentication failed';
      if (err.response?.status === 409) return 'User already exists';
      if (err.response?.status === 500) return 'Server error occurred';
    }

    return 'An unexpected error occurred';
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response: AxiosResponse = await this.api.post('/auth/login', { email, password });
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) };
    }
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response: AxiosResponse = await this.api.post('/auth/register', { username, email, password });
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) };
    }
  }



  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse = await this.api.get('/users/me');
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) };
    }
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse = await this.api.put('/users/me', updates);
      return { data: response.data.user };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to update profile' };
    }
  }

  // Weight endpoints
  async getWeightEntries(): Promise<ApiResponse<WeightEntry[]>> {
    try {
      const response: AxiosResponse = await this.api.get('/weight');
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to get weight entries' };
    }
  }

  async addWeightEntry(weight: number, date?: string): Promise<ApiResponse<WeightEntry>> {
    try {
      const response: AxiosResponse = await this.api.post('/weight', { weight, date });
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to add weight entry' };
    }
  }

  async updateWeightEntry(id: number, weight: number, date?: string): Promise<ApiResponse<WeightEntry>> {
    try {
      const response: AxiosResponse = await this.api.put(`/weight/${id}`, { weight, date });
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to update weight entry' };
    }
  }

  async deleteWeightEntry(id: number): Promise<ApiResponse<void>> {
    try {
      await this.api.delete(`/weight/${id}`);
      return { data: undefined };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to delete weight entry' };
    }
  }

  // Workout endpoints
  async getWorkouts(): Promise<ApiResponse<Workout[]>> {
    try {
      const response: AxiosResponse = await this.api.get('/workouts');
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to get workouts' };
    }
  }

  async addWorkout(workout: { date: string; duration: number; exercises: Array<{ exerciseId: number; sets: number; reps: number; weight: number }> }): Promise<ApiResponse<Workout>> {
    try {
      const response: AxiosResponse = await this.api.post('/workouts', workout);
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to add workout' };
    }
  }

  async updateWorkout(id: number, workout: { date: string; duration: number; exercises: Array<{ exerciseId: number; sets: number; reps: number; weight: number }> }): Promise<ApiResponse<Workout>> {
    try {
      const response: AxiosResponse = await this.api.put(`/workouts/${id}`, workout);
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) };
    }
  }

  async deleteWorkout(id: number): Promise<ApiResponse<void>> {
    try {
      await this.api.delete(`/workouts/${id}`);
      return { data: undefined };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to delete workout' };
    }
  }

  // Task endpoints
  async getTasks(): Promise<ApiResponse<Task[]>> {
    try {
      const response: AxiosResponse = await this.api.get('/tasks');
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to get tasks' };
    }
  }

  async addTask(task: { title: string; description?: string; dueDate?: string; priority: 'low' | 'medium' | 'high' }): Promise<ApiResponse<Task>> {
    try {
      const response: AxiosResponse = await this.api.post('/tasks', task);
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to add task' };
    }
  }

  async updateTask(id: number, task: { title?: string; description?: string; dueDate?: string; priority?: 'low' | 'medium' | 'high'; completed?: boolean }): Promise<ApiResponse<Task>> {
    try {
      const response: AxiosResponse = await this.api.put(`/tasks/${id}`, task);
      return { data: response.data };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to update task' };
    }
  }

  async deleteTask(id: number): Promise<ApiResponse<void>> {
    try {
      await this.api.delete(`/tasks/${id}`);
      return { data: undefined };
    } catch (error: unknown) {
      return { error: this.extractErrorMessage(error) || 'Failed to delete task' };
    }
  }
}

export const apiService = new ApiService();