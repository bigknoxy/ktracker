describe('Mobile Responsiveness', () => {
  const mobileViewports = [
    { width: 320, height: 568, name: 'iPhone SE' },
    { width: 375, height: 667, name: 'iPhone 8' },
    { width: 414, height: 896, name: 'iPhone 11' }
  ]

  const tabletViewports = [
    { width: 768, height: 1024, name: 'iPad' },
    { width: 820, height: 1180, name: 'iPad Pro' }
  ]

  const desktopViewports = [
    { width: 1024, height: 768, name: 'Desktop Small' },
    { width: 1440, height: 900, name: 'Desktop Large' },
    { width: 1920, height: 1080, name: 'Full HD' }
  ]

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

  describe('Mobile Layouts', () => {
    mobileViewports.forEach(({ width, height, name }) => {
      it(`should render correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height)
        registerAndLogin()

        cy.url().should('include', '/dashboard')

        cy.get('nav[role="tablist"]').should('be.visible')
        cy.get('nav[role="tablist"]').should('have.css', 'display').and('eq', 'flex')

        cy.get('[role="tab"]').should('have.length', 4)

        cy.contains('Dashboard').should('be.visible')
        cy.contains('Weight').should('be.visible')
        cy.contains('Workouts').should('be.visible')
        cy.contains('Tasks').should('be.visible')
      })
    })

    it('should show bottom navigation on mobile', () => {
      cy.viewport(375, 667)
      registerAndLogin()

      cy.get('nav[role="tablist"]').should('have.css', 'position').and('eq', 'fixed')
      cy.get('nav[role="tablist"]').should('have.css', 'bottom').and('match', /0px|auto/)
      cy.get('nav[role="tablist"]').should('have.css', 'width').and('match', /100vw|auto/)
    })

    it('should hide desktop navigation on mobile', () => {
      cy.viewport(375, 667)
      registerAndLogin()

      cy.get('nav').contains('Dashboard').should('not.be.visible')
    })

    it('should stack dashboard cards on mobile', () => {
      cy.viewport(375, 667)
      registerAndLogin()

      cy.wait(1000)

      cy.get('.grid').should('have.class', 'grid-cols-1')
    })
  })

  describe('Tablet Layouts', () => {
    tabletViewports.forEach(({ width, height, name }) => {
      it(`should render correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height)
        registerAndLogin()

        cy.url().should('include', '/dashboard')
        cy.contains('Welcome to Your Wellness Hub').should('be.visible')
      })
    })

    it('should show bottom navigation on tablet', () => {
      cy.viewport(768, 1024)
      registerAndLogin()

      cy.get('nav[role="tablist"]').should('not.be.visible')
    })

    it('should show desktop navigation on tablet', () => {
      cy.viewport(768, 1024)
      registerAndLogin()

      cy.get('nav').contains('Dashboard').should('be.visible')
      cy.get('nav').contains('Weight').should('be.visible')
    })
  })

  describe('Desktop Layouts', () => {
    desktopViewports.forEach(({ width, height, name }) => {
      it(`should render correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height)
        registerAndLogin()

        cy.url().should('include', '/dashboard')
        cy.contains('Welcome to Your Wellness Hub').should('be.visible')
        cy.get('nav').contains('Dashboard').should('be.visible')
      })
    })

    it('should show desktop navigation on desktop', () => {
      cy.viewport(1440, 900)
      registerAndLogin()

      cy.get('nav').contains('Dashboard').should('be.visible')
      cy.get('nav').contains('Weight').should('be.visible')
      cy.get('nav').contains('Workouts').should('be.visible')
      cy.get('nav').contains('Tasks').should('be.visible')
    })

    it('should hide bottom navigation on desktop', () => {
      cy.viewport(1440, 900)
      registerAndLogin()

      cy.get('nav[role="tablist"]').should('not.be.visible')
    })

    it('should display cards in grid on desktop', () => {
      cy.viewport(1440, 900)
      registerAndLogin()

      cy.wait(1000)

      cy.get('.grid').should('have.class', 'grid-cols-3')
    })
  })

  describe('Responsive Behaviors', () => {
    it('should adapt layout when resizing viewport', () => {
      cy.viewport(375, 667)
      registerAndLogin()

      cy.get('nav[role="tablist"]').should('be.visible')
      cy.get('nav').contains('Dashboard').should('not.be.visible')

      cy.viewport(1440, 900)
      cy.get('nav[role="tablist"]').should('not.be.visible')
      cy.get('nav').contains('Dashboard').should('be.visible')
    })

    it('should adjust dashboard card grid on resize', () => {
      cy.viewport(375, 667)
      registerAndLogin()

      cy.wait(1000)
      cy.get('.grid').should('have.class', 'grid-cols-1')

      cy.viewport(1024, 768)
      cy.get('.grid').should('have.class', 'grid-cols-2')

      cy.viewport(1440, 900)
      cy.get('.grid').should('have.class', 'grid-cols-3')
    })
  })
})
