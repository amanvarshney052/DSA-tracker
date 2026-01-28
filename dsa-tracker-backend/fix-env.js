const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Fix MongoDB URI: Remove < and > if present
    if (envContent.includes('MONGODB_URI=')) {
        const oldLine = envContent.match(/MONGODB_URI=.*/)[0];
        let newLine = oldLine.replace('<', '').replace('>', '');

        if (oldLine !== newLine) {
            envContent = envContent.replace(oldLine, newLine);
            fs.writeFileSync(envPath, envContent);
            console.log('FIXED: Removed < and > from MONGODB_URI.');
            console.log('Old:', oldLine);
            console.log('New:', newLine);
        } else {
            console.log('OK: MONGODB_URI looks fine (no < or > found).');
        }
    } else {
        console.log('ERROR: MONGODB_URI not found in .env');
    }

} catch (error) {
    console.error('FAILED to fix .env:', error);
}
