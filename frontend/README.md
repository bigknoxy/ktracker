# kTracker Frontend

Modern, responsive React frontend for kTracker fitness tracking application.

## Features

### Core Features
- **Authentication**: Secure JWT-based login and registration
- **Weight Tracking**: Interactive charts showing weight trends over time
- **Workout Logging**: Log workouts with exercises, sets, and reps
- **Task Management**: Create and manage tasks with priorities
- **Dark Mode**: Automatic theme persistence with smooth transitions
- **Mobile Responsive**: Optimized for mobile with bottom navigation
- **Real-time Feedback**: Toast notifications for all user actions
- **Loading States**: Skeleton loaders for better perceived performance
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

## Tech Stack

- React 19 with TypeScript
- Vite (build tool and dev server)
- Tailwind CSS (styling)
- React Context API (state management)
- React Router DOM (routing)
- Recharts (data visualization)
- Axios (HTTP client)
- Cypress (E2E testing)
- React Hook Form (form handling)
- Zod (validation)

## Installation

### Prerequisites
- Node.js >= 18
- npm >= 9

### Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (if different from defaults):
   Create `.env` file (optional - defaults work with local backend):
   ```bash
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_TITLE=kTracker
   ```

4. Ensure backend is running (see root README.md)

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open browser to `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production (output: `dist/`)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
- `npm run test:e2e` - Run Cypress E2E tests
- `npm run test:e2e:open` - Open Cypress Test Runner
- `npm run test:e2e:ci` - Run Cypress tests for CI

### Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable React components
│   │   ├── WeightChart.tsx      # Weight trend visualization
│   │   ├── WeightForm.tsx       # Weight entry form
│   │   ├── WeightList.tsx       # Weight history display
│   │   ├── WorkoutForm.tsx      # Workout logging form
│   │   ├── WorkoutList.tsx      # Workout history
│   │   ├── TaskForm.tsx         # Task creation form
│   │   ├── TaskList.tsx         # Task display with completion
│   │   ├── ThemeToggle.tsx      # Dark mode toggle
│   │   ├── BottomNav.tsx        # Mobile navigation
│   │   ├── ToastNotification.tsx # Feedback toasts
│   │   ├── SkeletonLoader.tsx   # Loading skeleton
│   │   ├── AnimatedChart.tsx    # Chart wrapper with animations
│   │   ├── FloatingAction.tsx   # Floating action button
│   │   ├── WeightSection.tsx    # Weight tracking section
│   │   ├── WorkoutSection.tsx   # Workout tracking section
│   │   └── TaskSection.tsx      # Task management section
│   ├── contexts/         # React contexts for global state
│   │   ├── AuthContext.tsx     # Authentication state & methods
│   │   └── ThemeContext.tsx     # Theme (light/dark) state
│   ├── pages/            # Page-level components
│   │   ├── Dashboard.tsx        # Main app dashboard
│   │   ├── Login.tsx            # Login page
│   │   └── Register.tsx         # Registration page
│   ├── services/         # API integration layer
│   │   └── api.ts               # Axios instance with interceptors
│   ├── hooks/            # Custom React hooks
│   │   └── useToast.ts          # Toast notification hook
│   ├── utils/            # Utility functions
│   │   ├── accessibility.ts    # Accessibility helpers
│   │   └── performance.ts      # Performance optimizations
│   ├── styles/           # Global styles
│   │   └── accessibility.css   # Accessibility-specific styles
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts             # Shared types
│   ├── App.tsx            # Root component with routing
│   └── main.tsx          # Application entry point
├── cypress/              # E2E tests
│   ├── e2e/             # Test suites
│   │   ├── registration/       # Registration flow tests
│   │   └── ui-features/        # UI feature tests
│   └── support/         # Test utilities
├── index.html
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### Component Architecture

**State Management:**
- `AuthContext` - Manages user authentication state globally
- `ThemeContext` - Manages light/dark theme with localStorage persistence

**Data Flow:**
1. User actions (forms, clicks) trigger API calls via `api.ts`
2. API responses update local state in components or contexts
3. Context changes propagate to all consuming components
4. UI re-renders with new state

**Error Handling:**
- API errors intercepted and displayed via toast notifications
- Form validation before API calls
- Loading states during async operations

### Styling Guide

- All styling uses Tailwind CSS utility classes
- Theme colors: Stone (neutral), Blue (primary), Red (danger)
- Dark mode uses `dark:` prefix for theme-specific styles
- Responsive design: Mobile-first with `md:` and `lg:` breakpoints

### Type Safety

- TypeScript strict mode enabled
- All props have interface definitions
- API responses typed in `src/types/index.ts`
- No `any` types allowed (use `unknown` instead)

## Testing

### E2E Testing with Cypress

```bash
npm run test:e2e
```

Tests cover:
- User registration and authentication
- Dark mode functionality
- Mobile responsiveness
- Loading states and animations
- Toast notifications
- Accessibility features

See [cypress/README.md](cypress/README.md) for detailed test documentation.

### Manual Testing

See [MANUAL_TESTING_GUIDE.md](../MANUAL_TESTING_GUIDE.md) for comprehensive testing checklist.

## Building for Production

1. Create production build:
   ```bash
   npm run build
   ```

2. Test build locally:
   ```bash
   npm run preview
   ```

3. Deploy the `dist/` directory to your hosting provider

## Accessibility

- All interactive elements keyboard accessible
- Proper ARIA labels and roles
- Focus management for modals and forms
- Sufficient color contrast (WCAG 2.1 AA)
- Screen reader friendly markup

See [ACCESSIBILITY_IMPLEMENTATION.md](../ACCESSIBILITY_IMPLEMENTATION.md) for details.

## Troubleshooting

**Backend connection errors:**
- Ensure backend is running on port 3000
- Check VITE_API_URL in .env matches backend URL

**TypeScript errors:**
- Ensure all dependencies installed
- Check tsconfig.json for strict mode settings

**Styling issues:**
- Clear browser cache
- Check Tailwind CSS is properly configured

**Test execution issues:**
- Ensure backend and frontend servers are running
- Check port availability (backend: 3000, frontend: 5173)

## Contributing

See root [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## License

See root [LICENSE](../LICENSE) file.
