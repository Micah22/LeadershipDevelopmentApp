// User Dashboard Script - STANDARDIZED NAVBAR

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('User Dashboard page loaded');
    
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
    
    // Initialize theme
    initializeTheme();
    
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

// Update navigation based on user role - STANDARDIZED
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
        navigationHTML = '<a href="user-dashboard.html" class="nav-link active">Dashboard</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="admin-user-overview.html" class="nav-link">User Overview</a><a href="#" class="nav-link">Resources</a>';
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link active">Dashboard</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="admin-user-overview.html" class="nav-link">User Overview</a><a href="#" class="nav-link">Resources</a>';
    } else {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link active">Dashboard</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="#" class="nav-link">Resources</a>';
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
    
    // Avatar dropdown functionality
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Theme toggle button in dropdown
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleTheme();
        });
    }
    
    // Sign out button in dropdown
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function(e) {
            e.stopPropagation();
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

// Load dashboard data - FIXED TO UPDATE ALL STATS
function loadDashboardData() {
    const username = localStorage.getItem('username');
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
        console.error('User not found');
        return;
    }
    
    const leadershipPaths = getLeadershipPaths();
    const userProgress = getUserProgress(username);
    
    // Calculate progress
    let totalCompleted = 0;
    let totalTasks = 0;
    
    leadershipPaths.forEach(path => {
        if (isPathUnlocked(path, user.role)) {
            totalTasks += path.tasks.length;
            const pathProgress = userProgress[path.name] || { completed: 0, total: path.tasks.length };
            totalCompleted += pathProgress.completed || 0;
        }
    });
    
    const progressPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    
    // Update all progress stats - FIXED ELEMENT IDs
    const progressPercentageElement = document.getElementById('progressPercentage');
    const completedTasksElement = document.getElementById('completedTasks');
    const progressFillElement = document.getElementById('progressFill');
    
    if (progressPercentageElement) {
        progressPercentageElement.textContent = `${progressPercentage}%`;
    }
    
    if (completedTasksElement) {
        completedTasksElement.textContent = totalCompleted;
    }
    
    if (progressFillElement) {
        progressFillElement.style.width = `${progressPercentage}%`;
    }
    
    console.log('Updated dashboard stats:', { totalCompleted, totalTasks, progressPercentage });
    
    // Update progress items
    updateProgressItems(leadershipPaths, userProgress, user.role);
}

// Update progress items
function updateProgressItems(leadershipPaths, userProgress, userRole) {
    const progressItems = document.querySelectorAll('.progress-item');
    
    leadershipPaths.forEach((path, index) => {
        if (index < progressItems.length) {
            const item = progressItems[index];
            const pathProgress = userProgress[path.name] || { completed: 0, total: path.tasks.length };
            const percentage = path.tasks.length > 0 ? Math.round((pathProgress.completed / path.tasks.length) * 100) : 0;
            
            const progressBar = item.querySelector('.progress-fill');
            const progressText = item.querySelector('.progress-text');
            
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${percentage}%`;
            }
        }
    });
}

// View progress function
function viewProgress() {
    window.location.href = 'user-progress.html';
}

// Explore paths function
function explorePaths() {
    window.location.href = 'user-progress.html';
}

// Theme toggle functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set the new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update the icon
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Update the text
    const themeText = document.getElementById('themeText');
    if (themeText) {
        themeText.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
    
    console.log('Theme switched to:', newTheme);
}

// Initialize theme on page load
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    const themeText = document.getElementById('themeText');
    if (themeText) {
        themeText.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
}
