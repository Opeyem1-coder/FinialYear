const Grade = require('./grade.model');

// @desc    Get all grades (can be filtered by studentId or courseId via query params)
// @route   GET /api/grades
// @access  Private/Admin|Teacher|Parent
exports.getGrades = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.studentId) filter.studentId = req.query.studentId;
        if (req.query.courseId) filter.courseId = req.query.courseId;

        const grades = await Grade.find(filter)
            .populate('studentId', 'firstName lastName')
            .populate('courseId', 'courseName subject');

        res.status(200).json({
            success: true,
            count: grades.length,
            data: grades
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single grade
// @route   GET /api/grades/:id
// @access  Private/Admin|Teacher|Parent
exports.getGrade = async (req, res, next) => {
    try {
        const grade = await Grade.findById(req.params.id)
            .populate('studentId', 'firstName lastName')
            .populate('courseId', 'courseName');

        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        res.status(200).json({
            success: true,
            data: grade
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create grade
// @route   POST /api/grades
// @access  Private/Admin|Teacher
exports.createGrade = async (req, res, next) => {
    try {
        const grade = await Grade.create(req.body);

        res.status(201).json({
            success: true,
            data: grade
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private/Admin|Teacher
exports.updateGrade = async (req, res, next) => {
    try {
        const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        res.status(200).json({
            success: true,
            data: grade
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private/Admin|Teacher
exports.deleteGrade = async (req, res, next) => {
    try {
        await Grade.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
