/**
 * Permission Utilities
 * Centralized permission checking and role management
 */

class PermissionManager {
    constructor() {
        this.roles = [];
        this.permissions = {};
        this.loadRoles();
    }

    /**
     * Load roles from localStorage or use defaults
     */
    loadRoles() {
        const storedRoles = localStorage.getItem('roles');
        if (storedRoles) {
            try {
                this.roles = JSON.parse(storedRoles);
            } catch (e) {
                console.error('Failed to parse stored roles:', e);
                this.roles = this.getDefaultRoles();
            }
        } else {
            this.roles = this.getDefaultRoles();
        }
        
        // Save default roles to localStorage if none exist
        if (!storedRoles) {
            localStorage.setItem('roles', JSON.stringify(this.roles));
        }
    }

    /**
     * Ensure roles are loaded
     */
    ensureRolesLoaded() {
        if (!this.roles || this.roles.length === 0) {
            this.loadRoles();
        }
    }

    /**
     * Get default roles with permissions
     */
    getDefaultRoles() {
        return [
            {
                id: 'admin',
                name: 'Admin',
                description: 'Full system access with all permissions',
                level: 4,
                permissions: [
                    'view_users', 'create_users', 'edit_users', 'delete_users',
                    'view_modules', 'create_modules', 'edit_modules', 'delete_modules',
                    'view_assignments', 'create_assignments', 'edit_assignments', 'delete_assignments',
                    'create_quizzes', 'edit_quizzes', 'delete_quizzes',
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
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('currentUser');
            return userStr ? JSON.parse(userStr) : { role: 'Team Member', username: 'Guest' };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return { role: 'Team Member', username: 'Guest' };
        }
    }

    /**
     * Get role definition by role name
     */
    getRoleByName(roleName) {
        if (!roleName) {
            console.warn('No role name provided');
            return null;
        }
        
        const roleId = this.getRoleIdFromName(roleName);
        
        // Debug: log the roles structure
        console.log(`Searching for role: ${roleName} -> roleId: ${roleId}`);
        console.log(`Available roles:`, this.roles.map(r => ({ id: r.id, role_id: r.role_id, name: r.name })));
        
        const role = this.roles.find(role => (role.id === roleId || role.role_id === roleId));
        
        if (!role) {
            console.warn(`Role not found for roleName: ${roleName}, roleId: ${roleId}`);
            return null;
        }
        
        return role;
    }

    /**
     * Get role ID from role name
     */
    getRoleIdFromName(roleName) {
        const mapping = {
            'Admin': 'admin',
            'Director': 'director',
            'Supervisor': 'supervisor',
            'Trainer': 'trainer',
            'Assistant Supervisor': 'assistant_supervisor',
            'Team Member': 'team-member'
        };
        return mapping[roleName] || 'team_member';
    }

    /**
     * Check if current user has a specific permission
     */
    hasPermission(permission) {
        const currentUser = this.getCurrentUser();
        
        // Debug logging (only for non-admin to reduce noise)
        if (currentUser.role !== 'Admin' && currentUser.role !== 'admin') {
            console.log('Permission check - currentUser:', currentUser);
            console.log('Permission check - requested permission:', permission);
        }
        
        // Admin bypass - if user is admin, grant all permissions
        if (currentUser.role === 'Admin' || currentUser.role === 'admin') {
            return true;
        }
        
        // Ensure roles are loaded
        this.ensureRolesLoaded();
        
        // If no roles are loaded yet, return false for safety
        if (!this.roles || this.roles.length === 0) {
            console.warn('No roles loaded yet, denying permission for safety');
            return false;
        }
        
        console.log('Available roles:', this.roles.map(r => ({ id: r.id, name: r.name })));
        
        const role = this.getRoleByName(currentUser.role);
        
        if (!role) {
            console.warn(`Role not found for user: ${currentUser.role}`);
            return false;
        }

        if (!role.permissions || !Array.isArray(role.permissions)) {
            console.warn(`Invalid permissions for role: ${role.name}`);
            return false;
        }

        const hasPermission = role.permissions.includes(permission);
        console.log(`Permission result: ${hasPermission} for ${permission}`);
        return hasPermission;
    }

    /**
     * Check if current user has any of the specified permissions
     */
    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    /**
     * Check if current user has all of the specified permissions
     */
    hasAllPermissions(permissions) {
        return permissions.every(permission => this.hasPermission(permission));
    }

    /**
     * Check if current user can access a specific page
     */
    canAccessPage(pageId) {
        const pageAccess = {
            'userManagement': ['view_users'],
            'pathManagement': ['view_modules'],
            'roleManagement': ['manage_roles'],
            'reports': ['view_reports'],
            'settings': ['system_settings']
        };

        const requiredPermissions = pageAccess[pageId] || [];
        return this.hasAnyPermission(requiredPermissions);
    }

    /**
     * Check if current user is admin
     */
    isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser.role === 'Admin';
    }

    /**
     * Check if current user is admin or director
     */
    isAdminOrDirector() {
        const currentUser = this.getCurrentUser();
        return currentUser.role === 'Admin' || currentUser.role === 'Director';
    }

    /**
     * Check if current user can manage users
     */
    canManageUsers() {
        return this.hasAnyPermission(['create_users', 'edit_users', 'delete_users']);
    }

    /**
     * Check if current user can manage modules
     */
    canManageModules() {
        return this.hasAnyPermission(['create_modules', 'edit_modules', 'delete_modules']);
    }

    /**
     * Check if current user can manage assignments
     */
    canManageAssignments() {
        return this.hasAnyPermission(['create_assignments', 'edit_assignments', 'delete_assignments']);
    }

    /**
     * Apply role-based UI restrictions
     */
    applyRoleBasedUI() {
        // Hide/show sidebar items based on permissions
        const sidebarItems = {
            'userManagement': 'userManagement',
            'pathManagement': 'pathManagement', 
            'roleManagement': 'roleManagement',
            'reports': 'reports',
            'settings': 'settings'
        };

        Object.keys(sidebarItems).forEach(itemId => {
            const item = document.getElementById(itemId);
            if (item) {
                const canAccess = this.canAccessPage(sidebarItems[itemId]);
                item.style.display = canAccess ? 'flex' : 'none';
            }
        });

        // Hide/show admin controls
        const adminControls = document.querySelectorAll('.admin-only');
        adminControls.forEach(control => {
            const canAccess = this.isAdmin();
            control.style.display = canAccess ? 'block' : 'none';
        });

        // Hide/show user management controls
        const userManagementControls = document.querySelectorAll('.user-management-only');
        userManagementControls.forEach(control => {
            const canAccess = this.canManageUsers();
            control.style.display = canAccess ? 'block' : 'none';
        });

        // Hide/show module management controls
        const moduleManagementControls = document.querySelectorAll('.module-management-only');
        moduleManagementControls.forEach(control => {
            const canAccess = this.canManageModules();
            control.style.display = canAccess ? 'block' : 'none';
        });

        // Hide/show assignment management controls
        const assignmentManagementControls = document.querySelectorAll('.assignment-management-only');
        assignmentManagementControls.forEach(control => {
            const canAccess = this.canManageAssignments();
            control.style.display = canAccess ? 'block' : 'none';
        });
    }

    /**
     * Redirect user if they don't have permission
     */
    requirePermission(permission, redirectUrl = 'user-dashboard.html') {
        if (!this.hasPermission(permission)) {
            alert('Access denied. You do not have permission to access this feature.');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Require admin access
     */
    requireAdmin(redirectUrl = 'user-dashboard.html') {
        if (!this.isAdmin()) {
            alert('Access denied. Admin privileges required.');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Get user's role level
     */
    getUserRoleLevel() {
        const currentUser = this.getCurrentUser();
        const role = this.getRoleByName(currentUser.role);
        return role ? role.level : 1;
    }

    /**
     * Check if user's role level is sufficient
     */
    hasRoleLevel(requiredLevel) {
        return this.getUserRoleLevel() >= requiredLevel;
    }

    /**
     * Check permission for a specific role (used by admin bypass)
     */
    checkPermissionForRole(roleName, permission) {
        this.ensureRolesLoaded();
        
        if (!this.roles || this.roles.length === 0) {
            return false;
        }
        
        const role = this.getRoleByName(roleName);
        
        if (!role) {
            console.warn(`Role not found for checking permission: ${roleName}`);
            return false;
        }

        if (!role.permissions || !Array.isArray(role.permissions)) {
            return false;
        }

        return role.permissions.includes(permission);
    }

    /**
     * Apply permission-based element visibility
     * Hide/show elements based on data-permission attribute
     */
    applyElementVisibility() {
        // Find all elements with data-permission attribute
        const elements = document.querySelectorAll('[data-permission]');
        
        console.log(`Found ${elements.length} elements with data-permission attribute`);
        
        elements.forEach(element => {
            const requiredPermission = element.getAttribute('data-permission');
            
            if (requiredPermission) {
                const hasAccess = this.hasPermission(requiredPermission);
                
                if (hasAccess) {
                    // Check if element is a tab (has data-tab attribute or admin-tab class)
                    const isTab = element.hasAttribute('data-tab') || element.classList.contains('admin-tab');
                    element.style.display = isTab ? 'flex' : '';
                    element.classList.remove('permission-denied');
                } else {
                    element.style.display = 'none';
                    element.classList.add('permission-denied');
                }
            }
        });
        
        // Also handle data-require-any-permission (array of permissions)
        const anyPermissionElements = document.querySelectorAll('[data-require-any-permission]');
        anyPermissionElements.forEach(element => {
            const permissionsAttr = element.getAttribute('data-require-any-permission');
            if (permissionsAttr) {
                const permissions = permissionsAttr.split(',').map(p => p.trim());
                const hasAccess = this.hasAnyPermission(permissions);
                
                if (hasAccess) {
                    element.style.display = '';
                    element.classList.remove('permission-denied');
                } else {
                    element.style.display = 'none';
                    element.classList.add('permission-denied');
                }
            }
        });
        
        console.log('Applied element visibility based on permissions');
    }
}

// Create global instance
window.permissionManager = new PermissionManager();

// Apply visibility on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for roles to load
    setTimeout(() => {
        window.permissionManager.applyElementVisibility();
        // Also call quiz tab visibility updater if it exists
        if (typeof window.updateQuizTabVisibility === 'function') {
            window.updateQuizTabVisibility();
        }
    }, 500);
    
    // Also apply visibility after a longer delay to ensure everything is loaded
    setTimeout(() => {
        window.permissionManager.applyElementVisibility();
        // Also call quiz tab visibility updater if it exists
        if (typeof window.updateQuizTabVisibility === 'function') {
            window.updateQuizTabVisibility();
        }
    }, 1500);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PermissionManager;
}
