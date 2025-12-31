const axios = require('axios');
const cookie = require('cookie'); // You might need to install cookie package or parse manually.
// simplified cookie parsing if package not available

async function test() {
    const api = axios.create({ 
        baseURL: 'http://localhost:5001/api',
        validateStatus: () => true // Don't throw
    });

    console.log('1. Logging in...');
    const loginRes = await api.post('/auth/login', {
        email: 'checker@test.com',
        password: 'password123'
    });

    console.log('Login Status:', loginRes.status);
    if (loginRes.status !== 200) {
        console.log('Login Failed:', loginRes.data);
        return;
    }

    // Extract Token from Cookie
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) {
        console.log('No cookies received!');
        return;
    }
    console.log('Cookies received.');

    // Prepare headers for next request
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    
    console.log('2. Triggering Bulk Upsolve...');
    const upsolveRes = await api.post('/student/bulk-upsolve', {}, {
        headers: { Cookie: cookieHeader }
    });

    console.log('Upsolve Status:', upsolveRes.status);
    console.log('Upsolve Data:', JSON.stringify(upsolveRes.data, null, 2));
}

test();
