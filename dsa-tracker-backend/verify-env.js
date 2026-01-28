require('dotenv').config();

const fs = require('fs');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('env_check.log', msg + '\n');
};

const checkEnv = () => {
    fs.writeFileSync('env_check.log', ''); // Clear file
    log('--- Checking .env Configuration ---');

    // Check Email
    if (process.env.SMTP_PASSWORD && process.env.SMTP_PASSWORD.trim().length === 16) {
        log('✅ SMTP_PASSWORD looks correct (16 chars).');
    } else {
        log('❌ SMTP_PASSWORD issue. It should be exactly 16 characters.');
    }

    // Check MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        log('❌ MONGODB_URI is missing!');
        return;
    }

    if (uri.includes('<') || uri.includes('>')) {
        log('❌ MONGODB_URI contains "<" or ">". Did you forget to remove the placeholders around the password?');
        log('   Correct format: mongodb+srv://user:password@cluster...');
        log('   Wrong format:   mongodb+srv://user:<password>@cluster...');
    } else {
        log('✅ MONGODB_URI does not contain placeholders ("<" or ">").');
    }

    if (uri.includes(' ')) {
        log('❌ MONGODB_URI contains spaces. It should not have any spaces.');
    } else {
        log('✅ MONGODB_URI does not contain spaces.');
    }

    log('--- End Check ---');
};

checkEnv();
