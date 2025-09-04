import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeightEntry } from '../types';

interface WeightChartProps {
  entries: WeightEntry[];
}

const WeightChart: React.FC<WeightChartProps> = ({ entries }) => {
  // Sort entries by date and format for chart
  const chartData = entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      weight: entry.weight,
      fullDate: entry.date,
    }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weight Trend</h3>
        <div className="text-center py-8 text-gray-500">
          No weight data to display. Add some entries to see your progress!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Weight Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fontSize: 12 }}
              label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number) => [`${value} lbs`, 'Weight']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#4F46E5', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeightChart;