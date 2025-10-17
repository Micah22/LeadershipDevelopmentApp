// Admin Role Management Script

// Toast notification function
function showToast(type, title, message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong>${title}</strong>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 5000);
}

// Default roles and permissions
const defaultRoles = [
    {
        id: 'admin',
        name: 'Admin',
        description: 'Full system access with all permissions',
        level: 4,
        permissions: [
            'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_modules', 'create_modules', 'edit_modules', 'delete_modules',
            'view_assignments', 'create_assignments', 'edit_assignments', 'delete_assignments',
            'view_reports', 'manage_roles', 'system_settings', 'backup_restore'
        ]
    },
    {
        id: 'director',
        name: 'Director',
        description: 'High-level management access with most permissions',
        level: 3,
        permissions: [
            'view_users', 'create_users', 'edit_users',
            'view_modules', 'create_modules', 'edit_modules',
            'view_assignments', 'create_assignments', 'edit_assignments',
            'view_reports'
        ]
    },
    {
        id: 'supervisor',
        name: 'Supervisor',
        description: 'Team management with standard permissions',
        level: 2,
        permissions: [
            'view_users', 'edit_users',
            'view_modules', 'edit_modules',
            'view_assignments', 'create_assignments', 'edit_assignments',
            'view_reports'
        ]
    },
    {
        id: 'trainer',
        name: 'Trainer',
        description: 'Training and development focus with limited permissions',
        level: 2,
        permissions: [
            'view_users',
            'view_modules', 'edit_modules',
            'view_assignments', 'create_assignments',
            'view_reports'
        ]
    },
    {
        id: 'assistant_supervisor',
        name: 'Assistant Supervisor',
        description: 'Support role with basic management permissions',
        level: 1,
        permissions: [
            'view_users',
            'view_modules',
            'view_assignments', 'create_assignments'
        ]
    },
    {
        id: 'team_member',
        name: 'Team Member',
        description: 'Basic access for individual contributors',
        level: 1,
        permissions: [
            'view_users',
            'view_modules',
            'view_assignments'
        ]
    }
];

// Permission categories
const permissionCategories = {
    'User Management': ['view_users', 'create_users', 'edit_users', 'delete_users'],
    'Module Management': ['view_modules', 'create_modules', 'edit_modules', 'delete_modules'],
    'Assignment Management': ['view_assignments', 'create_assignments', 'edit_assignments', 'delete_assignments'],
    'System Administration': ['view_reports', 'manage_roles', 'system_settings', 'backup_restore']
};

// Permission labels
const permissionLabels = {
    'view_users': 'View Users',
    'create_users': 'Create Users',
    'edit_users': 'Edit Users',
    'delete_users': 'Delete Users',
    'view_modules': 'View Modules',
    'create_modules': 'Create Modules',
    'edit_modules': 'Edit Modules',
    'delete_modules': 'Delete Modules',
    'view_assignments': 'View Assignments',
    'create_assignments': 'Create Assignments',
    'edit_assignments': 'Edit Assignments',
    'delete_assignments': 'Delete Assignments',
    'view_reports': 'View Reports',
    'manage_roles': 'Manage Roles',
    'system_settings': 'System Settings',
    'backup_restore': 'Backup & Restore'
};

let currentRoles = [...defaultRoles];
let editingRole = null;

document.addEventListener('DOMContentLoaded', async function() {
    
    // Check if user is logged in and is admin
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUserData = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !currentUserData) {
        window.location.href = 'index.html';
        return;
    }
    
    // Parse the user data
    let username;
    try {
        const userObj = JSON.parse(currentUserData);
        username = userObj.username;
    } catch (e) {
        username = currentUserData;
    }
    
    // Check if user is admin
    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user || user.role !== 'Admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'user-dashboard.html';
        return;
    }
    
    // Wait a bit for navbar to load first
    setTimeout(async () => {
        // Initialize the page
        await initializePage();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize theme
        initializeTheme();
        
        // Load role data
        await loadRoleData();
    }, 200);
});

