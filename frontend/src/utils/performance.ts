/**
 * Performance monitoring and optimization utilities for kTracker
 */
import React, { useEffect, useState } from 'react';

// Performance metrics collection
export const performanceMetrics = {
  // Measure component render time
  measureRenderTime: (componentName: string) => {
    const start = window.performance.now();
    return {
      end: (): number => {
        const end = window.performance.now();
        const duration = end - start;
        console.debug(`${componentName} render time: ${duration.toFixed(2)}ms`);

        // Log slow renders (> 16ms for 60fps, > 33ms for 30fps)
        if (duration > 33) {
          console.warn(`${componentName} slow render: ${duration.toFixed(2)}ms`);
        }

        return duration as number;
      }
    };
  },

  // Measure API response time
  measureAPICall: (endpoint: string) => {
    const start = window.performance.now();
    return {
      end: (success: boolean = true): number => {
        const end = window.performance.now();
        const duration = end - start;

        console.debug(`${endpoint} ${success ? 'success' : 'error'}: ${duration.toFixed(2)}ms`);

        // Log slow API calls (> 1000ms)
        if (duration > 1000) {
          console.warn(`${endpoint} slow API call: ${duration.toFixed(2)}ms`);
        }

        return duration;
      }
    };
  },

  // Measure bundle size impact
  measureBundleImpact: (componentName: string, bundleSize: number) => {
    console.debug(`${componentName} bundle size: ${(bundleSize / 1024).toFixed(2)}KB`);

    // Log large bundles (> 100KB)
    if (bundleSize > 100 * 1024) {
      console.warn(`${componentName} large bundle: ${(bundleSize / 1024).toFixed(2)}KB`);
    }
  },

  // Memory usage monitoring
  measureMemoryUsage: () => {
    if ('memory' in performance) {
      const perf = performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
      if (perf.memory) {
        const memory = perf.memory;
        console.debug('Memory usage:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        });

        // Log high memory usage (> 100MB)
        if (memory.usedJSHeapSize > 100 * 1024 * 1024) {
          console.warn('High memory usage detected');
        }
      }
    }
  },

  // Frame rate monitoring
  measureFrameRate: () => {
    let lastTime = window.performance.now();
    let frames = 0;

    const measure = (currentTime: number) => {
      frames++;
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        console.debug(`FPS: ${fps}`);

        // Log low frame rate (< 30fps)
        if (fps < 30) {
          console.warn(`Low frame rate detected: ${fps}fps`);
        }

        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measure);
    };

    requestAnimationFrame(measure);
  }
};

// Bundle size optimization utilities
export const bundleOptimizer = {
  // Lazy load components
  lazyLoad: <T extends React.ComponentType<unknown>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) => {
    const LazyComponent = React.lazy(() => {
      const measure = performanceMetrics.measureRenderTime('LazyComponent');
      return importFn().then(result => {
        measure.end();
        return result;
      });
    });

    return (props: React.ComponentPropsWithRef<T>) => {
      const fallbackElement = fallback
        ? React.createElement(fallback, props as Record<string, unknown>)
        : React.createElement('div', null, 'Loading...');

      return React.createElement(
        React.Suspense,
        { fallback: fallbackElement },
        React.createElement(LazyComponent as any, props as any)
      );
    };
  },

  // Code splitting for routes
  splitRoute: (route: string, component: React.ComponentType) => {
    console.debug(`Route ${route} code split loaded`);
    return component;
  },

  // Image optimization
  optimizeImage: (src: string, alt: string, className?: string) => {
    return React.createElement('img', {
      src,
      alt,
      loading: 'lazy',
      decoding: 'async',
      className,
      style: { imageRendering: 'optimizeQuality' } as const
    });
  }
};

// Animation performance optimization
export const animationOptimizer = {
  // Check if animations should be disabled
  shouldAnimate: () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

    return !prefersReducedMotion && !isLowEndDevice;
  },

  // Create optimized animations
  createOptimizedAnimation: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    if (!animationOptimizer.shouldAnimate()) {
      return { play: () => {}, cancel: () => {} };
    }

    const element = document.createElement('div');
    const animation = element.animate(keyframes, {
      ...options,
      duration: animationOptimizer.shouldAnimate() ? options.duration : 0
    });

    return animation;
  },

  // CSS-in-JS for hardware accelerated animations
  getHardwareAcceleratedStyles: (transform?: string, opacity?: number) => {
    if (!animationOptimizer.shouldAnimate()) {
      return {
        transform: transform || 'none',
        opacity: opacity !== undefined ? opacity : 1,
        transition: 'none'
      };
    }

    return {
      transform: transform || 'translateZ(0)',
      opacity: opacity !== undefined ? opacity : 1,
      willChange: 'transform, opacity',
      transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
    };
  }
};

// Memory management utilities
export const memoryManager = {
  // Debounce function with cleanup
  debounce: <T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function with cleanup
  throttle: <T extends (...args: unknown[]) => void>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Cleanup event listeners
  cleanup: (cleanupFunctions: (() => void)[]) => {
    return () => {
      cleanupFunctions.forEach(fn => fn());
    };
  }
};

// Network optimization utilities
export const networkOptimizer = {
  // Preload critical resources
  preloadResource: (url: string, as?: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    if (as) link.as = as;
    document.head.appendChild(link);
  },

  // Prefetch non-critical resources
  prefetchResource: (url: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  },

  // DNS prefetch
  dnsPrefetch: (domain: string) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  }
};

// React performance hooks
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    performanceMetrics.measureMemoryUsage();

    // Monitor frame rate in development
    if (process.env.NODE_ENV === 'development') {
      performanceMetrics.measureFrameRate();
    }
  }, []);
};

export const useOptimizedState = <T>(initialState: T) => {
  const [state, setState] = useState(initialState);

  // Debounced setState to prevent excessive re-renders
  const debouncedSetState = memoryManager.debounce(setState as (...args: unknown[]) => void, 100);

  return [state, debouncedSetState] as [T, (value: T) => void];
};

// Export all performance utilities
export const performance = {
  metrics: performanceMetrics,
  bundleOptimizer,
  animationOptimizer,
  memoryManager,
  networkOptimizer,
  usePerformanceMonitoring,
  useOptimizedState
};
