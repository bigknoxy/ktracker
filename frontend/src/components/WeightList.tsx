import React, { useState, useEffect, useRef } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../services/api';
import type { WeightEntry } from '../types';
import { useFocusVisible } from '../utils/accessibility';

const WeightList: React.FC = () => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isUsingKeyboard = useFocusVisible();

  useEffect(() => {
    loadWeightEntries();
  }, []);

  const loadWeightEntries = async () => {
    try {
      const response = await apiService.getWeightEntries();
      if (response.data) {
        setEntries(response.data);
      } else {
        setError(response.error || 'Failed to load weight entries');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const entry = entries.find(e => e.id === id);
    const confirmMessage = `Are you sure you want to delete weight entry: ${entry?.weight} lbs from ${new Date(entry?.date || '').toLocaleDateString()}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await apiService.deleteWeightEntry(id);
      if (response.data !== undefined) {
        // Announce deletion to screen readers
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        announcer.textContent = `Weight entry deleted: ${entry?.weight} lbs`;
        document.body.appendChild(announcer);
        setTimeout(() => announcer.remove(), 1000);

        // Add smooth removal animation
        setEntries(prev => prev.filter(entry => {
          if (entry.id === id) {
            const element = document.querySelector(`[data-entry-id="${id}"]`);
            if (element) {
              element.classList.add('animate-out', 'fade-out', 'slide-out-to-left', 'duration-300');
            }
            return false;
          }
          return true;
        }));
        setTimeout(() => {
          setEntries(prev => prev.filter(entry => entry.id !== id));
        }, 300);
      } else {
        setError(response.error || 'Failed to delete weight entry');
      }
    } catch {
      setError('An unexpected error occurred');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleDelete(id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDelete(id);
    }
  };

  const getWeightChangeColor = (index: number) => {
    if (index === 0) return '';
    const current = entries[index].weight;
    const previous = entries[index + 1]?.weight;
    if (!previous) return '';
    const change = current - previous;
    return change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  };

  const getWeightChangeText = (index: number) => {
    if (index === 0) return '';
    const current = entries[index].weight;
    const previous = entries[index + 1]?.weight;
    if (!previous) return '';
    const change = current - previous;
    return change > 0 ? `+${change.toFixed(1)} lbs` : `${change.toFixed(1)} lbs`;
  };

  if (loading) {
    return (
      <div className="py-4" role="status" aria-live="polite">
        <SkeletonLoader
          lines={6}
          type="list"
          className="px-2 sm:px-4 md:px-6"
          aria-label="Loading weight entries"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 transition-all duration-300 animate-in slide-in-from-top-2 duration-300" role="alert" aria-live="assertive">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">Error Loading Entries</h4>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-blue-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
        <div className="text-blue-600 dark:text-blue-400 mb-4 flex justify-center">
          <svg className="w-12 h-12 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Weight Entries Yet</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Add your first weight entry above to start tracking your progress!
        </p>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Tip: Track your weight regularly for the best insights into your progress.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-out hover:shadow-xl">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weight History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {entries.length} entry{entries.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
              Latest: {entries[0]?.weight} lbs
            </span>
            {entries.length > 1 && (
              <span className={`px-2 py-1 rounded-full font-medium ${
                getWeightChangeColor(0) || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>
                Change: {getWeightChangeText(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      <ul
        ref={listRef}
        className="divide-y divide-gray-200 dark:divide-gray-700"
        role="list"
        aria-label="Weight entries list"
      >
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            data-entry-id={entry.id}
            className={`px-6 py-4 transition-all duration-300 ease-out hover:bg-blue-50/50 dark:hover:bg-blue-900/20 focus-within:bg-blue-50/50 dark:focus-within:bg-blue-900/20 ${
              hoveredId === entry.id || focusedId === entry.id ? 'bg-blue-50/30 dark:bg-blue-900/30 scale-[1.01] shadow-sm ring-2 ring-blue-200/50 dark:ring-blue-800/30' : ''
            } ${
              isUsingKeyboard && focusedId === entry.id ? 'ring-2 ring-blue-500/50' : ''
            }`}
            onMouseEnter={() => setHoveredId(entry.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setFocusedId(entry.id)}
            onBlur={() => setFocusedId(null)}
            tabIndex={0}
            role="listitem"
            aria-label={`Weight entry: ${entry.weight} lbs on ${new Date(entry.date).toLocaleDateString()}`}
            onKeyDown={(e) => handleKeyDown(e, entry.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Weight Display */}
                <div className="relative group">
                  <div className={`h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center shadow-lg transition-all duration-300 ease-out ${
                    hoveredId === entry.id || focusedId === entry.id ? 'scale-110 shadow-xl ring-4 ring-blue-300/50 dark:ring-blue-500/30' : ''
                  }`}>
                    <span className="text-white text-sm font-bold drop-shadow-sm tracking-tight">
                      {entry.weight.toFixed(1)}
                    </span>
                  </div>

                  {/* Latest entry indicator */}
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg animate-pulse">
                      Latest
                    </div>
                  )}

                  {/* Weight change indicator */}
                  {index > 0 && (
                    <div className={`absolute -top-1 -right-1 text-xs font-medium px-1.5 py-0.5 rounded-full shadow-sm ${
                      getWeightChangeColor(index) === 'text-red-600 dark:text-red-400'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}>
                      {getWeightChangeText(index)}
                    </div>
                  )}
                </div>

                {/* Entry Details */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {entry.weight} lbs
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      index === 0
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                    }`}>
                      {index === 0 ? 'Latest Entry' : `Entry #${entries.length - index}`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Weight change text */}
                  {index > 0 && (
                    <div className={`text-xs font-medium ${getWeightChangeColor(index) || 'text-gray-500 dark:text-gray-400'}`}>
                      Compared to previous entry: {getWeightChangeText(index)}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 transition-all duration-300">
                <button
                  onClick={() => handleDelete(entry.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDelete(entry.id)}
                  className="group flex items-center space-x-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                  aria-label={`Delete weight entry: ${entry.weight} lbs from ${new Date(entry.date).toLocaleDateString()}`}
                  title={`Delete entry: ${entry.weight} lbs`}
                >
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* List Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Showing {entries.length} weight {entries.length === 1 ? 'entry' : 'entries'}
          </span>
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
              Average: {(entries.reduce((acc, entry) => acc + entry.weight, 0) / entries.length).toFixed(1)} lbs
            </span>
            {entries.length > 1 && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                entries[0].weight > entries[entries.length - 1].weight
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              }`}>
                Trend: {entries[0].weight > entries[entries.length - 1].weight ? 'Increasing' : 'Decreasing'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightList;