const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_portal';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('MongoDB connected\n');

    const User = require('./src/modules/users/user.model');
    const Student = mongoose.connection.collection('students');

    // Find all parents
    const parents = await User.find({ role: 'parent' }).select('+password');
    console.log(`Found ${parents.length} parent(s):\n`);

    for (const parent of parents) {
        console.log(`── ${parent.firstName} ${parent.lastName}`);
        console.log(`   Email:              ${parent.email || parent.username}`);
        console.log(`   mustChangePassword: ${parent.mustChangePassword}`);
        console.log(`   Password hash:      ${parent.password ? parent.password.substring(0, 20) + '...' : 'MISSING'}`);

        // Find linked students
        const linkedStudents = await Student.find({
            parentIds: parent._id
        }).toArray();

        if (linkedStudents.length > 0) {
            for (const student of linkedStudents) {
                console.log(`   Linked student:     ${student.firstName} ${student.lastName} (${student.studentId})`);

                // Test if student ID matches the password
                if (parent.password) {
                    const matches = await bcrypt.compare(student.studentId, parent.password);
                    console.log(`   Password matches student ID? ${matches ? '✅ YES' : '❌ NO'}`);

                    // Also test TempPass123!
                    const matchesTemp = await bcrypt.compare('TempPass123!', parent.password);
                    console.log(`   Password matches TempPass123!? ${matchesTemp ? '⚠️  YES (not yet updated)' : '✅ No (good)'}`);
                }
            }
        } else {
            console.log(`   Linked student:     ❌ NONE — parent not linked to any student!`);
        }
        console.log('');
    }

    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
