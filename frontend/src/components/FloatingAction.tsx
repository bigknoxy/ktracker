import React, { useState, useEffect, useRef } from 'react';
import { Plus, Weight, Dumbbell, CheckCircle } from 'lucide-react';
import { useFocusVisible } from '../utils/accessibility';

interface FloatingActionProps {
  actions: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: string;
    shortcut?: string;
    keyboardShortcut?: string;
  }>;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  disabled?: boolean;
}

const FloatingAction: React.FC<FloatingActionProps> = ({
  actions,
  position = 'bottom-right',
  size = 'md',
  showLabels = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const actionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUsingKeyboard = useFocusVisible();

  useEffect(() => {
    // Staggered entrance animation
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-20 right-6 md:bottom-6',
    'bottom-left': 'bottom-20 left-6 md:bottom-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizeClasses = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const buttonClasses = `
    fixed ${positionClasses[position]} z-50 transition-all duration-300 ease-soft
    ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
  `;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          const action = actions[focusedIndex];
          if (action) {
            action.onClick();
            setIsOpen(false);
            setFocusedIndex(-1);
          }
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      }
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault();
        if (isOpen) {
          const nextIndex = Math.min(focusedIndex + 1, actions.length - 1);
          setFocusedIndex(nextIndex);
          actionRefs.current[nextIndex]?.focus();
        } else {
          setIsOpen(true);
          setFocusedIndex(0);
          actionRefs.current[0]?.focus();
        }
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault();
        if (isOpen && focusedIndex > 0) {
          const prevIndex = Math.max(0, focusedIndex - 1);
          setFocusedIndex(prevIndex);
          actionRefs.current[prevIndex]?.focus();
        }
        break;
      }
      case 'Tab': {
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
          actionRefs.current[0]?.focus();
        }
        break;
      }
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const renderActions = () => {
    if (!isOpen || actions.length === 0) return null;

    return (
      <div
        className="absolute space-y-3"
        role="menu"
        aria-label="Quick actions menu"
      >
        {actions.map((action, index) => (
          <div
            key={action.id}
            ref={el => {
              actionRefs.current[index] = el;
              return;
            }}
            role="menuitem"
            tabIndex={index === focusedIndex ? 0 : -1}
            className={`
              flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800
              rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
              transform transition-all duration-300 ease-soft
              hover:shadow-2xl hover:-translate-y-1
              animate-slide-up
              ${showLabels ? 'w-auto' : 'w-12 h-12'}
              ${index === focusedIndex ? 'ring-2 ring-blue-500/50 bg-blue-50 dark:bg-blue-900/20' : ''}
              ${isUsingKeyboard && index === focusedIndex ? 'ring-2 ring-blue-500' : ''}
            `}
            style={{
              animationDelay: `${index * 50}ms`,
              transform: `translateY(-${(actions.length - index) * 60}px)`,
              outline: 'none'
            }}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              closeMenu();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                action.onClick();
                closeMenu();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                closeMenu();
                buttonRef.current?.focus();
              }
            }}
            onMouseEnter={() => setFocusedIndex(index)}
            aria-label={`${action.label} ${action.shortcut ? `(${action.shortcut})` : ''}`}
          >
            <div
              className={`
                ${action.color || 'text-green-600 dark:text-green-400'}
                ${showLabels ? 'ml-1' : ''}
              `}
            >
              {React.cloneElement(action.icon as React.ReactElement, {
                className: showLabels ? '' : 'mx-auto',
                'aria-hidden': 'true'
              } as Record<string, unknown> | React.DOMAttributes<unknown>)}
            </div>
            {showLabels && (
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                {action.label}
              </span>
            )}
            {action.shortcut && (
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono border border-gray-200 dark:border-gray-600">
                {action.shortcut}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Floating action button */}
      <div className={buttonClasses}>
        {/* Actions list */}
        {renderActions()}

        {/* Main trigger button */}
        <button
          ref={buttonRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            ${sizeClasses[size]} rounded-full
            bg-gradient-to-br from-green-600 to-blue-600
            hover:from-green-700 hover:to-blue-700
            text-white shadow-xl
            border border-green-500/30
            transition-all duration-300 ease-soft
            focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2
            transform hover:scale-110 active:scale-95
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${isUsingKeyboard ? 'ring-2 ring-blue-500' : ''}
          `}
          aria-label="Quick actions"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls="quick-actions-menu"
          title="Quick actions"
          style={{
            outline: isUsingKeyboard ? '2px solid #3b82f6' : 'none',
            outlineOffset: isUsingKeyboard ? '2px' : '0'
          }}
        >
          <Plus
            size={iconSizeClasses[size]}
            className={`
              transition-transform duration-300 ease-soft
              ${isOpen ? 'rotate-45' : 'rotate-0'}
            `}
            aria-hidden="true"
          />
          <span className="sr-only">
            {isOpen ? 'Close quick actions' : 'Open quick actions'}
          </span>
        </button>
      </div>

      {/* Overlay to close when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ease-soft"
          onClick={closeMenu}
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
        />
      )}
    </>
  );
};

// Pre-configured action components with accessibility
export const WeightFloatingAction: React.FC<{ onAddWeight: () => void }> = ({ onAddWeight }) => (
  <FloatingAction
    actions={[
      {
        id: 'weight',
        label: 'Add Weight Entry',
        icon: <Weight />,
        onClick: onAddWeight,
        color: 'text-green-600 dark:text-green-400',
        shortcut: 'W',
        keyboardShortcut: 'W'
      }
    ]}
    position="bottom-right"
    size="md"
    showLabels={true}
  />
);

export const WorkoutFloatingAction: React.FC<{ onAddWorkout: () => void }> = ({ onAddWorkout }) => (
  <FloatingAction
    actions={[
      {
        id: 'workout',
        label: 'Log Workout',
        icon: <Dumbbell />,
        onClick: onAddWorkout,
        color: 'text-blue-600 dark:text-blue-400',
        shortcut: 'K',
        keyboardShortcut: 'K'
      }
    ]}
    position="bottom-right"
    size="md"
    showLabels={true}
  />
);

export const TaskFloatingAction: React.FC<{ onAddTask: () => void }> = ({ onAddTask }) => (
  <FloatingAction
    actions={[
      {
        id: 'task',
        label: 'Create Task',
        icon: <CheckCircle />,
        onClick: onAddTask,
        color: 'text-purple-600 dark:text-purple-400',
        shortcut: 'T',
        keyboardShortcut: 'T'
      }
    ]}
    position="bottom-right"
    size="md"
    showLabels={true}
  />
);

// Accessibility-focused variants
export const AccessibleFloatingAction: React.FC<FloatingActionProps> = (props) => (
  <FloatingAction {...props} showLabels={true} />
);

export default FloatingAction;
