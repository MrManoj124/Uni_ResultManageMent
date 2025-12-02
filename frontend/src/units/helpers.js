// src/utils/helpers.js

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
    if (result.courseId && result.gradePoints !== undefined) {
      totalPoints += result.gradePoints * result.courseId.credits;
      totalCredits += result.courseId.credits;
    }
  });
  
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
};

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format date and time
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate student ID format (e.g., 2021/ICT/41)
export const isValidStudentId = (studentId) => {
  const idRegex = /^\d{4}\/[A-Z]+\/\d+$/;
  return idRegex.test(studentId);
};

// Get grade color class for Tailwind
export const getGradeColorClass = (grade) => {
  if (grade.startsWith('A')) return 'bg-green-100 text-green-700';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700';
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

// Get status color class
export const getStatusColorClass = (status) => {
  return status === 'published' 
    ? 'bg-green-100 text-green-700'
    : 'bg-yellow-100 text-yellow-700';
};

// Handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.error || error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Other errors
    return error.message || 'An unexpected error occurred';
  }
};

// Download data as CSV
export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to download');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Parse CSV file
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file is empty or invalid'));
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return obj;
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Debounce function for search/filter inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate random password
export const generatePassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Sort array of objects by key
export const sortByKey = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Calculate pass percentage
export const calculatePassPercentage = (results) => {
  if (!results || results.length === 0) return 0;
  
  const passedCount = results.filter(r => r.grade !== 'F').length;
  return ((passedCount / results.length) * 100).toFixed(1);
};

// Get semester name
export const getSemesterName = (semesterNumber) => {
  const semesters = {
    '1': 'First Semester',
    '2': 'Second Semester',
    '3': 'Third Semester',
    '4': 'Fourth Semester',
    '5': 'Fifth Semester',
    '6': 'Sixth Semester',
    '7': 'Seventh Semester',
    '8': 'Eighth Semester'
  };
  return semesters[semesterNumber] || `Semester ${semesterNumber}`;
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};