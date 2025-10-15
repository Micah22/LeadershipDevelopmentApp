// Test script to check user data and login
console.log('=== USER DATA TEST ===');

// Check if there are any users in localStorage
const users = localStorage.getItem('users');
console.log('Users in localStorage:', users);

if (users) {
    try {
        const usersArray = JSON.parse(users);
        console.log('Parsed users:', usersArray);
        console.log('Number of users:', usersArray.length);
        
        // Show first few users
        usersArray.slice(0, 3).forEach((user, index) => {
            console.log('User ' + index + ':', {
                email: user.email,
                password: user.password,
                role: user.role,
                fullName: user.fullName
            });
        });
    } catch (e) {
        console.error('Error parsing users:', e);
    }
} else {
    console.log('No users found in localStorage');
}

// Check current login status
console.log('Current userEmail:', localStorage.getItem('userEmail'));
console.log('Current isLoggedIn:', localStorage.getItem('isLoggedIn'));

console.log('=== END USER DATA TEST ===');
