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
