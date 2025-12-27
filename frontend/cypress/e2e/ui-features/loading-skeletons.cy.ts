describe('UI Features - Loading Skeletons', () => {
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

  it('should display skeleton loaders on dashboard initial load', () => {
    registerAndLogin()

    cy.get('[class*="animate-pulse"]').should('exist')
    cy.get('[class*="bg-stone-200"][class*="rounded-xl"]').should('have.length.at.least', 3)
    cy.get('.animate-fade-in').should('exist')
  })

  it('should display skeleton in weight section during load', () => {
    registerAndLogin()
    cy.get('button').contains('Weight').click()

    cy.get('[class*="animate-pulse"]').should('exist')
    cy.get('[class*="bg-gradient-to-r"]').should('exist')
  })

  it('should display skeleton in workout section during load', () => {
    registerAndLogin()
    cy.get('button').contains('Workouts').click()

    cy.get('[class*="animate-pulse"]').should('exist')
    cy.get('[class*="bg-gradient-to-r"]').should('exist')
  })

  it('should display skeleton in task section during load', () => {
    registerAndLogin()
    cy.get('button').contains('Tasks').click()

    cy.get('[class*="animate-pulse"]').should('exist')
    cy.get('[class*="bg-gradient-to-r"]').should('exist')
  })

  it('should replace skeleton with actual content after load', () => {
    registerAndLogin()
    cy.get('[class*="animate-pulse"]').should('exist')

    cy.wait(1000)

    cy.get('[class*="animate-pulse"]').should('not.exist')
    cy.contains('Welcome to Your Wellness Hub').should('be.visible')
    cy.contains('Current Weight').should('be.visible')
    cy.contains('Recent Workout').should('be.visible')
    cy.contains('Pending Tasks').should('be.visible')
  })

  it('should show skeleton with correct styling', () => {
    registerAndLogin()
    cy.get('[class*="animate-pulse"]').should('have.class', 'bg-gradient-to-r')
  })
})
