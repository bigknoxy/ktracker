import React, { useState, useEffect } from 'react';
import WeightForm from './WeightForm';
import SkeletonLoader from './SkeletonLoader';
import WeightList from './WeightList';
import WeightChart from './WeightChart';
import FloatingAction from './FloatingAction';
import { apiService } from '../services/api';
import type { WeightEntry } from '../types';

const WeightSection: React.FC = () => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeightEntries();
  }, []);

  const loadWeightEntries = async () => {
    try {
      const response = await apiService.getWeightEntries();
      if (response.data) {
        setEntries(response.data);
      }
    } catch (err) {
      console.error('Failed to load weight entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = (entry: WeightEntry) => {
    setEntries(prev => [entry, ...prev]);
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  // Calculate progress metrics
  const calculateProgress = () => {
    if (entries.length === 0) return null;

    const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentWeight = sortedEntries[sortedEntries.length - 1]?.weight;
    const startWeight = sortedEntries[0]?.weight;
    const weightChange = startWeight - currentWeight;
    const progressPercentage = startWeight > 0 ? (weightChange / startWeight) * 100 : 0;

    return {
      currentWeight,
      startWeight,
      weightChange: Math.abs(weightChange),
      isLoss: weightChange > 0,
      progressPercentage: Math.abs(progressPercentage)
    };
  };

  const progress = calculateProgress();

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
            Weight Tracking
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
            Monitor your progress and set new goals
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-sage-600 hover:bg-sage-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-opacity-20 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          Add Weight Entry
        </button>
      </div>

      {/* Progress Overview */}
      {progress ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Current Weight</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {progress.currentWeight} lbs
                  </p>
                </div>
                <div className={`p-3 rounded-full ${progress.isLoss ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <svg className={`w-6 h-6 ${progress.isLoss ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={progress.isLoss ? "M13 7h8m0 0v8m0-8l-8 8-4-4-8-8" : "M13 17h8m0 0V9m0 8l-8-8-4 4-8 8"} />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Weight Change</p>
                  <p className={`text-2xl font-bold ${progress.isLoss ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} tracking-tight`}>
                    {progress.weightChange.toFixed(1)} lbs
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-600 dark:text-stone-400">Start: {progress.startWeight} lbs</p>
                  <p className={`text-sm font-medium ${progress.isLoss ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {progress.isLoss ? 'Lost' : 'Gained'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Progress</p>
                  <p className="text-2xl font-bold text-sage-600 dark:text-sage-400 tracking-tight">
                    {progress.progressPercentage.toFixed(1)}%
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
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray={`${progress.progressPercentage * 1.01} 100`}
                      className="transition-all duration-1000 ease-soft"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-sage-100 dark:bg-sage-900/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-sage-600 dark:text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">No weight entries yet</h3>
          <p className="text-stone-600 dark:text-stone-400 text-sm mb-6">Start by adding your first weight entry to begin tracking your progress</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-sage-600 hover:bg-sage-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ease-soft transform hover:scale-105"
          >
            Add First Entry
          </button>
        </div>
      )}

      {showForm && (
        <div className="animate-slide-up">
          <WeightForm
            onSuccess={handleAddEntry}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
              Recent Entries
            </h3>
            <WeightList />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
              Weight Progress
            </h3>
            <WeightChart entries={entries} showTrend={true} showTarget={false} />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingAction
        actions={[
          {
            id: 'add-weight',
            label: 'Add Weight',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
            onClick: () => setShowForm(true),
            color: 'text-sage-600 dark:text-sage-400'
          }
        ]}
        position="bottom-right"
        size="md"
      />
    </div>
  );
};

export default WeightSection;