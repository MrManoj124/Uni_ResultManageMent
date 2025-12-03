// ============================================
// FRONTEND: src/services/api.js
// API Service for Frontend to Backend Communication
// ============================================

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      // Token expired or invalid
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
  // Login
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Register (Admin only)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

// ============================================
// STUDENT API
// ============================================

export const studentAPI = {
  // Get all students
  getAllStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  // Get single student
  getStudent: async (studentId) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  // Add student
  addStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  // Update student
  updateStudent: async (studentId, studentData) => {
    const response = await api.put(`/students/${studentId}`, studentData);
    return response.data;
  },

  // Delete student
  deleteStudent: async (studentId) => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  }
};

// ============================================
// COURSE API
// ============================================

export const courseAPI = {
  // Get all courses
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  // Get single course
  getCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  // Add course
  addCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  }
};

// ============================================
// RESULT API
// ============================================

export const resultAPI = {
  // Get all results (role-based)
  getAllResults: async (studentId = null) => {
    const params = studentId ? { studentId } : {};
    const response = await api.get('/results', { params });
    return response.data;
  },

  // Get student results with GPA
  getStudentResults: async (studentId) => {
    const response = await api.get(`/results/student/${studentId}`);
    return response.data;
  },

  // Add single result
  addResult: async (resultData) => {
    const response = await api.post('/results', resultData);
    return response.data;
  },

  // Bulk upload results
  bulkUploadResults: async (resultsArray) => {
    const response = await api.post('/results/bulk', { results: resultsArray });
    return response.data;
  },

  // Update result
  updateResult: async (resultId, resultData) => {
    const response = await api.put(`/results/${resultId}`, resultData);
    return response.data;
  },

  // Publish result
  publishResult: async (resultId) => {
    const response = await api.patch(`/results/${resultId}/publish`);
    return response.data;
  },

  // Delete result
  deleteResult: async (resultId) => {
    const response = await api.delete(`/results/${resultId}`);
    return response.data;
  }
};

// ============================================
// ANALYTICS & REPORTS API
// ============================================

export const analyticsAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },

  // Get grade distribution
  getGradeDistribution: async () => {
    const response = await api.get('/reports/grade-distribution');
    return response.data;
  },

  // Get pass rate
  getPassRate: async () => {
    const response = await api.get('/reports/pass-rate');
    return response.data;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate grade from marks
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
  return { grade: 'F', points: 0.0 };
};

// Calculate GPA from results
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

// Format date
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.error || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Other errors
    return error.message || 'An unexpected error occurred';
  }
};

export default api;