describe('Weight Progress Chart - Y-Axis Formatting Fix', () => {
  const testUser = {
    username: `testweightuser_${Date.now()}`,
    email: `testweight_${Date.now()}@example.com`,
    password: 'TestWeight123!'
  };

  const viewportSizes = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1280, height: 720, name: 'Desktop' },
    { width: 1920, height: 1080, name: 'Full HD' }
  ];

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  const registerAndLogin = () => {
    cy.visit('/register');
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="confirmPassword"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  };

  const navigateToWeight = () => {
    cy.contains('Weight').click();
    cy.wait(500);
  };

  describe('Y-Axis Formatting', () => {
    beforeEach(registerAndLogin);
    beforeEach(navigateToWeight);

    it('displays Y-axis ticks with 1 decimal place (no floating-point errors)', () => {
      // Check for any ugly numbers like "18333333333333337"
      cy.get('.recharts-y-axis .recharts-cartesian-axis-tick-value')
        .each(($el, index) => {
          const text = $el.textContent?.trim() || '';
          
          // CRITICAL: No "18333333333333337" type values allowed
          expect(text).not.to.contain('.99999999');
          expect(text).not.to.contain('18333333333333337');
          
          // Verify proper format: "180.5" or "180 lbs"
          expect(text).to.match(/^\d+(\.\d{1,2})?\s*(?:\s*|lbs*)$/)
            .to.not.have.length.lessThan(12)); // Reasonable length
          
          // Verify has "lbs" suffix
          expect(text).to.contain('lbs');
        });
    });

    it('uses auto-range for Y-axis domain', () => {
      // Check that domain is set to auto
      cy.get('[data-testid="weight-chart"]')
        .find('.recharts-y-axis')
        .should('have.attr', 'domain')
        .and('have.text', 'auto');
    });

    it('displays 3 buttons total (Clear, Cancel, Add Entry)', () => {
      cy.get('[data-testid="weight-chart"]').within(() => {
        // Count all buttons in the form/section
        cy.get('button').should('have.length', 3);
      });
    });
  });

  describe('Responsive Chart Height', () => {
    beforeEach(registerAndLogin);
    beforeEach(navigateToWeight);
    
    viewportSizes.forEach(({ width, height, name }) => {
      cy.viewport(width, height);
      
      // Verify chart height for this viewport
      cy.get('[data-testid="weight-chart"]').then(($chart) => {
        cy.wrap($chart).invoke('height').then(parseFloat).should('equal', width < 640 ? 200 : (width < 768 ? 250 : (width < 1024 ? 300 : 350));
      });
    });
  });

  describe('Mobile UX', () => {
    beforeEach(registerAndLogin);
    beforeEach(navigateToWeight);

    beforeEach(() => {
      cy.viewport(375, 667); // Mobile portrait
    });

    it('displays correctly on mobile (375x667)', () => {
      cy.get('[data-testid="weight-chart"]').should('have.css', 'height', '200px');
    });

    it('X-axis labels do not overlap on mobile', () => {
      cy.get('.recharts-x-axis .recharts-cartesian-axis-tick')
        .should('have.length.lessThan', 7); // Reasonable for mobile
    });

    it('Y-axis labels are readable on mobile', () => {
      cy.get('.recharts-y-axis .recharts-cartesian-axis-tick-value')
        .should('have.length.gte', 1) // At least one tick should be visible
        .first().should('have.css', 'fontSize', '12');
    });
  });

  describe('Desktop UX', () => {
    beforeEach(registerAndLogin);
    beforeEach(navigateToWeight);

    beforeEach(() => {
      cy.viewport(1280, 720); // Desktop
    });

    it('displays at correct height on desktop (1280x720)', () => {
      cy.get('[data-testid="weight-chart"]').should('have.css', 'height', '350px');
    });
  });

  describe('Cross-Browser Tests', () => {
    ['chrome', 'firefox', 'webkit'].forEach(browser => {
      const context = cy.browser({ 
        [browser === 'webkit' ? 'safari' : 'chrome' 
      });

      if (Cypress.isRunning()) {
        return;
      }
    });

    beforeEach(() => {
      context.visit('http://localhost:5173');
      if (!Cypress.isRunning()) return;

      // Login if needed
      if (cy.get('button[type="submit"]').is({ timeout: 5000 })) {
        cy.get('input[name="username"]').type('testweightuser@example.com');
        cy.get('input[name="password"]').type('TestWeight123!');
        cy.get('button[type="submit"]').click();
      }

      // Navigate to Weight section
      cy.get('button').contains('Weight').click();
      cy.wait(500);
    });

    it('displays correctly in ' + context.displayName, () => {
      cy.get('[data-testid="weight-chart"]').should('exist');
      cy.get('[data-testid="weight-chart"]').should('be.visible');

      // Find Y-axis ticks
      cy.get('.recharts-y-axis .recharts-cartesian-axis-tick-value').should('have.length.gte', 3);
    });

    it('Y-axis ticks show clean decimal values', () => {
      cy.get('.recharts-y-axis .recharts-cartesian-axis-tick-value')
        .should('have.length.gte', 3)
        .each(($el, index) => {
          const text = $el.textContent?.trim() || '';
          expect(text).not.to.contain('18333333333333337');
          expect(text).to.match(/^\d+(\.\d{1,2})?\s*(?:\s*|lbs*)$/);
          expect(text).to.not.to.contain('.99999999'));
          expect(text).to.not.to.contain('.0000000'));
        });
    });

    context('Final Cleanup', () => {
      cy.cleanup();
    });
  });
});
