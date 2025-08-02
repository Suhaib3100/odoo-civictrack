const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Updating admin user role...\n');
    
    // Update the admin@admin.com user to have ADMIN role
    const updatedUser = await prisma.user.update({
      where: {
        email: 'admin@admin.com'
      },
      data: {
        role: 'ADMIN'
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

    console.log('✅ Successfully updated admin user:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.firstName || 'N/A'} ${updatedUser.lastName || 'N/A'}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Active: ${updatedUser.isActive ? 'Yes' : 'No'}`);
    console.log(`   Created: ${updatedUser.createdAt.toLocaleDateString()}\n`);

    // Verify the update by checking all admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    console.log(`📊 Total admin users in database: ${adminUsers.length}`);
    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} (${admin.role})`);
    });

  } catch (error) {
    if (error.code === 'P2025') {
      console.error('❌ Error: admin@admin.com user not found in database');
    } else {
      console.error('❌ Error updating admin user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
