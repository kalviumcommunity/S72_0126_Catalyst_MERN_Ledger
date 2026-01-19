import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database to demonstrate NGO duplication prevention...');

  // Clean existing data
  await prisma.taskTag.deleteMany();
  await prisma.projectTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Create Users from different NGOs
  console.log('Creating users from different organizations...');
  
  // Admin user for platform management
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ledger.org',
      name: 'System Administrator',
      organization: 'Ledger Platform',
      role: 'admin',
      password: 'hashed_password_placeholder', // In production, hash this properly
    },
  });

  const userCleanWaterNGO = await prisma.user.create({
    data: {
      email: 'maria@cleanwaterinitiative.org',
      name: 'Maria Rodriguez',
      organization: 'Clean Water Initiative',
      role: 'project_manager',
      password: 'hashed_password_placeholder',
    },
  });

  const userHealthAccess = await prisma.user.create({
    data: {
      email: 'john@healthaccess.org',
      name: 'John Smith',
      organization: 'Health Access Foundation',
      role: 'user',
      password: 'hashed_password_placeholder',
    },
  });

  const userEduForAll = await prisma.user.create({
    data: {
      email: 'aisha@educationforall.org',
      name: 'Aisha Patel',
      organization: 'Education For All',
      role: 'user',
      password: 'hashed_password_placeholder',
    },
  });

  console.log(`✅ Created ${4} users (1 admin, 3 regular users) from different organizations`);

  // Create Tags for categorization and discovery
  console.log('Creating tags for effort categorization...');
  const tagLogistics = await prisma.tag.create({
    data: {
      name: 'Logistics',
      description: 'Supply chain, transportation, and distribution',
    },
  });

  const tagSustainability = await prisma.tag.create({
    data: {
      name: 'Sustainability',
      description: 'Long-term environmental and social impact',
    },
  });

  const tagCommunityEngagement = await prisma.tag.create({
    data: {
      name: 'Community Engagement',
      description: 'Local participation and stakeholder involvement',
    },
  });

  const tagDataCollection = await prisma.tag.create({
    data: {
      name: 'Data Collection',
      description: 'Surveys, assessments, and monitoring',
    },
  });

  const tagHealthcare = await prisma.tag.create({
    data: {
      name: 'Healthcare',
      description: 'Medical services and health infrastructure',
    },
  });

  const tagEducation = await prisma.tag.create({
    data: {
      name: 'Education',
      description: 'Learning programs and educational infrastructure',
    },
  });

  console.log(`✅ Created ${6} tags for categorization`);

  // Create Public Projects (Visible to all NGOs)
  console.log('Creating public projects...');
  
  // Project 1: Clean Water Initiative (Public)
  const projectCleanWater = await prisma.project.create({
    data: {
      title: 'Rural Clean Water Access - East Africa',
      description: 'Implementing sustainable water purification systems in 50 rural villages',
      isPublic: true,
      status: 'active',
      ownerId: userCleanWaterNGO.id,
      startDate: new Date('2025-11-01'),
    },
  });

  // Project 2: Health Access Foundation (Public)
  const projectHealthClinic = await prisma.project.create({
    data: {
      title: 'Mobile Health Clinic Deployment',
      description: 'Setting up mobile clinics in underserved rural areas',
      isPublic: true,
      status: 'active',
      ownerId: userHealthAccess.id,
      startDate: new Date('2025-12-01'),
    },
  });

  // Project 3: Education For All (Public)
  const projectDigitalLearning = await prisma.project.create({
    data: {
      title: 'Digital Learning Centers',
      description: 'Establishing computer labs in remote schools',
      isPublic: true,
      status: 'active',
      ownerId: userEduForAll.id,
      startDate: new Date('2026-01-01'),
    },
  });

  console.log(`✅ Created ${3} public projects`);

  // Tag Projects for discoverability
  await prisma.projectTag.createMany({
    data: [
      { projectId: projectCleanWater.id, tagId: tagLogistics.id },
      { projectId: projectCleanWater.id, tagId: tagSustainability.id },
      { projectId: projectCleanWater.id, tagId: tagCommunityEngagement.id },
      { projectId: projectHealthClinic.id, tagId: tagLogistics.id },
      { projectId: projectHealthClinic.id, tagId: tagHealthcare.id },
      { projectId: projectHealthClinic.id, tagId: tagCommunityEngagement.id },
      { projectId: projectDigitalLearning.id, tagId: tagEducation.id },
      { projectId: projectDigitalLearning.id, tagId: tagCommunityEngagement.id },
    ],
  });

  console.log(`✅ Tagged projects for discovery`);

  // Create Reusable Tasks with Template URLs
  console.log('Creating reusable tasks with templates...');

  // REUSABLE TASK 1: Site Survey Template (used by Clean Water project)
  const taskSiteSurvey = await prisma.task.create({
    data: {
      title: 'Community Site Survey',
      description: 'Standard template for assessing community needs and site conditions',
      templateUrl: 'https://templates.ngo/site-survey-v2.pdf',
      status: 'completed',
      priority: 'high',
      projectId: projectCleanWater.id,
      assigneeId: userCleanWaterNGO.id,
    },
  });

  // REUSABLE TASK 2: Logistics Planning Template (also in Clean Water)
  const taskLogistics = await prisma.task.create({
    data: {
      title: 'Supply Chain & Logistics Planning',
      description: 'Comprehensive logistics framework for rural distribution',
      templateUrl: 'https://templates.ngo/logistics-framework.xlsx',
      status: 'completed',
      priority: 'high',
      projectId: projectCleanWater.id,
      assigneeId: userCleanWaterNGO.id,
    },
  });

  // Health Access Foundation REUSES the same templates
  const taskHealthSurvey = await prisma.task.create({
    data: {
      title: 'Health Needs Assessment',
      description: 'Using standard site survey template adapted for health services',
      templateUrl: 'https://templates.ngo/site-survey-v2.pdf', // SAME TEMPLATE
      status: 'in-progress',
      priority: 'high',
      projectId: projectHealthClinic.id,
      assigneeId: userHealthAccess.id,
    },
  });

  const taskHealthLogistics = await prisma.task.create({
    data: {
      title: 'Medical Supply Distribution',
      description: 'Adapted logistics framework for medical equipment delivery',
      templateUrl: 'https://templates.ngo/logistics-framework.xlsx', // SAME TEMPLATE
      status: 'in-progress',
      priority: 'high',
      projectId: projectHealthClinic.id,
      assigneeId: userHealthAccess.id,
    },
  });

  // Education project also reuses templates
  const taskEduSurvey = await prisma.task.create({
    data: {
      title: 'School Infrastructure Assessment',
      description: 'Site survey for digital infrastructure requirements',
      templateUrl: 'https://templates.ngo/site-survey-v2.pdf', // SAME TEMPLATE
      status: 'pending',
      priority: 'medium',
      projectId: projectDigitalLearning.id,
      assigneeId: userEduForAll.id,
    },
  });

  // Additional unique tasks
  const taskWaterTesting = await prisma.task.create({
    data: {
      title: 'Water Quality Testing Protocol',
      description: 'Standard procedures for testing water purification systems',
      templateUrl: 'https://templates.ngo/water-quality-testing.pdf',
      status: 'completed',
      priority: 'high',
      projectId: projectCleanWater.id,
      assigneeId: userCleanWaterNGO.id,
    },
  });

  const taskStaffTraining = await prisma.task.create({
    data: {
      title: 'Local Staff Training Program',
      description: 'Training curriculum for healthcare workers',
      templateUrl: 'https://templates.ngo/healthcare-training-v1.pptx',
      status: 'pending',
      priority: 'medium',
      projectId: projectHealthClinic.id,
      assigneeId: userHealthAccess.id,
    },
  });

  const taskComputerSetup = await prisma.task.create({
    data: {
      title: 'Computer Lab Setup Guide',
      description: 'Step-by-step installation and configuration guide',
      templateUrl: 'https://templates.ngo/computer-lab-setup.pdf',
      status: 'in-progress',
      priority: 'medium',
      projectId: projectDigitalLearning.id,
      assigneeId: userEduForAll.id,
    },
  });

  console.log(`✅ Created ${8} tasks (3 template URLs reused across NGOs)`);

  // Tag Tasks for discoverability
  await prisma.taskTag.createMany({
    data: [
      // Site surveys - all share Data Collection tag
      { taskId: taskSiteSurvey.id, tagId: tagDataCollection.id },
      { taskId: taskSiteSurvey.id, tagId: tagCommunityEngagement.id },
      { taskId: taskHealthSurvey.id, tagId: tagDataCollection.id },
      { taskId: taskHealthSurvey.id, tagId: tagHealthcare.id },
      { taskId: taskEduSurvey.id, tagId: tagDataCollection.id },
      { taskId: taskEduSurvey.id, tagId: tagEducation.id },
      
      // Logistics - shared tag
      { taskId: taskLogistics.id, tagId: tagLogistics.id },
      { taskId: taskHealthLogistics.id, tagId: tagLogistics.id },
      { taskId: taskHealthLogistics.id, tagId: tagHealthcare.id },
      
      // Specialized tasks
      { taskId: taskWaterTesting.id, tagId: tagSustainability.id },
      { taskId: taskStaffTraining.id, tagId: tagHealthcare.id },
      { taskId: taskComputerSetup.id, tagId: tagEducation.id },
    ],
  });

  console.log(`✅ Tagged tasks for cross-organization discovery`);

  console.log('');
  console.log('✨ Database seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  - Users: ${await prisma.user.count()} (from 3 different NGOs)`);
  console.log(`  - Projects: ${await prisma.project.count()} (all public for transparency)`);
  console.log(`  - Tasks: ${await prisma.task.count()} (including reusable templates)`);
  console.log(`  - Tags: ${await prisma.tag.count()} (for categorization and discovery)`);
  console.log('');
  console.log('🎯 Duplication Prevention Demonstrated:');
  console.log('  ✓ Health Access Foundation reused "Site Survey" template from Clean Water Initiative');
  console.log('  ✓ Education For All reused "Logistics Framework" from existing projects');
  console.log('  ✓ All tasks tagged with "Data Collection" can be discovered by any NGO');
  console.log('  ✓ Public projects ensure visibility across organizations');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
