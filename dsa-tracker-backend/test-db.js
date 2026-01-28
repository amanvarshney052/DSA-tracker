require('dotenv').config();
const mongoose = require('mongoose');

const testDB = async () => {
    console.log('Testing MongoDB Connection...');
    console.log('URI Length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 'MISSING');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('SUCCESS: MongoDB Connected!');
        process.exit(0);
    } catch (error) {
        console.error('FAILED: MongoDB Connection Error');
        console.error(error);
        process.exit(1);
    }
};

testDB();
