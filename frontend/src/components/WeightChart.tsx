import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { WeightEntry } from '../types';

interface WeightChartProps {
  entries: WeightEntry[];
  showTrend?: boolean;
  showTarget?: boolean;
  targetWeight?: number;
}

const WeightChart: React.FC<WeightChartProps> = ({
  entries,
  showTrend = true,
  showTarget = false,
  targetWeight
}) => {
  // Sort entries by date and format for chart
  const chartData = entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      weight: entry.weight,
      fullDate: entry.date,
    }));

  // Calculate trend line data
  const calculateTrendLine = () => {
    if (chartData.length < 2) return [];

    const n = chartData.length;
    const sumX = chartData.reduce((sum, _, index) => sum + index, 0);
    const sumY = chartData.reduce((sum, item) => sum + item.weight, 0);
    const sumXY = chartData.reduce((sum, item, index) => sum + (index * item.weight), 0);
    const sumX2 = chartData.reduce((sum, _, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return chartData.map((item, index) => ({
      date: item.date,
      weight: intercept + slope * index
    }));
  };

  const trendData = showTrend ? calculateTrendLine() : [];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { index?: number } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const currentWeight = payload[0].value;
      const dataIndex = payload[0].payload.index;
      const trendWeight = dataIndex !== undefined ? trendData[dataIndex]?.weight : undefined;

      return (
        <div className="bg-white dark:bg-stone-800 p-3 rounded-lg shadow-soft border border-stone-200/50 dark:border-stone-700/50">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-stone-600 dark:text-stone-400">
              Current: <span className="font-semibold text-sage-600 dark:text-sage-400">{currentWeight} lbs</span>
            </p>
            {showTrend && trendWeight && (
              <p className="text-stone-600 dark:text-stone-400">
                Trend: <span className="font-semibold text-forest-600 dark:text-forest-400">{trendWeight.toFixed(1)} lbs</span>
              </p>
            )}
            {showTarget && targetWeight && (
              <p className="text-stone-600 dark:text-stone-400">
                Target: <span className="font-semibold text-clay-600 dark:text-clay-400">{targetWeight} lbs</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
            Weight Progress
          </h3>
          <div className="text-center py-8 text-stone-600 dark:text-stone-400">
            <div className="text-sm">No weight data to display</div>
            <div className="text-xs mt-2 opacity-75">
              Add some entries to see your progress and trends
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
          Weight Progress
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} className="animate-fade-in">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 5']}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '3 3' }}
              />

              {/* Target weight reference line */}
              {showTarget && targetWeight && (
                <ReferenceLine
                  y={targetWeight}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Target: ${targetWeight} lbs`,
                    position: 'insideTopRight',
                    fill: '#EF4444',
                    fontSize: 11,
                    fontWeight: 'medium'
                  }}
                />
              )}

              {/* Trend line */}
              {showTrend && trendData.length > 0 && (
                <Line
                  type="linear"
                  dataKey="weight"
                  data={trendData}
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              )}

              {/* Main weight line with enhanced styling */}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="url(#weightGradient)"
                strokeWidth={3}
                dot={{
                  fill: 'url(#weightGradient)',
                  r: 5,
                  stroke: '#4F46E5',
                  strokeWidth: 2
                }}
                activeDot={{
                  r: 7,
                  stroke: '#4F46E5',
                  strokeWidth: 3,
                  fill: 'white'
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WeightChart;