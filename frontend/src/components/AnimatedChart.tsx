import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface AnimatedChartProps {
  data: Array<{ date: string; value: number; fullDate?: string; category?: string }>;
  type?: 'line' | 'bar' | 'area';
  title?: string;
  yLabel?: string;
  color?: string;
  animate?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  data,
  type = 'line',
  title,
  yLabel,
  color = '#4F46E5',
  animate = true,
  showGrid = true,
  showTooltip = true
}) => {
  // Generate smooth gradient for the chart
  const gradientId = `gradient-${Math.random().toString(36).slice(2, 7)}`;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-stone-800 p-3 rounded-lg shadow-soft border border-stone-200/50 dark:border-stone-700/50">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">{label}</p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {payload[0].dataKey}: <span className="font-semibold text-sage-600 dark:text-sage-400">{payload[0].value}</span>
            {yLabel && ` ${yLabel}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const baseProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      className: "animate-fade-in"
    };

    const axisProps = {
      tick: { fontSize: 12, fill: 'currentColor' },
      tickLine: false,
      axisLine: false,
      label: { fontSize: 12, fill: 'currentColor' }
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...baseProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis {...axisProps} dataKey="date" interval="preserveStartEnd" />
            <YAxis {...axisProps} domain={['auto', 'auto']} />
            {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }} />}
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Bar
              dataKey="value"
              fill={`url(#${gradientId})`}
              stroke={color}
              strokeWidth={2}
              radius={[4, 4, 0, 0]}
              animationDuration={animate ? 1000 : 0}
              animationEasing="ease-out"
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...baseProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis {...axisProps} dataKey="date" interval="preserveStartEnd" />
            <YAxis {...axisProps} domain={['auto', 'auto']} />
            {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }} />}
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                <stop offset="100%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              dot={{ fill: color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
              animationDuration={animate ? 1500 : 0}
              animationEasing="ease-out"
            />
          </AreaChart>
        );

      default:
        return (
          <LineChart {...baseProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis {...axisProps} dataKey="date" interval="preserveStartEnd" />
            <YAxis {...axisProps} domain={['auto', 'auto']} />
            {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }} />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              animationDuration={animate ? 1500 : 0}
              animationEasing="ease-out"
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-soft border border-stone-200/50 dark:border-stone-700/50 overflow-hidden transition-all duration-200 ease-soft hover:shadow-soft-lg hover:-translate-y-1">
      {title && (
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            {title}
          </h3>
        </div>
      )}
      <div className="p-6 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnimatedChart;