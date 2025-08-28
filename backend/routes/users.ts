import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { PrismaClient } from '../generated/prisma';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const users = new Hono();

console.log('Users routes loaded!');

// Get current user profile
users.get('/me', authMiddleware, async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };

    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        // Don't include password in response
      }
    });

    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(userProfile);
  } catch (error) {
    console.error('Get user profile error:', error);
    return c.json({ error: 'Failed to get user profile' }, 500);
  }
});

// Update user profile schema
const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
});

// Update current user profile
users.put('/me', authMiddleware, zValidator('json', updateProfileSchema), async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const updateData = c.req.valid('json');

    // Check if new email/username already exists (if being updated)
    if (updateData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          id: { not: user.userId }
        }
      });
      if (existingUser) {
        return c.json({ error: 'Email already in use' }, 400);
      }
    }

    if (updateData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: updateData.username,
          id: { not: user.userId }
        }
      });
      if (existingUser) {
        return c.json({ error: 'Username already in use' }, 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
      }
    });

    return c.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return c.json({ error: 'Failed to update user profile' }, 500);
  }
});

// Delete current user account
users.delete('/me', authMiddleware, async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };

    // Delete all related data first (cascade delete should handle this, but being explicit)
    await prisma.task.deleteMany({ where: { userId: user.userId } });
    await prisma.workoutExercise.deleteMany({
      where: { workout: { userId: user.userId } }
    });
    await prisma.workout.deleteMany({ where: { userId: user.userId } });
    await prisma.weightEntry.deleteMany({ where: { userId: user.userId } });

    // Delete the user
    await prisma.user.delete({
      where: { id: user.userId }
    });

    return c.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ error: 'Failed to delete account' }, 500);
  }
});

export default users;