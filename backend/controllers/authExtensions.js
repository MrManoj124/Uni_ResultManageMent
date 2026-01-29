// backend/controllers/authExtensions.js
// Additional authentication functions for password management

const User = require('../models/User');

// Set default password (Admin only)
exports.setDefaultPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { defaultPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.password = defaultPassword || 'uov2026user';
        user.defaultPassword = defaultPassword || 'uov2026user';
        user.isFirstLogin = true;
        user.mustChangePassword = true;
        await user.save();

        res.json({
            success: true,
            message: 'Default password set successfully',
            data: {
                defaultPassword: defaultPassword || 'uov2026user'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Check if password change is required
exports.checkPasswordChangeRequired = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                mustChangePassword: user.mustChangePassword,
                isFirstLogin: user.isFirstLogin
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update change password to track first login
exports.changePasswordWithTracking = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        user.isFirstLogin = false;
        user.mustChangePassword = false;
        user.passwordChangedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