async function initializePage() {
    // Set up user info
    await updateUserInfo();
    
    // Navigation is handled by navbar.js
}

async function updateUserInfo() {
    const currentUserData = localStorage.getItem('currentUser');
    
    // Parse the user data
    let username;
    try {
        const userObj = JSON.parse(currentUserData);
        username = userObj.username;
    } catch (e) {
        username = currentUserData;
    }
    
    // Load users from database
    let users = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            users = await window.dbService.getUsers();
        } else {
            console.warn('Database service not configured, using localStorage fallback');
            showToast('warning', 'Database Unavailable', 'Using offline mode - role data may not be synchronized');
        }
    } catch (error) {
        console.error('Failed to load users from database:', error);
        showToast('error', 'Database Error', `Failed to load user data: ${error.message || 'Unknown error'}`);
        
        // Fallback to localStorage
        const localUsers = localStorage.getItem('users');
        if (localUsers) {
            try {
                users = JSON.parse(localUsers);
            } catch (e) {
                console.error('Failed to parse localStorage users:', e);
            }
        }
    }
    
    const user = users.find(u => u.username === username);
    if (user) {
        // Update navbar with user info
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        
        if (userAvatar) {
            userAvatar.textContent = user.full_name ? user.full_name.charAt(0).toUpperCase() : username.charAt(0).toUpperCase();
        }
        
        if (userName) {
            userName.textContent = user.full_name || username;
        }
    }
}

function setupEventListeners() {
    // Role modal event listeners
    const roleModal = document.getElementById('roleModal');
    const roleModalClose = document.getElementById('roleModalClose');
    const roleModalCancel = document.getElementById('roleModalCancel');
    const roleModalSave = document.getElementById('roleModalSave');
    
    if (roleModalClose) {
        roleModalClose.addEventListener('click', closeRoleModal);
    }
    
    if (roleModalCancel) {
        roleModalCancel.addEventListener('click', closeRoleModal);
    }
    
    if (roleModalSave) {
        roleModalSave.addEventListener('click', saveRole);
    }
    
    // Close modal when clicking outside
    if (roleModal) {
        roleModal.addEventListener('click', function(e) {
            if (e.target === roleModal) {
                closeRoleModal();
            }
        });
    }
    
    // Permission level change handler
    const roleLevelSelect = document.getElementById('roleLevel');
    if (roleLevelSelect) {
        roleLevelSelect.addEventListener('change', function() {
            updatePermissionsForLevel(this.value);
        });
    }
}

function initializeTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle if it exists
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

async function loadRoleData() {
    // Load roles from localStorage or use defaults
    const storedRoles = localStorage.getItem('roles');
    if (storedRoles) {
        try {
            currentRoles = JSON.parse(storedRoles);
        } catch (e) {
            console.error('Failed to parse stored roles:', e);
            currentRoles = [...defaultRoles];
        }
    }
    
    // Update overview cards
    updateOverviewCards();
    
    // Render roles
    renderRoles();
    
    // Render permission matrix
    renderPermissionMatrix();
}

function updateOverviewCards() {
    const totalRoles = document.getElementById('totalRoles');
    const activeRoles = document.getElementById('activeRoles');
    const permissionLevels = document.getElementById('permissionLevels');
    
    if (totalRoles) {
        totalRoles.textContent = currentRoles.length;
    }
    
    if (activeRoles) {
        activeRoles.textContent = currentRoles.length; // All roles are active for now
    }
    
    if (permissionLevels) {
        const levels = new Set(currentRoles.map(role => role.level));
        permissionLevels.textContent = levels.size;
    }
}

