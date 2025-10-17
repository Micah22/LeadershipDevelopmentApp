// Leadership Paths JavaScript - Minimal Version

console.log('Leadership paths script starting to load...');

// Test function
function testFunction() {
    console.log('Test function called');
    return 'Test works!';
}

// Update navigation function
function updateNavigation() {
    console.log('updateNavigation called');
    const userEmail = localStorage.getItem('userEmail');
    const users = getUsers();
    const user = users.find(u => u.email === userEmail);
    const navLinks = document.getElementById('navLinks');
    
    console.log('User email:', userEmail);
    console.log('Users found:', users.length);
    console.log('User found:', user);
    console.log('Nav links element:', navLinks);
    
    if (!navLinks) {
        console.error('navLinks element not found');
        return;
    }
    
    if (!user) {
        console.error('User not found');
        return;
    }
    
    let navigationHTML = '';
    
    if (user.role === 'Admin') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="leadership-paths.html" class="nav-link active">Leadership Paths</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="quizzes.html" class="nav-link">Quizzes</a><a href="#" class="nav-link">Resources</a>';
    } else {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="leadership-paths.html" class="nav-link active">Leadership Paths</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="quizzes.html" class="nav-link">Quizzes</a><a href="#" class="nav-link">Resources</a>';
    }
    
    console.log('Setting navigation HTML:', navigationHTML);
    navLinks.innerHTML = navigationHTML;
    console.log('Navigation updated successfully');
}

// Get users function
function getUsers() {
    const users = localStorage.getItem('users');
    if (users) {
        return JSON.parse(users);
    }
    return [];
}

// Make functions globally accessible
window.updateNavigation = updateNavigation;
window.testFunction = testFunction;
window.getUsers = getUsers;

console.log('Leadership paths script loaded successfully');
