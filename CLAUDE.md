# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**kTracker** is a full-stack weight, workout, and task management application built with modern technologies. The application targets individuals interested in tracking their health and productivity in a single place.

### Technology Stack

**Backend:**
- Runtime: Bun v1.2.21 (TypeScript)
- API Framework: Hono
- ORM: Prisma with SQLite (development) / PostgreSQL (production)
- Authentication: bcrypt + JWT
- Validation: Zod
- Testing: Cypress (E2E only)

**Frontend:**
- Framework: React 19 + TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS 4.x (class-based with dark mode support)
- Routing: React Router DOM v6
- Charts: Recharts
- Icons: Lucide React
- Form Handling: React Hook Form + Zod
- HTTP Client: Axios
- Testing: Cypress (E2E only)

**DevOps & Tools:**
- Version Control: Git with Husky pre-commit hooks
- Database: Prisma ORM with migrations
- Docker: PostgreSQL container for development
- Environment: Environment variables via dotenv

## Development Commands

### Backend Commands
```bash
# Start development server
bun run index.ts

# Start test environment (with test database)
npm run dev:test

# Run database migrations
npx prisma migrate dev

# Seed database
npm run db:seed

# Generate Prisma client
npx prisma generate
```

### Frontend Commands
```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

### Testing Commands
```bash
# Setup test environment
npm run test:setup

# Run E2E tests
npm run test:e2e

# Run E2E tests in CI mode
npm run test:e2e:ci

# Run Cypress tests (from frontend)
npm run test:e2e
npm run test:e2e:open  # Open Cypress UI

# Cleanup test database
npm run test:cleanup
```

### Database & Prisma
```bash
# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name "migration_name"

# Push schema changes (development only)
npx prisma db push

# Seed database
npx prisma db seed
```

### Docker Commands
```bash
# Start PostgreSQL database
docker-compose up -d postgres

# Stop PostgreSQL database
docker-compose down postgres

# View database logs
docker-compose logs postgres
```

## Code Architecture

### Backend Structure
```
backend/
├── routes/           # API route handlers
│   ├── auth.ts       # Authentication endpoints
│   ├── users.ts      # User management
│   ├── weight.ts     # Weight tracking
│   ├── workouts.ts   # Workout management
│   └── tasks.ts      # Task management
├── middleware/       # Express-style middleware
│   └── auth.ts       # JWT authentication
├── prisma/           # Database schema and migrations
│   ├── schema.prisma # Data models
│   └── seed.ts       # Test data
└── generated/        # Prisma client (auto-generated)
```

### Frontend Structure
```
frontend/src/
├── components/       # Reusable UI components
│   ├── ThemeToggle.tsx      # Dark/light mode toggle
│   ├── BottomNav.tsx        # Mobile navigation
│   ├── SkeletonLoader.tsx   # Loading states
│   ├── WeightForm.tsx       # Weight entry form
│   ├── WeightList.tsx       # Weight entries list
│   ├── WeightSection.tsx    # Weight tracking section
│   ├── WorkoutForm.tsx      # Workout entry form
│   ├── WorkoutList.tsx      # Workout entries list
│   ├── WorkoutSection.tsx   # Workout tracking section
│   ├── TaskForm.tsx         # Task creation form
│   ├── TaskList.tsx         # Task list with completion
│   ├── TaskSection.tsx      # Task management section
│   └── Weight*/             # Weight tracking components
├── pages/            # Page-level components
│   ├── Dashboard.tsx        # Main application page
│   └── Login.tsx            # Authentication
├── contexts/         # React context providers
│   └── ThemeContext.tsx     # Theme state management
├── services/         # API communication layer
│   └── api.ts              # HTTP client and endpoints
└── routes/           # API service functions
```

### Data Models
- **User**: Authentication and profile data (username, email, password)
- **WeightEntry**: Weight tracking with date and value
- **Workout**: Exercise sessions with duration and exercises
- **WorkoutExercise**: Individual exercises within workouts (sets, reps, weight)
- **Exercise**: Exercise definitions (name, type)
- **Task**: Productivity tasks with priority, completion status, and due date

## Key Features

### Authentication System
- Username/password authentication
- JWT-based session management
- bcrypt password hashing
- Protected routes via middleware

### Weight Tracking
- Add/edit/delete weight entries
- Weight history visualization with Recharts
- Date-based weight management
- Weight change calculations and trends

### Workout Management
- Create workouts with multiple exercises
- Track sets, reps, and weight for each exercise
- Exercise categorization and management
- Workout history and statistics

### Task Management
- Create tasks with priority levels (low, medium, high)
- Mark tasks as completed
- Due date tracking
- Smart sorting (incomplete first, then by priority, then by due date)

### Modern UI Features
- **Dark Mode**: Global theme toggle with persistence via localStorage
- **Mobile Navigation**: Bottom navigation for mobile devices with swipe-friendly buttons
- **Responsive Design**: Mobile-first approach with Tailwind responsive classes
- **Loading States**: Skeleton loaders for better UX during data fetching
- **Smooth Transitions**: Fade-in animations for section changes and loading states
- **Theme Context**: Global state management for dark/light theme switching

## Development Workflow

### Creating New Features
1. Create feature branch from `master`
2. Implement backend routes and models if needed
3. Add frontend components and pages
4. Write E2E tests using Cypress
5. Update database schema if needed (Prisma migrations)
6. Test locally with both development and test environments

### Database Changes
1. Update `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name "description"`
3. Test migrations work correctly
4. Update any affected API endpoints

### Testing Strategy
- **E2E Tests**: Cypress for user workflows (registration, CRUD operations)
- **Test Database**: Separate SQLite database for testing
- **Test Environment**: Use `NODE_ENV=test` with test database URL
- **Cypress Configuration**: Located in `cypress.config.cjs`

### Code Quality
- **Linting**: ESLint with TypeScript rules
- **Pre-commit Hooks**: Husky (currently skips tests in MVP)
- **Type Safety**: Full TypeScript coverage
- **Validation**: Zod schemas for API request/response validation

## Environment Configuration

### Development Environment
- Database: SQLite (`dev.db`)
- Backend: Port 3000
- Frontend: Port 5173 (Vite dev server)
- Proxy: Frontend proxies API requests to backend
- Environment Variables: `.env` file or environment

### Test Environment
- Database: SQLite (`test.db`)
- Environment variables set in package.json scripts
- Separate test database for E2E tests
- Test data seeded via `npm run db:seed`

### Production Environment
- Database: PostgreSQL (via Docker)
- Environment: `NODE_ENV=production`
- JWT secret: Configured via environment variables
- HTTPS: Required for production deployment

## Important Files

### Configuration
- `package.json` - Backend dependencies and scripts
- `frontend/package.json` - Frontend dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/postcss.config.js` - PostCSS configuration for Tailwind
- `docker-compose.yml` - PostgreSQL development database
- `backend/prisma/schema.prisma` - Database schema

