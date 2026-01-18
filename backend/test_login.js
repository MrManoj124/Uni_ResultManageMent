// backend/test_login.js

const API_URL = 'http://localhost:5000/api';

const testUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'staff01', password: 'staff123' },
    { username: '2021/ICT/41', password: 'student123' }
];

async function runTests() {
    console.log('🧪 Testing Authentication API...');

    for (const user of testUsers) {
        try {
            console.log(`\n🔑 Testing login for: ${user.username}`);
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log(`✅ Login Successful for ${user.username}!`);
                console.log(`   Role: ${data.data.user.role}`);
                console.log(`   Token: ${data.data.token.substring(0, 20)}...`);
            } else {
                console.log(`❌ Login Failed for ${user.username}:`, data.error || 'Unknown error');
            }
        } catch (error) {
            console.log(`❌ Error for ${user.username}:`, error.message);
        }
    }
}

runTests();
