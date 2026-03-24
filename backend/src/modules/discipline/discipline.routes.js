const express = require('express');
const {
    getDisciplineRecords,
    getDisciplineRecord,
    createDisciplineRecord,
    updateDisciplineRecord,
    deleteDisciplineRecord
} = require('./discipline.controller');

const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Discipline
 *   description: Behavioral and discipline tracking operations
 */

/**
 * @swagger
 * /api/discipline:
 *   get:
 *     summary: Get all discipline records
 *     tags: [Discipline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter discipline records by student ID
 *     responses:
 *       200:
 *         description: List of discipline records
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Create a discipline record (Admin/Teacher only)
 *     tags: [Discipline]
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
 *               - incidentType
 *               - description
 *               - actionTaken
 *             properties:
 *               studentId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               incidentType:
 *                 type: string
 *               description:
 *                 type: string
 *               actionTaken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Discipline record created
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router
    .route('/')
    .get(authorize('admin', 'teacher', 'parent'), getDisciplineRecords)
    .post(authorize('admin', 'teacher'), createDisciplineRecord);

/**
 * @swagger
 * /api/discipline/{id}:
 *   get:
 *     summary: Get a single discipline record by ID
 *     tags: [Discipline]
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
 *         description: Discipline record details
 *       404:
 *         description: Record not found
 *   put:
 *     summary: Update a discipline record (Admin/Teacher only)
 *     tags: [Discipline]
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
 *               incidentType:
 *                 type: string
 *               description:
 *                 type: string
 *               actionTaken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Discipline record updated
 *       404:
 *         description: Record not found
 *   delete:
 *     summary: Delete a discipline record (Admin/Teacher only)
 *     tags: [Discipline]
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
    .get(authorize('admin', 'teacher', 'parent'), getDisciplineRecord)
    .put(authorize('admin', 'teacher'), updateDisciplineRecord)
    .delete(authorize('admin', 'teacher'), deleteDisciplineRecord);

module.exports = router;
