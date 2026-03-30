/**
 * fix_parent_password.js
 * 
 * Run this from inside your backend/ folder:
 *   node fix_parent_password.js
 * 
 * This script finds every parent that is linked to a student
 * and sets their password directly to the student ID (bypassing
 * Mongoose hooks to avoid any double-hashing issues), then flags
 * them for a forced password change on next login.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_portal';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('MongoDB connected\n');

    const usersCol    = mongoose.connection.collection('users');
    const studentsCol = mongoose.connection.collection('students');

    // Find all students that have at least one parent linked
    const students = await studentsCol.find({
        parentIds: { $exists: true, $not: { $size: 0 } }
    }).toArray();

    if (students.length === 0) {
        console.log('No students with linked parents found.');
        console.log('Link a parent to a student first from the Registry → Link Accounts page.');
        process.exit(0);
    }

    let fixed = 0;

    for (const student of students) {
        console.log(`Student: ${student.firstName} ${student.lastName} (${student.studentId})`);

        for (const parentId of student.parentIds) {
            const parent = await usersCol.findOne({ _id: parentId });
            if (!parent) {
                console.log(`  ⚠️  Parent ID ${parentId} not found in users collection`);
                continue;
            }

            // Hash the student ID directly (no Mongoose hook involved)
            const hash = await bcrypt.hash(student.studentId, 10);

            // Verify the hash works before saving
            const verify = await bcrypt.compare(student.studentId, hash);
            if (!verify) {
                console.log(`  ❌ Hash verification failed for ${parent.firstName} ${parent.lastName} — skipping`);
                continue;
            }

            // Write directly to MongoDB collection bypassing Mongoose hooks
            await usersCol.updateOne(
                { _id: parentId },
                { $set: { password: hash, mustChangePassword: true } }
            );

            console.log(`  ✅ ${parent.firstName} ${parent.lastName} (${parent.email || parent.username})`);
            console.log(`     Password set to: ${student.studentId}`);
            console.log(`     mustChangePassword: true`);
            fixed++;
        }
        console.log('');
    }

    console.log(`\n✅ Done. Fixed ${fixed} parent account(s).`);
    console.log('\nParents can now log in with:');
    console.log('  Email:    their registered email address');
    console.log('  Password: their child\'s Student ID (e.g. STU20241234)');
    console.log('\nThey will be forced to change their password on first login.');

    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
