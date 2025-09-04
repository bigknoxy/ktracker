// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

// Custom command to register a user
Cypress.Commands.add('registerUser', (userData) => {
  cy.visit('/register')
  cy.get('input[name="username"]').type(userData.username)
  cy.get('input[name="email"]').type(userData.email)
  cy.get('input[name="password"]').type(userData.password)
  cy.get('input[name="confirmPassword"]').type(userData.password)
  cy.get('button[type="submit"]').click()
})

// Custom command to login a user
Cypress.Commands.add('loginUser', (credentials) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(credentials.email)
  cy.get('input[name="password"]').type(credentials.password)
  cy.get('button[type="submit"]').click()
})

// Custom command to clear localStorage and cookies
Cypress.Commands.add('clearAuthData', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Custom command to check if user is redirected to dashboard
Cypress.Commands.add('shouldBeOnDashboard', () => {
  cy.url().should('include', '/dashboard')
})

// Custom command to check if user is logged in
Cypress.Commands.add('shouldBeLoggedIn', () => {
  cy.window().its('localStorage').invoke('getItem', 'authToken').should('exist')
  cy.window().its('localStorage').invoke('getItem', 'user').should('exist')
})

// Custom command to generate unique test data
Cypress.Commands.add('generateTestUser', () => {
  const timestamp = Date.now()
  return {
    username: `testuser_${timestamp}`,
    email: `testuser_${timestamp}@example.com`,
    password: 'TestPassword123!'
  }
})

// Custom command to check for error message
Cypress.Commands.add('shouldShowError', (errorText) => {
  cy.contains(errorText).should('be.visible')
})

// Custom command to wait for API response
Cypress.Commands.add('waitForRegistration', () => {
  cy.intercept('POST', '**/api/auth/register').as('registerRequest')
  cy.wait('@registerRequest')
})

// Custom command to verify user exists in database (requires backend API)
Cypress.Commands.add('verifyUserInDatabase', () => {
  // This would need a backend endpoint to verify user creation
  // For now, we'll just check the UI response
  cy.window().its('localStorage').invoke('getItem', 'authToken').should('exist')
})