const express = require('express');
const {
    getMessages,
    getMessage,
    sendMessage,
    markAsRead
} = require('./messages.controller');

// ... existing imports ...
const { protect, authorize } = require('../../middleware/authMiddleware'); // Add authorize here

const router = express.Router();

router.use(protect);

// Only allow these roles to access the messaging system
router
    .route('/')
    .get(authorize('admin', 'teacher', 'parent', 'student'), getMessages)
    .post(authorize('teacher', 'parent', 'admin'), sendMessage); // Restrict who can 'start' a chat

router
    .route('/:id')
    .get(authorize('admin', 'teacher', 'parent', 'student'), getMessage);

router
    .route('/:id/read')
    .put(authorize('admin', 'teacher', 'parent', 'student'), markAsRead);
    module.exports = router;