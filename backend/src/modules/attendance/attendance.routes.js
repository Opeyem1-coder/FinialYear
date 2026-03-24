const express = require('express');
const {
    getAttendanceRecords,
    getAttendanceRecord,
    createAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord
} = require('./attendance.controller');

const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance tracking operations
 */

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter attendance by student ID
 *     responses:
 *       200:
 *         description: List of attendance records
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Create an attendance record (Admin/Teacher only)
 *     tags: [Attendance]
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
 *               - status
 *             properties:
 *               studentId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [present, absent, late]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance record created
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router
    .route('/')
    .get(authorize('admin', 'teacher', 'parent', 'registry'), getAttendanceRecords)
    .post(authorize('admin', 'teacher'), createAttendanceRecord);

/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Get a single attendance record by ID
 *     tags: [Attendance]
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
 *         description: Attendance details
 *       404:
 *         description: Record not found
 *   put:
 *     summary: Update an attendance record (Admin/Teacher only)
 *     tags: [Attendance]
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
 *               status:
 *                 type: string
 *                 enum: [present, absent, late]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance updated
 *       404:
 *         description: Record not found
 *   delete:
 *     summary: Delete an attendance record (Admin/Teacher only)
 *     tags: [Attendance]
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
 *         description: Record deleted
 *       404:
 *         description: Record not found
 */
router
    .route('/:id')
    .get(authorize('admin', 'teacher', 'parent'), getAttendanceRecord)
    .put(authorize('admin', 'teacher'), updateAttendanceRecord)
    .delete(authorize('admin', 'teacher'), deleteAttendanceRecord);

module.exports = router;
