// Admin User Overview Script

// Admin Overview Script loaded

// Test function to verify script is working
window.testScript = function() {
    return 'Script is functional';
};

document.addEventListener('DOMContentLoaded', async function() {
    try {
    
    // Initialize the page
        await initializePage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up tab navigation
    setupTabNavigation();
    
    // Set up assignment event listeners
    setupAssignmentEventListeners();
    
    // Load user data
    await loadUserData();
    
    // Initialize theme
    initializeTheme();
    
    // Ensure content is visible after everything is loaded
    setTimeout(() => {
        // Check if reports should be shown (if URL has hash or reports is active)
        const urlHash = window.location.hash;
        const reportsTab = document.querySelector('[data-section="reports"]');
        const isReportsActive = reportsTab && reportsTab.classList.contains('active');
        
        if (urlHash === '#reports' || isReportsActive) {
            showReportsContent();
        } else {
        showUserManagementContent();
        }
    }, 100);
    
    } catch (error) {
        console.error('❌ Error in DOMContentLoaded:', error);
    }
});

async function initializePage() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        alert('Please log in to access this page.');
        window.location.href = 'index.html';
        return;
    }
    
    // Store current user info for role-based functionality
    window.currentUser = currentUser;
    
    // Load role management data first
    await loadRoleManagementData();
    
    // Set up role-based UI
    setupRoleBasedUI();
    
    // Set up user info
    await updateUserInfo();
    
    // Set up navigation
    // Navigation is now handled by the navbar component
}

// Set up role-based UI elements
function setupRoleBasedUI() {
    const currentUser = window.currentUser;
    const userRole = currentUser.role || 'Team Member';
    
    console.log('🔍 Setting up UI for role:', userRole);
    
    // Get the role ID for permission checking
    const roleId = reverseRoleMapping[userRole] || 'team-member';
    console.log('🔍 Role ID for permissions:', roleId);
    
    // Find the role definition to get page access
    const roleDefinition = roles.find(r => r.id === roleId);
    const userPageAccess = roleDefinition ? (roleDefinition.pageAccess || []) : pageAccessLevels[1];
    console.log('🔍 User page access from role definition:', userPageAccess);
    
    // Update sidebar header based on role
    const sidebarHeader = document.querySelector('.sidebar-header h2');
    if (sidebarHeader) {
        if (userRole === 'Admin') {
            sidebarHeader.textContent = 'ADMIN TOOLS';
        } else if (userRole === 'Director') {
            sidebarHeader.textContent = 'MANAGEMENT TOOLS';
        } else {
            sidebarHeader.textContent = 'USER TOOLS';
        }
    }
    
    // Show/hide sidebar items based on role permissions
    const sidebarItems = {
        userManagement: 'userManagement',
        pathManagement: 'pathManagement',
        roleManagement: 'roleManagement',
        reports: 'reports',
        settings: 'settings'
    };
    
    Object.keys(sidebarItems).forEach(itemId => {
        const item = document.getElementById(itemId);
        if (item) {
            const hasAccess = userPageAccess.includes(sidebarItems[itemId]);
            console.log(`🔍 ${itemId}: ${hasAccess ? 'show' : 'hide'} (${sidebarItems[itemId]} in ${userPageAccess})`);
            if (hasAccess) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        }
    });
    
    // Update page title based on role
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        if (userRole === 'Admin') {
            pageTitle.textContent = 'User Progress Overview';
        } else if (userRole === 'Director') {
            pageTitle.textContent = 'Team Progress Overview';
        } else {
            pageTitle.textContent = 'User Overview';
        }
    }
    
    // Update page subtitle based on role
    const pageSubtitle = document.querySelector('.page-subtitle');
    if (pageSubtitle) {
        if (userRole === 'Admin') {
            pageSubtitle.textContent = 'Track and monitor all users\' leadership development progress';
        } else if (userRole === 'Director') {
            pageSubtitle.textContent = 'Monitor your team\'s leadership development progress';
        } else {
            pageSubtitle.textContent = 'View user information and progress';
        }
    }
}

// Refresh role-based UI after role changes
function refreshRoleBasedUI() {
    console.log('🔍 Refreshing role-based UI after role changes...');
    setupRoleBasedUI();
}

async function updateUserInfo() {
    const username = localStorage.getItem('username');
    const users = await getUsers();
    const user = users.find(u => u.username === username);
    
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
}

// Navigation is now handled by the navbar component

function setupEventListeners() {
    
    // Modal event listeners
    const modal = document.getElementById('userModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalSave = document.getElementById('modalSave');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeUserModal);
    }
    
    if (modalCancel) {
        modalCancel.addEventListener('click', closeUserModal);
    }
    
    if (modalSave) {
        modalSave.addEventListener('click', saveUserChanges);
    }
    
    // Reset progress button in modal
    const modalResetProgress = document.getElementById('modalResetProgress');
    if (modalResetProgress) {
        modalResetProgress.addEventListener('click', function() {
            const currentUsername = document.getElementById('editUsername').value;
            if (currentUsername) {
                resetUserProgress(currentUsername);
                closeUserModal();
            }
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeUserModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeUserModal();
        }
    });
    
    // New User button
    const newUserBtn = document.getElementById('newUserBtn');
    if (newUserBtn) {
        newUserBtn.addEventListener('click', function() {
            openNewUserModal();
        });
    } else {
        console.error('New User button not found!');
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
            if (confirm('Are you sure you want to sign out?')) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                window.location.href = 'index.html';
            }
        });
    }
    
    
    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle navigation based on ID
            const itemId = this.id;
            handleNavigation(itemId, e);
        });
    });
    
    // Path Management Modal Event Listeners
    const moduleModal = document.getElementById('moduleModal');
    const moduleModalClose = document.getElementById('moduleModalClose');
    const moduleModalCancel = document.getElementById('moduleModalCancel');
    const moduleModalSave = document.getElementById('moduleModalSave');
    const addModuleBtn = document.getElementById('addModuleBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    
    if (moduleModalClose) {
        moduleModalClose.addEventListener('click', closeModuleModal);
    }
    
    if (moduleModalCancel) {
        moduleModalCancel.addEventListener('click', closeModuleModal);
    }
    
    if (moduleModalSave) {
        moduleModalSave.addEventListener('click', saveModuleChanges);
    }
    
    if (addModuleBtn) {
        addModuleBtn.addEventListener('click', function() {
            openModuleModal('new');
        });
    }
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addChecklistItem);
    }
    
    // Close module modal when clicking outside
    if (moduleModal) {
        moduleModal.addEventListener('click', function(e) {
            if (e.target === moduleModal) {
                closeModuleModal();
            }
        });
    }
    
    // Close module modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && moduleModal && moduleModal.classList.contains('show')) {
            closeModuleModal();
        }
    });
}

function handleNavigation(itemId, e) {
    e.preventDefault(); // Prevent default link behavior for all items
    
    switch(itemId) {
        case 'userManagement':
            cleanupCharts();
            showUserManagementContent();
            break;
        case 'pathManagement':
            try {
                cleanupCharts();
                showPathManagementContent();
            } catch (error) {
                console.error('Error in showPathManagementContent:', error);
            }
            break;
        case 'roleManagement':
            try {
                cleanupCharts();
                showRoleManagementContent();
            } catch (error) {
                console.error('Error in showRoleManagementContent:', error);
            }
            break;
        case 'reports':
            try {
                showReportsContent();
            } catch (error) {
                console.error('Error in showReportsContent:', error);
            }
            break;
        case 'settings':
            // TODO: Show settings content
            break;
        default:
            // Default to user management content
            cleanupCharts();
            showUserManagementContent();
            break;
    }
}

async function loadUserData() {
    // Show loading indicator
    showLoadingIndicator();
    
    // Initialize default users if none exist
    initializeDefaultUsers();
    
    // Initialize global modules if none exist
    initializeGlobalModules();
    
    // Get users from database
    let users = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            users = await window.dbService.getUsers();
        } else {
            console.warn('Database service not configured, using localStorage fallback');
            showToast('warning', 'Database Unavailable', 'Using offline mode - data may not be synchronized');
        }
    } catch (error) {
        console.error('Failed to load users from database:', error);
        showToast('error', 'Database Error', `Failed to load users: ${error.message || 'Unknown error'}`);
        
        // Fallback to localStorage if available
        try {
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
            if (localUsers.length > 0) {
                users = localUsers;
                showToast('info', 'Using Offline Data', 'Loaded users from local storage');
            }
        } catch (localError) {
            console.error('Failed to load users from localStorage:', localError);
        }
    }
    
    // Filter users based on current user's role
    const currentUser = window.currentUser;
    const userRole = currentUser.role || 'Team Member';
    let filteredUsers = users;
    
    if (userRole === 'Team Member') {
        // Team members can only see their own data
        filteredUsers = users.filter(user => user.username === currentUser.username);
    } else if (userRole === 'Supervisor') {
        // Supervisors can see their team members (for now, show all users)
        filteredUsers = users;
    } else if (userRole === 'Director') {
        // Directors can see their team and below
        filteredUsers = users;
    }
    // Admins can see all users (no filtering)
    
    console.log('🔍 Filtered users for role', userRole, ':', filteredUsers.length, 'out of', users.length);
    
    // Cache users data to avoid redundant queries
    window.cachedUsers = filteredUsers;
    
    // Load user progress data in parallel for better performance
    const userProgressPromises = filteredUsers.map(async (user) => {
        try {
        const userProgress = await getUserProgress(user.username);
        const overallProgress = await calculateUserOverallProgress(user.username);
            return { user, userProgress, overallProgress };
        } catch (error) {
            console.error(`Failed to load progress for user ${user.username}:`, error);
            return { user, userProgress: {}, overallProgress: 0 };
    }
    });
    
    // Wait for all user progress data to load in parallel
    const userProgressData = await Promise.all(userProgressPromises);
    console.log('Admin Overview - Loaded progress data for all users:', userProgressData.length);
    
    // Update summary cards
    updateSummaryCards(filteredUsers);
    
    // Update role statistics
    updateRoleStats(filteredUsers);
    
    // Update user progress table
    updateUserProgressTable(filteredUsers);
    
    // Load module assignments
    loadModuleAssignments();
    
    // Hide loading indicator
    hideLoadingIndicator();
}

function updateSummaryCards(users) {
    const totalUsersElement = document.getElementById('totalUsers');
    
    if (totalUsersElement) {
        totalUsersElement.textContent = users.length;
    } else {
    }
}

