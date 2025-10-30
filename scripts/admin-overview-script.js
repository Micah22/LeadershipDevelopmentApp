// Admin User Overview Script

// Admin Overview Script loaded

// Test script removed - no longer needed

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
    setupQuizAssignmentEventListeners();
    
    // Load user data
    await loadUserData();
    
    // Theme initialization is handled by navbar-component.js
    
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

// Session storage for checklist state (in-memory only, reset on page refresh)
window.checklistSessionCache = {};

// Clean up corrupted localStorage data (keys with undefined values)
function cleanupLocalStorageData() {
    try {
        // Initialize session cache
        window.checklistSessionCache = {};
        console.log('Initialized checklist session cache');
    } catch (error) {
        console.error('Error in cleanupLocalStorageData:', error);
    }
}

async function initializePage() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        alert('Please log in to access this page.');
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user has permission to view users
    if (!window.permissionManager || !window.permissionManager.hasPermission('view_users')) {
        alert('Access denied. You do not have permission to view user management.');
        window.location.href = 'user-dashboard.html';
        return;
    }
    
    // Clean up corrupted localStorage data (undefined keys)
    cleanupLocalStorageData();
    
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
    
    // Setting up UI for role
    
    // Get the role ID for permission checking
    const roleId = reverseRoleMapping[userRole] || 'team-member';
    // Role ID for permissions
    
    // Find the role definition to get page access
    const roleDefinition = roles.find(r => r.id === roleId);
    const userPageAccess = roleDefinition ? (roleDefinition.pageAccess || []) : pageAccessLevels[1];
    // User page access from role definition
    
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
            // Show/hide sidebar items based on permissions
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
    
    // Update tab visibility based on page access
    updateTabVisibility();
}

// Update tab visibility based on current user's page access
function updateTabVisibility() {
    if (!tabsComponent || typeof TabsComponent === 'undefined') {
        return;
    }
    
    const currentUser = window.currentUser;
    const userRole = currentUser?.role || 'Team Member';
    
    // Get the role ID for permission checking
    const roleId = reverseRoleMapping[userRole] || 'team-member';
    
    // Find the role definition to get page access
    const roleDefinition = roles.find(r => r.id === roleId || r.role_id === roleId);
    const userPageAccess = roleDefinition ? (roleDefinition.pageAccess || roleDefinition.page_access || []) : pageAccessLevels[1];
    
    // Map of tab IDs to page access IDs
    const tabPageAccessMap = {
        'userManagement': 'userManagement',
        'pathManagement': 'pathManagement',
        'roleManagement': 'roleManagement',
        'reports': 'reports',
        'settings': 'settings'
    };
    
    // Update visibility for each tab
    Object.keys(tabPageAccessMap).forEach(tabId => {
        const pageAccessId = tabPageAccessMap[tabId];
        const hasAccess = userPageAccess.includes(pageAccessId);
        tabsComponent.setTabVisibility(tabId, hasAccess);
    });
    
    // If the currently active tab was hidden, switch to the first visible tab
    const activeTab = tabsComponent.container?.querySelector('.admin-tab.active');
    if (activeTab && activeTab.style.display === 'none') {
        const visibleTabs = Array.from(tabsComponent.container?.querySelectorAll('.admin-tab') || [])
            .filter(tab => tab.style.display !== 'none');
        if (visibleTabs.length > 0) {
            tabsComponent.setActiveTab(visibleTabs[0].dataset.tab);
        }
    }
}

// Refresh role-based UI after role changes
function refreshRoleBasedUI() {
    // Refreshing role-based UI after role changes
    setupRoleBasedUI();
}

async function updateUserInfo() {
    const username = localStorage.getItem('username');
    const users = await getUsers();
    const user = users.find(u => u.username === username);
    
    if (user) {
        // User info display is handled by navbar-component.js
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
    
    
    // User info is handled by navbar-component.js
    
    // Theme toggle and sign out functionality is handled by navbar-component.js
    
    
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
    
    // Filtered users for role
    
    // Cache users data to avoid redundant queries
    window.cachedUsers = filteredUsers;
    window.allUsersForFilter = filteredUsers; // Store for search filtering
    
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
    // Loaded progress data for all users
    
    // Update summary cards
    updateSummaryCards(filteredUsers);
    
    // Update role statistics
    updateRoleStats(filteredUsers);
    
    // Update user progress table
    updateUserProgressTable(filteredUsers);
    
    // Setup search functionality
    setupUserSearch();
    
    // Load module assignments
    loadModuleAssignments();
    
    // Load quiz assignments
    loadQuizAssignments();
    
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
                        <button class="action-btn" onclick="editUser('${user.username}')" data-permission="edit_users">
                            <i class="fas fa-edit"></i>
                            Edit User
                        </button>
                        <button class="action-btn action-btn-info" onclick="viewUserDetails('${user.username}')">
                            <i class="fas fa-info-circle"></i>
                            Details
                        </button>
                        <button class="action-btn action-btn-danger" onclick="resetUserProgress('${user.username}')" title="Reset User Progress" data-permission="reset_progress">
                            <i class="fas fa-undo"></i>
                            Reset Progress
                        </button>
                        <button class="action-btn action-btn-danger" onclick="deleteUser('${user.id || user.username}', '${user.full_name || user.fullName || user.username}')" title="Delete User" data-permission="delete_users">
                            <i class="fas fa-trash"></i>
                            Delete User
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
                    <button class="action-btn-mobile" onclick="editUser('${user.username}')" data-permission="edit_users">
                        Edit
                    </button>
                    <button class="action-btn-mobile primary" onclick="viewUserDetails('${user.username}')">
                        Details
                    </button>
                    <button class="action-btn-mobile danger delete-btn-user-card" onclick="deleteUser('${user.id || user.username}', '${user.full_name || user.fullName || user.username}')" data-permission="delete_users">
                        Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    tableBody.innerHTML = tableRows.join('');
    mobileTable.innerHTML = mobileCards.join('');
    
    // Apply permission-based visibility after rendering
    if (window.permissionManager) {
        window.permissionManager.applyElementVisibility();
    }
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
            // Progress reset for user
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

// Setup user search and filter functionality
function setupUserSearch() {
    const searchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('userRoleFilter');
    
    if (!searchInput) {
        return;
    }
    
    // Combined filter function
    const applyFilters = () => {
        if (!window.allUsersForFilter || window.allUsersForFilter.length === 0) {
            return;
        }
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedRole = roleFilter ? roleFilter.value : '';
        
        // Filter users based on search term and role
        let filteredUsers = window.allUsersForFilter.filter(user => {
            // Apply role filter if selected
            if (selectedRole && user.role !== selectedRole) {
                return false;
            }
            
            // Apply search term filter if provided
            if (searchTerm) {
                const fullName = (user.full_name || user.fullName || '').toLowerCase();
                const username = (user.username || '').toLowerCase();
                const email = (user.email || '').toLowerCase();
                const role = (user.role || '').toLowerCase();
                
                return fullName.includes(searchTerm) ||
                       username.includes(searchTerm) ||
                       email.includes(searchTerm) ||
                       role.includes(searchTerm);
            }
            
            return true;
        });
        
        updateUserProgressTable(filteredUsers);
    };
    
    // Add event listeners
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if (roleFilter) {
        roleFilter.addEventListener('change', applyFilters);
    }
}

// Delete user function
async function deleteUser(userIdOrUsername, displayName) {
    // Prevent deleting yourself
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const users = await getAllUsers();
    const userToDelete = users.find(u => (u.id === userIdOrUsername || u.username === userIdOrUsername));
    
    if (userToDelete && currentUser.username === userToDelete.username) {
        showToast('error', 'Cannot Delete User', 'You cannot delete your own account.');
        return;
    }
    
    // Show confirmation dialog
    const confirmed = confirm(
        `Are you sure you want to permanently delete user "${displayName}"?\n\n` +
        `This will:\n` +
        `• Remove the user from the system\n` +
        `• Delete all their progress data\n` +
        `• Delete all their module assignments\n` +
        `• Delete all their quiz assignments\n\n` +
        `This action cannot be undone.`
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        // Get the full user object to ensure we have the ID
        if (!userToDelete) {
            showToast('error', 'User Not Found', `User "${displayName}" not found`);
            return;
        }
        
        const userId = userToDelete.id;
        
        if (!userId) {
            showToast('error', 'Invalid User', 'Cannot delete user: missing user ID');
            return;
        }
        
        // Delete from database
        if (window.dbService && window.dbService.isConfigured) {
            await window.dbService.deleteUser(userId);
            console.log(`✅ User deleted from database: ${userId}`);
        }
        
        // Remove from localStorage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = localUsers.filter(u => u.id !== userId && u.username !== userIdOrUsername);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Show success message
        showToast('success', 'User Deleted', `User "${displayName}" has been permanently deleted.`);
        
        // Reload the user data to refresh the display
        await loadUserData();
        
    } catch (error) {
        console.error('Failed to delete user:', error);
        showToast('error', 'Delete Failed', `Failed to delete user "${displayName}": ${error.message || 'Unknown error'}`);
    }
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
    
    // Get quiz results for this user (DB-first, cache fallback)
    let quizResults = [];
    try {
        if (window.dbService && window.dbService.isConfigured && user.id && typeof window.dbService.getQuizResults === 'function') {
            quizResults = await window.dbService.getQuizResults(user.id);
            try { localStorage.setItem('quizResults', JSON.stringify(quizResults)); } catch(_) {}
        } else {
            quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
        }
    } catch (e) {
        console.warn('Falling back to cached quizResults:', e);
        quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    }
    
    // Also load quiz results from database (quiz_assignments with scores)
    let dbQuizResults = [];
    try {
        if (window.dbService && window.dbService.isConfigured && user.id) {
            // Get quiz assignments for this user that have scores (completed quizzes)
            const assignments = await window.dbService.getQuizAssignments(user.id);
            console.log('📋 All quiz assignments for user:', assignments.length, assignments);
            console.log('📋 Assignments with scores:', assignments.filter(a => a.score !== null && a.score !== undefined).length);
            
            dbQuizResults = assignments
                .filter(assignment => assignment.score !== null && assignment.score !== undefined)
                .map(assignment => ({
                    id: `db_${assignment.id}`,
                    quizId: assignment.quiz_id,
                    quizTitle: assignment.quiz_title || 'Unknown Quiz',
                    username: username,
                    score: assignment.score,
                    passed: assignment.passed || false,
                    dateTaken: assignment.updated_at || assignment.assigned_at,
                    completedAt: assignment.updated_at || assignment.assigned_at,
                    correctAnswers: null,
                    totalQuestions: null,
                    answers: [],
                    timeSpent: 0
                }));
            console.log('📋 Loaded quiz results from database:', dbQuizResults.length);
        }
    } catch (error) {
        console.error('Failed to load quiz results from database:', error);
    }
    
    // Add some test quiz data for admin user if none exists
    if (username === 'admin' && quizResults.length === 0 && dbQuizResults.length === 0) {
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
    
    // Merge localStorage results with database results
    // Prioritize database results over localStorage for the same quiz
    const mergedResults = [...dbQuizResults];
    quizResults.forEach(localResult => {
        if (localResult.username === username) {
            // Only add if we don't already have a database result for this quiz
            const existsInDb = dbQuizResults.some(dbResult => dbResult.quizId === localResult.quizId);
            if (!existsInDb) {
                mergedResults.push(localResult);
            }
        }
    });
    
    const userQuizResults = mergedResults;
    
    // Get all quizzes from database first, fallback to localStorage
    let allQuizzes = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            allQuizzes = await window.dbService.getQuizzes();
            console.log('📚 Loaded quizzes from database:', allQuizzes.length);
        }
    } catch (error) {
        console.error('Failed to load quizzes from database:', error);
    }
    
    // Fallback to localStorage if database failed or returned no quizzes
    if (allQuizzes.length === 0) {
        allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        console.log('📚 Loaded quizzes from localStorage:', allQuizzes.length);
    }
    
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
        
        // Added test module progress for admin user
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
                        // Use quizTitle from result if available, otherwise look it up
                        const quizTitle = result.quizTitle || (() => {
                        const quiz = allQuizzes.find(q => q.id === result.quizId);
                            return quiz ? quiz.title : 'Unknown Quiz';
                        })();
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
                            <div class="module-progress-item ${statusClass}" onclick="showModuleDetails('${username}', '${module.title}', ${JSON.stringify(module).replace(/"/g, '&quot;')})">
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
                                <div class="module-click-hint">
                                    <i class="fas fa-eye"></i>
                                    <span>Click to view details</span>
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

