// Test script to run in browser console
// Go to http://localhost:3000 and open browser developer tools console, then paste this script

console.log('=== LOGIN FLOW TEST ===');

// Test login function
async function testLogin() {
    console.log('1. Testing login API call...');

    try {
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
        console.log('2. Login response:', data);

        if (data.success) {
            console.log('3. Login successful! Token:', data.data.token.substring(0, 20) + '...');

            // Store in localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            console.log('4. Stored token and user in localStorage');

            // Trigger storage event to update React app
            window.dispatchEvent(new Event('storage'));
            console.log('5. Dispatched storage event');

            return true;
        } else {
            console.error('Login failed:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// Test authentication status
function checkAuthStatus() {
    console.log('=== AUTH STATUS CHECK ===');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);

    if (token) {
        console.log('Token preview:', token.substring(0, 30) + '...');
    }
    if (user) {
        console.log('User data:', JSON.parse(user));
    }
}

// Clear storage
function clearAuth() {
    console.log('=== CLEARING AUTH ===');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Cleared token and user from localStorage');
}

// Auto-run checks
checkAuthStatus();

console.log('=== AVAILABLE FUNCTIONS ===');
console.log('- testLogin(): Test the login API');
console.log('- checkAuthStatus(): Check current auth state');
console.log('- clearAuth(): Clear authentication data');
console.log('');
console.log('Try running: await testLogin()');