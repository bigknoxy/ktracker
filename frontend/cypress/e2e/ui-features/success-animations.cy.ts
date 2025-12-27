describe('UI Features - Success Animations', () => {
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

  it('should trigger success animation on weight entry submission', () => {
    registerAndLogin()
    cy.get('button').contains('Add Weight Entry').click()

    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')

    cy.intercept('POST', '**/api/weight').as('addWeight')

    cy.get('button[type="submit"]').click()

    cy.wait('@addWeight').then(() => {
      cy.get('[class*="bg-green-100"][class*="animate-ping"]').should('exist')
      cy.get('[class*="bg-white/95"][class*="animate-in"]').should('exist')
      cy.contains('Weight entry added successfully').should('be.visible')
    })
  })

  it('should trigger success animation on workout submission', () => {
    registerAndLogin()
    cy.get('button').contains('Log Workout').click()

    cy.get('input[name="duration"]').clear().type('45')
    cy.get('input[name="date"]').type('2024-01-15')
    cy.get('select[name="exercises"]').select('0')

    cy.intercept('POST', '**/api/workouts').as('addWorkout')

    cy.get('button[type="submit"]').click()

    cy.wait('@addWorkout').then(() => {
      cy.get('[class*="bg-green-100"][class*="animate-ping"]').should('exist')
      cy.get('[class*="bg-white/95"][class*="animate-in"]').should('exist')
      cy.contains('Workout logged successfully').should('be.visible')
    })
  })

  it('should trigger success animation on task creation', () => {
    registerAndLogin()
    cy.get('button').contains('Create Task').click()

    cy.get('input[name="title"]').clear().type('Test Task')
    cy.get('textarea[name="description"]').clear().type('Test description')
    cy.get('select[name="priority"]').select('medium')

    cy.intercept('POST', '**/api/tasks').as('addTask')

    cy.get('button[type="submit"]').click()

    cy.wait('@addTask').then(() => {
      cy.get('[class*="bg-green-100"][class*="animate-ping"]').should('exist')
      cy.get('[class*="bg-white/95"][class*="animate-in"]').should('exist')
      cy.contains('Task created successfully').should('be.visible')
    })
  })

  it('should show checkmark animation on success', () => {
    registerAndLogin()
    cy.get('button').contains('Add Weight Entry').click()

    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')

    cy.intercept('POST', '**/api/weight').as('addWeight')

    cy.get('button[type="submit"]').click()

    cy.wait('@addWeight')
    cy.get('svg').should('exist')
  })

  it('should animate form on success', () => {
    registerAndLogin()
    cy.get('button').contains('Add Weight Entry').click()

    cy.get('input[name="weight"]').clear().type('175')
    cy.get('input[name="date"]').type('2024-01-15')

    cy.intercept('POST', '**/api/weight').as('addWeight')

    cy.get('button[type="submit"]').click()

    cy.wait('@addWeight')
    cy.get('[class*="animate-fade-in"]').should('exist')
    cy.get('[class*="duration-300"]').should('exist')
  })
})
