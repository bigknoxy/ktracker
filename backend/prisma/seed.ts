import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.weightEntry.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for test user
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create test user
  const user = await prisma.user.create({
    data: {
      username: 'testuser',
      password: hashedPassword,
      email: 'test@example.com',
    },
  });

  // Create weight entries
  await prisma.weightEntry.createMany({
    data: [
      { userId: user.id, date: new Date('2024-08-01'), weight: 180.5 },
      { userId: user.id, date: new Date('2024-08-02'), weight: 179.8 },
      { userId: user.id, date: new Date('2024-08-03'), weight: 179.2 },
    ],
  });

  // Create exercises
  const pushup = await prisma.exercise.create({
    data: { name: 'Push-ups', type: 'strength' },
  });

  const running = await prisma.exercise.create({
    data: { name: 'Running', type: 'cardio' },
  });

  // Create workout
  const workout = await prisma.workout.create({
    data: {
      userId: user.id,
      date: new Date('2024-08-01'),
      duration: 30,
    },
  });

  // Create workout exercises
  await prisma.workoutExercise.createMany({
    data: [
      { workoutId: workout.id, exerciseId: pushup.id, sets: 3, reps: 10, weight: 0 },
      { workoutId: workout.id, exerciseId: running.id, sets: 1, reps: 1, weight: 0 },
    ],
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: 'Complete morning workout',
        description: 'Do cardio and strength training',
        dueDate: new Date('2024-08-02'),
        priority: 'high',
        completed: false,
      },
      {
        userId: user.id,
        title: 'Track weight',
        description: 'Log daily weight in the app',
        dueDate: new Date('2024-08-03'),
        priority: 'medium',
        completed: true,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });