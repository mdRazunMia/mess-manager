import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed expense categories
  const categories = [
    'Market',
    'Gas',
    'Electricity',
    'Internet',
    'Water',
    'Cleaner',
    'Maintenance',
    'Other',
  ];

  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Expense categories seeded.');

  // Create default mess if none exists
  const mess = await prisma.mess.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'My Mess',
      address: '',
      manager_name: 'Manager',
      manager_email: '',
      phone: '',
    },
  });

  // Create default settings for the mess
  await prisma.setting.upsert({
    where: { mess_id: mess.id },
    update: {},
    create: {
      mess_id: mess.id,
      breakfast_weight: 0.5,
      lunch_weight: 1.0,
      dinner_weight: 1.0,
      auto_email_enabled: false,
      auto_close_enabled: false,
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      smtp_from: '',
      currency: 'BDT',
      language: 'en',
    },
  });

  console.log('Default mess and settings seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
