// User Progress Script

// Toast notification function - Now handled by ToastComponent

document.addEventListener('DOMContentLoaded', async function() {
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUserData = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !currentUserData) {
        window.location.href = 'index.html';
        return;
    }
    
    // Parse the user data - it might be a JSON string or just a username
    let username;
    try {
        const userObj = JSON.parse(currentUserData);
        username = userObj.username;
    } catch (e) {
        // If it's not JSON, assume it's just the username string
        username = currentUserData;
    }
    
    
    // Initialize the page
    await initializePage();
    
    // Initialize notifications
    initializeProgressNotifications();
    
    // Set up event listeners
    setupEventListeners();
    
    // Theme initialization is handled by navbar-component.js
    
    // Load progress data
    await loadProgressData();
});

async function initializePage() {
    // Set up user info
    await updateUserInfo();
    
    // Navigation is handled by navbar component
}

async function updateUserInfo() {
    const currentUserData = localStorage.getItem('currentUser');
    
    // Parse the user data - it might be a JSON string or just a username
    let username;
    try {
        const userObj = JSON.parse(currentUserData);
        username = userObj.username;
    } catch (e) {
        // If it's not JSON, assume it's just the username string
        username = currentUserData;
    }
    
    // Load users from database
    let users = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            users = await window.dbService.getUsers();
        } else {
            console.warn('Database service not configured, using localStorage fallback');
            showToast('warning', 'Database Unavailable', 'Using offline mode - progress may not be synchronized');
        }
    } catch (error) {
        console.error('Failed to load users from database:', error);
        showToast('error', 'Database Error', `Failed to load user data: ${error.message || 'Unknown error'}`);
        
        // Fallback to localStorage if available
        try {
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
            if (localUsers.length > 0) {
                users = localUsers;
                showToast('info', 'Using Offline Data', 'Loaded user data from local storage');
            }
        } catch (localError) {
            console.error('Failed to load users from localStorage:', localError);
        }
    }
    
    const user = users.find(u => u.username === username);
    
    if (user) {
        // Update avatar
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            const fullName = user.full_name || user.fullName || user.username;
            avatar.textContent = fullName.charAt(0).toUpperCase();
        }
        
        // Update name
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.full_name || user.fullName || user.username;
        }
        
        // Update role
        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.textContent = user.role;
        }
    }
}

// updateNavigation() function removed - handled by navbar.js

