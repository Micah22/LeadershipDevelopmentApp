// Admin Paths JavaScript

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // console.log('Admin Paths page loaded');
    
    // Set up user info
    updateUserInfo();
    
    // Set up navigation
    updateNavigation();
    
    // Sign out functionality is handled by navbar-component.js
    
    // Set up admin controls
    setupAdminControls();
    
    // Load and display paths
    loadPaths();
});

// Update user info in header
function updateUserInfo() {
    const userEmail = localStorage.getItem('userEmail');
    const users = getUsers();
    const user = users.find(u => u.email === userEmail);
    
    if (user) {
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');
        
        if (userAvatar) {
            userAvatar.textContent = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
        }
        if (userName) {
            userName.textContent = user.fullName || 'User';
        }
        if (userRole) {
            userRole.textContent = user.role || 'User';
        }
    }
}

// Get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Update navigation based on user role
function updateNavigation() {
    const userEmail = localStorage.getItem('userEmail');
    const users = getUsers();
    const user = users.find(u => u.email === userEmail);
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
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="quizzes.html" class="nav-link">Quizzes</a><a href="admin-paths.html" class="nav-link active">Manage Paths</a><a href="#" class="nav-link">Resources</a>';
    } else {
        navLinks.innerHTML = '<a href="index.html" class="nav-link">Login</a>';
        return;
    }
    
    navLinks.innerHTML = navigationHTML;
}

// Setup admin controls
function setupAdminControls() {
    const userEmail = localStorage.getItem('userEmail');
    const users = getUsers();
    const user = users.find(u => u.email === userEmail);
    
    if (user && user.role === 'Admin') {
        // Setup add path modal
        setupAddPathModal();
        
        // Setup edit path modal
        setupEditPathModal();
    }
}

// Setup add path modal
function setupAddPathModal() {
    const addPathBtn = document.getElementById('addPathBtn');
    const addPathModal = document.getElementById('addPathModal');
    const closeAddPathModal = document.getElementById('closeAddPathModal');
    const cancelAddPathBtn = document.getElementById('cancelAddPathBtn');
    const savePathBtn = document.getElementById('savePathBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    
    if (addPathBtn && addPathModal) {
        addPathBtn.addEventListener('click', () => {
            addPathModal.style.display = 'block';
        });
    }
    
    if (closeAddPathModal && addPathModal) {
        closeAddPathModal.addEventListener('click', () => {
            addPathModal.style.display = 'none';
        });
    }
    
    if (cancelAddPathBtn && addPathModal) {
        cancelAddPathBtn.addEventListener('click', () => {
            addPathModal.style.display = 'none';
        });
    }
    
    if (savePathBtn) {
        savePathBtn.addEventListener('click', saveNewPath);
    }
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTaskInput);
    }
    
    // Close modal when clicking outside
    if (addPathModal) {
        window.addEventListener('click', (e) => {
            if (e.target === addPathModal) {
                addPathModal.style.display = 'none';
            }
        });
    }
}

// Setup edit path modal
function setupEditPathModal() {
    const editPathModal = document.getElementById('editPathModal');
    const closeEditPathModal = document.getElementById('closeEditPathModal');
    const cancelEditPathBtn = document.getElementById('cancelEditPathBtn');
    const saveEditPathBtn = document.getElementById('saveEditPathBtn');
    const deletePathBtn = document.getElementById('deletePathBtn');
    const addEditTaskBtn = document.getElementById('addEditTaskBtn');
    
    if (closeEditPathModal && editPathModal) {
        closeEditPathModal.addEventListener('click', () => {
            editPathModal.style.display = 'none';
        });
    }
    
    if (cancelEditPathBtn && editPathModal) {
        cancelEditPathBtn.addEventListener('click', () => {
            editPathModal.style.display = 'none';
        });
    }
    
    if (saveEditPathBtn) {
        saveEditPathBtn.addEventListener('click', saveEditedPath);
    }
    
    if (deletePathBtn) {
        deletePathBtn.addEventListener('click', deletePath);
    }
    
    if (addEditTaskBtn) {
        addEditTaskBtn.addEventListener('click', addEditTaskInput);
    }
    
    // Close modal when clicking outside
    if (editPathModal) {
        window.addEventListener('click', (e) => {
            if (e.target === editPathModal) {
                editPathModal.style.display = 'none';
            }
        });
    }
}