function updateRoleStats(users) {
    // Count users by role
    const roleCounts = {};
    users.forEach(user => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    // Update floating cards with role counts
    const adminCountElement = document.getElementById('adminCount');
    const directorCountElement = document.getElementById('directorCount');
    const teamMemberCountElement = document.getElementById('teamMemberCount');
    
    if (adminCountElement) {
        adminCountElement.textContent = roleCounts['Admin'] || 0;
    }
    
    if (directorCountElement) {
        directorCountElement.textContent = roleCounts['Director'] || 0;
    }
    
    if (teamMemberCountElement) {
        teamMemberCountElement.textContent = roleCounts['Team Member'] || 0;
    }
}

function updateUserProgressTable(users) {
    const tableBody = document.getElementById('userProgressTable');
    const mobileTable = document.getElementById('userProgressTableMobile');
    
    if (!tableBody || !mobileTable) {
        return;
    }
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: var(--medium-gray);">
                    No users found
                </td>
            </tr>
        `;
        mobileTable.innerHTML = `
            <div class="user-card-mobile">
                <div style="text-align: center; padding: 2rem; color: var(--medium-gray);">
                    No users found
                </div>
            </div>
        `;
        return;
    }
    
    // Generate table rows for each user
    const tableRows = users.map(user => {
        const status = user.status || 'active';
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.9rem;">
                            ${(user.full_name || user.fullName || user.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${user.full_name || user.fullName || user.username}</div>
                            <div style="font-size: 0.8rem; color: var(--medium-gray);">${user.username}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${getStatusClass(user.role)}">${user.role}</span>
                </td>
                <td>
                    <span class="status-badge status-${status}">${status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="editUser('${user.username}')">
                            <i class="fas fa-edit"></i>
                            Edit User
                        </button>
                        <button class="action-btn action-btn-info" onclick="viewUserDetails('${user.username}')">
                            <i class="fas fa-info-circle"></i>
                            Details
                        </button>
                        <button class="action-btn action-btn-danger" onclick="resetUserProgress('${user.username}')" title="Reset User Progress">
                            <i class="fas fa-undo"></i>
                            Reset Progress
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    // Generate mobile cards for each user
    const mobileCards = users.map(user => {
        const status = user.status || 'active';
        const fullName = user.full_name || user.fullName || user.username;
        
        return `
            <div class="user-card-mobile">
                <div class="user-details">
                    <div class="detail-item">
                        <div class="detail-label">Full name</div>
                        <div class="detail-value">${fullName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Role</div>
                        <div class="detail-value">${user.role}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Username</div>
                        <div class="detail-value">${user.username}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Status</div>
                        <div class="detail-value">${status}</div>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="action-btn-mobile" onclick="editUser('${user.username}')">
                        Edit
                    </button>
                    <button class="action-btn-mobile primary" onclick="viewUserDetails('${user.username}')">
                        Details
                    </button>
                </div>
            </div>
        `;
    });
    
    tableBody.innerHTML = tableRows.join('');
    mobileTable.innerHTML = mobileCards.join('');
}

function getStatusClass(role) {
    switch(role.toLowerCase()) {
        case 'admin':
            return 'status-active';
        case 'supervisor':
            return 'status-pending';
        case 'team member':
            return 'status-active';
        default:
            return 'status-inactive';
    }
}

// Reset user progress function
async function resetUserProgress(username) {
    // Show confirmation dialog
    const confirmed = confirm(
        `Are you sure you want to reset the progress for user "${username}"?\n\n` +
        `This will:\n` +
        `• Clear all completed tasks for this user\n` +
        `• Reset progress to 0% on all assigned modules\n` +
        `• Remove all progress data from the database\n\n` +
        `This action cannot be undone.`
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        // Get user ID
        const users = await getAllUsers();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            showToast('error', 'User Not Found', `User "${username}" not found`);
            return;
        }
        
        // Delete all user progress from database
        if (window.dbService && window.dbService.isConfigured) {
            await window.dbService.deleteUserProgress(user.id);
            console.log(`Progress reset for user: ${username} (ID: ${user.id})`);
        }
        
        // Clear from localStorage as well
        const userProgressKey = `userProgress_${username}`;
        localStorage.removeItem(userProgressKey);
        
        // Show success message
        showToast('success', 'Progress Reset', `Progress has been reset for user "${username}"`);
        
        // Reload the user data to refresh the display
        await loadUserData();
        
    } catch (error) {
        console.error('Failed to reset user progress:', error);
        showToast('error', 'Reset Failed', `Failed to reset progress for user "${username}": ${error.message || 'Unknown error'}`);
    }
}

function editUser(username) {
    openUserModal(username);
}

function viewUserDetails(username) {
    openUserDetailsModal(username);
}

async function openUserDetailsModal(username) {
    const users = await getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
        showToast('error', 'Error', 'User not found');
        return;
    }
    
    // Get user's full name safely
    const userFullName = user.full_name || user.fullName || user.username || 'Unknown User';
    const userDisplayName = userFullName.charAt(0).toUpperCase();
    
    // Get quiz results for this user
    let quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    
    // Add some test quiz data for admin user if none exists
    if (username === 'admin' && quizResults.length === 0) {
        const testQuizResults = [
            {
                id: 'test_result_1',
                quizId: 'quiz_1',
                quizTitle: 'Leadership Fundamentals',
                username: 'admin',
                score: 85,
                correctAnswers: 17,
                totalQuestions: 20,
                passed: true,
                dateTaken: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                answers: [],
                timeSpent: 0
            },
            {
                id: 'test_result_2',
                quizId: 'quiz_2',
                quizTitle: 'Team Management',
                username: 'admin',
                score: 92,
                correctAnswers: 23,
                totalQuestions: 25,
                passed: true,
                dateTaken: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                answers: [],
                timeSpent: 0
            },
            {
                id: 'test_result_3',
                quizId: 'quiz_3',
                quizTitle: 'Communication Skills',
                username: 'admin',
                score: 78,
                correctAnswers: 15,
                totalQuestions: 20,
                passed: false,
                dateTaken: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                answers: [],
                timeSpent: 0
            }
        ];
        quizResults = testQuizResults;
        localStorage.setItem('quizResults', JSON.stringify(quizResults));
    }
    
    const userQuizResults = quizResults.filter(result => {
        // Handle both old format (no username) and new format (with username)
        // For old results without username, assume they belong to the current user if they're the only results
        if (result.username) {
            return result.username === username;
        } else {
            // For backward compatibility, if there are no results with usernames,
            // and this is the admin user, show all results
            return username === 'admin' && quizResults.every(r => !r.username);
        }
    });
    
    // Get all quizzes to match with results
    const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    
    // Get user's module progress (use async version from user-progress-script.js)
    let userProgress = await getUserProgress(username);
    const allModules = await getAllModules();
    
    // Add some test module progress data for admin user if none exists
    if (username === 'admin' && Object.keys(userProgress).length === 0) {
        const testModuleProgress = {
            'Fries': {
                completedTasks: 3,
                totalTasks: 5,
                progressPercentage: 60,
                checklist: [true, true, true, false, false]
            },
            'Nuggets': {
                completedTasks: 1,
                totalTasks: 4,
                progressPercentage: 25,
                checklist: [true, false, false, false]
            }
        };
        
        // Save test data to localStorage
        const userProgressKey = `userProgress_${username}`;
        localStorage.setItem(userProgressKey, JSON.stringify(testModuleProgress));
        userProgress = testModuleProgress;
        
        console.log('Added test module progress for admin user:', testModuleProgress);
    }
    
    // Calculate module progress statistics
    let moduleProgressStats = {
        totalAssigned: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        overallPercentage: 0
    };
    
    // Get module assignments for this user
    let moduleAssignments = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            const userId = user.id || user.user_id;
            if (userId) {
                moduleAssignments = await window.dbService.getModuleAssignments(userId);
            }
        }
    } catch (error) {
        console.error('Failed to load module assignments:', error);
    }
    
    // Process module progress
    const moduleProgressList = [];
    if (moduleAssignments.length > 0) {
        for (const assignment of moduleAssignments) {
            const module = allModules.find(m => m.id === assignment.module_id);
            if (module) {
                const progress = userProgress[module.title] || { completedTasks: 0, totalTasks: 0 };
                const progressPercentage = progress.totalTasks > 0 ? Math.round((progress.completedTasks / progress.totalTasks) * 100) : 0;
                
                moduleProgressList.push({
                    title: module.title,
                    progress: progressPercentage,
                    completedTasks: progress.completedTasks,
                    totalTasks: progress.totalTasks,
                    status: assignment.status,
                    dueDate: assignment.due_date
                });
                
                moduleProgressStats.totalAssigned++;
                if (progressPercentage === 100) {
                    moduleProgressStats.completed++;
                } else if (progressPercentage > 0) {
                    moduleProgressStats.inProgress++;
                } else {
                    moduleProgressStats.notStarted++;
                }
            }
        }
    } else {
        // Fallback: check localStorage progress data
        Object.keys(userProgress).forEach(moduleTitle => {
            const progress = userProgress[moduleTitle];
            if (progress && progress.totalTasks > 0) {
                const progressPercentage = Math.round((progress.completedTasks / progress.totalTasks) * 100);
                moduleProgressList.push({
                    title: moduleTitle,
                    progress: progressPercentage,
                    completedTasks: progress.completedTasks,
                    totalTasks: progress.totalTasks,
                    status: progressPercentage === 100 ? 'completed' : progressPercentage > 0 ? 'in_progress' : 'assigned'
                });
                
                moduleProgressStats.totalAssigned++;
                if (progressPercentage === 100) {
                    moduleProgressStats.completed++;
                } else if (progressPercentage > 0) {
                    moduleProgressStats.inProgress++;
                } else {
                    moduleProgressStats.notStarted++;
                }
            }
        });
    }
    
    // Calculate overall progress percentage
    if (moduleProgressStats.totalAssigned > 0) {
        moduleProgressStats.overallPercentage = Math.round((moduleProgressStats.completed / moduleProgressStats.totalAssigned) * 100);
    }
    
    // Create quiz scores HTML
    let quizScoresHtml = '';
    if (userQuizResults.length > 0) {
        const averageScore = Math.round(userQuizResults.reduce((sum, result) => sum + result.score, 0) / userQuizResults.length);
        const passedCount = userQuizResults.filter(result => result.passed).length;
        
        quizScoresHtml = `
            <div class="quiz-scores-section">
                <div class="section-header">
                    <h4><i class="fas fa-chart-line"></i> Quiz Performance</h4>
                    <div class="quiz-summary">
                        <span class="average-score">Average: ${averageScore}%</span>
                        <span class="passed-count">${passedCount}/${userQuizResults.length} Passed</span>
                    </div>
                </div>
                <div class="quiz-scores-list">
                    ${userQuizResults.map(result => {
                        const quiz = allQuizzes.find(q => q.id === result.quizId);
                        const quizTitle = quiz ? quiz.title : 'Unknown Quiz';
                        const passedClass = result.passed ? 'passed' : 'failed';
                        const passedText = result.passed ? 'Passed' : 'Failed';
                        
                        return `
                            <div class="quiz-score-item ${passedClass}">
                                <div class="quiz-score-info">
                                    <span class="quiz-title">${quizTitle}</span>
                                    <span class="quiz-date">${new Date(result.completedAt || result.dateTaken).toLocaleDateString()}</span>
                                </div>
                                <div class="quiz-score-details">
                                    <span class="score">${result.score}%</span>
                                    <span class="status ${passedClass}">${passedText}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } else {
        quizScoresHtml = `
            <div class="quiz-scores-section">
                <h4><i class="fas fa-chart-line"></i> Quiz Performance</h4>
                <div class="no-quiz-results">
                    <i class="fas fa-info-circle"></i>
                    <p>No quiz results found for this user.</p>
                </div>
            </div>
        `;
    }
    
    // Create module progress HTML
    let moduleProgressHtml = '';
    if (moduleProgressList.length > 0) {
        moduleProgressHtml = `
            <div class="module-progress-section">
                <div class="section-header">
                    <h4><i class="fas fa-tasks"></i> Module Progress</h4>
                    <div class="progress-summary">
                        <span class="overall-progress">${moduleProgressStats.overallPercentage}% Complete</span>
                        <span class="module-count">${moduleProgressStats.completed}/${moduleProgressStats.totalAssigned} Modules</span>
                    </div>
                </div>
                <div class="module-progress-list">
                    ${moduleProgressList.map(module => {
                        const statusClass = module.progress === 100 ? 'completed' : module.progress > 0 ? 'in-progress' : 'not-started';
                        const statusText = module.progress === 100 ? 'Completed' : module.progress > 0 ? 'In Progress' : 'Not Started';
                        
                        return `
                            <div class="module-progress-item ${statusClass}">
                                <div class="module-info">
                                    <span class="module-title">${module.title}</span>
                                    <span class="module-status">${statusText}</span>
                                </div>
                                <div class="module-progress-details">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${module.progress}%"></div>
                                    </div>
                                    <span class="progress-text">${module.completedTasks}/${module.totalTasks} tasks</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } else {
        moduleProgressHtml = `
            <div class="module-progress-section">
                <h4><i class="fas fa-tasks"></i> Module Progress</h4>
                <div class="no-module-progress">
                    <i class="fas fa-info-circle"></i>
                    <p>No module assignments found for this user.</p>
                </div>
            </div>
        `;
    }
    
    // Create user details modal content
    const modalContent = `
        <div class="user-details-modal">
            <div class="user-details-header">
                <div class="user-avatar">
                    <span>${userDisplayName}</span>
                </div>
                <div class="user-info">
                    <h3>${userFullName}</h3>
                    <p class="username">@${user.username}</p>
                    <span class="role-badge role-${user.role.toLowerCase().replace(' ', '-')}">${user.role}</span>
                </div>
            </div>
            
            <div class="user-details-content">
                <div class="user-stats">
                    <div class="stat-item">
                        <i class="fas fa-calendar"></i>
                        <span class="stat-label">Joined</span>
                        <span class="stat-value">${new Date(user.created_at || user.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-chart-bar"></i>
                        <span class="stat-label">Quizzes Taken</span>
                        <span class="stat-value">${userQuizResults.length}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-trophy"></i>
                        <span class="stat-label">Modules Assigned</span>
                        <span class="stat-value">${moduleProgressStats.totalAssigned}</span>
                    </div>
                </div>
                
                <div class="progress-sections-container">
                    <div class="progress-section-left">
                ${moduleProgressHtml}
                    </div>
                    <div class="progress-section-right">
                ${quizScoresHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal
    showDetailsModal(modalContent, `${userFullName} - Details`);
}

function showDetailsModal(content, title) {
    // Remove existing details modal if any
    const existingModal = document.getElementById('userDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHtml = `
        <div class="modal-overlay show" id="userDetailsModal">
            <div class="modal-content details-modal">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="closeDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeDetailsModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeDetailsModal() {
    const modal = document.getElementById('userDetailsModal');
    if (modal) {
        modal.remove();
    }
}

async function openUserModal(username) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSave = document.getElementById('modalSave');
    const users = await getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
        alert('User not found');
        return;
    }
    
    // Update modal title and button for editing
    modalTitle.textContent = 'Edit User';
    modalSave.textContent = 'Save Changes';
    
    // Populate form with user data
    document.getElementById('editFullName').value = user.full_name || user.fullName || '';
    document.getElementById('editUsername').value = user.username || '';
    document.getElementById('editPassword').value = user.password || (user.password_hash ? atob(user.password_hash) : '');
    document.getElementById('editRole').value = user.role || 'Team Member';
    document.getElementById('editStatus').value = user.status || 'active';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editStartDate').value = user.start_date || user.startDate || '';
    
    // Store current username for updates
    modal.dataset.currentUsername = username;
    
    // Show modal
    modal.classList.add('show');
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    modal.classList.remove('show');
    modal.dataset.currentUsername = '';
    
    // Clear form
    document.getElementById('userEditForm').reset();
}

function openNewUserModal() {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSave = document.getElementById('modalSave');
    
    
    if (!modal) {
        console.error('Modal not found!');
        return;
    }
    
    // Update modal title
    modalTitle.textContent = 'Add New User';
    modalSave.textContent = 'Create User';
    
    // Clear the form
    document.getElementById('userEditForm').reset();
    
    // Set modal to new user mode
    modal.dataset.currentUsername = '';
    
    // Show modal
    modal.classList.add('show');
}

async function saveUserChanges() {
    const modal = document.getElementById('userModal');
    const currentUsername = modal.dataset.currentUsername;
    
    // Get form data
    const formData = {
        fullName: document.getElementById('editFullName').value,
        username: document.getElementById('editUsername').value,
        password: document.getElementById('editPassword').value,
        role: document.getElementById('editRole').value,
        status: document.getElementById('editStatus').value,
        email: document.getElementById('editEmail').value,
        startDate: document.getElementById('editStartDate').value
    };
    
    // Validate required fields
    if (!formData.fullName || !formData.username || !formData.password || !formData.role) {
        showToast('error', 'Validation Error', 'Please fill in all required fields');
        return;
    }
    
    // Validate field formats
    const validationErrors = [];
    
    // Validate full name
    if (formData.fullName.length < 2 || formData.fullName.length > 100) {
        validationErrors.push('Full name must be between 2 and 100 characters');
    }
    
    // Validate username
    if (formData.username.length < 3 || formData.username.length > 50) {
        validationErrors.push('Username must be between 3 and 50 characters');
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
        validationErrors.push('Username can only contain letters, numbers, dots, underscores, and hyphens');
    }
    
    // Validate password
    if (formData.password.length < 6) {
        validationErrors.push('Password must be at least 6 characters long');
    }
    
    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        validationErrors.push('Please enter a valid email address');
    }
    
    // Validate role
    const validRoles = ['Admin', 'Director', 'Supervisor', 'Trainer', 'Assistant Supervisor', 'Team Member'];
    if (!validRoles.includes(formData.role)) {
        validationErrors.push('Please select a valid role');
    }
    
    // Validate status
    const validStatuses = ['active', 'inactive'];
    if (formData.status && !validStatuses.includes(formData.status)) {
        validationErrors.push('Please select a valid status');
    }
    
    // Validate start date if provided
    if (formData.startDate) {
        const startDate = new Date(formData.startDate);
        const today = new Date();
        if (startDate > today) {
            validationErrors.push('Start date cannot be in the future');
        }
    }
    
    if (validationErrors.length > 0) {
        showToast('error', 'Validation Error', validationErrors.join('<br>'));
        return;
    }
    
    const users = await getUsers();
    
    if (!currentUsername) {
        // Creating new user
        // Check if username already exists
        if (users.find(u => u.username === formData.username)) {
            alert('Username already exists. Please choose a different username.');
            return;
        }
        
        // Create new user object (matching database schema)
        const newUser = {
            full_name: formData.fullName,
            username: formData.username,
            password_hash: btoa(formData.password), // Base64 encode password
            role: formData.role,
            status: formData.status || 'active',
            email: formData.email || '',
            start_date: formData.startDate || new Date().toISOString().split('T')[0]
        };
        
        // Create localStorage-compatible user object for local storage
        const localStorageUser = {
            ...newUser,
            // Add localStorage compatibility fields
            fullName: formData.fullName,
            password: formData.password,
            startDate: formData.startDate || new Date().toISOString().split('T')[0],
            progress: 0,
            completedTasks: 0,
            totalTasks: 0
        };
        
        // Add new user to localStorage (use localStorage-compatible object)
        users.push(localStorageUser);
        
        // Save new user to database
        try {
            await window.dbService.createUser(newUser);
        } catch (error) {
            console.error('Failed to save new user to database:', error);
            showToast('error', 'Database Error', 'Failed to create user in database');
            return;
        }
        
        alert('New user created successfully!');
        closeUserModal();
        await loadUserData();
        return;
    }
    
    // Editing existing user
    const userIndex = users.findIndex(u => u.username === currentUsername);
    
    if (userIndex === -1) {
        alert('User not found');
        return;
    }
    
    // Update user data (mapping form fields to database schema)
    users[userIndex] = {
        ...users[userIndex],
        full_name: formData.fullName,
        username: formData.username,
        password_hash: btoa(formData.password), // Base64 encode password
        role: formData.role,
        status: formData.status || 'active',
        email: formData.email || '',
        start_date: formData.startDate || users[userIndex].start_date,
        // Keep localStorage fields for compatibility
        fullName: formData.fullName,
        password: formData.password,
        startDate: formData.startDate || users[userIndex].startDate
    };
    
    // Save updated user to database
    try {
        // Create database-compatible user object (only include fields that exist in database schema)
        const dbUserData = {
            full_name: formData.fullName,
            username: formData.username,
            password_hash: btoa(formData.password),
            role: formData.role,
            email: formData.email || '',
            start_date: formData.startDate || users[userIndex].start_date
        };
        
        await window.dbService.updateUser(users[userIndex].id, dbUserData);
    } catch (error) {
        console.error('Failed to update user in database:', error);
        showToast('error', 'Database Error', 'Failed to update user in database');
        return;
    }
    
    // Refresh the table
    await loadUserData();
    
    // Close modal
    closeUserModal();
    
    // Show success message
    alert('User updated successfully!');
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Utility function to get users from database
async function getUsers() {
    try {
        if (window.dbService && window.dbService.isConfigured) {
            return await window.dbService.getUsers();
        }
        return [];
    } catch (error) {
        console.error('Failed to get users from database:', error);
        return [];
    }
}

// Utility function to get all users (alias for getUsers)
async function getAllUsers() {
    return await getUsers();
}

// Utility function to get all modules
async function getAllModules() {
    try {
        if (window.dbService && window.dbService.isConfigured) {
            return await window.dbService.getModules();
        }
        return [];
    } catch (error) {
        console.error('Failed to get modules from database:', error);
        return [];
    }
}

// Utility function to save users to database
async function saveUsers(users) {
    try {
        // Save to database
        for (const user of users) {
            if (user.id) {
                // Update existing user - create database-compatible object
                const dbUserData = {
                    full_name: user.full_name || user.fullName,
                    username: user.username,
                    password_hash: user.password_hash || btoa(user.password || ''),
                    role: user.role,
                    email: user.email || '',
                    start_date: user.start_date || user.startDate
                };
                await window.dbService.updateUser(user.id, dbUserData);
            } else {
                // Create new user - create database-compatible object
                const dbUserData = {
                    full_name: user.full_name || user.fullName,
                    username: user.username,
                    password_hash: user.password_hash || btoa(user.password || ''),
                    role: user.role,
                    email: user.email || '',
                    start_date: user.start_date || user.startDate
                };
                await window.dbService.createUser(dbUserData);
            }
        }
    } catch (error) {
        console.error('Failed to save users to database:', error);
        throw error;
    }
}


// Initialize default users if none exist
async function initializeDefaultUsers() {
    try {
        if (window.dbService && window.dbService.isConfigured) {
            const existingUsers = await window.dbService.getUsers();
            
            if (existingUsers.length === 0) {
                const defaultUsers = [
                    {
                        username: 'admin',
                        fullName: 'Admin User',
                        password: 'admin123',
                        role: 'Admin',
                        status: 'active',
                        email: 'admin@company.com',
                        startDate: '2024-01-01'
                    },
                    {
                        username: 'john.doe',
                        fullName: 'John Doe',
                        password: 'password123',
                        role: 'Director',
                        status: 'active',
                        email: 'john.doe@company.com',
                        startDate: '2024-01-15'
                    },
                    {
                        username: 'jane.smith',
                        fullName: 'Jane Smith',
                        password: 'password123',
                        role: 'Supervisor',
                        status: 'active',
                        email: 'jane.smith@company.com',
                        startDate: '2024-02-01'
                    },
                    {
                        username: 'mike.wilson',
                        fullName: 'Mike Wilson',
                        password: 'password123',
                        role: 'Team Member',
                        status: 'active',
                        email: 'mike.wilson@company.com',
                        startDate: '2024-02-15'
                    },
                    {
                        username: 'sarah.jones',
                        fullName: 'Sarah Jones',
                        password: 'password123',
                        role: 'Team Member',
                        status: 'active',
                        email: 'sarah.jones@company.com',
                        startDate: '2024-03-01'
                    }
                ];
                
                // Create default users in database
                for (const user of defaultUsers) {
                    await window.dbService.createUser(user);
                }
            } else {
            }
        }
    } catch (error) {
        console.error('Failed to initialize default users:', error);
    }
}


// Utility function to calculate overall progress for a user
async function calculateUserOverallProgress(username) {
    try {
        const userProgress = await getUserProgress(username);
        
        // Get user's role from cached data or database
        let users = window.cachedUsers;
        if (!users) {
        try {
            if (window.dbService && window.dbService.isConfigured) {
                users = await window.dbService.getUsers();
                    window.cachedUsers = users;
            } else {
                users = JSON.parse(localStorage.getItem('users') || '[]');
            }
        } catch (error) {
                console.error('Failed to get users for progress calculation:', error);
                users = [];
            }
        }
        
    const user = users.find(u => u.username === username);
    const userRole = user ? user.role : 'Team Member';
    
    let totalTasks = 0;
    let completedTasks = 0;
    
        // Get all module titles from database or localStorage
    let moduleTitles = [];
        try {
            if (window.dbService && window.dbService.isConfigured) {
                const dbModules = await window.dbService.getModules();
                if (dbModules && dbModules.length > 0) {
                    moduleTitles = dbModules.map(m => m.title);
                }
            }
        } catch (error) {
            console.error('Failed to load modules for progress calculation:', error);
        }
        
        // Fallback to localStorage if no modules from database
        if (moduleTitles.length === 0) {
            const globalModules = localStorage.getItem('globalModules');
    if (globalModules) {
        const modules = JSON.parse(globalModules);
        moduleTitles = modules.map(m => m.title);
    } else {
        // Fallback to default module titles
        moduleTitles = [
            'Communication Skills', 'Team Leadership', 'Decision Making',
            'Conflict Resolution', 'Strategic Planning', 'Performance Management'
        ];
            }
    }
    
        for (const moduleTitle of moduleTitles) {
        const moduleData = getModuleData(moduleTitle);
        
            if (moduleData && moduleData.checklist) {
            totalTasks += moduleData.checklist.length;
            const moduleProgress = userProgress[moduleTitle];
            
            if (moduleProgress && moduleProgress.checklist) {
                // Count completed tasks (true values in the checklist array)
                const completedInModule = moduleProgress.checklist.filter(item => item === true).length;
                completedTasks += completedInModule;
            }
        }
        }
    
    return {
        totalTasks,
        completedTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
    } catch (error) {
        console.error('Error calculating user overall progress:', error);
        return {
            totalTasks: 0,
            completedTasks: 0,
            percentage: 0
        };
    }
}

// Utility function to get user's progress data (async version that syncs with database)
async function getUserProgress(username) {
    // Initialize userProgress object
    let userProgress = {};
    
    console.log('Admin Overview - getUserProgress called with username:', username);
    
    try {
        if (window.dbService && window.dbService.isConfigured) {
            // Use cached users data if available, otherwise fetch from database
            let users = window.cachedUsers;
            if (!users) {
                users = await window.dbService.getUsers();
                window.cachedUsers = users;
            }
            const user = users.find(u => u.username === username);
            
            if (user) {
                // Get progress from database
                const dbProgress = await window.dbService.getUserProgress(user.id);
                console.log('Admin Overview - Database progress for user:', user.username, dbProgress);
                
                // Get modules from database
                const modules = await window.dbService.getModules();
                
                dbProgress.forEach(p => {
                    // Find module title by ID
                    const module = modules.find(m => m.id === p.module_id);
                    if (module) {
                        userProgress[module.title] = {
                            completedTasks: p.completed_tasks || 0,
                            totalTasks: p.total_tasks || 0,
                            progressPercentage: p.progress_percentage || 0,
                            checklist: Array(p.total_tasks || 0).fill(false).map((_, i) => i < (p.completed_tasks || 0))
                        };
                    }
                });
                
                // Store in localStorage for compatibility
                const userProgressKey = `userProgress_${username}`;
                localStorage.setItem(userProgressKey, JSON.stringify(userProgress));
                
                console.log('Admin Overview - Final userProgress object:', userProgress);
            }
        } else {
            // Fallback to localStorage
            const userProgressKey = `userProgress_${username}`;
            const storedProgress = localStorage.getItem(userProgressKey);
            if (storedProgress) {
                userProgress = JSON.parse(storedProgress);
            }
        }
    } catch (error) {
        console.error('Admin Overview - Failed to get user progress:', error);
        // Fallback to localStorage
        const userProgressKey = `userProgress_${username}`;
        const storedProgress = localStorage.getItem(userProgressKey);
        if (storedProgress) {
            userProgress = JSON.parse(storedProgress);
        }
    }
    
    return userProgress;
}

// Utility function to get module data (simplified version for admin overview)
function getModuleData(moduleTitle) {
    // Get modules from global storage
    const globalModules = localStorage.getItem('globalModules');
    
    if (!globalModules) {
        // Return null if no global modules exist
        return null;
    }
    
    const modules = JSON.parse(globalModules);
    const module = modules.find(m => m.title === moduleTitle);
    
    if (!module) {
        return null;
    }
    
    // Return module data in the format expected by progress calculation
    return {
        title: module.title,
        description: module.description,
        checklist: module.checklist
    };
}

// Tab navigation setup
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab content
            const allTabContents = document.querySelectorAll('.tab-content');
            allTabContents.forEach(content => content.classList.remove('active'));
            
            // Show the corresponding tab content
            const tabId = this.id;
            const contentId = tabId + 'Content';
            const targetContent = document.getElementById(contentId);
            
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Load specific content based on tab
                switch(tabId) {
                    case 'userManagement':
                        showUserManagementContent();
                        break;
                    case 'pathManagement':
                        showPathManagementContent();
                        break;
                    case 'roleManagement':
                        showRoleManagementContent();
                        break;
                    case 'reports':
                        showReportsContent();
                        break;
                    case 'settings':
                        // Settings content is already in HTML
                        break;
                }
            }
        });
    });
}

// Content switching functions
function showUserManagementContent() {
    // User management content is now handled by tab switching
    // This function can be used for any additional setup needed
    console.log('User Management content shown');
}

async function showPathManagementContent() {
    try {
        // Path management content is now handled by tab switching
        console.log('Path Management content shown');
        
        // Load modules data when showing path management
        try {
            await loadModulesData();
        } catch (error) {
            console.error('Error in loadModulesData:', error);
        }
        
        // Setup search and filter functionality
        setupSearchAndFilter();
    } catch (error) {
        console.error('Error in showPathManagementContent:', error);
    }
}

async function showRoleManagementContent() {
    try {
        // Role management content is now handled by tab switching
        console.log('Role Management content shown');
            
            // Load role management data
            try {
                await loadRoleManagementData();
        } catch (error) {
                console.error('Error in loadRoleManagementData:', error);
        }
    } catch (error) {
        console.error('Error in showRoleManagementContent:', error);
    }
}

// Global variables for search and filter
let allModules = [];
let filteredModules = [];

// Function to setup search and filter functionality
function setupSearchAndFilter() {
    const searchInput = document.getElementById('moduleSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const statusFilter = document.getElementById('statusFilter');
    const phaseFilter = document.getElementById('phaseFilter');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const resultsCount = document.getElementById('resultsCount');

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    // Filter functionality
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }

    if (phaseFilter) {
        phaseFilter.addEventListener('change', handleFilter);
    }

    // Clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Handle search
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Show/hide clear search button
        if (searchTerm) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }

        applyFiltersAndSearch();
    }

    // Handle filter changes
    function handleFilter() {
        applyFiltersAndSearch();
    }

    // Apply both filters and search
    function applyFiltersAndSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;
        const phaseValue = phaseFilter.value;

        filteredModules = allModules.filter(module => {
            // Search filter
            const matchesSearch = !searchTerm || 
                module.title.toLowerCase().includes(searchTerm) ||
                module.description.toLowerCase().includes(searchTerm);

            // Status filter
            const matchesStatus = !statusValue || module.status === statusValue;

            // Phase filter
            const matchesPhase = !phaseValue || module.phase === phaseValue;

            return matchesSearch && matchesStatus && matchesPhase;
        });

        // Update results count
        if (searchResultsInfo && resultsCount) {
            if (searchTerm || statusValue || phaseValue) {
                resultsCount.textContent = filteredModules.length;
                searchResultsInfo.style.display = 'block';
            } else {
                searchResultsInfo.style.display = 'none';
            }
        }

        // Re-render modules with filtered data
        renderModulesGrid(filteredModules);
    }

    // Clear search
    function clearSearch() {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        applyFiltersAndSearch();
    }

    // Clear all filters
    function clearFilters() {
        searchInput.value = '';
        statusFilter.value = '';
        phaseFilter.value = '';
        clearSearchBtn.style.display = 'none';
        searchResultsInfo.style.display = 'none';
        applyFiltersAndSearch();
    }
}

// Function to render modules grid with provided modules
function renderModulesGrid(modules) {
        const modulesGrid = document.getElementById('modulesManagementGrid');
    if (!modulesGrid) return;

    if (modules.length === 0) {
        modulesGrid.innerHTML = `
            <div class="no-modules-message">
                <i class="fas fa-search"></i>
                <h3>No modules found</h3>
                <p>Try adjusting your search terms or filters</p>
            </div>
        `;
            return;
        }
        
        const modulesHTML = modules.map(module => {
        // Count tasks with files - handle case where checklist might be undefined
        const tasksWithFiles = (module.checklist || []).filter(task => {
                if (typeof task === 'string') return false;
                return task.file && task.file.trim() !== '';
            }).length;
            
            return `
                <div class="module-management-card">
                    <div class="module-management-header">
                        <h3 class="module-management-title">${module.title}</h3>
                        <span class="module-management-phase">${module.phase || module.difficulty || 'Phase 1'}</span>
                        <span class="module-management-status ${module.status || 'active'}">${(module.status || 'active').replace('-', ' ')}</span>
                    </div>
                    <div class="module-management-stats">
                    <div class="module-management-tasks">${(module.checklist || []).length} learning tasks</div>
                        ${tasksWithFiles > 0 ? `<div class="module-management-files"><i class="fas fa-file"></i> ${tasksWithFiles} tasks with files</div>` : ''}
                    </div>
                    <div class="module-management-actions">
                        <button class="btn btn-secondary" onclick="editModule('${module.title}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteModule('${module.title}')">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        modulesGrid.innerHTML = modulesHTML;
}

// Path Management Functions (copied from admin-path-management-script.js)
async function loadModulesData() {
    try {
        console.log('🔄 Loading modules data...');
        
        // Try to load from database first
        let modules = [];
        try {
            if (window.dbService && window.dbService.isConfigured) {
                console.log('📡 Fetching modules from database...');
                const dbModules = await window.dbService.getModules();
                console.log('📡 Database modules received:', dbModules);
                if (dbModules && dbModules.length > 0) {
                    // Load checklist items for each module
                    for (let module of dbModules) {
                        try {
                            const checklistItems = await window.dbService.getModuleChecklist(module.id);
                            if (checklistItems && checklistItems.length > 0) {
                                // Convert database checklist items to the format expected by the UI
                                module.checklist = checklistItems.map((item, index) => {
                                    const taskObj = {
                                        description: item.task_text,
                                        task: item.task_text
                                    };
                                    
                                    // Restore file data from localStorage (backup storage)
                                    const fileDataKey = `module_${module.id}_task_${index}_files`;
                                    const storedFileData = localStorage.getItem(fileDataKey);
                                    if (storedFileData) {
                                        try {
                                            taskObj.files = JSON.parse(storedFileData);
                                            console.log(`📁 Restored file data from localStorage: ${fileDataKey}`);
                                        } catch (error) {
                                            console.warn('Failed to parse file data from localStorage:', error);
                                        }
                                    }
                                    
                                    return taskObj;
                                });
                            } else {
                                module.checklist = [];
                            }
                        } catch (error) {
                            console.warn(`Failed to load checklist for module ${module.title}:`, error);
                            module.checklist = [];
                        }
                    }
                    
                    modules = dbModules;
                    
                    // Store in localStorage for compatibility
                    localStorage.setItem('globalModules', JSON.stringify(dbModules));
                    console.log('💾 Modules with checklists stored in localStorage');
                }
            }
        } catch (error) {
            console.warn('Failed to load modules from database, using localStorage:', error);
        }
        
        // Fallback to localStorage if database failed
        if (modules.length === 0) {
            console.log('📦 Using localStorage fallback...');
            // Initialize global modules if they don't exist
            initializeGlobalModules();
            modules = getAllModules();
            console.log('📦 localStorage modules:', modules);
        }
        
        // Store modules in global variables for search/filter
        allModules = modules;
        filteredModules = modules;
        
        // Render modules using the new function
        renderModulesGrid(modules);
        console.log('📊 Total modules loaded:', modules.length);
    } catch (error) {
        console.error('Error in loadModulesData:', error);
    }
}

function initializeGlobalModules() {
    // Check if global modules already exist
    const globalModules = localStorage.getItem('globalModules');
    if (!globalModules) {
        // Initialize with default modules
        const defaultModules = [
            {
                title: 'Communication Skills',
                description: 'Learn effective communication techniques for leaders. This module covers verbal and non-verbal communication, active listening, and how to deliver clear, impactful messages to your team.',
                status: 'active',
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
                description: 'Master the fundamentals of leading teams effectively. Learn about team dynamics, motivation techniques, and how to build a cohesive, high-performing team.',
                status: 'active',
                checklist: [
                    'Watch team dynamics overview video',
                    'Complete team assessment questionnaire',
                    'Read "Building Trust in Teams" guide',
                    'Practice conducting a team meeting',
                    'Submit team leadership action plan'
                ]
            },
            {
                title: 'Decision Making',
                description: 'Develop critical thinking and decision-making skills. Learn frameworks for making sound decisions under pressure and how to involve your team in the decision-making process.',
                status: 'active',
                checklist: [
                    'Complete decision-making framework training',
                    'Practice using decision matrix tool',
                    'Read case studies on complex decisions',
                    'Complete decision-making simulation'
                ]
            },
            {
                title: 'Conflict Resolution',
                description: 'Learn to handle and resolve workplace conflicts effectively. Develop skills for mediating disputes and creating a positive work environment.',
                status: 'active',
                checklist: [
                    'Complete conflict resolution basics video',
                    'Read "Mediation Techniques" guide',
                    'Practice conflict resolution scenarios',
                    'Submit conflict resolution case study'
                ]
            },
            {
                title: 'Strategic Planning',
                description: 'Understand how to create and execute strategic plans. Learn about goal setting, resource allocation, and measuring success.',
                status: 'active',
                checklist: [
                    'Complete strategic planning fundamentals',
                    'Learn about SMART goal setting',
                    'Practice creating a strategic plan',
                    'Submit strategic planning exercise'
                ]
            },
            {
                title: 'Performance Management',
                description: 'Learn to manage and improve team performance. Develop skills for setting expectations, providing feedback, and conducting performance reviews.',
                status: 'active',
                checklist: [
                    'Complete performance management overview',
                    'Learn about feedback techniques',
                    'Practice conducting performance review',
                    'Submit performance management plan'
                ]
            }
        ];
        
        // Save default modules to global storage
        localStorage.setItem('globalModules', JSON.stringify(defaultModules));
    } else {
    }
}

function getAllModules() {
    const globalModules = localStorage.getItem('globalModules');
    if (!globalModules) {
        return [];
    }
    return JSON.parse(globalModules);
}

function editModule(moduleTitle) {
    openModuleModal(moduleTitle);
}

async function deleteModule(moduleTitle) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the module "${moduleTitle}"?\n\nThis action cannot be undone and will remove the module from all user accounts.`)) {
        return;
    }
    
    try {
        // Delete from database first
        if (window.dbService && window.dbService.isConfigured) {
            // Get the module ID from the database
            const modules = await window.dbService.getModules();
            const module = modules.find(m => m.title === moduleTitle);
            
            if (module && module.id) {
                await window.dbService.deleteModule(module.id);
            } else {
                console.warn(`Module "${moduleTitle}" not found in database`);
            }
        }
        
        // Also remove from localStorage for fallback
        const modules = getAllModules();
        const moduleIndex = modules.findIndex(m => m.title === moduleTitle);
        
        if (moduleIndex !== -1) {
            modules.splice(moduleIndex, 1);
    localStorage.setItem('globalModules', JSON.stringify(modules));
        }
    
        // Reload modules data to refresh the UI
    await loadModulesData();
    
    // Show success message
    showToast('success', 'Module Deleted', `Module "${moduleTitle}" has been deleted successfully!`);
        
    } catch (error) {
        console.error('Failed to delete module:', error);
        showToast('error', 'Delete Failed', `Failed to delete module "${moduleTitle}": ${error.message || 'Unknown error'}`);
    }
}

function openModuleModal(moduleTitle) {
    const modal = document.getElementById('moduleModal');
    const modalTitle = document.getElementById('modalModuleTitle');
    const titleInput = document.getElementById('editModuleTitle');
    const descriptionInput = document.getElementById('editModuleDescription');
    const statusSelect = document.getElementById('editModuleStatus');
    const roleSelect = document.getElementById('editModuleRole');
    const checklistContainer = document.getElementById('modalChecklist');
    
    if (!modal) return;
    
    // Set modal title
    if (modalTitle) {
        modalTitle.textContent = moduleTitle === 'new' ? 'Add New Module' : 'Edit Module';
    }
    
    if (moduleTitle === 'new') {
        // Clear form for new module
        if (titleInput) titleInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        if (statusSelect) statusSelect.value = 'active';
        if (roleSelect) roleSelect.value = 'Team Member';
        document.getElementById('editModuleDifficulty').value = 'Phase 1';
        document.getElementById('editModuleDuration').value = '';
        document.getElementById('editModulePrerequisites').value = '';
        document.getElementById('editModuleTags').value = '';
        document.getElementById('editModuleQualityUnsatisfactory').value = '';
        document.getElementById('editModuleQualityAverage').value = '';
        document.getElementById('editModuleQualityExcellent').value = '';
        document.getElementById('editModuleSpeedUnsatisfactory').value = '';
        document.getElementById('editModuleSpeedAverage').value = '';
        document.getElementById('editModuleSpeedExcellent').value = '';
        document.getElementById('editModuleCommunicationUnsatisfactory').value = '';
        document.getElementById('editModuleCommunicationAverage').value = '';
        document.getElementById('editModuleCommunicationExcellent').value = '';
        document.getElementById('editModuleAuthor').value = '';
        document.getElementById('editModuleVersion').value = '1.0';
        if (checklistContainer) checklistContainer.innerHTML = '';
    } else {
        // Populate form with existing module data
        const modules = getAllModules();
        const module = modules.find(m => m.title === moduleTitle);
        
        if (module) {
            if (titleInput) titleInput.value = module.title;
            if (descriptionInput) descriptionInput.value = module.description;
            if (statusSelect) statusSelect.value = module.status || 'active';
            document.getElementById('editModuleDifficulty').value = module.difficulty || 'Phase 1';
            document.getElementById('editModuleDuration').value = module.duration || '';
            document.getElementById('editModulePrerequisites').value = module.prerequisites || '';
            document.getElementById('editModuleTags').value = module.tags || '';
            document.getElementById('editModuleQualityUnsatisfactory').value = module.qualityUnsatisfactory || module.quality_unsatisfactory || '';
            document.getElementById('editModuleQualityAverage').value = module.qualityAverage || module.quality_average || '';
            document.getElementById('editModuleQualityExcellent').value = module.qualityExcellent || module.quality_excellent || '';
            document.getElementById('editModuleSpeedUnsatisfactory').value = module.speedUnsatisfactory || module.speed_unsatisfactory || '';
            document.getElementById('editModuleSpeedAverage').value = module.speedAverage || module.speed_average || '';
            document.getElementById('editModuleSpeedExcellent').value = module.speedExcellent || module.speed_excellent || '';
            document.getElementById('editModuleCommunicationUnsatisfactory').value = module.communicationUnsatisfactory || module.communication_unsatisfactory || '';
            document.getElementById('editModuleCommunicationAverage').value = module.communicationAverage || module.communication_average || '';
            document.getElementById('editModuleCommunicationExcellent').value = module.communicationExcellent || module.communication_excellent || '';
            document.getElementById('editModuleAuthor').value = module.author || '';
            document.getElementById('editModuleVersion').value = module.version || '1.0';
            
            // Populate checklist
            if (checklistContainer) {
                const checklistHTML = (module.checklist || []).map((task, index) => {
                    // Handle both old string format and new object format
                    const taskDescription = typeof task === 'string' ? task : (task.description || '');
                    const taskFile = typeof task === 'object' ? (task.file || '') : '';
                    
                    // Handle both old single file format and new multiple files format
                    const files = typeof task === 'object' && task.files ? task.files : (taskFile ? [taskFile] : []);
                    
                    return `
                        <div class="checklist-item">
                            <div class="task-number-header">Task ${index + 1}</div>
                            <input type="text" class="checklist-task-input" value="${taskDescription}" placeholder="Enter task description">
                            <button type="button" class="add-file-btn" onclick="toggleFileSection(this)">
                                <i class="fas fa-plus"></i>
                                ${files.length > 0 ? `Show Files (${files.length} attached)` : 'Add Files'}
                            </button>
                            <div class="checklist-file-section ${files.length > 0 ? 'show' : ''}">
                                <input type="text" class="checklist-file-input" placeholder="File name or URL (optional)">
                                <input type="file" class="checklist-file-upload" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mp3" onchange="handleFileUpload(this, ${index})" multiple>
                                <div class="checklist-files-list" id="files-list-${index}">
                                    ${files.map((file, fileIndex) => {
                                        const fileName = typeof file === 'object' ? file.name : file;
                                        const fileContent = typeof file === 'object' ? file.content : null;
                                        return `
                                        <div class="checklist-file-item" ${fileContent ? `data-file-content="${fileContent}"` : ''}>
                                            <div class="checklist-file-item-info">
                                                <i class="fas fa-file"></i>
                                                <span>${fileName}</span>
                                            </div>
                                            <button type="button" class="checklist-file-item-remove" onclick="removeFileFromTask(${index}, ${fileIndex})">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    `;
                                    }).join('')}
                                </div>
                            </div>
                            <div class="checklist-actions">
                                <button type="button" class="checklist-remove-btn" onclick="removeChecklistItem(this)">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
                checklistContainer.innerHTML = checklistHTML;
                
                // Ensure Chrome compatibility for existing file inputs
                setTimeout(() => {
                    ensureChromeFileInputCompatibility();
                }, 100);
            }
        }
    }
    
    // Store current module for updates
    modal.dataset.currentModule = moduleTitle;
    
    // Show modal
    modal.classList.add('show');
}

function closeModuleModal() {
    const modal = document.getElementById('moduleModal');
    if (modal) {
        modal.classList.remove('show');
        modal.dataset.currentModule = '';
    }
}


async function saveModuleChanges() {
    const modal = document.getElementById('moduleModal');
    const currentModule = modal.dataset.currentModule;

    if (!currentModule) {
        alert('No module selected');
        return;
    }

    // Get form data
    const title = document.getElementById('editModuleTitle').value;
    const description = document.getElementById('editModuleDescription').value;
    const status = document.getElementById('editModuleStatus').value;
    const difficulty = document.getElementById('editModuleDifficulty').value;
    const duration = document.getElementById('editModuleDuration').value || 1;
    const prerequisites = document.getElementById('editModulePrerequisites').value;
    const tags = document.getElementById('editModuleTags').value;
    const qualityUnsatisfactory = document.getElementById('editModuleQualityUnsatisfactory').value;
    const qualityAverage = document.getElementById('editModuleQualityAverage').value;
    const qualityExcellent = document.getElementById('editModuleQualityExcellent').value;
    const speedUnsatisfactory = document.getElementById('editModuleSpeedUnsatisfactory').value;
    const speedAverage = document.getElementById('editModuleSpeedAverage').value;
    const speedExcellent = document.getElementById('editModuleSpeedExcellent').value;
    const communicationUnsatisfactory = document.getElementById('editModuleCommunicationUnsatisfactory').value;
    const communicationAverage = document.getElementById('editModuleCommunicationAverage').value;
    const communicationExcellent = document.getElementById('editModuleCommunicationExcellent').value;
    const author = document.getElementById('editModuleAuthor').value;
    const version = document.getElementById('editModuleVersion').value;
    
    // Debug rubric data
    console.log('📊 Rubric data collected:', {
        qualityUnsatisfactory,
        qualityAverage,
        qualityExcellent,
        speedUnsatisfactory,
        speedAverage,
        speedExcellent,
        communicationUnsatisfactory,
        communicationAverage,
        communicationExcellent
    });
    
    // Get checklist data
    const checklistItems = document.querySelectorAll('.checklist-item');
    const checklist = Array.from(checklistItems)
        .map(item => {
            const taskInput = item.querySelector('.checklist-task-input');
            const fileInput = item.querySelector('.checklist-file-input');
            const taskDescription = taskInput ? taskInput.value.trim() : '';
            const taskFile = fileInput ? fileInput.value.trim() : '';
            
            // Get all files from the files list
            const filesList = item.querySelector('.checklist-files-list');
            const fileItems = filesList ? filesList.querySelectorAll('.checklist-file-item') : [];
            const files = Array.from(fileItems).map(fileItem => {
                const fileSpan = fileItem.querySelector('span');
                const fileName = fileSpan ? fileSpan.textContent.trim() : '';
                const fileContent = fileItem.getAttribute('data-file-content');
                
                if (fileName && fileContent) {
                    return {
                        name: fileName,
                        content: fileContent
                    };
                } else if (fileName) {
                    return fileName; // Fallback for files without content
                }
                return null;
            }).filter(file => file !== null);
            
            // Add manual file input if it has a value
            if (taskFile) {
                files.push(taskFile);
            }
            
            if (taskDescription) {
                return files.length > 0 ? { description: taskDescription, files: files } : taskDescription;
            }
            return null;
        })
        .filter(task => task !== null);

    // Validate required fields
    const validationErrors = [];
    
    if (!title || title.trim().length === 0) {
        validationErrors.push('Module title is required');
    } else if (title.length > 200) {
        validationErrors.push('Module title must be 200 characters or less');
    }
    
    if (!description || description.trim().length === 0) {
        validationErrors.push('Module description is required');
    } else if (description.length > 1000) {
        validationErrors.push('Module description must be 1000 characters or less');
    }
    
    if (checklist.length === 0) {
        validationErrors.push('At least one task is required');
    }
    
    // Validate duration if provided
    if (duration && (isNaN(duration) || duration <= 0 || duration > 40)) {
        validationErrors.push('Duration must be a number between 0.5 and 40 hours');
    }
    
    // Validate version format
    if (version && !/^\d+\.\d+$/.test(version)) {
        validationErrors.push('Version must be in format X.Y (e.g., 1.0, 2.1)');
    }
    
    
    // Validate status
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
        validationErrors.push('Please select a valid status');
    }
    
    // Validate difficulty
    const validDifficulties = ['Phase 1', 'Phase 2', 'Phase 3', 'Advanced'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
        validationErrors.push('Please select a valid difficulty level');
    }
    
    if (validationErrors.length > 0) {
        showToast('error', 'Validation Error', validationErrors.join('<br>'));
        return;
    }

    // Save to global storage
    const modules = getAllModules();
    const moduleIndex = modules.findIndex(m => m.title === currentModule);

    if (currentModule === 'new') {
        // Add new module
        modules.push({
            title,
            description,
            status,
            requiredRole: 'Team Member', // Default role since we removed role-based functionality
            difficulty,
            duration: parseInt(duration) || 1,
            prerequisites,
            tags,
            qualityUnsatisfactory,
            qualityAverage,
            qualityExcellent,
            speedUnsatisfactory,
            speedAverage,
            speedExcellent,
            communicationUnsatisfactory,
            communicationAverage,
            communicationExcellent,
            author,
            version,
            checklist,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        });
    } else {
        // Update existing module
        if (moduleIndex !== -1) {
            modules[moduleIndex] = {
                ...modules[moduleIndex], // Preserve existing data
                title,
                description,
                status,
                requiredRole: modules[moduleIndex].requiredRole || 'Team Member', // Preserve existing or default
                difficulty,
                duration,
                prerequisites,
                tags,
                qualityUnsatisfactory,
                qualityAverage,
                qualityExcellent,
                speedUnsatisfactory,
                speedAverage,
                speedExcellent,
                communicationUnsatisfactory,
                communicationAverage,
                communicationExcellent,
                author,
                version,
                checklist,
                lastUpdated: new Date().toISOString()
            };
        }
    }

    // Save to database first, then localStorage
    try {
        if (moduleIndex >= 0) {
            // Update existing module
            const updatedModule = modules[moduleIndex];
            console.log('Updating module:', updatedModule.title, 'with ID:', updatedModule.id);
            
            // Update the module with form data including rubric fields
            updatedModule.title = title;
            updatedModule.description = description;
            updatedModule.status = status;
            updatedModule.difficulty = difficulty;
            updatedModule.duration = parseInt(duration) || 1;
            updatedModule.prerequisites = prerequisites;
            updatedModule.tags = tags;
            updatedModule.author = author;
            updatedModule.version = version;
            updatedModule.qualityUnsatisfactory = qualityUnsatisfactory;
            updatedModule.qualityAverage = qualityAverage;
            updatedModule.qualityExcellent = qualityExcellent;
            updatedModule.speedUnsatisfactory = speedUnsatisfactory;
            updatedModule.speedAverage = speedAverage;
            updatedModule.speedExcellent = speedExcellent;
            updatedModule.communicationUnsatisfactory = communicationUnsatisfactory;
            updatedModule.communicationAverage = communicationAverage;
            updatedModule.communicationExcellent = communicationExcellent;
            updatedModule.checklist = checklist;
            
            // Remove checklist from database update - it's handled separately
            const { checklist: _, ...moduleForDatabase } = updatedModule;
            // Convert camelCase to snake_case for database
            const dbModule = {
                ...moduleForDatabase,
                required_role: moduleForDatabase.requiredRole || 'Team Member',
                quality_unsatisfactory: moduleForDatabase.qualityUnsatisfactory,
                quality_average: moduleForDatabase.qualityAverage,
                quality_excellent: moduleForDatabase.qualityExcellent,
                speed_unsatisfactory: moduleForDatabase.speedUnsatisfactory,
                speed_average: moduleForDatabase.speedAverage,
                speed_excellent: moduleForDatabase.speedExcellent,
                communication_unsatisfactory: moduleForDatabase.communicationUnsatisfactory,
                communication_average: moduleForDatabase.communicationAverage,
                communication_excellent: moduleForDatabase.communicationExcellent,
                updated_at: new Date().toISOString()
            };
            // Remove camelCase versions
            delete dbModule.requiredRole;
            delete dbModule.qualityUnsatisfactory;
            delete dbModule.qualityAverage;
            delete dbModule.qualityExcellent;
            delete dbModule.speedUnsatisfactory;
            delete dbModule.speedAverage;
            delete dbModule.speedExcellent;
            delete dbModule.communicationUnsatisfactory;
            delete dbModule.communicationAverage;
            delete dbModule.communicationExcellent;
            delete dbModule.lastUpdated;
            delete dbModule.createdAt;
            
            console.log('Sending to database:', dbModule);
            console.log('📊 Rubric fields in database object:', {
                quality_unsatisfactory: dbModule.quality_unsatisfactory,
                quality_average: dbModule.quality_average,
                quality_excellent: dbModule.quality_excellent,
                speed_unsatisfactory: dbModule.speed_unsatisfactory,
                speed_average: dbModule.speed_average,
                speed_excellent: dbModule.speed_excellent,
                communication_unsatisfactory: dbModule.communication_unsatisfactory,
                communication_average: dbModule.communication_average,
                communication_excellent: dbModule.communication_excellent
            });
            const result = await window.dbService.updateModule(updatedModule.id || updatedModule.title, dbModule);
            console.log('Database update result:', result);
            
            // Save checklist items to module_checklist table
            if (checklist && checklist.length > 0) {
                console.log('💾 Saving checklist items:', checklist);
                try {
                    // First, delete existing checklist items for this module
                    await window.dbService.deleteModuleChecklist(updatedModule.id);
                    
                    // Then, add the new checklist items
                    for (let i = 0; i < checklist.length; i++) {
                        const task = checklist[i];
                        const taskData = {
                            module_id: updatedModule.id,
                            order_index: i + 1,
                            task_text: typeof task === 'string' ? task : (task.description || task.task || '')
                        };
                        
                        // Store file data in localStorage as backup (until we add file_data column to database)
                        if (typeof task === 'object' && task.files && task.files.length > 0) {
                            const fileDataKey = `module_${updatedModule.id}_task_${i}_files`;
                            localStorage.setItem(fileDataKey, JSON.stringify(task.files));
                            console.log(`💾 Stored file data in localStorage: ${fileDataKey}`);
                        }
                        await window.dbService.createModuleChecklistItem(taskData);
                    }
                    console.log('✅ Checklist items saved successfully');
                } catch (error) {
                    console.error('❌ Failed to save checklist items:', error);
                }
            }
        } else {
            // Create new module
            const newModule = modules[modules.length - 1];
            console.log('Creating new module:', newModule.title);
            
            // Remove checklist from database creation - it's handled separately
            const { checklist, ...moduleForDatabase } = newModule;
            // Convert camelCase to snake_case for database
            const dbModule = {
                ...moduleForDatabase,
                required_role: moduleForDatabase.requiredRole || 'Team Member',
                quality_unsatisfactory: moduleForDatabase.qualityUnsatisfactory,
                quality_average: moduleForDatabase.qualityAverage,
                quality_excellent: moduleForDatabase.qualityExcellent,
                speed_unsatisfactory: moduleForDatabase.speedUnsatisfactory,
                speed_average: moduleForDatabase.speedAverage,
                speed_excellent: moduleForDatabase.speedExcellent,
                communication_unsatisfactory: moduleForDatabase.communicationUnsatisfactory,
                communication_average: moduleForDatabase.communicationAverage,
                communication_excellent: moduleForDatabase.communicationExcellent,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            // Remove camelCase versions
            delete dbModule.requiredRole;
            delete dbModule.qualityUnsatisfactory;
            delete dbModule.qualityAverage;
            delete dbModule.qualityExcellent;
            delete dbModule.speedUnsatisfactory;
            delete dbModule.speedAverage;
            delete dbModule.speedExcellent;
            delete dbModule.communicationUnsatisfactory;
            delete dbModule.communicationAverage;
            delete dbModule.communicationExcellent;
            delete dbModule.lastUpdated;
            delete dbModule.createdAt;
            
            console.log('Sending to database:', dbModule);
            const result = await window.dbService.createModule(dbModule);
            console.log('Database create result:', result);
            
            // Save checklist items to module_checklist table
            if (checklist && checklist.length > 0 && result && result.length > 0) {
                const createdModule = result[0];
                console.log('💾 Saving checklist items for new module:', checklist);
                try {
                    // Add the new checklist items
                    for (let i = 0; i < checklist.length; i++) {
                        const task = checklist[i];
                        const taskData = {
                            module_id: createdModule.id,
                            order_index: i + 1,
                            task_text: typeof task === 'string' ? task : (task.description || task.task || '')
                        };
                        
                        // Store file data in localStorage as backup (until we add file_data column to database)
                        if (typeof task === 'object' && task.files && task.files.length > 0) {
                            const fileDataKey = `module_${createdModule.id}_task_${i}_files`;
                            localStorage.setItem(fileDataKey, JSON.stringify(task.files));
                            console.log(`💾 Stored file data in localStorage: ${fileDataKey}`);
                        }
                        await window.dbService.createModuleChecklistItem(taskData);
                    }
                    console.log('✅ Checklist items saved successfully for new module');
                } catch (error) {
                    console.error('❌ Failed to save checklist items for new module:', error);
                }
            }
        }
        
        // Sync to localStorage after successful database save
        localStorage.setItem('globalModules', JSON.stringify(modules));
        console.log('Module saved successfully to both database and localStorage');
    } catch (error) {
        console.error('Failed to save module to database:', error);
        showToast('error', 'Save Failed', `Failed to save module: ${error.message || 'Unknown error'}`);
        // Fallback to localStorage only
        localStorage.setItem('globalModules', JSON.stringify(modules));
        console.log('Module saved to localStorage only (database unavailable)');
    }


    // Close modal
    closeModuleModal();

    // Small delay to ensure database has processed the update
    await new Promise(resolve => setTimeout(resolve, 500));

    // Reload modules data
    console.log('🔄 Reloading modules data after save...');
    await loadModulesData();

    // Show success message
    showToast('success', 'Module Saved', 'Module saved successfully! Changes will be reflected across all user accounts.');
}

function addChecklistItem() {
    const checklistContainer = document.getElementById('modalChecklist');
    if (!checklistContainer) return;
    
    const taskIndex = checklistContainer.children.length;
    const newItem = document.createElement('div');
    newItem.className = 'checklist-item';
    newItem.innerHTML = `
        <input type="text" class="checklist-task-input" placeholder="Enter task description">
        <button type="button" class="add-file-btn" onclick="toggleFileSection(this)">
            <i class="fas fa-plus"></i>
            Add Files
        </button>
        <div class="checklist-file-section">
            <input type="text" class="checklist-file-input" placeholder="File name or URL (optional)">
            <input type="file" class="checklist-file-upload" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mp3" onchange="handleFileUpload(this, ${taskIndex})" multiple>
            <div class="checklist-files-list" id="files-list-${taskIndex}">
            </div>
        </div>
        <div class="checklist-actions">
            <span class="task-number">Task ${taskIndex + 1}</span>
            <button type="button" class="checklist-remove-btn" onclick="removeChecklistItem(this)">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;
    
    checklistContainer.appendChild(newItem);
    
    // Ensure Chrome compatibility for the new file input
    setTimeout(() => {
        ensureChromeFileInputCompatibility();
    }, 100);
}

function removeChecklistItem(button) {
    const item = button.closest('.checklist-item');
    item.remove();
    // Update task numbers after removal
    updateTaskNumbers();
}

// Removed duplicate handleFileUpload function - using the advanced version below

function updateTaskNumbers() {
    const checklistItems = document.querySelectorAll('.checklist-item');
    checklistItems.forEach((item, index) => {
        const taskNumber = item.querySelector('.task-number');
        if (taskNumber) {
            taskNumber.textContent = `Task ${index + 1}`;
        }
    });
}

function ensureChromeFileInputCompatibility() {
    // Ensure all file inputs are properly configured for Chrome
    const fileInputs = document.querySelectorAll('.checklist-file-upload');
    fileInputs.forEach(input => {
        // Force Chrome to recognize the file input
        input.style.position = 'relative';
        input.style.zIndex = '10';
        input.style.opacity = '1';
        input.style.visibility = 'visible';
        input.style.pointerEvents = 'auto';
        input.style.cursor = 'pointer';
        
        // Ensure the input is not hidden by other elements
        input.setAttribute('tabindex', '0');
        
        // Add click event listener as backup
        input.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

function toggleFileSection(button) {
    const checklistItem = button.closest('.checklist-item');
    const fileSection = checklistItem.querySelector('.checklist-file-section');
    
    if (fileSection.classList.contains('show')) {
        fileSection.classList.remove('show');
        updateFileButtonText(button);
    } else {
        fileSection.classList.add('show');
        button.innerHTML = '<i class="fas fa-minus"></i> Hide Files';
    }
}

function updateFileButtonText(button) {
    const checklistItem = button.closest('.checklist-item');
    const filesList = checklistItem.querySelector('.checklist-files-list');
    const fileCount = filesList ? filesList.children.length : 0;
    
    if (fileCount > 0) {
        button.innerHTML = `<i class="fas fa-plus"></i> Show Files (${fileCount} attached)`;
    } else {
        button.innerHTML = '<i class="fas fa-plus"></i> Add Files';
    }
}

function handleFileUpload(fileInput, taskIndex) {
    const files = fileInput.files;
    if (files && files.length > 0) {
        const checklistItem = fileInput.closest('.checklist-item');
        const filesList = checklistItem.querySelector('.checklist-files-list');
        
        // Validate file types and sizes
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.mp4', '.mp3', '.pptx', '.xlsx'];
        const maxFileSize = 10 * 1024 * 1024; // 10MB limit
        
        Array.from(files).forEach(file => {
            // Validate file type
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                showToast('error', 'Invalid File Type', `File "${file.name}" has an unsupported format. Allowed types: ${allowedTypes.join(', ')}`);
                return;
            }
            
            // Validate file size
            if (file.size > maxFileSize) {
                showToast('error', 'File Too Large', `File "${file.name}" is too large. Maximum size is 10MB.`);
                return;
            }
            
            // Read the file content as base64
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                const base64Content = e.target.result.split(',')[1]; // Remove data:type;base64, prefix
                addFileToList(filesList, file.name, file.size, base64Content);
                    showToast('success', 'File Added', `Successfully added "${file.name}"`);
                } catch (error) {
                    console.error('Error processing file:', error);
                    showToast('error', 'File Processing Error', `Failed to process "${file.name}": ${error.message}`);
                }
            };
            reader.onerror = function() {
                showToast('error', 'File Read Error', `Failed to read "${file.name}"`);
            };
            reader.readAsDataURL(file);
        });
        
        // Update button text to reflect new file count
        const addFileBtn = checklistItem.querySelector('.add-file-btn');
        updateFileButtonText(addFileBtn);
        
        // Clear the file input
        fileInput.value = '';
    }
}

function addFileToList(filesList, fileName, fileSize, base64Content = null) {
    const fileItem = document.createElement('div');
    fileItem.className = 'checklist-file-item';
    
    const fileIndex = filesList.children.length;
    fileItem.innerHTML = `
        <div class="checklist-file-item-info">
            <i class="fas fa-file"></i>
            <span>${fileName}</span>
            <span style="font-size: 0.8rem; color: #6c757d; margin-left: auto;">
                ${fileSize ? (fileSize / 1024).toFixed(1) + ' KB' : ''}
            </span>
        </div>
        <button type="button" class="checklist-file-item-remove" onclick="removeFileFromList(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Store the base64 content as a data attribute
    if (base64Content) {
        fileItem.setAttribute('data-file-content', base64Content);
    }
    
    filesList.appendChild(fileItem);
}

function removeFileFromList(button) {
    const fileItem = button.closest('.checklist-file-item');
    fileItem.remove();
}

function removeFileFromTask(taskIndex, fileIndex) {
    const filesList = document.getElementById(`files-list-${taskIndex}`);
    if (filesList) {
        const fileItems = filesList.querySelectorAll('.checklist-file-item');
        if (fileItems[fileIndex]) {
            fileItems[fileIndex].remove();
            
            // Update button text to reflect new file count
            const checklistItem = filesList.closest('.checklist-item');
            const addFileBtn = checklistItem.querySelector('.add-file-btn');
            updateFileButtonText(addFileBtn);
        }
    }
}

// Removed addAnotherFileInput function - keeping it simple with one file upload per task

function getTaskIndex(checklistItem) {
    const checklistContainer = document.querySelector('.checklist');
    const items = checklistContainer.querySelectorAll('.checklist-item');
    return Array.from(items).indexOf(checklistItem);
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
    const username = currentUser.username || 'Admin';
    const role = currentUser.role || 'Admin';
    
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserRole = document.getElementById('dropdownUserRole');
    
    if (dropdownUserName) {
        dropdownUserName.textContent = username;
    }
    
    if (dropdownUserRole) {
        dropdownUserRole.textContent = role;
    }
}

// Export functions for potential use in other scripts
window.adminOverview = {
    loadUserData,
    updateSummaryCards,
    updateRoleStats,
    updateUserProgressTable,
    viewUserDetails,
    editUser,
    openUserDetailsModal,
    showUserManagementContent,
    showPathManagementContent,
    loadModulesData
};

// Toast Notification Functions
function showToast(type, title, message, duration = 5000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast(this.parentElement)">×</button>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto remove after duration
    setTimeout(() => {
        removeToast(toast);
    }, duration);
}

function getToastIcon(type) {
    switch (type) {
        case 'success':
            return '✓';
        case 'error':
            return '✕';
        case 'warning':
            return '⚠';
        case 'info':
            return 'ℹ';
        default:
            return 'ℹ';
    }
}

function removeToast(toast) {
    if (!toast) return;
    
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

// Force refresh data from database
async function refreshDataFromDatabase() {
    console.log('Force refreshing data from database...');
    showToast('info', 'Refreshing Data', 'Loading latest data from database...');
    
    try {
        // Refresh users data
        await loadUserData();
        
        // Refresh modules data
        await loadModulesData();
        
        showToast('success', 'Data Refreshed', 'Latest data loaded from database');
    } catch (error) {
        console.error('Failed to refresh data from database:', error);
        showToast('error', 'Refresh Failed', 'Could not load latest data from database');
    }
}

// Make refresh function available globally
window.refreshDataFromDatabase = refreshDataFromDatabase;

// Test function for debugging modals
window.testModal = function() {
    console.log('Testing modal functionality...');
    const modal = document.getElementById('userModal');
    const newUserBtn = document.getElementById('newUserBtn');
    
    console.log('Modal found:', !!modal);
    
    if (modal) {
        modal.classList.add('show');
        console.log('Modal should now be visible');
    }
    
    if (newUserBtn) {
        console.log('New User button element:', newUserBtn);
        console.log('Button onclick:', newUserBtn.onclick);
        console.log('Button event listeners:', newUserBtn.addEventListener ? 'Has addEventListener' : 'No addEventListener');
    }
};

// Module Assignment Functions
let moduleAssignments = [];
let currentAssignment = null;

// Load existing assignments from user progress data
async function loadExistingAssignmentsFromProgress() {
    const users = await getAllUsers();
    const modules = getAllModules();
    const existingAssignments = [];
    
    users.forEach(async user => {
        const userProgress = await getUserProgress(user.username);
        
        // Check if user has progress on any modules
        if (userProgress && typeof userProgress === 'object') {
            Object.keys(userProgress).forEach(moduleTitle => {
                const progress = userProgress[moduleTitle];
                
                // If user has any progress on this module, consider it assigned
                if (progress && (progress.completedTasks > 0 || progress.totalTasks > 0)) {
                    const module = modules.find(m => m.title === moduleTitle);
                    if (module) {
                        const assignment = {
                            id: `existing-${user.username}-${moduleTitle}`.replace(/\s+/g, '-'),
                            user_id: user.id || user.username,
                            module_id: module.id || module.title,
                            user_name: user.full_name || user.fullName || user.username,
                            module_title: module.title,
                            assigned_at: new Date().toISOString(), // Use current date as fallback
                            due_date: null,
                            status: progress.completedTasks >= progress.totalTasks ? 'completed' : 'in_progress',
                            notes: 'Existing assignment from user progress',
                            is_existing: true // Flag to identify existing assignments
                        };
                        existingAssignments.push(assignment);
                    }
                }
            });
        }
        
    });
    
    return existingAssignments;
}


// Load module assignments
async function loadModuleAssignments() {
    try {
        let dbAssignments = [];
        if (window.dbService && window.dbService.isConfigured) {
            dbAssignments = await window.dbService.getModuleAssignments();
            console.log('Loaded module assignments from database:', dbAssignments.length);
        }
        
        // Also load existing assignments from user progress data
        const existingAssignments = await loadExistingAssignmentsFromProgress();
        console.log('Loaded existing assignments from user progress:', existingAssignments.length);
        
        // Combine database assignments with existing assignments
        moduleAssignments = [...dbAssignments, ...existingAssignments];
        
        // Remove duplicates based on user_id and module_id combination
        const uniqueAssignments = [];
        const seen = new Set();
        
        moduleAssignments.forEach(assignment => {
            const key = `${assignment.user_id}-${assignment.module_id}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueAssignments.push(assignment);
            }
        });
        
        moduleAssignments = uniqueAssignments;
        console.log('Total unique module assignments:', moduleAssignments.length);
        
        await updateAssignmentsTable();
        await updateAssignmentFilters();
    } catch (error) {
        console.error('Failed to load module assignments:', error);
        showToast('error', 'Database Error', 'Failed to load module assignments from database');
        moduleAssignments = [];
        await updateAssignmentsTable();
        await updateAssignmentFilters();
    }
}

// Update assignments table
async function updateAssignmentsTable() {
    const tbody = document.getElementById('assignmentsTableBody');
    const mobileTable = document.getElementById('assignmentsTableMobile');
    
    if (!tbody || !mobileTable) return;

    tbody.innerHTML = '';
    mobileTable.innerHTML = '';

    if (moduleAssignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #666;">No module assignments found</td></tr>';
        mobileTable.innerHTML = `
            <div class="assignment-card-mobile">
                <div style="text-align: center; padding: 2rem; color: #666;">
                    No module assignments found
                </div>
            </div>
        `;
        return;
    }

    // Process each assignment and fetch progress data
    for (const assignment of moduleAssignments) {
        let progressInfo = 'No progress data';
        
        try {
            // Get user progress for this module
            if (window.dbService && window.dbService.isConfigured) {
                const userProgress = await window.dbService.getUserProgress(assignment.user_id);
                const moduleProgress = userProgress.find(p => p.module_id === assignment.module_id);
                
                if (moduleProgress) {
                    const percentage = Math.round(moduleProgress.progress_percentage || 0);
                    const completed = moduleProgress.completed_tasks || 0;
                    const total = moduleProgress.total_tasks || 0;
                    
                    progressInfo = `
                        <div class="progress-info">
                            <div class="progress-bar-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${percentage}%"></div>
                                </div>
                                <span class="progress-text">${percentage}%</span>
                            </div>
                            <div class="progress-details">${completed}/${total} tasks</div>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch progress for assignment ${assignment.id}:`, error);
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="assignment-checkbox" data-assignment-id="${assignment.id}"></td>
            <td>${assignment.user_name || 'Unknown User'}</td>
            <td>${assignment.module_title || 'Unknown Module'}</td>
            <td>${formatDate(assignment.assigned_at)}</td>
            <td>${assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}</td>
            <td><span class="status-badge status-${assignment.status}">${assignment.status}</span></td>
            <td>${progressInfo}</td>
            <td>${assignment.notes || '-'}</td>
            <td>
                <div class="assignment-actions">
                    <button class="btn-edit" onclick="editAssignment('${assignment.id}')" title="Edit Assignment">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-unassign" onclick="unassignModule('${assignment.id}')" title="Unassign Module">
                        <i class="fas fa-user-minus"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteAssignment('${assignment.id}')" title="Delete Assignment">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    }

    // Generate mobile cards for each assignment
    const mobileCards = moduleAssignments.map(assignment => {
        const assignedDate = formatDate(assignment.assigned_at);
        const dueDate = assignment.due_date ? formatDate(assignment.due_date) : 'No due date';
        const progressPercentage = Math.round(assignment.progress_percentage || 0);
        
        return `
            <div class="assignment-card-mobile">
                <div class="assignment-card-header">
                    <input type="checkbox" class="assignment-checkbox" data-assignment-id="${assignment.id}">
                    <div class="assignment-user-info">
                        <div class="assignment-user-name">${assignment.user_name || 'Unknown User'}</div>
                        <div class="assignment-module-name">${assignment.module_title || 'Unknown Module'}</div>
                    </div>
                </div>
                <div class="assignment-details">
                    <div class="assignment-detail-item">
                        <div class="assignment-detail-label">Assigned Date</div>
                        <div class="assignment-detail-value">${assignedDate}</div>
                    </div>
                    <div class="assignment-detail-item">
                        <div class="assignment-detail-label">Due Date</div>
                        <div class="assignment-detail-value">${dueDate}</div>
                    </div>
                    <div class="assignment-detail-item">
                        <div class="assignment-detail-label">Status</div>
                        <div class="assignment-detail-value">
                            <span class="status-badge status-${assignment.status}">${assignment.status}</span>
                        </div>
                    </div>
                    <div class="assignment-detail-item">
                        <div class="assignment-detail-label">Progress</div>
                        <div class="assignment-detail-value">${progressPercentage}%</div>
                    </div>
                </div>
                <div class="assignment-actions">
                    <button class="assignment-btn-mobile" onclick="editAssignment('${assignment.id}')" title="Edit Assignment">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="assignment-btn-mobile danger" onclick="unassignModule('${assignment.id}')" title="Unassign Module">
                        <i class="fas fa-user-minus"></i>
                        Unassign
                    </button>
                    <button class="assignment-btn-mobile danger" onclick="deleteAssignment('${assignment.id}')" title="Delete Assignment">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    mobileTable.innerHTML = mobileCards.join('');

    // Add event listeners to individual checkboxes
    const assignmentCheckboxes = document.querySelectorAll('.assignment-checkbox');
    assignmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkUnassignButton);
    });
}

// Update assignment filters
async function updateAssignmentFilters() {
    const userFilter = document.getElementById('assignmentUserFilter');
    const moduleFilter = document.getElementById('assignmentModuleFilter');

    if (userFilter) {
        // Populate user filter
        const users = await getAllUsers();
        userFilter.innerHTML = '<option value="">All Users</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id || user.username;
            option.textContent = user.full_name || user.fullName || user.username;
            userFilter.appendChild(option);
        });
    }

    if (moduleFilter) {
        // Populate module filter
        const modules = getAllModules();
        moduleFilter.innerHTML = '<option value="">All Modules</option>';
        modules.forEach(module => {
            const option = document.createElement('option');
            option.value = module.id || module.title;
            option.textContent = module.title;
            moduleFilter.appendChild(option);
        });
    }
}

// Open assignment modal
async function openAssignmentModal(assignmentId = null) {
    const modal = document.getElementById('assignmentModal');
    const title = document.getElementById('assignmentModalTitle');
    
    if (assignmentId) {
        currentAssignment = moduleAssignments.find(a => a.id === assignmentId);
        title.textContent = 'Edit Assignment';
    } else {
        currentAssignment = null;
        title.textContent = 'Assign Module';
    }

    await populateAssignmentForm();
    modal.classList.add('show');
}

// Populate assignment form
async function populateAssignmentForm() {
    const userCheckboxes = document.getElementById('userCheckboxes');
    const moduleCheckboxes = document.getElementById('moduleCheckboxes');
    const dueDateInput = document.getElementById('assignmentDueDate');
    const statusSelect = document.getElementById('assignmentStatus');
    const notesTextarea = document.getElementById('assignmentNotes');

    // Populate user checkboxes
    const users = await getAllUsers();
    userCheckboxes.innerHTML = '';
    users.forEach(user => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'user-checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `user-${user.id || user.username}`;
        checkbox.name = 'userIds';
        checkbox.value = user.id || user.username;
        
        const label = document.createElement('label');
        label.htmlFor = `user-${user.id || user.username}`;
        label.textContent = user.full_name || user.fullName || user.username;
        
        // Check if this user is already assigned (for editing)
        if (currentAssignment && (user.id === currentAssignment.user_id || user.username === currentAssignment.user_id)) {
            checkbox.checked = true;
        }
        
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        userCheckboxes.appendChild(checkboxItem);
    });

    // Populate module checkboxes
    const modules = getAllModules();
    moduleCheckboxes.innerHTML = '';
    modules.forEach(module => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'module-checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `module-${module.id || module.title}`;
        checkbox.name = 'moduleIds';
        checkbox.value = module.id || module.title;
        
        const label = document.createElement('label');
        label.htmlFor = `module-${module.id || module.title}`;
        label.textContent = module.title;
        
        // Check if this module is already assigned (for editing)
        if (currentAssignment && (module.id === currentAssignment.module_id || module.title === currentAssignment.module_id)) {
            checkbox.checked = true;
        }
        
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        moduleCheckboxes.appendChild(checkboxItem);
    });

    // Populate other fields
    if (currentAssignment) {
        dueDateInput.value = currentAssignment.due_date || '';
        statusSelect.value = currentAssignment.status || 'assigned';
        notesTextarea.value = currentAssignment.notes || '';
    } else {
        dueDateInput.value = '';
        statusSelect.value = 'assigned';
        notesTextarea.value = '';
    }
}

// Save assignment
async function saveAssignment() {
    const form = document.getElementById('assignmentForm');
    const formData = new FormData(form);
    
    const userIds = formData.getAll('userIds'); // Get all selected users from checkboxes
    const moduleIds = formData.getAll('moduleIds'); // Get all selected modules from checkboxes
    const dueDate = formData.get('dueDate') || null;
    const status = formData.get('status');
    const notes = formData.get('notes') || null;

    if (userIds.length === 0 || moduleIds.length === 0) {
        showToast('error', 'Validation Error', 'Please select at least one user and one module');
        return;
    }

    // Filter out empty values
    const validUserIds = userIds.filter(id => id && id !== '');
    const validModuleIds = moduleIds.filter(id => id && id !== '');
    
    if (validUserIds.length === 0) {
        showToast('error', 'Validation Error', 'Please select at least one user');
        return;
    }
    
    if (validModuleIds.length === 0) {
        showToast('error', 'Validation Error', 'Please select at least one module');
        return;
    }

    try {
        if (currentAssignment) {
            // Update existing assignment (single assignment editing)
            const assignmentData = {
                user_id: validUserIds[0], // For editing, use first selected user
                module_id: validModuleIds[0], // For editing, use first selected module
                due_date: dueDate,
                status: status,
                notes: notes
            };
            await window.dbService.updateModuleAssignment(currentAssignment.id, assignmentData);
            showToast('success', 'Assignment Updated', 'Module assignment updated successfully');
        } else {
            // Create multiple new assignments for all user-module combinations
            const users = await getAllUsers();
            const modules = await getAllModules();
            
            let successCount = 0;
            let errorCount = 0;
            
            // Create assignments for each selected user and module combination
            for (const userId of validUserIds) {
            for (const moduleId of validModuleIds) {
                try {
                    const newAssignment = await window.dbService.assignModuleToUser(
                        userId,
                        moduleId,
                        null, // assigned_by
                        dueDate,
                        notes
                    );
                    
                    successCount++;
                } catch (error) {
                        console.error(`Failed to assign module ${moduleId} to user ${userId}:`, error);
                    errorCount++;
                    }
                }
            }
            
            if (successCount > 0) {
                const totalAssignments = validUserIds.length * validModuleIds.length;
                const message = errorCount > 0 
                    ? `${successCount} assignments created successfully, ${errorCount} failed`
                    : `${successCount} assignments created successfully`;
                showToast('success', 'Assignments Created', message);
            } else {
                showToast('error', 'Assignment Failed', 'No assignments could be created');
            }
        }

        closeAssignmentModal();
        await loadModuleAssignments();
    } catch (error) {
        console.error('Failed to save assignments:', error);
        showToast('error', 'Database Error', 'Failed to save module assignments to database');
    }
}

// Edit assignment
function editAssignment(assignmentId) {
    openAssignmentModal(assignmentId);
}

// Unassign module (soft delete - marks as unassigned)
async function unassignModule(assignmentId) {
    const assignment = moduleAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
        showToast('error', 'Error', 'Assignment not found');
        return;
    }

    const confirmMessage = `Are you sure you want to unassign "${assignment.module_title}" from "${assignment.user_name}"?`;
    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        // Try to delete from database first (only if it's not an existing assignment)
        if (!assignment.is_existing) {
            await window.dbService.removeModuleAssignment(assignmentId);
            console.log('Assignment removed from database successfully');
        } else {
            console.log('Skipping database deletion for existing/role-based assignment');
        }
    } catch (error) {
        console.error('Failed to remove assignment from database:', error);
        showToast('error', 'Database Error', 'Failed to remove assignment from database');
        return;
    }

    // If this is an existing assignment, also clear the user's progress
    if (assignment.is_existing) {
        const userProgress = getUserProgress(assignment.user_name);
        if (userProgress && userProgress[assignment.module_title]) {
            delete userProgress[assignment.module_title];
            const userProgressKey = `userProgress_${assignment.user_name}`;
            localStorage.setItem(userProgressKey, JSON.stringify(userProgress));
            console.log(`Cleared progress for ${assignment.user_name} on ${assignment.module_title}`);
        }
        
        // Track unassigned role-based assignments to prevent them from reappearing
        if (assignment.notes === 'Role-based assignment') {
            try {
                await window.dbService.addUnassignedRoleAssignment(assignment.user_id, assignment.module_id);
                console.log(`Tracked unassigned role-based assignment in database: ${assignment.user_id}-${assignment.module_id}`);
            } catch (error) {
                console.error('Failed to track unassigned role-based assignment in database:', error);
                // Fallback to localStorage if database fails
                const unassignedRoleBased = JSON.parse(localStorage.getItem('unassignedRoleBased') || '[]');
                const unassignedKey = `${assignment.user_id}-${assignment.module_id}`;
                if (!unassignedRoleBased.includes(unassignedKey)) {
                    unassignedRoleBased.push(unassignedKey);
                    localStorage.setItem('unassignedRoleBased', JSON.stringify(unassignedRoleBased));
                    console.log(`Tracked unassigned role-based assignment in localStorage: ${unassignedKey}`);
                }
            }
        }
    }

    showToast('success', 'Module Unassigned', `"${assignment.module_title}" has been unassigned from "${assignment.user_name}"`);
    await loadModuleAssignments();
}

// Delete assignment (permanent delete)
async function deleteAssignment(assignmentId) {
    const assignment = moduleAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
        showToast('error', 'Error', 'Assignment not found');
        return;
    }

    const confirmMessage = `Are you sure you want to permanently delete this assignment for "${assignment.user_name}" and "${assignment.module_title}"? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        await window.dbService.removeModuleAssignment(assignmentId);
        showToast('success', 'Assignment Deleted', 'Module assignment deleted successfully');
        await loadModuleAssignments();
    } catch (error) {
        console.error('Failed to delete assignment:', error);
        showToast('error', 'Delete Failed', 'Could not delete module assignment');
    }
}

// Close assignment modal
function closeAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    modal.classList.remove('show');
    currentAssignment = null;
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Setup assignment event listeners
function setupAssignmentEventListeners() {
    // Assign module button
    const assignBtn = document.getElementById('assignModuleBtn');
    if (assignBtn) {
        assignBtn.addEventListener('click', () => openAssignmentModal());
    }

    // Assignment modal close buttons
    const modalClose = document.getElementById('assignmentModalClose');
    const modalCancel = document.getElementById('assignmentModalCancel');
    const modalSave = document.getElementById('assignmentModalSave');

    if (modalClose) {
        modalClose.addEventListener('click', closeAssignmentModal);
    }
    if (modalCancel) {
        modalCancel.addEventListener('click', closeAssignmentModal);
    }
    if (modalSave) {
        modalSave.addEventListener('click', saveAssignment);
    }

    // Assignment modal backdrop click
    const modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAssignmentModal();
            }
        });
    }

    // Filter change events
    const userFilter = document.getElementById('assignmentUserFilter');
    const moduleFilter = document.getElementById('assignmentModuleFilter');
    const statusFilter = document.getElementById('assignmentStatusFilter');

    if (userFilter) {
        userFilter.addEventListener('change', filterAssignments);
    }
    if (moduleFilter) {
        moduleFilter.addEventListener('change', filterAssignments);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAssignments);
    }

    // Bulk unassign button
    const bulkUnassignBtn = document.getElementById('bulkUnassignBtn');
    if (bulkUnassignBtn) {
        bulkUnassignBtn.addEventListener('click', bulkUnassignModules);
    }

    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllAssignments');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAllAssignments);
    }
}

// Filter assignments
async function filterAssignments() {
    const userFilter = document.getElementById('assignmentUserFilter')?.value;
    const moduleFilter = document.getElementById('assignmentModuleFilter')?.value;
    const statusFilter = document.getElementById('assignmentStatusFilter')?.value;

    // This would filter the assignments based on the selected filters
    // For now, we'll just reload all assignments
    await updateAssignmentsTable();
}

// Toggle select all assignments
function toggleSelectAllAssignments() {
    const selectAllCheckbox = document.getElementById('selectAllAssignments');
    const assignmentCheckboxes = document.querySelectorAll('.assignment-checkbox');
    const bulkUnassignBtn = document.getElementById('bulkUnassignBtn');
    
    assignmentCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    // Show/hide bulk unassign button based on selections
    updateBulkUnassignButton();
}

// Update bulk unassign button visibility
function updateBulkUnassignButton() {
    const selectedCheckboxes = document.querySelectorAll('.assignment-checkbox:checked');
    const bulkUnassignBtn = document.getElementById('bulkUnassignBtn');
    
    if (selectedCheckboxes.length > 0) {
        bulkUnassignBtn.style.display = 'inline-flex';
        bulkUnassignBtn.textContent = `Unassign Selected (${selectedCheckboxes.length})`;
    } else {
        bulkUnassignBtn.style.display = 'none';
    }
}

// Bulk unassign selected modules
async function bulkUnassignModules() {
    const selectedCheckboxes = document.querySelectorAll('.assignment-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        showToast('warning', 'No Selection', 'Please select at least one assignment to unassign');
        return;
    }
    
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.assignmentId);
    const selectedAssignments = moduleAssignments.filter(a => selectedIds.includes(a.id));
    
    const confirmMessage = `Are you sure you want to unassign ${selectedAssignments.length} module(s)?\n\nThis will unassign:\n${selectedAssignments.map(a => `• ${a.module_title} from ${a.user_name}`).join('\n')}`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const assignmentId of selectedIds) {
        const assignment = moduleAssignments.find(a => a.id === assignmentId);
        
        try {
            // Try to remove from database (only if it's not an existing assignment)
            if (!assignment.is_existing) {
                await window.dbService.removeModuleAssignment(assignmentId);
            }
            successCount++;
        } catch (error) {
            console.error(`Failed to remove assignment ${assignmentId} from database:`, error);
            errorCount++;
        }
        
        // If this is an existing assignment, also clear the user's progress
        if (assignment && assignment.is_existing) {
            const userProgress = getUserProgress(assignment.user_name);
            if (userProgress && userProgress[assignment.module_title]) {
                delete userProgress[assignment.module_title];
                const userProgressKey = `userProgress_${assignment.user_name}`;
                localStorage.setItem(userProgressKey, JSON.stringify(userProgress));
                console.log(`Cleared progress for ${assignment.user_name} on ${assignment.module_title}`);
            }
            
            // Track unassigned role-based assignments to prevent them from reappearing
            if (assignment.notes === 'Role-based assignment') {
                try {
                    await window.dbService.addUnassignedRoleAssignment(assignment.user_id, assignment.module_id);
                    console.log(`Tracked unassigned role-based assignment in database: ${assignment.user_id}-${assignment.module_id}`);
                } catch (error) {
                    console.error('Failed to track unassigned role-based assignment in database:', error);
                    // Fallback to localStorage if database fails
                    const unassignedRoleBased = JSON.parse(localStorage.getItem('unassignedRoleBased') || '[]');
                    const unassignedKey = `${assignment.user_id}-${assignment.module_id}`;
                    if (!unassignedRoleBased.includes(unassignedKey)) {
                        unassignedRoleBased.push(unassignedKey);
                        localStorage.setItem('unassignedRoleBased', JSON.stringify(unassignedRoleBased));
                        console.log(`Tracked unassigned role-based assignment in localStorage: ${unassignedKey}`);
                    }
                }
            }
        }
    }
    
    
    // Update UI
    const selectAllCheckbox = document.getElementById('selectAllAssignments');
    selectAllCheckbox.checked = false;
    updateBulkUnassignButton();
    
    const message = errorCount > 0 
        ? `${successCount} assignments unassigned successfully, ${errorCount} failed`
        : `${successCount} assignments unassigned successfully`;
    
    showToast('success', 'Bulk Unassign Complete', message);
    await loadModuleAssignments();
}

