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

// GET — admin, teacher, registry, AND parent can read students
// POST — only admin and registry can create students
router
    .route('/')
    .get(authorize('admin', 'teacher', 'registry', 'parent'), getStudents)
    .post(authorize('admin', 'registry'), createStudent);

// GET single — admin, teacher, registry, AND parent (controller enforces parent can only see their own child)
// PUT / DELETE — only admin and registry
router
    .route('/:id')
    .get(authorize('admin', 'teacher', 'registry', 'parent'), getStudent)
    .put(authorize('admin', 'registry'), updateStudent)
    .delete(authorize('admin', 'registry'), deleteStudent);

module.exports = router;
