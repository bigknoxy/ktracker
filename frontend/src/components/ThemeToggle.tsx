import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { useFocusVisible, useScreenReader } from '../utils/accessibility';

/**
 * ThemeToggle - Theme switcher button
 *
 * @description
 * Renders a toggle button to switch between light and dark themes.
 * Integrates with ThemeContext to update application's theme.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 *
 * @returns {JSX.Element} The rendered theme toggle button
 *
 * @author kTracker Team
 * @since 0.1.0
 */
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
      ml-2 p-2 rounded-full transition-all duration-200 ease-soft
      border font-medium
      focus:outline-none focus:ring-2 focus:ring-offset-1
      focus:ring-sage-500 focus:ring-offset-white dark:focus:ring-offset-stone-900
      hover:scale-105 active:scale-95
    `;

    if (theme === 'dark') {
      return `
        ${baseClasses}
        bg-stone-800/80 hover:bg-stone-700/90 border-stone-700/40 hover:border-stone-600/50
        text-stone-200 hover:text-stone-100
        shadow-sm shadow-stone-900/10
      `;
    } else {
      return `
        ${baseClasses}
        bg-stone-100/50 hover:bg-stone-200/70 border-stone-200/40 hover:border-stone-300/50
        text-stone-700 hover:text-stone-800
        shadow-sm shadow-stone-400/5
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
      <div className="flex items-center justify-center">
        {theme === 'dark' ? (
          <Moon
            size={18}
            className="text-stone-200 drop-shadow-sm transition-transform duration-200"
            aria-hidden="true"
          />
        ) : (
          <Sun
            size={18}
            className="text-stone-600 drop-shadow-sm transition-transform duration-200"
            aria-hidden="true"
          />
        )}
      </div>
      <span className="sr-only">{theme === 'dark' ? 'Current: Dark mode' : 'Current: Light mode'}</span>
    </button>
  );
};

export default ThemeToggle;