// Add task input field
function addTaskInput() {
    const tasksContainer = document.getElementById('tasksContainer');
    if (tasksContainer) {
        const taskGroup = document.createElement('div');
        taskGroup.className = 'task-input-group';
        taskGroup.innerHTML = '<input type="text" class="task-input" placeholder="Enter task description" required>' +
                             '<button type="button" class="btn btn-sm btn-danger remove-task">' +
                             '<i class="fas fa-trash"></i></button>';
        tasksContainer.appendChild(taskGroup);
        
        // Add remove functionality directly to this button
        const removeBtn = taskGroup.querySelector('.remove-task');
        removeBtn.addEventListener('click', () => {
            taskGroup.remove();
        });
    }
}

// Add edit task input field
function addEditTaskInput() {
    const editTasksContainer = document.getElementById('editTasksContainer');
    if (editTasksContainer) {
        const taskGroup = document.createElement('div');
        taskGroup.className = 'task-input-group';
        taskGroup.innerHTML = '<input type="text" class="task-input" placeholder="Enter task description" required>' +
                             '<button type="button" class="btn btn-sm btn-danger remove-task">' +
                             '<i class="fas fa-trash"></i></button>';
        editTasksContainer.appendChild(taskGroup);
        
        // Add remove functionality directly to this button
        const removeBtn = taskGroup.querySelector('.remove-task');
        removeBtn.addEventListener('click', () => {
            taskGroup.remove();
        });
    }
}

// Save new path
function saveNewPath() {
    const pathName = document.getElementById('pathName').value.trim();
    const pathDescription = document.getElementById('pathDescription').value.trim();
    const requiredRole = document.getElementById('requiredRole').value;
    const taskInputs = document.querySelectorAll('#tasksContainer .task-input');
    
    if (!pathName) {
        alert('Please enter a path name');
        return;
    }
    
    if (taskInputs.length === 0) {
        alert('Please add at least one task');
        return;
    }
    
    const tasks = Array.from(taskInputs).map(input => ({
        text: input.value.trim(),
        completed: false
    })).filter(task => task.text);
    
    if (tasks.length === 0) {
        alert('Please enter at least one valid task');
        return;
    }
    
    // Get existing progress data
    const progressData = localStorage.getItem(`userProgress_${localStorage.getItem('username')}`);
    const progress = progressData ? JSON.parse(progressData) : {};
    
    // Add new path
    progress[pathName] = {
        description: pathDescription,
        requiredRole: parseInt(requiredRole),
        completed: 0,
        total: tasks.length,
        tasks: tasks
    };
    
    // Save progress data
    const username = localStorage.getItem('username');
    const userProgressKey = `userProgress_${username}`;
    localStorage.setItem(userProgressKey, JSON.stringify(progress));
    
    // Close modal and reset form
    document.getElementById('addPathModal').style.display = 'none';
    document.getElementById('addPathForm').reset();
    
    // Clear task inputs and reset to one empty task
    const tasksContainer = document.getElementById('tasksContainer');
    tasksContainer.innerHTML = '<div class="task-input-group">' +
                               '<input type="text" class="task-input" placeholder="Enter task description" required>' +
                               '<button type="button" class="btn btn-sm btn-danger remove-task">' +
                               '<i class="fas fa-trash"></i></button></div>';
    
    // Reload paths display
    loadPaths();
    
    alert('Path created successfully!');
}

// Open edit path modal
function openEditPathModal(pathName) {
    const progressData = localStorage.getItem(`userProgress_${localStorage.getItem('username')}`);
    const progress = progressData ? JSON.parse(progressData) : {};
    const pathData = progress[pathName];
    
    if (!pathData) return;
    
    // Populate form
    document.getElementById('editPathName').value = pathName;
    document.getElementById('editPathDescription').value = pathData.description || '';
    document.getElementById('editRequiredRole').value = pathData.requiredRole || 1;
    
    // Populate tasks
    const editTasksContainer = document.getElementById('editTasksContainer');
    editTasksContainer.innerHTML = '';
    
    pathData.tasks.forEach((task, index) => {
        const taskGroup = document.createElement('div');
        taskGroup.className = 'task-input-group';
        taskGroup.innerHTML = '<input type="text" class="task-input" value="' + task.text + '" required>' +
                             '<button type="button" class="btn btn-sm btn-danger remove-task">' +
                             '<i class="fas fa-trash"></i></button>';
        editTasksContainer.appendChild(taskGroup);
        
        // Add remove functionality directly to this button
        const removeBtn = taskGroup.querySelector('.remove-task');
        removeBtn.addEventListener('click', () => {
            taskGroup.remove();
        });
    });
    
    // Show modal
    document.getElementById('editPathModal').style.display = 'block';
}

