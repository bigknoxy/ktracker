import React, { useState, useEffect, useRef } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../services/api';
import type { Workout } from '../types';

const WorkoutList: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await apiService.getWorkouts();
      if (response.data) {
        setWorkouts(response.data);
      } else {
        setError(response.error || 'Failed to load workouts');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      const response = await apiService.deleteWorkout(id);
      if (response.data !== undefined) {
        // Add smooth removal animation
        setWorkouts(prev => prev.filter(workout => {
          if (workout.id === id) {
            const element = document.querySelector(`[data-workout-id="${id}"]`);
            if (element) {
              element.classList.add('animate-out', 'fade-out', 'slide-out-to-left', 'duration-300');
            }
            return false;
          }
          return true;
        }));
        setTimeout(() => {
          setWorkouts(prev => prev.filter(workout => workout.id !== id));
        }, 300);
      } else {
        setError(response.error || 'Failed to delete workout');
      }
    } catch {
      setError('An unexpected error occurred');
    }
  };

   if (loading) {
      return (
        <div className="py-4">
          <SkeletonLoader
            lines={6}
            type="list"
            className="px-2 sm:px-4 md:px-6"
          />
        </div>
      );
   }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No workouts yet. Add your first workout above!
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md sm:rounded-lg px-2 sm:px-4 md:px-6 transition-all duration-300 ease-out hover:shadow-lg">
      <ul ref={listRef} className="divide-y divide-gray-200 dark:divide-gray-700">
        {workouts.map((workout, index) => (
          <li
            key={workout.id}
            data-workout-id={workout.id}
            className={`px-6 py-4 transition-all duration-300 ease-out hover:bg-green-50/50 dark:hover:bg-green-900/20 ${
              hoveredId === workout.id ? 'bg-green-50/30 dark:bg-green-900/30 scale-[1.01] shadow-sm' : ''
            }`}
            onMouseEnter={() => setHoveredId(workout.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg transition-all duration-300 ease-out ${
                    hoveredId === workout.id ? 'scale-110 shadow-xl ring-4 ring-green-300/50 dark:ring-green-500/30' : ''
                  }`}>
                    <span className="text-white text-sm font-bold drop-shadow-sm">
                      {workout.exercises.length}
                    </span>
                  </div>
                  {hoveredId === workout.id && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {workout.duration} minutes
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      index === 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {index === 0 ? 'Latest' : 'Workout'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(workout.date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{new Date(workout.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>
                      {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 rounded-full text-green-800 dark:text-green-300">
                      Total: {workout.exercises.reduce((acc, ex) => acc + ex.sets * ex.reps, 0)} reps
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2 transition-all duration-300">
                  <button
                    onClick={() => handleDelete(workout.id)}
                    className="group flex items-center space-x-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                  >
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    Burn: ~{Math.round(workout.duration * 8)} kcal
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                    Intensity: {workout.duration > 60 ? 'High' : workout.duration > 30 ? 'Medium' : 'Light'}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkoutList;