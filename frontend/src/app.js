// src/App.js
import React, { useState, useEffect } from 'react';
import { authAPI } from '../src/services/api';
import LoginPage from './components/loginpage';
import StudentDashboard from './components/studentdashboard';
import AdminDashboard from './components/admindashboard';
import StaffDashboard from './components/StaffDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = authAPI.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Route based on user role
  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
    case 'staff':
      return <StaffDashboard user={currentUser} onLogout={handleLogout} />;
    case 'student':
      return <StudentDashboard user={currentUser} onLogout={handleLogout} />;
    default:
      return <LoginPage onLogin={handleLogin} />;
  }
}

export default App;
