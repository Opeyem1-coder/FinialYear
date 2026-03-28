const jwt = require('jsonwebtoken');
const User = require('../users/user.model');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Please provide a username and password' });
        }

        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Change own password (used after first login forced change)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        user.mustChangePassword = false;
        await user.save(); // triggers pre-save bcrypt hash

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

// Helper — build login response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    res.status(statusCode).json({
        success: true,
        token,
        mustChangePassword: user.mustChangePassword || false,
        user: {
            id: user._id,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            mustChangePassword: user.mustChangePassword || false,
        }
    });
};
