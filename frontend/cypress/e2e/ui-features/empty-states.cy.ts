describe('UI Features - Empty States', () => {
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

  it('should display empty state for weight section', () => {
    registerAndLogin()
    cy.get('button').contains('Weight').click()

    cy.get('svg').should('exist')
    cy.contains('No weight entries yet').should('be.visible')
    cy.contains('Start by adding your first weight entry to begin tracking your progress').should('be.visible')
    cy.contains('Add First Entry').should('be.visible')
  })

  it('should display empty state for workout section', () => {
    registerAndLogin()
    cy.get('button').contains('Workouts').click()

    cy.get('svg').should('exist')
    cy.contains('No workouts yet').should('be.visible')
    cy.contains('Start by logging your first workout to track your fitness journey').should('be.visible')
    cy.contains('Log First Workout').should('be.visible')
  })

  it('should display empty state for task section', () => {
    registerAndLogin()
    cy.get('button').contains('Tasks').click()

    cy.get('svg').should('exist')
    cy.contains('No tasks yet').should('be.visible')
    cy.contains('Start by creating your first task to boost your productivity').should('be.visible')
    cy.contains('Create First Task').should('be.visible')
  })

  it('should show illustration icon in empty states', () => {
    registerAndLogin()
    cy.get('button').contains('Weight').click()
    cy.get('svg').should('have.attr', 'fill', 'none')

    cy.get('button').contains('Workouts').click()
    cy.get('svg').should('have.attr', 'fill', 'none')

    cy.get('button').contains('Tasks').click()
    cy.get('svg').should('have.attr', 'fill', 'none')
  })

  it('should have proper accessibility attributes on empty states', () => {
    registerAndLogin()
    cy.get('button').contains('Weight').click()

    cy.contains('No weight entries yet').should('have.attr', 'tag', 'h3')
    cy.contains('Add First Entry').should('have.prop', 'tagName').and('eq', 'BUTTON')
  })

  it('should have circular icon background in empty states', () => {
    registerAndLogin()
    cy.get('button').contains('Weight').click()

    cy.get('[class*="rounded-full"]').should('exist')
  })
})
