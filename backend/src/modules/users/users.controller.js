const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user.model');

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) { next(error); }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error) { next(error); }
};

// @desc    Create user
// @route   POST /api/users
exports.createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) { next(error); }
};

// @desc    Update user (name, email — NOT password)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
    try {
        const { password, ...safeFields } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, safeFields, {
            new: true, runValidators: true
        });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error) { next(error); }
};

// @desc    Set a user's password directly (used by registry after linking parent to student)
//          Uses direct MongoDB update to bypass Mongoose pre-save hooks entirely,
//          avoiding the double-hashing issue seen with user.save()
// @route   PUT /api/users/:id/set-password
exports.setPassword = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 4) {
            return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
        }

        // Validate the user exists first
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Hash the password here (not via Mongoose hook)
        const hash = await bcrypt.hash(password, 10);

        // Verify hash is correct before saving
        const verify = await bcrypt.compare(password, hash);
        if (!verify) {
            return res.status(500).json({ success: false, message: 'Password hashing failed — please retry' });
        }

        // Write directly to MongoDB bypassing all Mongoose middleware
        await mongoose.connection.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: hash, mustChangePassword: true } }
        );

        res.status(200).json({ success: true, message: 'Password updated. User will be prompted to change it on next login.' });
    } catch (error) { next(error); }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) { next(error); }
};
