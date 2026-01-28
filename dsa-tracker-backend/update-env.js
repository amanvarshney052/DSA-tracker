const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const newUri = 'mongodb+srv://new-user12:Aman6229@cluster0.8cxmcju.mongodb.net/dsa-tracker?retryWrites=true&w=majority&appName=Cluster0';

try {
    let content = fs.readFileSync(envPath, 'utf8');

    // Replace the specific line starting with MONGODB_URI=
    const regex = /^MONGODB_URI=.*$/m;

    if (regex.test(content)) {
        content = content.replace(regex, `MONGODB_URI=${newUri}`);
        fs.writeFileSync(envPath, content);
        console.log('✅ Updated .env with new credentials for user: new-user12');
    } else {
        console.log('❌ Could not find MONGODB_URI line in .env');
        // If missing, append it? Better not to assume.
    }
} catch (error) {
    console.error('❌ Failed to update .env:', error);
}
