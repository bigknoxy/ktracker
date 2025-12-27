import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import SkeletonLoader from './SkeletonLoader';
import TaskList from './TaskList';
import AnimatedChart from './AnimatedChart';
import FloatingAction from './FloatingAction';
import { apiService } from '../services/api';
import type { Task } from '../types';

const TaskSection: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await apiService.getTasks();
      if (response.data) {
        setTasks(response.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  // Calculate task analytics
  const calculateTaskAnalytics = () => {
    if (tasks.length === 0) return null;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Priority distribution
    const priorityCounts = {
      low: tasks.filter(task => task.priority === 'low').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      high: tasks.filter(task => task.priority === 'high').length
    };

    // Due date analysis
    const today = new Date();
    const overdueTasks = tasks.filter(task => !task.completed && task.dueDate && new Date(task.dueDate) < today).length;
    const dueSoonTasks = tasks.filter(task => !task.completed && task.dueDate && new Date(task.dueDate) <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) && new Date(task.dueDate) >= today).length;

    // Recent completion trend (last7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentCompletions = tasks.filter(task => task.completed && task.updatedAt && new Date(task.updatedAt) >= last7Days).length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      priorityCounts,
      overdueTasks,
      dueSoonTasks,
      recentCompletions
    };
  };

  const analytics = calculateTaskAnalytics();

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
            Task Management
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
            Organize your productivity and track your accomplishments
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-clay-600 hover:bg-clay-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-clay-500 focus:ring-opacity-20 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          Create Task
        </button>
      </div>

      {/* Productivity Overview */}
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {analytics.completionRate.toFixed(0)}%
                  </p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                      className="dark:stroke-stone-700"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray={`${analytics.completionRate} 100`}
                      className="transition-all duration-1000 ease-soft"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Pending Tasks</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {analytics.pendingTasks}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">High Priority</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {analytics.priorityCounts.high}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Recent Completed</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {analytics.recentCompletions}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-clay-100 dark:bg-clay-900/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-clay-600 dark:text-clay-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">No tasks yet</h3>
          <p className="text-stone-600 dark:text-stone-400 text-sm mb-6">Start by creating your first task to boost your productivity</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-clay-600 hover:bg-clay-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105"
          >
            Create First Task
          </button>
        </div>
      )}

      {showForm && (
        <div className="animate-slide-up">
          <TaskForm
            onSuccess={handleAddTask}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
              Task List
            </h3>
            <TaskList />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
              Productivity Insights
            </h3>
            {analytics && analytics.totalTasks > 0 ? (
              <div className="space-y-6">
                {/* Completion Rate Chart */}
                <div className="h-[200px]">
                  <AnimatedChart
                    data={[
                      { date: 'Completed', value: analytics.completedTasks, category: 'completed' },
                      { date: 'Pending', value: analytics.pendingTasks, category: 'pending' },
                      { date: 'Overdue', value: analytics.overdueTasks, category: 'overdue' }
                    ]}
                    type="bar"
                    title="Task Distribution"
                    color="#3B82F6"
                    showGrid={true}
                    showTooltip={true}
                  />
                </div>

                {/* Priority Distribution */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                    <div className="w-8 h-8 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{analytics.priorityCounts.low}</div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">Low</div>
                  </div>
                  <div className="text-center p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                    <div className="w-8 h-8 mx-auto mb-2 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{analytics.priorityCounts.medium}</div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">Medium</div>
                  </div>
                  <div className="text-center p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                    <div className="w-8 h-8 mx-auto mb-2 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{analytics.priorityCounts.high}</div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">High</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-stone-600 dark:text-stone-400">
                <div className="text-sm">No tasks yet</div>
                <div className="text-xs mt-2 opacity-75">
                  Create your first task to see productivity insights
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
            id: 'add-task',
            label: 'Create Task',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            onClick: () => setShowForm(true),
            color: 'text-clay-600 dark:text-clay-400'
          }
        ]}
        position="bottom-right"
        size="md"
      />
    </div>
  );
};

export default TaskSection;