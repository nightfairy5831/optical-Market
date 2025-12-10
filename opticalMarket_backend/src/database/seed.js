const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@opticalmarket.com' },
    update: {},
    create: {
      email: 'admin@opticalmarket.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('Admin user created:', admin.email);

  // Create a sample category
  const category = await prisma.category.upsert({
    where: { slug: 'sunglasses' },
    update: {},
    create: {
      name: 'Sunglasses',
      slug: 'sunglasses',
    },
  });

  console.log('Category created:', category.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
