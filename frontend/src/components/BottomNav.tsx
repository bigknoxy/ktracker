import React from 'react';
import { Home, Scale, Dumbbell, CheckSquare } from 'lucide-react';
import { useFocusVisible } from '../utils/accessibility';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  section: 'dashboard' | 'weight' | 'workout' | 'tasks';
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <Home size={20} />,
    section: 'dashboard'
  },
  {
    label: 'Weight',
    icon: <Scale size={20} />,
    section: 'weight'
  },
  {
    label: 'Workouts',
    icon: <Dumbbell size={20} />,
    section: 'workout'
  },
  {
    label: 'Tasks',
    icon: <CheckSquare size={20} />,
    section: 'tasks'
  },
];

interface BottomNavProps {
  activeSection: 'dashboard' | 'weight' | 'workout' | 'tasks';
  setActiveSection: (section: 'dashboard' | 'weight' | 'workout' | 'tasks') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeSection, setActiveSection }) => {
  const isUsingKeyboard = useFocusVisible();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = navItems.findIndex(item => item.section === activeSection);

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = Math.max(0, currentIndex - 1);
        setActiveSection(navItems[prevIndex].section);
        break;
      }
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = Math.min(navItems.length - 1, currentIndex + 1);
        setActiveSection(navItems[nextIndex].section);
        break;
      }
      case 'Home': {
        e.preventDefault();
        setActiveSection(navItems[0].section);
        break;
      }
      case 'End': {
        e.preventDefault();
        setActiveSection(navItems[navItems.length - 1].section);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        setActiveSection(navItems[currentIndex].section);
        break;
      }
    }
  };

  const handleClick = (section: 'dashboard' | 'weight' | 'workout' | 'tasks') => {
    setActiveSection(section);
  };

  // WCAG 2.1 AA compliant color contrast classes
  const getButtonClasses = (isActive: boolean) => {
    const baseClasses = `
      flex-1 py-4 px-3 flex flex-col items-center justify-center
      text-xs font-medium transition-all duration-200 ease-soft
      rounded-lg focus:outline-none focus:ring-4 focus:ring-offset-2
      focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-900
      border-2 border-transparent
    `;

    if (isActive) {
      return `
        ${baseClasses}
        bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
        border-blue-200 dark:border-blue-800
        shadow-sm
        ${isUsingKeyboard ? 'ring-2 ring-blue-500/50' : ''}
      `;
    } else {
      return `
        ${baseClasses}
        text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white
        hover:bg-gray-50 dark:hover:bg-gray-800
        hover:border-gray-300 dark:hover:border-gray-700
        active:scale-95
      `;
    }
  };

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <nav
      className="fixed bottom-0 left-0 w-full flex md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex w-full">
        {navItems.map((item) => {
          const isActive = activeSection === item.section;
          const isFirst = navItems.indexOf(item) === 0;

          return (
            <button
              key={item.section}
              onClick={() => handleClick(item.section)}
              onKeyDown={(e) => handleKeyDown(e)}
              className={getButtonClasses(isActive)}
              aria-label={`${item.label} ${isActive ? '(current page)' : ''}`}
              aria-selected={isActive}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-controls={`panel-${item.section}`}
              style={{
                ...(prefersReducedMotion ? { transition: 'none' } : {}),
                outline: isUsingKeyboard && isActive ? '2px solid #3b82f6' : 'none',
                outlineOffset: isUsingKeyboard && isActive ? '2px' : '0'
              }}
            >
              <div className="relative group">
                <div className={`transition-all duration-200 ease-soft ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                }`}>
                  {item.icon}
                </div>

                {/* Visual indicator for current section */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                )}

                {/* Keyboard navigation hints for screen readers */}
                <span className="sr-only">
                  {item.label}
                  {isActive ? ' (current page)' : ''}
                  {isFirst && ' Use arrow keys to navigate'}
                </span>
              </div>

              <span className="mt-1 tracking-tight font-medium">
                {item.label}
              </span>

              {/* Keyboard shortcuts for power users */}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 dark:text-gray-500">
                  ←/→
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
