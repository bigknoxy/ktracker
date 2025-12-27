import React, { useState, useEffect, useRef } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../services/api';
import type { Task } from '../types';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await apiService.getTasks();
      if (response.data) {
        setTasks(response.data);
      } else {
        setError(response.error || 'Failed to load tasks');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    try {
      // Add animation for completion
      setCompletedTasks(prev => [...prev, id]);
      await new Promise(resolve => setTimeout(resolve, 200));

      const response = await apiService.updateTask(id, { completed });
      if (response.data) {
        setTasks(prev => prev.map(task => task.id === id ? response.data! : task));
      }
    } catch {
      setError('An unexpected error occurred');
      setCompletedTasks(prev => prev.filter(taskId => taskId !== id));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await apiService.deleteTask(id);
      if (response.data !== undefined) {
        // Add smooth removal animation
        setTasks(prev => prev.filter(task => {
          if (task.id === id) {
            const element = document.querySelector(`[data-task-id="${id}"]`);
            if (element) {
              element.classList.add('animate-out', 'fade-out', 'slide-out-to-right', 'duration-300');
            }
            return false;
          }
          return true;
        }));
        setTimeout(() => {
          setTasks(prev => prev.filter(task => task.id !== id));
        }, 300);
      } else {
        setError(response.error || 'Failed to delete task');
      }
    } catch {
      setError('An unexpected error occurred');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return priority;
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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks yet. Create your first task above!
      </div>
    );
  }

  // Sort tasks: incomplete first, then by priority, then by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion status (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Sort by priority (high to low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    // Sort by due date (earliest first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md sm:rounded-lg px-2 sm:px-4 md:px-6 transition-all duration-300 ease-out hover:shadow-lg">
      <ul ref={listRef} className="divide-y divide-gray-200 dark:divide-gray-700">
        {sortedTasks.map((task, index) => (
          <li
            key={task.id}
            data-task-id={task.id}
            className={`px-6 py-4 transition-all duration-300 ease-out hover:bg-purple-50/50 dark:hover:bg-purple-900/20 ${
              hoveredId === task.id ? 'bg-purple-50/30 dark:bg-purple-900/30 scale-[1.01] shadow-sm' : ''
            } ${
              completedTasks.includes(task.id) ? 'animate-in fade-in duration-200' : ''
            }`}
            onMouseEnter={() => setHoveredId(task.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id, task.completed)}
                    className={`mt-1 h-5 w-5 rounded transition-all duration-300 ease-out cursor-pointer ${
                      task.completed
                        ? 'bg-green-500 border-green-500 ring-2 ring-green-200 dark:ring-green-800'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
                    }`}
                  />
                  {task.completed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-semibold transition-all duration-300 ${
                      task.completed ? 'line-through text-gray-500 dark:text-gray-400 opacity-75' : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      getPriorityColor(task.priority)
                    }`}>
                      <span className="mr-2">•</span>
                      {getPriorityLabel(task.priority)}
                    </span>
                    {index === 0 && !task.completed && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 dark:from-purple-900/30 dark:to-indigo-900/30 dark:text-purple-300 animate-pulse">
                        Focus Task
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className={`text-sm transition-all duration-300 ${
                      task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {task.description}
                    </p>
                  )}
                  {task.dueDate && (
                    <div className={`flex items-center space-x-2 text-xs transition-all duration-300 ${
                      task.completed ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002-2z" />
                      </svg>
                      <span>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {new Date(task.dueDate) < new Date() && !task.completed && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs">
                            Overdue
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className={`px-2 py-1 rounded-full ${
                    task.completed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                    Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <button
                  onClick={() => handleDelete(task.id)}
                  className="group flex items-center space-x-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                >
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
              {task.completed && (
                <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Task completed successfully!</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
