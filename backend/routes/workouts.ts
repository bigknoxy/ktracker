import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { PrismaClient } from '../generated/prisma';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const workouts = new Hono();

console.log('Workouts routes loaded!');

// Workout schema
const workoutSchema = z.object({
  date: z.string().datetime().optional(),
  duration: z.number().int().positive(),
});

// Workout exercise schema
const workoutExerciseSchema = z.object({
  exerciseId: z.number().int().positive(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().positive(),
});

// Create workout with exercises schema
const createWorkoutSchema = z.object({
  date: z.string().datetime().optional(),
  duration: z.number().int().positive(),
  exercises: z.array(workoutExerciseSchema).min(1),
});

// Get workout history for authenticated user
workouts.get('/', authMiddleware, async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };

    const workoutsData = await prisma.workout.findMany({
      where: { userId: user.userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return c.json(workoutsData);
  } catch (error) {
    console.error('Get workout history error:', error);
    return c.json({ error: 'Failed to get workout history' }, 500);
  }
});

// Create new workout with exercises
workouts.post('/', authMiddleware, zValidator('json', createWorkoutSchema), async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const { date, duration, exercises } = c.req.valid('json');

    const workout = await prisma.workout.create({
      data: {
        userId: user.userId,
        date: date ? new Date(date) : new Date(),
        duration,
        exercises: {
          create: exercises.map(ex => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return c.json(workout, 201);
  } catch (error) {
    console.error('Create workout error:', error);
    return c.json({ error: 'Failed to create workout' }, 500);
  }
});

// Update workout
workouts.put('/:id', authMiddleware, zValidator('json', workoutSchema), async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const id = parseInt(c.req.param('id'));
    const { date, duration } = c.req.valid('json');

    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingWorkout) {
      return c.json({ error: 'Workout not found' }, 404);
    }

    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: {
        date: date ? new Date(date) : existingWorkout.date,
        duration,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return c.json(updatedWorkout);
  } catch (error) {
    console.error('Update workout error:', error);
    return c.json({ error: 'Failed to update workout' }, 500);
  }
});

// Delete workout
workouts.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = (c as any).user as { userId: number; email: string };
    const id = parseInt(c.req.param('id'));

    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingWorkout) {
      return c.json({ error: 'Workout not found' }, 404);
    }

    await prisma.workout.delete({
      where: { id },
    });

    return c.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    return c.json({ error: 'Failed to delete workout' }, 500);
  }
});

export default workouts;