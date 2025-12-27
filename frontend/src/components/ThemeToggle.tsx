import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { useFocusVisible, useScreenReader } from '../utils/accessibility';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isUsingKeyboard = useFocusVisible();
  const { announce } = useScreenReader();

  useEffect(() => {
    // Announce theme change to screen readers
    announce(`Theme switched to ${theme} mode`, 100);
  }, [theme, announce]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  const handleClick = () => {
    toggleTheme();
  };

  // WCAG 2.1 AA compliant color contrast classes
  const getButtonClasses = () => {
    const baseClasses = `
      ml-2 px-4 py-2.5 rounded-lg transition-all duration-200 ease-soft
      border-2 font-medium tracking-tight text-sm
      focus:outline-none focus:ring-4 focus:ring-offset-2
      focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-900
      hover:scale-105 active:scale-95
    `;

    if (theme === 'dark') {
      return `
        ${baseClasses}
        bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-gray-600
        text-gray-100 hover:text-white
        shadow-lg shadow-gray-900/20
      `;
    } else {
      return `
        ${baseClasses}
        bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300
        text-gray-900 hover:text-gray-800
        shadow-md shadow-gray-200/50
      `;
    }
  };

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={getButtonClasses()}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      aria-pressed={theme === 'dark'}
      aria-live="polite"
      role="switch"
      tabIndex={0}
      style={{
        ...(prefersReducedMotion ? { transition: 'none' } : {}),
        outline: isUsingKeyboard ? '2px solid #3b82f6' : 'none',
        outlineOffset: isUsingKeyboard ? '2px' : '0'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-opacity-20 transition-all duration-200">
          {theme === 'dark' ? (
            <Moon
              size={18}
              className="text-yellow-300 drop-shadow-sm"
              aria-hidden="true"
            />
          ) : (
            <Sun
              size={18}
              className="text-orange-500 drop-shadow-sm"
              aria-hidden="true"
            />
          )}
        </div>
        <span className="sr-only">{theme === 'dark' ? 'Current: Dark mode' : 'Current: Light mode'}</span>
        <span className="hidden sm:inline">
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
        <span className="text-xs opacity-75 hidden sm:inline">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </div>
    </button>
  );
};

export default ThemeToggle;
