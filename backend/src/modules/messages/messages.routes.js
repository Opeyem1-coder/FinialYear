const express = require('express');
const {
    getMessages,
    getMessage,
    sendMessage,
    markAsRead
} = require('./messages.controller');

const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// All message routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Parent-Teacher messaging operations
 */

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get all messages (sent and received)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - subject
 *               - body
 *             properties:
 *               receiverId:
 *                 type: string
 *               subject:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       401:
 *         description: Not authorized
 */
router
    .route('/')
    .get(getMessages)
    .post(sendMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get a single message by ID
 *     tags: [Messages]
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
 *         description: Message details
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (Not part of conversation)
 *       404:
 *         description: Message not found
 */
router
    .route('/:id')
    .get(getMessage);

/**
 * @swagger
 * /api/messages/{id}/read:
 *   put:
 *     summary: Mark a message as read (Receiver only)
 *     tags: [Messages]
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
 *         description: Message marked as read
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (Not the receiver)
 *       404:
 *         description: Message not found
 */
router
    .route('/:id/read')
    .put(markAsRead);

module.exports = router;
