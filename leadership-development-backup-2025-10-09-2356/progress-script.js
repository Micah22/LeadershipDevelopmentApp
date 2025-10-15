// Progress Script - UPDATED WITH ADMIN RESOURCES ACCESS

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('My Progress page loaded');
    
    // Set up user info
    updateUserInfo();
    
    // Set up navigation
    updateNavigation();
    
    // Set up sign out functionality
    setupSignOut();
    
    // Load and display progress
    loadProgress();
    
    // Set up admin functionality if user is admin
    setupAdminFunctionality();
    
    // Set up storage event listener for real-time updates
    window.addEventListener('storage', function(e) {
        if (e.key === 'userProgress' || e.key === 'leadershipPaths') {
            loadProgress();
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
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link active">My Progress</a><a href="admin.html" class="nav-link">Admin Console</a><a href="admin-progress.html" class="nav-link">Progress Overview</a><a href="#" class="nav-link">Resources</a>';
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link active">My Progress</a><a href="admin-progress.html" class="nav-link">Progress Overview</a><a href="#" class="nav-link">Resources</a>';
    } else {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link active">My Progress</a><a href="#" class="nav-link">Resources</a>';
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

// Save user-specific progress data
function saveUserProgress(username, progress) {
    const userProgressKey = `userProgress_${username}`;
    localStorage.setItem(userProgressKey, JSON.stringify(progress));
    
    // Dispatch custom event for cross-page communication
    window.dispatchEvent(new CustomEvent('userProgressUpdated', {
        detail: { username, progress }
    }));
}

// Get leadership paths
function getLeadershipPaths() {
    const paths = localStorage.getItem('leadershipPaths');
    return paths ? JSON.parse(paths) : [];
}

// Save leadership paths
function saveLeadershipPaths(paths) {
    console.log('Saving leadership paths:', paths);
    localStorage.setItem('leadershipPaths', JSON.stringify(paths));
    
    // Dispatch custom event for cross-page communication
    window.dispatchEvent(new CustomEvent('leadershipPathsUpdated', {
        detail: { paths }
    }));
    
    // Force reload progress after a short delay to ensure data is saved
    setTimeout(() => {
        console.log('Forcing progress reload after save');
        loadProgress();
    }, 100);
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

// Set up admin functionality
function setupAdminFunctionality() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'Admin') {
        return;
    }
    
    // Add admin controls to the page
    addAdminControls();
    
    // Set up modal functionality
    setupModalFunctionality();
}

// Add admin controls to the page
function addAdminControls() {
    const pageHeader = document.querySelector('.page-header');
    if (!pageHeader) return;
    
    const adminControls = document.createElement('div');
    adminControls.className = 'admin-controls';
    adminControls.innerHTML = `
        <button class="btn btn-primary" id="addPathBtn">
            <i class="fas fa-plus"></i>
            Add New Path
        </button>
        <button class="btn btn-secondary" id="managePathsBtn">
            <i class="fas fa-cog"></i>
            Manage Paths
        </button>
    `;
    
    pageHeader.appendChild(adminControls);
}

// Set up modal functionality
function setupModalFunctionality() {
    // Add Path Modal
    const addPathModal = document.getElementById('addPathModal');
    const addPathBtn = document.getElementById('addPathBtn');
    const closeAddModal = document.getElementById('closeAddPathModal');
    const cancelAddBtn = document.getElementById('cancelAddPath');
    const addPathForm = document.getElementById('addPathForm');
    const addTaskBtn = document.getElementById('addTaskBtn');
    
    // Open add modal
    if (addPathBtn) {
        addPathBtn.addEventListener('click', () => {
            addPathModal.style.display = 'block';
        });
    }
    
    // Close add modal
    if (closeAddModal) {
        closeAddModal.addEventListener('click', () => {
            addPathModal.style.display = 'none';
        });
    }
    
    if (cancelAddBtn) {
        cancelAddBtn.addEventListener('click', () => {
            addPathModal.style.display = 'none';
        });
    }
    
    // Handle add form submission
    if (addPathForm) {
        addPathForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addNewPath();
        });
    }
    
    // Add task button
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            addTaskInput();
        });
    }
    
    // Edit Path Modal
    const editPathModal = document.getElementById('editPathModal');
    const closeEditModal = document.getElementById('closeEditPathModal');
    const cancelEditBtn = document.getElementById('cancelEditPath');
    const editPathForm = document.getElementById('editPathForm');
    const addEditTaskBtn = document.getElementById('addEditTaskBtn');
    
    // Close edit modal
    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            editPathModal.style.display = 'none';
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            editPathModal.style.display = 'none';
        });
    }
    
    // Handle edit form submission
    if (editPathForm) {
        editPathForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEditPath();
        });
    }
    
    // Add edit task button
    if (addEditTaskBtn) {
        addEditTaskBtn.addEventListener('click', () => {
            addEditTaskInput();
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addPathModal) {
            addPathModal.style.display = 'none';
        }
        if (e.target === editPathModal) {
            editPathModal.style.display = 'none';
        }
    });
}

