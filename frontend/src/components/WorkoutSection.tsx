import React, { useState, useEffect } from 'react';
import WorkoutForm from './WorkoutForm';
import SkeletonLoader from './SkeletonLoader';
import WorkoutList from './WorkoutList';
import AnimatedChart from './AnimatedChart';
import FloatingAction from './FloatingAction';
import { apiService } from '../services/api';
import type { Workout } from '../types';

const WorkoutSection: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await apiService.getWorkouts();
      if (response.data) {
        setWorkouts(response.data);
      }
    } catch (err) {
      console.error('Failed to load workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = (workout: Workout) => {
    setWorkouts(prev => [workout, ...prev]);
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  // Calculate workout analytics
  const calculateAnalytics = () => {
    if (workouts.length === 0) return null;

    const sortedWorkouts = workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Total workouts
    const totalWorkouts = workouts.length;

    // Total duration
    const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);

    // Average duration
    const avgDuration = totalDuration / totalWorkouts;

    // Most recent workout
    const recentWorkout = sortedWorkouts[sortedWorkouts.length - 1];

    // Workout frequency (workouts per week)
    const firstDate = new Date(sortedWorkouts[0].date);
    const lastDate = new Date(sortedWorkouts[sortedWorkouts.length - 1].date);
    const weeks = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    const weeklyFrequency = totalWorkouts / weeks;

    // Exercise variety
    const exerciseTypes = new Set();
    workouts.forEach(workout => {
      workout.exercises.forEach(ex => exerciseTypes.add(ex.exercise.name));
    });

    return {
      totalWorkouts,
      totalDuration,
      avgDuration: Math.round(avgDuration),
      recentWorkout,
      weeklyFrequency: Math.round(weeklyFrequency * 10) / 10,
      exerciseVariety: exerciseTypes.size
    };
  };

  const analytics = calculateAnalytics();

  const durationTrendData = workouts.map((workout) => ({
    date: new Date(workout.date).toLocaleDateString(),
    value: workout.duration,
    category: 'Duration'
  }));

  if (loading) {
    return (
      <div className="py-8">
        <SkeletonLoader lines={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Workout Tracking
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
            Log your sessions and track your strength progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-forest-600 hover:bg-forest-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-opacity-20 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          Add Workout
        </button>
      </div>

      {/* Analytics Overview */}
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Total Workouts</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {analytics.totalWorkouts}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-forest-100 dark:bg-forest-900/30">
                  <svg className="w-6 h-6 text-forest-600 dark:text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Total Duration</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {Math.round(analytics.totalDuration / 60)}h {analytics.totalDuration % 60}m
                  </p>
                </div>
                <div className="p-3 rounded-full bg-forest-100 dark:bg-forest-900/30">
                  <svg className="w-6 h-6 text-forest-600 dark:text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Avg Duration</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {analytics.avgDuration} min
                  </p>
                </div>
                <div className="p-3 rounded-full bg-forest-100 dark:bg-forest-900/30">
                  <svg className="w-6 h-6 text-forest-600 dark:text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Weekly Frequency</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {analytics.weeklyFrequency.toFixed(1)}/wk
                  </p>
                </div>
                <div className="p-3 rounded-full bg-forest-100 dark:bg-forest-900/30">
                  <svg className="w-6 h-6 text-forest-600 dark:text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 15h16M12 3v18" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-forest-100 dark:bg-forest-900/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-forest-600 dark:text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">No workouts yet</h3>
          <p className="text-stone-600 dark:text-stone-400 text-sm mb-6">Start by logging your first workout to track your fitness journey</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-forest-600 hover:bg-forest-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105"
          >
            Log First Workout
          </button>
        </div>
      )}

      {showForm && (
        <div className="animate-slide-up">
          <WorkoutForm
            onSuccess={handleAddWorkout}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
              Recent Workouts
            </h3>
            <WorkoutList />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
              Performance Analytics
            </h3>
            {analytics && analytics.totalWorkouts > 0 ? (
              <div className="space-y-6">
                {/* Duration Trend Chart */}
                <div className="h-[200px]">
                  <AnimatedChart
                    data={durationTrendData}
                    type="area"
                    title="Workout Duration Trend"
                    color="#10B981"
                    showGrid={true}
                    showTooltip={true}
                  />
                </div>

                {/* Weekly Frequency Indicator */}
                <div className="flex items-center justify-between p-4 bg-forest-50 dark:bg-forest-900/20 rounded-lg border border-forest-200/50 dark:border-forest-700/50">
                  <div>
                    <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Consistency Score</p>
                    <p className="text-lg font-bold text-forest-600 dark:text-forest-400">
                      {analytics.weeklyFrequency.toFixed(1)} workouts/week
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-stone-600 dark:text-stone-400">Exercise Variety</div>
                    <div className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {analytics.exerciseVariety} types
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-stone-600 dark:text-stone-400">
                <div className="text-sm">No workout data yet</div>
                <div className="text-xs mt-2 opacity-75">
                  Log your first workout to see performance analytics
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingAction
        actions={[
          {
            id: 'add-workout',
            label: 'Log Workout',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
            onClick: () => setShowForm(true),
            color: 'text-forest-600 dark:text-forest-400'
          }
        ]}
        position="bottom-right"
        size="md"
      />
    </div>
  );
};

export default WorkoutSection;