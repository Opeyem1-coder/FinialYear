const express = require('express');
const { getUsers, getUser, createUser, updateUser, setPassword, deleteUser } = require('./users.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'registry'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);
router.route('/:id/set-password').put(setPassword);

module.exports = router;
