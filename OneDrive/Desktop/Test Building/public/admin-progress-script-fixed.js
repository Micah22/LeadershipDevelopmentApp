// Admin Progress Overview Script - Fixed Version
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Progress page loaded - Fixed Version');
    
    // Initialize the page
    loadUserData();
    updateNavigation();
    loadProgressData();
    setupEventListeners();
});

// Load current user data
function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log('Current user from localStorage:', currentUser);
    
    if (currentUser.username) {
        document.getElementById('currentUserName').textContent = currentUser.username;
        document.getElementById('currentUserRole').textContent = currentUser.role;
    } else {
        // If no current user, redirect to login
        console.log('No current user found, redirecting to login');
        window.location.href = 'index.html';
    }
}

// Update navigation based on user role
function updateNavigation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const navLinks = document.getElementById('navLinks');
    
    console.log('Updating navigation for user:', currentUser);
    
    if (!currentUser.username) {
        navLinks.innerHTML = '<a href="index.html" class="nav-link">Login</a>';
        return;
    }

    let navigationHTML = '';
    if (currentUser.role === 'Admin') {
        navigationHTML = `
            <a href="user-dashboard.html" class="nav-link">Dashboard</a>
            <a href="my-progress.html" class="nav-link">My Progress</a>
            <a href="admin-progress.html" class="nav-link active">Progress Overview</a>
            <a href="#" class="nav-link">Resources</a>
        `;
    } else if (currentUser.role === 'Director' || currentUser.role === 'Supervisor') {
        navigationHTML = `
            <a href="user-dashboard.html" class="nav-link">Dashboard</a>
            <a href="my-progress.html" class="nav-link">My Progress</a>
            <a href="admin-progress.html" class="nav-link active">Progress Overview</a>
            <a href="#" class="nav-link">Resources</a>
        `;
    } else {
        navigationHTML = `
            <a href="user-dashboard.html" class="nav-link">Dashboard</a>
            <a href="my-progress.html" class="nav-link">My Progress</a>
            <a href="#" class="nav-link">Resources</a>
        `;
    }
    
    navLinks.innerHTML = navigationHTML;
}

// Load and display progress data
function loadProgressData() {
    let allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    let leadershipPaths = JSON.parse(localStorage.getItem('leadershipPaths') || '[]');
    
    console.log('Loading progress data:');
    console.log('All users:', allUsers);
    console.log('Leadership paths:', leadershipPaths);
    
    // If no users exist, create some sample data
    if (allUsers.length === 0) {
        console.log('No users found, creating sample data');
        allUsers = [
            {
                username: 'lisa',
                fullName: 'Lisa Johnson',
                password: 'password123',
                role: 'Team Member',
                status: 'Active'
            },
            {
                username: 'admin',
                fullName: 'Admin User',
                password: 'admin123',
                role: 'Admin',
                status: 'Active'
            },
            {
                username: 'john',
                fullName: 'John Smith',
                password: 'password123',
                role: 'Supervisor',
                status: 'Active'
            }
        ];
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
    }
    
    // If no leadership paths exist, create some sample data
    if (leadershipPaths.length === 0) {
        console.log('No leadership paths found, creating sample data');
        leadershipPaths = [
            {
                id: 'path1',
                title: 'Team Member Development',
                description: 'Basic leadership skills for team members',
                role: 'Team Member',
                tasks: ['Complete training module 1', 'Attend team meetings', 'Complete project assignment']
            },
            {
                id: 'path2',
                title: 'Supervisor Training',
                description: 'Advanced leadership skills for supervisors',
                role: 'Supervisor',
                tasks: ['Complete management training', 'Lead team projects', 'Mentor team members']
            }
        ];
        localStorage.setItem('leadershipPaths', JSON.stringify(leadershipPaths));
    }
    
    // Update summary statistics
    updateSummaryStats(allUsers, leadershipPaths);
    
    // Update users by role
    displayUsersByRole(allUsers);
    
    // Update individual user progress
    displayIndividualProgress(allUsers, leadershipPaths);
}