// Add task input to add form
function addTaskInput() {
    const tasksContainer = document.getElementById('tasksContainer');
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-input-group';
    taskDiv.innerHTML = `
        <input type="text" name="tasks" placeholder="Enter task description" required>
        <button type="button" class="btn btn-sm btn-danger remove-task-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;
    tasksContainer.appendChild(taskDiv);
    
    // Add remove functionality
    const removeBtn = taskDiv.querySelector('.remove-task-btn');
    removeBtn.addEventListener('click', () => {
        taskDiv.remove();
    });
}

// Add task input to edit form
function addEditTaskInput(value = '') {
    const tasksContainer = document.getElementById('editTasksContainer');
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-input-group';
    taskDiv.innerHTML = `
        <input type="text" name="editTasks" value="${value}" placeholder="Enter task description" required>
        <button type="button" class="btn btn-sm btn-danger remove-task-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;
    tasksContainer.appendChild(taskDiv);
    
    // Add remove functionality
    const removeBtn = taskDiv.querySelector('.remove-task-btn');
    removeBtn.addEventListener('click', () => {
        taskDiv.remove();
    });
}

// Add new path
function addNewPath() {
    const formData = new FormData(document.getElementById('addPathForm'));
    const tasks = formData.getAll('tasks').filter(task => task.trim() !== '');
    
    if (tasks.length === 0) {
        showNotification('Please add at least one task', 'error');
        return;
    }
    
    const newPath = {
        name: formData.get('name'),
        description: formData.get('description'),
        role: formData.get('role'),
        tasks: tasks
    };
    
    console.log('Adding new path:', newPath);
    
    const paths = getLeadershipPaths();
    paths.push(newPath);
    saveLeadershipPaths(paths);
    
    // Close modal and reset form
    document.getElementById('addPathModal').style.display = 'none';
    document.getElementById('addPathForm').reset();
    
    // Clear task inputs
    const tasksContainer = document.getElementById('tasksContainer');
    tasksContainer.innerHTML = `
        <div class="task-input-group">
            <input type="text" name="tasks" placeholder="Enter task description" required>
            <button type="button" class="btn btn-sm btn-danger remove-task-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add remove functionality to the remaining task input
    const removeBtn = tasksContainer.querySelector('.remove-task-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            removeBtn.closest('.task-input-group').remove();
        });
    }
    
    showNotification('Path added successfully!', 'success');
}

// Edit path
function editPath(pathName) {
    console.log('Editing path:', pathName);
    const paths = getLeadershipPaths();
    const path = paths.find(p => p.name === pathName);
    
    if (!path) {
        console.error('Path not found:', pathName);
        return;
    }
    
    // Populate edit form
    document.getElementById('editPathName').value = path.name;
    document.getElementById('editPathName').dataset.originalName = path.name;
    document.getElementById('editPathDescription').value = path.description;
    document.getElementById('editPathRole').value = path.role;
    
    // Clear existing tasks
    const tasksContainer = document.getElementById('editTasksContainer');
    tasksContainer.innerHTML = '';
    
    // Add existing tasks
    path.tasks.forEach((task, index) => {
        addEditTaskInput(task);
    });
    
    // Show modal
    document.getElementById('editPathModal').style.display = 'block';
}

// Save edit path
function saveEditPath() {
    const formData = new FormData(document.getElementById('editPathForm'));
    const tasks = formData.getAll('editTasks').filter(task => task.trim() !== '');
    
    if (tasks.length === 0) {
        showNotification('Please add at least one task', 'error');
        return;
    }
    
    const originalName = document.getElementById('editPathName').dataset.originalName;
    const newName = formData.get('editPathName');
    
    console.log('Saving edit for path:', originalName, '->', newName);
    
    const paths = getLeadershipPaths();
    const pathIndex = paths.findIndex(p => p.name === originalName);
    
    if (pathIndex === -1) {
        console.error('Original path not found:', originalName);
        showNotification('Error: Original path not found', 'error');
        return;
    }
    
    // Update the path
    paths[pathIndex] = {
        name: newName,
        description: formData.get('editPathDescription'),
        role: formData.get('editPathRole'),
        tasks: tasks
    };
    
    console.log('Updated paths:', paths);
    saveLeadershipPaths(paths);
    
    // Close modal
    document.getElementById('editPathModal').style.display = 'none';
    
    showNotification('Path updated successfully!', 'success');
}

// Delete path
function deletePath(pathName) {
    if (!confirm(`Are you sure you want to delete the path "${pathName}"?`)) {
        return;
    }
    
    console.log('Deleting path:', pathName);
    
    const paths = getLeadershipPaths();
    const filteredPaths = paths.filter(p => p.name !== pathName);
    saveLeadershipPaths(filteredPaths);
    
    showNotification('Path deleted successfully!', 'success');
}

// Load and display progress
function loadProgress() {
    console.log('Loading progress...');
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('No current user found');
        return;
    }
    
    const username = currentUser.username;
    const userProgress = getUserProgress(username);
    const leadershipPaths = getLeadershipPaths();
    
    console.log('Loading progress for user:', username);
    console.log('User progress data:', userProgress);
    console.log('Leadership paths:', leadershipPaths);
    
    // Update progress stats
    updateProgressStats(userProgress, leadershipPaths, currentUser.role);
    
    // Display progress paths
    displayProgress(userProgress, leadershipPaths, currentUser.role);
}

// Update progress statistics
function updateProgressStats(userProgress, leadershipPaths, userRole) {
    let totalCompleted = 0;
    let totalTasks = 0;
    
    // Calculate progress for unlocked paths only
    leadershipPaths.forEach(path => {
        if (isPathUnlocked(path, userRole)) {
            const pathProgress = userProgress[path.name] || { completed: 0, total: path.tasks.length };
            totalCompleted += pathProgress.completed || 0;
            totalTasks += path.tasks.length;
        }
    });
    
    const progressPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    
    // Update stats display
    const completedElement = document.getElementById('completedTasks');
    const totalElement = document.getElementById('totalTasks');
    const progressElement = document.getElementById('progressPercentage');
    const progressBar = document.getElementById('progressBar');
    
    if (completedElement) completedElement.textContent = totalCompleted;
    if (totalElement) totalElement.textContent = totalTasks;
    if (progressElement) progressElement.textContent = progressPercentage + '%';
    if (progressBar) progressBar.style.width = progressPercentage + '%';
}

// Display progress paths
function displayProgress(userProgress, leadershipPaths, userRole) {
    console.log('Displaying progress paths...');
    const progressContainer = document.getElementById('progressContainer');
    if (!progressContainer) {
        console.error('Progress container not found');
        return;
    }
    
    progressContainer.innerHTML = '';
    
    if (leadershipPaths.length === 0) {
        progressContainer.innerHTML = '<p style="text-align: center; color: #6C757D; padding: 2rem;">No leadership paths available.</p>';
        return;
    }
    
    leadershipPaths.forEach(path => {
        const isUnlocked = isPathUnlocked(path, userRole);
        const pathProgress = userProgress[path.name] || { completed: 0, total: path.tasks.length };
        const progressPercentage = path.tasks.length > 0 ? Math.round((pathProgress.completed / path.tasks.length) * 100) : 0;
        
        const pathElement = document.createElement('div');
        pathElement.className = `progress-path ${isUnlocked ? 'unlocked' : 'locked'}`;
        pathElement.innerHTML = `
            <div class="path-header">
                <div class="path-title">
                    <h3>${path.name}</h3>
                    ${!isUnlocked ? '<i class="fas fa-lock lock-icon"></i>' : ''}
                    ${userRole === 'Admin' ? `
                        <div class="admin-actions">
                            <button class="btn btn-sm btn-primary" onclick="editPath('${path.name}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deletePath('${path.name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="path-progress">
                    <span class="progress-text">${progressPercentage}%</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
            </div>
            <div class="path-description">${path.description}</div>
            <div class="path-tasks">
                ${path.tasks.map((task, index) => {
                    const isCompleted = pathProgress.completedTasks && pathProgress.completedTasks.includes(index);
                    return `
                        <div class="task-item ${isCompleted ? 'completed' : ''}" data-path="${path.name}" data-task-index="${index}">
                            <label class="task-checkbox">
                                <input type="checkbox" ${isCompleted ? 'checked' : ''} ${!isUnlocked ? 'disabled' : ''}>
                                <span class="checkmark"></span>
                            </label>
                            <span class="task-text">${task}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        progressContainer.appendChild(pathElement);
    });
    
    // Set up task toggle functionality
    setupTaskToggle();
}

