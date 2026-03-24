const Attendance = require('./attendance.model');

// @desc    Get all attendance records (can filter by studentId)
// @route   GET /api/attendance
// @access  Private/Admin|Teacher|Parent
exports.getAttendanceRecords = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.studentId) filter.studentId = req.query.studentId;

        const attendance = await Attendance.find(filter).populate('studentId', 'firstName lastName');

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private/Admin|Teacher|Parent
exports.getAttendanceRecord = async (req, res, next) => {
    try {
        const attendance = await Attendance.findById(req.params.id).populate('studentId', 'firstName lastName');

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance record not found' });
        }

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private/Admin|Teacher
exports.createAttendanceRecord = async (req, res, next) => {
    try {
        const attendance = await Attendance.create(req.body);

        res.status(201).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin|Teacher
exports.updateAttendanceRecord = async (req, res, next) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance record not found' });
        }

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin|Teacher
exports.deleteAttendanceRecord = async (req, res, next) => {
    try {
        await Attendance.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
