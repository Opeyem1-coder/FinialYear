const express = require('express');
const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
} = require('./students.controller');

const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// GET — admin, teacher, registry, parent, AND student can read students
// POST — only admin and registry can create students
router
    .route('/')
    .get(authorize('admin', 'teacher', 'registry', 'parent', 'student'), getStudents)
    .post(authorize('admin', 'registry'), createStudent);

// GET single — admin, teacher, registry, parent, AND student 
// PUT / DELETE — only admin and registry
router
    .route('/:id')
    .get(authorize('admin', 'teacher', 'registry', 'parent', 'student'), getStudent)
    .put(authorize('admin', 'registry'), updateStudent)
    .delete(authorize('admin', 'registry'), deleteStudent);

module.exports = router;