describe('User Registration - Happy Path', () => {
  beforeEach(() => {
    // Clear any existing auth data
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('should successfully register a new user and redirect to dashboard', () => {
    // Generate unique test user data
    const timestamp = Date.now()
    const testUser = {
      username: `testuser_${timestamp}`,
      email: `testuser_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    // Visit registration page
    cy.visit('/register')

    // Fill out registration form
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)

    // Submit the form
    cy.get('button[type="submit"]').click()

    // Verify successful registration
    cy.url().should('include', '/dashboard')

    // Verify user is logged in
    cy.window().its('localStorage').invoke('getItem', 'authToken').should('exist')
    cy.window().its('localStorage').invoke('getItem', 'user').should('exist')

    // Verify user data in localStorage
    cy.window().its('localStorage').invoke('getItem', 'user').then((userStr) => {
      const user = JSON.parse(userStr as string)
      expect(user.username).to.equal(testUser.username)
      expect(user.email).to.equal(testUser.email)
    })
  })

  it('should automatically log in user after successful registration', () => {
    const timestamp = Date.now()
    const testUser = {
      username: `autologin_${timestamp}`,
      email: `autologin_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    cy.visit('/register')

    // Intercept the registration API call
    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)

    cy.get('button[type="submit"]').click()

    // Wait for the API call to complete
    cy.wait('@registerRequest').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200)
      expect(interception.response?.body).to.have.property('token')
      expect(interception.response?.body).to.have.property('user')
    })

    // Verify we're on dashboard
    cy.url().should('include', '/dashboard')
  })

  it('should store JWT token securely in localStorage', () => {
    const timestamp = Date.now()
    const testUser = {
      username: `secure_${timestamp}`,
      email: `secure_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    cy.visit('/register')

    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)

    cy.get('button[type="submit"]').click()

    // Verify JWT token exists and is properly formatted
    cy.window().its('localStorage').invoke('getItem', 'authToken').should('be.a', 'string')
    cy.window().its('localStorage').invoke('getItem', 'authToken').should('match', /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
  })
})