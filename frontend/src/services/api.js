// src/services/api.js
import axios from 'axios';

// Normalize API base URL so callers don't accidentally end up with
// missing or duplicated "/api" segments depending on env values.
const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const trimmedApiUrl = rawApiUrl.replace(/\/+$/, '');
const API_URL = trimmedApiUrl.endsWith('/api') ? trimmedApiUrl : `${trimmedApiUrl}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION API
// ============================================
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/update-profile', profileData);
    return response.data;
  }
};

// ============================================
// STUDENT API
// ============================================
export const studentAPI = {
  getDashboard: async () => {
    const response = await api.get('/students/dashboard');
    return response.data;
  },

  getAllStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getStudent: async (studentId) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  addStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  updateStudent: async (studentId, studentData) => {
    const response = await api.put(`/students/${studentId}`, studentData);
    return response.data;
  },

  deleteStudent: async (studentId) => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  },

  getStudentResults: async (studentId) => {
    const response = await api.get(`/students/${studentId}/results`);
    return response.data;
  },

  calculateGPA: async (studentId) => {
    const response = await api.get(`/students/${studentId}/gpa`);
    return response.data;
  },

  getStudentsByProgram: async (program) => {
    const response = await api.get(`/students/program/${program}`);
    return response.data;
  },

  updateEnrollmentStatus: async (studentId, status) => {
    const response = await api.put(`/students/${studentId}/enrollment-status`, { status });
    return response.data;
  }
};

export const studentService = studentAPI;

// ============================================
// ADMIN API
// ============================================
export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard-stats');
    return response.data;
  },
  getAdminSummary: async () => {
    const response = await api.get('/admin/summary');
    return response.data;
  },
  getSystemStatus: async () => {
    const response = await api.get('/admin/system-status');
    return response.data;
  },
  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },
  bulkActivateUsers: async (userIds) => {
    const response = await api.post('/admin/users/bulk-activate', { userIds });
    return response.data;
  },
  bulkDeleteUsers: async (userIds) => {
    const response = await api.delete('/admin/users/bulk-delete', { data: { userIds } });
    return response.data;
  }
};

export const courseService = courseAPI;

// ============================================
// STAFF API
// ============================================
export const staffAPI = {
  getAllStaff: async (params = {}) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },

  getStaff: async (staffId) => {
    const response = await api.get(`/staff/${staffId}`);
    return response.data;
  },

  addStaff: async (staffData) => {
    const response = await api.post('/staff', staffData);
    return response.data;
  },

  updateStaff: async (staffId, staffData) => {
    const response = await api.put(`/staff/${staffId}`, staffData);
    return response.data;
  },

  deleteStaff: async (staffId) => {
    const response = await api.delete(`/staff/${staffId}`);
    return response.data;
  },

  getAssignedCourses: async (staffId) => {
    const response = await api.get(`/staff/${staffId}/courses`);
    return response.data;
  },

  assignCourse: async (staffId, courseId) => {
    const response = await api.post(`/staff/${staffId}/courses/${courseId}`);
    return response.data;
  },

  removeCourse: async (staffId, courseId) => {
    const response = await api.delete(`/staff/${staffId}/courses/${courseId}`);
    return response.data;
  },

  getAdvisingStudents: async (staffId) => {
    const response = await api.get(`/staff/${staffId}/students`);
    return response.data;
  },

  getDashboard: async (staffId) => {
    const response = await api.get(`/staff/${staffId}/dashboard`);
    return response.data;
  }
};

// ============================================
// COURSE API
// ============================================
export const courseAPI = {
  getAllCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  getCourseByCode: async (code) => {
    const response = await api.get(`/courses/code/${code}`);
    return response.data;
  },

  addCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  getCoursesByDepartment: async (department) => {
    const response = await api.get(`/courses/department/${department}`);
    return response.data;
  },

  getCoursesBySemester: async (semester) => {
    const response = await api.get(`/courses/semester/${semester}`);
    return response.data;
  }
};

// ============================================
// RESULT API
// ============================================
export const resultAPI = {
  getAllResults: async (params = {}) => {
    const response = await api.get('/results', { params });
    return response.data;
  },

  getStudentResults: async (studentId) => {
    const response = await api.get(`/results/student/${studentId}`);
    return response.data;
  },

  getResult: async (resultId) => {
    const response = await api.get(`/results/${resultId}`);
    return response.data;
  },

  addResult: async (resultData) => {
    const response = await api.post('/results', resultData);
    return response.data;
  },

  bulkUploadResults: async (resultsArray) => {
    const response = await api.post('/results/bulk', { results: resultsArray });
    return response.data;
  },

  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Let the browser/axios set the Content-Type (with boundary) for FormData
    const response = await api.post('/results/upload-csv', formData);
    return response.data;
  },

  updateResult: async (resultId, resultData) => {
    const response = await api.put(`/results/${resultId}`, resultData);
    return response.data;
  },

  submitForApproval: async (resultId) => {
    const response = await api.patch(`/results/${resultId}/submit-for-approval`);
    return response.data;
  },

  publishResult: async (resultId) => {
    const response = await api.patch(`/results/${resultId}/publish`);
    return response.data;
  },

  bulkPublishResults: async (resultIds) => {
    const response = await api.post('/results/bulk-publish', { resultIds });
    return response.data;
  },

  deleteResult: async (resultId) => {
    const response = await api.delete(`/results/${resultId}`);
    return response.data;
  },

  getPendingResults: async () => {
    const response = await api.get('/results/status/pending');
    return response.data;
  },

  getResultsByCourse: async (courseId, params = {}) => {
    const response = await api.get(`/results/course/${courseId}`, { params });
    return response.data;
  }
};

// ============================================
// NOTIFICATION API
// ============================================
export const notificationAPI = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  sendAnnouncement: async (announcementData) => {
    const response = await api.post('/notifications/announcement', announcementData);
    return response.data;
  }
};

// ============================================
// ANALYTICS API
// ============================================
export const analyticsAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard-stats');
    return response.data;
  },

  getGradeDistribution: async (params = {}) => {
    const response = await api.get('/analytics/grade-distribution', { params });
    return response.data;
  },

  getPassRate: async (params = {}) => {
    const response = await api.get('/analytics/pass-rate', { params });
    return response.data;
  },

  getStudentPerformance: async (studentId) => {
    const response = await api.get(`/analytics/student-performance/${studentId}`);
    return response.data;
  },

  getCourseAnalytics: async (courseId) => {
    const response = await api.get(`/analytics/course-analytics/${courseId}`);
    return response.data;
  },

  getTopPerformers: async (params = {}) => {
    const response = await api.get('/analytics/top-performers', { params });
    return response.data;
  },

  getDepartmentStats: async () => {
    const response = await api.get('/analytics/department-stats');
    return response.data;
  },

  getSemesterStats: async (params = {}) => {
    const response = await api.get('/analytics/semester-stats', { params });
    return response.data;
  },

  getRecentActivities: async (params = {}) => {
    const response = await api.get('/analytics/recent-activities', { params });
    return response.data;
  },

  exportData: async (type, format = 'json') => {
    const response = await api.get('/analytics/export', {
      params: { type, format }
    });
    return response.data;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export const calculateGrade = (marks) => {
  if (marks >= 90) return { grade: 'A+', points: 4.0 };
  if (marks >= 85) return { grade: 'A', points: 4.0 };
  if (marks >= 80) return { grade: 'A-', points: 3.7 };
  if (marks >= 75) return { grade: 'B+', points: 3.3 };
  if (marks >= 70) return { grade: 'B', points: 3.0 };
  if (marks >= 65) return { grade: 'B-', points: 2.7 };
  if (marks >= 60) return { grade: 'C+', points: 2.3 };
  if (marks >= 55) return { grade: 'C', points: 2.0 };
  if (marks >= 50) return { grade: 'C-', points: 1.7 };
  if (marks >= 40) return { grade: 'D', points: 1.0 };
  return { grade: 'F', points: 0.0 };
};

export const calculateGPA = (results) => {
  if (!results || results.length === 0) return '0.00';

  let totalPoints = 0;
  let totalCredits = 0;

  results.forEach(result => {
    if (result.courseId) {
      totalPoints += result.gradePoints * result.courseId.credits;
      totalCredits += result.courseId.credits;
    }
  });

  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
};

export const handleAPIError = (error) => {
  if (error.response) {
    return error.response.data.error || error.response.data.message || 'An error occurred';
  } else if (error.request) {
    return 'No response from server. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

export default api;