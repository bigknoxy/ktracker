describe('UI Features - Toast Notifications', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  const registerAndLogin = () => {
    const timestamp = Date.now()
    cy.visit('/register')
    cy.get('input[name="username"]').type(`testuser_${timestamp}`)
    cy.get('input[name="email"]').type(`testuser_${timestamp}@example.com`)
    cy.get('input[name="password"]').type('TestPassword123!')
    cy.get('input[name="confirmPassword"]').type('TestPassword123!')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  }

  it('should show success toast after weight entry', () => {
    registerAndLogin()
    cy.get('button').contains('Add Weight Entry').click()
    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')

    cy.intercept('POST', '**/api/weight').as('addWeight')
    cy.get('button[type="submit"]').click()
    cy.wait('@addWeight')

    cy.get('[role="alert"]').should('be.visible')
    cy.get('[role="alert"]').should('have.attr', 'aria-live', 'polite')
    cy.contains(/weight.*success/i).should('be.visible')
  })

  it('should show error toast on failed submission', () => {
    registerAndLogin()
    cy.intercept('POST', '**/api/weight', { statusCode: 500 }).as('addWeight')

    cy.get('button').contains('Add Weight Entry').click()
    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')
    cy.get('button[type="submit"]').click()
    cy.wait('@addWeight')

    cy.get('[role="alert"]').should('be.visible')
    cy.get('[role="alert"]').should('have.attr', 'aria-live', 'assertive')
  })

  it('should show toast with correct icon type', () => {
    registerAndLogin()
    cy.get('button').contains('Add Weight Entry').click()
    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')

    cy.intercept('POST', '**/api/weight').as('addWeight')
    cy.get('button[type="submit"]').click()
    cy.wait('@addWeight')

    cy.get('[role="alert"]').within(() => {
      cy.get('svg').should('exist')
    })
  })

  it('should dismiss toast after duration', () => {
    registerAndLogin()
    cy.get('button').contains('Add Weight Entry').click()
    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')

    cy.intercept('POST', '**/api/weight').as('addWeight')
    cy.get('button[type="submit"]').click()
    cy.wait('@addWeight')

    cy.get('[role="alert"]').should('be.visible')

    cy.wait(6000)

    cy.get('[role="alert"]').should('not.exist')
  })

  it('should allow manual toast dismissal', () => {
    registerAndLogin()
    cy.get('button').contains('Add Weight Entry').click()
    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')

    cy.intercept('POST', '**/api/weight').as('addWeight')
    cy.get('button[type="submit"]').click()
    cy.wait('@addWeight')

    cy.get('[role="alert"]').should('be.visible')
    cy.get('[aria-label="Close notification"]').click()
    cy.get('[role="alert"]').should('not.exist')
  })

  it('should show progress bar in toast', () => {
    registerAndLogin()
    cy.get('button').contains('Add Weight Entry').click()
    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')

    cy.intercept('POST', '**/api/weight').as('addWeight')
    cy.get('button[type="submit"]').click()
    cy.wait('@addWeight')

    cy.get('[role="alert"]').within(() => {
      cy.get('[class*="animate-toast-progress"]').should('exist')
    })
  })

  it('should animate toast entry', () => {
    registerAndLogin()
    cy.get('button').contains('Add Weight Entry').click()
    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')

    cy.intercept('POST', '**/api/weight').as('addWeight')
    cy.get('button[type="submit"]').click()
    cy.wait('@addWeight')

    cy.get('[class*="animate-toast-enter"]').should('exist')
    cy.get('[class*="animate-toast-icon"]').should('exist')
  })
})