function setupEventListeners() {
    // Page-specific event listeners only
    // Navbar/avatar/theme functionality is handled by navbar-component.js
    
    // Sign out functionality is handled by navbar-component.js
    
    // Modal event listeners
    const modal = document.getElementById('moduleModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    if (modalClose) {
        modalClose.addEventListener('click', closeModuleModal);
    }
    
    if (modalCancel) {
        modalCancel.addEventListener('click', closeModuleModal);
    }
    
    // File viewer modal event listeners
    const fileViewerClose = document.getElementById('fileViewerClose');
    const fileViewerCancel = document.getElementById('fileViewerCancel');
    
    if (fileViewerClose) {
        fileViewerClose.addEventListener('click', closeFileViewer);
    }
    
    if (fileViewerCancel) {
        fileViewerCancel.addEventListener('click', closeFileViewer);
    }
    
    // Close file viewer when clicking outside the modal
    const fileViewerModal = document.getElementById('fileViewerModal');
    if (fileViewerModal) {
        fileViewerModal.addEventListener('click', function(e) {
            if (e.target === fileViewerModal) {
                closeFileViewer();
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


async function loadProgressData() {
    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) return;
    
    // Parse the user data - it might be a JSON string or just a username
    let username;
    try {
        const userObj = JSON.parse(currentUserData);
        username = userObj.username;
    } catch (e) {
        // If it's not JSON, assume it's just the username string
        username = currentUserData;
    }
    
    // Current user data from localStorage
    // Extracted username

    // Get user's role from database
    let users = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            users = await window.dbService.getUsers();
        }
    } catch (error) {
        console.error('Failed to load users from database:', error);
        showToast('error', 'Database Error', 'Failed to load user data from database');
    }
    
    const user = users.find(u => u.username === username);
    const userRole = user ? user.role : 'Team Member';

    // Calculate real progress data from user's saved progress
    const overallProgress = await calculateUserOverallProgress(username);
    const userProgress = await getUserProgress(username);
    
    // Overall progress calculated
    // User progress data

    // Load modules from database - only assigned modules for this user
    let moduleTitles = [];
    let userAssignments = [];
    try {
        if (window.dbService && window.dbService.isConfigured && user && user.id) {
            // Get user's assigned modules
            userAssignments = await window.dbService.getModuleAssignments(user.id);
            console.log('📋 Loaded module assignments for user:', userAssignments);
            
            if (userAssignments && userAssignments.length > 0) {
                // Get all modules to resolve module titles
                const allModules = await window.dbService.getModules();
                
                // Get the module titles from assignments, with fallback lookup
                moduleTitles = userAssignments.map(assignment => {
                    // First try assignment.module_title (from join)
                    if (assignment.module_title && assignment.module_title !== 'Unknown Module') {
                        return assignment.module_title;
                    }
                    // Fallback: lookup by module_id
                    if (assignment.module_id) {
                        const module = allModules.find(m => m.id === assignment.module_id);
                        if (module && module.title) {
                            return module.title;
                        }
                    }
                    return null;
                }).filter(title => title !== null && title !== 'Unknown Module');
                
                console.log('📚 Resolved module titles:', moduleTitles);
            } else {
                console.log('📭 No module assignments found for user');
            }
        } else {
            console.warn('Database service not configured, using localStorage fallback for modules');
        }
    } catch (error) {
        console.error('Failed to load modules from database:', error);
        showToast('error', 'Database Error', `Failed to load modules: ${error.message || 'Unknown error'}`);
    }
    
    // If no modules are assigned, show empty state (don't fallback to all modules)
    if (moduleTitles.length === 0) {
        console.log('📭 No modules assigned to user, showing empty state');
    }
    
    let achievements = 0;
    const modules = [];
    
    for (const moduleTitle of moduleTitles) {
        const moduleData = await getModuleData(moduleTitle);
        
        // Skip deleted modules (getModuleData returns null for deleted modules)
        if (!moduleData) {
            continue;
        }
        
        const moduleProgress = userProgress[moduleTitle] || { checklist: [] };
        const completedCount = moduleProgress.checklist.filter(item => item).length;
        const totalCount = moduleData.checklist.length;
        const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        // Count as achievement if 100% complete
        if (progressPercentage === 100) {
            achievements++;
        }
        
        // Determine status
        let status = 'not-started';
        if (progressPercentage === 100) {
            status = 'completed';
        } else if (progressPercentage > 0) {
            status = 'in-progress';
        }
        
        modules.push({
            title: moduleTitle,
            description: moduleData.description,
            status: status,
            progress: progressPercentage,
            isLocked: false,
            completedTasks: completedCount,
            totalTasks: totalCount
        });
    }
    
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
    updateModules(progressData.modules, userAssignments);
    
}


function updateProgressCards(data) {
    // Updating progress cards with data
    
    const overallProgress = document.getElementById('overallProgress');
    const completedTasks = document.getElementById('completedTasks');
    const totalTasks = document.getElementById('totalTasks');
    const achievements = document.getElementById('achievements');
    
    // Mobile progress cards
    const overallProgressMobile = document.getElementById('overallProgressMobile');
    const completedTasksMobile = document.getElementById('completedTasksMobile');
    const totalTasksMobile = document.getElementById('totalTasksMobile');
    const achievementsMobile = document.getElementById('achievementsMobile');
    
    if (overallProgress) {
        overallProgress.textContent = data.overallProgress + '%';
        // Updated overall progress
    }
    
    if (completedTasks) {
        completedTasks.textContent = data.completedTasks;
        // Updated completed tasks
    }
    
    if (totalTasks) {
        totalTasks.textContent = data.totalTasks;
    }
    
    if (achievements) {
        achievements.textContent = data.achievements;
    }
    
    // Update mobile progress cards
    if (overallProgressMobile) {
        overallProgressMobile.textContent = data.overallProgress + '%';
    }
    
    if (completedTasksMobile) {
        completedTasksMobile.textContent = data.completedTasks;
    }
    
    if (totalTasksMobile) {
        totalTasksMobile.textContent = data.totalTasks;
    }
    
    if (achievementsMobile) {
        achievementsMobile.textContent = data.achievements;
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
        pathProgressDetails.textContent = `${data.pathCompleted} of ${data.pathTotal} tasks completed`;
    }
}


function updateModules(modules, assignments = []) {
    const modulesGrid = document.getElementById('modulesGrid');
    if (!modulesGrid) return;
    
    // Handle empty state when no modules are assigned
    if (modules.length === 0) {
        modulesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <h3>No Modules Assigned</h3>
                <p>You don't have any learning modules assigned yet. Contact your administrator to get started with your leadership development journey.</p>
            </div>
        `;
        return;
    }
    
    const modulesHTML = modules.map(module => {
        const lockIcon = module.isLocked ? '<i class="fas fa-lock module-lock-icon"></i>' : '';
        const clickHandler = module.isLocked ? '' : `onclick="openModule('${module.title}')"`;
        const cardClass = module.isLocked ? 'module-card locked' : 'module-card';
        
        // Find assignment data for this module
        const assignment = assignments.find(a => a.module_title === module.title);
        const dueDate = assignment ? assignment.due_date : null;
        
        // Format due date for display
        let dueDateDisplay = '';
        if (dueDate) {
            const dueDateObj = new Date(dueDate);
            const today = new Date();
            const timeDiff = dueDateObj.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            let dueDateClass = 'due-date';
            if (daysDiff < 0) {
                dueDateClass += ' overdue';
            } else if (daysDiff <= 3) {
                dueDateClass += ' due-soon';
            }
            
            dueDateDisplay = `
                <div class="${dueDateClass}">
                    <i class="fas fa-calendar-alt"></i>
                    Due: ${dueDateObj.toLocaleDateString()}
                    ${daysDiff < 0 ? ' (Overdue)' : daysDiff <= 3 ? ' (Due Soon)' : ''}
                </div>
            `;
        }
        
        return `
        <div class="${cardClass}" ${clickHandler}>
            <div class="module-header">
                <div>
                    <div class="module-title">
                        ${lockIcon}
                        ${module.title}
                    </div>
                    ${dueDateDisplay}
                </div>
                <div class="module-status ${module.status}">${module.status.replace('-', ' ')}</div>
            </div>
            <div class="module-description">${module.description}</div>
            ${module.qualityUnsatisfactory || module.quality_average || module.quality_excellent || 
              module.speedUnsatisfactory || module.speed_average || module.speed_excellent || 
              module.communicationUnsatisfactory || module.communication_average || module.communication_excellent ? `
            <div class="module-rubric">
                <h4>Performance Rubric:</h4>
                ${module.qualityUnsatisfactory || module.quality_average || module.quality_excellent ? `
                <div class="rubric-section">
                    <strong>Quality:</strong>
                    ${module.qualityUnsatisfactory ? `<span class="rubric-level red">Unsatisfactory: ${module.qualityUnsatisfactory}</span>` : ''}
                    ${module.quality_average ? `<span class="rubric-level yellow">Average: ${module.quality_average}</span>` : ''}
                    ${module.quality_excellent ? `<span class="rubric-level green">Excellent: ${module.quality_excellent}</span>` : ''}
                </div>
                ` : ''}
                ${module.speedUnsatisfactory || module.speed_average || module.speed_excellent ? `
                <div class="rubric-section">
                    <strong>Speed:</strong>
                    ${module.speedUnsatisfactory ? `<span class="rubric-level red">Unsatisfactory: ${module.speedUnsatisfactory}</span>` : ''}
                    ${module.speed_average ? `<span class="rubric-level yellow">Average: ${module.speed_average}</span>` : ''}
                    ${module.speed_excellent ? `<span class="rubric-level green">Excellent: ${module.speed_excellent}</span>` : ''}
                </div>
                ` : ''}
                ${module.communicationUnsatisfactory || module.communication_average || module.communication_excellent ? `
                <div class="rubric-section">
                    <strong>Communication:</strong>
                    ${module.communicationUnsatisfactory ? `<span class="rubric-level red">Unsatisfactory: ${module.communicationUnsatisfactory}</span>` : ''}
                    ${module.communication_average ? `<span class="rubric-level yellow">Average: ${module.communication_average}</span>` : ''}
                    ${module.communication_excellent ? `<span class="rubric-level green">Excellent: ${module.communication_excellent}</span>` : ''}
                </div>
                ` : ''}
            </div>
            ` : ''}
            <div class="module-progress">
                <div class="module-task-count">${module.completedTasks || 0} of ${module.totalTasks || 0} tasks completed (${module.progress}%)</div>
            </div>
        </div>
    `;
    }).join('');
    
    modulesGrid.innerHTML = modulesHTML;
}

async function openModule(moduleTitle) {
    await openModuleModal(moduleTitle);
}

async function openModuleModal(moduleTitle) {
    const modal = document.getElementById('moduleModal');
    const modalTitle = document.getElementById('modalModuleTitle');
    const modalDescription = document.getElementById('modalModuleDescription');
    const modalDetails = document.getElementById('modalModuleDetails');
    const modalChecklist = document.getElementById('modalChecklist');
    const modalProgressPercentage = document.getElementById('modalProgressPercentage');
    const modalProgressFill = document.getElementById('modalProgressFill');
    
    if (!modal) return;
    
    // Get module data
    const moduleData = await getModuleData(moduleTitle);
    if (!moduleData) {
        alert('Module not found');
        return;
    }
    
    // Get user's saved progress (use same method as cards - from database)
    const currentUserData = localStorage.getItem('currentUser');
    
    // Parse the user data - it might be a JSON string or just a username
    let username;
    try {
        const userObj = JSON.parse(currentUserData);
        username = userObj.username;
    } catch (e) {
        // If it's not JSON, assume it's just the username string
        username = currentUserData;
    }
    
    // Get fresh progress data from database (same as cards use)
    const userProgress = await getUserProgress(username);
    const moduleProgress = userProgress[moduleTitle] || { checklist: [] };
    
    // Update modal title
    if (modalTitle) {
        modalTitle.textContent = moduleData.title;
    }
    
    // Update module description
    if (modalDescription) {
        modalDescription.textContent = moduleData.description || 'No description available.';
    }
    
    // Update module metadata in header
    const modalMetadata = document.getElementById('modalMetadata');
    if (modalMetadata) {
        const metadataHTML = [];
        
        if (moduleData.difficulty) {
            metadataHTML.push(`<span class="metadata-item"><strong>Phase Level:</strong> ${moduleData.difficulty}</span>`);
        }
        
        if (moduleData.duration) {
            metadataHTML.push(`<span class="metadata-item"><strong>Duration:</strong> ${moduleData.duration} hours</span>`);
        }
        
        if (moduleData.author) {
            metadataHTML.push(`<span class="metadata-item"><strong>Author:</strong> ${moduleData.author}</span>`);
        }
        
        if (moduleData.version) {
            metadataHTML.push(`<span class="metadata-item"><strong>Version:</strong> ${moduleData.version}</span>`);
        }
        
        if (moduleData.tags) {
            metadataHTML.push(`<span class="metadata-item"><strong>Tags:</strong> ${moduleData.tags}</span>`);
        }
        
        modalMetadata.innerHTML = metadataHTML.length > 0 ? metadataHTML.join(' • ') : '';
    }
    
    // Update module description with prerequisites if available
    if (modalDescription) {
        if (moduleData.prerequisites) {
            modalDescription.innerHTML = `
                <p>${moduleData.description}</p>
                <div class="prerequisites-info">
                    <strong>Prerequisites:</strong> ${moduleData.prerequisites}
                </div>
            `;
        } else {
            modalDescription.textContent = moduleData.description;
        }
    }
    
    // Update rubric criteria if available
    const rubricSection = document.getElementById('modalRubricSection');
    if (rubricSection) {
        const rubricHTML = [];
        
        // Quality Criteria
        const qualityUnsatisfactory = moduleData.qualityUnsatisfactory || moduleData.quality_unsatisfactory;
        const qualityAverage = moduleData.qualityAverage || moduleData.quality_average;
        const qualityExcellent = moduleData.qualityExcellent || moduleData.quality_excellent;
        
        if (qualityUnsatisfactory || qualityAverage || qualityExcellent) {
            rubricHTML.push(`
                <div class="rubric-criteria-item">
                    <h4 class="rubric-title">Quality Criteria</h4>
                    <div class="rubric-levels">
                        ${qualityUnsatisfactory ? `<div class="rubric-level rubric-red"><strong>Unsatisfactory:</strong> ${qualityUnsatisfactory}</div>` : ''}
                        ${qualityAverage ? `<div class="rubric-level rubric-yellow"><strong>Average:</strong> ${qualityAverage}</div>` : ''}
                        ${qualityExcellent ? `<div class="rubric-level rubric-green"><strong>Excellent:</strong> ${qualityExcellent}</div>` : ''}
                    </div>
                </div>
            `);
        }
        
        // Speed/Timing Criteria
        const speedUnsatisfactory = moduleData.speedUnsatisfactory || moduleData.speed_unsatisfactory;
        const speedAverage = moduleData.speedAverage || moduleData.speed_average;
        const speedExcellent = moduleData.speedExcellent || moduleData.speed_excellent;
        
        if (speedUnsatisfactory || speedAverage || speedExcellent) {
            rubricHTML.push(`
                <div class="rubric-criteria-item">
                    <h4 class="rubric-title">Speed/Timing Criteria</h4>
                    <div class="rubric-levels">
                        ${speedUnsatisfactory ? `<div class="rubric-level rubric-red"><strong>Unsatisfactory:</strong> ${speedUnsatisfactory}</div>` : ''}
                        ${speedAverage ? `<div class="rubric-level rubric-yellow"><strong>Average:</strong> ${speedAverage}</div>` : ''}
                        ${speedExcellent ? `<div class="rubric-level rubric-green"><strong>Excellent:</strong> ${speedExcellent}</div>` : ''}
                    </div>
                </div>
            `);
        }
        
        // Communication Criteria
        const communicationUnsatisfactory = moduleData.communicationUnsatisfactory || moduleData.communication_unsatisfactory;
        const communicationAverage = moduleData.communicationAverage || moduleData.communication_average;
        const communicationExcellent = moduleData.communicationExcellent || moduleData.communication_excellent;
        
        if (communicationUnsatisfactory || communicationAverage || communicationExcellent) {
            rubricHTML.push(`
                <div class="rubric-criteria-item">
                    <h4 class="rubric-title">Communication Criteria</h4>
                    <div class="rubric-levels">
                        ${communicationUnsatisfactory ? `<div class="rubric-level rubric-red"><strong>Unsatisfactory:</strong> ${communicationUnsatisfactory}</div>` : ''}
                        ${communicationAverage ? `<div class="rubric-level rubric-yellow"><strong>Average:</strong> ${communicationAverage}</div>` : ''}
                        ${communicationExcellent ? `<div class="rubric-level rubric-green"><strong>Excellent:</strong> ${communicationExcellent}</div>` : ''}
                    </div>
                </div>
            `);
        }
        
        if (rubricHTML.length > 0) {
            rubricSection.innerHTML = `
                <h3>Performance Rubric</h3>
                <div class="rubric-criteria">
                    ${rubricHTML.join('')}
                </div>
            `;
            rubricSection.style.display = 'block';
        } else {
            rubricSection.style.display = 'none';
        }
    }
    
    // Update checklist with user's saved progress
    if (modalChecklist) {
        const checklistHTML = moduleData.checklist.map((item, index) => {
            const isCompleted = moduleProgress.checklist[index] || false;
            
            // Handle both single file and multiple files
            let fileInfo = '';
            if (item.files && item.files.length > 0) {
                // Multiple files
                fileInfo = `
                    <div class="checklist-files">
                        ${item.files.map(file => {
                            const fileName = typeof file === 'object' ? file.name : file;
                            return `
                            <div class="checklist-file-info">
                                <i class="fas fa-file"></i>
                                <span onclick="openFileViewer('${fileName}', '${moduleTitle}')">${fileName}</span>
                            </div>
                        `;
                        }).join('')}
                    </div>
                `;
            } else if (item.file) {
                // Single file (legacy support)
                const fileName = typeof item.file === 'object' ? item.file.name : item.file;
                fileInfo = `
                        <div class="checklist-files">
                            <div class="checklist-file-info">
                                <i class="fas fa-file"></i>
                                <span onclick="openFileViewer('${fileName}', '${moduleTitle}')">${fileName}</span>
                            </div>
                        </div>
                `;
            }
            
            return `
                <div class="checklist-item ${isCompleted ? 'completed' : ''}">
                    <input type="checkbox" class="checklist-checkbox" id="checklist-${index}" 
                           ${isCompleted ? 'checked' : ''}
                           disabled
                           readonly>
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
    
    // Load and display performance review data
    await loadPerformanceReviewData(moduleTitle, username);
    
    // Show modal
    modal.classList.add('show');
}

// Load and display performance review data
async function loadPerformanceReviewData(moduleTitle, username) {
    try {
        if (!window.dbService || !window.dbService.isConfigured) {
            return;
        }
        
        // Get user and module data
        const users = await window.dbService.getUsers();
        const user = users.find(u => u.username === username);
        const modules = await window.dbService.getModules();
        const module = modules.find(m => m.title === moduleTitle);
        
        if (!user || !module) {
            return;
        }
        
        // Get performance review data if it exists
        const reviews = await window.dbService.getPerformanceReviews(user.id, module.id);
        if (!reviews || reviews.length === 0) {
            return;
        }
        
        const performanceReview = reviews[0];
        const modal = document.getElementById('moduleModal');
        
        // Parse trainer comments and team member goals
        let trainerComments = [];
        let teamMemberGoals = [];
        
        try {
            if (performanceReview.trainer_comments) {
                trainerComments = JSON.parse(performanceReview.trainer_comments);
            }
            if (performanceReview.team_member_goals) {
                teamMemberGoals = JSON.parse(performanceReview.team_member_goals);
            }
        } catch (e) {
            console.error('Failed to parse review data:', e);
        }
        
        // Populate first review entry with saved data
        const firstReviewEntry = modal.querySelector('.review-entry');
        if (firstReviewEntry) {
            const dateInput = firstReviewEntry.querySelector('.review-input[type="date"]');
            if (dateInput && performanceReview.review_date) {
                dateInput.value = performanceReview.review_date;
            }
            
            const textInputs = firstReviewEntry.querySelectorAll('.review-input[type="text"]');
            if (textInputs[0] && performanceReview.trainee_initials) {
                textInputs[0].value = performanceReview.trainee_initials;
            }
            if (textInputs[1] && performanceReview.trainer_signature) {
                textInputs[1].value = performanceReview.trainer_signature;
            }

            // Restore selected rating circle from overall_rating (read-only visual display)
            if (performanceReview.overall_rating) {
                const ratingMapReverse = {
                    'Excellent': 'excellent',
                    'Average': 'average',
                    'Unsatisfactory': 'unsatisfactory'
                };
                const normalized = ratingMapReverse[performanceReview.overall_rating] || null;
                if (normalized) {
                    const circle = firstReviewEntry.querySelector(`.rating-circles .circle[data-rating="${normalized}"]`);
                    if (circle) {
                        // Highlight the circle to show the selected rating (read-only display)
                        firstReviewEntry.querySelectorAll('.rating-circles .circle').forEach(c => {
                            c.classList.remove('selected');
                            c.style.border = '';
                            c.style.boxShadow = '';
                        });
                        circle.classList.add('selected');
                        circle.style.border = '3px solid #333';
                        circle.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
                    }
                }
            }
        }
        
        // Populate trainer comments
        trainerComments.forEach((comment, index) => {
            const commentEntry = modal.querySelectorAll('.comment-entry')[index];
            if (commentEntry) {
                const initialsInput = commentEntry.querySelector('.trainer-initials-input');
                const commentTextarea = commentEntry.querySelector('.comment-line');
                if (initialsInput && comment.initials) {
                    initialsInput.value = comment.initials;
                }
                if (commentTextarea && comment.comment) {
                    commentTextarea.value = comment.comment;
                }
            }
        });
        
        // Populate team member goals
        teamMemberGoals.forEach((goal, index) => {
            const goalEntry = modal.querySelectorAll('.goal-entry')[index];
            if (goalEntry) {
                const goalInput = goalEntry.querySelector('.goal-input');
                const dueDateInput = goalEntry.querySelector('.due-date-input');
                if (goalInput && goal.goal) {
                    goalInput.value = goal.goal;
                }
                if (dueDateInput && goal.due_date) {
                    dueDateInput.value = goal.due_date;
                }
            }
        });
    } catch (error) {
        console.error('Failed to load performance review data:', error);
    }
}

async function toggleChecklistItem(moduleTitle, itemIndex) {
    const currentUserData = localStorage.getItem('currentUser');
    
    // Parse the user data - it might be a JSON string or just a username
    let username;
    try {
        const userObj = JSON.parse(currentUserData);
        username = userObj.username;
    } catch (e) {
        // If it's not JSON, assume it's just the username string
        username = currentUserData;
    }
    
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
    const moduleData = await getModuleData(moduleTitle);
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
    
    // Save progress to database first, then localStorage
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username);
        
        // Get module from database instead of localStorage for consistency
        let module = null;
        if (window.dbService && window.dbService.isConfigured) {
            const dbModules = await window.dbService.getModules();
            module = dbModules.find(m => m.title === moduleTitle);
        }
        
        // Fallback to localStorage if database fails
        if (!module) {
            const modules = JSON.parse(localStorage.getItem('globalModules') || '[]');
            module = modules.find(m => m.title === moduleTitle);
        }
        
        if (user && module) {
            const completedCount = userProgress[moduleTitle].checklist.filter(task => task === true).length;
            const totalCount = userProgress[moduleTitle].checklist.length;
            const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
            
            // Saving progress for module with checklist array
            
            await window.dbService.updateUserProgressWithChecklist(
                user.id,
                module.id,
                completedCount,
                totalCount,
                progressPercentage,
                userProgress[moduleTitle].checklist
            );
        }
    } catch (error) {
        console.error('Failed to save progress to database:', error);
    }
    
    // Also save to localStorage for compatibility
    localStorage.setItem(userProgressKey, JSON.stringify(userProgress));
    
    
    // Update modal display
    await updateModalProgress(moduleTitle);
    
    // Also update the card immediately (in case modal is open, cards are visible)
    await updateModuleCardProgress(moduleTitle);
    
    // Refresh main page data with a small delay to ensure database is updated
    setTimeout(async () => {
        // Refreshing progress data after toggle
        await loadProgressData();
    }, 500);
}

// Update progress on the module card (outside the modal) to match modal
async function updateModuleCardProgress(moduleTitle) {
    try {
        const currentUserData = localStorage.getItem('currentUser');
        let username;
        try {
            const userObj = JSON.parse(currentUserData);
            username = userObj.username;
        } catch (e) {
            username = currentUserData;
        }
        
        // Get fresh progress data (same calculation as cards)
        const userProgress = await getUserProgress(username);
        const moduleData = await getModuleData(moduleTitle);
        if (!moduleData) return;
        
        const moduleProgress = userProgress[moduleTitle] || { checklist: [] };
        const completedCount = moduleProgress.checklist.filter(item => item).length;
        const totalCount = moduleData.checklist.length;
        const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        // Find and update the module card
        const moduleCards = document.querySelectorAll('.module-card');
        moduleCards.forEach(card => {
            const cardTitle = card.querySelector('.module-title')?.textContent?.trim();
            if (cardTitle === moduleTitle) {
                // Update progress text (progress bar removed)
                const taskCount = card.querySelector('.module-task-count');
                
                if (taskCount) {
                    taskCount.textContent = `${completedCount} of ${totalCount} tasks completed (${progressPercentage}%)`;
                }
                
                // Update status badge
                const statusBadge = card.querySelector('.module-status');
                if (statusBadge) {
                    let statusClass = 'not-started';
                    let statusText = 'NOT STARTED';
                    if (progressPercentage === 100) {
                        statusClass = 'completed';
                        statusText = 'COMPLETED';
                    } else if (progressPercentage > 0) {
                        statusClass = 'in-progress';
                        statusText = 'IN PROGRESS';
                    }
                    statusBadge.className = `module-status ${statusClass}`;
                    statusBadge.textContent = statusText;
                }
            }
        });
    } catch (error) {
        console.error('Failed to update module card progress:', error);
    }
}

async function updateModalProgress(moduleTitle) {
    const modalProgressPercentage = document.getElementById('modalProgressPercentage');
    const modalProgressFill = document.getElementById('modalProgressFill');
    const modalChecklist = document.getElementById('modalChecklist');
    
    const moduleData = await getModuleData(moduleTitle);
    if (!moduleData) return;
    
    const currentUserData = localStorage.getItem('currentUser');
    
    // Parse the user data - it might be a JSON string or just a username
    let username;
    try {
        const userObj = JSON.parse(currentUserData);
        username = userObj.username;
    } catch (e) {
        // If it's not JSON, assume it's just the username string
        username = currentUserData;
    }
    
    // Get fresh progress data from database (same as cards use) to ensure consistency
    const userProgress = await getUserProgress(username);
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


async function getModuleData(moduleTitle) {
    // Prefer local cache
    const globalModules = localStorage.getItem('globalModules');
    let module = null;
    if (globalModules) {
        try {
            const modules = JSON.parse(globalModules);
            module = modules.find(m => m.title === moduleTitle) || null;
        } catch (e) {
            // Ignore parse errors and fall back to DB
        }
    }
    
    // Fallback to database if not found in cache
    if (!module && window.dbService && window.dbService.isConfigured) {
        try {
            const dbModules = await window.dbService.getModules();
            module = dbModules.find(m => m.title === moduleTitle) || null;
        } catch (e) {
            // If DB not available, use static fallback
        }
    }
    
    // Final fallback to static seeded data
    if (!module) {
        const fallback = getFallbackModuleData(moduleTitle);
        if (!fallback) return null;
        // Normalize fallback to expected shape below
        module = fallback;
    }
    
    // Load checklist items from database if available
    let checklistItems = module.checklist || [];
    if (window.dbService && window.dbService.isConfigured && module.id) {
        try {
            const dbChecklistItems = await window.dbService.getModuleChecklist(module.id);
            if (dbChecklistItems && dbChecklistItems.length > 0) {
                // Convert database checklist items to the format expected by the UI
                checklistItems = dbChecklistItems.map((item, index) => {
                    const taskObj = {
                        description: item.task_text,
                        task: item.task_text
                    };
                    
                    // Restore file data from localStorage (backup storage)
                    const fileDataKey = `module_${module.id}_task_${index}_files`;
                    const storedFileData = localStorage.getItem(fileDataKey);
                    if (storedFileData) {
                        try {
                            taskObj.files = JSON.parse(storedFileData);
                            // User Progress - Restored file data from localStorage
                        } catch (error) {
                            console.warn('Failed to parse file data from localStorage:', error);
                        }
                    }
                    
                    return taskObj;
                });
            } else {
                // If no database checklist items, try to restore from localStorage
                // User Progress - No database checklist items, checking localStorage
                const restoredItems = [];
                let index = 0;
                while (true) {
                    const fileDataKey = `module_${module.id}_task_${index}_files`;
                    const storedFileData = localStorage.getItem(fileDataKey);
                    if (storedFileData) {
                        try {
                            const files = JSON.parse(storedFileData);
                            // Try to get task text from the original module checklist
                            const originalTask = module.checklist && module.checklist[index] ? module.checklist[index] : `Task ${index + 1}`;
                            const taskText = typeof originalTask === 'string' ? originalTask : (originalTask.description || originalTask.task || `Task ${index + 1}`);
                            
                            restoredItems.push({
                                description: taskText,
                                task: taskText,
                                files: files
                            });
                            // User Progress - Restored task with files from localStorage
                        } catch (error) {
                            console.warn('Failed to parse file data from localStorage:', error);
                        }
                        index++;
                    } else {
                        break;
                    }
                }
                if (restoredItems.length > 0) {
                    checklistItems = restoredItems;
                }
            }
        } catch (error) {
            console.warn('Failed to load checklist from database, using localStorage:', error);
        }
    }
    
    // Convert admin format to user format
    return {
        title: module.title,
        description: module.description,
        requiredRole: module.requiredRole,
        difficulty: module.difficulty,
        duration: module.duration,
        prerequisites: module.prerequisites,
        author: module.author,
        version: module.version,
        tags: module.tags,
        qualityUnsatisfactory: module.qualityUnsatisfactory || module.quality_unsatisfactory,
        qualityAverage: module.qualityAverage || module.quality_average,
        qualityExcellent: module.qualityExcellent || module.quality_excellent,
        speedUnsatisfactory: module.speedUnsatisfactory || module.speed_unsatisfactory,
        speedAverage: module.speedAverage || module.speed_average,
        speedExcellent: module.speedExcellent || module.speed_excellent,
        communicationUnsatisfactory: module.communicationUnsatisfactory || module.communication_unsatisfactory,
        communicationAverage: module.communicationAverage || module.communication_average,
        communicationExcellent: module.communicationExcellent || module.communication_excellent,
        checklist: checklistItems.map(task => {
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
                    files: task.files || [],
                    completed: false
                };
            }
        })
    };
}