// ===== ROLE MANAGEMENT FUNCTIONALITY =====

// Global variables for role management
let roles = [];
const pagePermissions = {
    'User Management': {
        id: 'userManagement',
        name: 'User Management',
        description: 'Manage users, view progress, assign modules',
        icon: 'fas fa-users'
    },
    'Path Management': {
        id: 'pathManagement',
        name: 'Path Management',
        description: 'Create and manage learning modules',
        icon: 'fas fa-cogs'
    },
    'Role Management': {
        id: 'roleManagement',
        name: 'Role Management',
        description: 'Configure roles and page access permissions',
        icon: 'fas fa-user-shield'
    },
    'Reports': {
        id: 'reports',
        name: 'Reports',
        description: 'View analytics and system reports',
        icon: 'fas fa-chart-bar'
    },
    'Settings': {
        id: 'settings',
        name: 'Settings',
        description: 'System configuration and preferences',
        icon: 'fas fa-cog'
    }
};

// Role mapping between different naming conventions
const roleMapping = {
    'admin': 'Admin',
    'director': 'Director', 
    'supervisor': 'Supervisor',
    'team-member': 'Team Member',
    'team_member': 'Team Member'
};

// Reverse mapping for getting role ID from display name
const reverseRoleMapping = {
    'Admin': 'admin',
    'Director': 'director',
    'Supervisor': 'supervisor', 
    'Team Member': 'team-member'
};

