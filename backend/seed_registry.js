const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_portal';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('MongoDB connected');

    const userSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ['admin', 'teacher', 'parent', 'student', 'registry'], default: 'student' },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    const existingRegistry = await User.findOne({ email: 'registry@pts.com' });
    if (existingRegistry) {
        console.log('Registry user already exists.');
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('registry', salt);

    const registryUser = await User.create({
        username: 'registry@pts.com',
        email: 'registry@pts.com',
        password: hashedPassword,
        role: 'registry',
        firstName: 'System',
        lastName: 'Registry',
    });

    console.log('Registry user created:', registryUser.username);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
