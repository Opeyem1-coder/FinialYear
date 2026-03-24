const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        assignmentName: {
            type: String,
            required: true,
            trim: true,
        },
        score: {
            type: Number,
            required: true,
        },
        totalPoints: {
            type: Number,
            required: true,
        },
        dateAssigned: {
            type: Date,
            default: Date.now,
        },
        teacherComments: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Grade', gradeSchema);
