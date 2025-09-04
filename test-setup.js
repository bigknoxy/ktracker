#!/usr/bin/env node

/**
 * Test environment setup script
 * Sets up test database and starts services for e2e testing
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isWindows = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const isLinux = process.platform === 'linux'

console.log('🚀 Setting up test environment...')

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test.db'
process.env.JWT_SECRET = 'test-jwt-secret-key'

// Clean up any existing test database
const testDbPath = path.join(__dirname, 'backend', 'prisma', 'test.db')
if (fs.existsSync(testDbPath)) {
  console.log('🧹 Cleaning up existing test database...')
  fs.unlinkSync(testDbPath)
}

// Set up test database
console.log('📊 Setting up test database...')
try {
  execSync('cd backend && npx prisma migrate dev --name test-init', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' }
  })
} catch (error) {
  console.log('⚠️  Database setup failed, continuing...')
}

// Seed test data if needed
console.log('🌱 Seeding test data...')
try {
  execSync('cd backend && bunx tsx prisma/seed.ts', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' }
  })
} catch (error) {
  console.log('⚠️  Seeding failed, continuing...')
}

console.log('✅ Test environment setup complete!')
console.log('💡 Run tests with: npm run test:e2e')