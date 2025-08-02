const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function unbanAdmin() {
  try {
    console.log('🔧 Unbanning admin user...\n');
    
    // Update the admin@admin.com user to be active
    const updatedUser = await prisma.user.update({
      where: {
        email: 'admin@admin.com'
      },
      data: {
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log('✅ Successfully unbanned admin user:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.firstName || 'N/A'} ${updatedUser.lastName || 'N/A'}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Active: ${updatedUser.isActive ? 'Yes' : 'No'}`);
    console.log(`   Created: ${updatedUser.createdAt.toLocaleDateString()}\n`);

    console.log('🎉 Admin user is now unbanned and can access the admin dashboard!');

  } catch (error) {
    if (error.code === 'P2025') {
      console.error('❌ Error: admin@admin.com user not found in database');
    } else {
      console.error('❌ Error unbanning admin user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

unbanAdmin();
