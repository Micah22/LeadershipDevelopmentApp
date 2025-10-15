// User Dashboard JavaScript - UPDATED WITH ADMIN RESOURCES ACCESS

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('User dashboard loaded');
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    
    if (!isLoggedIn || !username) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set up user info
    updateUserInfo();
    
    // Set up navigation
    updateNavigation();
    
    // Set up sign out functionality
    setupSignOut();
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up storage event listener for real-time updates
    window.addEventListener('storage', function(e) {
        if (e.key === 'userProgress' || e.key === 'leadershipPaths') {
            loadDashboardData();
        }
    });
});

// Update user info in header
function updateUserInfo() {
    const username = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (username && isLoggedIn) {
        const users = getUsers();
        const user = users.find(u => u.username === username);
        
        if (user) {
            // Update avatar
            const avatar = document.getElementById('userAvatar');
            if (avatar) {
                avatar.textContent = user.fullName.charAt(0).toUpperCase();
            }
            
            // Update name
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = user.fullName;
            }
            
            // Update role
            const userRole = document.getElementById('userRole');
            if (userRole) {
                userRole.textContent = user.role;
            }
        }
    } else {
        window.location.href = 'index.html';
    }
}

// Update navigation based on user role
function updateNavigation() {
    const username = localStorage.getItem('username');
    const users = getUsers();
    const user = users.find(u => u.username === username);
    const navLinks = document.getElementById('navLinks');
    
    if (!navLinks) {
        return;
    }
    
    if (!user) {
        navLinks.innerHTML = '<a href="index.html" class="nav-link">Login</a>';
        return;
    }
    
    let navigationHTML = '';
    
    if (user.role === 'Admin') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link active">Dashboard</a><a href="my-progress.html" class="nav-link">My Progress</a><a href="admin.html" class="nav-link">Admin Console</a><a href="admin-progress.html" class="nav-link">Progress Overview</a><a href="#" class="nav-link">Resources</a>';
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link active">Dashboard</a><a href="my-progress.html" class="nav-link">My Progress</a><a href="admin-progress.html" class="nav-link">Progress Overview</a><a href="#" class="nav-link">Resources</a>';
    } else {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link active">Dashboard</a><a href="my-progress.html" class="nav-link">My Progress</a><a href="#" class="nav-link">Resources</a>';
    }
    
    navLinks.innerHTML = navigationHTML;
}

// Set up sign out functionality
function setupSignOut() {
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });
    }
}

// Get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Get current user
function getCurrentUser() {
    const username = localStorage.getItem('username');
    const users = getUsers();
    return users.find(u => u.username === username);
}

// Get user-specific progress data
function getUserProgress(username) {
    const userProgressKey = `userProgress_${username}`;
    const progress = localStorage.getItem(userProgressKey);
    return progress ? JSON.parse(progress) : {};
}

// Get leadership paths
function getLeadershipPaths() {
    const paths = localStorage.getItem('leadershipPaths');
    return paths ? JSON.parse(paths) : [];
}

// Check if path is unlocked for user role
function isPathUnlocked(path, userRole) {
    const roleHierarchy = {
        'Team Member': 1,
        'Trainer': 2,
        'Assistant Supervisor': 3,
        'Supervisor': 4,
        'Director': 5,
        'Admin': 6
    };
    
    const userLevel = roleHierarchy[userRole] || 1;
    const pathLevel = roleHierarchy[path.role] || 1;
    
    return userLevel >= pathLevel;
}

// Load dashboard data
function loadDashboardData() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('No current user found');
        return;
    }
    
    const username = currentUser.username;
    const userProgress = getUserProgress(username);
    const leadershipPaths = getLeadershipPaths();
    
    console.log('Loading dashboard data for user:', username);
    console.log('User progress data:', userProgress);
    console.log('Leadership paths:', leadershipPaths);
    
    // Update progress stats
    updateProgressStats(userProgress, leadershipPaths, currentUser.role);
    
    // Update role-specific content
    updateRoleContent(currentUser.role);
}

