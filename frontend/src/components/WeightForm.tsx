import React, { useState } from 'react';
import { apiService } from '../services/api';
import type { WeightEntry } from '../types';

interface WeightFormProps {
  onSuccess: (entry: WeightEntry) => void;
  onCancel: () => void;
}

const WeightForm: React.FC<WeightFormProps> = ({ onSuccess, onCancel }) => {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError('Please enter a valid weight');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiService.addWeightEntry(weightValue, date);
      if (response.data) {
        onSuccess(response.data);
      } else {
        setError(response.error || 'Failed to add weight entry');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Weight Entry</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Weight (lbs)
          </label>
          <input
            type="number"
            id="weight"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeightForm;