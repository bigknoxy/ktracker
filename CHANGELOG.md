# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Removed `.env`, database files, and test artifacts from version control
- Updated all architecture docs to reflect TypeScript/Bun/Hono implementation

### Security
- Secured `.gitignore` to prevent accidental commits of sensitive files
- Removed sensitive database artifacts and configuration files
- Enhanced security practices for development environment

## [0.3.0] - 2025-12-26

### Added

**UI/UX Modernization:**
- Dark mode support with automatic theme persistence (ThemeContext)
- Mobile-responsive design with bottom navigation (BottomNav component)
- Animated charts for weight tracking (AnimatedChart component)
- Skeleton loading states for better perceived performance (SkeletonLoader)
- Toast notification system for user feedback (ToastNotification)
- Floating action button for quick task/workout entry
- Smooth transitions and animations throughout the app

**Task Management:**
- Task creation with title, description, and priority (TaskForm)
- Task list with completion tracking (TaskList)
- Task filtering by priority and status (TaskSection)

**Workout Enhancement:**
- Improved workout logging UI with better form layout
- Exercise set tracking with reps and weight
- Workout history with enhanced display (WorkoutList)

**Weight Tracking Improvements:**
- Interactive weight chart with trend visualization (WeightChart)
- Enhanced weight entry form with validation (WeightForm)
- Weight history list with sorting and filtering (WeightList)
- Weight statistics and insights on dashboard

**Accessibility:**
- WCAG 2.1 AA compliant implementation
- Keyboard navigation support for all interactive elements
- ARIA labels and roles throughout
- Focus management for modals and forms
- Screen reader friendly markup
- Sufficient color contrast in both themes
- Accessibility utilities in src/utils/accessibility.ts
- Accessibility-specific styles in src/styles/accessibility.css

**Testing Infrastructure:**
- Comprehensive E2E tests with Cypress
- Registration flow validation tests
- UI feature tests (dark mode, mobile responsiveness, animations)
- Edge case and security tests
- Empty state tests
- Loading skeleton tests
- Success animation tests
- Toast notification tests

**Code Quality:**
- ESLint configuration with strict rules
- TypeScript strict mode enabled
- Performance optimizations in src/utils/performance.ts
- Comprehensive type definitions in src/types/index.ts
- Pre-commit hooks for code quality

**Documentation:**
- Accessibility implementation guide (ACCESSIBILITY_IMPLEMENTATION.md)
- Demo verification report (DEMO_VERIFICATION_REPORT.md)
- Production UI polish plan (PRODUCTION_UI_POLISH_PLAN.md)
- UI polish progress tracking (UI_POLISH_PROGRESS.md)
- Manual testing guide (MANUAL_TESTING_GUIDE.md)
- Lint progress report (LINT_PROGRESS_REPORT.md)
- Feature UI modernization plan and tickets

### Changed
- Dashboard UI completely redesigned with modern card-based layout
- Updated authentication UI with improved UX
- Enhanced form validation with better error messages
- Improved responsive design across all breakpoints
- Updated Tailwind configuration for theme support

### Fixed
- Dark mode white frame issue resolved
- Mobile navigation z-index issues fixed
- Form submission state management improved
- Loading state handling optimized
- Theme persistence on page load

## [0.2.0] - 2025-09-03

### Added

**Frontend Implementation:**
- React 19 with Vite for fast development
- TypeScript for type safety across frontend codebase
- Tailwind CSS 4.x for utility-first styling
- React Router for client-side routing
- React Hook Form for form management
- Axios for API requests
- Recharts for data visualization

**Authentication UI:**
- Login page with form validation (Login.tsx)
- Registration page with password confirmation (Register.tsx)
- AuthContext for session management and protected routes
- JWT token handling and storage

**Dashboard:**
- Main dashboard layout with quick action buttons
- Overview sections for weight, workouts, and tasks
- Navigation to all major features
- Responsive design with mobile-first approach

**Weight Tracking UI:**
- Weight entry form with validation (WeightForm.tsx)
- Weight list with delete functionality (WeightList.tsx)
- Weight section with chart display (WeightSection.tsx)
- Weight chart using Recharts (WeightChart.tsx)

**Testing Infrastructure:**
- Cypress E2E testing framework
- Registration flow tests (success, validation, edge cases)
- Test fixtures for test users
- GitHub Actions workflow for CI/CD E2E tests
- Test database setup and cleanup scripts

**Development Tools:**
- ESLint configuration for code quality
- TypeScript configuration for strict type checking
- PostCSS for CSS processing
- Pre-commit hooks setup with Husky

### Changed
- Updated backend to support frontend API requests
- Enhanced user authentication flow with session management
- Improved API error handling and response formatting

### Security
- Password strength validation on registration
- Input validation with Zod schemas
- XSS protection through React's built-in escaping

## [0.1.0] - 2025-08-28

### Added

**Backend Infrastructure:**
- Bun runtime for high-performance server-side JavaScript
- Hono web framework for fast HTTP routing
- TypeScript for type-safe backend code
- Prisma ORM for database operations
- PostgreSQL database support via Docker
- SQLite for local development
- JWT-based authentication with bcrypt password hashing

**API Endpoints:**
- Authentication routes: POST /api/auth/register, /api/auth/login, /api/auth/logout
- User routes: GET /api/users/profile, PUT /api/users/profile
- Weight tracking routes: GET /api/weight, POST /api/weight, DELETE /api/weight/:id
- Workout logging routes: GET /api/workouts, POST /api/workouts, DELETE /api/workouts/:id
- Task management routes: GET /api/tasks, POST /api/tasks, PUT /api/tasks/:id, DELETE /api/tasks/:id

**Database Models:**
- User model with id, username, email, passwordHash
- WeightEntry model with id, userId, weight, date
- Workout model with id, userId, date, duration, exercises
- Exercise model with sets, reps, weight
- Task model with id, userId, title, description, priority, status, dueDate

**Development Setup:**
- Docker Compose for PostgreSQL container
- Database migrations with Prisma
- Seed script for initial data
- TypeScript configuration
- Package scripts for development and testing

**Documentation:**
- Architecture design document with C4 diagrams
- MVP implementation plan
- Project structure overview
- Development guidelines in CLAUDE.md

### Security
- Secure password hashing with bcrypt
- JWT token authentication
- Input validation with Zod
- SQL injection prevention via Prisma ORM
- CORS configuration for API access

## [0.0.1] - 2025-08-26

### Added
- Project initialization
- Repository structure setup
- Backend and frontend directories
- Initial package.json configuration
- Pre-commit hooks setup
- README with project description
- Architecture summary documentation

---

## Release Notes Format

### Added - New features
### Changed - Changes in existing functionality
### Deprecated - Soon-to-be removed features
### Removed - Removed features
### Fixed - Bug fixes
### Security - Security vulnerability fixes

## Versioning

- Major version (X.0.0): Incompatible API changes
- Minor version (0.X.0): Backwards-compatible functionality
- Patch version (0.0.X): Backwards-compatible bug fixes