// Show detailed module progress for a specific user and module
async function showModuleDetails(username, moduleTitle, moduleData) {
    try {
        // Get user data
        const users = await getUsers();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            showToast('error', 'Error', 'User not found');
            return;
        }
        
        // Get user's progress for this specific module
        const userProgress = await getUserProgress(username);
        const moduleProgress = userProgress[moduleTitle] || { completedTasks: 0, totalTasks: 0, checklist: [] };
        
        // Get all modules to find the full module details
        const allModules = await getAllModules();
        const module = allModules.find(m => m.title === moduleTitle);
        
        if (!module) {
            showToast('error', 'Error', 'Module not found');
            return;
        }
        
        // Get performance review data if it exists
        let performanceReview = null;
        try {
            const reviews = await window.dbService.getPerformanceReviews(user.id, module.id);
            if (reviews && reviews.length > 0) {
                performanceReview = reviews[0];
            }
        } catch (error) {
            console.error('Failed to load performance review:', error);
        }
        
        
        // Calculate progress percentage
        const progressPercentage = moduleProgress.totalTasks > 0 ? 
            Math.round((moduleProgress.completedTasks / moduleProgress.totalTasks) * 100) : 0;
        
        // Create the exact user progress modal content
        const modalContent = `
            <div class="user-progress-modal">
                <div class="modal-body">
                    <!-- Module Description -->
                    <div class="module-description-section">
                        <h3>Module Description</h3>
                        <div class="module-description" id="modalModuleDescription">
                            <p>${module.description || 'No description available.'}</p>
                            ${module.prerequisites ? `
                                <div class="prerequisites-info">
                                    <strong>Prerequisites:</strong> ${module.prerequisites}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Performance Rubric Section -->
                    <div class="rubric-section" id="modalRubricSection">
                        <h3>Performance Rubric</h3>
                        <div class="rubric-grid">
                            ${module.qualityUnsatisfactory || module.quality_unsatisfactory || module.quality_average || module.quality_excellent ? `
                            <div class="rubric-column">
                                <h4>Quality Criteria</h4>
                                ${module.qualityUnsatisfactory || module.quality_unsatisfactory ? `<div class="rubric-level unsatisfactory"><h5>Unsatisfactory</h5><p>${module.qualityUnsatisfactory || module.quality_unsatisfactory}</p></div>` : ''}
                                ${module.quality_average ? `<div class="rubric-level average"><h5>Average</h5><p>${module.quality_average}</p></div>` : ''}
                                ${module.quality_excellent ? `<div class="rubric-level excellent"><h5>Excellent</h5><p>${module.quality_excellent}</p></div>` : ''}
                            </div>
                            ` : ''}
                            ${module.speedUnsatisfactory || module.speed_unsatisfactory || module.speed_average || module.speed_excellent ? `
                            <div class="rubric-column">
                                <h4>Speed/Timing Criteria</h4>
                                ${module.speedUnsatisfactory || module.speed_unsatisfactory ? `<div class="rubric-level unsatisfactory"><h5>Unsatisfactory</h5><p>${module.speedUnsatisfactory || module.speed_unsatisfactory}</p></div>` : ''}
                                ${module.speed_average ? `<div class="rubric-level average"><h5>Average</h5><p>${module.speed_average}</p></div>` : ''}
                                ${module.speed_excellent ? `<div class="rubric-level excellent"><h5>Excellent</h5><p>${module.speed_excellent}</p></div>` : ''}
                            </div>
                            ` : ''}
                            ${module.communicationUnsatisfactory || module.communication_unsatisfactory || module.communication_average || module.communication_excellent ? `
                            <div class="rubric-column">
                                <h4>Communication Criteria</h4>
                                ${module.communicationUnsatisfactory || module.communication_unsatisfactory ? `<div class="rubric-level unsatisfactory"><h5>Unsatisfactory</h5><p>${module.communicationUnsatisfactory || module.communication_unsatisfactory}</p></div>` : ''}
                                ${module.communication_average ? `<div class="rubric-level average"><h5>Average</h5><p>${module.communication_average}</p></div>` : ''}
                                ${module.communication_excellent ? `<div class="rubric-level excellent"><h5>Excellent</h5><p>${module.communication_excellent}</p></div>` : ''}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Learning Checklist -->
                    <div class="learning-checklist-section">
                        <h3>Learning Checklist</h3>
                        <div class="checklist" id="modalChecklist">
                            ${module.checklist ? module.checklist.map((task, index) => {
                                const isCompleted = moduleProgress.checklist && moduleProgress.checklist[index];
                                // Handle different task data structures
                                let taskText = '';
                                if (typeof task === 'string') {
                                    taskText = task;
                                } else if (typeof task === 'object' && task !== null) {
                                    // If task is an object, try to get the text property or convert to string
                                    taskText = task.text || task.title || task.name || task.description || JSON.stringify(task);
                                } else {
                                    taskText = String(task);
                                }
                                
                                return `
                                    <div class="checklist-item ${isCompleted ? 'completed' : 'uncompleted'}">
                                        <input type="checkbox" class="checklist-checkbox" id="admin-checklist-${username}-${moduleTitle}-${index}" 
                                               ${isCompleted ? 'checked' : ''} 
                                               onchange="toggleChecklistItem('${username}', '${moduleTitle}', ${index})">
                                        <label for="admin-checklist-${username}-${moduleTitle}-${index}" class="checklist-label">${taskText}</label>
                                    </div>
                                `;
                            }).join('') : '<p>No checklist items available.</p>'}
                        </div>
                    </div>
                    
                    <!-- Performance Review Checklist -->
                    <div class="performance-review-section">
                        <h3>Performance Review Checklist</h3>
                        <div class="overall-performance-rating">
                            <h4>Overall Performance Rating</h4>
                            <div class="review-entries">
                                ${[0, 1, 2].map(reviewIdx => `
                                <div class="review-entry" data-review-index="${reviewIdx}">
                                    <div class="rating-circles">
                                        <div class="circle green" data-rating="excellent" onclick="selectRating(this, '${username}', '${moduleTitle}', ${reviewIdx}, 'excellent')" style="cursor: pointer;"></div>
                                        <div class="circle orange" data-rating="average" onclick="selectRating(this, '${username}', '${moduleTitle}', ${reviewIdx}, 'average')" style="cursor: pointer;"></div>
                                        <div class="circle red" data-rating="unsatisfactory" onclick="selectRating(this, '${username}', '${moduleTitle}', ${reviewIdx}, 'unsatisfactory')" style="cursor: pointer;"></div>
                                    </div>
                                    <div class="review-fields">
                                        <div class="field-row">
                                            <div class="field-group">
                                                <label>Date:</label>
                                                <input type="date" class="review-input" placeholder="mm/dd/yyyy">
                                            </div>
                                            <div class="field-group">
                                                <label>Trainee Initials:</label>
                                                <input type="text" class="review-input" maxlength="3" placeholder="Trainee Initials">
                                            </div>
                                            <div class="field-group">
                                                <label>Trainer Signature:</label>
                                                <input type="text" class="review-input signature" placeholder="Trainer Signature">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Trainer Comments and Feedback -->
                    <div class="trainer-comments-section">
                        <h4>Trainer Comments and Feedback</h4>
                        <div class="comments-container">
                            <div class="comment-entry">
                                <input type="text" class="trainer-initials-input" maxlength="3" placeholder="initls">
                                <textarea class="comment-line" placeholder="Comment 1"></textarea>
                            </div>
                            <div class="comment-entry">
                                <input type="text" class="trainer-initials-input" maxlength="3" placeholder="initls">
                                <textarea class="comment-line" placeholder="Comment 2"></textarea>
                            </div>
                            <div class="comment-entry">
                                <input type="text" class="trainer-initials-input" maxlength="3" placeholder="initls">
                                <textarea class="comment-line" placeholder="Comment 3"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModuleDetailsModal()">Close</button>
                    <button class="btn btn-info refresh-progress-btn" onclick="refreshModuleDetails('${username}', '${moduleTitle}')">
                        <i class="fas fa-sync"></i> Refresh Progress
                    </button>
                    ${canEditModule(window.currentUser?.role || 'Team Member') ? `
                        <button class="btn btn-success save-module-btn" onclick="saveModuleDetails('${username}', '${moduleTitle}')">
                            <i class="fas fa-save"></i> <span class="btn-text">Save All Changes</span>
                        </button>
                        <button class="btn btn-primary edit-module-btn" onclick="enableModuleEditing('${username}', '${moduleTitle}')">
                            <i class="fas fa-edit"></i> <span class="btn-text">Edit Module</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Show the modal
        showModuleDetailsModal(modalContent, `${user.full_name || user.fullName || user.username} - ${moduleTitle}`);
        
        // Populate performance review data if it exists
        if (performanceReview) {
            const modal = document.getElementById('moduleDetailsModal');
            
            // Parse trainer comments and team member goals
            let trainerComments = [];
            let teamMemberGoals = [];
            
            try {
                if (performanceReview.trainer_comments) {
                    trainerComments = JSON.parse(performanceReview.trainer_comments);
                }
                if (performanceReview.team_member_goals) {
                    teamMemberGoals = JSON.parse(performanceReview.team_member_goals);
                }
            } catch (e) {
                console.error('Failed to parse review data:', e);
            }
            
        // Populate first review entry with saved data
        const firstReviewEntry = modal.querySelector('.review-entry');
        if (firstReviewEntry) {
            // Date and text fields
            if (performanceReview.review_date) {
                const dateInput = firstReviewEntry.querySelector('input[type="date"]');
                if (dateInput) dateInput.value = performanceReview.review_date;
            }
            const textInputs = firstReviewEntry.querySelectorAll('input[type="text"]');
            if (textInputs[0] && performanceReview.trainee_initials) textInputs[0].value = performanceReview.trainee_initials;
            if (textInputs[1] && performanceReview.trainer_signature) textInputs[1].value = performanceReview.trainer_signature;

            // Restore selected rating circle from overall_rating
            if (performanceReview.overall_rating) {
                const ratingMapReverse = {
                    'Excellent': 'excellent',
                    'Average': 'average',
                    'Unsatisfactory': 'unsatisfactory'
                };
                const normalized = ratingMapReverse[performanceReview.overall_rating] || null;
                if (normalized) {
                    const circle = firstReviewEntry.querySelector(`.rating-circles .circle[data-rating="${normalized}"]`);
                    if (circle) {
                        // mimic selectRating visuals and class
                        firstReviewEntry.querySelectorAll('.rating-circles .circle').forEach(c => {
                            c.classList.remove('selected');
                            c.style.border = '';
                            c.style.boxShadow = '';
                        });
                        circle.classList.add('selected');
                        circle.style.border = '3px solid #333';
                        circle.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
                        circle.dataset.selectedRating = normalized;
                    }
                }
            }
        }
            
            // Populate trainer comments
            trainerComments.forEach((comment, index) => {
                const commentEntry = modal.querySelectorAll('.comment-entry')[index];
                if (commentEntry) {
                    const initialsInput = commentEntry.querySelector('.trainer-initials-input');
                    const commentTextarea = commentEntry.querySelector('.comment-line');
                    if (initialsInput) initialsInput.value = comment.initials || '';
                    if (commentTextarea) commentTextarea.value = comment.comment || '';
                }
            });
            
            // Populate team member goals
            teamMemberGoals.forEach((goal, index) => {
                const goalEntry = modal.querySelectorAll('.goal-entry')[index];
                if (goalEntry) {
                    const goalInput = goalEntry.querySelector('.goal-input');
                    const dueDateInput = goalEntry.querySelector('.due-date-input');
                    if (goalInput) goalInput.value = goal.goal || '';
                    if (dueDateInput) dueDateInput.value = goal.due_date || '';
                }
            });
        }
        
    } catch (error) {
        console.error('Error showing module details:', error);
        showToast('error', 'Error', 'Failed to load module details');
    }
}

// Check if user role can edit modules
function canEditModule(userRole) {
    const editableRoles = ['Admin', 'Director', 'Supervisor'];
    return editableRoles.includes(userRole);
}

// Enable module editing mode
function enableModuleEditing(username, moduleTitle) {
    // This will be implemented later for role-based editing
    showToast('info', 'Edit Mode', 'Module editing functionality will be available soon');
}

// Refresh module details manually (expose to window for onclick handlers)
window.refreshModuleDetails = async function refreshModuleDetails(username, moduleTitle) {
    try {
        const userProgress = await getUserProgress(username);
        await refreshModuleDetailsModal(username, moduleTitle, userProgress);
        showToast('success', 'Refreshed', 'Module details have been refreshed');
    } catch (error) {
        console.error('Error refreshing module details:', error);
        showToast('error', 'Error', 'Failed to refresh module details');
    }
}

// Save all module details (performance reviews, trainer comments, team member goals) (expose to window for onclick handlers)
window.saveModuleDetails = async function saveModuleDetails(username, moduleTitle) {
    try {
        showToast('info', 'Saving', 'Saving all module details...');
        
        // Get user and module data
        const users = await getUsers();
        const user = users.find(u => u.username === username);
        const allModules = await getAllModules();
        const module = allModules.find(m => m.title === moduleTitle);
        
        if (!user || !module) {
            showToast('error', 'Error', 'User or module not found');
            return;
        }
        
        // Collect all performance review data from the modal
        const modal = document.getElementById('moduleDetailsModal');
        const reviewEntries = modal.querySelectorAll('.review-entry');
        const trainerComments = [];
        const teamMemberGoals = [];
        
        // Collect trainer comments
        const commentEntries = modal.querySelectorAll('.comment-entry');
        commentEntries.forEach((entry, index) => {
            const initials = entry.querySelector('.trainer-initials-input')?.value || '';
            const comment = entry.querySelector('.comment-line')?.value || '';
            if (initials || comment) {
                trainerComments.push({
                    initials: initials,
                    comment: comment,
                    order: index
                });
            }
        });
        
        // Collect team member goals
        const goalEntries = modal.querySelectorAll('.goal-entry');
        goalEntries.forEach((entry, index) => {
            const goal = entry.querySelector('.goal-input')?.value || '';
            const dueDate = entry.querySelector('.due-date-input')?.value || '';
            if (goal || dueDate) {
                teamMemberGoals.push({
                    goal: goal,
                    due_date: dueDate,
                    order: index
                });
            }
        });
        
        // Collect performance review data (we'll save the first one with data)
        let savedReview = false;
        for (let i = 0; i < reviewEntries.length && !savedReview; i++) {
            const entry = reviewEntries[i];
            const date = entry.querySelector('input[type="date"]')?.value || '';
            const textInputs = entry.querySelectorAll('input[type="text"]');
            const traineeInitials = textInputs.length > 0 ? textInputs[0].value || '' : '';
            const trainerSignature = textInputs.length > 1 ? textInputs[1].value || '' : '';
            
            // Check for selected rating
            const selectedRatingCircle = entry.querySelector('.circle.selected');
            const ratingRaw = selectedRatingCircle?.dataset?.selectedRating || selectedRatingCircle?.dataset?.rating || null;
            
            // Map rating from lowercase to proper case for database (Excellent, Average, Unsatisfactory)
            let overallRating = null;
            if (ratingRaw) {
                const ratingMap = {
                    'excellent': 'Excellent',
                    'average': 'Average',
                    'unsatisfactory': 'Unsatisfactory'
                };
                overallRating = ratingMap[ratingRaw.toLowerCase()] || null;
            }
            
            // Save if any data exists
            if (date || traineeInitials || trainerSignature || overallRating) {
                // Save this review
                const reviewData = {
                    user_id: user.id,
                    module_id: module.id,
                    review_date: date || null,
                    trainee_initials: traineeInitials || null,
                    trainer_signature: trainerSignature || null,
                    overall_rating: overallRating || null,
                    trainer_comments: JSON.stringify(trainerComments),
                    team_member_goals: JSON.stringify(teamMemberGoals)
                };
                
                // Check if review already exists
                const existingReviews = await window.dbService.getPerformanceReviews(user.id, module.id);
                if (existingReviews && existingReviews.length > 0) {
                    // Update existing review
                    await window.dbService.updatePerformanceReview(existingReviews[0].id, reviewData);
                } else {
                    // Create new review
                    await window.dbService.createPerformanceReview(reviewData);
                }
                
                savedReview = true;
            }
        }
        
        showToast('success', 'Saved', 'All module details have been saved successfully');
    } catch (error) {
        console.error('Error saving module details:', error);
        showToast('error', 'Error', 'Failed to save module details');
    }
}

// Toggle checklist item completion for a user
async function toggleChecklistItem(username, moduleTitle, itemIndex) {
    try {
        // Get current user progress
        const userProgress = await getUserProgress(username);
        const moduleProgress = userProgress[moduleTitle] || { completedTasks: 0, totalTasks: 0, checklist: [] };
        
        // Initialize checklist array if it doesn't exist
        if (!moduleProgress.checklist) {
            moduleProgress.checklist = [];
        }
        
        // Get module data to ensure we have the right checklist length
        const allModules = await getAllModules();
        const module = allModules.find(m => m.title === moduleTitle);
        if (!module || !module.checklist) {
            console.error('Module data not found for:', moduleTitle);
            return;
        }
        
        // Ensure checklist array is the right length
        while (moduleProgress.checklist.length < module.checklist.length) {
            moduleProgress.checklist.push(false);
        }
        
        // Toggle classes on the clicked item immediately - find the checkbox first
        const checkboxId = `admin-checklist-${username}-${moduleTitle}-${itemIndex}`;
        const checkbox = document.getElementById(checkboxId);
        const clickedItem = checkbox ? checkbox.closest('.checklist-item') : null;
        
        // Get the checkbox's current state (before we update the data)
        const currentlyChecked = checkbox ? checkbox.checked : false;
        
        // Toggle the specific item based on checkbox state
        const isCompleted = currentlyChecked;
        moduleProgress.checklist[itemIndex] = isCompleted;
        
        if (clickedItem) {
            if (isCompleted) {
                clickedItem.classList.remove('uncompleted');
                clickedItem.classList.add('completed');
            } else {
                clickedItem.classList.remove('completed');
                clickedItem.classList.add('uncompleted');
            }
        }
        
        // Update completed tasks count
        const completedCount = moduleProgress.checklist.filter(item => item === true).length;
        const totalCount = moduleProgress.checklist.length;
        const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        moduleProgress.completedTasks = completedCount;
        moduleProgress.totalTasks = totalCount;
        moduleProgress.progress = progressPercentage;
        
        // Save to database using the same method as user progress page
        try {
            const users = await getUsers();
            const user = users.find(u => u.username === username);
            
            if (user && module) {
                // Use the new method that saves the full checklist array
                await window.dbService.updateUserProgressWithChecklist(
                    user.id,
                    module.id,
                    completedCount,
                    totalCount,
                    progressPercentage,
                    moduleProgress.checklist
                );
                
            }
        } catch (error) {
            console.error('Failed to save progress to database:', error);
        }
        
        // Save checklist state to session cache
        const cacheKey = `${username}_${moduleTitle}`;
        window.checklistSessionCache[cacheKey] = {
            checklist: moduleProgress.checklist,
            completedTasks: completedCount,
            totalTasks: totalCount,
            progressPercentage: progressPercentage
        };
        
        // Show success message
        const status = isCompleted ? 'completed' : 'marked as incomplete';
        showToast('success', 'Progress Updated', `Task ${status} for ${username}`);
        
        // Also update the module progress display in the user details modal if it's open
        const userDetailsModal = document.getElementById('userDetailsModal');
        if (userDetailsModal && userDetailsModal.style.display !== 'none') {
            // Update the specific module's progress in the module progress list
            const moduleProgressItems = document.querySelectorAll('.module-progress-item');
            moduleProgressItems.forEach(item => {
                const moduleTitleElement = item.querySelector('.module-title');
                if (moduleTitleElement && moduleTitleElement.textContent.trim() === moduleTitle) {
                    // Update progress bar
                    const progressFill = item.querySelector('.progress-fill');
                    const progressText = item.querySelector('.progress-text');
                    const moduleStatus = item.querySelector('.module-status');
                    
                    if (progressFill && progressText) {
                        const progressPercentage = moduleProgress.totalTasks > 0 ? 
                            Math.round((moduleProgress.completedTasks / moduleProgress.totalTasks) * 100) : 0;
                        
                        progressFill.style.width = `${progressPercentage}%`;
                        progressText.textContent = `${moduleProgress.completedTasks}/${moduleProgress.totalTasks} tasks`;
                        
                        // Update status
                        const statusClass = progressPercentage === 100 ? 'completed' : progressPercentage > 0 ? 'in-progress' : 'not-started';
                        const statusText = progressPercentage === 100 ? 'Completed' : progressPercentage > 0 ? 'In Progress' : 'Not Started';
                        
                        item.className = `module-progress-item ${statusClass}`;
                        if (moduleStatus) {
                            moduleStatus.textContent = statusText;
                        }
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Error toggling checklist item:', error);
        showToast('error', 'Error', 'Failed to update checklist item');
    }
}

// Select rating for performance review (expose to window for onclick handlers)
window.selectRating = function selectRating(circleElement, username, moduleTitle, reviewIndex, rating) {
    // Remove selected class from all circles in this entry
    const entry = circleElement.closest('.review-entry');
    if (entry) {
        entry.querySelectorAll('.circle').forEach(circle => {
            circle.classList.remove('selected');
            circle.style.border = '';
            circle.style.boxShadow = '';
        });
        
        // Add selected class to clicked circle
        circleElement.classList.add('selected');
        circleElement.style.border = '3px solid #333';
        circleElement.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        circleElement.dataset.selectedRating = rating;
    }
}

// Refresh the module details modal with updated data
async function refreshModuleDetailsModal(username, moduleTitle, freshUserProgress = null) {
    try {
        console.log('Refreshing modal for:', username, moduleTitle);
        
        // Get updated module data
        const allModules = await getAllModules();
        const module = allModules.find(m => m.title === moduleTitle);
        
        if (!module) {
            console.error('Module not found:', moduleTitle);
            showToast('error', 'Error', 'Module not found');
            return;
        }
        
        // Use fresh data if provided, otherwise get from storage
        let userProgress;
        if (freshUserProgress) {
            userProgress = freshUserProgress;
            console.log('Using fresh user progress data');
        } else {
            userProgress = await getUserProgress(username);
            console.log('Retrieved user progress from storage');
        }
        
        const moduleProgress = userProgress[moduleTitle] || { completedTasks: 0, totalTasks: 0, checklist: [] };
        
        console.log('Module progress for refresh:', moduleProgress);
        console.log('Module progress checklist content for refresh:', moduleProgress.checklist);
        console.log('Checklist array length:', moduleProgress.checklist ? moduleProgress.checklist.length : 'null/undefined');
        if (moduleProgress.checklist) {
            console.log('Checklist array values:', moduleProgress.checklist.map((val, i) => `[${i}]=${val}`).join(', '));
        }
        
        // Calculate updated progress percentage
        const progressPercentage = moduleProgress.totalTasks > 0 ? 
            Math.round((moduleProgress.completedTasks / moduleProgress.totalTasks) * 100) : 0;
        
        // Update the checklist items in the modal
        const checklistContainer = document.getElementById('modalChecklist');
        console.log('Checklist container found:', !!checklistContainer);
        
        if (checklistContainer && module.checklist) {
            console.log('Updating checklist HTML...');
            const updatedChecklistHTML = module.checklist.map((task, index) => {
                const isCompleted = moduleProgress.checklist && moduleProgress.checklist[index];
                console.log(`Item ${index}: ${isCompleted ? 'completed' : 'incomplete'}`);
                
                // Handle different task data structures
                let taskText = '';
                if (typeof task === 'string') {
                    taskText = task;
                } else if (typeof task === 'object' && task !== null) {
                    taskText = task.text || task.title || task.name || task.description || JSON.stringify(task);
                } else {
                    taskText = String(task);
                }
                
                const html = `
                    <div class="checklist-item ${isCompleted ? 'completed' : 'uncompleted'}">
                        <input type="checkbox" class="checklist-checkbox" id="admin-checklist-${username}-${moduleTitle}-${index}" 
                               ${isCompleted ? 'checked' : ''} 
                               onchange="toggleChecklistItem('${username}', '${moduleTitle}', ${index})">
                        <label for="admin-checklist-${username}-${moduleTitle}-${index}" class="checklist-label">${taskText}</label>
                    </div>
                `;
                
                console.log(`Generated HTML for item ${index}:`, html);
                return html;
            }).join('');
            
            console.log('Full checklist HTML:', updatedChecklistHTML);
            checklistContainer.innerHTML = updatedChecklistHTML;
            console.log('Checklist HTML updated');
            
            // Force a reflow to ensure the DOM updates
            checklistContainer.offsetHeight;
            
            // Log the actual DOM state after update
            const checklistItems = checklistContainer.querySelectorAll('.checklist-item');
            console.log('DOM items after update:', checklistItems.length);
            checklistItems.forEach((item, index) => {
                const isCompleted = item.classList.contains('completed');
                const checkbox = item.querySelector('input[type="checkbox"]');
                const isChecked = checkbox ? checkbox.checked : false;
                console.log(`DOM Item ${index}: completed=${isCompleted}, checked=${isChecked}`);
            });
        }
        
        // Update progress percentage in modal header if it exists
        const progressPercentageElement = document.querySelector('.modal-progress-percentage');
        if (progressPercentageElement) {
            progressPercentageElement.textContent = `${progressPercentage}%`;
        }
        
        // Update progress bar if it exists
        const progressFillElement = document.querySelector('.modal-progress-fill');
        if (progressFillElement) {
            progressFillElement.style.width = `${progressPercentage}%`;
        }
        
        console.log('Modal refresh completed');
        
    } catch (error) {
        console.error('Error refreshing modal:', error);
        showToast('error', 'Error', 'Failed to refresh modal');
    }
}

// Show module details modal
function showModuleDetailsModal(content, title) {
    // Remove existing module details modal if any
    const existingModal = document.getElementById('moduleDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal-open class to body to prevent background scrolling
    // Save scroll position before fixing body
    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('modal-open');
    
    // Create modal HTML with user progress styling
    const modalHtml = `
        <div class="modal-overlay show" id="moduleDetailsModal">
            <div class="modal-content user-progress-modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="closeModuleDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close module details modal (expose to window for onclick handlers)
window.closeModuleDetailsModal = function closeModuleDetailsModal() {
    const modal = document.getElementById('moduleDetailsModal');
    if (modal) {
        modal.remove();
    }
    
    // Remove modal-open class from body to restore background scrolling
    const scrollY = document.body.style.top;
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
}

async function openUserModal(username) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSave = document.getElementById('modalSave');
    const modalDeleteBtn = document.getElementById('modalDeleteUser');
    const users = await getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
        alert('User not found');
        return;
    }
    
    // Update modal title and button for editing
    modalTitle.textContent = 'Edit User';
    // Save button is now icon-only, no text change needed
    
    // Populate form with user data
    document.getElementById('editFullName').value = user.full_name || user.fullName || '';
    document.getElementById('editUsername').value = user.username || '';
    document.getElementById('editPassword').value = user.password || (user.password_hash ? atob(user.password_hash) : '');
    document.getElementById('editRole').value = user.role || 'Team Member';
    document.getElementById('editStatus').value = user.status || 'active';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editStartDate').value = user.start_date || user.startDate || '';
    
    // Store current user info for updates and delete
    modal.dataset.currentUsername = username;
    modal.dataset.currentUserId = user.id || username;
    modal.dataset.currentDisplayName = user.full_name || user.fullName || username;
    
    // Show delete button on mobile (it's hidden by default in CSS)
    if (modalDeleteBtn) {
        // The button will be shown on mobile via CSS media query
        modalDeleteBtn.onclick = function() {
            deleteUser(modal.dataset.currentUserId, modal.dataset.currentDisplayName);
            closeUserModal();
        };
    }
    
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
    // Save button is now icon-only, no text change needed
    
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
    
    // Getting user progress
    
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
                // Get progress from database - this is now our source of truth
                const dbProgress = await window.dbService.getUserProgress(user.id);
                
                // Get modules from database
                const modules = await window.dbService.getModules();
                
                // Build userProgress object from database data
                dbProgress.forEach(p => {
                    const module = modules.find(m => m.id === p.module_id);
                    if (module && module.title) {
                        const cacheKey = `${username}_${module.title}`;
                        
                        // Check if we have cached checklist state for this module
                        if (window.checklistSessionCache[cacheKey]) {
                            userProgress[module.title] = window.checklistSessionCache[cacheKey];
                        } else {
                            // Load checklist from database if available, otherwise initialize as all unchecked
                            let checklist = Array(p.total_tasks || module.checklist?.length || 0).fill(false);
                            if (p.checklist && Array.isArray(p.checklist)) {
                                checklist = p.checklist;
                            }
                            
                        userProgress[module.title] = {
                            completedTasks: p.completed_tasks || 0,
                            totalTasks: p.total_tasks || 0,
                            progressPercentage: p.progress_percentage || 0,
                                checklist: checklist
                            };
                        }
                    }
                });
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

// Tab navigation setup using TabsComponent
function setupTabNavigation() {
    if (typeof TabsComponent === 'undefined' || !tabsComponent) {
        console.error('TabsComponent not available');
        return;
    }

    // Define tabs configuration
    const tabsConfig = [
        {
            id: 'userManagement',
            label: 'User Management',
            icon: 'fas fa-users'
        },
        {
            id: 'pathManagement',
            label: 'Path Management',
            icon: 'fas fa-cogs'
        },
        {
            id: 'roleManagement',
            label: 'Role Management',
            icon: 'fas fa-user-shield'
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: 'fas fa-chart-bar'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: 'fas fa-cog'
        }
    ];

    // Create tabs with callbacks
    tabsComponent.options.showRefresh = true;
    tabsComponent.options.refreshCallback = refreshDataFromDatabase;
    tabsComponent.options.tabChangeCallback = handleTabChange;
    tabsComponent.createTabs(tabsConfig);
    
    // Apply page access filtering to tabs
    updateTabVisibility();
}

// Handle tab change events
function handleTabChange(tabId) {
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

// Content switching functions
function showUserManagementContent() {
    // User management content is now handled by tab switching
    // This function can be used for any additional setup needed
    // User Management content shown
}

async function showPathManagementContent() {
    try {
        // Path management content is now handled by tab switching
        // Path Management content shown
        
        // Check if user has view_modules permission before loading modules
        if (window.permissionManager && window.permissionManager.hasPermission('view_modules')) {
        // Load modules data when showing path management
        try {
            await loadModulesData();
        } catch (error) {
            console.error('Error in loadModulesData:', error);
        }
        
        // Setup search and filter functionality
        setupSearchAndFilter();
        } else {
            // Hide modules grid if user doesn't have view_modules permission
            const modulesGrid = document.getElementById('modulesManagementGrid');
            if (modulesGrid) {
                modulesGrid.innerHTML = '<div class="no-modules-message"><p>You do not have permission to view modules.</p></div>';
            }
        }
        
        // Apply permission-based visibility
        if (window.permissionManager) {
            window.permissionManager.applyElementVisibility();
        }
    } catch (error) {
        console.error('Error in showPathManagementContent:', error);
    }
}

async function showRoleManagementContent() {
    try {
        // Role management content is now handled by tab switching
        // Role Management content shown
            
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
                        <button class="btn btn-secondary" onclick="editModule('${module.title}')" data-permission="edit_modules">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteModule('${module.title}')" data-permission="delete_modules">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        modulesGrid.innerHTML = modulesHTML;
        
        // Apply permission-based visibility after rendering
        if (window.permissionManager) {
            window.permissionManager.applyElementVisibility();
        }
}

// Path Management Functions (copied from admin-path-management-script.js)
async function loadModulesData() {
    try {
        // Loading modules data
        
        // Try to load from database first
        let modules = [];
        try {
            if (window.dbService && window.dbService.isConfigured) {
                // Fetching modules from database
                const dbModules = await window.dbService.getModules();
                // Database modules received
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
                                            // Restored file data from localStorage
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
                    // Modules with checklists stored in localStorage
                }
            }
        } catch (error) {
            console.warn('Failed to load modules from database, using localStorage:', error);
        }
        
        // Fallback to localStorage if database failed
        if (modules.length === 0) {
            // Using localStorage fallback
            // Initialize global modules if they don't exist
            initializeGlobalModules();
            modules = getAllModules();
            // localStorage modules
        }
        
        // Store modules in global variables for search/filter
        allModules = modules;
        filteredModules = modules;
        
        // Render modules using the new function
        renderModulesGrid(modules);
        // Total modules loaded
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
    
    // Rubric data collected
    
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
            // Updating module
            
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
            
            // Sending to database
            const result = await window.dbService.updateModule(updatedModule.id || updatedModule.title, dbModule);
            // Database update result
            
            // Save checklist items to module_checklist table
            if (checklist && checklist.length > 0) {
                // Saving checklist items
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
                            // Stored file data in localStorage
                        }
                        await window.dbService.createModuleChecklistItem(taskData);
                    }
                    // Checklist items saved successfully
                } catch (error) {
                    console.error('❌ Failed to save checklist items:', error);
                }
            }
        } else {
            // Create new module
            const newModule = modules[modules.length - 1];
            // Creating new module
            
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
            
            // Sending to database
            const result = await window.dbService.createModule(dbModule);
            // Database create result
            
            // Save checklist items to module_checklist table
            if (checklist && checklist.length > 0 && result && result.length > 0) {
                const createdModule = result[0];
                // Saving checklist items for new module
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
                            // Stored file data in localStorage
                        }
                        await window.dbService.createModuleChecklistItem(taskData);
                    }
                    // Checklist items saved successfully for new module
                } catch (error) {
                    console.error('❌ Failed to save checklist items for new module:', error);
                }
            }
        }
        
        // Sync to localStorage after successful database save
        localStorage.setItem('globalModules', JSON.stringify(modules));
        // Module saved successfully to both database and localStorage
    } catch (error) {
        console.error('Failed to save module to database:', error);
        showToast('error', 'Save Failed', `Failed to save module: ${error.message || 'Unknown error'}`);
        // Fallback to localStorage only
        localStorage.setItem('globalModules', JSON.stringify(modules));
        // Module saved to localStorage only (database unavailable)
    }


    // Close modal
    closeModuleModal();

    // Small delay to ensure database has processed the update
    await new Promise(resolve => setTimeout(resolve, 500));

    // Reload modules data
    // Reloading modules data after save
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

