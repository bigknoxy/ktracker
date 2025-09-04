# E2E Testing with Cypress

This directory contains end-to-end tests for the kTracker application using Cypress.

## Test Structure

```
cypress/
├── e2e/
│   └── registration/
│       ├── successful-registration.cy.ts    # Happy path tests
│       ├── registration-validation.cy.ts    # Error handling tests
│       └── registration-edge-cases.cy.ts    # Security and edge case tests
├── fixtures/
│   └── test-users.json                      # Test data fixtures
├── support/
│   ├── commands.ts                         # Custom Cypress commands
│   └── e2e.ts                              # Global test configuration
└── config.ts                               # Cypress configuration
```

## Running Tests

### Local Development

1. **Setup test environment:**
   ```bash
   npm run test:setup
   ```

2. **Start the backend server:**
   ```bash
   npm run dev:test
   ```

3. **Start the frontend (in another terminal):**
   ```bash
   cd frontend && npm run dev
   ```

4. **Run E2E tests:**
   ```bash
   cd frontend && npm run test:e2e
   ```

5. **Open Cypress Test Runner:**
   ```bash
   cd frontend && npm run test:e2e:open
   ```

### CI/CD

Tests run automatically on GitHub Actions for:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Manual CI Run

```bash
npm run test:e2e:ci
```

## Test Scenarios

### Successful Registration
- ✅ Valid user registration
- ✅ Automatic login after registration
- ✅ Redirect to dashboard
- ✅ JWT token storage
- ✅ User data persistence

### Validation & Error Handling
- ❌ Duplicate username registration
- ❌ Duplicate email registration
- ❌ Invalid email format
- ❌ Password too short
- ❌ Empty required fields
- ❌ Password confirmation mismatch
- ❌ Network errors
- ❌ Server errors

### Edge Cases & Security
- 🔒 Special characters in username
- 📏 Very long username/email
- 🛡️ SQL injection attempts
- 🚫 XSS attempts in username
- ⚡ Rapid form submissions
- 🌐 Unicode characters
- 🔐 Extremely weak passwords
- 🔄 Registration with existing session

## Custom Commands

The test suite includes custom Cypress commands for common operations:

```typescript
// Register a new user
cy.registerUser({ username: 'test', email: 'test@example.com', password: 'password' })

// Login existing user
cy.loginUser({ email: 'test@example.com', password: 'password' })

// Clear authentication data
cy.clearAuthData()

// Check dashboard redirect
cy.shouldBeOnDashboard()

// Verify user is logged in
cy.shouldBeLoggedIn()

// Generate unique test user data
cy.generateTestUser()

// Check for error messages
cy.shouldShowError('Error message')

// Wait for registration API call
cy.waitForRegistration()

// Verify user in database
cy.verifyUserInDatabase()
```

## Configuration

### Environment Variables

- `API_BASE_URL`: Backend API URL (default: `http://localhost:3000/api`)
- `TEST_DATABASE_URL`: Test database path (default: `file:./test.db`)

### Test Database

Tests use a separate SQLite database to avoid affecting development data:
- Location: `backend/prisma/test.db`
- Auto-cleanup: Database is reset between test runs
- Seeding: Test data is seeded automatically

## Debugging

### Screenshots & Videos

Failed tests automatically capture:
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/`

### Browser DevTools

Use `cy.pause()` or `cy.debug()` in tests to inspect application state.

### Network Interception

Tests use `cy.intercept()` to mock API responses and verify network calls:

```typescript
cy.intercept('POST', '**/api/auth/register').as('registerRequest')
cy.wait('@registerRequest')
```

## Best Practices

1. **Test Isolation**: Each test starts with clean state
2. **Unique Data**: Use timestamps for unique test data
3. **API Verification**: Always verify API responses
4. **UI State**: Check both UI elements and application state
5. **Error Handling**: Test both success and failure scenarios
6. **Performance**: Tests include timeouts and retry logic

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in `cypress.config.ts`
2. **Database connection**: Ensure test database is properly set up
3. **Port conflicts**: Check if ports 3000 (backend) and 5173 (frontend) are available
4. **Flaky tests**: Add retry logic or stabilize test data

### Debug Commands

```bash
# Run specific test file
npm run test:e2e -- --spec "cypress/e2e/registration/successful-registration.cy.ts"

# Run tests in specific browser
npm run test:e2e -- --browser chrome

# Run tests with video recording disabled
npm run test:e2e -- --config video=false
```

## Contributing

When adding new tests:

1. Follow the existing file structure
2. Use descriptive test names
3. Include both positive and negative test cases
4. Add appropriate comments
5. Update this README if needed

## Performance

Current test execution times:
- Full test suite: ~2-3 minutes
- Individual test: ~10-30 seconds
- CI/CD pipeline: ~5-7 minutes (including setup)