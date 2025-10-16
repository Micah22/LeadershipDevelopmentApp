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
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Initialize page with parallel operations
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        // Run operations in parallel for faster loading
        const [usersData, navbarReady] = await Promise.allSettled([
            ensureUsersData(),
            waitForNavbar()
        ]);
        
        // Set up user info
        updateUserInfo();
        
        // Refresh navbar after user info is updated
        if (typeof window.refreshNavbar === 'function') {
            console.log('User Script - Refreshing navbar after user info updated');
            window.refreshNavbar();
        }
        
        // Set up sign out functionality
        setupSignOut();
        
        // Load dashboard data
        await loadDashboardData();
        
        // Hide loading indicator and show content
        hideLoadingIndicator();
        
        // Fallback: ensure content is visible after 3 seconds
        setTimeout(() => {
            const mainContent = document.querySelector('.main-content');
            if (mainContent && mainContent.style.display === 'none') {
                console.log('User Script - Fallback: forcing main content to be visible');
                mainContent.style.display = 'block';
                mainContent.style.visibility = 'visible';
                mainContent.style.opacity = '1';
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        hideLoadingIndicator();
    }
}

function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const mainContent = document.querySelector('.main-content');
    
    console.log('User Script - Showing loading indicator, hiding main content');
    console.log('Loading indicator element:', loadingIndicator);
    console.log('Main content element:', mainContent);
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
        console.log('Loading indicator shown');
    }
    if (mainContent) {
        mainContent.style.display = 'none';
        console.log('Main content hidden');
    } else {
        console.error('Main content element not found!');
    }
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const mainContent = document.querySelector('.main-content');
    
    console.log('User Script - Hiding loading indicator, showing main content');
    console.log('Loading indicator element:', loadingIndicator);
    console.log('Main content element:', mainContent);
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
        console.log('Loading indicator hidden');
    }
    if (mainContent) {
        mainContent.style.display = 'block';
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
        console.log('Main content shown');
    } else {
        console.error('Main content element not found!');
    }
}

function waitForNavbar() {
    return new Promise((resolve) => {
        if (typeof window.refreshNavbar === 'function') {
            resolve(true);
        } else {
            // Wait for navbar to be ready
            const checkNavbar = setInterval(() => {
                if (typeof window.refreshNavbar === 'function') {
                    clearInterval(checkNavbar);
                    resolve(true);
                }
            }, 50);
        }
    });
}

// Set up storage event listener for real-time updates
window.addEventListener('storage', function(e) {
    if (e.key === 'userProgress' || e.key === 'leadershipPaths') {
        loadDashboardData();
    }
});

// Update user info in header
function updateUserInfo() {
    const username = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    console.log('User Script - updateUserInfo() called:', { username, isLoggedIn });
    
    if (username && isLoggedIn) {
        const users = getUsers();
        const user = users.find(u => u.username === username);
        
        console.log('User Script - updateUserInfo() - users found:', users.length, 'user match:', !!user);
        
        if (user) {
            // Update avatar
            const avatar = document.getElementById('userAvatar');
            if (avatar) {
                const fullName = user.full_name || user.fullName || user.username || 'U';
                avatar.textContent = fullName.charAt(0).toUpperCase();
            }
            
            // Update name
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = user.full_name || user.fullName || user.username || 'Unknown User';
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
// Navigation is now handled by navbar.js

// Set up sign out functionality
function setupSignOut() {
    // Navbar functionality is now handled by navbar.js
    
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


// Ensure users data is available
async function ensureUsersData() {
    console.log('User Script - ensureUsersData() called');
    
    const existingUsers = localStorage.getItem('users');
    console.log('User Script - Raw users data from localStorage:', existingUsers);
    
    let users = [];
    let needsInitialization = false;
    
    if (!existingUsers) {
        console.log('User Script - No users data found in localStorage');
        needsInitialization = true;
    } else {
        try {
            users = JSON.parse(existingUsers);
            console.log('User Script - Parsed users:', users);
            if (!Array.isArray(users) || users.length === 0) {
                console.log('User Script - Users data is invalid or empty array');
                needsInitialization = true;
            } else {
                console.log('User Script - Valid users data found:', users.length, 'users');
            }
        } catch (error) {
            console.log('User Script - Error parsing users data:', error.message);
            needsInitialization = true;
        }
    }
    
    if (needsInitialization) {
        console.log('User Script - Initializing default users...');
        
        // Create default users (same as in index.html)
        const defaultUsers = [
            {
                fullName: 'Admin User',
                username: 'admin',
                password: 'admin123',
                role: 'Admin',
                status: 'active'
            },
            {
                fullName: 'John Smith',
                username: 'john',
                password: '123456',
                role: 'Director',
                status: 'active'
            },
            {
                fullName: 'Sarah Johnson',
                username: 'sarah',
                password: '123456',
                role: 'Manager',
                status: 'active'
            },
            {
                fullName: 'Mike Wilson',
                username: 'mike',
                password: '123456',
                role: 'Supervisor',
                status: 'active'
            },
            {
                fullName: 'Lisa Brown',
                username: 'lisa',
                password: '123456',
                role: 'Team Member',
                status: 'active'
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('User Script - Default users initialized:', defaultUsers.length);
    }
    
    // Refresh navbar after users data is available
    if (typeof window.refreshNavbar === 'function') {
        console.log('User Script - Refreshing navbar after users data loaded');
        window.refreshNavbar();
    }
}

// Get users from localStorage
function getUsers() {
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];
    console.log('User Script - getUsers() called, returning:', users.length, 'users');
    return users;
}

// Get current user
function getCurrentUser() {
    const username = localStorage.getItem('username');
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    console.log('User Script - getCurrentUser() called:', { username, usersCount: users.length, userFound: !!user });
    
    if (!user) {
        console.log('User Script - User not found for username:', username);
    }
    
    return user;
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
async function initializeDefaultLeadershipPaths() {
    try {
        // Try to get modules from database first
        const dbModules = await window.dbService.getModules();
        if (dbModules && dbModules.length > 0) {
            console.log('Modules loaded from database:', dbModules.length);
            // Store in localStorage for compatibility
            localStorage.setItem('globalModules', JSON.stringify(dbModules));
            return;
        }
    } catch (error) {
        console.log('Database not available, checking localStorage');
    }
    
    // Fallback to localStorage
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
    } else {
        console.log('Existing modules found, preserving data');
    }
}

// Load dashboard data - FIXED TO UPDATE ALL STATS
async function loadDashboardData() {
    const username = localStorage.getItem('username');
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
        console.error('User not found');
        return;
    }
    
    // Initialize default paths if none exist
    await initializeDefaultLeadershipPaths();
    
    const leadershipPaths = getLeadershipPaths();
    const userProgress = getUserProgress(username);
    
    
    // Calculate progress
    let totalCompleted = 0;
    let totalTasks = 0;
    
    leadershipPaths.forEach(path => {
        if (isPathUnlocked(path, user.role)) {
            totalTasks += (path.checklist || []).length;
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

// Theme and dropdown functionality is now handled by navbar.js

// Dashboard data loading is now handled by initializeDashboard() function
