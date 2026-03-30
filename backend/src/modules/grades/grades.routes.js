const express = require('express');
const {
    getGrades,
    getGrade,
    createGrade,
    updateGrade,
    deleteGrade
} = require('./grades.controller');

const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Grading management operations
 */

/**
 * @swagger
 * /api/grades:
 *   get:
 *     summary: Get all grades
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter grades by student ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter grades by course ID
 *     responses:
 *       200:
 *         description: List of grades
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Create a new grade (Admin/Teacher only)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - courseId
 *               - assignmentName
 *               - score
 *               - totalPoints
 *             properties:
 *               studentId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               assignmentName:
 *                 type: string
 *               score:
 *                 type: number
 *               totalPoints:
 *                 type: number
 *               teacherComments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Grade created
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
// Parents can view grades but teachers/admins manage them
router
    .route('/')
    .get(authorize('admin', 'teacher', 'parent', 'registry', 'student'), getGrades)
    .post(authorize('admin', 'teacher'), createGrade);

/**
 * @swagger
 * /api/grades/{id}:
 *   get:
 *     summary: Get a single grade by ID
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grade details
 *       404:
 *         description: Grade not found
 *   put:
 *     summary: Update a grade (Admin/Teacher only)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignmentName:
 *                 type: string
 *               score:
 *                 type: number
 *               totalPoints:
 *                 type: number
 *               teacherComments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Grade updated
 *       404:
 *         description: Grade not found
 *   delete:
 *     summary: Delete a grade (Admin/Teacher only)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grade deleted
 *       404:
 *         description: Grade not found
 */
router
    .route('/:id')
    .get(authorize('admin', 'teacher', 'parent', 'student'), getGrade)
    .put(authorize('admin', 'teacher'), updateGrade)
    .delete(authorize('admin', 'teacher'), deleteGrade);

module.exports = router;
