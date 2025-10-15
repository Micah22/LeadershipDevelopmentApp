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
    
    // Update dropdown user info
    updateDropdownUserInfo();
    
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

// Get global modules (leadership paths)
function getLeadershipPaths() {
    const modules = localStorage.getItem('globalModules');
    return modules ? JSON.parse(modules) : [];
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
    const pathLevel = roleHierarchy[path.requiredRole] || 1;
    
    return userLevel >= pathLevel;
}

// Initialize default global modules if none exist
function initializeDefaultLeadershipPaths() {
    const existingModules = localStorage.getItem('globalModules');
    if (!existingModules) {
        const defaultModules = [
            {
                title: 'Communication Skills',
                description: 'Develop effective communication techniques',
                requiredRole: 'Team Member',
                checklist: [
                    'Complete communication fundamentals video',
                    'Read "The Art of Active Listening" article',
                    'Practice delivering a team update presentation',
                    'Complete communication style assessment',
                    'Submit reflection on communication challenges'
                ]
            },
            {
                title: 'Team Leadership',
                description: 'Learn to lead and motivate teams effectively',
                requiredRole: 'Trainer',
                checklist: [
                    'Study team dynamics principles',
                    'Complete conflict resolution training',
                    'Lead a team meeting',
                    'Create team development plan',
                    'Evaluate team performance'
                ]
            },
            {
                title: 'Strategic Thinking',
                description: 'Develop strategic planning and decision-making skills',
                requiredRole: 'Assistant Supervisor',
                checklist: [
                    'Complete strategic planning course',
                    'Analyze case studies',
                    'Develop department strategy',
                    'Present strategic recommendations',
                    'Implement strategic initiatives'
                ]
            }
        ];
        
        localStorage.setItem('globalModules', JSON.stringify(defaultModules));
        console.log('Initialized default global modules');
    }
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
    
    // Initialize default paths if none exist
    initializeDefaultLeadershipPaths();
    
    const leadershipPaths = getLeadershipPaths();
    const userProgress = getUserProgress(username);
    
    
    // Calculate progress
    let totalCompleted = 0;
    let totalTasks = 0;
    
    leadershipPaths.forEach(path => {
        if (isPathUnlocked(path, user.role)) {
            totalTasks += path.checklist.length;
            const pathProgress = userProgress[path.title];
            
            if (pathProgress && pathProgress.checklist) {
                // Count completed tasks from checklist array
                const completed = pathProgress.checklist.filter(task => task === true).length;
                totalCompleted += completed;
            }
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
    
    // Update progress items
    updateProgressItems(leadershipPaths, userProgress, user.role);
}

// Update progress items
function updateProgressItems(leadershipPaths, userProgress, userRole) {
    const progressItems = document.querySelectorAll('.progress-item');
    
    leadershipPaths.forEach((path, index) => {
        if (index < progressItems.length) {
            const item = progressItems[index];
            const pathProgress = userProgress[path.title] || { completed: 0, total: path.checklist.length };
            const percentage = path.checklist.length > 0 ? Math.round((pathProgress.completed / path.checklist.length) * 100) : 0;
            
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

// Update dropdown user info
function updateDropdownUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const username = currentUser.username || localStorage.getItem('username') || 'User';
    const role = currentUser.role || 'Team Member';
    
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserRole = document.getElementById('dropdownUserRole');
    
    if (dropdownUserName) {
        dropdownUserName.textContent = username;
    }
    
    if (dropdownUserRole) {
        dropdownUserRole.textContent = role;
    }
}