// Set up task toggle functionality
function setupTaskToggle() {
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.disabled) {
            checkbox.addEventListener('change', function() {
                toggleTask(this);
            });
        }
    });
}

// Toggle task completion
function toggleTask(checkbox) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const username = currentUser.username;
    const taskItem = checkbox.closest('.task-item');
    const pathName = taskItem.dataset.path;
    const taskIndex = parseInt(taskItem.dataset.taskIndex);
    
    // Get current user progress
    const userProgress = getUserProgress(username);
    
    // Initialize path progress if it doesn't exist
    if (!userProgress[pathName]) {
        userProgress[pathName] = { completed: 0, total: 0, completedTasks: [] };
    }
    
    // Update completed tasks array
    if (checkbox.checked) {
        if (!userProgress[pathName].completedTasks.includes(taskIndex)) {
            userProgress[pathName].completedTasks.push(taskIndex);
        }
    } else {
        userProgress[pathName].completedTasks = userProgress[pathName].completedTasks.filter(i => i !== taskIndex);
    }
    
    // Update completed count
    userProgress[pathName].completed = userProgress[pathName].completedTasks.length;
    
    // Save user progress
    saveUserProgress(username, userProgress);
    
    // Update UI
    updatePathElement(pathName, userProgress[pathName]);
    updateOverallStats();
    
    // Add animation
    taskItem.classList.add('task-completed');
    setTimeout(() => {
        taskItem.classList.remove('task-completed');
    }, 300);
}

// Update individual path element
function updatePathElement(pathName, pathProgress) {
    const pathElement = document.querySelector(`[data-path="${pathName}"]`).closest('.progress-path');
    if (!pathElement) return;
    
    const progressPercentage = pathProgress.total > 0 ? Math.round((pathProgress.completed / pathProgress.total) * 100) : 0;
    
    // Update progress text and bar
    const progressText = pathElement.querySelector('.progress-text');
    const progressFill = pathElement.querySelector('.progress-fill');
    
    if (progressText) progressText.textContent = progressPercentage + '%';
    if (progressFill) progressFill.style.width = progressPercentage + '%';
}

// Update overall stats
function updateOverallStats() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userProgress = getUserProgress(currentUser.username);
    const leadershipPaths = getLeadershipPaths();
    
    updateProgressStats(userProgress, leadershipPaths, currentUser.role);
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
