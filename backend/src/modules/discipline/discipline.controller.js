const Discipline = require('./discipline.model');

// @desc    Get all discipline records (can filter by studentId)
// @route   GET /api/discipline
// @access  Private/Admin|Teacher|Parent
exports.getDisciplineRecords = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.studentId) filter.studentId = req.query.studentId;

        const records = await Discipline.find(filter)
            .populate('studentId', 'firstName lastName')
            .populate('teacherId', 'firstName lastName');

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single discipline record
// @route   GET /api/discipline/:id
// @access  Private/Admin|Teacher|Parent
exports.getDisciplineRecord = async (req, res, next) => {
    try {
        const record = await Discipline.findById(req.params.id)
            .populate('studentId', 'firstName lastName')
            .populate('teacherId', 'firstName lastName');

        if (!record) {
            return res.status(404).json({ success: false, message: 'Discipline record not found' });
        }

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create discipline record
// @route   POST /api/discipline
// @access  Private/Admin|Teacher
exports.createDisciplineRecord = async (req, res, next) => {
    try {
        // Add the teacher making the request to the body
        req.body.teacherId = req.user.id;
        const record = await Discipline.create(req.body);

        res.status(201).json({
            success: true,
            data: record
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update discipline record
// @route   PUT /api/discipline/:id
// @access  Private/Admin|Teacher
exports.updateDisciplineRecord = async (req, res, next) => {
    try {
        const record = await Discipline.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!record) {
            return res.status(404).json({ success: false, message: 'Discipline record not found' });
        }

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete discipline record
// @route   DELETE /api/discipline/:id
// @access  Private/Admin|Teacher
exports.deleteDisciplineRecord = async (req, res, next) => {
    try {
        await Discipline.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
