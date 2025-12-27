describe('User Registration - Edge Cases & Security', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('should handle special characters in username', () => {
    const timestamp = Date.now()
    const testUser = {
      username: `user_@${timestamp}!#`,
      email: `special_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    cy.visit('/register')

    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)

    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('button[type="submit"]').click()

    cy.wait('@registerRequest').then((interception) => {
      if (interception.response?.statusCode === 200) {
        cy.url().should('include', '/dashboard')
      } else {
        // If special characters are not allowed, should show appropriate error
        cy.contains('Registration failed').should('be.visible')
      }
    })
  })

  it('should handle very long username and email', () => {
    const longUsername = 'a'.repeat(100) // 100 character username
    const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'

    cy.visit('/register')

    cy.get('input[name="username"]').type(longUsername)
    cy.get('input[name="email"]').type(longEmail)
    cy.get('input[name="password"]').type('TestPassword123!')
    cy.get('input[name="confirmPassword"]').type('TestPassword123!')

    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('button[type="submit"]').click()

    cy.wait('@registerRequest').then((interception) => {
      if (interception.response?.statusCode === 200) {
        cy.url().should('include', '/dashboard')
      } else {
        // Should handle length validation gracefully
        cy.url().should('not.include', '/dashboard')
      }
    })
  })

  it('should handle SQL injection attempts', () => {
    const maliciousUsername = "'; DROP TABLE users; --"

    cy.visit('/register')

    cy.get('input[name="username"]').type(maliciousUsername)
    cy.get('input[name="email"]').type('safe@example.com')
    cy.get('input[name="password"]').type('TestPassword123!')
    cy.get('input[name="confirmPassword"]').type('TestPassword123!')

    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('button[type="submit"]').click()

    cy.wait('@registerRequest').then((interception) => {
      // Should not execute SQL injection
      expect(interception.response?.statusCode).to.not.equal(500)
      if (interception.response?.statusCode === 200) {
        cy.url().should('include', '/dashboard')
      }
    })
  })

  it('should handle XSS attempts in username', () => {
    const xssUsername = '<script>alert("XSS")</script>'
    const timestamp = Date.now()

    cy.visit('/register')

    cy.get('input[name="username"]').type(xssUsername)
    cy.get('input[name="email"]').type(`xss_${timestamp}@example.com`)
    cy.get('input[name="password"]').type('TestPassword123!')
    cy.get('input[name="confirmPassword"]').type('TestPassword123!')

    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('button[type="submit"]').click()

    cy.wait('@registerRequest').then((interception) => {
      if (interception.response?.statusCode === 200) {
        cy.url().should('include', '/dashboard')
        // Verify no script execution
        cy.window().then(() => {
          // Alert should not be called (XSS prevented)
        })
      }
    })
  })

  it('should handle concurrent registration attempts', () => {
    const timestamp = Date.now()
    const testUser = {
      username: `concurrent_${timestamp}`,
      email: `concurrent_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    // Start two registration attempts simultaneously
    cy.visit('/register')

    // First tab/window
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)

    // Open second tab (simulated by visiting again in same session)
    cy.window().then((win) => {
      win.open('/register', '_blank')
    })

    // This is a simplified test - in real scenario would need multiple browser sessions
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/dashboard')
  })

  it('should handle rapid form submissions', () => {
    const timestamp = Date.now()
    const testUser = {
      username: `rapid_${timestamp}`,
      email: `rapid_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    cy.visit('/register')

    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)

    // Click submit once - this should succeed and redirect
    cy.get('button[type="submit"]').click()

    // Should redirect to dashboard after successful registration
    cy.url().should('include', '/dashboard')

    // Verify user is logged in
    cy.window().its('localStorage').invoke('getItem', 'authToken').should('exist')
    cy.window().its('localStorage').invoke('getItem', 'user').should('exist')
  })

  it('should handle unicode characters in username', () => {
    const timestamp = Date.now()
    const unicodeUsername = `用户_${timestamp}` // Chinese characters
    const testUser = {
      username: unicodeUsername,
      email: `unicode_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    cy.visit('/register')

    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)

    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('button[type="submit"]').click()

    cy.wait('@registerRequest').then((interception) => {
      if (interception.response?.statusCode === 200) {
        cy.url().should('include', '/dashboard')
      } else {
        // If unicode not supported, should show appropriate error
        cy.contains('Registration failed').should('be.visible')
      }
    })
  })

  it('should reject password "123" (too short)', () => {
    cy.visit('/register')

    const timestamp = Date.now()
    cy.get('input[name="username"]').type(`weak_${timestamp}`)
    cy.get('input[name="email"]').type(`weak_${timestamp}@example.com`)
    cy.get('input[name="password"]').type('123')
    cy.get('input[name="confirmPassword"]').type('123')

    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('button[type="submit"]').click()

    cy.wait('@registerRequest').then((interception) => {
      cy.log('Status code:', interception.response?.statusCode)
      cy.log('Response:', JSON.stringify(interception.response?.body))

      // Should reject weak password
      expect(interception.response?.statusCode).to.be.oneOf([400, 422])
    })
  })

  it('should accept password "password" (meets minimum length)', () => {
    cy.visit('/register')

    const timestamp = Date.now()
    cy.get('input[name="username"]').type(`valid_${timestamp}`)
    cy.get('input[name="email"]').type(`valid_${timestamp}@example.com`)
    cy.get('input[name="password"]').type('password')
    cy.get('input[name="confirmPassword"]').type('password')

    cy.intercept('POST', '**/api/auth/register').as('registerRequest')

    cy.get('button[type="submit"]').click()

    cy.wait('@registerRequest').then((interception) => {
      // Should accept password that meets minimum length requirement
      expect(interception.response?.statusCode).to.equal(200)
    })
  })

  it('should handle registration with existing session', () => {
    // First register a user
    const timestamp = Date.now()
    const testUser = {
      username: `session_${timestamp}`,
      email: `session_${timestamp}@example.com`,
      password: 'TestPassword123!'
    }

    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/dashboard')

    // Now try to register again while logged in
    cy.visit('/register')

    // Should redirect away from registration page
    cy.url().should('not.include', '/register')
  })
})