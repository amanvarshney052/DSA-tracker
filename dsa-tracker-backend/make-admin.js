require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const email = process.argv[2];

if (!email) {
    console.log('Usage: node make-admin.js <email>');
    process.exit(1);
}

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // clean input
        const cleanEmail = email.trim();
        console.log(`Searching for: '${cleanEmail}'`);

        // Try exact match first, then case-insensitive
        let user = await User.findOne({ email: cleanEmail });

        if (!user) {
            // Try case-insensitive
            user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
        }

        if (!user) {
            console.log(`❌ User with email '${cleanEmail}' not found.`);
            console.log('\nAvailable users in database:');
            const allUsers = await User.find({}, 'email name');
            allUsers.forEach(u => console.log(`- '${u.email}' (${u.name})`));
            process.exit(1);
        }

        // Update directly to bypass hooks
        const result = await User.updateOne(
            { email: user.email },
            { $set: { role: 'admin' } }
        );

        if (result.modifiedCount > 0) {
            console.log(`✅ SUCCESS: User ${user.name} (${user.email}) is now an ADMIN.`);
            process.exit(0);
        } else {
            console.log('⚠️  User found matches but no changes were made (already admin?).');
            process.exit(0);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

promoteUser();
