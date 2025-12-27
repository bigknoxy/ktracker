# kTracker Frontend

## UI Modernization Features

This application features a modern, responsive UI built with React, TypeScript, Vite, and Tailwind CSS. Key UI features include:

- **Dark Mode:** Toggle between light and dark themes using the ThemeToggle button. Theme state is persisted and uses Tailwind's dark mode classes.
- **Mobile Bottom Navigation:** A fixed, mobile-only BottomNav provides quick access to Dashboard, Weight, Workouts, and Tasks sections.
- **Responsive Layouts:** All major components use Tailwind responsive classes for optimal experience on mobile, tablet, and desktop.
- **Smooth Transitions:** Section changes and major UI elements use fade-in transitions for a polished feel.
- **Skeleton Loaders:** Loading states use animated skeleton loaders for cards, lists, and charts, improving perceived performance.

## Main UI Components

- `ThemeToggle.tsx`: Button to toggle dark/light mode.
- `BottomNav.tsx`: Mobile navigation bar for quick section switching.
- `WeightSection.tsx`: Main weight tracking interface, includes form, list, and chart.
- `WeightForm.tsx`: Add new weight entry.
- `WeightList.tsx`: List of recent weight entries.
- `WeightChart.tsx`: Chart of weight trends over time.
- `SkeletonLoader.tsx`: Reusable animated skeleton loader for loading states.
- `ThemeContext.tsx`: Provides theme state and persistence.

## Design System

- Built with Tailwind CSS utility classes for rapid development and easy theming.
- Uses React context for global state (theme).
- All components are mobile-first and support dark mode.

See `thoughts/architecture/design_document.md` for architectural details and design decisions.
