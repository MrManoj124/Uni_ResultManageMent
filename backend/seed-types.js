// backend/seed-types.js
// Seed script for type-based system with faculties, departments, and types

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Student = require('./models/Student');
const Staff = require('./models/Staff');
const Course = require('./models/Course');
const Type = require('./models/Type');
const Exam = require('./models/Exam');
const Result = require('./models/Result');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resultManagement')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const DEFAULT_PASSWORD = 'uov2026user';
const ACADEMIC_YEAR = '2025/2026';

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting type-based database seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Student.deleteMany({});
        await Staff.deleteMany({});
        await Course.deleteMany({});
        await Type.deleteMany({});
        await Exam.deleteMany({});
        await Result.deleteMany({});
        console.log('✅ Cleared existing data');

        // ============================================
        // 1. Create Admin
        // ============================================
        const admin = await User.create({
            username: 'admin',
            email: 'admin@uov.lk',
            password: 'admin123',
            role: 'admin',
            name: 'System Administrator',
            isEmailVerified: true,
            isFirstLogin: false,
            mustChangePassword: false
        });
        console.log('✅ Created admin');

        // ============================================
        // 2. Create Types for all faculties
        // ============================================
        const types = [];

        // Business Faculty Types (B = Business)
        const businessTypes = [
            { typeId: 'B11', faculty: 'Business', department: 'Business Management', year: 1, semester: 1 },
            { typeId: 'B12', faculty: 'Business', department: 'Business Management', year: 1, semester: 2 },
            { typeId: 'BI11', faculty: 'Business', department: 'Banking Insurance', year: 1, semester: 1 },
            { typeId: 'PM11', faculty: 'Business', department: 'Project Management', year: 1, semester: 1 },
        ];

        // Technology Faculty Types (T = Technology)
        const technologyTypes = [
            { typeId: 'T11', faculty: 'Technology', department: 'Engineering', year: 1, semester: 1 },
            { typeId: 'CE11', faculty: 'Technology', department: 'Computer Engineering', year: 1, semester: 1 },
        ];

        // Applied Science Faculty Types (AS = Applied Science)
        const appliedScienceTypes = [
            { typeId: 'AS11', faculty: 'Applied Science', department: 'Bio-Science', year: 1, semester: 1 },
            { typeId: 'PS11', faculty: 'Applied Science', department: 'Physical Science', year: 1, semester: 1 },
            { typeId: 'ICT11', faculty: 'Applied Science', department: 'Information and Communication Technology', year: 1, semester: 1 },
            { typeId: 'ICT12', faculty: 'Applied Science', department: 'Information and Communication Technology', year: 1, semester: 2 },
            { typeId: 'AM11', faculty: 'Applied Science', department: 'Applied Mathematical and Computer Science', year: 1, semester: 1 },
        ];

        for (const typeData of [...businessTypes, ...technologyTypes, ...appliedScienceTypes]) {
            const type = await Type.create({
                ...typeData,
                academicYear: ACADEMIC_YEAR,
                createdBy: admin._id,
                isActive: true
            });
            types.push(type);
            console.log(`✅ Created type: ${type.typeId}`);
        }

        // ============================================
        // 3. Create Staff for each faculty
        // ============================================
        const staffMembers = [];

        const staffData = [
            // Business Faculty Staff
            { staffId: 'STAFF/BUS/001', firstName: 'Nimal', lastName: 'Fernando', faculty: 'Business', department: 'Business Management', designation: 'Senior Lecturer' },
            { staffId: 'STAFF/BUS/002', firstName: 'Kamala', lastName: 'Silva', faculty: 'Business', department: 'Banking Insurance', designation: 'Lecturer' },

            // Technology Faculty Staff
            { staffId: 'STAFF/TEC/001', firstName: 'Sunil', lastName: 'Perera', faculty: 'Technology', department: 'Engineering', designation: 'Professor' },

            // Applied Science Faculty Staff
            { staffId: 'STAFF/FAS/001', firstName: 'Arun', lastName: 'Kumara', faculty: 'Applied Science', department: 'Information and Communication Technology', designation: 'Senior Lecturer' },
            { staffId: 'STAFF/FAS/002', firstName: 'Priya', lastName: 'Wickramasinghe', faculty: 'Applied Science', department: 'Applied Mathematical and Computer Science', designation: 'Lecturer' },
        ];

        for (const staff of staffData) {
            const user = await User.create({
                username: staff.staffId,
                email: `${staff.firstName.toLowerCase()}.${staff.lastName.toLowerCase()}@uov.lk`,
                password: DEFAULT_PASSWORD,
                role: 'staff',
                name: `${staff.firstName} ${staff.lastName}`,
                staffId: staff.staffId,
                isEmailVerified: true,
                isFirstLogin: true,
                mustChangePassword: true,
                defaultPassword: DEFAULT_PASSWORD
            });

            const staffProfile = await Staff.create({
                staffId: staff.staffId,
                userId: user._id,
                name: {
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    title: 'Dr.'
                },
                email: user.email,
                faculty: staff.faculty,
                department: staff.department,
                designation: staff.designation,
                isActive: true
            });

            staffMembers.push(staffProfile);
            console.log(`✅ Created staff: ${staff.staffId}`);
        }

        // ============================================
        // 4. Create Courses for each type
        // ============================================
        const courses = [];

        const courseData = [
            // ICT Courses (Type ICT11)
            { code: 'ICT1101', name: 'Programming Fundamentals', credits: 3, semester: '1', faculty: 'Applied Science', department: 'Information and Communication Technology', typeId: 'ICT11', icaWeightage: 40, semesterExamWeightage: 60 },
            { code: 'ICT1102', name: 'Database Systems', credits: 3, semester: '1', faculty: 'Applied Science', department: 'Information and Communication Technology', typeId: 'ICT11', icaWeightage: 30, semesterExamWeightage: 70 },
            { code: 'ICT1103', name: 'Web Development', credits: 3, semester: '1', faculty: 'Applied Science', department: 'Information and Communication Technology', typeId: 'ICT11', icaWeightage: 40, semesterExamWeightage: 60 },

            // Business Management Courses (Type B11)
            { code: 'BUS1101', name: 'Introduction to Business', credits: 3, semester: '1', faculty: 'Business', department: 'Business Management', typeId: 'B11', icaWeightage: 30, semesterExamWeightage: 70 },
            { code: 'BUS1102', name: 'Marketing Principles', credits: 3, semester: '1', faculty: 'Business', department: 'Business Management', typeId: 'B11', icaWeightage: 40, semesterExamWeightage: 60 },
        ];

        for (const courseInfo of courseData) {
            const type = types.find(t => t.typeId === courseInfo.typeId);
            const assignedStaff = staffMembers.filter(s => s.department === courseInfo.department);

            const course = await Course.create({
                code: courseInfo.code,
                name: courseInfo.name,
                credits: courseInfo.credits,
                semester: courseInfo.semester,
                faculty: courseInfo.faculty,
                department: courseInfo.department,
                typeId: type._id,
                icaWeightage: courseInfo.icaWeightage,
                semesterExamWeightage: courseInfo.semesterExamWeightage,
                academicYear: ACADEMIC_YEAR,
                assignedStaff: assignedStaff.map(s => s._id),
                isActive: true
            });

            // Add course to type
            await type.addCourse(course._id);

            // Add course to staff
            for (const staff of assignedStaff) {
                if (!staff.assignedCourses.includes(course._id)) {
                    staff.assignedCourses.push(course._id);
                    if (!staff.assignedTypes.includes(type._id)) {
                        staff.assignedTypes.push(type._id);
                    }
                    await staff.save();
                }
            }

            courses.push(course);
            console.log(`✅ Created course: ${course.code} - ${course.name}`);
        }

        // ============================================
        // 5. Create Students
        // ============================================
        const students = [];

        const studentData = [
            // ICT Students
            { studentId: '2021/ICT/001', indexNumber: 'ICT/21/001', firstName: 'Kasun', lastName: 'Perera', typeId: 'ICT11', faculty: 'Applied Science', department: 'Information and Communication Technology', program: 'BSc IT' },
            { studentId: '2021/ICT/002', indexNumber: 'ICT/21/002', firstName: 'Nimali', lastName: 'Fernando', typeId: 'ICT11', faculty: 'Applied Science', department: 'Information and Communication Technology', program: 'BSc IT' },
            { studentId: '2021/ICT/074', indexNumber: 'ICT/21/074', firstName: 'Manoj', lastName: 'Silva', typeId: 'ICT11', faculty: 'Applied Science', department: 'Information and Communication Technology', program: 'BSc IT' },

            // Business Students
            { studentId: '2021/BUS/001', indexNumber: 'BUS/21/001', firstName: 'Saman', lastName: 'Kumara', typeId: 'B11', faculty: 'Business', department: 'Business Management', program: 'BSc Business Management' },
            { studentId: '2021/BUS/002', indexNumber: 'BUS/21/002', firstName: 'Dilini', lastName: 'Rajapaksa', typeId: 'B11', faculty: 'Business', department: 'Business Management', program: 'BSc Business Management' },
        ];

        for (const student of studentData) {
            const type = types.find(t => t.typeId === student.typeId);

            const user = await User.create({
                username: student.studentId,
                email: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@student.uov.lk`,
                password: DEFAULT_PASSWORD,
                role: 'student',
                name: `${student.firstName} ${student.lastName}`,
                studentId: student.studentId,
                isEmailVerified: true,
                isFirstLogin: true,
                mustChangePassword: true,
                defaultPassword: DEFAULT_PASSWORD
            });

            const studentProfile = await Student.create({
                studentId: student.studentId,
                indexNumber: student.indexNumber,
                userId: user._id,
                typeId: type._id,
                faculty: student.faculty,
                department: student.department,
                name: {
                    firstName: student.firstName,
                    lastName: student.lastName
                },
                email: user.email,
                program: student.program,
                batch: '2021/2022',
                enrollmentYear: 2021,
                currentSemester: 1
            });

            // Add student to type
            await type.enrollStudent(studentProfile._id);

            students.push(studentProfile);
            console.log(`✅ Created student: ${student.studentId}`);
        }

        // ============================================
        // 6. Assign Staff to Types
        // ============================================
        for (const type of types) {
            const typeCourses = courses.filter(c => c.typeId && c.typeId.equals(type._id));
            const typeStaff = staffMembers.filter(s => s.department === type.department);

            for (const staff of typeStaff) {
                await type.assignStaffToCourses(staff._id, typeCourses.map(c => c._id));
            }

            console.log(`✅ Assigned staff to type: ${type.typeId}`);
        }

        console.log('\n🎉 Type-based database seeded successfully!');
        console.log('\n🔑 Login Credentials:');
        console.log('   Admin: admin / admin123');
        console.log(`   Staff: STAFF/FAS/001 / ${DEFAULT_PASSWORD}`);
        console.log(`   Student: 2021/ICT/074 / ${DEFAULT_PASSWORD}`);
        console.log('\n📊 Summary:');
        console.log(`   Types: ${types.length}`);
        console.log(`   Staff: ${staffMembers.length}`);
        console.log(`   Courses: ${courses.length}`);
        console.log(`   Students: ${students.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
