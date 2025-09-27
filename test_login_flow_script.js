// Test Login Flow - Run this in browser console
// Clear any existing auth data first
localStorage.clear();

// Test function to simulate login
async function testLoginFlow() {
    console.log('=== TESTING LOGIN FLOW ===');

    // 1. Check initial state
    console.log('1. Initial localStorage state:');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));

    // 2. Test API login
    try {
        console.log('2. Testing API login...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'demo@example.com',
                password: 'demo123'
            })
        });

        const data = await response.json();
        console.log('3. API Response:', {
            success: data.success,
            hasToken: !!data.data?.token,
            hasUser: !!data.data?.user,
            userEmail: data.data?.user?.email
        });

        if (data.success) {
            // 3. Manually store to test localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            console.log('4. Stored in localStorage:');
            console.log('Token exists:', !!localStorage.getItem('token'));
            console.log('User exists:', !!localStorage.getItem('user'));
            console.log('User email:', JSON.parse(localStorage.getItem('user')).email);

            console.log('✅ LOGIN FLOW TEST PASSED');
            return true;
        } else {
            console.log('❌ LOGIN FAILED:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ LOGIN ERROR:', error);
        return false;
    }
}

// Auto-run the test
testLoginFlow();

console.log('=== AVAILABLE TEST FUNCTIONS ===');
console.log('testLoginFlow() - Test the complete login flow');
console.log('localStorage.clear() - Clear all auth data');