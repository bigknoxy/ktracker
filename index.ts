import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from './backend/routes/auth';
import userRoutes from './backend/routes/users';
import weightRoutes from './backend/routes/weight';
import workoutRoutes from './backend/routes/workouts';
import taskRoutes from './backend/routes/tasks';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Test route
app.get('/test', (c) => c.json({ message: 'Test route works!' }));

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/weight', weightRoutes);
app.route('/api/workouts', workoutRoutes);
app.route('/api/tasks', taskRoutes);

// Global error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;