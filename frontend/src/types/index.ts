// User types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthUser extends User {
  token: string;
}

// Weight types
export interface WeightEntry {
  id: number;
  userId: number;
  date: string;
  weight: number;
}

// Workout types
export interface Exercise {
  id: number;
  name: string;
  type: string;
}

export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  exercise: Exercise;
  sets: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: number;
  userId: number;
  date: string;
  duration: number;
  exercises: WorkoutExercise[];
}

// Task types
export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export interface WeightForm {
  weight: number;
  date?: string;
}

export interface WorkoutForm {
  date?: string;
  duration: number;
  exercises: {
    exerciseId: number;
    sets: number;
    reps: number;
    weight: number;
  }[];
}

export interface TaskForm {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
}