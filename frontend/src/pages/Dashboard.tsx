import React, { useState, useEffect } from 'react';
import { Plus, Dumbbell, CheckSquare } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import BottomNav from '../components/BottomNav';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../contexts/AuthContext';
import WeightSection from '../components/WeightSection';
import WorkoutSection from '../components/WorkoutSection';
import TaskSection from '../components/TaskSection';
import { apiService } from '../services/api';
import type { WeightEntry, Workout, Task } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'weight' | 'workout' | 'tasks'>('dashboard');
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [weightRes, workoutRes, taskRes] = await Promise.all([
          apiService.getWeightEntries(),
          apiService.getWorkouts(),
          apiService.getTasks()
        ]);

        if (weightRes.data) setWeightEntries(weightRes.data);
        if (workoutRes.data) setWorkouts(workoutRes.data);
        if (taskRes.data) setTasks(taskRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLatestWeight = () => {
    if (weightEntries.length === 0) return null;
    return weightEntries[weightEntries.length - 1];
  };

  const getLatestWorkout = () => {
    if (workouts.length === 0) return null;
    return workouts[workouts.length - 1];
  };

  const getPendingTaskCount = () => {
    return tasks.filter(task => !task.completed).length;
  };

  const formatWeight = (entry: WeightEntry | null) => {
    if (!entry) return 'No entries yet';
    return `${entry.weight} lbs`;
  };

  const formatWorkoutDate = (workout: Workout | null) => {
    if (!workout) return 'No workouts yet';
    return new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-200 ease-soft">
      <header className="bg-white dark:bg-stone-900 shadow-soft-inset border-b border-stone-200/50 dark:border-stone-800/50 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
             <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-sage-600 to-forest-600 bg-clip-text text-transparent tracking-tight">
                  kTracker
                </h1>
                <ThemeToggle />
             </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`text-sm font-medium tracking-tight transition-all duration-200 ease-soft ${
                    activeSection === 'dashboard'
                      ? 'text-sage-600 dark:text-sage-400 border-b-2 border-sage-500'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveSection('weight')}
                  className={`text-sm font-medium tracking-tight transition-all duration-200 ease-soft ${
                    activeSection === 'weight'
                      ? 'text-sage-600 dark:text-sage-400 border-b-2 border-sage-500'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Weight
                </button>
                <button
                  onClick={() => setActiveSection('workout')}
                  className={`text-sm font-medium tracking-tight transition-all duration-200 ease-soft ${
                    activeSection === 'workout'
                      ? 'text-forest-600 dark:text-forest-400 border-b-2 border-forest-500'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Workouts
                </button>
                <button
                  onClick={() => setActiveSection('tasks')}
                  className={`text-sm font-medium tracking-tight transition-all duration-200 ease-soft ${
                    activeSection === 'tasks'
                      ? 'text-clay-600 dark:text-clay-400 border-b-2 border-clay-500'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Tasks
                </button>
              </nav>
              <span className="text-stone-700 dark:text-stone-300 text-sm font-medium">
                Welcome, {user?.username}!
              </span>
              <button
                onClick={logout}
                className="bg-sage-600 hover:bg-sage-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-opacity-20 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pb-16">
        <div className="px-4 py-6 sm:px-0">
           {activeSection === 'dashboard' && (
             <div className="animate-fade-in">
               <div className="mb-8">
                 <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                   Welcome to Your Wellness Hub
                 </h1>
                 <p className="text-stone-600 dark:text-stone-400 mt-2">
                   Track your progress, build healthy habits, and achieve your goals.
                 </p>
               </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {isLoading ? (
                    <>
                      {[1, 2, 3].map((card) => (
                        <div key={card} className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden">
                          <div className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-stone-200 dark:bg-stone-700 rounded-xl animate-pulse" />
                              </div>
                              <div className="flex-1 space-y-3">
                                <SkeletonLoader type="card" lines={2} />
                              </div>
                            </div>
                          </div>
                          <div className="bg-stone-50 dark:bg-stone-800/50 px-6 py-4 border-t border-stone-200/50 dark:border-stone-700/50">
                            <SkeletonLoader type="text" lines={1} />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {/* Weight Card */}
                      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1 group animate-fade-in" style={{ animationDelay: '0ms' }}>
                       <div className="p-6">
                         <div className="flex items-center gap-4">
                           <div className="flex-shrink-0">
                             <div className="w-12 h-12 bg-sage-100 dark:bg-sage-900/30 rounded-xl flex items-center justify-center group-hover:bg-sage-200 dark:group-hover:bg-sage-800/40 transition-all duration-200 ease-soft">
                               <svg className="w-6 h-6 text-sage-600 dark:text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                               </svg>
                             </div>
                           </div>
                            <div className="flex-1">
                              <dt className="text-sm font-medium text-stone-600 dark:text-stone-400">
                                Current Weight
                              </dt>
                              <dd className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                                {formatWeight(getLatestWeight())}
                              </dd>
                            </div>
                         </div>
                       </div>
                       <div className="bg-stone-50 dark:bg-stone-800/50 px-6 py-4 border-t border-stone-200/50 dark:border-stone-700/50">
                         <button
                           onClick={() => setActiveSection('weight')}
                           className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium tracking-tight transition-colors duration-200 ease-soft"
                         >
                           Manage weight →
                         </button>
                       </div>
                     </div>

                      {/* Workout Card */}
                      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1 group animate-fade-in" style={{ animationDelay: '100ms' }}>
                       <div className="p-6">
                         <div className="flex items-center gap-4">
                           <div className="flex-shrink-0">
                             <div className="w-12 h-12 bg-forest-100 dark:bg-forest-900/30 rounded-xl flex items-center justify-center group-hover:bg-forest-200 dark:group-hover:bg-forest-800/40 transition-all duration-200 ease-soft">
                               <svg className="w-6 h-6 text-forest-600 dark:text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                               </svg>
                             </div>
                           </div>
                            <div className="flex-1">
                              <dt className="text-sm font-medium text-stone-600 dark:text-stone-400">
                                Recent Workout
                              </dt>
                              <dd className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                                {formatWorkoutDate(getLatestWorkout())}
                              </dd>
                            </div>
                         </div>
                       </div>
                       <div className="bg-stone-50 dark:bg-stone-800/50 px-6 py-4 border-t border-stone-200/50 dark:border-stone-700/50">
                         <button
                           onClick={() => setActiveSection('workout')}
                           className="text-forest-600 dark:text-forest-400 hover:text-forest-700 dark:hover:text-forest-300 font-medium tracking-tight transition-colors duration-200 ease-soft"
                         >
                           Log workout →
                         </button>
                       </div>
                     </div>

                      {/* Tasks Card */}
                      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1 group animate-fade-in" style={{ animationDelay: '200ms' }}>
                       <div className="p-6">
                         <div className="flex items-center gap-4">
                           <div className="flex-shrink-0">
                             <div className="w-12 h-12 bg-clay-100 dark:bg-clay-900/30 rounded-xl flex items-center justify-center group-hover:bg-clay-200 dark:group-hover:bg-clay-800/40 transition-all duration-200 ease-soft">
                               <svg className="w-6 h-6 text-clay-600 dark:text-clay-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                             </div>
                           </div>
                            <div className="flex-1">
                              <dt className="text-sm font-medium text-stone-600 dark:text-stone-400">
                                Pending Tasks
                              </dt>
                              <dd className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                                {getPendingTaskCount()} tasks
                              </dd>
                            </div>
                         </div>
                       </div>
                       <div className="bg-stone-50 dark:bg-stone-800/50 px-6 py-4 border-t border-stone-200/50 dark:border-stone-700/50">
                         <button
                           onClick={() => setActiveSection('tasks')}
                           className="text-clay-600 dark:text-clay-400 hover:text-clay-700 dark:hover:text-clay-300 font-medium tracking-tight transition-colors duration-200 ease-soft"
                         >
                           Manage tasks →
                         </button>
                       </div>
                     </div>
                   </>
                  )}
               </div>

                {/* Quick Actions */}
                {isLoading ? (
                  <div className="mt-10">
                    <div className="h-7 w-48 bg-stone-200 dark:bg-stone-700 rounded-lg animate-pulse mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map((button) => (
                        <div key={button} className="h-14 bg-stone-200 dark:bg-stone-700 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
                   <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
                     Quick Actions
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     <button
                       onClick={() => setActiveSection('weight')}
                       className="bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-opacity-20 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
                     >
                       <Plus className="w-5 h-5" />
                       Add Weight Entry
                     </button>
                     <button
                       onClick={() => setActiveSection('workout')}
                       className="bg-forest-600 hover:bg-forest-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-opacity-20 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
                     >
                       <Dumbbell className="w-5 h-5" />
                       Log Workout
                     </button>
                     <button
                       onClick={() => setActiveSection('tasks')}
                       className="bg-clay-600 hover:bg-clay-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-clay-500 focus:ring-opacity-20 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
                     >
                       <CheckSquare className="w-5 h-5" />
                       Create Task
                     </button>
                   </div>
                 </div>
                )}
             </div>
           )}

           {activeSection === 'weight' && (
             <div className="animate-fade-in">
               <div className="mb-6">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium tracking-tight transition-colors duration-200 ease-soft flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
              <WeightSection />
            </div>
          )}

           {activeSection === 'workout' && (
             <div className="animate-fade-in">
               <div className="mb-6">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="text-forest-600 dark:text-forest-400 hover:text-forest-700 dark:hover:text-forest-300 font-medium tracking-tight transition-colors duration-200 ease-soft flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
              <WorkoutSection />
            </div>
          )}

           {activeSection === 'tasks' && (
             <div className="animate-fade-in">
               <div className="mb-6">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="text-clay-600 dark:text-clay-400 hover:text-clay-700 dark:hover:text-clay-300 font-medium tracking-tight transition-colors duration-200 ease-soft flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
              <TaskSection />
            </div>
          )}

        </div>
      </main>
      <BottomNav activeSection={activeSection} setActiveSection={setActiveSection} />
    </div>
  );
}

export default Dashboard;
