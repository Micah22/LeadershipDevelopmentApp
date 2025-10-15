// My Progress JavaScript

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
    
    if (navLinks && user) {
        let navigationHTML = '';
        
        if (user.role === 'Admin') {
            navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link active">My Progress</a><a href="admin.html" class="nav-link">Admin Console</a>';
        } else {
            navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="my-progress.html" class="nav-link active">My Progress</a><a href="#" class="nav-link">Resources</a>';
        }
        
        navLinks.innerHTML = navigationHTML;
    }
}

// Load and display progress
function loadProgress() {
    const userEmail = localStorage.getItem('userEmail');
    const users = getUsers();
    const user = users.find(u => u.email === userEmail);
    
    if (!user) {
        console.error('User not found');
        return;
    }
    
    // Get progress data
    const progressData = localStorage.getItem('userProgress');
    const progress = progressData ? JSON.parse(progressData) : {};
    
    // Create sample progress data if none exists
    if (Object.keys(progress).length === 0) {
        const sampleProgress = {
            'Team Leadership': {
                completed: 2,
                total: 4,
                tasks: [
                    { text: 'Complete team management training', completed: true },
                    { text: 'Lead a project with 3+ team members', completed: true },
                    { text: 'Conduct performance reviews', completed: false },
                    { text: 'Implement team building activities', completed: false }
                ]
            },
            'Strategic Planning': {
                completed: 1,
                total: 4,
                tasks: [
                    { text: 'Complete strategic planning course', completed: true },
                    { text: 'Develop a strategic plan for your department', completed: false },
                    { text: 'Present plan to leadership team', completed: false },
                    { text: 'Implement and monitor progress', completed: false }
                ]
            },
            'Communication Excellence': {
                completed: 0,
                total: 4,
                tasks: [
                    { text: 'Complete communication training', completed: false },
                    { text: 'Deliver 5+ presentations to stakeholders', completed: false },
                    { text: 'Write comprehensive reports', completed: false },
                    { text: 'Facilitate team meetings', completed: false }
                ]
            }
        };
        
        localStorage.setItem('userProgress', JSON.stringify(sampleProgress));
        displayProgress(sampleProgress, user);
    } else {
        displayProgress(progress, user);
    }
}

// Display progress data
function displayProgress(progress, user) {
    // Update overall stats
    updateProgressStats(progress);
    
    // Display individual paths
    const pathsContainer = document.getElementById('pathsContainer');
    if (pathsContainer) {
        pathsContainer.innerHTML = '';
        
        Object.entries(progress).forEach(([pathName, pathData]) => {
            const pathCard = createPathCard(pathName, pathData, user);
            pathsContainer.appendChild(pathCard);
        });
    }
}

// Update progress statistics
function updateProgressStats(progress) {
    const totalCompleted = Object.values(progress).reduce((sum, path) => sum + (path.completed || 0), 0);
    const totalTasks = Object.values(progress).reduce((sum, path) => sum + (path.total || 0), 0);
    const overallProgress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    
    // Update stats display
    const completedElement = document.getElementById('completedTasks');
    const totalElement = document.getElementById('totalTasks');
    const progressElement = document.getElementById('overallProgress');
    const progressBar = document.getElementById('progressBar');
    
    if (completedElement) completedElement.textContent = totalCompleted;
    if (totalElement) totalElement.textContent = totalTasks;
    if (progressElement) progressElement.textContent = overallProgress + '%';
    if (progressBar) progressBar.style.width = overallProgress + '%';
}

// Create a path progress card
function createPathCard(pathName, pathData, user) {
    const card = document.createElement('div');
    card.className = 'path-progress-card';
    
    const progressPercentage = pathData.total > 0 ? Math.round((pathData.completed / pathData.total) * 100) : 0;
    
    card.innerHTML = 
        '<div class="path-progress-header">' +
            '<h3 class="path-progress-title">' + pathName + '</h3>' +
            '<span class="path-progress-status">' + pathData.completed + '/' + pathData.total + ' completed</span>' +
        '</div>' +
        '<div class="path-progress-body">' +
            '<div class="path-progress-bar">' +
                '<div class="path-progress-fill" style="width: ' + progressPercentage + '%"></div>' +
            '</div>' +
            '<div class="tasks-list" id="tasks-' + pathName.replace(/\s+/g, '-') + '">' +
                // Tasks will be populated by JavaScript
            '</div>' +
        '</div>';
    
    // Add tasks
    const tasksList = card.querySelector('.tasks-list');
    pathData.tasks.forEach((task, index) => {
        const taskItem = createTaskItem(task, pathName, index);
        tasksList.appendChild(taskItem);
    });
    
    return card;
}

// Create a task item
function createTaskItem(task, pathName, index) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item' + (task.completed ? ' completed' : '');
    
    taskItem.innerHTML = 
        '<div class="task-checkbox ' + (task.completed ? 'checked' : '') + '" data-path="' + pathName + '" data-index="' + index + '">' +
            (task.completed ? '<i class="fas fa-check"></i>' : '') +
        '</div>' +
        '<span class="task-text">' + task.text + '</span>';
    
    // Add click event
    const checkbox = taskItem.querySelector('.task-checkbox');
    checkbox.addEventListener('click', function() {
        toggleTask(pathName, index);
    });
    
    return taskItem;
}

// Toggle task completion
function toggleTask(pathName, index) {
    const progressData = localStorage.getItem('userProgress');
    const progress = progressData ? JSON.parse(progressData) : {};
    
    if (progress[pathName] && progress[pathName].tasks[index]) {
        progress[pathName].tasks[index].completed = !progress[pathName].tasks[index].completed;
        
        // Update completed count
        progress[pathName].completed = progress[pathName].tasks.filter(task => task.completed).length;
        
        // Save to localStorage
        localStorage.setItem('userProgress', JSON.stringify(progress));
        
        // Reload progress
        loadProgress();
    }
}

// Setup sign out functionality
function setupSignOut() {
    const signOutBtn = document.getElementById('signOutBtn');
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('isLoggedIn');
            showNotification('Signed out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

// Show notification
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;
    
    // Set background color based on type
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = '#28A745';
            break;
        case 'error':
            backgroundColor = '#DC3545';
            break;
        case 'warning':
            backgroundColor = '#FFC107';
            break;
        default:
            backgroundColor = '#17A2B8';
    }
    
    notification.style.backgroundColor = backgroundColor;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 1.5rem';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '3000';
    notification.style.maxWidth = '300px';
    notification.style.wordWrap = 'break-word';
    notification.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    notification.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = 
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
;
document.head.appendChild(style);