// Update progress statistics
function updateProgressStats(userProgress, leadershipPaths, userRole) {
    let totalCompleted = 0;
    let totalTasks = 0;
    
    // Calculate progress for unlocked paths only
    leadershipPaths.forEach(path => {
        if (isPathUnlocked(path, userRole)) {
            const pathProgress = userProgress[path.name] || { completed: 0, total: path.tasks.length };
            totalCompleted += pathProgress.completed || 0;
            totalTasks += path.tasks.length;
        }
    });
    
    const progressPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    
    // Update stats display
    const completedElement = document.getElementById('completedTasks');
    const totalElement = document.getElementById('totalTasks');
    const progressElement = document.getElementById('progressPercentage');
    const progressBar = document.getElementById('progressFill');
    
    if (completedElement) completedElement.textContent = totalCompleted;
    if (totalElement) totalElement.textContent = totalTasks;
    if (progressElement) progressElement.textContent = progressPercentage + '%';
    if (progressBar) progressBar.style.width = progressPercentage + '%';
}

// Update role-specific content
function updateRoleContent(role) {
    const roleContent = document.getElementById('roleContent');
    if (!roleContent) return;
    
    let content = '';
    
    switch (role) {
        case 'Admin':
            content = `
                <div class="role-feature">
                    <i class="fas fa-users"></i>
                    <h3>User Management</h3>
                    <p>Manage users, roles, and permissions</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Progress Overview</h3>
                    <p>View all users' progress and analytics</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-cog"></i>
                    <h3>System Settings</h3>
                    <p>Configure leadership paths and system settings</p>
                </div>
            `;
            break;
        case 'Director':
            content = `
                <div class="role-feature">
                    <i class="fas fa-chart-line"></i>
                    <h3>Strategic Planning</h3>
                    <p>Develop long-term leadership strategies</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-users"></i>
                    <h3>Team Leadership</h3>
                    <p>Lead and mentor your team members</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Progress Overview</h3>
                    <p>Monitor team progress and development</p>
                </div>
            `;
            break;
        case 'Supervisor':
            content = `
                <div class="role-feature">
                    <i class="fas fa-user-check"></i>
                    <h3>Team Supervision</h3>
                    <p>Supervise and guide team members</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Progress Overview</h3>
                    <p>Track team member development progress</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-comments"></i>
                    <h3>Communication</h3>
                    <p>Maintain effective team communication</p>
                </div>
            `;
            break;
        case 'Assistant Supervisor':
            content = `
                <div class="role-feature">
                    <i class="fas fa-hands-helping"></i>
                    <h3>Team Support</h3>
                    <p>Support team members and supervisors</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-tasks"></i>
                    <h3>Task Coordination</h3>
                    <p>Coordinate tasks and ensure completion</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-lightbulb"></i>
                    <h3>Process Improvement</h3>
                    <p>Identify and implement process improvements</p>
                </div>
            `;
            break;
        case 'Trainer':
            content = `
                <div class="role-feature">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h3>Training Delivery</h3>
                    <p>Deliver training sessions and workshops</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-book"></i>
                    <h3>Curriculum Development</h3>
                    <p>Develop and update training materials</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-graduation-cap"></i>
                    <h3>Skill Assessment</h3>
                    <p>Assess and evaluate team skills</p>
                </div>
            `;
            break;
        case 'Team Member':
            content = `
                <div class="role-feature">
                    <i class="fas fa-target"></i>
                    <h3>Goal Setting</h3>
                    <p>Set and work towards personal goals</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-book-open"></i>
                    <h3>Learning & Development</h3>
                    <p>Focus on personal growth and learning</p>
                </div>
                <div class="role-feature">
                    <i class="fas fa-handshake"></i>
                    <h3>Team Collaboration</h3>
                    <p>Work effectively with team members</p>
                </div>
            `;
            break;
        default:
            content = `
                <div class="role-feature">
                    <i class="fas fa-star"></i>
                    <h3>Leadership Development</h3>
                    <p>Continue your leadership journey</p>
                </div>
            `;
    }
    
    roleContent.innerHTML = content;
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
