describe('User Registration - Validation & Error Handling', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('should show error for duplicate username', () => {
    // First, register a user
    const timestamp = Date.now()
    const testUser = {
      username: `duplicate_${timestamp}`,
      email: `duplicate_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    // Register first user
    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('button[type="submit"]').click()

    // Wait for successful registration
    cy.url().should('include', '/dashboard')

    // Clear auth data and try to register with same username
    cy.clearLocalStorage()
    cy.clearCookies()

    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(`different_${timestamp}@example.com`)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('button[type="submit"]').click()

    // Should show error message
    cy.contains('User already exists').should('be.visible')
    cy.url().should('not.include', '/dashboard')
  })

  it('should show error for duplicate email', () => {
    const timestamp = Date.now()
    const testUser = {
      username: `user1_${timestamp}`,
      email: `duplicate_email_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    // Register first user
    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/dashboard')

    // Clear auth and try with same email, different username
    cy.clearLocalStorage()
    cy.clearCookies()

    cy.visit('/register')
    cy.get('input[name="username"]').type(`user2_${timestamp}`)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('button[type="submit"]').click()

    cy.contains('User already exists').should('be.visible')
    cy.url().should('not.include', '/dashboard')
  })

  it('should show error for invalid email format', () => {
    cy.visit('/register')

    cy.get('input[name="username"]').type('testuser')
    cy.get('input[name="email"]').type('invalid-email')
    cy.get('input[name="password"]').type('TestPassword123!')
    cy.get('input[name="confirmPassword"]').type('TestPassword123!')

    // Intercept the API call to check validation
    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('button[type="submit"]').click()

    // The frontend should prevent invalid email submission
    // or show appropriate error
    cy.get('input[name="email"]:invalid').should('exist')
  })

  it('should show error for password too short', () => {
    cy.visit('/register')

    cy.get('input[name="username"]').type('testuser')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('123') // Too short
    cy.get('input[name="confirmPassword"]').type('123')

    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('button[type="submit"]').click()

    // Should show validation error or API error
    cy.wait('@registerRequest').then((interception) => {
      if (interception.response) {
        expect(interception.response.statusCode).to.be.oneOf([400, 422])
      }
    })
  })

  it('should show error for empty required fields', () => {
    cy.visit('/register')

    // Try to submit without filling any fields
    cy.get('button[type="submit"]').click()

    // HTML5 validation should prevent submission
    cy.url().should('not.include', '/dashboard')
  })

  it('should show error for password mismatch', () => {
    cy.visit('/register')

    cy.get('input[name="username"]').type('testuser')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('TestPassword123!')
    cy.get('input[name="confirmPassword"]').type('DifferentPassword123!')

    // The form should show password mismatch error
    cy.contains('Passwords do not match').should('be.visible')

    // Button should be disabled
    cy.get('button[type="submit"]').should('be.disabled')
  })

  it('should handle network errors gracefully', () => {
    // Mock network failure
    cy.intercept('POST', '**/api/auth/register', { forceNetworkError: true }).as('registerRequest')

    cy.visit('/register')

    const testUser = {
      username: 'network_test',
      email: 'network@example.com',
      password: 'TestPassword123!'
    }

    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)

    cy.get('button[type="submit"]').click()

    // Should show network error message
    cy.contains('An unexpected error occurred').should('be.visible')
  })

  it('should handle server errors gracefully', () => {
    // Mock server error
    cy.intercept('POST', '**/api/auth/register', { statusCode: 500 }).as('registerRequest')

    cy.visit('/register')

    const testUser = {
      username: 'server_error_test',
      email: 'server@example.com',
      password: 'TestPassword123!'
    }

    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)

    cy.get('button[type="submit"]').click()

    // Should show server error message
    cy.contains('Registration failed').should('be.visible')
  })
})