// Removed fetch import
// If node < 18, request/http. Let's use http to be safe
const http = require('http');

const data = JSON.stringify({
    email: 'av616072@gmail.com'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/forgotpassword',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