// Default page access based on role level
const pageAccessLevels = {
    1: ['userManagement'], // Team Member - can only view user management (their own progress)
    2: ['userManagement', 'pathManagement'], // Supervisor - can manage users and modules
    3: ['userManagement', 'pathManagement', 'reports'], // Director - can access reports
    4: ['userManagement', 'pathManagement', 'roleManagement', 'reports', 'settings'] // Admin - full access
};

// Load role management data
async function loadRoleManagementData() {
    try {
        console.log('🔍 Loading role management data...');
        
        // Load roles from localStorage (in a real app, this would come from the database)
        const storedRoles = localStorage.getItem('roles');
        if (storedRoles) {
            roles = JSON.parse(storedRoles);
            console.log('🔍 Loaded roles from localStorage:', roles);
        } else {
            // Default roles if none exist
            roles = [
                { id: 'admin', name: 'Admin', description: 'Full system access', level: 4, pageAccess: pageAccessLevels[4] },
                { id: 'director', name: 'Director', description: 'High-level management', level: 3, pageAccess: pageAccessLevels[3] },
                { id: 'supervisor', name: 'Supervisor', description: 'Team supervision', level: 2, pageAccess: pageAccessLevels[2] },
                { id: 'team-member', name: 'Team Member', description: 'Basic access', level: 1, pageAccess: pageAccessLevels[1] }
            ];
            localStorage.setItem('roles', JSON.stringify(roles));
            console.log('🔍 Created default roles:', roles);
        }
        
        // Render role management content
        console.log('🔍 Rendering role overview cards...');
        renderRoleOverviewCards();
        
        console.log('🔍 Rendering roles grid...');
        renderRolesGrid();
        
        
        console.log('🔍 Setting up event listeners...');
        setupRoleManagementEventListeners();
        
        console.log('🔍 Role management data loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading role management data:', error);
        showToast('error', 'Error', 'Failed to load role management data');
    }
}

