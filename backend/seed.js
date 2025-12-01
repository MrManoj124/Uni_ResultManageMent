// ============================================
// BACKEND: seed.js
// Database Seeding Script for Initial Data
// Run with: node seed.js
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resultpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ============================================
// SCHEMAS (Same as server.js)
// ============================================

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], required: true },
  name: { type: String, required: true },
  studentId: { type: String, sparse: true },
  email: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  program: { type: String, required: true },
  dateOfBirth: Date,
  address: String,
  phone: String,
  enrollmentYear: Number,
  createdAt: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  semester: { type: String, required: true },
  department: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const resultSchema = new mongoose.Schema({
  studentId: { type: String, required: true, ref: 'Student' },
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' },
  marks: { type: Number, required: true, min: 0, max: 100 },
  grade: { type: String, required: true },
  gradePoints: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'published'], default: 'pending' },
  academicYear: String,
  examDate: Date,
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

resultSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);
const Result = mongoose.model('Result', resultSchema);

// ============================================
// HELPER FUNCTION
// ============================================

const calculateGrade = (marks) => {
  if (marks >= 90) return { grade: 'A+', points: 4.0 };
  if (marks >= 85) return { grade: 'A', points: 4.0 };
  if (marks >= 80) return { grade: 'A-', points: 3.7 };
  if (marks >= 75) return { grade: 'B+', points: 3.3 };
  if (marks >= 70) return { grade: 'B', points: 3.0 };
  if (marks >= 65) return { grade: 'B-', points: 2.7 };
  if (marks >= 60) return { grade: 'C+', points: 2.3 };
  if (marks >= 55) return { grade: 'C', points: 2.0 };
  if (marks >= 50) return { grade: 'C-', points: 1.7 };
  return { grade: 'F', points: 0.0 };
};