// Theme, dropdown, and user info functionality is handled by navbar-component.js

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

// Toast Notification Functions - Now handled by ToastComponent

// Force refresh data from database
async function refreshDataFromDatabase() {
    // Force refreshing data from database
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

// Test modal function removed - no longer needed

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
            // Loaded module assignments from database
        }
        
        // Also load existing assignments from user progress data
        const existingAssignments = await loadExistingAssignmentsFromProgress();
        // Loaded existing assignments from user progress
        
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
        // Total unique module assignments
        
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
                    <button class="btn-edit" onclick="editAssignment('${assignment.id}')" title="Edit Assignment" data-permission="edit_assignments">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-unassign" onclick="unassignModule('${assignment.id}')" title="Unassign Module" data-permission="unassign_assignments">
                        <i class="fas fa-user-minus"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteAssignment('${assignment.id}')" title="Delete Assignment" data-permission="delete_assignments">
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
                    <button class="assignment-btn-mobile" onclick="editAssignment('${assignment.id}')" title="Edit Assignment" data-permission="edit_assignments">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="assignment-btn-mobile danger" onclick="unassignModule('${assignment.id}')" title="Unassign Module" data-permission="unassign_assignments">
                        <i class="fas fa-user-minus"></i>
                        Unassign
                    </button>
                    <button class="assignment-btn-mobile danger" onclick="deleteAssignment('${assignment.id}')" title="Delete Assignment" data-permission="delete_assignments">
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
    
    // Apply permission-based visibility after rendering
    if (window.permissionManager) {
        window.permissionManager.applyElementVisibility();
    }
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
            // Assignment removed from database successfully
        } else {
            // Skipping database deletion for existing/role-based assignment
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
            // Cleared progress for user on module
        }
        
        // Track unassigned role-based assignments to prevent them from reappearing
        if (assignment.notes === 'Role-based assignment') {
            try {
                await window.dbService.addUnassignedRoleAssignment(assignment.user_id, assignment.module_id);
                // Tracked unassigned role-based assignment in database
            } catch (error) {
                console.error('Failed to track unassigned role-based assignment in database:', error);
                // Fallback to localStorage if database fails
                const unassignedRoleBased = JSON.parse(localStorage.getItem('unassignedRoleBased') || '[]');
                const unassignedKey = `${assignment.user_id}-${assignment.module_id}`;
                if (!unassignedRoleBased.includes(unassignedKey)) {
                    unassignedRoleBased.push(unassignedKey);
                    localStorage.setItem('unassignedRoleBased', JSON.stringify(unassignedRoleBased));
                    // Tracked unassigned role-based assignment in localStorage
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
                // Cleared progress for user on module
            }
            
            // Track unassigned role-based assignments to prevent them from reappearing
            if (assignment.notes === 'Role-based assignment') {
                try {
                    await window.dbService.addUnassignedRoleAssignment(assignment.user_id, assignment.module_id);
                    // Tracked unassigned role-based assignment in database
                } catch (error) {
                    console.error('Failed to track unassigned role-based assignment in database:', error);
                    // Fallback to localStorage if database fails
                    const unassignedRoleBased = JSON.parse(localStorage.getItem('unassignedRoleBased') || '[]');
                    const unassignedKey = `${assignment.user_id}-${assignment.module_id}`;
                    if (!unassignedRoleBased.includes(unassignedKey)) {
                        unassignedRoleBased.push(unassignedKey);
                        localStorage.setItem('unassignedRoleBased', JSON.stringify(unassignedRoleBased));
                        // Tracked unassigned role-based assignment in localStorage
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

// ===== QUIZ ASSIGNMENT FUNCTIONALITY =====
let quizAssignments = [];
let currentQuizAssignment = null;

// Load quiz assignments
async function loadQuizAssignments() {
    try {
        let dbAssignments = [];
        if (window.dbService && window.dbService.isConfigured) {
            const result = await window.dbService.getQuizAssignments();
            dbAssignments = Array.isArray(result) ? result : [];
        }
        
        quizAssignments = Array.isArray(dbAssignments) ? dbAssignments : [];
        await updateQuizAssignmentsTable();
        await updateQuizAssignmentFilters();
    } catch (error) {
        console.error('Failed to load quiz assignments:', error);
        showToast('error', 'Database Error', 'Failed to load quiz assignments from database');
        quizAssignments = [];
        await updateQuizAssignmentsTable();
        await updateQuizAssignmentFilters();
    }
}

// Update quiz assignments table
async function updateQuizAssignmentsTable() {
    const tbody = document.getElementById('quizAssignmentsTableBody');
    const mobileTable = document.getElementById('quizAssignmentsTableMobile');
    
    if (!tbody || !mobileTable) return;

    // Ensure quizAssignments is an array
    if (!Array.isArray(quizAssignments)) {
        quizAssignments = [];
    }

    tbody.innerHTML = '';
    mobileTable.innerHTML = '';

    if (quizAssignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem; color: #666;">No quiz assignments found</td></tr>';
        mobileTable.innerHTML = `
            <div class="assignment-card-mobile">
                <div style="text-align: center; padding: 2rem; color: #666;">
                    No quiz assignments found
                </div>
            </div>
        `;
        return;
    }

    // Get all users for display
    const allUsers = await getAllUsers();
    
    for (const assignment of quizAssignments) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="quiz-assignment-checkbox" data-assignment-id="${assignment.id}"></td>
            <td>${assignment.user_name || 'Unknown User'}</td>
            <td>${assignment.quiz_title || 'Unknown Quiz'}</td>
            <td>${formatDate(assignment.assigned_at)}</td>
            <td>${assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}</td>
            <td><span class="status-badge status-${assignment.status}">${assignment.status}</span></td>
            <td>${assignment.score !== null && assignment.score !== undefined ? `${assignment.score}%` : '-'}</td>
            <td>${assignment.passed !== null && assignment.passed !== undefined ? (assignment.passed ? 'Yes' : 'No') : '-'}</td>
            <td>${assignment.notes || '-'}</td>
            <td>
                <div class="assignment-actions">
                    <button class="btn-edit" onclick="editQuizAssignment('${assignment.id}')" title="Edit Assignment" data-permission="edit_assignments">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-unassign" onclick="unassignQuiz('${assignment.id}')" title="Unassign Quiz" data-permission="unassign_assignments">
                        <i class="fas fa-user-minus"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteQuizAssignment('${assignment.id}')" title="Delete Assignment" data-permission="delete_assignments">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    }

    // Generate mobile cards for each quiz assignment
    const mobileCards = quizAssignments.map(assignment => {
        const assignedDate = formatDate(assignment.assigned_at);
        const dueDate = assignment.due_date ? formatDate(assignment.due_date) : 'No due date';
        const score = assignment.score !== null && assignment.score !== undefined ? `${assignment.score}%` : '-';
        const passed = assignment.passed !== null && assignment.passed !== undefined ? (assignment.passed ? 'Yes' : 'No') : '-';
        
        return `
            <div class="assignment-card-mobile">
                <div class="assignment-card-header">
                    <input type="checkbox" class="quiz-assignment-checkbox" data-assignment-id="${assignment.id}">
                    <div class="assignment-user-info">
                        <div class="assignment-user-name">${assignment.user_name || 'Unknown User'}</div>
                        <div class="assignment-module-name">${assignment.quiz_title || 'Unknown Quiz'}</div>
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
                        <div class="assignment-detail-label">Score</div>
                        <div class="assignment-detail-value">${score}</div>
                    </div>
                    <div class="assignment-detail-item">
                        <div class="assignment-detail-label">Passed</div>
                        <div class="assignment-detail-value">${passed}</div>
                    </div>
                </div>
                <div class="assignment-actions">
                    <button class="assignment-btn-mobile" onclick="editQuizAssignment('${assignment.id}')" title="Edit Assignment" data-permission="edit_assignments">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="assignment-btn-mobile danger" onclick="unassignQuiz('${assignment.id}')" title="Unassign Quiz" data-permission="unassign_assignments">
                        <i class="fas fa-user-minus"></i>
                        Unassign
                    </button>
                    <button class="assignment-btn-mobile danger" onclick="deleteQuizAssignment('${assignment.id}')" title="Delete Assignment" data-permission="delete_assignments">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    mobileTable.innerHTML = mobileCards;

    // Add event listeners to individual checkboxes
    const quizAssignmentCheckboxes = document.querySelectorAll('.quiz-assignment-checkbox');
    quizAssignmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkUnassignQuizButton);
    });
    
    // Apply permission-based visibility after rendering
    if (window.permissionManager) {
        window.permissionManager.applyElementVisibility();
    }
}

// Update quiz assignment filters
async function updateQuizAssignmentFilters() {
    const userFilter = document.getElementById('quizAssignmentUserFilter');
    const quizFilter = document.getElementById('quizAssignmentQuizFilter');

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

    if (quizFilter) {
        // Populate quiz filter from localStorage
        quizFilter.innerHTML = '<option value="">All Quizzes</option>';
        try {
            const savedQuizzes = localStorage.getItem('quizzes');
            if (savedQuizzes) {
                const quizzes = JSON.parse(savedQuizzes);
                quizzes.forEach(quiz => {
                    const option = document.createElement('option');
                    option.value = quiz.id;
                    option.textContent = quiz.title || quiz.id;
                    quizFilter.appendChild(option);
                });
            }
        } catch (e) {
            console.warn('Failed to load quizzes for filter:', e);
        }
    }
}

// Open quiz assignment modal
async function openQuizAssignmentModal(assignmentId = null) {
    const modal = document.getElementById('quizAssignmentModal');
    const title = document.getElementById('quizAssignmentModalTitle');
    
    if (assignmentId) {
        currentQuizAssignment = quizAssignments.find(a => a.id === assignmentId);
        title.textContent = 'Edit Quiz Assignment';
    } else {
        currentQuizAssignment = null;
        title.textContent = 'Assign Quiz';
    }

    await populateQuizAssignmentForm();
    modal.classList.add('show');
}

// Populate quiz assignment form
async function populateQuizAssignmentForm() {
    const userCheckboxes = document.getElementById('quizUserCheckboxes');
    const quizCheckboxes = document.getElementById('quizCheckboxes');
    const dueDateInput = document.getElementById('quizAssignmentDueDate');
    const statusSelect = document.getElementById('quizAssignmentStatus');
    const notesTextarea = document.getElementById('quizAssignmentNotes');

    // Populate user checkboxes
    const users = await getAllUsers();
    userCheckboxes.innerHTML = '';
    users.forEach(user => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'user-checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `quiz-user-${user.id || user.username}`;
        checkbox.name = 'userIds';
        checkbox.value = user.id || user.username;
        
        const label = document.createElement('label');
        label.htmlFor = `quiz-user-${user.id || user.username}`;
        label.textContent = user.full_name || user.fullName || user.username;
        
        // Check if this user is already assigned (for editing)
        if (currentQuizAssignment && (user.id === currentQuizAssignment.user_id || user.username === currentQuizAssignment.user_id)) {
            checkbox.checked = true;
        }
        
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        userCheckboxes.appendChild(checkboxItem);
    });

    // Populate quiz checkboxes
    quizCheckboxes.innerHTML = '';
    try {
        const savedQuizzes = localStorage.getItem('quizzes');
        if (savedQuizzes) {
            const quizzes = JSON.parse(savedQuizzes);
            quizzes.forEach(quiz => {
                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'module-checkbox-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `quiz-${quiz.id}`;
                checkbox.name = 'quizIds';
                checkbox.value = quiz.id;
                
                const label = document.createElement('label');
                label.htmlFor = `quiz-${quiz.id}`;
                label.textContent = quiz.title || quiz.id;
                
                // Check if this quiz is already assigned (for editing)
                if (currentQuizAssignment && quiz.id === currentQuizAssignment.quiz_id) {
                    checkbox.checked = true;
                }
                
                checkboxItem.appendChild(checkbox);
                checkboxItem.appendChild(label);
                quizCheckboxes.appendChild(checkboxItem);
            });
        }
    } catch (e) {
        console.warn('Failed to load quizzes for assignment form:', e);
    }

    // Populate other fields
    if (currentQuizAssignment) {
        dueDateInput.value = currentQuizAssignment.due_date || '';
        statusSelect.value = currentQuizAssignment.status || 'assigned';
        notesTextarea.value = currentQuizAssignment.notes || '';
    } else {
        dueDateInput.value = '';
        statusSelect.value = 'assigned';
        notesTextarea.value = '';
    }
}

// Save quiz assignment
async function saveQuizAssignment() {
    const form = document.getElementById('quizAssignmentForm');
    const formData = new FormData(form);
    
    const userIds = formData.getAll('userIds');
    const quizIds = formData.getAll('quizIds');
    const dueDate = formData.get('dueDate') || null;
    const status = formData.get('status');
    const notes = formData.get('notes') || null;

    if (userIds.length === 0 || quizIds.length === 0) {
        showToast('error', 'Validation Error', 'Please select at least one user and one quiz');
        return;
    }

    // Filter out empty values
    const validUserIds = userIds.filter(id => id && id !== '');
    const validQuizIds = quizIds.filter(id => id && id !== '');
    
    if (validUserIds.length === 0 || validQuizIds.length === 0) {
        showToast('error', 'Validation Error', 'Please select at least one user and one quiz');
        return;
    }

    try {
        if (currentQuizAssignment) {
            // Update existing assignment
            const assignmentData = {
                user_id: validUserIds[0],
                quiz_id: validQuizIds[0],
                due_date: dueDate,
                status: status,
                notes: notes
            };
            await window.dbService.updateQuizAssignment(currentQuizAssignment.id, assignmentData);
            showToast('success', 'Assignment Updated', 'Quiz assignment updated successfully');
        } else {
            // Create multiple new assignments for all user-quiz combinations
            let successCount = 0;
            let errorCount = 0;
            
            for (const userId of validUserIds) {
                for (const quizId of validQuizIds) {
                    try {
                        await window.dbService.assignQuizToUser(
                            userId,
                            quizId,
                            null, // assigned_by
                            dueDate,
                            notes
                        );
                        successCount++;
                    } catch (error) {
                        // Check if this is a duplicate assignment error (409 Conflict)
                        if (error.message && error.message.includes('409') || 
                            (error.code && error.code === '23505') ||
                            (error.message && error.message.includes('duplicate key'))) {
                            // Assignment already exists - skip it silently or count as success
                            console.log(`Quiz ${quizId} already assigned to user ${userId}, skipping...`);
                            successCount++; // Count as success since assignment already exists
                        } else {
                            console.error(`Failed to assign quiz ${quizId} to user ${userId}:`, error);
                            errorCount++;
                        }
                    }
                }
            }
            
            if (successCount > 0) {
                const message = errorCount > 0 
                    ? `${successCount} assignments created successfully, ${errorCount} failed`
                    : `${successCount} assignments created successfully`;
                showToast('success', 'Assignments Created', message);
            } else {
                showToast('error', 'Assignment Failed', 'No assignments could be created');
            }
        }

        closeQuizAssignmentModal();
        await loadQuizAssignments();
    } catch (error) {
        console.error('Failed to save quiz assignments:', error);
        showToast('error', 'Database Error', 'Failed to save quiz assignments to database');
    }
}

// Edit quiz assignment
function editQuizAssignment(assignmentId) {
    openQuizAssignmentModal(assignmentId);
}

// Unassign quiz
async function unassignQuiz(assignmentId) {
    const assignment = quizAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
        showToast('error', 'Error', 'Assignment not found');
        return;
    }

    const confirmMessage = `Are you sure you want to unassign "${assignment.quiz_title}" from "${assignment.user_name}"?`;
    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        await window.dbService.removeQuizAssignment(assignmentId);
        showToast('success', 'Quiz Unassigned', `"${assignment.quiz_title}" has been unassigned from "${assignment.user_name}"`);
        await loadQuizAssignments();
    } catch (error) {
        console.error('Failed to remove quiz assignment from database:', error);
        showToast('error', 'Database Error', 'Failed to remove quiz assignment from database');
    }
}

// Delete quiz assignment
async function deleteQuizAssignment(assignmentId) {
    const assignment = quizAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
        showToast('error', 'Error', 'Assignment not found');
        return;
    }

    const confirmMessage = `Are you sure you want to permanently delete this quiz assignment for "${assignment.user_name}" and "${assignment.quiz_title}"? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        await window.dbService.removeQuizAssignment(assignmentId);
        showToast('success', 'Assignment Deleted', 'Quiz assignment deleted successfully');
        await loadQuizAssignments();
    } catch (error) {
        console.error('Failed to delete quiz assignment:', error);
        showToast('error', 'Delete Failed', 'Could not delete quiz assignment');
    }
}

// Close quiz assignment modal
function closeQuizAssignmentModal() {
    const modal = document.getElementById('quizAssignmentModal');
    modal.classList.remove('show');
    currentQuizAssignment = null;
}

// Setup quiz assignment event listeners
function setupQuizAssignmentEventListeners() {
    // Assign quiz button
    const assignBtn = document.getElementById('assignQuizBtn');
    if (assignBtn) {
        assignBtn.addEventListener('click', () => openQuizAssignmentModal());
    }

    // Quiz assignment modal close buttons
    const modalClose = document.getElementById('quizAssignmentModalClose');
    const modalCancel = document.getElementById('quizAssignmentModalCancel');
    const modalSave = document.getElementById('quizAssignmentModalSave');

    if (modalClose) {
        modalClose.addEventListener('click', closeQuizAssignmentModal);
    }
    if (modalCancel) {
        modalCancel.addEventListener('click', closeQuizAssignmentModal);
    }
    if (modalSave) {
        modalSave.addEventListener('click', saveQuizAssignment);
    }

    // Quiz assignment modal backdrop click
    const modal = document.getElementById('quizAssignmentModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeQuizAssignmentModal();
            }
        });
    }

    // Filter change events
    const userFilter = document.getElementById('quizAssignmentUserFilter');
    const quizFilter = document.getElementById('quizAssignmentQuizFilter');
    const statusFilter = document.getElementById('quizAssignmentStatusFilter');

    if (userFilter) {
        userFilter.addEventListener('change', filterQuizAssignments);
    }
    if (quizFilter) {
        quizFilter.addEventListener('change', filterQuizAssignments);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterQuizAssignments);
    }

    // Bulk unassign button
    const bulkUnassignBtn = document.getElementById('bulkUnassignQuizBtn');
    if (bulkUnassignBtn) {
        bulkUnassignBtn.addEventListener('click', bulkUnassignQuizzes);
    }

    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllQuizAssignments');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAllQuizAssignments);
    }
}

// Filter quiz assignments
async function filterQuizAssignments() {
    // This would filter the quiz assignments based on the selected filters
    // For now, we'll just reload all assignments
    await updateQuizAssignmentsTable();
}

// Toggle select all quiz assignments
function toggleSelectAllQuizAssignments() {
    const selectAllCheckbox = document.getElementById('selectAllQuizAssignments');
    const quizAssignmentCheckboxes = document.querySelectorAll('.quiz-assignment-checkbox');
    const bulkUnassignBtn = document.getElementById('bulkUnassignQuizBtn');
    
    quizAssignmentCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    // Show/hide bulk unassign button based on selections
    updateBulkUnassignQuizButton();
}

// Update bulk unassign quiz button visibility
function updateBulkUnassignQuizButton() {
    const selectedCheckboxes = document.querySelectorAll('.quiz-assignment-checkbox:checked');
    const bulkUnassignBtn = document.getElementById('bulkUnassignQuizBtn');
    
    if (selectedCheckboxes.length > 0) {
        bulkUnassignBtn.style.display = 'inline-flex';
    } else {
        bulkUnassignBtn.style.display = 'none';
    }
}

// Bulk unassign quizzes
async function bulkUnassignQuizzes() {
    const selectedCheckboxes = document.querySelectorAll('.quiz-assignment-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        showToast('warning', 'No Selection', 'Please select at least one quiz assignment to unassign');
        return;
    }

    const confirmMessage = `Are you sure you want to unassign ${selectedCheckboxes.length} quiz assignment(s)?`;
    if (!confirm(confirmMessage)) {
        return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const checkbox of selectedCheckboxes) {
        const assignmentId = checkbox.getAttribute('data-assignment-id');
        try {
            await window.dbService.removeQuizAssignment(assignmentId);
            successCount++;
        } catch (error) {
            console.error(`Failed to unassign quiz assignment ${assignmentId}:`, error);
            errorCount++;
        }
    }

    const message = errorCount > 0 
        ? `${successCount} assignments unassigned successfully, ${errorCount} failed`
        : `${successCount} assignments unassigned successfully`;
    
    showToast('success', 'Bulk Unassign Complete', message);
    await loadQuizAssignments();
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
        // Loading role management data
        
        // Try to load roles from database first
        if (window.dbService && window.dbService.isConfigured) {
            try {
                const dbRoles = await window.dbService.getRoles();
                if (dbRoles && dbRoles.length > 0) {
                    console.log('Loaded roles from database:', dbRoles);
                    // Normalize roles to support both camelCase and snake_case
                    roles = dbRoles.map(role => {
                        // Handle permissions - ensure it's always an array
                        let permissions = role.permissions || [];
                        // If permissions is a string, try to parse it
                        if (typeof permissions === 'string') {
                            try {
                                permissions = JSON.parse(permissions);
                            } catch (e) {
                                console.warn('Failed to parse permissions for role:', role.name, e);
                                permissions = [];
                            }
                        }
                        // Ensure permissions is an array
                        if (!Array.isArray(permissions)) {
                            permissions = [];
                        }
                        
                        return {
                            ...role,
                            // Ensure both pageAccess (camelCase) and page_access (snake_case) are available
                            pageAccess: role.page_access || role.pageAccess || [],
                            // Ensure permissions is always an array
                            permissions: permissions
                        };
                    });
                    // Log the permissions for Admin role specifically
                    const adminRole = roles.find(r => r.role_id === 'admin' || r.id === 'admin');
                    if (adminRole) {
                        console.log('Admin role permissions after DB load:', adminRole.permissions);
                        console.log('Admin role pageAccess after normalization:', adminRole.pageAccess);
                    }
                    // Update localStorage with database roles
                    localStorage.setItem('roles', JSON.stringify(roles));
                }
            } catch (dbError) {
                console.error('Failed to load roles from database:', dbError);
            }
        }
        
        // Fallback to localStorage if database failed
        if (!roles || roles.length === 0) {
        const storedRoles = localStorage.getItem('roles');
        if (storedRoles) {
            roles = JSON.parse(storedRoles);
                console.log('Loaded roles from localStorage:', roles);
        } else {
            // Default roles if none exist
            roles = [
                { id: 'admin', name: 'Admin', description: 'Full system access', level: 4, pageAccess: pageAccessLevels[4] },
                { id: 'director', name: 'Director', description: 'High-level management', level: 3, pageAccess: pageAccessLevels[3] },
                { id: 'supervisor', name: 'Supervisor', description: 'Team supervision', level: 2, pageAccess: pageAccessLevels[2] },
                { id: 'team-member', name: 'Team Member', description: 'Basic access', level: 1, pageAccess: pageAccessLevels[1] }
            ];
            localStorage.setItem('roles', JSON.stringify(roles));
                console.log('Created default roles');
            }
        }
        
        // Render role management content
        renderRoleOverviewCards();
        renderRolesGrid();
        setupRoleManagementEventListeners();
        
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
    // Render roles grid
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
            <div class="page-access">
                <strong>Can Access:</strong><br>
                <span class="accessible-pages">${accessiblePages || 'No pages assigned'}</span>
            </div>
            <div class="role-actions">
                <button class="btn btn-edit" onclick="editRole('${role.id}')" data-permission="manage_roles">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="deleteRole('${role.id}')" data-permission="manage_roles">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    }).join('');
    
    rolesGrid.innerHTML = rolesHTML;
    
    // Apply element visibility after rendering
    if (window.permissionManager) {
        window.permissionManager.applyElementVisibility();
    }
}


