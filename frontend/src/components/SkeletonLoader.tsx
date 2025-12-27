import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  type?: 'text' | 'card' | 'list' | 'form';
  animated?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  lines = 3,
  type = 'text',
  animated = true
}) => {
  const getBaseClasses = () => {
    const base = 'rounded-lg transition-all duration-1000 ease-in-out';
    const animation = animated ? 'animate-pulse' : '';
    const bgGradient = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';
    return `${base} ${animation} ${bgGradient}`;
  };

  const getLineHeight = (index: number) => {
    switch (type) {
      case 'form':
        return index === 0 ? 'h-10' : index === 1 ? 'h-12' : 'h-4';
      case 'card':
        return index === 0 ? 'h-6' : index === 1 ? 'h-4' : 'h-3';
      case 'list':
        return index === 0 ? 'h-12' : index === 1 ? 'h-4' : 'h-3';
      default:
        return 'h-4';
    }
  };

  const getWidth = (index: number) => {
    switch (type) {
      case 'form':
        return index === 0 ? 'w-full' : index === 1 ? 'w-full' : `w-${Math.max(60, 80 - index * 10)}%`;
      case 'card':
        return index === 0 ? 'w-3/4' : index === 1 ? 'w-1/2' : `w-${Math.max(40, 70 - index * 10)}%`;
      case 'list':
        return 'w-full';
      default:
        return `w-${Math.max(40, 80 - index * 10)}%`;
    }
  };

  const getMargin = (index: number) => {
    switch (type) {
      case 'form':
        return index === 0 || index === 1 ? 'mb-4' : 'mb-2';
      case 'card':
        return index === 0 ? 'mb-3' : index === 1 ? 'mb-2' : 'mb-1';
      case 'list':
        return index === 0 ? 'mb-4' : 'mb-2';
      default:
        return 'mb-2';
    }
  };

  const getShape = (index: number) => {
    switch (type) {
      case 'form':
        return 'rounded-lg';
      case 'card':
        return index === 0 ? 'rounded-md' : 'rounded';
      case 'list':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`
            ${getBaseClasses()}
            ${getLineHeight(i)}
            ${getWidth(i)}
            ${getMargin(i)}
            ${getShape(i)}
            opacity-80 hover:opacity-100
            shadow-sm
          `}
          style={{
            backgroundClip: 'padding-box',
            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
