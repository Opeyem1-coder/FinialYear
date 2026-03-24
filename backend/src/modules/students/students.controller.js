const Student = require('./student.model');

// @desc    Get all students (filtered by safe known query params)
// @route   GET /api/students
// @access  Private/Admin|Teacher|Registry|Parent
exports.getStudents = async (req, res, next) => {
    try {
        const filter = {};

        // Allow safe known filters only — never pass raw req.query to prevent NoSQL injection
        if (req.query.parentIds) filter.parentIds = req.query.parentIds;
        if (req.query.courseIds) filter.courseIds = req.query.courseIds;
        if (req.query.studentId) filter.studentId = req.query.studentId;

        // If the logged-in user is a parent, force-filter to only their linked students
        // This prevents a parent from seeing all students by omitting the parentIds param
        if (req.user.role === 'parent') {
            filter.parentIds = req.user._id;
        }

        const students = await Student.find(filter)
            .populate('parentIds', 'firstName lastName email')
            .populate('courseIds', 'courseName');

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/Admin|Teacher|Registry|Parent
exports.getStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('parentIds', 'firstName lastName email')
            .populate('courseIds', 'courseName');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Parents can only view students linked to them
        if (req.user.role === 'parent') {
            const isLinked = student.parentIds.some(p => p._id.toString() === req.user._id.toString());
            if (!isLinked) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this student' });
            }
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        next(error);
    }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private/Admin|Registry
exports.createStudent = async (req, res, next) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json({ success: true, data: student });
    } catch (error) {
        next(error);
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin|Registry
exports.updateStudent = async (req, res, next) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin|Registry
exports.deleteStudent = async (req, res, next) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
