const Message = require('./message.model');

// @desc    Get all messages for a user (sent or received)
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({
            $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
        })
            .populate('senderId', 'firstName lastName role')
            .populate('receiverId', 'firstName lastName role')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single message
// @route   GET /api/messages/:id
// @access  Private
exports.getMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate('senderId', 'firstName lastName role')
            .populate('receiverId', 'firstName lastName role');

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Ensure the user is part of the conversation
        if (message.senderId._id.toString() !== req.user.id && message.receiverId._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this message' });
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        req.body.senderId = req.user.id;
        const message = await Message.create(req.body);

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        let message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Ensure only the receiver can mark it as read
        if (message.receiverId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this message' });
        }

        message.isRead = true;
        await message.save();

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};