// Update summary statistics
function updateSummaryStats(allUsers, leadershipPaths) {
    const totalUsers = allUsers.length;
    const totalUsersElement = document.getElementById('totalUsers');
    const avgProgressElement = document.getElementById('avgProgress');
    
    if (totalUsersElement) {
        totalUsersElement.textContent = totalUsers;
    }
    
    if (avgProgressElement) {
        if (totalUsers === 0) {
            avgProgressElement.textContent = '0%';
        } else {
            let totalProgress = 0;
            allUsers.forEach(user => {
                const userProgress = JSON.parse(localStorage.getItem(`userProgress_${user.username}`) || '{}');
                const userTotalProgress = calculateUserProgress(userProgress, leadershipPaths);
                totalProgress += userTotalProgress;
            });
            const avgProgress = Math.round(totalProgress / totalUsers);
            avgProgressElement.textContent = `${avgProgress}%`;
        }
    }
}

// Calculate user progress
function calculateUserProgress(userProgress, leadershipPaths) {
    if (!userProgress || Object.keys(userProgress).length === 0) {
        return 0;
    }
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    leadershipPaths.forEach(path => {
        if (userProgress[path.id]) {
            const pathProgress = userProgress[path.id];
            if (pathProgress.completedTasks && Array.isArray(pathProgress.completedTasks)) {
                totalTasks += pathProgress.completedTasks.length;
                completedTasks += pathProgress.completedTasks.filter(task => task).length;
            }
        }
    });
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

// Display users by role
function displayUsersByRole(allUsers) {
    const roleCardsGrid = document.getElementById('roleCardsGrid');
    if (!roleCardsGrid) return;
    
    // Group users by role
    const usersByRole = {};
    allUsers.forEach(user => {
        if (!usersByRole[user.role]) {
            usersByRole[user.role] = [];
        }
        usersByRole[user.role].push(user);
    });
    
    // Only show roles that have at least 1 user
    const rolesWithUsers = Object.keys(usersByRole).filter(role => usersByRole[role].length > 0);
    
    if (rolesWithUsers.length === 0) {
        roleCardsGrid.innerHTML = '<p class="no-data">No users found</p>';
        return;
    }
    
    let roleCardsHTML = '';
    rolesWithUsers.forEach(role => {
        const roleUsers = usersByRole[role];
        roleCardsHTML += `
            <div class="role-card">
                <div class="role-header">
                    <h4>${role}</h4>
                    <span class="user-count">${roleUsers.length} user${roleUsers.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="role-users">
                    ${roleUsers.map(user => `
                        <div class="role-user">
                            <span class="user-name">${user.username}</span>
                            <span class="user-status ${user.status === 'Active' ? 'active' : 'inactive'}">${user.status}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    roleCardsGrid.innerHTML = roleCardsHTML;
}

// Display individual user progress
function displayIndividualProgress(allUsers, leadershipPaths) {
    const progressTableBody = document.getElementById('progressTableBody');
    if (!progressTableBody) return;
    
    if (allUsers.length === 0) {
        progressTableBody.innerHTML = '<tr><td colspan="7" class="no-data">No users found</td></tr>';
        return;
    }
    
    let tableRowsHTML = '';
    allUsers.forEach(user => {
        const userProgress = JSON.parse(localStorage.getItem(`userProgress_${user.username}`) || '{}');
        const progressData = calculateDetailedProgress(userProgress, leadershipPaths);
        
        tableRowsHTML += `
            <tr>
                <td>
                    <div class="user-info">
                        <span class="user-name">${user.username}</span>
                        <span class="user-full-name">${user.fullName || user.username}</span>
                    </div>
                </td>
                <td><span class="role-badge role-${user.role.toLowerCase().replace(' ', '-')}">${user.role}</span></td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressData.percentage}%"></div>
                        </div>
                        <span class="progress-text">${progressData.percentage}%</span>
                    </div>
                </td>
                <td>${progressData.completed}</td>
                <td>${progressData.total}</td>
                <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
                <td>
                    <button class="btn-action" onclick="editUser('${user.username}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            </tr>
        `;
    });
    
    progressTableBody.innerHTML = tableRowsHTML;
}

// Calculate detailed progress for a user
function calculateDetailedProgress(userProgress, leadershipPaths) {
    if (!userProgress || Object.keys(userProgress).length === 0) {
        return { completed: 0, total: 0, percentage: 0 };
    }
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    leadershipPaths.forEach(path => {
        if (userProgress[path.id]) {
            const pathProgress = userProgress[path.id];
            if (pathProgress.completedTasks && Array.isArray(pathProgress.completedTasks)) {
                totalTasks += pathProgress.completedTasks.length;
                completedTasks += pathProgress.completedTasks.filter(task => task).length;
            }
        }
    });
    
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
        completed: completedTasks,
        total: totalTasks,
        percentage: percentage
    };
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Handle different tools
            const tool = this.getAttribute('data-tool');
            handleSidebarTool(tool);
        });
    });
    
    // Edit user form
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUserChanges();
        });
    }
    
    // Add user form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addUser();
        });
    }
}

