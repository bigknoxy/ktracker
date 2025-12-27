# kTracker

A full-stack weight, workout, and task management application built with modern web technologies. Features JWT-based authentication, interactive data visualization, and a responsive dark mode UI for tracking health and productivity in one place.

## Features

- Weight tracking with interactive charts and trend analysis
- Workout logging with exercise details and sets/reps
- Task management with priorities and completion tracking
- Dark mode theme support with automatic persistence
- Mobile-responsive design with bottom navigation
- JWT-based user authentication with secure sessions
- Real-time data validation and error handling
- Animated transitions and skeleton loading states
- Accessible WCAG 2.1 AA compliant interface
- Toast notifications for user feedback

## Tech Stack

**Backend:**
- Runtime: Bun
- Framework: Hono
- Database: SQLite (development), PostgreSQL (production-ready)
- ORM: Prisma
- Authentication: JWT with bcrypt

**Frontend:**
- Framework: React 18 with TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS
- State Management: React Context API
- Charts: Recharts
- Testing: Cypress E2E

## Quick Start

### Prerequisites
- Bun >= 1.2.21
- Node.js >= 18
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bigknoxy/ktracker.git
   cd ktracker
   ```

2. Install dependencies:
   ```bash
   bun install
   cd frontend && npm install && cd ..
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to configure your settings (see `.env.example` for details)

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development servers:
   ```bash
   # Terminal 1: Backend
   bun run index.ts

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

6. Open your browser to `http://localhost:5173`

## Development

### Available Scripts

**Root directory:**
- `bun run index.ts` - Start backend server
- `npx prisma migrate dev` - Create/run database migration
- `npx prisma db seed` - Seed database with sample data
- `npx prisma studio` - Open Prisma Studio (database GUI)

**Frontend directory:**
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run Cypress E2E tests

### Project Structure

```
ktracker/
├── backend/
│   ├── middleware/        # Auth middleware
│   ├── prisma/           # Database schema and migrations
│   └── routes/           # API endpoints (auth, users, weight, workouts, tasks)
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   ├── pages/         # Page components (Dashboard, Login, Register)
│   │   ├── services/      # API service layer
│   │   └── utils/         # Utility functions
│   └── cypress/           # E2E tests
└── thoughts/              # Architecture and planning docs
```

## Testing

### E2E Testing with Cypress

```bash
cd frontend
npm run test
```

Tests are organized in `frontend/cypress/e2e/`:
- Registration flow validation
- UI features (dark mode, mobile responsiveness, animations)
- Accessibility compliance

### Manual Testing Guide

See [MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md) for detailed testing instructions.

## API Documentation

API endpoints are auto-documented. Run the backend server and access:
- Swagger/OpenAPI docs at `/docs` (if enabled)

See [docs/api.md](docs/api.md) for detailed API reference.

## Architecture

For detailed architecture diagrams and system design, see:
- [Architecture Design Document](thoughts/architecture/design_document.md)
- [CLAUDE.md](CLAUDE.md) - Complete development guide and command reference

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and recent changes.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the need for comprehensive fitness tracking
