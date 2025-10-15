// Admin Path Management Script

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Path Management page loaded');
    
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
        alert('Access denied. Admin privileges required.');
        window.location.href = 'user-dashboard.html';
        return;
    }
    
    // Initialize the page
    initializePage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize global modules if they don't exist
    initializeGlobalModules();
    
    // Load modules data
    loadModulesData();
});

function initializePage() {
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
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="admin-user-overview.html" class="nav-link">User Overview</a><a href="admin-path-management.html" class="nav-link active">Path Management</a><a href="#" class="nav-link">Resources</a>';
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="user-progress.html" class="nav-link">My Progress</a><a href="admin-user-overview.html" class="nav-link">User Overview</a><a href="#" class="nav-link">Resources</a>';
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
    
    // Add module button
    const addModuleBtn = document.getElementById('addModuleBtn');
    if (addModuleBtn) {
        addModuleBtn.addEventListener('click', openNewModuleModal);
    }
    
    // Modal event listeners
    const modal = document.getElementById('moduleModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalSave = document.getElementById('modalSave');
    const addTaskBtn = document.getElementById('addTaskBtn');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModuleModal);
    }
    
    if (modalCancel) {
        modalCancel.addEventListener('click', closeModuleModal);
    }
    
    if (modalSave) {
        modalSave.addEventListener('click', saveModuleChanges);
    }
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addNewTask);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModuleModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeModuleModal();
        }
    });
}

function loadModulesData() {
    const modules = getModuleData();
    const modulesGrid = document.getElementById('modulesManagementGrid');
    
    if (!modulesGrid) return;
    
    const modulesHTML = modules.map(module => `
        <div class="module-management-card">
            <div class="module-management-header">
                <h3 class="module-management-title">${module.title}</h3>
                <span class="module-management-status ${module.status || 'active'}">${(module.status || 'active').replace('-', ' ')}</span>
            </div>
            <div class="module-management-description">${module.description}</div>
            <div class="module-management-stats">
                <div class="module-management-tasks">${module.checklist.length} learning tasks</div>
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
    `).join('');
    
    modulesGrid.innerHTML = modulesHTML;
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
    // Get modules from global storage
    const globalModules = localStorage.getItem('globalModules');
    if (globalModules) {
        return JSON.parse(globalModules);
    }
    
    // Return empty array if no modules exist (shouldn't happen after initialization)
    return [];
}

function openModuleModal(moduleTitle) {
    const modal = document.getElementById('moduleModal');
    const modalTitle = document.getElementById('modalModuleTitle');
    const modalDescription = document.getElementById('modalModuleDescription');
    const modalChecklist = document.getElementById('modalChecklist');
    
    if (!modal) return;
    
    // Get module data
    const modules = getModuleData();
    const moduleData = modules.find(m => m.title === moduleTitle);
    
    if (!moduleData) {
        alert('Module not found');
        return;
    }
    
    // Update modal title
    if (modalTitle) {
        modalTitle.textContent = moduleData.title;
    }
    
    // Update modal description
    if (modalDescription) {
        modalDescription.value = moduleData.description;
    }
    
    // Update form fields
    document.getElementById('editModuleTitle').value = moduleData.title;
    document.getElementById('editModuleStatus').value = moduleData.status || 'active';
    document.getElementById('editModuleRole').value = moduleData.requiredRole || 'Team Member';
    
    // Update checklist
    if (modalChecklist) {
        const checklistHTML = moduleData.checklist.map((task, index) => {
            const taskDescription = typeof task === 'object' ? task.description : task;
            const taskFile = typeof task === 'object' ? (task.file || '') : '';
            
            // Handle both old single file format and new multiple files format
            const files = typeof task === 'object' && task.files ? task.files : (taskFile ? [taskFile] : []);
            
            return `
                <div class="checklist-item">
                    <input type="text" class="checklist-task-input" value="${taskDescription}" data-index="${index}">
                    <button type="button" class="add-file-btn" onclick="toggleFileSection(this)">
                        <i class="fas fa-plus"></i>
                        ${files.length > 0 ? `Show Files (${files.length} attached)` : 'Add Files'}
                    </button>
                    <div class="checklist-file-section">
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
                    <button type="button" class="checklist-remove-btn" onclick="removeTask(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
        modalChecklist.innerHTML = checklistHTML;
    }
    
    // Store current module for updates
    modal.dataset.currentModule = moduleTitle;
    
    // Show modal
    modal.classList.add('show');
}

function openNewModuleModal() {
    const modal = document.getElementById('moduleModal');
    const modalTitle = document.getElementById('modalModuleTitle');
    
    if (!modal) return;
    
    // Clear form
    document.getElementById('moduleEditForm').reset();
    
    // Update modal title
    if (modalTitle) {
        modalTitle.textContent = 'Add New Module';
    }
    
    // Clear checklist
    const modalChecklist = document.getElementById('modalChecklist');
    if (modalChecklist) {
        modalChecklist.innerHTML = '';
    }
    
    // Store that this is a new module
    modal.dataset.currentModule = 'new';
    
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

function addNewTask() {
    const modalChecklist = document.getElementById('modalChecklist');
    if (!modalChecklist) return;
    
    const taskIndex = modalChecklist.children.length;
    const taskHTML = `
        <div class="checklist-item">
            <input type="text" class="checklist-task-input" placeholder="Enter new task..." data-index="${taskIndex}">
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
            <button type="button" class="checklist-remove-btn" onclick="removeTask(${taskIndex})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    modalChecklist.insertAdjacentHTML('beforeend', taskHTML);
}

function removeTask(index) {
    const modalChecklist = document.getElementById('modalChecklist');
    if (!modalChecklist) return;
    
    const taskItems = modalChecklist.querySelectorAll('.checklist-item');
    if (taskItems[index]) {
        taskItems[index].remove();
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
        checklist
    });
    
    // Close modal
    closeModuleModal();
    
    // Reload modules data
    loadModulesData();
    
    // Show success message
    alert('Module saved successfully! Changes will be reflected across all user accounts.');
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

// File upload functionality
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
    const modalChecklist = document.getElementById('modalChecklist');
    const items = modalChecklist.querySelectorAll('.checklist-item');
    return Array.from(items).indexOf(checklistItem);
}

// Utility function to get users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}
