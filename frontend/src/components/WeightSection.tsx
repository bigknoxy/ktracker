import React, { useState, useEffect } from 'react';
import WeightForm from './WeightForm';
import WeightList from './WeightList';
import WeightChart from './WeightChart';
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

  if (loading) {
    return <div className="text-center py-8">Loading weight data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Weight Tracking</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Weight Entry
        </button>
      </div>

      {showForm && (
        <WeightForm
          onSuccess={handleAddEntry}
          onCancel={handleFormCancel}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Entries</h3>
          <WeightList />
        </div>
        <div>
          <WeightChart entries={entries} />
        </div>
      </div>
    </div>
  );
};

export default WeightSection;