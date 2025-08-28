import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { PrismaClient } from '../generated/prisma';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const tasks = new Hono();

console.log('Tasks routes loaded!');

// Task schema
const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  completed: z.boolean().default(false),
});

// Get task list for authenticated user
tasks.get('/', authMiddleware, async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };

    const tasksData = await prisma.task.findMany({
      where: { userId: user.userId },
      orderBy: [
        { completed: 'asc' }, // Show incomplete tasks first
        { priority: 'desc' }, // High priority first
        { dueDate: 'asc' },   // Earlier due dates first
      ],
    });

    return c.json(tasksData);
  } catch (error) {
    console.error('Get tasks error:', error);
    return c.json({ error: 'Failed to get tasks' }, 500);
  }
});

// Create new task
tasks.post('/', authMiddleware, zValidator('json', taskSchema), async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const taskData = c.req.valid('json');

    const task = await prisma.task.create({
      data: {
        userId: user.userId,
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        priority: taskData.priority,
        completed: taskData.completed,
      },
    });

    return c.json(task, 201);
  } catch (error) {
    console.error('Create task error:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// Update task
tasks.put('/:id', authMiddleware, zValidator('json', taskSchema.partial()), async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const id = parseInt(c.req.param('id'));
    const updateData = c.req.valid('json');

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : existingTask.dueDate,
        priority: updateData.priority,
        completed: updateData.completed,
      },
    });

    return c.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

// Delete task
tasks.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const id = parseInt(c.req.param('id'));

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    await prisma.task.delete({
      where: { id },
    });

    return c.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return c.json({ error: 'Failed to delete task' }, 500);
  }
});

export default tasks;