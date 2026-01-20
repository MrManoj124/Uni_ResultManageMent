const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Course = require('../models/Course');
const Result = require('../models/Result');
const mongoose = require('mongoose');

// Get Admin Summary
exports.getAdminSummary = async (req, res) => {
    try {
        const [
            totalUsers,
            totalStudents,
            totalStaff,
            totalCourses,
            pendingResults,
            publishedResults
        ] = await Promise.all([
            User.countDocuments(),
            Student.countDocuments(),
            Staff.countDocuments(),
            Course.countDocuments(),
            Result.countDocuments({ status: 'pending' }),
            Result.countDocuments({ status: 'published' })
        ]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalStudents,
                    totalStaff,
                    totalCourses,
                },
                results: {
                    pending: pendingResults,
                    published: publishedResults
                },
                systemStatus: 'Healthy',
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get System Status
exports.getSystemStatus = async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

        res.json({
            success: true,
            data: {
                database: dbStatus,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Placeholder for Maintenance Mode
exports.toggleMaintenanceMode = async (req, res) => {
    res.json({
        success: true,
        message: 'Maintenance mode toggled (Feature pending implementation)'
    });
};

// Bulk Activate Users
exports.bulkActivateUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        await User.updateMany({ _id: { $in: userIds } }, { isActive: true });

        res.json({
            success: true,
            message: `${userIds.length} users activated successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Bulk Delete Users
exports.bulkDeleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        // Note: In a real system, you'd want to handle cascade deletions for Students/Staff
        await User.deleteMany({ _id: { $in: userIds } });

        res.json({
            success: true,
            message: `${userIds.length} users deleted successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get System Logs
exports.getSystemLogs = async (req, res) => {
    res.json({
        success: true,
        data: {
            logs: [],
            message: 'Logging system integration pending'
        }
    });
};
