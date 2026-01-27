import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 No seed data is inserted. Use the signup or NGO registration flow to create records.');
}

main()
  .catch((error) => {
    console.error('❌ Error during seed noop:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
