// User Progress Script

document.addEventListener('DOMContentLoaded', function() {
    console.log('User Progress page loaded');
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    
    if (!isLoggedIn || !username) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize the page
    initializePage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load progress data
    loadProgressData();
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
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="user-progress.html" class="nav-link active">My Progress</a><a href="admin-user-overview.html" class="nav-link">User Overview</a><a href="#" class="nav-link">Resources</a>';
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="user-progress.html" class="nav-link active">My Progress</a><a href="admin-user-overview.html" class="nav-link">User Overview</a><a href="#" class="nav-link">Resources</a>';
    } else {
        navigationHTML = '<a href="user-dashboard.html" class="nav-link">Dashboard</a><a href="user-progress.html" class="nav-link active">My Progress</a><a href="#" class="nav-link">Resources</a>';
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
    const modal = document.getElementById('moduleModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalStartModule = document.getElementById('modalStartModule');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModuleModal);
    }
    
    if (modalCancel) {
        modalCancel.addEventListener('click', closeModuleModal);
    }
    
    if (modalStartModule) {
        modalStartModule.addEventListener('click', function() {
            const currentModule = modal.dataset.currentModule;
            if (currentModule) {
                alert(`Starting module: ${currentModule}`);
                closeModuleModal();
            }
        });
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

function loadProgressData() {
    const username = localStorage.getItem('username');
    if (!username) return;

    // Get user's role
    const users = getUsers();
    const user = users.find(u => u.username === username);
    const userRole = user ? user.role : 'Team Member';

    // Calculate real progress data from user's saved progress
    const overallProgress = calculateUserOverallProgress(username);
    const userProgress = getUserProgress(username);

    // Get all module titles from global storage (show all modules, but some will be locked)
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
    
    let achievements = 0;
    const modules = moduleTitles
        .map(moduleTitle => {
            const moduleData = getModuleData(moduleTitle);
            
            // Skip deleted modules (getModuleData returns null for deleted modules)
            if (!moduleData) {
                return null;
            }
            
            const moduleProgress = userProgress[moduleTitle] || { checklist: [] };
            const completedCount = moduleProgress.checklist.filter(item => item).length;
            const totalCount = moduleData.checklist.length;
            const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            
            // Check if module is locked (above user's role)
            const isLocked = !canUserAccessModule(userRole, moduleData.requiredRole);
            
            // Count as achievement if 100% complete and not locked
            if (progressPercentage === 100 && !isLocked) {
                achievements++;
            }
            
            // Determine status
            let status = 'not-started';
            if (isLocked) {
                status = 'locked';
            } else if (progressPercentage === 100) {
                status = 'completed';
            } else if (progressPercentage > 0) {
                status = 'in-progress';
            }
            
            return {
                title: moduleTitle,
                description: moduleData.description,
                status: status,
                progress: isLocked ? 0 : progressPercentage,
                isLocked: isLocked,
                requiredRole: moduleData.requiredRole
            };
        })
        .filter(module => module !== null); // Remove deleted modules
    
    const progressData = {
        overallProgress: overallProgress.percentage,
        completedTasks: overallProgress.completedTasks,
        totalTasks: overallProgress.totalTasks,
        achievements: achievements,
        currentPath: 'Leadership Fundamentals',
        pathProgress: overallProgress.percentage,
        pathCompleted: overallProgress.completedTasks,
        pathTotal: overallProgress.totalTasks,
        modules: modules
    };
    
    // Update progress cards
    updateProgressCards(progressData);
    
    // Update current path
    updateCurrentPath(progressData);
    
    
    // Update modules
    updateModules(progressData.modules);
    
    console.log('Loaded real progress data:', progressData);
}


function updateProgressCards(data) {
    const overallProgress = document.getElementById('overallProgress');
    const completedTasks = document.getElementById('completedTasks');
    const totalTasks = document.getElementById('totalTasks');
    const achievements = document.getElementById('achievements');
    
    if (overallProgress) {
        overallProgress.textContent = data.overallProgress + '%';
    }
    
    if (completedTasks) {
        completedTasks.textContent = data.completedTasks;
    }
    
    if (totalTasks) {
        totalTasks.textContent = data.totalTasks;
    }
    
    if (achievements) {
        achievements.textContent = data.achievements;
    }
}

function updateCurrentPath(data) {
    const currentPathBadge = document.getElementById('currentPathBadge');
    const pathProgressFill = document.getElementById('pathProgressFill');
    const pathProgressText = document.getElementById('pathProgressText');
    const pathProgressDetails = document.getElementById('pathProgressDetails');
    
    if (currentPathBadge) {
        currentPathBadge.textContent = data.currentPath;
    }
    
    if (pathProgressFill) {
        pathProgressFill.style.width = data.pathProgress + '%';
    }
    
    if (pathProgressText) {
        pathProgressText.textContent = data.pathProgress + '% Complete';
    }
    
    if (pathProgressDetails) {
        pathProgressDetails.textContent = `${data.pathCompleted} of ${data.pathTotal} modules completed`;
    }
}


function updateModules(modules) {
    const modulesGrid = document.getElementById('modulesGrid');
    if (!modulesGrid) return;
    
    const modulesHTML = modules.map(module => {
        const lockIcon = module.isLocked ? '<i class="fas fa-lock module-lock-icon"></i>' : '';
        const clickHandler = module.isLocked ? '' : `onclick="openModule('${module.title}')"`;
        const cardClass = module.isLocked ? 'module-card locked' : 'module-card';
        
        return `
        <div class="${cardClass}" ${clickHandler}>
            <div class="module-header">
                <div>
                    <div class="module-title">
                        ${lockIcon}
                        ${module.title}
                    </div>
                </div>
                <div class="module-status ${module.status}">${module.status.replace('-', ' ')}</div>
            </div>
            <div class="module-description">${module.description}</div>
            ${module.isLocked ? 
                `<div class="module-lock-message">Requires ${module.requiredRole} role or higher</div>` :
                `<div class="module-progress">
                    <div class="module-progress-bar">
                        <div class="module-progress-fill" style="width: ${module.progress}%;"></div>
                    </div>
                    <div class="module-progress-text">${module.progress}%</div>
                </div>`
            }
        </div>
    `;
    }).join('');
    
    modulesGrid.innerHTML = modulesHTML;
}

function openModule(moduleTitle) {
    console.log('Opening module:', moduleTitle);
    openModuleModal(moduleTitle);
}

function openModuleModal(moduleTitle) {
    const modal = document.getElementById('moduleModal');
    const modalTitle = document.getElementById('modalModuleTitle');
    const modalDescription = document.getElementById('modalModuleDescription');
    const modalChecklist = document.getElementById('modalChecklist');
    const modalProgressPercentage = document.getElementById('modalProgressPercentage');
    const modalProgressFill = document.getElementById('modalProgressFill');
    
    if (!modal) return;
    
    // Get module data
    const moduleData = getModuleData(moduleTitle);
    if (!moduleData) {
        alert('Module not found');
        return;
    }
    
    // Get user's saved progress
    const username = localStorage.getItem('username');
    const userProgressKey = `userProgress_${username}`;
    const userProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{}');
    const moduleProgress = userProgress[moduleTitle] || { checklist: [] };
    
    // Update modal title
    if (modalTitle) {
        modalTitle.textContent = moduleData.title;
    }
    
    // Update modal description
    if (modalDescription) {
        modalDescription.textContent = moduleData.description;
    }
    
    // Update checklist with user's saved progress
    if (modalChecklist) {
        const checklistHTML = moduleData.checklist.map((item, index) => {
            const isCompleted = moduleProgress.checklist[index] || false;
            const fileInfo = item.file ? `<div class="checklist-file-info"><i class="fas fa-file"></i> ${item.file}</div>` : '';
            return `
                <div class="checklist-item ${isCompleted ? 'completed' : ''}">
                    <input type="checkbox" class="checklist-checkbox" id="checklist-${index}" 
                           ${isCompleted ? 'checked' : ''} 
                           onchange="toggleChecklistItem('${moduleTitle}', ${index})">
                    <label for="checklist-${index}" class="checklist-label">${item.task}</label>
                    ${fileInfo}
                </div>
            `;
        }).join('');
        modalChecklist.innerHTML = checklistHTML;
    }
    
    // Update progress based on user's saved data
    const completedCount = moduleProgress.checklist.filter(item => item).length;
    const totalCount = moduleData.checklist.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    if (modalProgressPercentage) {
        modalProgressPercentage.textContent = progressPercentage + '%';
    }
    
    if (modalProgressFill) {
        modalProgressFill.style.width = progressPercentage + '%';
    }
    
    // Store current module for updates
    modal.dataset.currentModule = moduleTitle;
    
    // Show modal
    modal.classList.add('show');
}

function toggleChecklistItem(moduleTitle, itemIndex) {
    const username = localStorage.getItem('username');
    const userProgressKey = `userProgress_${username}`;
    let userProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{}');
    
    // Initialize module progress if it doesn't exist
    if (!userProgress[moduleTitle]) {
        userProgress[moduleTitle] = { checklist: [] };
    }
    
    if (!userProgress[moduleTitle].checklist) {
        userProgress[moduleTitle].checklist = [];
    }
    
    // Get module data to ensure we have the right checklist length
    const moduleData = getModuleData(moduleTitle);
    if (!moduleData || !moduleData.checklist[itemIndex]) {
        console.error('Module data not found for:', moduleTitle, 'item:', itemIndex);
        return;
    }
    
    // Ensure checklist array is the right length
    while (userProgress[moduleTitle].checklist.length < moduleData.checklist.length) {
        userProgress[moduleTitle].checklist.push(false);
    }
    
    // Toggle the item
    const isCompleted = !userProgress[moduleTitle].checklist[itemIndex];
    userProgress[moduleTitle].checklist[itemIndex] = isCompleted;
    
    // Save progress
    localStorage.setItem(userProgressKey, JSON.stringify(userProgress));
    
    // Debug logging
    console.log(`User ${username} toggled ${moduleTitle} item ${itemIndex} to ${isCompleted}`);
    console.log('Updated progress:', userProgress[moduleTitle]);
    
    // Update modal display
    updateModalProgress(moduleTitle);
    
    // Refresh main page data
    loadProgressData();
}

function updateModalProgress(moduleTitle) {
    const modalProgressPercentage = document.getElementById('modalProgressPercentage');
    const modalProgressFill = document.getElementById('modalProgressFill');
    const modalChecklist = document.getElementById('modalChecklist');
    
    const moduleData = getModuleData(moduleTitle);
    if (!moduleData) return;
    
    const username = localStorage.getItem('username');
    const userProgressKey = `userProgress_${username}`;
    const userProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{}');
    const moduleProgress = userProgress[moduleTitle] || { checklist: [] };
    
    // Update checklist items
    if (modalChecklist) {
        const checklistItems = modalChecklist.querySelectorAll('.checklist-item');
        checklistItems.forEach((item, index) => {
            const isCompleted = moduleProgress.checklist[index] || false;
            const checkbox = item.querySelector('.checklist-checkbox');
            if (checkbox) {
                checkbox.checked = isCompleted;
            }
            if (isCompleted) {
                item.classList.add('completed');
            } else {
                item.classList.remove('completed');
            }
        });
    }
    
    // Update progress
    const completedCount = moduleProgress.checklist.filter(item => item).length;
    const totalCount = moduleData.checklist.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    if (modalProgressPercentage) {
        modalProgressPercentage.textContent = progressPercentage + '%';
    }
    
    if (modalProgressFill) {
        modalProgressFill.style.width = progressPercentage + '%';
    }
}

function closeModuleModal() {
    const modal = document.getElementById('moduleModal');
    if (modal) {
        modal.classList.remove('show');
        modal.dataset.currentModule = '';
    }
}

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

function getModuleData(moduleTitle) {
    // Get modules from global storage
    const globalModules = localStorage.getItem('globalModules');
    if (!globalModules) {
        console.log('No global modules found, using fallback data');
        return getFallbackModuleData(moduleTitle);
    }
    
    const modules = JSON.parse(globalModules);
    const module = modules.find(m => m.title === moduleTitle);
    
    if (!module) {
        console.log(`Module "${moduleTitle}" not found in global storage - may have been deleted`);
        return null; // Return null for deleted modules
    }
    
    // Convert admin format to user format
    return {
        title: module.title,
        description: module.description,
        requiredRole: module.requiredRole,
        checklist: module.checklist.map(task => {
            // Handle both old string format and new object format
            if (typeof task === 'string') {
                return {
                    task: task,
                    completed: false
                };
            } else {
                return {
                    task: task.description || task.task || '',
                    file: task.file || '',
                    completed: false
                };
            }
        })
    };
}

function getFallbackModuleData(moduleTitle) {
    // Fallback module data if global storage is not available
    const modules = {
        'Communication Skills': {
            title: 'Communication Skills',
            description: 'Learn effective communication techniques for leaders. This module covers verbal and non-verbal communication, active listening, and how to deliver clear, impactful messages to your team.',
            requiredRole: 'Team Member',
            checklist: [
                { task: 'Complete communication fundamentals video', completed: false },
                { task: 'Read "The Art of Active Listening" article', completed: false },
                { task: 'Practice delivering a team update presentation', completed: false },
                { task: 'Complete communication style assessment', completed: false },
                { task: 'Submit reflection on communication challenges', completed: false }
            ]
        },
        'Team Leadership': {
            title: 'Team Leadership',
            description: 'Master the fundamentals of leading teams effectively. Learn about team dynamics, motivation techniques, and how to build a cohesive, high-performing team.',
            requiredRole: 'Supervisor',
            checklist: [
                { task: 'Watch team dynamics overview video', completed: false },
                { task: 'Complete team assessment questionnaire', completed: false },
                { task: 'Read "Building Trust in Teams" guide', completed: false },
                { task: 'Practice conducting a team meeting', completed: false },
                { task: 'Submit team leadership action plan', completed: false }
            ]
        },
        'Decision Making': {
            title: 'Decision Making',
            description: 'Develop critical thinking and decision-making skills. Learn frameworks for making sound decisions under pressure and how to involve your team in the decision-making process.',
            requiredRole: 'Supervisor',
            checklist: [
                { task: 'Complete decision-making framework training', completed: false },
                { task: 'Practice using decision matrix tool', completed: false },
                { task: 'Read case studies on complex decisions', completed: false },
                { task: 'Complete decision-making simulation', completed: false }
            ]
        },
        'Conflict Resolution': {
            title: 'Conflict Resolution',
            description: 'Learn to handle and resolve workplace conflicts effectively. Develop skills for mediating disputes and creating a positive work environment.',
            requiredRole: 'Supervisor',
            checklist: [
                { task: 'Complete conflict resolution basics video', completed: false },
                { task: 'Read "Mediation Techniques" guide', completed: false },
                { task: 'Practice conflict resolution scenarios', completed: false },
                { task: 'Submit conflict resolution case study', completed: false }
            ]
        },
        'Strategic Planning': {
            title: 'Strategic Planning',
            description: 'Understand how to create and execute strategic plans. Learn about goal setting, resource allocation, and measuring success.',
            requiredRole: 'Director',
            checklist: [
                { task: 'Complete strategic planning fundamentals', completed: false },
                { task: 'Learn about SMART goal setting', completed: false },
                { task: 'Practice creating a strategic plan', completed: false },
                { task: 'Submit strategic planning exercise', completed: false }
            ]
        },
        'Performance Management': {
            title: 'Performance Management',
            description: 'Learn to manage and improve team performance. Develop skills for setting expectations, providing feedback, and conducting performance reviews.',
            requiredRole: 'Director',
            checklist: [
                { task: 'Complete performance management overview', completed: false },
                { task: 'Learn about feedback techniques', completed: false },
                { task: 'Practice conducting performance review', completed: false },
                { task: 'Submit performance management plan', completed: false }
            ]
        }
    };
    
    return modules[moduleTitle] || null;
}

// Utility function to get users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Utility function to get user's progress data
function getUserProgress(username) {
    const userProgressKey = `userProgress_${username}`;
    return JSON.parse(localStorage.getItem(userProgressKey) || '{}');
}

// Utility function to save user's progress data
function saveUserProgress(username, progressData) {
    const userProgressKey = `userProgress_${username}`;
    localStorage.setItem(userProgressKey, JSON.stringify(progressData));
}

// Utility function to get user's progress for a specific module
function getUserModuleProgress(username, moduleTitle) {
    const userProgress = getUserProgress(username);
    return userProgress[moduleTitle] || { checklist: [] };
}

// Utility function to calculate overall progress for a user
function calculateUserOverallProgress(username) {
    const userProgress = getUserProgress(username);
    
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
        if (moduleData && canUserAccessModule(userRole, moduleData.requiredRole)) {
            totalTasks += moduleData.checklist.length;
            const moduleProgress = userProgress[moduleTitle] || { checklist: [] };
            completedTasks += moduleProgress.checklist.filter(item => item).length;
        }
    });
    
    return {
        totalTasks,
        completedTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
}

// Export functions for potential use in other scripts
window.userProgress = {
    loadProgressData,
    updateProgressCards,
    updateCurrentPath,
    updateModules,
    openModule,
    getUserProgress,
    saveUserProgress,
    getUserModuleProgress,
    calculateUserOverallProgress,
    toggleChecklistItem,
    openModuleModal,
    closeModuleModal
};
