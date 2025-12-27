/**
 * Accessibility utilities for kTracker
 * WCAG 2.1 AA compliance utilities and helpers
 */

import { useEffect, useRef, useState } from 'react';

// Color contrast checking utilities
export const generateWCAGColors = () => {
  return {
    // Text colors with sufficient contrast (4.5:1 for normal text, 3:1 for large text)
    text: {
      primary: 'text-gray-900 dark:text-white',
      secondary: 'text-gray-700 dark:text-gray-200',
      muted: 'text-gray-600 dark:text-gray-300',
      disabled: 'text-gray-400 dark:text-gray-500',
      error: 'text-red-700 dark:text-red-400',
      success: 'text-green-700 dark:text-green-400',
      warning: 'text-amber-700 dark:text-amber-400',
      info: 'text-blue-700 dark:text-blue-400'
    },
    // Background colors for interactive elements
    bg: {
      interactive: 'bg-white dark:bg-gray-800',
      hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
      focus: 'focus:bg-gray-100 dark:focus:bg-gray-700',
      active: 'active:bg-gray-200 dark:active:bg-gray-600'
    },
    // Border colors for focus indicators
    border: {
      focus: 'focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-800',
      focusDark: 'focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 focus:ring-offset-black dark:focus:ring-offset-gray-900',
      error: 'border-red-500 dark:border-red-400',
      warning: 'border-amber-500 dark:border-amber-400'
    }
  };
};

// Focus management utilities
export const useFocusManagement = () => {
  const focusTrapRef = useRef<HTMLElement>(null);

  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      } else if (e.key === 'Escape') {
        // Handle escape key for modal dismissals
        const closeButton = element.querySelector('[data-close-modal]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  };

  return { trapFocus, focusTrapRef };
};

// ARIA live region utilities
export const useLiveRegion = () => {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      // Clear after a short delay to allow screen readers to read
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return { announce, liveRegionRef };
};

// Motion preference utilities
export const useMotionPreference = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Keyboard navigation utilities
export const useKeyboardNavigation = (
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (index: number) => void
) => {
   const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          e.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, items.length - 1);
          if (items[nextIndex]) {
            items[nextIndex].focus();
            onIndexChange(nextIndex);
          }
          break;
        }
        case 'ArrowUp':
        case 'ArrowLeft': {
          e.preventDefault();
          const prevIndex = Math.max(currentIndex - 1, 0);
          if (items[prevIndex]) {
            items[prevIndex].focus();
            onIndexChange(prevIndex);
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (items[0]) {
            items[0].focus();
            onIndexChange(0);
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          const lastIndex = items.length - 1;
          if (items[lastIndex]) {
            items[lastIndex].focus();
            onIndexChange(lastIndex);
          }
          break;
        }
       case 'Tab':
         break;
       default:
         break;
     }
   };

  useEffect(() => {
    if (items[currentIndex]) {
      items[currentIndex].focus();
    }
  }, [currentIndex, items]);

  return { handleKeyDown };
};

// Screen reader utilities
export const useScreenReader = () => {
  const announce = (message: string, delay = 100) => {
    setTimeout(() => {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      announcer.textContent = message;
      document.body.appendChild(announcer);

      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 1000);
    }, delay);
  };

  return { announce };
};

// Contrast checking utility
export const checkContrast = (): number => {
  // Simplified contrast checking - in production, use a more robust library
  const getLuminance = (): number => {
    // This is a simplified version - real implementation would parse hex/rgb colors
    // and calculate proper luminance values
    return 0.5; // placeholder
  };

  const L1 = getLuminance();
  const L2 = getLuminance();
  const contrast = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  return contrast;
};

// Focus visible polyfill (for browsers that don't support :focus-visible)
export const useFocusVisible = () => {
  const [isUsingKeyboard, setIsUsingKeyboard] = useState(false);

  useEffect(() => {
    const handleKeyDown = () => setIsUsingKeyboard(true);
    const handleMouseDown = () => setIsUsingKeyboard(false);

    document.addEventListener('keydown', handleKeyDown, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isUsingKeyboard;
};

// Skip link utilities
export const createSkipLink = (targetId: string, label: string = 'Skip to main content') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = `
    fixed top-0 left-0 z-50 p-2 bg-blue-600 text-white
    opacity-0 pointer-events-none transition-all duration-300
    focus:opacity-100 focus:pointer-events-auto -translate-y-full focus:translate-y-0
    hover:bg-blue-700 focus:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white
  `;
  skipLink.style.left = '-9999px';
  skipLink.style.top = '0';

  document.body.insertBefore(skipLink, document.body.firstChild);

  return () => {
    document.body.removeChild(skipLink);
  };
};

// Form validation accessibility utilities
export const useFormAccessibility = () => {
  const showError = (inputId: string, errorMessage: string) => {
    const input = document.getElementById(inputId);
    const errorId = `${inputId}-error`;

    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errorId);

      let errorElement = document.getElementById(errorId);
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'text-red-600 dark:text-red-400 text-sm mt-1';
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        input.parentNode?.appendChild(errorElement);
      }

      errorElement.textContent = errorMessage;
    }
  };

  const clearError = (inputId: string) => {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(`${inputId}-error`);

    if (input) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.remove();
    }
  };

  return { showError, clearError };
};

// Modal accessibility utilities
export const useModalAccessibility = (
  isOpen: boolean,
  onClose: () => void,
  initialFocusRef?: React.RefObject<HTMLElement>
) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal or initial focus element
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }

      // Trap focus within the modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, onClose, initialFocusRef]);

  return { modalRef };
};

// Color blindness simulation utilities (for testing)
export const simulateColorVision = {
  deuteranopia: () => {
    document.body.style.filter = 'url(#deuteranopia-filter)';
  },
  protanopia: () => {
    document.body.style.filter = 'url(#protanopia-filter)';
  },
  tritanopia: () => {
    document.body.style.filter = 'url(#tritanopia-filter)';
  },
  reset: () => {
    document.body.style.filter = 'none';
  }
};

// Export all accessibility utilities
export const accessibility = {
  generateWCAGColors,
  useFocusManagement,
  useLiveRegion,
  useMotionPreference,
  useKeyboardNavigation,
  useScreenReader,
  checkContrast,
  useFocusVisible,
  createSkipLink,
  useFormAccessibility,
  useModalAccessibility,
  simulateColorVision
};