### API Routes
- `backend/routes/auth.ts` - Authentication endpoints
- `backend/routes/weight.ts` - Weight tracking endpoints
- `backend/routes/workouts.ts` - Workout management endpoints
- `backend/routes/tasks.ts` - Task management endpoints

### Main Application Files
- `index.ts` - Backend server entry point
- `frontend/src/main.tsx` - Frontend entry point
- `frontend/src/App.tsx` - Main frontend component
- `frontend/src/pages/Dashboard.tsx` - Main application page

### Context and State Management
- `frontend/src/contexts/ThemeContext.tsx` - Theme state management
- `frontend/src/services/api.ts` - HTTP client and API endpoints

## Security Considerations

### Current Security Measures
- Input validation with Zod schemas
- Password hashing with bcrypt
- JWT-based authentication with expiration
- HTTPS configuration for production
- CORS configuration for API security

### Development Security Notes
- Use environment variables for sensitive data
- Validate all API inputs
- Implement rate limiting for production
- Consider CSRF protection for forms
- Use secure JWT secrets and proper expiration times

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check environment variables and ensure database is running
2. **Cypress tests failing**: Ensure test database is properly seeded and backend is running
3. **TypeScript errors**: Run `npx prisma generate` to update client types
4. **Frontend build errors**: Check TypeScript compilation and dependency versions
5. **CSS processing issues**: Ensure PostCSS configuration is correct and Tailwind directives are processed

### Development Tips
- Use `bun run dev:test` for isolated testing environment
- Run `npm run test:setup` before E2E tests
- Clear test database with `npm run test:cleanup` if tests fail
- Check `.env` file for correct configuration
- Use `npm run lint` to check code quality
- Restart development server if CSS changes don't appear

### UI/UX Specific
- Theme toggle functionality uses localStorage for persistence
- Bottom navigation is mobile-only (hidden on desktop via `md:hidden`)
- Skeleton loaders are used during data fetching for better UX
- All interactive elements should have proper hover and focus states
- Responsive design uses Tailwind's mobile-first approach

## Component Architecture

### Shared Components
- **ThemeToggle**: Dark/light mode toggle with localStorage persistence
- **BottomNav**: Mobile navigation with emoji icons and responsive design
- **SkeletonLoader**: Reusable loading states with animation
- **Form Components**: Consistent styling with validation and error handling

### Feature Components
- **Weight Tracking**: Form, list, and chart components for weight management
- **Workout Tracking**: Complex forms for multi-exercise workouts
- **Task Management**: List with completion toggling and priority sorting

### Patterns
- Context API for theme state management
- RESTful API patterns with proper error handling
- Component composition for reusable UI elements
- Mobile-first responsive design approach

This codebase represents a complete MVP with modern UI/UX features including dark mode, mobile responsiveness, and comprehensive state management.