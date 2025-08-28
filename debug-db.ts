import { PrismaClient } from './backend/generated/prisma';

const prisma = new PrismaClient();

async function debugDb() {
  console.log('Users in database:');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
    }
  });

  users.forEach(user => {
    console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Password: ${user.password}`);
  });

  await prisma.$disconnect();
}

debugDb().catch(console.error);