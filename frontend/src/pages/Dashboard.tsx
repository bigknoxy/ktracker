import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import WeightSection from '../components/WeightSection';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'weight' | 'workout' | 'tasks'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">kTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`text-sm font-medium ${
                    activeSection === 'dashboard'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveSection('weight')}
                  className={`text-sm font-medium ${
                    activeSection === 'weight'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Weight
                </button>
                <button
                  onClick={() => setActiveSection('workout')}
                  className={`text-sm font-medium ${
                    activeSection === 'workout'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Workouts
                </button>
                <button
                  onClick={() => setActiveSection('tasks')}
                  className={`text-sm font-medium ${
                    activeSection === 'tasks'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tasks
                </button>
              </nav>
              <span className="text-gray-700">Welcome, {user?.username}!</span>
              <button
                onClick={logout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeSection === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Weight Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">W</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Current Weight
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            -- lbs
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <button
                        onClick={() => setActiveSection('weight')}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        Manage weight →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Workout Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🏋️</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Recent Workout
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            No workouts yet
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <button
                        onClick={() => setActiveSection('workout')}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        Log workout →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tasks Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Pending Tasks
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            0 tasks
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <button
                        onClick={() => setActiveSection('tasks')}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        Manage tasks →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveSection('weight')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Add Weight Entry
                  </button>
                  <button
                    onClick={() => setActiveSection('workout')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Log Workout
                  </button>
                  <button
                    onClick={() => setActiveSection('tasks')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </>
          )}

          {activeSection === 'weight' && (
            <div>
              <div className="mb-4">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <WeightSection />
            </div>
          )}

          {activeSection === 'workout' && (
            <div>
              <div className="mb-4">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <div className="text-center py-8 text-gray-500">
                Workout tracking coming soon!
              </div>
            </div>
          )}

          {activeSection === 'tasks' && (
            <div>
              <div className="mb-4">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <div className="text-center py-8 text-gray-500">
                Task management coming soon!
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;