import type { MiddlewareHandler } from 'hono';
import * as jwt from 'jsonwebtoken';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  userId: number;
  email: string;
}

export interface AuthContext {
  user: AuthUser;
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authorization header missing or invalid' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Add user to context
    (c as any).user = decoded;

    await next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      return c.json({ error: 'Token expired' }, 401);
    }
    return c.json({ error: 'Authentication failed' }, 401);
  }
};