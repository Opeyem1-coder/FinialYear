const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_portal';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('MongoDB connected');

    // Hash the password here directly
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);

    // Verify the hash works before saving
    const verify = await bcrypt.compare('admin123', hash);
    console.log('Hash verification:', verify); // must be true

    // Use updateOne with $set to bypass the pre-save hook entirely
    const result = await mongoose.connection.collection('users').updateOne(
        { email: 'admin@pts.com' },
        { $set: { password: hash } }
    );

    if (result.matchedCount === 0) {
        console.log('Admin user not found — creating fresh...');

        // Insert directly into collection, bypassing mongoose model hooks
        await mongoose.connection.collection('users').insertOne({
            username: 'admin@pts.com',
            email: 'admin@pts.com',
            password: hash,
            role: 'admin',
            firstName: 'System',
            lastName: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('Admin created fresh.');
    } else {
        console.log('Admin password updated directly in database.');
    }

    console.log('');
    console.log('Login credentials:');
    console.log('  Email:    admin@pts.com');
    console.log('  Password: admin123');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
