// Admin Console Script - UPDATED WITH RESOURCES ACCESS

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin console loaded');
    
    // Check if user is logged in and is admin
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    
    if (!isLoggedIn || !username) {
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user is admin
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user || user.role !== 'Admin') {
        window.location.href = 'user-dashboard.html';
        return;
    }
    
    // Set up user info
    updateUserInfo();
    
    // Set up navigation
    updateNavigation();
    
    // Set up sign out functionality
    setupSignOut();
    
    // Load users
    loadUsers();
    
    // Set up event listeners
    setupEventListeners();
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
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link">My Progress</a><a href="admin.html" class="nav-link active">Admin Console</a><a href="admin-progress.html" class="nav-link">Progress Overview</a><a href="#" class="nav-link">Resources</a>';
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link">My Progress</a><a href="admin-progress.html" class="nav-link">Progress Overview</a><a href="#" class="nav-link">Resources</a>';
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

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Load and display users
function loadUsers() {
    const users = getUsers();
    const tbody = document.querySelector('#usersTable tbody');
    
    if (!tbody) {
        console.error('Users table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #6C757D;">No users found</td></tr>';
        return;
    }
    
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.fullName}</td>
            <td>${user.username}</td>
            <td>
                <span class="role-badge role-${user.role.toLowerCase().replace(' ', '-')}">${user.role}</span>
            </td>
            <td>
                <div class="password-display">
                    <span class="password-text">${user.password}</span>
                    <button class="copy-btn" onclick="copyPassword('${user.password}')" title="Copy password">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </td>
            <td>
                <button class="status-toggle ${user.status === 'Active' ? 'active' : 'inactive'}" 
                        onclick="toggleUserStatus(${index})">
                    ${user.status}
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${index})" title="Delete user">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Add user button
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', openAddUserModal);
    }
    
    // Modal event listeners
    setupModalEventListeners();
}

// Set up modal event listeners
function setupModalEventListeners() {
    const addUserModal = document.getElementById('addUserModal');
    const closeModal = document.getElementById('closeAddUserModal');
    const cancelBtn = document.getElementById('cancelAddUser');
    const addUserForm = document.getElementById('addUserForm');
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            addUserModal.style.display = 'none';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            addUserModal.style.display = 'none';
        });
    }
    
    // Handle form submission
    if (addUserForm) {
        addUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addNewUser();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addUserModal) {
            addUserModal.style.display = 'none';
        }
    });
}

// Open add user modal
function openAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'block';
        // Reset form
        const form = document.getElementById('addUserForm');
        if (form) {
            form.reset();
        }
    }
}

// Add new user
function addNewUser() {
    const formData = new FormData(document.getElementById('addUserForm'));
    
    const newUser = {
        fullName: formData.get('fullName'),
        username: formData.get('username'),
        password: formData.get('password'),
        role: formData.get('role'),
        status: 'Active'
    };
    
    // Validate required fields
    if (!newUser.fullName || !newUser.username || !newUser.password || !newUser.role) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Check if username already exists
    const users = getUsers();
    if (users.find(u => u.username === newUser.username)) {
        showNotification('Username already exists', 'error');
        return;
    }
    
    // Add user
    users.push(newUser);
    saveUsers(users);
    
    // Close modal and refresh table
    document.getElementById('addUserModal').style.display = 'none';
    loadUsers();
    
    showNotification('User added successfully!', 'success');
}

// Toggle user status
function toggleUserStatus(index) {
    const users = getUsers();
    if (index >= 0 && index < users.length) {
        users[index].status = users[index].status === 'Active' ? 'Inactive' : 'Active';
        saveUsers(users);
        loadUsers();
        
        const status = users[index].status;
        showNotification(`User ${status.toLowerCase()}`, 'success');
    }
}

// Delete user
function deleteUser(index) {
    const users = getUsers();
    if (index >= 0 && index < users.length) {
        const user = users[index];
        
        if (confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
            users.splice(index, 1);
            saveUsers(users);
            loadUsers();
            showNotification('User deleted successfully!', 'success');
        }
    }
}

// Copy password to clipboard
function copyPassword(password) {
    navigator.clipboard.writeText(password).then(() => {
        showNotification('Password copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy password: ', err);
        showNotification('Failed to copy password', 'error');
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
