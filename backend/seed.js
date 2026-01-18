// backend/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Student = require('./models/Student');
const Staff = require('./models/Staff');
const Course = require('./models/Course');
const Result = require('./models/Result');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resultpro')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Staff.deleteMany({});
    await Course.deleteMany({});
    await Result.deleteMany({});
    console.log('✅ Cleared existing data');

    // ============================================
    // 1. Create Admin
    // ============================================
    const admin = await User.create({
      username: 'admin',
      email: 'admin@uva.lk',
      password: 'admin123',
      role: 'admin',
      name: 'System Administrator',
      isEmailVerified: true
    });
    console.log('✅ Created admin');

    // ============================================
    // 2. Create Staff
    // ============================================
    const staffUser = await User.create({
      username: 'staff01',
      email: 'staff@uva.lk',
      password: 'staff123',
      role: 'staff',
      name: 'Dr. Arun Kumara',
      staffId: 'STAFF/001',
      isEmailVerified: true
    });

    const staffProfile = await Staff.create({
      staffId: 'STAFF/001',
      userId: staffUser._id,
      name: {
        firstName: 'Arun',
        lastName: 'Kumara',
        title: 'Dr.'
      },
      email: 'staff@uva.lk',
      department: 'Information Technology',
      designation: 'Senior Lecturer',
      isActive: true
    });
    console.log('✅ Created staff');

    // ============================================
    // 3. Create Courses
    // ============================================
    const courses = await Course.create([
      {
        code: 'IT3162',
        name: 'Group Project',
        credits: 3,
        semester: '6',
        department: 'Information Technology',
        assignedStaff: [staffProfile._id]
      },
      {
        code: 'IT3152',
        name: 'Software Engineering',
        credits: 3,
        semester: '6',
        department: 'Information Technology',
        assignedStaff: [staffProfile._id]
      },
      {
        code: 'IT3112',
        name: 'Machine Learning',
        credits: 3,
        semester: '6',
        department: 'Information Technology',
        assignedStaff: [staffProfile._id]
      }
    ]);
    console.log('✅ Created courses');

    // Update staff with assigned courses
    staffProfile.assignedCourses = courses.map(c => c._id);
    await staffProfile.save();

    // ============================================
    // 4. Create Students
    // ============================================
    const studentData = [
      { id: '2021/ICT/41', name: { first: 'Nimal', last: 'P' }, email: 'nimal@uva.lk' },
      { id: '2021/ICT/74', name: { first: 'Manoj', last: 'S' }, email: 'manoj@uva.lk' },
      { id: '2021/ICT/96', name: { first: 'Keerthana', last: 'R' }, email: 'keerthana@uva.lk' }
    ];

    const studentIds = [];

    for (const s of studentData) {
      const user = await User.create({
        username: s.id,
        email: s.email,
        password: 'student123',
        role: 'student',
        name: `${s.name.first} ${s.name.last}`,
        studentId: s.id,
        isEmailVerified: true
      });

      const profile = await Student.create({
        studentId: s.id,
        userId: user._id,
        name: {
          firstName: s.name.first,
          lastName: s.name.last
        },
        email: s.email,
        program: 'BSc IT',
        batch: '2021/2022',
        enrollmentYear: 2021,
        academicInfo: {
          advisor: staffProfile._id
        }
      });

      studentIds.push(profile.studentId);
      staffProfile.advisingStudents.push(profile._id);
    }

    await staffProfile.save();
    console.log('✅ Created students');

    // ============================================
    // 5. Create Results
    // ============================================
    for (const sid of studentIds) {
      for (const course of courses) {
        const marks = Math.floor(Math.random() * 40) + 55; // 55-95
        await Result.create({
          studentId: sid,
          courseId: course._id,
          marks: marks,
          academicYear: '2024/2025',
          semester: '6',
          status: 'published',
          uploadedBy: staffUser._id,
          publishedBy: admin._id,
          publishedAt: new Date()
        });
      }
    }
    console.log('✅ Created results');

    console.log('\n🎉 Database seeded successfully!');
    console.log('🔑 Login Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Staff: staff01 / staff123');
    console.log('   Student: 2021/ICT/41 / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();