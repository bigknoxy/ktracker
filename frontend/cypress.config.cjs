const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    setupNodeEvents(on, config) {
      // Setup test database before running tests
      on('before:run', () => {
        // Could add database setup here
        console.log('Setting up test environment...')
      })

      // Cleanup after tests
      on('after:run', () => {
        console.log('Cleaning up test environment...')
      })

      return config
    },
    env: {
      API_BASE_URL: 'http://localhost:3000/api',
      TEST_DATABASE_URL: 'file:./test.db'
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})