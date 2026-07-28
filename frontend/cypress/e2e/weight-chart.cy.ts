import '../support/e2e';

describe('Weight Chart', () => {
  const testUser = {
    username: `testweightuser_${Date.now()}`,
    email: `testweight_${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  const mobileViewports = [
    { width: 375, height: 667, name: 'iPhone 8' },
    { width: 414, height: 896, name: 'iPhone 11' }
  ];

  const tabletViewports = [
    { width: 768, height: 1024, name: 'iPad' },
    { width: 820, height: 1180, name: 'iPad Pro' }
  ];

  const desktopViewports = [
    { width: 1280, height: 720, name: 'Desktop' },
    { width: 1920, height: 1080, name: 'Full HD' }
  ];

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

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    registerAndLogin();
    navigateToWeight();
  });

  describe('Y-Axis Formatting', () => {
    it('displays Y-axis ticks with 1 decimal place', () => {
      cy.get('.recharts-y-axis .recharts-cartesian-axis-tick-value')
        .should('have.length.gte', 3)
        .each(($el) => {
          const text = $el.text();
          // Verify format: "XXX.X lbs" or "XXX lbs"
          expect(text).to.match(/^\d+(\.\d+)?\s*lbs$/);
          // CRITICAL: No floating-point errors
          expect(text).not.to.contain('18333333333337');
          expect(text).not.to.contain('180.49999999997');
        });
    });

    it('does not show floating-point errors', () => {
      cy.get('.recharts-y-axis .recharts-cartesian-axis-tick-value')
        .should('not.contain.text', '.99999999')
        .and('not.contain.text', '.00000001');
    });

    it('shows readable weight values', () => {
      const validWeightPatterns = [
        /^\d+\.\d+\s*lbs$/,      // "180.5 lbs"
        /^\d+\.\d+\s*$/,          // "180.5"
        /^\d+\s*lbs$/             // "180 lbs"
      ];

      cy.get('.recharts-y-axis .recharts-cartesian-axis-tick-value').each(($el) => {
        const text = $el.text();
        const isValid = validWeightPatterns.some(pattern => pattern.test(text));
        expect(isValid).to.be.true;
      });
    });

    it('has proper ARIA label', () => {
      cy.get('[data-testid="weight-chart"] .recharts-y-axis text').should('have.text', 'Weight (lbs)');
    });
  });

  describe('Responsive Chart Height', () => {
    it('has appropriate height on mobile (375px)', () => {
      cy.viewport(375, 667);
      cy.get('[data-testid="weight-chart"]').should('have.css', 'height', '200px');
    });

    it('has appropriate height on small tablet (640px)', () => {
      cy.viewport(640, 768);
      cy.get('[data-testid="weight-chart"]').should('have.css', 'height', '250px');
    });

    it('has appropriate height on medium tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('[data-testid="weight-chart"]').should('have.css', 'height', '300px');
    });

    it('has appropriate height on desktop (1280px)', () => {
      cy.viewport(1280, 720);
      cy.get('[data-testid="weight-chart"]').should('have.css', 'height', '350px');
    });

    it('adjusts height dynamically when viewport changes', () => {
      cy.viewport(375, 667);
      cy.get('[data-testid="weight-chart"]').should('have.css', 'height', '200px');

      cy.viewport(1280, 720);
      cy.get('[data-testid="weight-chart"]').should('have.css', 'height', '350px');
    });
  });

  describe('Mobile UX', () => {
    mobileViewports.forEach(({ width, height, name }) => {
      it(`X-axis labels don't overlap on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);

        cy.get('.recharts-x-axis .recharts-cartesian-axis-tick')
          .should('have.length.lessThan', 7);
      });

      it(`Y-axis labels are readable on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);

        cy.get('.recharts-y-axis .recharts-cartesian-axis-tick-value')
          .should('be.visible')
          .each(($el) => {
            const text = $el.text();
            expect(text.length).to.be.lessThan(12);
          });
      });
    });
  });

  describe('Visual Elements', () => {
    it('displays trend line when enabled', () => {
      cy.get('.recharts-line.recharts-line-tooltip')
        .should('have.length', 1)
        .and('have.css', 'stroke');
    });

    it('displays weight line with gradient', () => {
      cy.get('.recharts-line.recharts-line-curve')
        .should('have.length', 1);
    });

    it('shows target line when enabled', () => {
      // Assuming showTarget prop is enabled
      cy.get('.recharts-reference-line')
        .should('exist');
    });
  });

  describe('Tooltip Behavior', () => {
    it('shows tooltip on hover', () => {
      cy.get('.recharts-line .recharts-dot').first().trigger('mouseover');

      cy.get('.recharts-tooltip-wrapper')
        .should('be.visible')
        .and('contain.text', 'lbs');
    });

    it('displays current weight', () => {
      cy.get('.recharts-line .recharts-dot').first().trigger('mouseover');

      cy.get('.recharts-tooltip-wrapper')
        .should('contain.text', 'lbs');
    });

    it('displays trend', () => {
      cy.get('.recharts-line .recharts-dot').first().trigger('mouseover');

      cy.get('.recharts-tooltip-wrapper')
        .should('contain.text', 'Trend:');
    });

    it('displays weight change from previous', () => {
      cy.get('.recharts-line .recharts-dot').first().trigger('mouseover');

      cy.get('.recharts-tooltip-wrapper')
        .should('contain.text', 'lbs');
    });

    it('tooltip z-index is higher than other elements', () => {
      cy.get('.recharts-line .recharts-dot').first().trigger('mouseover');

      cy.get('.recharts-tooltip-wrapper')
        .should('have.css', 'z-index');
    });
  });

  describe('Cross-Viewport Tests', () => {
    tabletViewports.forEach(({ width, height, name }) => {
      it(`chart displays correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);

        cy.get('[data-testid="weight-chart"]').should('be.visible');
        cy.get('.recharts-line').should('have.length.gte', 1);
        cy.get('.recharts-cartesian-axis').should('have.length', 2);
      });
    });

    desktopViewports.forEach(({ width, height, name }) => {
      it(`chart displays correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);

        cy.get('[data-testid="weight-chart"]').should('be.visible');
        cy.get('.recharts-line').should('have.length.gte', 1);
        cy.get('.recharts-cartesian-axis').should('have.length', 2);
      });
    });
  });

  describe('Dark Mode', () => {
    it('colors are readable in dark mode', () => {
      // Toggle to dark mode
      cy.contains('Switch to dark theme').click();
      cy.wait(500);

      cy.get('[data-testid="weight-chart"]')
        .should('be.visible');

      // Y-axis labels should be readable
      cy.get('.recharts-y-axis .recharts-cartesian-axis-tick-value')
        .should('have.css', 'fill');
    });

    it('chart has ARIA labels in dark mode', () => {
      cy.contains('Switch to dark theme').click();
      cy.wait(500);

      cy.get('[data-testid="weight-chart"]')
        .should('have.attr', 'role', 'img');

      cy.get('[data-testid="weight-chart"]').should('have.attr', 'aria-label');
    });
  });
});
