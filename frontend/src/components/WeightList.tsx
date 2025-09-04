import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { WeightEntry } from '../types';

const WeightList: React.FC = () => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this weight entry?')) {
      return;
    }

    try {
      const response = await apiService.deleteWeightEntry(id);
      if (response.data !== undefined) {
        setEntries(entries.filter(entry => entry.id !== id));
      } else {
        setError(response.error || 'Failed to delete weight entry');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading weight entries...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No weight entries yet. Add your first entry above!
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {entries.map((entry) => (
          <li key={entry.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {entry.weight.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.weight} lbs
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeightList;