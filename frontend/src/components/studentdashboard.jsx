// ==========================================
// FILE: resultpro-frontend/src/components/StudentDashboard.jsx
// ==========================================
import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Award, Calendar, TrendingUp } from 'lucide-react';
import Navbar from './Navbar';
import { studentService } from '../services/api';
import { formatDateShort, getStatusColor } from '../utils/helpers';


const StudentDashboard = ({ user, onLogout }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await studentService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 text-white min-h-[calc(100vh-64px)] transition-all duration-300`}>
                    <nav className="p-4">
                        {[
                            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
                            { id: 'courses', icon: BookOpen, label: 'My Courses' },
                            { id: 'assignments', icon: FileText, label: 'Assignments' },
                            { id: 'grades', icon: Award, label: 'Grades' },
                            { id: 'schedule', icon: Calendar, label: 'Schedule' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeTab === item.id ? 'bg-indigo-700' : 'hover:bg-indigo-800'
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
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <p className="text-gray-600 text-sm">Current GPA</p>
                                    <p className="text-3xl font-bold text-indigo-600">{dashboardData?.student?.gpa || '0.00'}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <p className="text-gray-600 text-sm">Enrolled Courses</p>
                                    <p className="text-3xl font-bold text-indigo-600">{dashboardData?.student?.enrolledCourses?.length || 0}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <p className="text-gray-600 text-sm">Attendance</p>
                                    <p className="text-3xl font-bold text-green-600">{dashboardData?.student?.attendance || 0}%</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <p className="text-gray-600 text-sm">Pending Tasks</p>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {dashboardData?.assignments?.filter(a => a.status === 'pending').length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Recent Assignments */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-xl font-bold mb-4">Recent Assignments</h3>
                                {dashboardData?.assignments?.map((assignment) => (
                                    <div key={assignment._id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                        <div>
                                            <p className="font-semibold">{assignment.title}</p>
                                            <p className="text-sm text-gray-600">{assignment.course?.courseName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{formatDateShort(assignment.dueDate)}</p>
                                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor('pending')}`}>
                                                Pending
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {dashboardData?.student?.enrolledCourses?.map((course) => (
                                <div key={course._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                                    <h3 className="text-xl font-bold">{course.courseName}</h3>
                                    <p className="text-gray-600">{course.courseCode}</p>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600">Credits: {course.credits}</p>
                                        <p className="text-sm text-gray-600">Department: {course.department}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-4">All Assignments</h3>
                            {dashboardData?.assignments?.map((assignment) => (
                                <div key={assignment._id} className="border-b last:border-b-0 py-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg">{assignment.title}</h4>
                                            <p className="text-gray-600">{assignment.course?.courseName}</p>
                                            <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">Due: {formatDateShort(assignment.dueDate)}</p>
                                            <span className={`inline-block mt-2 text-xs px-3 py-1 rounded ${getStatusColor('pending')}`}>
                                                Pending
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'grades' && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-4">My Grades</h3>
                            <table className="w-full">
                                <thead className="border-b-2">
                                    <tr>
                                        <th className="text-left py-3">Course Code</th>
                                        <th className="text-left py-3">Course Name</th>
                                        <th className="text-left py-3">Credits</th>
                                        <th className="text-left py-3">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData?.grades?.map((grade) => (
                                        <tr key={grade._id} className="border-b">
                                            <td className="py-3">{grade.course?.courseCode}</td>
                                            <td className="py-3">{grade.course?.courseName}</td>
                                            <td className="py-3">{grade.course?.credits}</td>
                                            <td className="py-3">
                                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded font-semibold">
                                                    {grade.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;