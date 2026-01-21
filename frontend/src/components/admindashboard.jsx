// ==========================================
// FILE: resultpro-frontend/src/components/AdminDashboard.jsx
// ==========================================
import React, { useState, useEffect } from 'react';
import { Users, User, BookOpen, FileText, BarChart3, Plus } from 'lucide-react';
import Navbar from './Navbar';
import AddModal, { FormInput, FormSelect } from './AddModal';
import { adminService, courseService, studentAPI, staffAPI } from '../services/api';

const AdminDashboard = ({ user, onLogout }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [students, setStudents] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [stats, studentList, staffData, courseList] = await Promise.all([
                adminService.getDashboard(),
                studentAPI.getAllStudents(),
                staffAPI.getAllStaff(),
                courseService.getAllCourses()
            ]);
            setDashboardData(stats.data);
            setStudents(studentList.data.students || studentList.data.data?.students || []);
            setStaffList(staffData.data.staff || staffData.data.data?.staff || []);
            setCourses(courseList.data.courses || courseList.data.data?.courses || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const studentData = {
            email: formData.get('email'),
            password: formData.get('password'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            program: formData.get('program'),
            year: formData.get('year'),
        };

        try {
            await adminService.createStudent(studentData);
            setShowModal(false);
            loadDashboard();
        } catch (error) {
            console.error('Error creating student:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar
                user={user}
                onLogout={onLogout}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
            />

            <div className="flex">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-purple-900 text-white min-h-[calc(100vh-64px)] transition-all duration-300`}>
                    <nav className="p-4">
                        {[
                            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
                            { id: 'students', icon: Users, label: 'Students' },
                            { id: 'staff', icon: User, label: 'Staff' },
                            { id: 'courses', icon: BookOpen, label: 'Courses' },
                            { id: 'reports', icon: FileText, label: 'Reports' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeTab === item.id ? 'bg-purple-700' : 'hover:bg-purple-800'
                                    }`}
                            >
                                <item.icon size={20} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {activeTab === 'dashboard' && (
                        <div>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <p className="text-gray-600 text-sm">Total Students</p>
                                    <p className="text-3xl font-bold text-purple-600">{dashboardData?.totalStudents || 0}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <p className="text-gray-600 text-sm">Total Staff</p>
                                    <p className="text-3xl font-bold text-purple-600">{dashboardData?.totalStaff || 0}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <p className="text-gray-600 text-sm">Active Courses</p>
                                    <p className="text-3xl font-bold text-purple-600">{dashboardData?.activeCourses || 0}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <p className="text-gray-600 text-sm">Total Courses</p>
                                    <p className="text-3xl font-bold text-purple-600">{dashboardData?.totalCourses || 0}</p>
                                </div>
                            </div>

                            {/* Recent Students */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-xl font-bold mb-4">Recent Registrations</h3>
                                {dashboardData?.recentStudents?.map((student) => (
                                    <div key={student._id} className="py-3 border-b last:border-b-0 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{student.userId?.firstName} {student.userId?.lastName}</p>
                                            <p className="text-sm text-gray-600">{student.studentId} - {student.program}</p>
                                        </div>
                                        <span className="text-sm text-gray-500">Year {student.year}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Student Management</h3>
                                <button
                                    onClick={() => {
                                        setModalType('student');
                                        setShowModal(true);
                                    }}
                                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                                >
                                    <Plus size={20} />
                                    Add New Student
                                </button>
                            </div>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 font-semibold text-gray-700">Student ID</th>
                                            <th className="p-4 font-semibold text-gray-700">Name</th>
                                            <th className="p-4 font-semibold text-gray-700">Program</th>
                                            <th className="p-4 font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s._id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">{s.studentId}</td>
                                                <td className="p-4">{s.name?.firstName} {s.name?.lastName}</td>
                                                <td className="p-4">{s.program}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${s.enrollment?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {s.enrollment?.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Staff Management</h3>
                                <button
                                    onClick={() => {
                                        setModalType('staff');
                                        setShowModal(true);
                                    }}
                                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                                >
                                    <Plus size={20} />
                                    Add New Staff
                                </button>
                            </div>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 font-semibold text-gray-700">Staff ID</th>
                                            <th className="p-4 font-semibold text-gray-700">Name</th>
                                            <th className="p-4 font-semibold text-gray-700">Department</th>
                                            <th className="p-4 font-semibold text-gray-700">Designation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffList.map(s => (
                                            <tr key={s._id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">{s.staffId}</td>
                                                <td className="p-4">{s.name?.title} {s.name?.firstName} {s.name?.lastName}</td>
                                                <td className="p-4">{s.department}</td>
                                                <td className="p-4">{s.designation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Course Management</h3>
                                <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                                    <Plus size={20} />
                                    Add New Course
                                </button>
                            </div>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 font-semibold text-gray-700">Code</th>
                                            <th className="p-4 font-semibold text-gray-700">Name</th>
                                            <th className="p-4 font-semibold text-gray-700">Credits</th>
                                            <th className="p-4 font-semibold text-gray-700">Semester</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.map(c => (
                                            <tr key={c._id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 font-mono">{c.code}</td>
                                                <td className="p-4">{c.name}</td>
                                                <td className="p-4">{c.credits}</td>
                                                <td className="p-4">{c.semester}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <AddModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`Add New ${modalType === 'student' ? 'Student' : 'Staff'}`}
                onSubmit={handleCreateStudent}
                submitText="Create"
            >
                <FormInput label="First Name" name="firstName" required />
                <FormInput label="Last Name" name="lastName" required />
                <FormInput label="Email" name="email" type="email" required />
                <FormInput label="Password" name="password" type="password" required />
                <FormInput label="Program" name="program" required />
                <FormSelect
                    label="Year"
                    name="year"
                    options={[
                        { value: 1, label: '1st Year' },
                        { value: 2, label: '2nd Year' },
                        { value: 3, label: '3rd Year' },
                        { value: 4, label: '4th Year' },
                    ]}
                    required
                />
            </AddModal>
        </div>
    );
};

export default AdminDashboard;