// File Viewer Functions
function openFileViewer(fileName, moduleTitle = null) {
    
    const modal = document.getElementById('fileViewerModal');
    const title = document.getElementById('fileViewerTitle');
    const content = document.getElementById('fileViewerContent');
    const downloadBtn = document.getElementById('fileViewerDownload');
    
    
    if (!modal) {
        console.error('File viewer modal not found!');
        return;
    }
    
    // Store the module context for file content retrieval
    if (moduleTitle) {
        modal.dataset.currentModule = moduleTitle;
    }
    
    // Update modal title
    if (title) {
        title.textContent = `Viewing: ${fileName}`;
    }
    
    // Set up download button
    if (downloadBtn) {
        downloadBtn.onclick = () => downloadFile(fileName);
    }
    
    // Determine file type and display accordingly
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf') {
        // For PDF files, try to embed them
        content.innerHTML = `
            <iframe src="data:application/pdf;base64,${getFileContent(fileName)}" type="application/pdf">
                <div class="file-preview">
                    <i class="fas fa-file-pdf"></i>
                    <h3>${fileName}</h3>
                    <p>PDF file preview not available in this browser.</p>
                    <div class="file-info">
                        <strong>File Type:</strong> PDF Document<br>
                        <strong>Size:</strong> ${getFileSize(fileName)}<br>
                        <strong>Last Modified:</strong> ${getFileDate(fileName)}
                    </div>
                </div>
            </iframe>
        `;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
        // For image files
        content.innerHTML = `
            <div class="file-preview">
                <img src="data:image/${fileExtension};base64,${getFileContent(fileName)}" alt="${fileName}" style="max-width: 100%; max-height: 500px;">
                <h3>${fileName}</h3>
                <div class="file-info">
                    <strong>File Type:</strong> Image (${fileExtension.toUpperCase()})<br>
                    <strong>Size:</strong> ${getFileSize(fileName)}<br>
                    <strong>Last Modified:</strong> ${getFileDate(fileName)}
                </div>
            </div>
        `;
    } else if (['txt', 'md', 'csv'].includes(fileExtension)) {
        // For text files
        content.innerHTML = `
            <div class="file-preview">
                <pre style="text-align: left; white-space: pre-wrap; font-family: monospace; background: #f8f9fa; padding: 1rem; border-radius: 4px;">${getFileContent(fileName)}</pre>
                <h3>${fileName}</h3>
                <div class="file-info">
                    <strong>File Type:</strong> Text File (${fileExtension.toUpperCase()})<br>
                    <strong>Size:</strong> ${getFileSize(fileName)}<br>
                    <strong>Last Modified:</strong> ${getFileDate(fileName)}
                </div>
            </div>
        `;
    } else {
        // For other file types, show file info
        content.innerHTML = `
            <div class="file-preview">
                <i class="fas fa-file"></i>
                <h3>${fileName}</h3>
                <p>This file type cannot be previewed in the browser.</p>
                <div class="file-info">
                    <strong>File Type:</strong> ${fileExtension.toUpperCase() || 'Unknown'}<br>
                    <strong>Size:</strong> ${getFileSize(fileName)}<br>
                    <strong>Last Modified:</strong> ${getFileDate(fileName)}
                </div>
            </div>
        `;
    }
    
    // Show modal
    modal.classList.add('show');
}

