require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
// Mask credentials in output if present
const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

console.log('Testing connection to:', maskedUri);

mongoose.connect(uri)
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB successfully!');
        console.log('State:', mongoose.connection.readyState); // 1 = connected
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ ERROR: Failed to connect to MongoDB.');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        process.exit(1);
    });