// Handle sidebar tool selection
function handleSidebarTool(tool) {
    // For now, just show user management
    // This can be expanded to show different content based on the tool
    console.log('Selected tool:', tool);
}

// Edit user function
function editUser(username) {
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const user = allUsers.find(u => u.username === username);
    
    if (!user) {
        alert('User not found');
        return;
    }
    
    // Get current user role for permission checking
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUserRole = currentUser.role;
    
    // Populate form
    document.getElementById('editFullName').value = user.fullName || user.username;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editPassword').value = user.password || '';
    document.getElementById('editRole').value = user.role;
    document.getElementById('editStatus').value = user.status;
    
    // Apply role-based restrictions
    const roleField = document.getElementById('editRole');
    const statusField = document.getElementById('editStatus');
    
    if (currentUserRole === 'Supervisor') {
        // Supervisors cannot change role or status
        roleField.disabled = true;
        statusField.disabled = true;
        roleField.style.backgroundColor = '#f5f5f5';
        statusField.style.backgroundColor = '#f5f5f5';
    } else {
        // Directors and Admins can change everything
        roleField.disabled = false;
        statusField.disabled = false;
        roleField.style.backgroundColor = '';
        statusField.style.backgroundColor = '';
    }
    
    // Store the original user data for reference
    window.editingUser = user;
    
    // Show modal
    document.getElementById('editUserModal').style.display = 'block';
}

// Save user changes
function saveUserChanges() {
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUserRole = currentUser.role;
    const originalUser = window.editingUser;
    
    if (!originalUser) {
        alert('No user selected for editing');
        return;
    }
    
    // Get form data
    const updatedUser = {
        fullName: document.getElementById('editFullName').value,
        username: document.getElementById('editUsername').value,
        password: document.getElementById('editPassword').value,
        role: document.getElementById('editRole').value,
        status: document.getElementById('editStatus').value
    };
    
    // Apply role-based restrictions
    if (currentUserRole === 'Supervisor') {
        // Supervisors cannot change role or status - preserve original values
        updatedUser.role = originalUser.role;
        updatedUser.status = originalUser.status;
    }
    
    // Validate username uniqueness (if changed)
    if (updatedUser.username !== originalUser.username) {
        const existingUser = allUsers.find(u => u.username === updatedUser.username && u.username !== originalUser.username);
        if (existingUser) {
            alert('Username already exists. Please choose a different username.');
            return;
        }
    }
    
    // Update user in array
    const userIndex = allUsers.findIndex(u => u.username === originalUser.username);
    if (userIndex !== -1) {
        allUsers[userIndex] = updatedUser;
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        
        // If this is the current user, update current user data
        if (originalUser.username === currentUser.username) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        
        // Reload data
        loadProgressData();
        
        // Close modal
        closeEditUserModal();
        
        alert('User updated successfully');
    } else {
        alert('User not found');
    }
}

// Add new user
function addUser() {
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    const newUser = {
        fullName: document.getElementById('addFullName').value,
        username: document.getElementById('addUsername').value,
        password: document.getElementById('addPassword').value,
        role: document.getElementById('addRole').value,
        status: 'Active'
    };
    
    // Validate username uniqueness
    const existingUser = allUsers.find(u => u.username === newUser.username);
    if (existingUser) {
        alert('Username already exists. Please choose a different username.');
        return;
    }
    
    // Add user to array
    allUsers.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    
    // Reload data
    loadProgressData();
    
    // Close modal and reset form
    closeAddUserModal();
    document.getElementById('addUserForm').reset();
    
    alert('User added successfully');
}

// Close edit user modal
function closeEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
    window.editingUser = null;
}

// Close add user modal
function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Make functions globally available
window.editUser = editUser;
window.closeEditUserModal = closeEditUserModal;
window.closeAddUserModal = closeAddUserModal;
window.logout = logout;

