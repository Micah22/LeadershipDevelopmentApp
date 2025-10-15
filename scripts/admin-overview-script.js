// Admin User Overview Script

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin User Overview page loaded');
    
    // Initialize the page
    initializePage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load user data
    loadUserData();
    
    // Ensure content is visible after everything is loaded
    setTimeout(() => {
        showUserManagementContent();
    }, 100);
});

function initializePage() {
    // Check if user is logged in and is admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || currentUser.role !== 'Admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Admin user authenticated:', currentUser);
    
    // Set up user info
    updateUserInfo();
    
    // Set up navigation
    updateNavigation();
}

function updateUserInfo() {
    const username = localStorage.getItem('username');
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
}

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
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="admin-user-overview.html" class="nav-link active">User Overview</a><a href="#" class="nav-link">Resources</a>';
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="admin-user-overview.html" class="nav-link active">User Overview</a><a href="#" class="nav-link">Resources</a>';
    } else {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="#" class="nav-link">Resources</a>';
    }
    
    navLinks.innerHTML = navigationHTML;
}

function setupEventListeners() {
    // Sign out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to sign out?')) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                window.location.href = 'index.html';
            }
        });
    }
    
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
    }
    
    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found navigation items:', navItems.length);
    navItems.forEach((item, index) => {
        console.log(`Nav item ${index}:`, item.id, item);
        item.addEventListener('click', function(e) {
            console.log('Navigation item clicked:', this.id);
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
    console.log('handleNavigation called with itemId:', itemId);
    e.preventDefault(); // Prevent default link behavior for all items
    
    switch(itemId) {
        case 'userManagement':
            console.log('User Management selected');
            showUserManagementContent();
            break;
        case 'pathManagement':
            console.log('Path Management selected');
            try {
                showPathManagementContent();
            } catch (error) {
                console.error('Error in showPathManagementContent:', error);
            }
            break;
        case 'reports':
            console.log('Reports selected');
            // TODO: Show reports content
            break;
        case 'settings':
            console.log('Settings selected');
            // TODO: Show settings content
            break;
        default:
            console.log('Unknown navigation item:', itemId);
    }
}

function loadUserData() {
    console.log('loadUserData called');
    
    // Initialize default users if none exist
    initializeDefaultUsers();
    
    // Initialize global modules if none exist
    initializeGlobalModules();
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Loading user data:', users);
    console.log('Number of users:', users.length);
    
    // Debug: Check user progress data
    users.forEach(user => {
        const userProgress = getUserProgress(user.username);
        console.log(`Progress for ${user.username}:`, userProgress);
        const overallProgress = calculateUserOverallProgress(user.username);
        console.log(`Overall progress for ${user.username}:`, overallProgress);
    });
    
    // Update summary cards
    console.log('Updating summary cards');
    updateSummaryCards(users);
    
    // Update role statistics
    console.log('Updating role statistics');
    updateRoleStats(users);
    
    // Update user progress table
    console.log('Updating user progress table');
    updateUserProgressTable(users);
}

function updateSummaryCards(users) {
    console.log('updateSummaryCards called with', users.length, 'users');
    const totalUsersElement = document.getElementById('totalUsers');
    
    if (totalUsersElement) {
        totalUsersElement.textContent = users.length;
        console.log('Updated total users element to:', users.length);
    } else {
        console.log('Total users element not found');
    }
}

function updateRoleStats(users) {
    console.log('updateRoleStats called with', users.length, 'users');
    const roleStatsElement = document.getElementById('roleStats');
    if (!roleStatsElement) {
        console.log('Role stats element not found');
        return;
    }
    
    // Count users by role
    const roleCounts = {};
    users.forEach(user => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    console.log('Role counts:', roleCounts);
    
    // Create role stat cards
    const roleStatsHTML = Object.entries(roleCounts).map(([role, count]) => `
        <div class="role-stat">
            <div class="role-stat-number">${count}</div>
            <div class="role-stat-label">${role}</div>
        </div>
    `).join('');
    
    roleStatsElement.innerHTML = roleStatsHTML || '<p>No role data available</p>';
    console.log('Updated role stats HTML');
}

function updateUserProgressTable(users) {
    console.log('updateUserProgressTable called with', users.length, 'users');
    const tableBody = document.getElementById('userProgressTable');
    if (!tableBody) {
        console.log('User progress table body not found');
        return;
    }
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--medium-gray);">
                    No users found
                </td>
            </tr>
        `;
        return;
    }
    
    // Generate table rows for each user
    const tableRows = users.map(user => {
        // Get real progress data for this user
        const userProgress = calculateUserOverallProgress(user.username);
        const completed = userProgress.completedTasks;
        const total = userProgress.totalTasks;
        const progress = userProgress.percentage;
        const status = user.status || 'active';
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.9rem;">
                            ${user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${user.fullName}</div>
                            <div style="font-size: 0.8rem; color: var(--medium-gray);">${user.username}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${getStatusClass(user.role)}">${user.role}</span>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="progress-bar" style="width: 100px;">
                            <div class="progress-fill" style="width: ${progress}%;"></div>
                        </div>
                        <span style="font-weight: 600;">${progress}%</span>
                    </div>
                </td>
                <td style="font-weight: 600;">${completed}</td>
                <td style="color: var(--medium-gray);">${total}</td>
                <td>
                    <span class="status-badge status-${status}">${status}</span>
                </td>
                <td>
                    <button class="action-btn" onclick="viewUserDetails('${user.username}')">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = tableRows;
    console.log('Updated user progress table with', users.length, 'rows');
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

function viewUserDetails(username) {
    console.log('Viewing details for user:', username);
    openUserModal(username);
}

function openUserModal(username) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSave = document.getElementById('modalSave');
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
        alert('User not found');
        return;
    }
    
    // Update modal title and button for editing
    modalTitle.textContent = 'Edit User';
    modalSave.textContent = 'Save Changes';
    
    // Populate form with user data
    document.getElementById('editFullName').value = user.fullName || '';
    document.getElementById('editUsername').value = user.username || '';
    document.getElementById('editPassword').value = user.password || '';
    document.getElementById('editRole').value = user.role || 'Team Member';
    document.getElementById('editStatus').value = user.status || 'active';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editStartDate').value = user.startDate || '';
    
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

function saveUserChanges() {
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
        alert('Please fill in all required fields');
        return;
    }
    
    const users = getUsers();
    
    if (!currentUsername) {
        // Creating new user
        // Check if username already exists
        if (users.find(u => u.username === formData.username)) {
            alert('Username already exists. Please choose a different username.');
            return;
        }
        
        // Create new user object
        const newUser = {
            fullName: formData.fullName,
            username: formData.username,
            password: formData.password,
            role: formData.role,
            status: formData.status || 'Active',
            email: formData.email || '',
            startDate: formData.startDate || new Date().toISOString().split('T')[0],
            progress: 0,
            completedTasks: 0,
            totalTasks: 0
        };
        
        // Add new user
        users.push(newUser);
        saveUsers(users);
        
        alert('New user created successfully!');
        closeUserModal();
        loadUserData();
        return;
    }
    
    // Editing existing user
    const userIndex = users.findIndex(u => u.username === currentUsername);
    
    if (userIndex === -1) {
        alert('User not found');
        return;
    }
    
    // Update user data
    users[userIndex] = {
        ...users[userIndex],
        ...formData
    };
    
    // Save updated users
    localStorage.setItem('users', JSON.stringify(users));
    
    // Refresh the table
    loadUserData();
    
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

// Utility function to get users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Utility function to save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Initialize default users if none exist
function initializeDefaultUsers() {
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
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
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('Initialized default users:', defaultUsers);
    }
}

// Utility function to check if user can access a module based on role
function canUserAccessModule(userRole, requiredRole) {
    // Define role hierarchy (higher number = higher authority)
    const roleHierarchy = {
        'Team Member': 1,
        'Supervisor': 2,
        'Director': 3,
        'Admin': 4
    };
    
    const userLevel = roleHierarchy[userRole] || 1;
    const requiredLevel = roleHierarchy[requiredRole] || 1;
    
    // User can access modules at their level or below
    return userLevel >= requiredLevel;
}

// Utility function to calculate overall progress for a user
function calculateUserOverallProgress(username) {
    const userProgress = getUserProgress(username);
    console.log(`Calculating progress for ${username}:`, userProgress);
    
    // Get user's role
    const users = getUsers();
    const user = users.find(u => u.username === username);
    const userRole = user ? user.role : 'Team Member';
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    // Get all module titles from global storage (for progress calculation, only count accessible modules)
    const globalModules = localStorage.getItem('globalModules');
    let moduleTitles = [];
    
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
    
    moduleTitles.forEach(moduleTitle => {
        const moduleData = getModuleData(moduleTitle);
        if (moduleData && moduleData.checklist && canUserAccessModule(userRole, moduleData.requiredRole)) {
            totalTasks += moduleData.checklist.length;
            const moduleProgress = userProgress[moduleTitle];
            
            console.log(`Module ${moduleTitle}:`, {
                moduleData: moduleData,
                moduleProgress: moduleProgress,
                totalTasks: moduleData.checklist.length
            });
            
            if (moduleProgress && moduleProgress.checklist) {
                // Count completed tasks (true values in the checklist array)
                const completedInModule = moduleProgress.checklist.filter(item => item === true).length;
                completedTasks += completedInModule;
                console.log(`Completed in ${moduleTitle}: ${completedInModule}`);
            }
        }
    });
    
    return {
        totalTasks,
        completedTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
}

// Utility function to get user's progress data
function getUserProgress(username) {
    const userProgressKey = `userProgress_${username}`;
    return JSON.parse(localStorage.getItem(userProgressKey) || '{}');
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
        checklist: module.checklist,
        requiredRole: module.requiredRole
    };
}

// Content switching functions
function showUserManagementContent() {
    console.log('Showing user management content');
    
    // Hide path management content
    const pathContent = document.getElementById('pathManagementContent');
    if (pathContent) {
        pathContent.style.display = 'none';
        console.log('Hidden path management content');
    }
    
        // Show user management content (main content is already visible)
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            mainContent.style.minHeight = '100vh';
            mainContent.style.width = '100%';
            console.log('Showed main content');
        } else {
            console.log('Main content element not found');
        }
        
        // Show user management sections
        const userManagementSections = document.querySelectorAll('.section');
        userManagementSections.forEach(section => {
            section.style.display = 'block';
        });
        
        // Also show the content header
        const contentHeader = document.querySelector('.content-header');
        if (contentHeader) {
            contentHeader.style.display = 'block';
        }
        
        console.log('Showed user management sections');
}

function showPathManagementContent() {
    try {
        console.log('showPathManagementContent called');
        
        // Keep main content visible but hide user management sections
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            mainContent.style.minHeight = '100vh';
            mainContent.style.width = '100%';
            console.log('Main content made visible');
        } else {
            console.log('Main content element not found');
        }
        
        // Hide user management sections
        const userManagementSections = document.querySelectorAll('.section');
        userManagementSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Also hide the content header
        const contentHeader = document.querySelector('.content-header');
        if (contentHeader) {
            contentHeader.style.display = 'none';
        }
        
        console.log('Hidden user management sections');
        
        // Show path management content
        console.log('About to get path management content element');
        const pathContent = document.getElementById('pathManagementContent');
        console.log('Path content element:', pathContent);
        if (pathContent) {
            console.log('Path content element found, setting display to block');
            pathContent.style.display = 'block';
            pathContent.style.visibility = 'visible';
            pathContent.style.opacity = '1';
            pathContent.style.position = 'relative';
            pathContent.style.zIndex = '999';
            pathContent.style.backgroundColor = '#f0f0f0';
            pathContent.style.minHeight = '500px';
            pathContent.style.border = '2px solid red';
            console.log('Showed path management content');
            console.log('About to call loadModulesData');
        // Load modules data when showing path management
        try {
            loadModulesData();
            console.log('loadModulesData call completed');
        } catch (error) {
            console.error('Error in loadModulesData:', error);
        }
        } else {
            console.log('Path management content element not found');
        }
    } catch (error) {
        console.error('Error in showPathManagementContent:', error);
    }
}

// Path Management Functions (copied from admin-path-management-script.js)
function loadModulesData() {
    try {
        console.log('loadModulesData called');
        
        // Initialize global modules if they don't exist
        initializeGlobalModules();
        
        const modules = getModuleData();
        console.log('Modules data:', modules);
        
        const modulesGrid = document.getElementById('modulesManagementGrid');
        console.log('Modules grid element:', modulesGrid);
        
        if (!modulesGrid) {
            console.log('Modules grid element not found');
            return;
        }
        
        const modulesHTML = modules.map(module => {
            // Count tasks with files
            const tasksWithFiles = module.checklist.filter(task => {
                if (typeof task === 'string') return false;
                return task.file && task.file.trim() !== '';
            }).length;
            
            return `
                <div class="module-management-card">
                    <div class="module-management-header">
                        <h3 class="module-management-title">${module.title}</h3>
                        <span class="module-management-status ${module.status || 'active'}">${(module.status || 'active').replace('-', ' ')}</span>
                    </div>
                    <div class="module-management-description">${module.description}</div>
                    <div class="module-management-stats">
                        <div class="module-management-tasks">${module.checklist.length} learning tasks</div>
                        ${tasksWithFiles > 0 ? `<div class="module-management-files"><i class="fas fa-file"></i> ${tasksWithFiles} tasks with files</div>` : ''}
                    </div>
                    <div class="module-management-role">
                        <strong>Required Role:</strong> ${module.requiredRole || 'Team Member'}
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
        
        console.log('Modules HTML generated');
        modulesGrid.innerHTML = modulesHTML;
        console.log('Modules grid innerHTML set');
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
                description: 'Master the fundamentals of leading teams effectively. Learn about team dynamics, motivation techniques, and how to build a cohesive, high-performing team.',
                status: 'active',
                requiredRole: 'Supervisor',
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
                requiredRole: 'Supervisor',
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
                requiredRole: 'Supervisor',
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
                requiredRole: 'Director',
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
                requiredRole: 'Director',
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
    }
}

function getModuleData() {
    const globalModules = localStorage.getItem('globalModules');
    if (!globalModules) {
        return [];
    }
    return JSON.parse(globalModules);
}

function editModule(moduleTitle) {
    openModuleModal(moduleTitle);
}

function deleteModule(moduleTitle) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the module "${moduleTitle}"?\n\nThis action cannot be undone and will remove the module from all user accounts.`)) {
        return;
    }
    
    // Get modules from global storage
    const modules = getModuleData();
    const moduleIndex = modules.findIndex(m => m.title === moduleTitle);
    
    if (moduleIndex === -1) {
        alert('Module not found');
        return;
    }
    
    // Remove module from array
    modules.splice(moduleIndex, 1);
    
    // Save updated modules to global storage
    localStorage.setItem('globalModules', JSON.stringify(modules));
    
    console.log(`Module "${moduleTitle}" deleted successfully`);
    
    // Reload modules data
    loadModulesData();
    
    // Show success message
    alert(`Module "${moduleTitle}" has been deleted successfully!`);
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
        if (checklistContainer) checklistContainer.innerHTML = '';
    } else {
        // Populate form with existing module data
        const modules = getModuleData();
        const module = modules.find(m => m.title === moduleTitle);
        
        if (module) {
            if (titleInput) titleInput.value = module.title;
            if (descriptionInput) descriptionInput.value = module.description;
            if (statusSelect) statusSelect.value = module.status || 'active';
            if (roleSelect) roleSelect.value = module.requiredRole || 'Team Member';
            
            // Populate checklist
            if (checklistContainer) {
                const checklistHTML = module.checklist.map((task, index) => {
                    // Handle both old string format and new object format
                    const taskDescription = typeof task === 'string' ? task : (task.description || '');
                    const taskFile = typeof task === 'object' ? (task.file || '') : '';
                    
                    // Handle both old single file format and new multiple files format
                    const files = typeof task === 'object' && task.files ? task.files : (taskFile ? [taskFile] : []);
                    
                    return `
                        <div class="checklist-item">
                            <input type="text" class="checklist-task-input" value="${taskDescription}" placeholder="Enter task description">
                            <button type="button" class="add-file-btn" onclick="toggleFileSection(this)">
                                <i class="fas fa-plus"></i>
                                ${files.length > 0 ? `Show Files (${files.length} attached)` : 'Add Files'}
                            </button>
                            <div class="checklist-file-section ${files.length > 0 ? 'show' : ''}">
                                <input type="text" class="checklist-file-input" placeholder="File name or URL (optional)">
                                <input type="file" class="checklist-file-upload" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mp3" onchange="handleFileUpload(this, ${index})" multiple>
                                <div class="checklist-files-list" id="files-list-${index}">
                                    ${files.map((file, fileIndex) => `
                                        <div class="checklist-file-item">
                                            <div class="checklist-file-item-info">
                                                <i class="fas fa-file"></i>
                                                <span>${file}</span>
                                            </div>
                                            <button type="button" class="checklist-file-item-remove" onclick="removeFileFromTask(${index}, ${fileIndex})">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="checklist-actions">
                                <span class="task-number">Task ${index + 1}</span>
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

function saveModuleChanges() {
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
    const requiredRole = document.getElementById('editModuleRole').value;
    
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
                return fileSpan ? fileSpan.textContent.trim() : '';
            }).filter(file => file.length > 0);
            
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
    if (!title || !description || checklist.length === 0) {
        alert('Please fill in all required fields and add at least one task');
        return;
    }

    // Save to global storage
    const modules = getModuleData();

    if (currentModule === 'new') {
        // Add new module
        modules.push({
            title,
            description,
            status,
            requiredRole,
            checklist
        });
    } else {
        // Update existing module
        const moduleIndex = modules.findIndex(m => m.title === currentModule);
        if (moduleIndex !== -1) {
            modules[moduleIndex] = {
                title,
                description,
                status,
                requiredRole,
                checklist
            };
        }
    }

    // Save updated modules to global storage
    localStorage.setItem('globalModules', JSON.stringify(modules));

    console.log('Module saved to global storage:', {
        title,
        description,
        status,
        requiredRole,
        checklist
    });

    // Close modal
    closeModuleModal();

    // Reload modules data
    loadModulesData();

    // Show success message
    alert('Module saved successfully! Changes will be reflected across all user accounts.');
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

function handleFileUpload(fileInput, taskIndex) {
    const file = fileInput.files[0];
    if (file) {
        // Update the file input text field with the file name
        const fileTextInput = fileInput.previousElementSibling;
        fileTextInput.value = file.name;
        
        // Show file info
        showFileInfo(fileInput, file);
    }
}

function showFileInfo(fileInput, file) {
    const checklistItem = fileInput.closest('.checklist-item');
    let fileInfo = checklistItem.querySelector('.checklist-file-info');
    
    if (!fileInfo) {
        fileInfo = document.createElement('div');
        fileInfo.className = 'checklist-file-info';
        fileInput.parentElement.parentElement.insertBefore(fileInfo, fileInput.parentElement.nextSibling);
    }
    
    fileInfo.innerHTML = `
        <i class="fas fa-file"></i>
        <span>File: ${file.name} (${formatFileSize(file.size)})</span>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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
        
        // Add each selected file to the files list
        Array.from(files).forEach(file => {
            addFileToList(filesList, file.name, file.size);
        });
        
        // Update button text to reflect new file count
        const addFileBtn = checklistItem.querySelector('.add-file-btn');
        updateFileButtonText(addFileBtn);
        
        // Clear the file input
        fileInput.value = '';
    }
}

function addFileToList(filesList, fileName, fileSize) {
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

// Export functions for potential use in other scripts
window.adminOverview = {
    loadUserData,
    updateSummaryCards,
    updateRoleStats,
    updateUserProgressTable,
    viewUserDetails,
    showUserManagementContent,
    showPathManagementContent,
    loadModulesData
};