// Setup role management event listeners
function setupRoleManagementEventListeners() {
    // Add role button
    const addRoleBtn = document.getElementById('addRoleBtn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openRoleModal(); // Call with no arguments for add mode
        });
    }
    
    // Role modal event listeners
    const roleModal = document.getElementById('roleModal');
    const roleModalClose = document.getElementById('roleModalClose');
    const roleModalCancel = document.getElementById('roleModalCancel');
    const roleForm = document.getElementById('roleForm');
    if (roleModalClose) {
        roleModalClose.addEventListener('click', closeRoleModal);
    }
    
    if (roleModalCancel) {
        roleModalCancel.addEventListener('click', closeRoleModal);
    }
    
    if (roleForm) {
        roleForm.addEventListener('submit', saveRole);
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

// Element Access Control removed - using Role Definitions instead
/*
let selectedElementId = null;
let elementAccessData = JSON.parse(localStorage.getItem('elementAccessData') || '{}');

// Define website elements that can be controlled
const websiteElements = [
    { id: 'navbar', name: 'Navigation Bar', description: 'Top navigation menu' },
    { id: 'dashboard', name: 'Dashboard', description: 'User dashboard page' },
    { id: 'my-progress', name: 'My Progress', description: 'User progress tracking' },
    { id: 'quizzes', name: 'Quizzes', description: 'Quiz and test system' },
    { id: 'user-overview', name: 'User Overview', description: 'Admin user management' },
    { id: 'path-management', name: 'Path Management', description: 'Module and path management' },
    { id: 'role-management', name: 'Role Management', description: 'Role and permission settings' },
    { id: 'reports', name: 'Reports', description: 'System reports and analytics' },
    { id: 'settings', name: 'Settings', description: 'System settings' }
];

// Initialize element access control
function initializeElementAccessControl() {
    renderElementsList();
}

// Render the elements list
function renderElementsList() {
    const elementsList = document.getElementById('elementsList');
    if (!elementsList) return;
    
    elementsList.innerHTML = websiteElements.map(element => `
        <div class="element-item" onclick="selectElement('${element.id}')">
            <div class="element-icon">
                <i class="fas fa-cube"></i>
            </div>
            <div class="element-info">
                <h4>${element.name}</h4>
                <p>${element.description}</p>
            </div>
        </div>
    `).join('');
}

// Select an element to manage access entities
function selectElement(elementId) {
    selectedElementId = elementId;
    const element = websiteElements.find(e => e.id === elementId);
    
    // Update selected element display
    const selectedElementDiv = document.getElementById('selectedElement');
    if (selectedElementDiv && element) {
        selectedElementDiv.innerHTML = `
            <h3>${element.name}</h3>
            <p>${element.description}</p>
        `;
    }
    
    // Render role access checkboxes
    renderRoleAccessList();
    
    // Enable save button
    const saveBtn = document.getElementById('saveAccessBtn');
    if (saveBtn) saveBtn.disabled = false;
}

// Render role access checkboxes
function renderRoleAccessList() {
    const roleAccessList = document.getElementById('roleAccessList');
    if (!roleAccessList || !selectedElementId) return;
    
    roleAccessList.innerHTML = roles.map(role => {
        const hasAccess = elementAccessData[selectedElementId]?.includes(role.id) || false;
        return `
            <label class="checkbox-label">
                <input type="checkbox" 
                       data-role="${role.id}" 
                       ${hasAccess ? 'checked' : ''}
                       onchange="updateElementAccess()">
                <span>${role.name}</span>
                <span class="role-level">Level ${role.level}</span>
            </label>
        `;
    }).join('');
}

// Update element access when checkbox changes
function updateElementAccess() {
    // This will be called when a checkbox is changed
}

// Save element access settings
function saveElementAccess() {
    if (!selectedElementId) return;
    
    const checkboxes = document.querySelectorAll('#roleAccessList input[type="checkbox"]');
    const allowedRoles = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            allowedRoles.push(checkbox.dataset.role);
        }
    });
    
    elementAccessData[selectedElementId] = allowedRoles;
    localStorage.setItem('elementAccessData', JSON.stringify(elementAccessData));
    
    showToast('success', 'Saved', `Access settings saved for ${websiteElements.find(e => e.id === selectedElementId).name}`);
}

// Clear selection
function clearSelection() {
    selectedElementId = null;
    const selectedDiv = document.getElementById('selectedElement');
    if (selectedDiv) selectedDiv.innerHTML = '<p>Select an element to manage access</p>';
    const roleList = document.getElementById('roleAccessList');
    if (roleList) roleList.innerHTML = '';
    const saveBtn = document.getElementById('saveAccessBtn');
    if (saveBtn) saveBtn.disabled = true;
}

// Filter elements by search
function filterElements() {
    const searchTerm = document.getElementById('elementSearch')?.value.toLowerCase() || '';
    const elementItems = document.querySelectorAll('.element-item');
    
    elementItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// Export element access functions - REMOVED
// window.selectElement = selectElement;
// window.updateElementAccess = updateElementAccess;
// window.saveElementAccess = saveElementAccess;
// window.clearSelection = clearSelection;
// window.filterElements = filterElements;
*/

// Permission Matrix removed - using Role Definitions instead
/*
function initializeMatrixFromRoles() {
    // Map permission categories to permission keys used in the system
    const permissionMap = {
        'User Management': {
            'View Users': 'view_users',
            'Create Users': 'create_users',
            'Edit Users': 'edit_users',
            'Delete Users': 'delete_users'
        },
        'Module Management': {
            'View Modules': 'view_modules',
            'Create Modules': 'create_modules',
            'Edit Modules': 'edit_modules',
            'Delete Modules': 'delete_modules'
        },
        'Assignment Management': {
            'View Assignments': 'view_assignments',
            'Create Assignments': 'create_assignments',
            'Edit Assignments': 'edit_assignments',
            'Delete Assignments': 'delete_assignments'
        },
        'System Administration': {
            'View Reports': 'view_reports',
            'Manage Roles': 'manage_roles',
            'System Settings': 'system_settings',
            'Backup & Restore': 'backup_restore'
        }
    };
    
    // Always sync matrix from current roles to ensure it's up to date
    // Remove the check to always sync
    // const hasStoredData = Object.keys(permissionMatrixData).length > 0;
    
    // Always sync (removed the if condition)
    {
        console.log('Syncing permission matrix from current roles...');
        
        // Load roles from localStorage to ensure we have the latest data with permissions
        const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
        const rolesToSync = storedRoles.length > 0 ? storedRoles : roles;
        
        console.log('Roles to sync:', rolesToSync);
        
        // For each role
        rolesToSync.forEach(role => {
            const rolePermissions = role.permissions || [];
            console.log(`Syncing ${role.name} (role_id: ${role.role_id || role.id}) with ${rolePermissions.length} permissions:`, rolePermissions);
            
            // For each category
            Object.entries(permissionMap).forEach(([category, permissions]) => {
                // For each permission in category
                Object.entries(permissions).forEach(([displayName, permissionKey]) => {
                    // Check if this role has this permission
                    const hasPermission = rolePermissions.includes(permissionKey);
                    
                    // Set matrix data
                    const matrixKey = `${category}_${displayName}_${role.id}`;
                    permissionMatrixData[matrixKey] = hasPermission;
                });
            });
        });
        
        // Save initialized data
        localStorage.setItem('permissionMatrixData', JSON.stringify(permissionMatrixData));
        console.log('Synced permission matrix with current roles');
    }
}

// Render the permission matrix table
function renderPermissionMatrix() {
    const matrixBody = document.getElementById('permissionMatrixBody');
    if (!matrixBody) return;
    
    let html = '';
    
    permissionCategories.forEach(category => {
        // Category header row
        html += `
            <tr class="category-row">
                <td colspan="5">${category.category}</td>
            </tr>
        `;
        
        // Permission rows
        category.permissions.forEach(permission => {
            html += '<tr class="permission-row">';
            html += `<td>${permission}</td>`;
            
            roleIds.forEach(roleId => {
                const checked = permissionMatrixData[`${category.category}_${permission}_${roleId}`] || false;
                html += `
                    <td>
                        <input type="checkbox" 
                               data-category="${category.category}" 
                               data-permission="${permission}" 
                               data-role="${roleId}"
                               ${checked ? 'checked' : ''}
                               onchange="updatePermissionCheckbox(this)">
                    </td>
                `;
            });
            
            html += '</tr>';
        });
    });
    
    matrixBody.innerHTML = html;
}

// Update permission checkbox
function updatePermissionCheckbox(checkbox) {
    const category = checkbox.dataset.category;
    const permission = checkbox.dataset.permission;
    const role = checkbox.dataset.role;
    const key = `${category}_${permission}_${role}`;
    
    permissionMatrixData[key] = checkbox.checked;
    
    // Visual feedback on checkbox
    checkbox.style.transform = 'scale(0.9)';
    setTimeout(() => {
        checkbox.style.transition = 'transform 0.2s ease';
        checkbox.style.transform = 'scale(1)';
    }, 100);
    
    // Update save button to show unsaved changes
    const saveBtn = document.querySelector('[onclick="savePermissionMatrix()"]');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Save Permissions <span style="color: orange;">(Unsaved)</span>';
        saveBtn.classList.add('has-unsaved-changes');
    }
}

// Save permission matrix
async function savePermissionMatrix() {
    localStorage.setItem('permissionMatrixData', JSON.stringify(permissionMatrixData));
    
    // Restore save button
    const saveBtn = document.querySelector('[onclick="savePermissionMatrix()"]');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Permissions';
        saveBtn.classList.remove('has-unsaved-changes');
        
        // Visual confirmation
        saveBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            saveBtn.style.transition = 'background-color 0.3s ease';
            saveBtn.style.backgroundColor = '';
        }, 500);
    }
    
    // Apply permission changes to roles
    await applyPermissionMatrixToRoles();
    
    showToast('success', 'Saved', 'Permission matrix has been saved and applied successfully');
    
    // Log saved data for debugging
    const checkedCount = Object.values(permissionMatrixData).filter(v => v === true).length;
    console.log('Permission matrix saved:', {
        totalChecked: checkedCount,
        totalKeys: Object.keys(permissionMatrixData).length,
        data: permissionMatrixData
    });
}

// Apply permission matrix changes to roles
async function applyPermissionMatrixToRoles() {
    console.log('=== Applying permission matrix to roles ===');
    console.log('permissionMatrixData:', permissionMatrixData);
    
    // Map permission categories to permission keys used in the system
    const permissionMap = {
        'User Management': {
            'View Users': 'view_users',
            'Create Users': 'create_users',
            'Edit Users': 'edit_users',
            'Delete Users': 'delete_users'
        },
        'Module Management': {
            'View Modules': 'view_modules',
            'Create Modules': 'create_modules',
            'Edit Modules': 'edit_modules',
            'Delete Modules': 'delete_modules'
        },
        'Assignment Management': {
            'View Assignments': 'view_assignments',
            'Create Assignments': 'create_assignments',
            'Edit Assignments': 'edit_assignments',
            'Delete Assignments': 'delete_assignments'
        },
        'System Administration': {
            'View Reports': 'view_reports',
            'Manage Roles': 'manage_roles',
            'System Settings': 'system_settings',
            'Backup & Restore': 'backup_restore'
        }
    };
    
    // Update roles array with permissions from matrix
    roles.forEach(role => {
        const rolePermissions = [];
        
        // For each category
        Object.entries(permissionMap).forEach(([category, permissions]) => {
            // For each permission in category
            Object.entries(permissions).forEach(([displayName, permissionKey]) => {
                const matrixKey = `${category}_${displayName}_${role.id}`;
                
                // If checked in matrix, add to role permissions
                const isChecked = permissionMatrixData[matrixKey] === true;
                if (isChecked) {
                    if (!rolePermissions.includes(permissionKey)) {
                        rolePermissions.push(permissionKey);
                    }
                    console.log(`✓ Added "${permissionKey}" to ${role.name} (checked: ${isChecked})`);
                }
            });
        });
        
        // Update role with new permissions
        const oldPermissions = role.permissions || [];
        role.permissions = rolePermissions;
        
        console.log(`${role.name}:`);
        console.log(`  Old: [${oldPermissions.join(', ')}]`);
        console.log(`  New: [${rolePermissions.join(', ')}]`);
    });
    
    // Save updated roles to localStorage
    localStorage.setItem('roles', JSON.stringify(roles));
    console.log('✓ Saved updated roles to localStorage');
    
    // Save roles to database
    try {
        if (window.dbService && window.dbService.isConfigured) {
            console.log('Saving roles to database...');
            for (const role of roles) {
                await window.dbService.updateRole(role.id, {
                    permissions: role.permissions,
                    updated_at: new Date().toISOString()
                });
            }
            console.log('✓ Saved updated roles to database');
        }
    } catch (error) {
        console.error('Failed to save roles to database:', error);
    }
    
    // Reload roles in permission manager if it exists
    if (window.permissionManager) {
        window.permissionManager.loadRoles();
    }
    
    // Refresh permissions display
    displayCurrentPermissions();
    
    console.log('=== Done applying permission matrix ===');
}

// Reset permission matrix to defaults
function resetPermissionMatrix() {
    permissionMatrixData = {};
    localStorage.setItem('permissionMatrixData', JSON.stringify(permissionMatrixData));
    renderPermissionMatrix();
    showToast('info', 'Reset', 'Permission matrix has been reset to defaults');
}

*/

// Display current role permissions for testing
function displayCurrentPermissions() {
    const displayDiv = document.getElementById('permissionsDisplay');
    if (!displayDiv) return;
    
    // Load roles from localStorage to ensure we have the latest data
    const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
    const rolesToDisplay = storedRoles.length > 0 ? storedRoles : roles;
    
    let html = '<div class="roles-permissions-grid">';
    
    rolesToDisplay.forEach(role => {
        const permissions = role.permissions || [];
        html += `
            <div class="role-permissions-card">
                <h3>${role.name}</h3>
                <div class="permissions-list">
                    ${permissions.length > 0 ? 
                        permissions.map(p => `<span class="permission-badge">${p}</span>`).join('') : 
                        '<span class="no-permissions">No permissions assigned</span>'
                    }
                </div>
                <div class="permission-count">${permissions.length} permission${permissions.length !== 1 ? 's' : ''}</div>
            </div>
        `;
    });
    
    html += '</div>';
    displayDiv.innerHTML = html;
}

// Refresh permissions display
function refreshPermissionsDisplay() {
    displayCurrentPermissions();
    showToast('success', 'Refreshed', 'Permissions display updated');
}

// Initialize permissions display
function initializePermissionsDisplay() {
    displayCurrentPermissions();
}

// Call on page load and after role updates
setTimeout(() => {
    if (document.getElementById('permissionsDisplay')) {
        initializePermissionsDisplay();
    }
}, 1000);

// Export functions
window.refreshPermissionsDisplay = refreshPermissionsDisplay;

// Open role modal
function openRoleModal(roleId = null) {
    console.log('🔵 openRoleModal called with roleId:', roleId);
    console.log('🔵 typeof roleId:', typeof roleId);
    console.log('🔵 roleId value:', roleId);
    
    const roleModal = document.getElementById('roleModal');
    const roleModalTitle = document.getElementById('roleModalTitle');
    const roleIdInput = document.getElementById('roleId');
    const roleNameInput = document.getElementById('roleName');
    const roleDescriptionInput = document.getElementById('roleDescription');
    
    if (!roleModal || !roleModalTitle || !roleIdInput || !roleNameInput || !roleDescriptionInput) {
        console.error('❌ Missing required modal elements!', { roleModal: !!roleModal, roleModalTitle: !!roleModalTitle, roleIdInput: !!roleIdInput, roleNameInput: !!roleNameInput, roleDescriptionInput: !!roleDescriptionInput });
        return;
    }
    
    if (roleId) {
        console.log('✏️ Edit mode - roleId provided:', roleId);
        // Edit mode
        const role = roles.find(r => r.id === roleId);
        if (role) {
            roleModalTitle.textContent = 'Edit Role';
            roleIdInput.value = role.id;
            roleNameInput.value = role.name;
            roleDescriptionInput.value = role.description;
            // Handle both camelCase (pageAccess) and snake_case (page_access) from database
            const pageAccess = role.pageAccess || role.page_access || [];
            populateRolePageAccess(Array.isArray(pageAccess) ? pageAccess : []);
            
            // Ensure permissions is an array before passing to populateGranularPermissions
            let permissions = role.permissions || [];
            if (typeof permissions === 'string') {
                try {
                    permissions = JSON.parse(permissions);
                } catch (e) {
                    console.warn('Failed to parse permissions for role:', role.name, e);
                    permissions = [];
                }
            }
            if (!Array.isArray(permissions)) {
                permissions = [];
            }
            
            console.log('Opening role modal for:', role.name);
            console.log('Role permissions:', permissions);
            populateGranularPermissions(permissions);
        }
    } else {
        // Add mode
        console.log('➕ Add mode - roleId is null/undefined');
        console.log('➕ Opening modal in ADD mode');
        roleModalTitle.textContent = 'Add New Role';
        roleIdInput.value = '';
        roleNameInput.value = '';
        roleDescriptionInput.value = '';
        
        // Show modal first
        roleModal.classList.add('show');
        
        // Force a reflow to ensure modal is visible
        void roleModal.offsetHeight;
        
        // Clear any existing content first
        const rolePermissionsGrid = document.getElementById('rolePermissionsGrid');
        const granularPermissionsDiv = document.getElementById('granularPermissions');
        if (rolePermissionsGrid) {
            console.log('🔍 Clearing rolePermissionsGrid');
            rolePermissionsGrid.innerHTML = '';
        }
        if (granularPermissionsDiv) {
            console.log('🔍 Clearing granularPermissionsDiv');
            granularPermissionsDiv.innerHTML = '';
        }
        
        // Populate immediately - elements should be accessible now that modal is shown
        console.log('📋 Populating page access and granular permissions for new role...');
        try {
        populateRolePageAccess([]);
            populateGranularPermissions([]);
            console.log('✅ Both populate functions completed');
        } catch (error) {
            console.error('❌ Error populating permissions:', error);
            // If it fails, try again with a small delay
            setTimeout(() => {
                console.log('🔄 Retrying population after delay...');
                populateRolePageAccess([]);
                populateGranularPermissions([]);
            }, 50);
        }
    }
    
    if (roleId) {
        // For edit mode, show modal after populating (already populated above)
    roleModal.classList.add('show');
    }
    
    console.log('✅ Modal should now be visible');
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
    console.log('📋 populateRolePageAccess called with:', selectedPageAccess);
    
    // Check if pagePermissions is defined
    if (typeof pagePermissions === 'undefined') {
        console.error('❌ pagePermissions is not defined!');
        return;
    }
    
    const rolePermissionsGrid = document.getElementById('rolePermissionsGrid');
    if (!rolePermissionsGrid) {
        console.error('❌ rolePermissionsGrid element not found!');
        return;
    }
    
    console.log('✅ rolePermissionsGrid found, pagePermissions keys:', Object.keys(pagePermissions));
    console.log('✅ pagePermissions object:', pagePermissions);
    
    // Available page permissions
    const permissionsHTML = Object.entries(pagePermissions).map(([pageName, pageInfo]) => {
        const isChecked = selectedPageAccess.includes(pageInfo.id);
        // Page permission status
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
    
    console.log('📝 Generated page access HTML length:', permissionsHTML.length);
    console.log('📝 HTML preview:', permissionsHTML.substring(0, 200));
    rolePermissionsGrid.innerHTML = permissionsHTML;
    console.log('✅ Page access checkboxes populated. Current innerHTML length:', rolePermissionsGrid.innerHTML.length);
}

// Populate granular permissions for a role
function populateGranularPermissions(rolePermissions) {
    console.log('📋 populateGranularPermissions called with:', rolePermissions);
    const granularPermissionsDiv = document.getElementById('granularPermissions');
    if (!granularPermissionsDiv) {
        console.error('❌ granularPermissions div not found!');
        return;
    }
    
    console.log('✅ granularPermissions div found');
    
    const permissionCategories = [
        {
            category: 'User Management',
            permissions: [
                { name: 'View Users', key: 'view_users' },
                { name: 'Create Users', key: 'create_users' },
                { name: 'Edit Users', key: 'edit_users' },
                { name: 'Delete Users', key: 'delete_users' },
                { name: 'Reset Progress', key: 'reset_progress' }
            ]
        },
        {
            category: 'Module Management',
            permissions: [
                { name: 'View Modules', key: 'view_modules' },
                { name: 'Create Modules', key: 'create_modules' },
                { name: 'Edit Modules', key: 'edit_modules' },
                { name: 'Delete Modules', key: 'delete_modules' }
            ]
        },
        {
            category: 'Assignment Management',
            permissions: [
                { name: 'View Assignments', key: 'view_assignments' },
                { name: 'Create Assignments', key: 'create_assignments' },
                { name: 'Edit Assignments', key: 'edit_assignments' },
                { name: 'Unassign Assignments', key: 'unassign_assignments' },
                { name: 'Delete Assignments', key: 'delete_assignments' }
            ]
        },
        {
            category: 'Quiz Management',
            permissions: [
                { name: 'Create Quizzes', key: 'create_quizzes' },
                { name: 'Edit Quizzes', key: 'edit_quizzes' },
                { name: 'Delete Quizzes', key: 'delete_quizzes' }
            ]
        },
        {
            category: 'System Administration',
            permissions: [
                { name: 'View Reports', key: 'view_reports' },
                { name: 'Manage Roles', key: 'manage_roles' },
                { name: 'System Settings', key: 'system_settings' },
                { name: 'Backup & Restore', key: 'backup_restore' }
            ]
        }
    ];
    
    let html = '';
    permissionCategories.forEach(category => {
        html += `<div class="permission-category">`;
        html += `<h4>${category.category}</h4>`;
        html += `<div class="permission-category-items">`;
        
        category.permissions.forEach(permission => {
            const isChecked = rolePermissions && Array.isArray(rolePermissions) && rolePermissions.includes(permission.key);
            if (category.category === 'Module Management') {
                console.log(`Permission ${permission.key}: isChecked=${isChecked}, rolePermissions:`, rolePermissions);
            }
            html += `
                <div class="permission-checkbox-item">
                    <input type="checkbox" 
                           id="perm_${permission.key}" 
                           value="${permission.key}"
                           ${isChecked ? 'checked' : ''}>
                    <label for="perm_${permission.key}">${permission.name}</label>
                </div>
            `;
        });
        
        html += `</div></div>`;
    });
    
    console.log('📝 Generated granular permissions HTML length:', html.length);
    console.log('📝 HTML preview:', html.substring(0, 300));
    granularPermissionsDiv.innerHTML = html;
    console.log('✅ Granular permissions populated. Current innerHTML length:', granularPermissionsDiv.innerHTML.length);
    
    // Verify checkboxes were created correctly
    const moduleCheckboxes = granularPermissionsDiv.querySelectorAll('#perm_view_modules, #perm_create_modules, #perm_edit_modules, #perm_delete_modules');
    console.log(`Created ${moduleCheckboxes.length} Module Management checkboxes`);
    moduleCheckboxes.forEach(cb => {
        console.log(`Checkbox ${cb.id}: value=${cb.value}, checked=${cb.checked}`);
    });
}

// Save role
async function saveRole(e) {
    e.preventDefault();
    
    const roleIdInput = document.getElementById('roleId');
    const roleNameInput = document.getElementById('roleName');
    const roleDescriptionInput = document.getElementById('roleDescription');
    // Get selected granular permissions
    const granularPermissions = Array.from(document.querySelectorAll('#granularPermissions input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Calculate level based on page access (for backward compatibility with database schema)
    const pageAccess = getSelectedPageAccess();
    let calculatedLevel = 1;
    if (pageAccess.length >= 5) {
        calculatedLevel = 4; // Full access
    } else if (pageAccess.length >= 3) {
        calculatedLevel = 3; // Advanced
    } else if (pageAccess.length >= 2) {
        calculatedLevel = 2; // Standard
    }
    
    const roleData = {
        id: roleIdInput.value || generateRoleId(),
        name: roleNameInput.value,
        description: roleDescriptionInput.value,
        level: calculatedLevel, // Auto-calculated from page access
        pageAccess: pageAccess,
        permissions: granularPermissions
    };
    
    console.log('💾 Saving role with data:', {
        id: roleData.id,
        name: roleData.name,
        permissions: roleData.permissions,
        pageAccess: roleData.pageAccess
    });
    
    if (roleIdInput.value) {
        // Update existing role
        const index = roles.findIndex(r => r.id === roleIdInput.value);
        if (index !== -1) {
            // Preserve the original role_id from the database
            const originalRole = roles[index];
            roleData.role_id = originalRole.role_id || originalRole.id;
            roles[index] = roleData;
        }
    } else {
        // Add new role
        roles.push(roleData);
    }
    
    // Save to localStorage first
    localStorage.setItem('roles', JSON.stringify(roles));
    
    // Save to database if configured
    if (window.dbService && window.dbService.isConfigured && roleIdInput.value) {
        try {
            // Find the actual role_id to use for the update
            const existingRole = roles.find(r => r.id === roleIdInput.value);
            console.log('Existing role object:', existingRole);
            const actualRoleId = existingRole.role_id || existingRole.id;
            console.log('Using role_id for update:', actualRoleId);
            
            // Update role in database
            // Don't include role_id in update data since it's the filter
            const dbRoleData = {
                name: roleData.name,
                description: roleData.description,
                level: roleData.level,
                permissions: roleData.permissions, // JSONB fields - send as arrays
                page_access: roleData.pageAccess // JSONB fields - send as arrays
            };
            
            console.log('Updating role with role_id:', actualRoleId);
            console.log('Update data:', dbRoleData);
            
            const result = await window.dbService.updateRole(actualRoleId, dbRoleData);
            console.log('✓ Saved role to database:', roleData.name);
            console.log('Database response:', result);
            
            // Reload roles from database to ensure we have the latest data
            try {
                const dbRoles = await window.dbService.getRoles();
                if (dbRoles && dbRoles.length > 0) {
                    // Normalize roles to support both camelCase and snake_case
                    roles = dbRoles.map(role => {
                        // Handle permissions - ensure it's always an array
                        let permissions = role.permissions || [];
                        if (typeof permissions === 'string') {
                            try {
                                permissions = JSON.parse(permissions);
                            } catch (e) {
                                console.warn('Failed to parse permissions for role:', role.name, e);
                                permissions = [];
                            }
                        }
                        if (!Array.isArray(permissions)) {
                            permissions = [];
                        }
                        
                        return {
                            ...role,
                            pageAccess: role.page_access || role.pageAccess || [],
                            permissions: permissions
                        };
                    });
                    localStorage.setItem('roles', JSON.stringify(roles));
                }
            } catch (reloadError) {
                console.warn('Failed to reload roles from database:', reloadError);
                // Continue with in-memory roles
            }
        } catch (error) {
            console.error('Failed to save role to database:', error);
            showToast('warning', 'Warning', 'Role saved locally but database update failed');
        }
    }
    
    // Refresh displays
    renderRoleOverviewCards();
    renderRolesGrid();
    
    // Reload roles in PermissionManager if it exists
    if (window.permissionManager) {
        await window.permissionManager.loadRoles();
        // Re-apply element visibility based on updated permissions
        window.permissionManager.applyElementVisibility();
        
        // Also update quiz tab visibility if the function exists (for quizzes page)
        if (typeof window.updateQuizTabVisibility === 'function') {
            window.updateQuizTabVisibility();
        }
    }
    
    // Refresh role-based UI for current user (this will update tab visibility)
    refreshRoleBasedUI();
    
    closeRoleModal();
    showToast('success', 'Success', `Role ${roleIdInput.value ? 'updated' : 'created'} successfully`);
}

// Get selected page access
function getSelectedPageAccess() {
    const checkboxes = document.querySelectorAll('#rolePermissionsGrid input[type="checkbox"]:checked');
    const selectedAccess = Array.from(checkboxes).map(cb => cb.value);
    // Get selected page access
    return selectedAccess;
}

// Generate role ID
function generateRoleId() {
    return 'role_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Edit role
function editRole(roleId) {
    // Edit role functionality
    const role = roles.find(r => r.id === roleId);
    // Found role
    openRoleModal(roleId);
}

// Delete role
async function deleteRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (!role) {
        showToast('error', 'Error', 'Role not found');
        return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the "${role.name}" role?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        // Get the database role_id if available
        const dbRoleId = role.role_id || role.id;
        
        // Delete from database first
        if (window.dbService && window.dbService.isConfigured) {
            await window.dbService.deleteRole(dbRoleId);
            console.log(`✅ Role deleted from database: ${dbRoleId}`);
        }
        
        // Remove from in-memory array
        roles = roles.filter(r => r.id !== roleId);
        
        // Remove from localStorage
        localStorage.setItem('roles', JSON.stringify(roles));
        
        // Refresh displays
        renderRoleOverviewCards();
        renderRolesGrid();
        
        // Reload roles in PermissionManager if it exists
        if (window.permissionManager) {
            await window.permissionManager.loadRoles();
        }
        
        showToast('success', 'Role Deleted', `Role "${role.name}" has been permanently deleted.`);
        
    } catch (error) {
        console.error('Failed to delete role:', error);
        showToast('error', 'Delete Failed', `Failed to delete role "${role.name}": ${error.message || 'Unknown error'}`);
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
window.openRoleModal = openRoleModal;


// ===== REPORTS & ANALYTICS FUNCTIONALITY =====

// Show reports content
function showReportsContent() {
    // Showing reports content
    
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
        // Reports content found, showing
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
        // Loading reports data
        
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
        
        // Reports data loaded successfully
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
        
        // Loaded quiz data
    } catch (error) {
        console.error('❌ Error loading quiz data:', error);
        window.quizResults = [];
        window.quizzes = [];
    }
}

// Generate analytics data
function generateAnalytics() {
    // Generating analytics
    
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
    // Loading quiz results table
    
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
    
    // Loaded quiz results
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
                // Switching to completions view
            } else {
                // Switch to progress view
                // Switching to progress view
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

// ==================== SETTINGS MENU FUNCTIONS ====================

// Account Settings Functions
function editUsername() {
    const usernameInput = document.getElementById('username');
    usernameInput.removeAttribute('readonly');
    usernameInput.focus();
    usernameInput.style.backgroundColor = 'white';
    usernameInput.style.color = 'var(--navy)';
}

function editEmail() {
    const emailInput = document.getElementById('email');
    emailInput.removeAttribute('readonly');
    emailInput.focus();
    emailInput.style.backgroundColor = 'white';
    emailInput.style.color = 'var(--navy)';
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function updateAccount() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!username || !email) {
        showToast('error', 'Validation Error', 'Username and email are required');
        return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
        showToast('error', 'Password Mismatch', 'New passwords do not match');
        return;
    }
    
    if (newPassword && newPassword.length < 8) {
        showToast('error', 'Password Too Short', 'Password must be at least 8 characters');
        return;
    }
    
    // Simulate API call
    showToast('success', 'Account Updated', 'Your account information has been updated successfully');
    
    // Reset form
    resetAccountForm();
}

function resetAccountForm() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // Make fields readonly again
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    usernameInput.setAttribute('readonly', 'true');
    emailInput.setAttribute('readonly', 'true');
    usernameInput.style.backgroundColor = '#f8f9fa';
    usernameInput.style.color = '#6c757d';
    emailInput.style.backgroundColor = '#f8f9fa';
    emailInput.style.color = '#6c757d';
}

// Notification Settings Functions
function saveNotificationSettings() {
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        browserNotifications: document.getElementById('browserNotifications').checked,
        deadlineWarnings: document.getElementById('deadlineWarnings').checked,
        moduleAssignments: document.getElementById('moduleAssignments').checked,
        progressReminders: document.getElementById('progressReminders').checked,
        systemUpdates: document.getElementById('systemUpdates').checked,
        loginNotifications: document.getElementById('loginNotifications').checked
    };
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    showToast('success', 'Settings Saved', 'Your notification preferences have been saved');
}

// Test notifications function removed - no longer needed

// Privacy & Security Functions
function setupTwoFactor() {
    showToast('info', '2FA Setup', 'Two-factor authentication setup will be implemented in a future update');
}

function exportData() {
    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        settings: JSON.parse(localStorage.getItem('notificationSettings') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-data-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('success', 'Data Exported', 'Your personal data has been downloaded');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
            showToast('error', 'Account Deletion', 'Account deletion will be implemented in a future update');
        }
    }
}

// Appearance Functions
function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        // Auto - follow system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
    
    localStorage.setItem('theme', theme);
    showToast('success', 'Theme Changed', `Theme changed to ${theme}`);
}

function changeLanguage() {
    const language = document.getElementById('languageSelect').value;
    localStorage.setItem('language', language);
    showToast('info', 'Language Changed', `Language changed to ${language} (UI translation will be implemented in a future update)`);
}

function changeFontSize() {
    const fontSize = document.getElementById('fontSize').value;
    document.getElementById('fontSizeValue').textContent = fontSize + 'px';
    
    // Apply font size to body
    document.body.style.fontSize = fontSize + 'px';
    localStorage.setItem('fontSize', fontSize);
    
    showToast('success', 'Font Size Changed', `Font size changed to ${fontSize}px`);
}

// Initialize Settings
function initializeSettings() {
    // Load user data
    const username = localStorage.getItem('username') || 'Current User';
    const email = localStorage.getItem('email') || 'user@example.com';
    
    document.getElementById('username').value = username;
    document.getElementById('email').value = email;
    
    // Load notification settings
    const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    Object.keys(notificationSettings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.checked = notificationSettings[key];
        }
    });
    
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'auto';
    document.getElementById('themeSelect').value = savedTheme;
    changeTheme();
    
    // Load language
    const savedLanguage = localStorage.getItem('language') || 'en';
    document.getElementById('languageSelect').value = savedLanguage;
    
    // Load font size
    const savedFontSize = localStorage.getItem('fontSize') || '16';
    document.getElementById('fontSize').value = savedFontSize;
    document.getElementById('fontSizeValue').textContent = savedFontSize + 'px';
    document.body.style.fontSize = savedFontSize + 'px';
    
    // Load system info
    loadSystemInfo();
}

function loadSystemInfo() {
    // Last login
    const lastLogin = localStorage.getItem('lastLogin') || new Date().toISOString();
    document.getElementById('lastLogin').textContent = new Date(lastLogin).toLocaleString();
    
    // Account created
    const accountCreated = localStorage.getItem('accountCreated') || new Date().toISOString();
    document.getElementById('accountCreated').textContent = new Date(accountCreated).toLocaleDateString();
    
    // Browser info
    const browserInfo = navigator.userAgent.split(' ').slice(-2).join(' ');
    document.getElementById('browserInfo').textContent = browserInfo;
}

// Initialize settings when settings tab is clicked
document.addEventListener('DOMContentLoaded', function() {
    // Add click listener for settings tab
    const settingsTab = document.getElementById('settings');
    if (settingsTab) {
        settingsTab.addEventListener('click', function() {
            setTimeout(initializeSettings, 100);
        });
    }
});