function renderRoles() {
    const rolesGrid = document.getElementById('rolesGrid');
    if (!rolesGrid) return;
    
    const rolesHTML = currentRoles.map(role => {
        const permissionCount = role.permissions.length;
        const totalPermissions = Object.keys(permissionLabels).length;
        
        return `
            <div class="role-card">
                <div class="role-header">
                    <div>
                        <div class="role-title">${role.name}</div>
                        <div class="role-level level-${role.level}">Level ${role.level}</div>
                    </div>
                </div>
                <div class="role-description">${role.description}</div>
                <div class="role-permissions">
                    <h4>Permissions (${permissionCount}/${totalPermissions})</h4>
                    <div class="permission-tags">
                        ${role.permissions.slice(0, 6).map(perm => 
                            `<span class="permission-tag">${permissionLabels[perm] || perm}</span>`
                        ).join('')}
                        ${role.permissions.length > 6 ? `<span class="permission-tag">+${role.permissions.length - 6} more</span>` : ''}
                    </div>
                </div>
                <div class="role-actions">
                    <button class="btn btn-primary" onclick="editRole('${role.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-secondary" onclick="viewRoleDetails('${role.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    ${role.id !== 'admin' ? `
                        <button class="btn btn-danger" onclick="deleteRole('${role.id}')">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    rolesGrid.innerHTML = rolesHTML;
}

function renderPermissionMatrix() {
    const permissionMatrix = document.getElementById('permissionMatrix');
    if (!permissionMatrix) return;
    
    const allPermissions = Object.keys(permissionLabels);
    
    let matrixHTML = `
        <table class="matrix-table">
            <thead>
                <tr>
                    <th>Permission</th>
                    ${currentRoles.map(role => `<th>${role.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    // Group permissions by category
    Object.entries(permissionCategories).forEach(([category, permissions]) => {
        matrixHTML += `
            <tr>
                <td colspan="${currentRoles.length + 1}" style="background: var(--light-gray); font-weight: 600; text-align: left;">
                    ${category}
                </td>
            </tr>
        `;
        
        permissions.forEach(permission => {
            matrixHTML += `
                <tr>
                    <td style="text-align: left;">${permissionLabels[permission]}</td>
                    ${currentRoles.map(role => `
                        <td>
                            <input type="checkbox" class="permission-checkbox" 
                                   ${role.permissions.includes(permission) ? 'checked' : ''}
                                   onchange="updateRolePermission('${role.id}', '${permission}', this.checked)">
                        </td>
                    `).join('')}
                </tr>
            `;
        });
    });
    
    matrixHTML += `
            </tbody>
        </table>
    `;
    
    permissionMatrix.innerHTML = matrixHTML;
}

function openRoleModal(roleId = null) {
    const modal = document.getElementById('roleModal');
    const modalTitle = document.getElementById('roleModalTitle');
    const roleForm = document.getElementById('roleForm');
    
    if (!modal || !modalTitle || !roleForm) return;
    
    editingRole = roleId;
    
    if (roleId) {
        const role = currentRoles.find(r => r.id === roleId);
        if (role) {
            modalTitle.textContent = 'Edit Role';
            populateRoleForm(role);
        }
    } else {
        modalTitle.textContent = 'Add New Role';
        roleForm.reset();
        // Set default permissions for level 1
        updatePermissionsForLevel('1');
    }
    
    modal.classList.add('show');
}

function closeRoleModal() {
    const modal = document.getElementById('roleModal');
    if (modal) {
        modal.classList.remove('show');
    }
    editingRole = null;
}

function populateRoleForm(role) {
    document.getElementById('roleName').value = role.name;
    document.getElementById('roleDescription').value = role.description;
    document.getElementById('roleLevel').value = role.level;
    
    // Clear all checkboxes first
    document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Check the role's permissions
    role.permissions.forEach(permission => {
        const checkbox = document.querySelector(`input[name="permissions"][value="${permission}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

function updatePermissionsForLevel(level) {
    // Clear all checkboxes first
    document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Set permissions based on level
    const levelPermissions = {
        '1': ['view_users', 'view_modules', 'view_assignments'],
        '2': ['view_users', 'edit_users', 'view_modules', 'edit_modules', 'view_assignments', 'create_assignments', 'view_reports'],
        '3': ['view_users', 'create_users', 'edit_users', 'view_modules', 'create_modules', 'edit_modules', 'view_assignments', 'create_assignments', 'edit_assignments', 'view_reports'],
        '4': Object.keys(permissionLabels)
    };
    
    const permissions = levelPermissions[level] || [];
    permissions.forEach(permission => {
        const checkbox = document.querySelector(`input[name="permissions"][value="${permission}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

function saveRole() {
    const roleName = document.getElementById('roleName').value.trim();
    const roleDescription = document.getElementById('roleDescription').value.trim();
    const roleLevel = parseInt(document.getElementById('roleLevel').value);
    
    if (!roleName || !roleLevel) {
        showToast('error', 'Validation Error', 'Please fill in all required fields');
        return;
    }
    
    // Get selected permissions
    const selectedPermissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
        .map(checkbox => checkbox.value);
    
    const roleData = {
        id: editingRole || roleName.toLowerCase().replace(/\s+/g, '_'),
        name: roleName,
        description: roleDescription,
        level: roleLevel,
        permissions: selectedPermissions
    };
    
    if (editingRole) {
        // Update existing role
        const roleIndex = currentRoles.findIndex(r => r.id === editingRole);
        if (roleIndex !== -1) {
            currentRoles[roleIndex] = roleData;
            showToast('success', 'Role Updated', `Role "${roleName}" has been updated successfully`);
        }
    } else {
        // Add new role
        if (currentRoles.find(r => r.id === roleData.id)) {
            showToast('error', 'Duplicate Role', 'A role with this name already exists');
            return;
        }
        currentRoles.push(roleData);
        showToast('success', 'Role Created', `Role "${roleName}" has been created successfully`);
    }
    
    // Save to localStorage
    localStorage.setItem('roles', JSON.stringify(currentRoles));
    
    // Refresh the display
    updateOverviewCards();
    renderRoles();
    renderPermissionMatrix();
    
    closeRoleModal();
}

function editRole(roleId) {
    openRoleModal(roleId);
}

function viewRoleDetails(roleId) {
    const role = currentRoles.find(r => r.id === roleId);
    if (role) {
        const permissions = role.permissions.map(perm => permissionLabels[perm] || perm).join(', ');
        alert(`Role: ${role.name}\nLevel: ${role.level}\nDescription: ${role.description}\n\nPermissions:\n${permissions}`);
    }
}

function deleteRole(roleId) {
    const role = currentRoles.find(r => r.id === roleId);
    if (!role) return;
    
    if (confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
        currentRoles = currentRoles.filter(r => r.id !== roleId);
        localStorage.setItem('roles', JSON.stringify(currentRoles));
        
        updateOverviewCards();
        renderRoles();
        renderPermissionMatrix();
        
        showToast('success', 'Role Deleted', `Role "${role.name}" has been deleted successfully`);
    }
}

function updateRolePermission(roleId, permission, hasPermission) {
    const role = currentRoles.find(r => r.id === roleId);
    if (!role) return;
    
    if (hasPermission) {
        if (!role.permissions.includes(permission)) {
            role.permissions.push(permission);
        }
    } else {
        role.permissions = role.permissions.filter(p => p !== permission);
    }
    
    // Save to localStorage
    localStorage.setItem('roles', JSON.stringify(currentRoles));
    
    // Update the role card display
    renderRoles();
}

// Get users from localStorage
function getUsers() {
    const usersData = localStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [];
}

// Export functions for global access
window.openRoleModal = openRoleModal;
window.editRole = editRole;
window.viewRoleDetails = viewRoleDetails;
window.deleteRole = deleteRole;
window.updateRolePermission = updateRolePermission;