// Save edited path
function saveEditedPath() {
    const originalPathName = document.getElementById('editPathName').value;
    const pathDescription = document.getElementById('editPathDescription').value.trim();
    const requiredRole = document.getElementById('editRequiredRole').value;
    const taskInputs = document.querySelectorAll('#editTasksContainer .task-input');
    
    if (taskInputs.length === 0) {
        alert('Please add at least one task');
        return;
    }
    
    const tasks = Array.from(taskInputs).map(input => ({
        text: input.value.trim(),
        completed: false
    })).filter(task => task.text);
    
    if (tasks.length === 0) {
        alert('Please enter at least one valid task');
        return;
    }
    
    // Get existing progress data
    const progressData = localStorage.getItem(`userProgress_${localStorage.getItem('username')}`);
    const progress = progressData ? JSON.parse(progressData) : {};
    
    // Update path
    progress[originalPathName] = {
        description: pathDescription,
        requiredRole: parseInt(requiredRole),
        completed: 0,
        total: tasks.length,
        tasks: tasks
    };
    
    // Save progress data
    const username = localStorage.getItem('username');
    const userProgressKey = `userProgress_${username}`;
    localStorage.setItem(userProgressKey, JSON.stringify(progress));
    
    // Close modal
    document.getElementById('editPathModal').style.display = 'none';
    
    // Reload paths display
    loadPaths();
    
    alert('Path updated successfully!');
}

// Delete path
function deletePath() {
    const pathName = document.getElementById('editPathName').value;
    
    if (confirm('Delete this path?')) {
        // Get existing progress data
        const username = localStorage.getItem('username');
        const userProgressKey = `userProgress_${username}`;
        const progressData = localStorage.getItem(userProgressKey);
        const progress = progressData ? JSON.parse(progressData) : {};
        
        // Remove path
        delete progress[pathName];
        
        // Save progress data
        const username = localStorage.getItem('username');
        const userProgressKey = `userProgress_${username}`;
        localStorage.setItem(userProgressKey, JSON.stringify(progress));
        
        // Close modal
        document.getElementById('editPathModal').style.display = 'none';
        
        // Reload paths display
        loadPaths();
        
        alert('Path deleted successfully!');
    }
}

// Load and display paths
function loadPaths() {
    // Get progress data
    const progressData = localStorage.getItem(`userProgress_${localStorage.getItem('username')}`);
    const progress = progressData ? JSON.parse(progressData) : {};
    
    // Display paths
    displayPaths(progress);
}

// Display paths
function displayPaths(progress) {
    const pathsList = document.getElementById('pathsList');
    if (pathsList) {
        pathsList.innerHTML = '';
        
        Object.entries(progress).forEach(([pathName, pathData]) => {
            const pathElement = createPathElement(pathName, pathData);
            pathsList.appendChild(pathElement);
        });
    }
}

// Create path element
function createPathElement(pathName, pathData) {
    const pathDiv = document.createElement('div');
    pathDiv.className = 'path-card';
    
    const roleNames = {
        1: 'Team Member',
        2: 'Trainer',
        3: 'Assistant Supervisor',
        4: 'Supervisor',
        5: 'Director'
    };
    
    const requiredRoleName = roleNames[pathData.requiredRole] || 'Team Member';
    
    const tasksList = pathData.tasks.map(task => '<li>' + task.text + '</li>').join('');
    
    pathDiv.innerHTML = '<div class="path-card-header">' +
                       '<h3>' + pathName + '</h3>' +
                       '<div class="path-actions">' +
                       '<button class="btn btn-sm btn-primary" onclick="openEditPathModal(\'' + pathName + '\')">' +
                       '<i class="fas fa-edit"></i> Edit</button>' +
                       '</div>' +
                       '</div>' +
                       '<div class="path-card-body">' +
                       '<p class="path-description">' + (pathData.description || 'No description') + '</p>' +
                       '<p class="path-role">Required Role: ' + requiredRoleName + '</p>' +
                       '<p class="path-tasks-count">Tasks: ' + pathData.total + '</p>' +
                       '<div class="path-tasks-preview">' +
                       '<h4>Tasks:</h4>' +
                       '<ul>' + tasksList + '</ul>' +
                       '</div>' +
                       '</div>';
    
    return pathDiv;
}

// Sign out functionality is handled by navbar-component.js
