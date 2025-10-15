// Simple test to check what's happening
console.log('=== NAVIGATION DEBUG TEST ===');

// Check if we're on the right page
console.log('Current page:', window.location.pathname);

// Check localStorage
const userEmail = localStorage.getItem('userEmail');
const isLoggedIn = localStorage.getItem('isLoggedIn');
const users = localStorage.getItem('users');

console.log('userEmail:', userEmail);
console.log('isLoggedIn:', isLoggedIn);
console.log('users exists:', !!users);

if (users) {
    try {
        const usersArray = JSON.parse(users);
        console.log('Users count:', usersArray.length);
        console.log('Users:', usersArray);
        
        if (userEmail) {
            const user = usersArray.find(u => u.email === userEmail);
            console.log('Found user:', user);
        }
    } catch (e) {
        console.error('Error parsing users:', e);
    }
}

// Check DOM elements
const navLinks = document.getElementById('navLinks');
console.log('navLinks element:', navLinks);
console.log('navLinks innerHTML:', navLinks ? navLinks.innerHTML : 'NOT FOUND');

// Check if functions exist
console.log('updateNavigation exists:', typeof updateNavigation);
console.log('getUsers exists:', typeof getUsers);

console.log('=== END DEBUG TEST ===');