// ============================================
// SEED DATA
// ============================================

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Result.deleteMany({});
    console.log('✅ Cleared existing data');

    // ============================================
    // 1. Create Users
    // ============================================
    
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedStudentPassword = await bcrypt.hash('student123', 10);

    const users = [
      {
        username: 'admin',
        password: hashedAdminPassword,
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@uva.lk'
      },
      {
        username: '2021/ICT/41',
        password: hashedStudentPassword,
        role: 'student',
        name: 'U.D.N.P Nawarathne',
        studentId: '2021/ICT/41',
        email: 'nawarathne@uva.lk'
      },
      {
        username: '2021/ICT/74',
        password: hashedStudentPassword,
        role: 'student',
        name: 'S. Manoj',
        studentId: '2021/ICT/74',
        email: 'manoj@uva.lk'
      },
      {
        username: '2021/ICT/96',
        password: hashedStudentPassword,
        role: 'student',
        name: 'R. Keerthana',
        studentId: '2021/ICT/96',
        email: 'keerthana@uva.lk'
      },
      {
        username: '2021/ICT/108',
        password: hashedStudentPassword,
        role: 'student',
        name: 'M.I.F Nusha',
        studentId: '2021/ICT/108',
        email: 'nusha@uva.lk'
      },
      {
        username: '2021/ICT/122',
        password: hashedStudentPassword,
        role: 'student',
        name: 'A.G.K.S Bandara',
        studentId: '2021/ICT/122',
        email: 'bandara@uva.lk'
      },
      {
        username: '2021/ICT/123',
        password: hashedStudentPassword,
        role: 'student',
        name: 'D.K.A.P Udayasiri',
        studentId: '2021/ICT/123',
        email: 'udayasiri@uva.lk'
      }
    ];

    await User.insertMany(users);
    console.log('✅ Created users');

    // ============================================
    // 2. Create Students
    // ============================================

    const students = [
      {
        studentId: '2021/ICT/41',
        name: 'U.D.N.P Nawarathne',
        email: 'nawarathne@uva.lk',
        program: 'BSc IT',
        dateOfBirth: new Date('2000-05-15'),
        phone: '+94771234567',
        enrollmentYear: 2021
      },
      {
        studentId: '2021/ICT/74',
        name: 'S. Manoj',
        email: 'manoj@uva.lk',
        program: 'BSc IT',
        dateOfBirth: new Date('2001-03-20'),
        phone: '+94772234567',
        enrollmentYear: 2021
      },
      {
        studentId: '2021/ICT/96',
        name: 'R. Keerthana',
        email: 'keerthana@uva.lk',
        program: 'BSc IT',
        dateOfBirth: new Date('2000-08-12'),
        phone: '+94773234567',
        enrollmentYear: 2021
      },
      {
        studentId: '2021/ICT/108',
        name: 'M.I.F Nusha',
        email: 'nusha@uva.lk',
        program: 'BSc IT',
        dateOfBirth: new Date('2001-01-25'),
        phone: '+94774234567',
        enrollmentYear: 2021
      },
      {
        studentId: '2021/ICT/122',
        name: 'A.G.K.S Bandara',
        email: 'bandara@uva.lk',
        program: 'BSc IT',
        dateOfBirth: new Date('2000-11-30'),
        phone: '+94775234567',
        enrollmentYear: 2021
      },
      {
        studentId: '2021/ICT/123',
        name: 'D.K.A.P Udayasiri',
        email: 'udayasiri@uva.lk',
        program: 'BSc IT',
        dateOfBirth: new Date('2001-07-18'),
        phone: '+94776234567',
        enrollmentYear: 2021
      }
    ];

    await Student.insertMany(students);
    console.log('✅ Created students');

    // ============================================
    // 3. Create Courses
    // ============================================

    const courses = [
      {
        code: 'IT3162',
        name: 'Group Project',
        credits: 3,
        semester: '6',
        department: 'Information Technology',
        description: 'Final year group project'
      },
      {
        code: 'IT3152',
        name: 'Software Engineering',
        credits: 3,
        semester: '6',
        department: 'Information Technology',
        description: 'Advanced software engineering concepts'
      },
      {
        code: 'IT3142',
        name: 'Database Systems',
        credits: 3,
        semester: '6',
        department: 'Information Technology',
        description: 'Advanced database design and management'
      },
      {
        code: 'IT3132',
        name: 'Web Technologies',
        credits: 3,
        semester: '6',
        department: 'Information Technology',
        description: 'Modern web development technologies'
      },
      {
        code: 'IT3122',
        name: 'Network Security',
        credits: 3,
        semester: '6',
        department: 'Information Technology',
        description: 'Network security principles and practices'
      },
      {
        code: 'IT3112',
        name: 'Machine Learning',
        credits: 3,
        semester: '6',
        department: 'Information Technology',
        description: 'Introduction to machine learning algorithms'
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log('✅ Created courses');

    // ============================================
    // 4. Create Results
    // ============================================

    const results = [];

    // Generate results for each student
    const studentIds = ['2021/ICT/41', '2021/ICT/74', '2021/ICT/96', '2021/ICT/108', '2021/ICT/122', '2021/ICT/123'];
    
    studentIds.forEach((studentId, studentIndex) => {
      createdCourses.forEach((course, courseIndex) => {
        // Generate random marks between 50-95
        const marks = Math.floor(Math.random() * 46) + 50; // 50 to 95
        const gradeInfo = calculateGrade(marks);
        
        // Vary status - some published, some pending
        const status = (studentIndex + courseIndex) % 3 === 0 ? 'pending' : 'published';

        results.push({
          studentId: studentId,
          courseId: course._id,
          marks: marks,
          grade: gradeInfo.grade,
          gradePoints: gradeInfo.points,
          status: status,
          academicYear: '2024/2025',
          examDate: new Date('2025-09-15')
        });
      });
    });

    await Result.insertMany(results);
    console.log('✅ Created results');

    // ============================================
    // Summary
    // ============================================

    console.log('\n📊 Seeding Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Students: ${students.length}`);
    console.log(`   Courses: ${courses.length}`);
    console.log(`   Results: ${results.length}`);
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Student: 2021/ICT/41 / student123');
    console.log('   (All students have password: student123)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();