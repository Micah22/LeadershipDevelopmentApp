// Admin Progress Script - UPDATED WITH ADMIN RESOURCES ACCESS

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Progress page loaded');
    
    // Check if user is logged in and has permission
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    
    if (!isLoggedIn || !username) {
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user has permission to view progress overview
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user || !['Admin', 'Director', 'Supervisor'].includes(user.role)) {
        window.location.href = 'user-dashboard.html';
        return;
    }
    
    // Set up user info
    updateUserInfo();
    
    // Set up navigation
    updateNavigation();
    
    // Set up sign out functionality
    setupSignOut();
    
    // Load progress data
    loadProgressData();
    
    // Set up storage event listener for real-time updates
    window.addEventListener('storage', function(e) {
        if (e.key === 'userProgress' || e.key === 'leadershipPaths') {
            loadProgressData();
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
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link">My Progress</a><a href="admin.html" class="nav-link">Admin Console</a><a href="admin-progress.html" class="nav-link active">Progress Overview</a><a href="#" class="nav-link">Resources</a>';
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link">My Progress</a><a href="admin-progress.html" class="nav-link active">Progress Overview</a><a href="#" class="nav-link">Resources</a>';
    } else {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link">My Progress</a><a href="#" class="nav-link">Resources</a>';
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

// Load progress data
function loadProgressData() {
    console.log('Loading progress data...');
    
    const users = getUsers();
    const leadershipPaths = getLeadershipPaths();
    
    console.log('Users:', users);
    console.log('Leadership paths:', leadershipPaths);
    
    // Display summary stats
    displaySummaryStats(users, leadershipPaths);
    
    // Display individual user progress
    displayIndividualProgress(users, leadershipPaths);
}

// Display summary statistics
function displaySummaryStats(users, leadershipPaths) {
    const totalUsers = users.length;
    let totalProgressPercentage = 0;
    let totalCompletedTasksAllUsers = 0;
    let totalPossibleTasksAllUsers = 0;
    
    const rolesCount = {};
    const allRoles = ["Admin", "Director", "Supervisor", "Assistant Supervisor", "Trainer", "Team Member"];
    allRoles.forEach(role => rolesCount[role] = 0); // Initialize all roles
    
    users.forEach(user => {
        rolesCount[user.role] = (rolesCount[user.role] || 0) + 1;
        
        const userProgress = getUserProgress(user.username);
        let userCompletedTasks = 0;
        let userTotalTasks = 0;
        
        leadershipPaths.forEach(path => {
            const requiredRoleIndex = allRoles.indexOf(path.requiredRole);
            const userRoleIndex = allRoles.indexOf(user.role);
            
            if (userRoleIndex <= requiredRoleIndex) { // User's role is high enough to access this path
                userTotalTasks += path.tasks.length;
                path.tasks.forEach(task => {
                    if (userProgress[path.name] && userProgress[path.name][task.name]) {
                        userCompletedTasks++;
                    }
                });
            }
        });
        
        if (userTotalTasks > 0) {
            totalProgressPercentage += (userCompletedTasks / userTotalTasks) * 100;
        }
        totalCompletedTasksAllUsers += userCompletedTasks;
        totalPossibleTasksAllUsers += userTotalTasks;
    });
    
    const averageProgress = totalUsers > 0 ? (totalProgressPercentage / totalUsers).toFixed(0) : 0;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('averageProgress').textContent = `${averageProgress}%`;
    // Removed Tasks Completed and Total Tasks from summary as per new request
    
    displayUsersByRole(rolesCount);
}

// Display users by role
function displayUsersByRole(rolesCount) {
    const roleCardsGrid = document.getElementById('roleCardsGrid');
    roleCardsGrid.innerHTML = ''; // Clear previous cards
    
    const allRoles = ["Admin", "Director", "Supervisor", "Assistant Supervisor", "Trainer", "Team Member"];
    allRoles.forEach(role => {
        const count = rolesCount[role] || 0;
        const roleCard = `
            <div class="role-card">
                <div class="role-card-header">
                    <span class="role-name">${role}</span>
                    <span class="role-count">${count}</span>
                </div>
                <div class="role-card-body">
                    <i class="fas fa-user-tag"></i>
                </div>
            </div>
        `;
        roleCardsGrid.innerHTML += roleCard;
    });
}

// Display individual user progress
function displayIndividualProgress(users, leadershipPaths) {
    const progressTable = document.getElementById('progressTable');
    const tbody = progressTable.querySelector('tbody');
    
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #6C757D;">No users found</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const userProgress = getUserProgress(user.username);
        let totalCompleted = 0;
        let totalTasks = 0;
        
        // Calculate progress for this user
        leadershipPaths.forEach(path => {
            if (isPathUnlocked(path, user.role)) {
                totalTasks += path.tasks.length;
                const pathProgress = userProgress[path.name] || { completed: 0, total: path.tasks.length };
                totalCompleted += pathProgress.completed || 0;
            }
        });
        
        const progressPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="user-info">
                    <div class="user-avatar">${user.fullName.charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                        <div class="user-name">${user.fullName}</div>
                        <div class="user-email">${user.username}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="role-badge role-${user.role.toLowerCase().replace(' ', '-')}">${user.role}</span>
            </td>
            <td>
                <div class="progress-info">
                    <span class="progress-text">${progressPercentage}%</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <span class="task-count">${totalCompleted}/${totalTasks}</span>
            </td>
        `;
        
        tbody.appendChild(row);
    });
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
