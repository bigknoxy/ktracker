# Contributing to kTracker

Thank you for your interest in contributing to kTracker! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and collaborative. Treat all contributors with kindness and consideration. Disagreements are normal, but they should be handled constructively.

## Getting Started

### Prerequisites
- Bun >= 1.2.21
- Node.js >= 18
- npm >= 9
- Git

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ktracker.git
   cd ktracker
   ```

3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/bigknoxy/ktracker.git
   ```

4. Install dependencies:
   ```bash
   bun install
   cd frontend && npm install && cd ..
   ```

5. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. Initialize the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

7. Start development servers:
   ```bash
   # Terminal 1: Backend
   bun run index.ts

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## Development Workflow

### Create a Feature Branch

```bash
# Update your main branch
   git checkout master
   git pull upstream master

# Create a new branch for your feature
git checkout -b feature/your-feature-name
# Or for bug fixes:
git checkout -b fix/your-bug-fix
```

### Making Changes

1. Write code following the style guidelines below
2. Test your changes thoroughly
3. Update documentation as needed
4. Run linters and type checks:
   ```bash
   # Backend
   # Bun has built-in TypeScript checking

   # Frontend
   cd frontend
   npm run lint
   npm run type-check
   ```
5. Run tests:
   ```bash
   cd frontend
   npm run test
   ```

### Committing Your Changes

Use [conventional commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(weight): add export to CSV functionality

Fixes #123

Users can now export their weight data to CSV format for analysis in spreadsheets.

Closes #123
```

```
fix(auth): resolve JWT token expiration handling

Fix issue where users were logged out prematurely due to incorrect expiration check.

Closes #456
```

## Code Style Guidelines

### TypeScript / JavaScript

- Use TypeScript for all new code
- Enable strict type checking
- Avoid `any` types - use `unknown` instead
- Use const/let instead of var
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Use async/await instead of promises
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Define interfaces for component props
- Use TypeScript for all props
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use React Context for global state (AuthContext, ThemeContext)
- Follow existing component patterns in src/components/

### Styling

- Use Tailwind CSS utility classes
- Avoid inline styles (except dynamic values)
- Use responsive design (mobile-first)
- Use dark mode support with `dark:` prefix
- Follow existing color scheme (Stone, Blue, Red)

### Backend (Bun/Hono)

- Use TypeScript strict mode
- Use Zod for request validation
- Return consistent error responses
- Use async/await for database operations
- Keep route handlers focused and small
- Use middleware for cross-cutting concerns (auth)

### Code Organization

- Keep files focused on a single responsibility
- Place related files together
- Use meaningful directory and file names
- Document complex logic with comments

## Testing

### E2E Tests (Cypress)

- Write E2E tests for new features in `frontend/cypress/e2e/`
- Follow existing test patterns
- Test both happy path and edge cases
- Ensure tests are isolated and reproducible

### Manual Testing

See [MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md) for comprehensive testing checklist.

### Running Tests

```bash
cd frontend
npm run test          # Run all E2E tests
npm run test:e2e:open # Open Cypress test runner
```

## Pull Request Process

### Before Submitting a PR

1. Ensure your code passes all checks:
   - `npm run lint` passes
   - `npm run type-check` passes
   - `npm run test` passes
2. Update documentation (README, API docs, etc.)
3. Add tests for new features
4. Update CHANGELOG.md (if applicable)

### Submitting a PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a pull request on GitHub:
   - Provide a clear title using conventional commits
   - Describe what you changed and why
   - Reference any related issues (Fixes #123)
   - Include screenshots for UI changes
   - Link to any relevant documentation

3. Wait for code review and address feedback

4. Once approved and CI passes, merge with squash merge

### Review Guidelines

- Be constructive and specific in feedback
- Focus on code quality, maintainability, and correctness
- Test changes if possible
- Respond to review comments promptly

## Project Structure Overview

```
ktracker/
├── backend/              # Backend API
│   ├── middleware/      # Auth middleware
│   ├── prisma/         # Database schema and migrations
│   └── routes/         # API endpoints
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # Global state
│   │   ├── pages/       # Page components
│   │   ├── services/    # API integration
│   │   └── utils/       # Utility functions
│   └── cypress/         # E2E tests
├── docs/               # Documentation
└── thoughts/           # Architecture and planning
```

## Reporting Issues

### Bug Reports

Use the GitHub issue template for bug reports:
1. Describe the bug clearly
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details (OS, browser, etc.)
5. Screenshots or code samples if applicable

### Feature Requests

1. Describe the feature and use case
2. Explain why it would be valuable
3. Suggest possible implementation approaches
4. Consider alternatives or workarounds

## Getting Help

- Check existing documentation (README.md, docs/API.md)
- Review existing code and tests
- Ask questions in GitHub discussions or issues
- Review [CLAUDE.md](CLAUDE.md) for development context

## Recognition

Contributors will be acknowledged in the project. Your help is greatly appreciated!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.