import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { PrismaClient } from '../generated/prisma';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const weight = new Hono();

console.log('Weight routes loaded!');

// Weight entry schema
const weightEntrySchema = z.object({
  weight: z.number().positive(),
  date: z.string().datetime().optional(), // Optional, defaults to now
});

// Get weight history for authenticated user
weight.get('/', authMiddleware, async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };

    const weightEntries = await prisma.weightEntry.findMany({
      where: { userId: user.userId },
      orderBy: { date: 'desc' },
    });

    return c.json(weightEntries);
  } catch (error) {
    console.error('Get weight history error:', error);
    return c.json({ error: 'Failed to get weight history' }, 500);
  }
});

// Add new weight entry
weight.post('/', authMiddleware, zValidator('json', weightEntrySchema), async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const { weight: weightValue, date } = c.req.valid('json');

    const weightEntry = await prisma.weightEntry.create({
      data: {
        userId: user.userId,
        weight: weightValue,
        date: date ? new Date(date) : new Date(),
      },
    });

    return c.json(weightEntry, 201);
  } catch (error) {
    console.error('Create weight entry error:', error);
    return c.json({ error: 'Failed to create weight entry' }, 500);
  }
});

// Update weight entry
weight.put('/:id', authMiddleware, zValidator('json', weightEntrySchema), async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const id = parseInt(c.req.param('id'));
    const { weight: weightValue, date } = c.req.valid('json');

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.weightEntry.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingEntry) {
      return c.json({ error: 'Weight entry not found' }, 404);
    }

    const updatedEntry = await prisma.weightEntry.update({
      where: { id },
      data: {
        weight: weightValue,
        date: date ? new Date(date) : existingEntry.date,
      },
    });

    return c.json(updatedEntry);
  } catch (error) {
    console.error('Update weight entry error:', error);
    return c.json({ error: 'Failed to update weight entry' }, 500);
  }
});

// Delete weight entry
weight.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const id = parseInt(c.req.param('id'));

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.weightEntry.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingEntry) {
      return c.json({ error: 'Weight entry not found' }, 404);
    }

    await prisma.weightEntry.delete({
      where: { id },
    });

    return c.json({ message: 'Weight entry deleted successfully' });
  } catch (error) {
    console.error('Delete weight entry error:', error);
    return c.json({ error: 'Failed to delete weight entry' }, 500);
  }
});

export default weight;