function closeFileViewer() {
    const modal = document.getElementById('fileViewerModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function downloadFile(fileName) {
    // Create a download link for the file
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${getFileContent(fileName)}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Get all modules from localStorage
function getAllModules() {
    const globalModules = localStorage.getItem('globalModules');
    if (!globalModules) {
        return [];
    }
    return JSON.parse(globalModules);
}

// Get actual file content from module data
function getFileContent(fileName) {
    
    // First, try to find the file in the current module's data
    const currentModule = document.getElementById('moduleModal')?.dataset.currentModule;
    const fileViewerModal = document.getElementById('fileViewerModal');
    const moduleFromFileViewer = fileViewerModal?.dataset.currentModule;
    
    
    const moduleTitle = currentModule || moduleFromFileViewer;
    
    if (moduleTitle) {
        const modules = getAllModules();
        const module = modules.find(m => m.title === moduleTitle);
        
        
        if (module && module.checklist) {
            for (const task of module.checklist) {
                if (task.files) {
                    for (const file of task.files) {
                        if (typeof file === 'object' && file.name === fileName && file.content) {
                            return file.content;
                        } else if (typeof file === 'string' && file === fileName) {
                            // Fallback to mock content for files without stored content
                            return getMockFileContent(fileName);
                        }
                    }
                }
            }
        }
    }
    
    // Fallback to mock content if file not found
    return getMockFileContent(fileName);
}

// Mock file content functions (fallback for files without stored content)
function getMockFileContent(fileName) {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf') {
        return 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbNSAwIFJdCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAyIDAgUgo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0NvdW50IDEKL0tpZHMgWzUgMCBSXQovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ5IDAwMDAwIG4gCjAwMDAwMDAzMjcgMDAwMDAgbiAKMDAwMDAwMDQwNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDcKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ5NQolJUVPRgo=';
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    } else if (fileExtension === 'txt') {
        return 'This is a sample text file content.\n\nIt contains multiple lines of text that can be displayed in the file viewer.\n\nThis is a demonstration of how text files would appear when viewed.';
    } else {
        return 'Sample file content for ' + fileName;
    }
}

function getFileSize(fileName) {
    // Mock file size - in a real app, this would be the actual file size
    const sizes = ['2.3 KB', '1.8 MB', '456 KB', '3.2 MB', '128 KB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
}

function getFileDate(fileName) {
    // Mock file date - in a real app, this would be the actual modification date
    const dates = ['Oct 14, 2025', 'Oct 13, 2025', 'Oct 12, 2025', 'Oct 11, 2025'];
    return dates[Math.floor(Math.random() * dates.length)];
}

function getFallbackModuleData(moduleTitle) {
    // Fallback module data if global storage is not available
    const modules = {
        'Communication Skills': {
            title: 'Communication Skills',
            description: 'Learn effective communication techniques for leaders. This module covers verbal and non-verbal communication, active listening, and how to deliver clear, impactful messages to your team.',
            requiredRole: 'Team Member',
            checklist: [
                { task: 'Complete communication fundamentals video', files: ['communication-fundamentals.pdf', 'video-transcript.docx'], completed: false },
                { task: 'Read "The Art of Active Listening" article', files: ['active-listening-guide.pdf'], completed: false },
                { task: 'Practice delivering a team update presentation', files: ['presentation-template.pptx', 'evaluation-rubric.pdf'], completed: false },
                { task: 'Complete communication style assessment', files: ['assessment-questionnaire.pdf'], completed: false },
                { task: 'Submit reflection on communication challenges', completed: false }
            ]
        },
        'Team Leadership': {
            title: 'Team Leadership',
            description: 'Master the fundamentals of leading teams effectively. Learn about team dynamics, motivation techniques, and how to build a cohesive, high-performing team.',
            requiredRole: 'Supervisor',
            checklist: [
                { task: 'Watch team dynamics overview video', files: ['team-dynamics-video.mp4'], completed: false },
                { task: 'Complete team assessment questionnaire', files: ['team-assessment.pdf', 'scoring-guide.docx'], completed: false },
                { task: 'Read "Building Trust in Teams" guide', files: ['trust-building-guide.pdf'], completed: false },
                { task: 'Practice conducting a team meeting', files: ['meeting-agenda-template.docx', 'facilitation-tips.pdf'], completed: false },
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
// getUsers() function removed - handled by navbar.js

// Utility function to get user's progress data from database first
async function getUserProgress(username) {
    // Initialize userProgress object
    let userProgress = {};
    
    // Getting user progress
    
    try {
        if (window.dbService && window.dbService.isConfigured) {
            // Get user ID
            const users = await window.dbService.getUsers();
            // All users from database
            // Looking for username
            const user = users.find(u => u.username === username);
            // Found user
            
            if (user) {
                // Get progress from database
                const dbProgress = await window.dbService.getUserProgress(user.id);
                // Database progress for user
                
                // Get modules from database instead of localStorage
                const modules = await window.dbService.getModules();
                // Modules from database
                
                dbProgress.forEach(p => {
                    // Find module title by ID
                    const module = modules.find(m => m.id === p.module_id);
                    if (module) {
                        // Load checklist from database if available, otherwise initialize from completed_tasks
                        let checklist = Array(p.total_tasks).fill(false).map((_, i) => i < p.completed_tasks);
                        if (p.checklist && Array.isArray(p.checklist)) {
                            checklist = p.checklist;
                        }
                        
                        userProgress[module.title] = {
                            checklist: checklist
                        };
                    }
                });
                
                // Store in localStorage for compatibility
                const userProgressKey = `userProgress_${username}`;
                localStorage.setItem(userProgressKey, JSON.stringify(userProgress));
                
                // Final userProgress object
            } else {
                // User not found
            }
        } else {
            // Database service not configured
        }
    } catch (error) {
        console.error('Failed to load user progress from database:', error);
        showToast('error', 'Database Error', 'Failed to load user progress from database');
    }
    
    return userProgress;
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
async function calculateUserOverallProgress(username) {
    const userProgress = await getUserProgress(username);
    
    // Get user's role from database
    let users = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            users = await window.dbService.getUsers();
        }
    } catch (error) {
        console.error('Failed to load users from database:', error);
    }
    
    const user = users.find(u => u.username === username);
    const userRole = user ? user.role : 'Team Member';
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    // Get only assigned module titles for this user
    let moduleTitles = [];
    
    if (window.dbService && window.dbService.isConfigured && user && user.id) {
        try {
            // Get user's assigned modules
            const userAssignments = await window.dbService.getModuleAssignments(user.id);
            
            if (userAssignments && userAssignments.length > 0) {
                // Get the module titles from assignments
                moduleTitles = userAssignments.map(assignment => assignment.module_title);
            }
        } catch (error) {
            console.error('Failed to load assigned modules for progress calculation:', error);
        }
    }
    
    for (const moduleTitle of moduleTitles) {
        const moduleData = await getModuleData(moduleTitle);
        if (moduleData) {
            totalTasks += moduleData.checklist.length;
            const moduleProgress = userProgress[moduleTitle] || { checklist: [] };
            completedTasks += moduleProgress.checklist.filter(item => item).length;
        }
    }
    
    return {
        totalTasks,
        completedTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
}

// Theme and dropdown functionality is handled by navbar-component.js

// Export functions for potential use in other scripts
// Force refresh user progress data from database
async function refreshUserProgressData() {
    
    try {
        await loadProgressData();
    } catch (error) {
        console.error('User Progress - Failed to refresh data:', error);
    }
}

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
    closeModuleModal,
    refreshUserProgressData
};

// Make refresh function available globally
window.refreshUserProgressData = refreshUserProgressData;

// Initialize progress notifications
function initializeProgressNotifications() {
    // Wait for notification service to be available
    if (typeof window.notificationService === 'undefined') {
        setTimeout(initializeProgressNotifications, 100);
        return;
    }
    
    // User Progress Script - Initializing notifications
    
    // Show progress page notification
    setTimeout(() => {
        if (window.notificationService) {
            window.notificationService.showInfo(
                'Track your progress and complete your assigned modules.',
                'Progress Tracking'
            );
        }
    }, 1000);
}

// Show completion notification when task is completed
function showTaskCompletionNotification(taskTitle, moduleTitle) {
    if (window.notificationService) {
        window.notificationService.showSuccess(
            `Great job! You completed "${taskTitle}" in ${moduleTitle}`,
            'Task Completed'
        );
    }
}

// Show module completion notification
function showModuleCompletionNotification(moduleTitle) {
    if (window.notificationService) {
        window.notificationService.showSuccess(
            `Congratulations! You completed the "${moduleTitle}" module`,
            'Module Completed'
        );
    }
}

// Show progress milestone notification
function showProgressMilestoneNotification(percentage) {
    if (window.notificationService) {
        const milestones = [25, 50, 75, 90, 100];
        if (milestones.includes(percentage)) {
            window.notificationService.showProgressReminder(
                percentage,
                percentage === 100 ? 'All tasks completed!' : 'Keep up the great work!'
            );
        }
    }
}
