// User Progress Script

document.addEventListener('DOMContentLoaded', async function() {
    console.log('User Progress page loaded');
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    
    console.log('User Progress - Login check:', { isLoggedIn, username });
    
    if (!isLoggedIn || !username) {
        console.log('User not logged in, redirecting to login page');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('User is logged in, proceeding with page load');
    
    // Initialize the page
    await initializePage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize theme
    initializeTheme();
    
    // Load progress data
    await loadProgressData();
});

async function initializePage() {
    // Set up user info
    await updateUserInfo();
    
    // Navigation is handled by navbar.js
}

async function updateUserInfo() {
    const username = localStorage.getItem('username');
    
    // Try to load users from database first
    let users = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            users = await window.dbService.getUsers();
            // Store in localStorage for compatibility
            localStorage.setItem('users', JSON.stringify(users));
        }
    } catch (error) {
        console.warn('Failed to load users from database, using localStorage:', error);
        users = getUsers();
    }
    
    // Fallback to localStorage if database failed
    if (users.length === 0) {
        users = getUsers();
    }
    
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

// updateNavigation() function removed - handled by navbar.js

function setupEventListeners() {
    
    // Avatar dropdown functionality
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Dropdown user info is handled by navbar.js
    
    // Theme toggle button in dropdown
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleTheme();
        });
    }
    
    // Sign out button in dropdown
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function(e) {
            e.stopPropagation();
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
    const username = localStorage.getItem('username');
    if (!username) return;

    // Get user's role from database first
    let users = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            users = await window.dbService.getUsers();
            // Store in localStorage for compatibility
            localStorage.setItem('users', JSON.stringify(users));
        }
    } catch (error) {
        console.warn('Failed to load users from database, using localStorage:', error);
        users = getUsers();
    }
    
    // Fallback to localStorage if database failed
    if (users.length === 0) {
        users = getUsers();
    }
    
    const user = users.find(u => u.username === username);
    const userRole = user ? user.role : 'Team Member';

    // Calculate real progress data from user's saved progress
    const overallProgress = await calculateUserOverallProgress(username);
    const userProgress = await getUserProgress(username);

    // Try to load modules from database first
    let moduleTitles = [];
    try {
        if (window.dbService && window.dbService.isConfigured) {
            const dbModules = await window.dbService.getModules();
            if (dbModules && dbModules.length > 0) {
                console.log('Loading modules from database for progress page:', dbModules.length);
                moduleTitles = dbModules.map(m => m.title);
                
                // Store in localStorage for compatibility
                localStorage.setItem('globalModules', JSON.stringify(dbModules));
            }
        }
    } catch (error) {
        console.warn('Failed to load modules from database, using localStorage:', error);
    }
    
    // Fallback to localStorage if database failed
    if (moduleTitles.length === 0) {
        const globalModules = localStorage.getItem('globalModules');
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
                requiredRole: moduleData.requiredRole,
                completedTasks: completedCount,
                totalTasks: totalCount
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
                    <div class="module-task-count">${module.completedTasks || 0} of ${module.totalTasks || 0} tasks completed</div>
                    <div class="module-progress-bar-container">
                        <div class="module-progress-bar">
                            <div class="module-progress-fill" style="width: ${module.progress}%;"></div>
                        </div>
                        <div class="module-progress-text">${module.progress}%</div>
                    </div>
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
    const modalDetails = document.getElementById('modalModuleDetails');
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
        if (moduleData.qualityUnsatisfactory || moduleData.qualityAverage || moduleData.qualityExcellent) {
            rubricHTML.push(`
                <div class="rubric-criteria-item">
                    <h4 class="rubric-title">Quality Criteria</h4>
                    <div class="rubric-levels">
                        ${moduleData.qualityUnsatisfactory ? `<div class="rubric-level rubric-red"><strong>Unsatisfactory:</strong> ${moduleData.qualityUnsatisfactory}</div>` : ''}
                        ${moduleData.qualityAverage ? `<div class="rubric-level rubric-yellow"><strong>Average:</strong> ${moduleData.qualityAverage}</div>` : ''}
                        ${moduleData.qualityExcellent ? `<div class="rubric-level rubric-green"><strong>Excellent:</strong> ${moduleData.qualityExcellent}</div>` : ''}
                    </div>
                </div>
            `);
        }
        
        // Speed/Timing Criteria
        if (moduleData.speedUnsatisfactory || moduleData.speedAverage || moduleData.speedExcellent) {
            rubricHTML.push(`
                <div class="rubric-criteria-item">
                    <h4 class="rubric-title">Speed/Timing Criteria</h4>
                    <div class="rubric-levels">
                        ${moduleData.speedUnsatisfactory ? `<div class="rubric-level rubric-red"><strong>Unsatisfactory:</strong> ${moduleData.speedUnsatisfactory}</div>` : ''}
                        ${moduleData.speedAverage ? `<div class="rubric-level rubric-yellow"><strong>Average:</strong> ${moduleData.speedAverage}</div>` : ''}
                        ${moduleData.speedExcellent ? `<div class="rubric-level rubric-green"><strong>Excellent:</strong> ${moduleData.speedExcellent}</div>` : ''}
                    </div>
                </div>
            `);
        }
        
        // Communication Criteria
        if (moduleData.communicationUnsatisfactory || moduleData.communicationAverage || moduleData.communicationExcellent) {
            rubricHTML.push(`
                <div class="rubric-criteria-item">
                    <h4 class="rubric-title">Communication Criteria</h4>
                    <div class="rubric-levels">
                        ${moduleData.communicationUnsatisfactory ? `<div class="rubric-level rubric-red"><strong>Unsatisfactory:</strong> ${moduleData.communicationUnsatisfactory}</div>` : ''}
                        ${moduleData.communicationAverage ? `<div class="rubric-level rubric-yellow"><strong>Average:</strong> ${moduleData.communicationAverage}</div>` : ''}
                        ${moduleData.communicationExcellent ? `<div class="rubric-level rubric-green"><strong>Excellent:</strong> ${moduleData.communicationExcellent}</div>` : ''}
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

async function toggleChecklistItem(moduleTitle, itemIndex) {
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
    
    // Save progress to database first, then localStorage
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username);
        const modules = JSON.parse(localStorage.getItem('globalModules') || '[]');
        const module = modules.find(m => m.title === moduleTitle);
        
        if (user && module) {
            const completedCount = userProgress[moduleTitle].checklist.filter(task => task.completed).length;
            const totalCount = userProgress[moduleTitle].checklist.length;
            const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
            
            await window.dbService.updateUserProgress(
                user.id,
                module.id,
                completedCount,
                totalCount,
                progressPercentage
            );
            console.log('Progress saved to database successfully');
        }
    } catch (error) {
        console.error('Failed to save progress to database:', error);
    }
    
    // Also save to localStorage for compatibility
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
        difficulty: module.difficulty,
        duration: module.duration,
        prerequisites: module.prerequisites,
        author: module.author,
        version: module.version,
        tags: module.tags,
        qualityUnsatisfactory: module.qualityUnsatisfactory,
        qualityAverage: module.qualityAverage,
        qualityExcellent: module.qualityExcellent,
        speedUnsatisfactory: module.speedUnsatisfactory,
        speedAverage: module.speedAverage,
        speedExcellent: module.speedExcellent,
        communicationUnsatisfactory: module.communicationUnsatisfactory,
        communicationAverage: module.communicationAverage,
        communicationExcellent: module.communicationExcellent,
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
                    files: task.files || [],
                    completed: false
                };
            }
        })
    };
}

// File Viewer Functions
function openFileViewer(fileName, moduleTitle = null) {
    console.log('openFileViewer called with:', fileName, moduleTitle);
    
    const modal = document.getElementById('fileViewerModal');
    const title = document.getElementById('fileViewerTitle');
    const content = document.getElementById('fileViewerContent');
    const downloadBtn = document.getElementById('fileViewerDownload');
    
    console.log('Modal elements found:', {
        modal: !!modal,
        title: !!title,
        content: !!content,
        downloadBtn: !!downloadBtn
    });
    
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
    console.log('getFileContent called with fileName:', fileName);
    
    // First, try to find the file in the current module's data
    const currentModule = document.getElementById('moduleModal')?.dataset.currentModule;
    const fileViewerModal = document.getElementById('fileViewerModal');
    const moduleFromFileViewer = fileViewerModal?.dataset.currentModule;
    
    console.log('Current module from moduleModal:', currentModule);
    console.log('Current module from fileViewerModal:', moduleFromFileViewer);
    
    const moduleTitle = currentModule || moduleFromFileViewer;
    
    if (moduleTitle) {
        const modules = getAllModules();
        const module = modules.find(m => m.title === moduleTitle);
        
        console.log('Found module:', module);
        
        if (module && module.checklist) {
            for (const task of module.checklist) {
                if (task.files) {
                    for (const file of task.files) {
                        if (typeof file === 'object' && file.name === fileName && file.content) {
                            console.log('Found file content for:', fileName);
                            return file.content;
                        } else if (typeof file === 'string' && file === fileName) {
                            // Fallback to mock content for files without stored content
                            console.log('Found file as string, using mock content for:', fileName);
                            return getMockFileContent(fileName);
                        }
                    }
                }
            }
        }
    }
    
    // Fallback to mock content if file not found
    console.log('File not found, using mock content for:', fileName);
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
    try {
        if (window.dbService && window.dbService.isConfigured) {
            // Get user ID
            const users = await window.dbService.getUsers();
            const user = users.find(u => u.username === username);
            
            if (user) {
                // Get progress from database
                const dbProgress = await window.dbService.getUserProgress(user.id);
                
                // Convert database format to localStorage format
                const userProgress = {};
                dbProgress.forEach(p => {
                    // Find module title by ID
                    const modules = JSON.parse(localStorage.getItem('globalModules') || '[]');
                    const module = modules.find(m => m.id === p.module_id);
                    if (module) {
                        userProgress[module.title] = {
                            checklist: Array(p.total_tasks).fill(false).map((_, i) => i < p.completed_tasks)
                        };
                    }
                });
                
                // Store in localStorage for compatibility
                const userProgressKey = `userProgress_${username}`;
                localStorage.setItem(userProgressKey, JSON.stringify(userProgress));
                
                return userProgress;
            }
        }
    } catch (error) {
        console.warn('Failed to load user progress from database, using localStorage:', error);
    }
    
    // Fallback to localStorage
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
async function calculateUserOverallProgress(username) {
    const userProgress = await getUserProgress(username);
    
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

// Theme toggle functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set the new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update the icon
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Update the text
    const themeText = document.getElementById('themeText');
    if (themeText) {
        themeText.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
    
    console.log('Theme switched to:', newTheme);
}

// Initialize theme on page load
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    const themeText = document.getElementById('themeText');
    if (themeText) {
        themeText.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
}

// Update dropdown user info
// updateDropdownUserInfo() function removed - handled by navbar.js

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
