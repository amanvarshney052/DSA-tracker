const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');

console.log('--- CONNECTION DIAGNOSTIC ---');
console.log('Current Directory:', __dirname);
console.log('Target .env Path: ', path.join(__dirname, '.env'));

try {
    const stats = fs.statSync(path.join(__dirname, '.env'));
    console.log('Last Modified:    ', stats.mtime.toISOString());
} catch (e) {
    console.log('ERROR: .env file not found!');
}

const uri = process.env.MONGODB_URI || '';
console.log('URI Loaded:       ', uri ? 'YES' : 'NO');
console.log('URI Starts With:  ', uri.substring(0, 15));

// Extract user
const userMatch = uri.match(/\/\/([^:]+):/);
if (userMatch) {
    console.log('Detected User:    ', userMatch[1]);
} else {
    console.log('Detected User:    [Could not parse]');
}

// Extract cluster
const clusterMatch = uri.match(/@([^/]+)/);
if (clusterMatch) {
    console.log('Detected Cluster: ', clusterMatch[1]);
}

console.log('-----------------------------');