// Render role overview cards
function renderRoleOverviewCards() {
    const totalRoles = document.getElementById('totalRoles');
    const activeRoles = document.getElementById('activeRoles');
    const permissionLevelsElement = document.getElementById('permissionLevels');
    
    if (totalRoles) totalRoles.textContent = roles.length;
    if (activeRoles) activeRoles.textContent = roles.length; // All roles are considered active for now
    if (permissionLevelsElement) permissionLevelsElement.textContent = Object.keys(pageAccessLevels).length;
}

// Render roles grid
function renderRolesGrid() {
    const rolesGrid = document.getElementById('rolesGrid');
    console.log('🔍 renderRolesGrid - rolesGrid element:', rolesGrid);
    if (!rolesGrid) {
        console.error('❌ rolesGrid element not found!');
        return;
    }
    
    const rolesHTML = roles.map(role => {
        const pageAccess = role.pageAccess || [];
        const accessiblePages = pageAccess.map(pageId => {
            const page = Object.values(pagePermissions).find(p => p.id === pageId);
            return page ? page.name : pageId;
        }).join(', ');
        
        return `
        <div class="role-card">
            <h3>${role.name}</h3>
            <p>${role.description}</p>
            <div class="role-level">Level ${role.level}</div>
            <div class="page-access">
                <strong>Can Access:</strong><br>
                <span class="accessible-pages">${accessiblePages || 'No pages assigned'}</span>
            </div>
            <div class="role-actions">
                <button class="btn btn-edit" onclick="editRole('${role.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="deleteRole('${role.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    }).join('');
    
    rolesGrid.innerHTML = rolesHTML;
}


// Setup role management event listeners
function setupRoleManagementEventListeners() {
    // Add role button
    const addRoleBtn = document.getElementById('addRoleBtn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', openRoleModal);
    }
    
    // Role modal event listeners
    const roleModal = document.getElementById('roleModal');
    const roleModalClose = document.getElementById('roleModalClose');
    const roleModalCancel = document.getElementById('roleModalCancel');
    const roleForm = document.getElementById('roleForm');
    const roleLevelSelect = document.getElementById('roleLevel');
    
    if (roleModalClose) {
        roleModalClose.addEventListener('click', closeRoleModal);
    }
    
    if (roleModalCancel) {
        roleModalCancel.addEventListener('click', closeRoleModal);
    }
    
    if (roleForm) {
        roleForm.addEventListener('submit', saveRole);
    }
    
    if (roleLevelSelect) {
        roleLevelSelect.addEventListener('change', applyPermissionLevel);
    }
    
    // Close modal when clicking outside
    if (roleModal) {
        roleModal.addEventListener('click', function(e) {
            if (e.target === roleModal) {
                closeRoleModal();
            }
        });
    }
}

// Open role modal
function openRoleModal(roleId = null) {
    const roleModal = document.getElementById('roleModal');
    const roleModalTitle = document.getElementById('roleModalTitle');
    const roleIdInput = document.getElementById('roleId');
    const roleNameInput = document.getElementById('roleName');
    const roleDescriptionInput = document.getElementById('roleDescription');
    const roleLevelSelect = document.getElementById('roleLevel');
    
    if (roleId) {
        // Edit mode
        const role = roles.find(r => r.id === roleId);
        if (role) {
            roleModalTitle.textContent = 'Edit Role';
            roleIdInput.value = role.id;
            roleNameInput.value = role.name;
            roleDescriptionInput.value = role.description;
            roleLevelSelect.value = role.level;
            populateRolePageAccess(role.pageAccess || []);
        }
    } else {
        // Add mode
        roleModalTitle.textContent = 'Add New Role';
        roleIdInput.value = '';
        roleNameInput.value = '';
        roleDescriptionInput.value = '';
        roleLevelSelect.value = '1';
        populateRolePageAccess([]);
    }
    
    roleModal.classList.add('show');
}

// Close role modal
function closeRoleModal() {
    const roleModal = document.getElementById('roleModal');
    if (roleModal) {
        roleModal.classList.remove('show');
    }
}

// Populate role page access
function populateRolePageAccess(selectedPageAccess) {
    console.log('🔍 populateRolePageAccess called with:', selectedPageAccess);
    const rolePermissionsGrid = document.getElementById('rolePermissionsGrid');
    console.log('🔍 rolePermissionsGrid element:', rolePermissionsGrid);
    if (!rolePermissionsGrid) {
        console.error('❌ rolePermissionsGrid element not found!');
        return;
    }
    
    console.log('🔍 Available page permissions:', pagePermissions);
    const permissionsHTML = Object.entries(pagePermissions).map(([pageName, pageInfo]) => {
        const isChecked = selectedPageAccess.includes(pageInfo.id);
        console.log(`🔍 Page ${pageInfo.name} (${pageInfo.id}): ${isChecked ? 'checked' : 'unchecked'}`);
        return `
        <div class="permission-item">
            <input type="checkbox" 
                   id="page_${pageInfo.id}" 
                   value="${pageInfo.id}"
                   ${isChecked ? 'checked' : ''}>
            <label for="page_${pageInfo.id}">
                <i class="${pageInfo.icon}"></i>
                <div>
                    <strong>${pageInfo.name}</strong><br>
                    <small>${pageInfo.description}</small>
                </div>
            </label>
        </div>
    `;
    }).join('');
    
    rolePermissionsGrid.innerHTML = permissionsHTML;
    console.log('✅ Role permissions grid populated');
}

// Apply permission level
function applyPermissionLevel() {
    const roleLevelSelect = document.getElementById('roleLevel');
    const level = parseInt(roleLevelSelect.value);
    
    if (pageAccessLevels[level]) {
        populateRolePageAccess(pageAccessLevels[level]);
    }
}

// Save role
function saveRole(e) {
    e.preventDefault();
    
    const roleIdInput = document.getElementById('roleId');
    const roleNameInput = document.getElementById('roleName');
    const roleDescriptionInput = document.getElementById('roleDescription');
    const roleLevelSelect = document.getElementById('roleLevel');
    
    const roleData = {
        id: roleIdInput.value || generateRoleId(),
        name: roleNameInput.value,
        description: roleDescriptionInput.value,
        level: parseInt(roleLevelSelect.value),
        pageAccess: getSelectedPageAccess()
    };
    
    if (roleIdInput.value) {
        // Update existing role
        const index = roles.findIndex(r => r.id === roleIdInput.value);
        if (index !== -1) {
            roles[index] = roleData;
        }
    } else {
        // Add new role
        roles.push(roleData);
    }
    
    // Save to localStorage
    localStorage.setItem('roles', JSON.stringify(roles));
    
    // Refresh displays
    renderRoleOverviewCards();
    renderRolesGrid();
    
    // Refresh role-based UI for current user
    refreshRoleBasedUI();
    
    closeRoleModal();
    showToast('success', 'Success', `Role ${roleIdInput.value ? 'updated' : 'created'} successfully`);
}

// Get selected page access
function getSelectedPageAccess() {
    const checkboxes = document.querySelectorAll('#rolePermissionsGrid input[type="checkbox"]:checked');
    const selectedAccess = Array.from(checkboxes).map(cb => cb.value);
    console.log('🔍 getSelectedPageAccess - Selected checkboxes:', selectedAccess);
    return selectedAccess;
}

// Generate role ID
function generateRoleId() {
    return 'role_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Edit role
function editRole(roleId) {
    console.log('🔍 editRole called with ID:', roleId);
    console.log('🔍 Available roles:', roles);
    const role = roles.find(r => r.id === roleId);
    console.log('🔍 Found role:', role);
    if (role) {
        console.log('🔍 Role page access:', role.pageAccess);
    }
    openRoleModal(roleId);
}

// Delete role
function deleteRole(roleId) {
    console.log('🔍 deleteRole called with ID:', roleId);
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
        roles = roles.filter(r => r.id !== roleId);
        localStorage.setItem('roles', JSON.stringify(roles));
        
        renderRoleOverviewCards();
        renderRolesGrid();
        
        showToast('success', 'Success', 'Role deleted successfully');
    }
}

// Loading indicator functions
function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    
    // Also show a toast notification
    showToast('info', 'Loading', 'Loading user data...');
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Make functions globally accessible
window.editRole = editRole;
window.deleteRole = deleteRole;
window.closeRoleModal = closeRoleModal;


// ===== REPORTS & ANALYTICS FUNCTIONALITY =====

// Show reports content
function showReportsContent() {
    console.log('🔍 Showing reports content...');
    
    // Clean up any existing charts first
    cleanupCharts();
    
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Hide the main content (user management content)
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'none';
    }
    
    // Show reports content
    const reportsContent = document.getElementById('reportsContent');
    if (reportsContent) {
        console.log('🔍 Reports content found, showing...');
        reportsContent.style.display = 'block';
        reportsContent.style.visibility = 'visible';
        reportsContent.style.opacity = '1';
        
        // Load reports data
        loadReportsData();
        
        // Setup reports event listeners
        setupReportsEventListeners();
    } else {
        console.error('❌ Reports content element not found!');
    }
}

// Clean up charts to prevent memory leaks
function cleanupCharts() {
    if (window.progressChart && typeof window.progressChart.destroy === 'function') {
        window.progressChart.destroy();
        window.progressChart = null;
    }
    if (window.roleChart && typeof window.roleChart.destroy === 'function') {
        window.roleChart.destroy();
        window.roleChart = null;
    }
    if (window.moduleChart && typeof window.moduleChart.destroy === 'function') {
        window.moduleChart.destroy();
        window.moduleChart = null;
    }
}

// Load reports data
async function loadReportsData() {
    try {
        console.log('🔍 Loading reports data...');
        
        // Load user data
        await loadUserData();
        
        // Load quiz data
        await loadQuizData();
        
        // Generate analytics
        generateAnalytics();
        
        // Render charts
        renderCharts();
        
        // Load quiz results table
        loadQuizResultsTable();
        
        console.log('✅ Reports data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading reports data:', error);
        showToast('error', 'Error', 'Failed to load reports data');
    }
}

// Load quiz data for reports
async function loadQuizData() {
    try {
        // Load quiz results from localStorage
        const storedResults = localStorage.getItem('quizResults');
        if (storedResults) {
            window.quizResults = JSON.parse(storedResults);
    } else {
            window.quizResults = [];
        }
        
        // Load quizzes from localStorage
        const storedQuizzes = localStorage.getItem('quizzes');
        if (storedQuizzes) {
            window.quizzes = JSON.parse(storedQuizzes);
        } else {
            window.quizzes = [];
        }
        
        console.log('📊 Loaded quiz data:', {
            results: window.quizResults.length,
            quizzes: window.quizzes.length
        });
    } catch (error) {
        console.error('❌ Error loading quiz data:', error);
        window.quizResults = [];
        window.quizzes = [];
    }
}

// Generate analytics data
function generateAnalytics() {
    console.log('🔍 Generating analytics...');
    
    // Calculate metrics
    const metrics = calculateMetrics();
    
    // Update metric cards
    updateMetricCards(metrics);
    
    // Generate analytics table data
    generateAnalyticsTable();
    
    // Generate quiz performance data
    generateQuizPerformance();
}

// Calculate key metrics
function calculateMetrics() {
    const users = window.cachedUsers || [];
    const quizResults = window.quizResults || [];
    const quizzes = window.quizzes || [];
    
    // Active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = users.filter(user => {
        const lastActivity = new Date(user.lastActivity || user.createdAt);
        return lastActivity >= thirtyDaysAgo;
    }).length;
    
    // Modules completed (from quiz results)
    const completedModules = quizResults.length;
    
    // Average completion time (mock data for now)
    const avgCompletionTime = 2.5; // hours
    
    // Average satisfaction (mock data for now)
    const avgSatisfaction = 85; // percentage
    
    // Calculate changes (mock data for now)
    const activeUsersChange = 12; // +12%
    const completedModulesChange = 8; // +8%
    const completionTimeChange = -5; // -5%
    const satisfactionChange = 3; // +3%
    
    return {
        activeUsers,
        completedModules,
        avgCompletionTime,
        avgSatisfaction,
        activeUsersChange,
        completedModulesChange,
        completionTimeChange,
        satisfactionChange
    };
}

// Update metric cards
function updateMetricCards(metrics) {
    // Active Users
    document.getElementById('totalActiveUsers').textContent = metrics.activeUsers;
    const activeUsersChange = document.getElementById('activeUsersChange');
    activeUsersChange.textContent = `+${metrics.activeUsersChange}%`;
    activeUsersChange.className = `metric-change ${metrics.activeUsersChange >= 0 ? 'positive' : 'negative'}`;
    
    // Completed Modules
    document.getElementById('completedModules').textContent = metrics.completedModules;
    const completedModulesChange = document.getElementById('completedModulesChange');
    completedModulesChange.textContent = `+${metrics.completedModulesChange}%`;
    completedModulesChange.className = `metric-change ${metrics.completedModulesChange >= 0 ? 'positive' : 'negative'}`;
    
    // Average Completion Time
    document.getElementById('avgCompletionTime').textContent = `${metrics.avgCompletionTime}h`;
    const completionTimeChange = document.getElementById('completionTimeChange');
    completionTimeChange.textContent = `${metrics.completionTimeChange > 0 ? '+' : ''}${metrics.completionTimeChange}%`;
    completionTimeChange.className = `metric-change ${metrics.completionTimeChange <= 0 ? 'positive' : 'negative'}`;
    
    // Average Satisfaction
    document.getElementById('avgSatisfaction').textContent = `${metrics.avgSatisfaction}%`;
    const satisfactionChange = document.getElementById('satisfactionChange');
    satisfactionChange.textContent = `+${metrics.satisfactionChange}%`;
    satisfactionChange.className = `metric-change ${metrics.satisfactionChange >= 0 ? 'positive' : 'negative'}`;
}

// Generate analytics table
function generateAnalyticsTable() {
    const users = window.cachedUsers || [];
    const quizResults = window.quizResults || [];
    
    const tableBody = document.getElementById('analyticsTableBody');
    if (!tableBody) return;
    
    // Group quiz results by user
    const userStats = {};
    quizResults.forEach(result => {
        if (!userStats[result.username]) {
            userStats[result.username] = {
                username: result.username,
                role: 'Team Member', // Default role
                modulesCompleted: 0,
                totalScore: 0,
                lastActivity: result.dateTaken,
                scores: []
            };
        }
        userStats[result.username].modulesCompleted++;
        userStats[result.username].totalScore += result.score;
        userStats[result.username].scores.push(result.score);
        userStats[result.username].lastActivity = result.dateTaken;
    });
    
    // Add users without quiz results
    users.forEach(user => {
        if (!userStats[user.username]) {
            userStats[user.username] = {
                username: user.username,
                role: user.role || 'Team Member',
                modulesCompleted: 0,
                totalScore: 0,
                lastActivity: user.lastActivity || user.createdAt,
                scores: []
            };
        } else {
            // Update role from user data
            userStats[user.username].role = user.role || 'Team Member';
        }
    });
    
    // Convert to array and sort by last activity
    const userStatsArray = Object.values(userStats).sort((a, b) => 
        new Date(b.lastActivity) - new Date(a.lastActivity)
    );
    
    // Render table rows
    tableBody.innerHTML = userStatsArray.map(user => {
        const avgScore = user.scores.length > 0 ? 
            Math.round(user.totalScore / user.scores.length) : 0;
        const progress = Math.min(100, user.modulesCompleted * 10); // Mock progress calculation
        const status = progress >= 80 ? 'Advanced' : progress >= 50 ? 'Intermediate' : 'Beginner';
        
        return `
            <tr>
                <td>${user.username}</td>
                <td><span class="role-badge role-${user.role.toLowerCase().replace(' ', '-')}">${user.role}</span></td>
                <td>${user.modulesCompleted}</td>
                <td>${avgScore}%</td>
                <td>${new Date(user.lastActivity).toLocaleDateString()}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}%</span>
                </td>
                <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            </tr>
        `;
    }).join('');
}

// Generate quiz performance data
function generateQuizPerformance() {
    const quizResults = window.quizResults || [];
    
    if (quizResults.length === 0) {
        // No quiz data available
        document.getElementById('totalQuizzesTaken').textContent = '0';
        document.getElementById('avgQuizScore').textContent = '0%';
        document.getElementById('quizPassRate').textContent = '0%';
        document.getElementById('avgQuizTime').textContent = '0m';
        return;
    }
    
    // Calculate quiz statistics
    const totalQuizzes = quizResults.length;
    const avgScore = Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / totalQuizzes);
    const passRate = Math.round((quizResults.filter(result => result.passed).length / totalQuizzes) * 100);
    const avgTime = 15; // Mock average time in minutes
    
    // Update quiz performance cards
    document.getElementById('totalQuizzesTaken').textContent = totalQuizzes;
    document.getElementById('avgQuizScore').textContent = `${avgScore}%`;
    document.getElementById('quizPassRate').textContent = `${passRate}%`;
    document.getElementById('avgQuizTime').textContent = `${avgTime}m`;
}

// Render charts
function renderCharts() {
    // User Progress Over Time Chart
    renderProgressChart();
    
    // Module Completion by Role Chart
    renderRoleChart();
    
    // Top Performing Modules Chart
    renderModuleChart();
    
    // User Engagement Heatmap
    renderHeatmap();
}

// Render progress chart
function renderProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (window.progressChart && typeof window.progressChart.destroy === 'function') {
        window.progressChart.destroy();
    }
    
    // Generate mock data for the last 30 days
    const labels = [];
    const progressData = [];
    const completionData = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Mock data - in real app, this would come from database
        progressData.push(Math.floor(Math.random() * 20) + 10);
        completionData.push(Math.floor(Math.random() * 5) + 1);
    }
    
    window.progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'User Progress',
                data: progressData,
                borderColor: '#E51636',
                backgroundColor: 'rgba(229, 22, 54, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Render role chart
function renderRoleChart() {
    const ctx = document.getElementById('roleChart');
    if (!ctx) return;
    
    if (window.roleChart && typeof window.roleChart.destroy === 'function') {
        window.roleChart.destroy();
    }
    
    const users = window.cachedUsers || [];
    const roleCounts = {
        'Admin': users.filter(u => u.role === 'admin').length,
        'Director': users.filter(u => u.role === 'director').length,
        'Team Member': users.filter(u => u.role === 'team_member').length
    };
    
    window.roleChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(roleCounts),
            datasets: [{
                data: Object.values(roleCounts),
                backgroundColor: [
                    '#E51636',
                    '#20B2AA',
                    '#6C757D'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Render module chart
function renderModuleChart() {
    const ctx = document.getElementById('moduleChart');
    if (!ctx) return;
    
    if (window.moduleChart && typeof window.moduleChart.destroy === 'function') {
        window.moduleChart.destroy();
    }
    
    // Mock data for top performing modules
    const moduleData = {
        labels: ['Leadership Fundamentals', 'Team Communication', 'Project Management', 'Conflict Resolution', 'Strategic Thinking'],
        data: [85, 78, 72, 68, 65]
    };
    
    window.moduleChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: moduleData.labels,
            datasets: [{
                label: 'Completion Rate (%)',
                data: moduleData.data,
                backgroundColor: '#E51636',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Render heatmap
function renderHeatmap() {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;
    
    // Mock heatmap data
    container.innerHTML = `
        <div style="text-align: center; color: #6C757D;">
            <i class="fas fa-calendar-alt" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
            <p>User Engagement Heatmap</p>
            <small>Coming Soon - Track daily user activity patterns</small>
        </div>
    `;
}

// Load and display quiz results table
function loadQuizResultsTable() {
    console.log('🔍 Loading quiz results table...');
    
    const quizResults = window.quizResults || [];
    const quizzes = window.quizzes || [];
    const users = window.cachedUsers || [];
    
    // Create a map of quiz IDs to quiz titles
    const quizMap = {};
    quizzes.forEach(quiz => {
        quizMap[quiz.id] = quiz.title;
    });
    
    // Create a map of usernames to user data
    const userMap = {};
    users.forEach(user => {
        userMap[user.username] = user;
    });
    
    // Sort results by date (newest first)
    const sortedResults = quizResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const tbody = document.getElementById('quizResultsTableBody');
    if (!tbody) return;
    
    if (sortedResults.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--medium-gray);">
                    <i class="fas fa-clipboard-list" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <p>No quiz results found</p>
                    <small>Quiz results will appear here once users start taking quizzes</small>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = sortedResults.map(result => {
        const quizTitle = quizMap[result.quizId] || 'Unknown Quiz';
        const user = userMap[result.username] || { username: result.username, fullName: result.username };
        const userInitial = user.fullName ? user.fullName.charAt(0).toUpperCase() : result.username.charAt(0).toUpperCase();
        
        // Calculate score percentage
        const score = result.score || 0;
        const earnedPoints = result.earnedPoints || 0;
        const totalPoints = result.totalPoints || 1;
        
        // Determine score color class
        let scoreClass = 'score-poor';
        if (score >= 90) scoreClass = 'score-excellent';
        else if (score >= 80) scoreClass = 'score-good';
        else if (score >= 70) scoreClass = 'score-fair';
        
        // Determine status
        const status = score >= 70 ? 'passed' : 'failed';
        const statusClass = status === 'passed' ? 'status-passed' : 'status-failed';
        
        // Format time taken
        const timeTaken = result.timeTaken ? formatTime(result.timeTaken) : 'N/A';
        
        // Format date
        const date = new Date(result.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        return `
            <tr>
                <td class="quiz-title">${quizTitle}</td>
                <td class="quiz-user">
                    <div class="user-avatar">${userInitial}</div>
                    <span>${user.fullName || result.username}</span>
                </td>
                <td class="quiz-score ${scoreClass}">${score}%</td>
                <td class="quiz-points">${earnedPoints}</td>
                <td class="quiz-points">${totalPoints}</td>
                <td class="quiz-time">${timeTaken}</td>
                <td class="quiz-date">${formattedDate}</td>
                <td class="quiz-status ${statusClass}">${status}</td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ Loaded ${sortedResults.length} quiz results`);
}

// Format time in minutes and seconds
function formatTime(seconds) {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Setup reports event listeners
function setupReportsEventListeners() {
    // Generate Report button
    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            loadReportsData();
            showToast('success', 'Report Generated', 'Analytics data has been refreshed');
        });
    }
    
    // Export Report button
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportReport);
    }
    
    // Refresh Data button
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadReportsData();
            showToast('success', 'Data Refreshed', 'All analytics data has been updated');
        });
    }
    
    // Refresh Quiz Results button
    const refreshQuizBtn = document.getElementById('refreshQuizResultsBtn');
    if (refreshQuizBtn) {
        refreshQuizBtn.addEventListener('click', () => {
            loadQuizResultsTable();
            showToast('success', 'Quiz Results Refreshed', 'Quiz results data has been updated');
        });
    }
    
    // Chart control buttons
    const chartBtns = document.querySelectorAll('.chart-btn');
    chartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            chartBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Update chart based on button data
            const chartType = e.target.dataset.chart;
            if (chartType === 'completions') {
                // Switch to completions view
                console.log('Switching to completions view');
            } else {
                // Switch to progress view
                console.log('Switching to progress view');
            }
        });
    });
}

// Export report functionality
function exportReport() {
    try {
        // Create CSV data
        const users = window.cachedUsers || [];
        const quizResults = window.quizResults || [];
        
        let csvContent = 'User,Role,Modules Completed,Avg Score,Last Activity,Progress,Status\n';
        
        // Add user data
        users.forEach(user => {
            const userResults = quizResults.filter(r => r.username === user.username);
            const avgScore = userResults.length > 0 ? 
                Math.round(userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length) : 0;
            const progress = Math.min(100, userResults.length * 10);
            const status = progress >= 80 ? 'Advanced' : progress >= 50 ? 'Intermediate' : 'Beginner';
            
            csvContent += `${user.username},${user.role || 'Team Member'},${userResults.length},${avgScore}%,${user.lastActivity || 'N/A'},${progress}%,${status}\n`;
        });
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leadership-reports-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('success', 'Export Complete', 'Report has been downloaded as CSV');
    } catch (error) {
        console.error('❌ Error exporting report:', error);
        showToast('error', 'Export Failed', 'Failed to export report data');
    }
}
