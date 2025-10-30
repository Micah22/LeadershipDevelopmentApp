// Quiz System JavaScript
// Loading quiz script

// Global variables
let currentQuizzes = [];
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizResults = [];
let questionCounter = 0;

// Feature flags
const QUESTION_BANK_ENABLED = false;

// Sample quiz data
const sampleQuizzes = [
    {
        id: 'quiz_1',
        title: 'Leadership Fundamentals',
        description: 'Test your knowledge of basic leadership principles and practices.',
        category: 'leadership',
        difficulty: 'beginner',
        tags: ['leadership', 'fundamentals', 'management', 'teamwork'],
        questions: [
            {
                id: 'q1',
                question: 'What is the primary role of a leader?',
                options: [
                    'To give orders',
                    'To inspire and guide others',
                    'To control every decision',
                    'To work alone'
                ],
                correct: 1
            },
            {
                id: 'q2',
                question: 'Which leadership style focuses on involving team members in decision-making?',
                options: [
                    'Autocratic',
                    'Democratic',
                    'Laissez-faire',
                    'Transactional'
                ],
                correct: 1
            },
            {
                id: 'q3',
                question: 'What is emotional intelligence in leadership?',
                options: [
                    'Being overly emotional',
                    'Understanding and managing emotions',
                    'Avoiding emotions at work',
                    'Being sensitive to criticism'
                ],
                correct: 1
            }
        ],
        timeLimit: 15, // minutes
        passingScore: 70
    },
    {
        id: 'quiz_2',
        title: 'Communication Excellence',
        description: 'Assess your communication skills and best practices.',
        category: 'communication',
        difficulty: 'intermediate',
        questions: [
            {
                id: 'q1',
                question: 'What is active listening?',
                options: [
                    'Listening while doing other tasks',
                    'Fully concentrating on the speaker',
                    'Interrupting to ask questions',
                    'Taking notes while listening'
                ],
                correct: 1
            },
            {
                id: 'q2',
                question: 'Which communication barrier is most common in virtual meetings?',
                options: [
                    'Language differences',
                    'Technical issues',
                    'Cultural differences',
                    'Time zone conflicts'
                ],
                correct: 1
            },
            {
                id: 'q3',
                question: 'What is the 7-38-55 rule in communication?',
                options: [
                    'Words, tone, body language percentages',
                    'Time allocation for presentations',
                    'Email response time guidelines',
                    'Meeting duration recommendations'
                ],
                correct: 0
            }
        ],
        timeLimit: 20,
        passingScore: 75
    },
    {
        id: 'quiz_3',
        title: 'Team Management',
        description: 'Evaluate your team management and collaboration skills.',
        category: 'management',
        difficulty: 'advanced',
        questions: [
            {
                id: 'q1',
                question: 'What is the most effective way to handle team conflict?',
                options: [
                    'Ignore it and hope it resolves',
                    'Address it directly and constructively',
                    'Let team members handle it themselves',
                    'Remove conflicting members'
                ],
                correct: 1
            },
            {
                id: 'q2',
                question: 'Which factor is most important for team performance?',
                options: [
                    'Individual skills',
                    'Team cohesion',
                    'Resource availability',
                    'Management oversight'
                ],
                correct: 1
            },
            {
                id: 'q3',
                question: 'What is psychological safety in teams?',
                options: [
                    'Physical workplace safety',
                    'Freedom to express ideas without fear',
                    'Job security guarantees',
                    'Mental health benefits'
                ],
                correct: 1
            }
        ],
        timeLimit: 25,
        passingScore: 80
    }
];

// Initialize the quiz system
document.addEventListener('DOMContentLoaded', function() {
    // Quiz system initializing
    
    // Ensure modals are hidden on page load
    const quizModal = document.getElementById('quizModal');
    const resultsModal = document.getElementById('quizResultsModal');
    const manageTagsModal = document.getElementById('manageTagsModal');
    const imageModal = document.getElementById('imageModal');
    
    if (quizModal) {
        quizModal.classList.remove('show');
        // Quiz modal hidden on load
    }
    if (resultsModal) {
        resultsModal.classList.remove('show');
        // console.log('✅ Results modal hidden on load');
    }
    if (manageTagsModal) {
        manageTagsModal.classList.remove('show');
        // console.log('✅ Manage tags modal hidden on load');
    }
    if (imageModal) {
        imageModal.style.display = 'none';
        imageModal.classList.remove('show');
        // Force close any open image modal
        closeImageModal();
        // console.log('✅ Image modal hidden on load');
    }
    
    // Load data from database/localStorage or use sample data
    loadQuizData().then(() => {
        // After quizzes are loaded, render them
        renderAvailableQuizzes();
    }).catch(error => {
        console.error('Failed to load quiz data:', error);
        renderAvailableQuizzes();
    });
    loadQuizResults();
    
    // Setup event listeners
    setupNavigation();
    setupQuizFilters();
    setupQuizActions();
    setupModalEvents();
    setupQuizForm();
    
    // Initialize tag display
    updateTagDisplay();
    
    // Render initial content (renderAvailableQuizzes will be called after loadQuizData completes)
    renderQuizResults();
    
    // console.log('✅ Quiz system initialized successfully');
});

// Load quiz data
async function loadQuizData() {
    // Try to load from database first
    if (window.dbService && window.dbService.isConfigured) {
        try {
            console.log('📚 Loading quizzes from database...');
            // Load all active quizzes (will be filtered by assignment in renderAvailableQuizzes for non-admins)
            currentQuizzes = await window.dbService.getQuizzes('active'); // Load active quizzes
            
            // Clean up any malformed quiz data
            const originalLength = currentQuizzes.length;
            currentQuizzes = currentQuizzes.filter(quiz => {
                // Remove quizzes with null or missing essential fields
                if (!quiz.title || quiz.title === 'null' || 
                    quiz.category === null || quiz.category === 'null' ||
                    quiz.difficulty === null || quiz.difficulty === 'null' ||
                    !quiz.questions || !Array.isArray(quiz.questions)) {
                    console.log('🗑️ Removing malformed quiz:', quiz);
                    return false;
                }
                return true;
            });
            
            if (currentQuizzes.length > 0) {
                // Sync to localStorage for offline access
                saveQuizData();
                console.log('📚 Loaded quizzes from database:', currentQuizzes.length);
                return; // Successfully loaded from database
            } else {
                console.log('📚 No quizzes found in database, checking localStorage...');
            }
        } catch (error) {
            console.error('❌ Failed to load quizzes from database:', error);
            console.log('📚 Falling back to localStorage...');
        }
    }
    
    // Fallback to localStorage if database fails or is not configured
    const savedQuizzes = localStorage.getItem('quizzes');
    console.log('🔍 Loading quiz data from localStorage:', savedQuizzes);
    
    if (savedQuizzes) {
        currentQuizzes = JSON.parse(savedQuizzes);
        console.log('🔍 Parsed quizzes from localStorage:', currentQuizzes.length, currentQuizzes);
        
        // Clean up any malformed quiz data
        const originalLength = currentQuizzes.length;
        currentQuizzes = currentQuizzes.filter(quiz => {
            // Remove quizzes with null or missing essential fields
            // Allow empty strings for category and difficulty, but not null or 'null' string
            if (!quiz.title || quiz.title === 'null' || 
                quiz.category === null || quiz.category === 'null' ||
                quiz.difficulty === null || quiz.difficulty === 'null') {
                console.log('🗑️ Removing malformed quiz:', quiz);
                return false;
            }
            return true;
        });
        
        // Save cleaned data back to localStorage if any were removed
        if (currentQuizzes.length !== originalLength) {
            saveQuizData();
            console.log(`🧹 Cleaned up ${originalLength - currentQuizzes.length} malformed quizzes`);
        }
        
        console.log('📚 Loaded quizzes from localStorage:', currentQuizzes.length);
    } else {
        currentQuizzes = [...sampleQuizzes];
        saveQuizData();
        console.log('📚 Using sample quizzes:', currentQuizzes.length);
    }
}

// Save quiz data
function saveQuizData() {
    try {
        console.log('🔍 Saving quiz data:', currentQuizzes.length, currentQuizzes);
        localStorage.setItem('quizzes', JSON.stringify(currentQuizzes));
        console.log('✅ Quiz data saved successfully');
    } catch (error) {
        console.error('❌ Failed to save quiz data:', error);
        if (error.name === 'QuotaExceededError') {
            // Clear old quiz results to free up space
            localStorage.removeItem('quizResults');
            console.log('🧹 Cleared old quiz results to free up space');
            
            try {
                localStorage.setItem('quizzes', JSON.stringify(currentQuizzes));
                console.log('✅ Quiz data saved after clearing old data');
                showToast('warning', 'Storage Cleared', 'Old quiz results were cleared to make space. Quiz saved successfully.');
            } catch (retryError) {
                console.error('❌ Still failed to save after clearing:', retryError);
                showToast('error', 'Storage Full', 'Quiz data is too large. Please clear browser data or contact support.');
            }
        } else {
            showToast('error', 'Save Error', 'Failed to save quiz. Please try again.');
        }
    }
}

// Load quiz results
async function loadQuizResults() {
    try {
        // Prefer database when available
        if (window.dbService && window.dbService.isConfigured) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userId = currentUser?.id || currentUser?.username || null;
            const dbResults = await window.dbService.getQuizResults?.(userId);
            if (Array.isArray(dbResults) && dbResults.length >= 0) {
                quizResults = dbResults;
                // Keep a lightweight cache for offline read
                try { localStorage.setItem('quizResults', JSON.stringify(quizResults)); } catch (_) {}
                return;
            }
        }
    } catch (err) {
        console.warn('loadQuizResults DB fallback:', err);
    }
    // Fallback to localStorage
    const savedResults = localStorage.getItem('quizResults');
    quizResults = savedResults ? JSON.parse(savedResults) : [];
}

// Clear all data function (for storage issues)
function clearAllData() {
    if (confirm('This will delete all quizzes and results. Are you sure?')) {
        localStorage.removeItem('quizzes');
        localStorage.removeItem('quizResults');
        currentQuizzes = [...sampleQuizzes];
        quizResults = [];
        saveQuizData();
        renderAvailableQuizzes();
        renderQuizResults();
        showToast('success', 'Data Cleared', 'All data has been cleared and reset to defaults.');
    }
}

// Save quiz results
async function saveQuizResults() {
    // Always keep cache updated
    try { localStorage.setItem('quizResults', JSON.stringify(quizResults)); } catch (_) {}
    // Sync to database when available
    try {
        if (window.dbService && window.dbService.isConfigured) {
            if (typeof window.dbService.saveQuizResults === 'function') {
                await window.dbService.saveQuizResults(quizResults);
            } else if (typeof window.dbService.saveQuizResult === 'function') {
                for (const r of quizResults) {
                    await window.dbService.saveQuizResult(r);
                }
            }
        }
    } catch (err) {
        console.warn('saveQuizResults DB sync failed (cached locally):', err);
    }
}

// Setup navigation - Now handled by TabsComponent
function setupNavigation() {
    // Tab navigation is now handled by TabsComponent
    // This function is kept for compatibility but does nothing
    // console.log('Tab navigation handled by TabsComponent');
}

// Show content section - Now handled by TabsComponent
function showContentSection(sectionId) {
    // Content switching is now handled by TabsComponent
    // This function is kept for compatibility but does nothing
    // console.log('Content switching handled by TabsComponent');
}

// Setup quiz filters
function setupQuizFilters() {
    const searchInput = document.getElementById('quizSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(renderAvailableQuizzes, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', renderAvailableQuizzes);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', renderAvailableQuizzes);
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Render available quizzes
async function renderAvailableQuizzes() {
    const grid = document.getElementById('quizzesGrid');
    if (!grid) {
        console.error('❌ quizzesGrid element not found!');
        return;
    }
    
    console.log('🔍 Current quizzes:', currentQuizzes.length, currentQuizzes);
    
    // Get current user to check if they're admin or get their assignments
    let currentUser = null;
    let assignedQuizIds = [];
    
    try {
        // Get current user from localStorage
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
        }
        
        // Load quiz assignments to get due dates (for both admin and non-admin)
        if (currentUser && window.dbService && window.dbService.isConfigured) {
            try {
                // Get user ID from database
                const users = await window.dbService.getUsers();
                console.log('📋 All users from database:', users);
                console.log('📋 Current user from localStorage:', currentUser);
                
                const user = users.find(u => u.username === currentUser.username || u.email === currentUser.email);
                console.log('📋 Found user in database:', user);
                
                if (user && user.id) {
                    // Get assigned quizzes for this user (for due dates and filtering)
                    const assignments = await window.dbService.getQuizAssignments(user.id);
                    console.log('📋 Raw assignments from database:', assignments);
                    
                    // Store assignments in a map for easy lookup (for due dates)
                    const assignmentsMap = new Map();
                    assignments.forEach(assignment => {
                        const quizId = String(assignment.quiz_id || '');
                        if (quizId) {
                            assignmentsMap.set(quizId, assignment);
                        }
                    });
                    // Store in a global variable for later use
                    window.quizAssignmentsMap = assignmentsMap;
                    
                    // Only filter by assignment if not admin
                    const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'admin';
                    if (!isAdmin) {
                        assignedQuizIds = assignments.map(a => {
                            // Ensure quiz_id is a string for comparison
                            const quizId = String(a.quiz_id || a.quizId || '');
                            console.log('📋 Mapped quiz_id:', quizId);
                            return quizId;
                        }).filter(id => id); // Remove any empty IDs
                        console.log('📋 Assigned quiz IDs for user:', assignedQuizIds);
                    }
                    console.log('📋 Available quiz IDs in localStorage:', currentQuizzes.map(q => q.id));
                } else {
                    console.warn('⚠️ User not found in database for:', currentUser.username);
                }
            } catch (error) {
                console.error('❌ Failed to load quiz assignments:', error);
            }
        }
    } catch (e) {
        console.warn('Failed to get current user:', e);
    }
    
    const searchTerm = document.getElementById('quizSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';
    
    // Filter quizzes - if not admin, only show assigned quizzes
    let quizzesToShow = currentQuizzes;
    const isAdmin = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'admin');
    
    if (!isAdmin) {
        // For non-admin users, only show assigned quizzes
        // If we have assignments but no quizzes loaded, try to load specific quizzes from database
        if (assignedQuizIds.length > 0 && currentQuizzes.length === 0 && window.dbService && window.dbService.isConfigured) {
            console.log('📚 Loading assigned quizzes individually from database...');
            try {
                for (const quizId of assignedQuizIds) {
                    const quiz = await window.dbService.getQuiz(quizId);
                    if (quiz) {
                        currentQuizzes.push(quiz);
                        console.log('✅ Loaded assigned quiz from database:', quiz.title);
                    } else {
                        console.log('⚠️ Quiz not found in database:', quizId);
                    }
                }
            } catch (error) {
                console.error('❌ Failed to load assigned quizzes:', error);
            }
        }
        
        // Ensure both quiz IDs and assigned IDs are strings for proper comparison
        const assignedIdsSet = new Set(assignedQuizIds.map(id => String(id)));
        quizzesToShow = currentQuizzes.filter(quiz => {
            const quizIdStr = String(quiz.id || '');
            const isAssigned = assignedIdsSet.has(quizIdStr);
            if (!isAssigned) {
                console.log(`❌ Quiz "${quiz.title}" (ID: ${quizIdStr}) not in assigned list`);
            } else {
                console.log(`✅ Quiz "${quiz.title}" (ID: ${quizIdStr}) is assigned`);
            }
            return isAssigned;
        });
        console.log('📋 Filtered to assigned quizzes only:', quizzesToShow.length, 'out of', currentQuizzes.length);
        console.log('📋 Assigned quiz IDs set:', Array.from(assignedIdsSet));
        console.log('📋 Quizzes to show:', quizzesToShow.map(q => ({ id: q.id, title: q.title })));
        
        // If user has assignments but no quizzes match, show a helpful message
        if (assignedQuizIds.length > 0 && quizzesToShow.length === 0) {
            console.warn('⚠️ User has assigned quizzes but they are not available');
        }
    }
    
    // Filter quizzes
    const filteredQuizzes = quizzesToShow.filter(quiz => {
        const title = quiz.title || '';
        const description = quiz.description || '';
        const category = quiz.category || '';
        const difficulty = quiz.difficulty || '';
        const tags = quiz.tags || [];
        
        const matchesSearch = title.toLowerCase().includes(searchTerm) ||
                            description.toLowerCase().includes(searchTerm) ||
                            tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesDifficulty = !difficultyFilter || difficulty === difficultyFilter;
        
        return matchesSearch && matchesCategory && matchesDifficulty;
    });
    
    console.log('🔍 Filtered quizzes:', filteredQuizzes.length, filteredQuizzes);
    
    // Render quiz cards
    let quizCardsHtml = filteredQuizzes.map(quiz => {
        // Check if this quiz has an assignment with a due date
        let dueDateHtml = '';
        if (window.quizAssignmentsMap) {
            const assignment = window.quizAssignmentsMap.get(String(quiz.id));
            if (assignment && assignment.due_date) {
                const dueDate = new Date(assignment.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDateFormatted = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const isOverdue = dueDate < today;
                const isDueSoon = dueDate.getTime() - today.getTime() <= 3 * 24 * 60 * 60 * 1000; // Within 3 days
                
                const dueDateClass = isOverdue ? 'due-date overdue' : isDueSoon ? 'due-date due-soon' : 'due-date';
                const dueDateIcon = isOverdue ? 'fa-exclamation-circle' : 'fa-calendar-alt';
                
                dueDateHtml = `
                    <div class="${dueDateClass}">
                        <i class="fas ${dueDateIcon}"></i>
                        <span>Due: ${dueDateFormatted}</span>
                    </div>
                `;
            }
        }
        
        return `
        <div class="quiz-card">
            <div class="quiz-header">
                <div>
                    <h3 class="quiz-title">${quiz.title}</h3>
                    <span class="quiz-category">${quiz.category}</span>
                </div>
                <span class="quiz-difficulty difficulty-${quiz.difficulty}">${quiz.difficulty}</span>
            </div>
            ${dueDateHtml}
            <p class="quiz-description">${quiz.description}</p>
            ${quiz.tags && quiz.tags.length > 0 ? `
                <div class="quiz-tags-simple">
                    ${quiz.tags.map(tag => `<span class="quiz-tag-simple">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="quiz-meta">
                <span><i class="fas fa-question-circle"></i> ${quiz.questions.length} questions</span>
                ${quiz.timeLimit ? `<span><i class="fas fa-clock"></i> ${quiz.timeLimit} min</span>` : ''}
                <span><i class="fas fa-percentage"></i> ${quiz.passingScore}% to pass</span>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-primary" onclick="startQuiz('${quiz.id}')">
                    <i class="fas fa-play"></i>
                    Start Quiz
                </button>
                <button class="btn btn-warning" onclick="editQuiz('${quiz.id}')" data-permission="edit_quizzes">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="btn btn-danger" onclick="deleteQuiz('${quiz.id}')" data-permission="delete_quizzes">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `;
    }).join('');
    
    // Show helpful message if user has assignments but no quizzes available
    if (!isAdmin && assignedQuizIds.length > 0 && filteredQuizzes.length === 0) {
        quizCardsHtml = `
            <div style="text-align: center; padding: 3rem; color: var(--medium-gray);">
                <i class="fas fa-clipboard-question" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>Assigned Quizzes Not Available</h3>
                <p>You have ${assignedQuizIds.length} quiz assignment(s), but the quiz content is not currently available.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Please contact your administrator or try refreshing the page.</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.7;">Assigned Quiz ID(s): ${assignedQuizIds.join(', ')}</p>
            </div>
        `;
    }
    
    grid.innerHTML = quizCardsHtml;
    
    // Apply permission-based visibility after rendering
    if (window.permissionManager) {
        window.permissionManager.applyElementVisibility();
    }
}

// Start quiz
function startQuiz(quizId) {
    const quiz = currentQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    currentQuiz = quiz;
    currentQuestionIndex = 0;
    userAnswers = [];
    quizStartTime = Date.now(); // Track start time
    
    // Clear any existing timer
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }
    
    // Open quiz modal
    openQuizModal();
    renderCurrentQuestion();
    
    // Start timer if time limit exists
    if (quiz.timeLimit && quiz.timeLimit > 0) {
        startQuizTimer(quiz.timeLimit);
    }
}

// Open quiz modal
function openQuizModal() {
    const modal = document.getElementById('quizModal');
    const title = document.getElementById('quizModalTitle');
    const totalQuestions = document.getElementById('totalQuestions');
    
    if (modal && title && totalQuestions) {
        title.textContent = currentQuiz.title;
        totalQuestions.textContent = currentQuiz.questions.length;
        modal.classList.add('show');
    }
}

// Close quiz modal
function closeQuizModal() {
    const modal = document.getElementById('quizModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Clear timer
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }
    
    // Hide timer display
    const timerElement = document.getElementById('quizTimer');
    if (timerElement) {
        timerElement.style.display = 'none';
    }
}

// Start quiz timer
function startQuizTimer(timeLimitMinutes) {
    timeRemaining = timeLimitMinutes * 60; // Convert to seconds
    
    const timerElement = document.getElementById('quizTimer');
    const timerDisplay = document.getElementById('timerDisplay');
    
    if (!timerElement || !timerDisplay) return;
    
    // Show timer
    timerElement.style.display = 'flex';
    
    // Update display immediately
    updateTimerDisplay();
    
    // Start countdown
    quizTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // If time runs out, auto-submit quiz
        if (timeRemaining <= 0) {
            clearInterval(quizTimer);
            quizTimer = null;
            
            // Show warning
            showToast('warning', 'Time Up!', 'Your time has expired. The quiz will be submitted automatically.');
            
            // Auto-submit after a brief delay
            setTimeout(() => {
                submitQuiz();
            }, 1000);
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) return;
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    timerDisplay.textContent = formattedTime;
    
    // Add warning class when less than 1 minute remaining
    const timerElement = document.getElementById('quizTimer');
    if (timerElement) {
        if (timeRemaining <= 60) {
            timerElement.classList.add('timer-warning');
        } else {
            timerElement.classList.remove('timer-warning');
        }
        
        // Add critical class when less than 30 seconds
        if (timeRemaining <= 30) {
            timerElement.classList.add('timer-critical');
        } else {
            timerElement.classList.remove('timer-critical');
        }
    }
}

// Render current question
function renderCurrentQuestion() {
    const questionContainer = document.getElementById('quizQuestion');
    const currentQuestion = document.getElementById('currentQuestion');
    
    if (!questionContainer || !currentQuestion) return;
    
    const question = currentQuiz.questions[currentQuestionIndex];
    currentQuestion.textContent = currentQuestionIndex + 1;
    
    // Rendering question
    
    const questionPoints = question.points || 1;
    let questionHtml = `<div class="question-text">${question.question}</div>`;
    
    // Add point value display
    questionHtml += `<div class="question-points">(${questionPoints} point${questionPoints !== 1 ? 's' : ''})</div>`;
    
    // Add question image if it exists and is valid
    if (question.image && question.image.trim() !== '' && question.image !== 'null' && question.image !== 'undefined') {
        // Additional validation for image URL
        if (question.image.startsWith('http') || question.image.startsWith('data:') || question.image.startsWith('/')) {
            questionHtml += `<div class="question-image"><img src="${question.image}" alt="Question Image" class="question-image-display" onclick="event.stopPropagation(); openImageModal('${question.image}')"></div>`;
        }
    }
    
    // Handle different question types
    switch(question.type || 'multiple_choice') {
        case 'multiple_choice':
            questionHtml += `
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <div class="quiz-option" onclick="selectAnswer(${index}, event)">
                            <input type="radio" name="answer" value="${index}" id="option_${index}">
                            <label for="option_${index}">
                                ${typeof option === 'string' ? option : option.text}
                                ${(() => {
                                    if (typeof option !== 'object' || !option || !option.image) return '';
                                    const imgUrl = option.image;
                                    if (!imgUrl || typeof imgUrl !== 'string' || imgUrl.trim() === '' || imgUrl === 'null' || imgUrl === 'undefined') return '';
                                    // Additional check: ensure it's a valid URL or data URL
                                    if (!imgUrl.startsWith('http') && !imgUrl.startsWith('data:') && !imgUrl.startsWith('/')) return '';
                                    return `<img src="${imgUrl}" alt="Option Image" class="option-image" onerror="this.style.display='none'" onclick="event.stopPropagation(); openImageModal('${imgUrl}')">`;
                                })()}
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'multiple_answer':
            questionHtml += `
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <div class="quiz-option" onclick="selectMultipleAnswer(${index}, event)">
                            <input type="checkbox" name="answer" value="${index}" id="option_${index}">
                            <label for="option_${index}">
                                ${typeof option === 'string' ? option : option.text}
                                ${(() => {
                                    if (typeof option !== 'object' || !option || !option.image) return '';
                                    const imgUrl = option.image;
                                    if (!imgUrl || typeof imgUrl !== 'string' || imgUrl.trim() === '' || imgUrl === 'null' || imgUrl === 'undefined') return '';
                                    // Additional check: ensure it's a valid URL or data URL
                                    if (!imgUrl.startsWith('http') && !imgUrl.startsWith('data:') && !imgUrl.startsWith('/')) return '';
                                    return `<img src="${imgUrl}" alt="Option Image" class="option-image" onerror="this.style.display='none'" onclick="event.stopPropagation(); openImageModal('${imgUrl}')">`;
                                })()}
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'short_answer':
            questionHtml += `
                <div class="short-answer-container">
                    <input type="text" id="shortAnswerInput" placeholder="Type your answer here..." class="short-answer-input">
                </div>
            `;
            break;
    }
    
    questionContainer.innerHTML = questionHtml;
    
    // Update navigation buttons
    updateQuizNavigation();
}

// Select answer (single choice)
function selectAnswer(optionIndex, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Remove previous selection
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    const selectedOption = document.querySelectorAll('.quiz-option')[optionIndex];
    if (selectedOption) {
        selectedOption.classList.add('selected');
        const radio = selectedOption.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
        }
    }
    
    // Store answer
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update navigation buttons
    updateQuizNavigation();
}

// Select multiple answers
function selectMultipleAnswer(optionIndex, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const selectedOption = document.querySelectorAll('.quiz-option')[optionIndex];
    const checkbox = selectedOption ? selectedOption.querySelector('input[type="checkbox"]') : null;
    
    if (selectedOption && checkbox) {
        checkbox.checked = !checkbox.checked;
        
        if (checkbox.checked) {
            selectedOption.classList.add('selected');
        } else {
            selectedOption.classList.remove('selected');
        }
        
        // Store selected answers
        const selectedAnswers = [];
        document.querySelectorAll('.quiz-option input[type="checkbox"]:checked').forEach(cb => {
            selectedAnswers.push(parseInt(cb.value));
        });
        
        userAnswers[currentQuestionIndex] = selectedAnswers;
        
        // Update navigation buttons
        updateQuizNavigation();
    }
}

// Handle short answer input
function handleShortAnswer() {
    const input = document.getElementById('shortAnswerInput');
    if (input) {
        userAnswers[currentQuestionIndex] = input.value.trim();
        updateQuizNavigation();
    }
}

// Update quiz navigation
function updateQuizNavigation() {
    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');
    const submitBtn = document.getElementById('submitQuiz');
    
    if (prevBtn) {
        prevBtn.disabled = currentQuestionIndex === 0;
    }
    
    if (nextBtn && submitBtn) {
        const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;
        nextBtn.style.display = isLastQuestion ? 'none' : 'inline-flex';
        submitBtn.style.display = isLastQuestion ? 'inline-flex' : 'none';
    }
    
    // Add event listener for short answer input
    const shortAnswerInput = document.getElementById('shortAnswerInput');
    if (shortAnswerInput) {
        shortAnswerInput.addEventListener('input', handleShortAnswer);
    }
}

// Setup quiz actions
function setupQuizActions() {
    // Previous question
    const prevBtn = document.getElementById('prevQuestion');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderCurrentQuestion();
            }
        });
    }
    
    // Next question
    const nextBtn = document.getElementById('nextQuestion');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentQuestionIndex < currentQuiz.questions.length - 1) {
                currentQuestionIndex++;
                renderCurrentQuestion();
            }
        });
    }
    
    // Submit quiz
    const submitBtn = document.getElementById('submitQuiz');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitQuiz);
    }
}

// Submit quiz
async function submitQuiz() {
    if (!currentQuiz) return;
    
    // Clear timer if running
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }
    
    // Calculate score using point values
    let earnedPoints = 0;
    let totalPoints = 0;
    
    currentQuiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const questionType = question.type || 'multiple_choice';
        const questionPoints = question.points || 1;
        
        totalPoints += questionPoints;
        
        let isCorrect = false;
        
        switch(questionType) {
            case 'multiple_choice':
                if (userAnswer === question.correct) {
                    isCorrect = true;
                }
                break;
                
            case 'multiple_answer':
                if (Array.isArray(userAnswer) && Array.isArray(question.correct)) {
                    // Check if all correct answers are selected and no incorrect ones
                    const userSet = new Set(userAnswer);
                    const correctSet = new Set(question.correct);
                    if (userSet.size === correctSet.size && [...userSet].every(val => correctSet.has(val))) {
                        isCorrect = true;
                    }
                }
                break;
                
            case 'short_answer':
                if (typeof userAnswer === 'string' && userAnswer.trim()) {
                    const userAnswerLower = userAnswer.toLowerCase().trim();
                    const correctAnswersLower = question.correctAnswers.map(ans => ans.toLowerCase().trim());
                    if (correctAnswersLower.includes(userAnswerLower)) {
                        isCorrect = true;
                    }
                }
                break;
        }
        
        if (isCorrect) {
            earnedPoints += questionPoints;
        }
    });
    
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= currentQuiz.passingScore;
    
    // Get current user
    const currentUsername = localStorage.getItem('username') || 'unknown';
    
    // Create result object
    const result = {
        id: 'result_' + Date.now(),
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        username: currentUsername,
        score: score,
        earnedPoints: earnedPoints,
        totalPoints: totalPoints,
        correctAnswers: Math.round(earnedPoints), // For backward compatibility
        totalQuestions: currentQuiz.questions.length, // For backward compatibility
        passed: passed,
        dateTaken: new Date().toISOString(),
        completedAt: new Date().toISOString(), // For compatibility with admin overview
        answers: [...userAnswers],
        timeSpent: currentQuiz.timeLimit ? (currentQuiz.timeLimit * 60) - timeRemaining : (quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0) // Calculate time spent (from timer or elapsed time)
    };
    // keep last result available for review mode
    try { window.__lastResult = result; } catch(_) {}
    
    // Save result to localStorage
    quizResults.push(result);
    saveQuizResults();
    
    // Also update the quiz assignment in the database with score and passed status
    try {
        if (window.dbService && window.dbService.isConfigured) {
            // Get current user from localStorage
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const currentUser = JSON.parse(userStr);
                // Get user ID from database
                const users = await window.dbService.getUsers();
                const user = users.find(u => u.username === currentUser.username || u.email === currentUser.email);
                
                if (user && user.id) {
                    // Find the quiz assignment for this user and quiz
                    const assignments = await window.dbService.getQuizAssignments(user.id);
                    const assignment = assignments.find(a => a.quiz_id === currentQuiz.id);
                    
                    if (assignment) {
                        // Update the assignment with score and passed status
                        await window.dbService.updateQuizAssignment(assignment.id, {
                            score: score,
                            passed: passed,
                            status: 'completed',
                            updated_at: new Date().toISOString()
                        });
                        console.log('✅ Quiz score saved to database:', { quizId: currentQuiz.id, score, passed });
                    } else {
                        console.warn('⚠️ Quiz assignment not found for user:', user.username, 'quiz:', currentQuiz.id);
                    }
                }
            }
        }
    } catch (error) {
        console.error('❌ Failed to save quiz score to database:', error);
        // Don't show error to user as localStorage save succeeded
    }
    
    // Close quiz modal
    closeQuizModal();
    
    // Show results
    showQuizResults(result);
    
    // Show success message
    showToast('success', 'Quiz Completed!', `You scored ${score}% and ${passed ? 'passed' : 'did not pass'} the quiz.`);
}

// Format time in seconds to MM:SS format
function formatTime(seconds) {
    if (!seconds || seconds <= 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Show quiz results
function showQuizResults(result) {
    const modal = document.getElementById('quizResultsModal');
    const content = document.getElementById('resultsContent');
    
    if (!modal || !content) return;
    
    const quiz = currentQuizzes.find(q => q.id === result.quizId);
    if (!quiz) return;
    
    const timeSpentFormatted = formatTime(result.timeSpent || 0);
    
    content.innerHTML = `
        <div class="score-display">${result.score}%</div>
        <div class="score-text">${result.passed ? 'Congratulations! You passed!' : 'Keep studying! You can do better.'}</div>
        <div class="quiz-time-info">
            <i class="fas fa-clock"></i>
            <span>Time Taken: <strong>${timeSpentFormatted}</strong></span>
        </div>
        <div class="results-actions" style="display:flex;gap:.5rem;flex-wrap:wrap;margin:.75rem 0 1rem;justify-content:flex-start;">
            <button class="btn btn-secondary" id="reviewAnswersBtn"><i class="fas fa-eye"></i> Review Answers</button>
            <button class="btn btn-primary" id="retakeQuizBtn"><i class="fas fa-redo"></i> Retake Quiz</button>
            <button class="btn" id="closeResults">Close</button>
        </div>
        
        <div class="results-breakdown">
            <h3>Question Breakdown</h3>
            ${quiz.questions.map((question, index) => {
                const userAnswer = result.answers[index];
                const questionType = question.type || 'multiple_choice';
                let isCorrect = false;
                let userAnswerText = 'Not answered';
                let correctAnswerText = '';
                
                switch(questionType) {
                    case 'multiple_choice':
                        isCorrect = userAnswer === question.correct;
                        userAnswerText = userAnswer !== undefined ? 
                            (typeof question.options[userAnswer] === 'string' ? question.options[userAnswer] : question.options[userAnswer]?.text || 'Invalid answer') : 'Not answered';
                        correctAnswerText = typeof question.options[question.correct] === 'string' ? 
                            question.options[question.correct] : question.options[question.correct]?.text || 'Invalid answer';
                        break;
                        
                    case 'multiple_answer':
                        if (Array.isArray(userAnswer) && Array.isArray(question.correct)) {
                            const userSet = new Set(userAnswer);
                            const correctSet = new Set(question.correct);
                            isCorrect = userSet.size === correctSet.size && [...userSet].every(val => correctSet.has(val));
                        }
                        userAnswerText = Array.isArray(userAnswer) ? 
                            userAnswer.map(i => typeof question.options[i] === 'string' ? question.options[i] : question.options[i]?.text || 'Invalid answer').join(', ') : 'Not answered';
                        correctAnswerText = question.correct.map(i => typeof question.options[i] === 'string' ? question.options[i] : question.options[i]?.text || 'Invalid answer').join(', ');
                        break;
                        
                    case 'short_answer':
                        if (typeof userAnswer === 'string' && userAnswer.trim()) {
                            const userAnswerLower = userAnswer.toLowerCase().trim();
                            const correctAnswersLower = question.correctAnswers.map(ans => ans.toLowerCase().trim());
                            isCorrect = correctAnswersLower.includes(userAnswerLower);
                        }
                        userAnswerText = userAnswer || 'Not answered';
                        correctAnswerText = question.correctAnswers.join(', ');
                        break;
                }
                
                return `
                    <div class="result-item">
                        <div class="result-question">
                            <strong>Q${index + 1}:</strong> ${question.question}<br>
                            <small><strong>Type:</strong> ${questionType.replace('_', ' ').toUpperCase()}</small><br>
                            <small><strong>Your answer:</strong> ${userAnswerText}</small><br>
                            <small><strong>Correct answer:</strong> ${correctAnswerText}</small>
                        </div>
                        <span class="result-status ${isCorrect ? 'result-correct' : 'result-incorrect'}">
                            ${isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    modal.classList.add('show');

    // Wire review/retake actions
    const reviewBtn = document.getElementById('reviewAnswersBtn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => startReviewMode(result));
    }
    const retakeBtn = document.getElementById('retakeQuizBtn');
    if (retakeBtn) {
        // Hide retake if quiz disallows it
        const q = currentQuizzes.find(q => q.id === result.quizId);
        if (q && q.allowRetake === false) {
            retakeBtn.style.display = 'none';
        } else {
            retakeBtn.addEventListener('click', () => {
                closeResultsModal();
                if (currentQuiz?.id) startQuiz(currentQuiz.id);
            });
        }
    }
}

// Close results modal
function closeResultsModal() {
    const modal = document.getElementById('quizResultsModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Simple review mode (read-only per-question walkthrough)
let __reviewState = { active: false, data: null, index: 0 };

function startReviewMode(result) {
    __reviewState.active = true;
    __reviewState.data = buildReviewData(result);
    __reviewState.index = 0;
    renderReviewQuestion();
}

function buildReviewData(result) {
    const quiz = currentQuizzes.find(q => q.id === result.quizId) || { id: result.quizId, questions: [], allowRetake: true };
    const details = quiz.questions.map((q, i) => {
        const type = q.type || 'multiple_choice';
        const userAns = result.answers?.[i];
        return {
            question: q.question,
            type,
            options: q.options || [],
            correctIndex: type === 'multiple_choice' ? q.correct : undefined,
            correctIndexes: type === 'multiple_answer' ? (q.correct || []) : undefined,
            userIndex: type === 'multiple_choice' ? userAns : undefined,
            userIndexes: type === 'multiple_answer' ? (Array.isArray(userAns) ? userAns : []) : undefined,
            userText: type === 'short_answer' ? (userAns || '') : undefined,
            correctTexts: type === 'short_answer' ? (q.correctAnswers || []) : undefined
        };
    });
    return { quizId: quiz.id, allowRetake: quiz.allowRetake !== false, details };
}

function renderReviewQuestion() {
    if (!__reviewState.active || !__reviewState.data) return;
    const modal = document.getElementById('quizResultsModal');
    const content = document.getElementById('resultsContent');
    if (!modal || !content) return;
    const total = __reviewState.data.details.length;
    const d = __reviewState.data.details[__reviewState.index];
    if (!d) return;

    const optionRows = (d.options || []).map((opt, i) => {
        const text = typeof opt === 'string' ? opt : (opt?.text || '');
        const isCorrect = (Array.isArray(d.correctIndexes) ? d.correctIndexes.includes(i) : d.correctIndex === i);
        const isUser = (Array.isArray(d.userIndexes) ? d.userIndexes.includes(i) : d.userIndex === i);
        const cls = `quiz-option ${isCorrect ? 'selected' : ''} ${isUser && !isCorrect ? 'user-choice' : ''}`.trim();
        return `<div class="${cls}"><input type="checkbox" disabled ${isUser ? 'checked' : ''}><label>${text}</label></div>`;
    }).join('');

    let answerBlock = '';
    if (d.type === 'short_answer') {
        answerBlock = `<div style="margin-top:.5rem"><div><strong>Your answer:</strong> ${d.userText || 'Not answered'}</div><div><strong>Accepted:</strong> ${(d.correctTexts||[]).join(', ')}</div></div>`;
    }

    const allowRetake = __reviewState.data.allowRetake !== false;

    content.innerHTML = `
        <div class="results-summary" style="margin-bottom:.5rem;">
            <div class="summary-item"><div class="summary-content"><h3>Review Answers</h3><p>Question ${__reviewState.index + 1} of ${total}</p></div></div>
        </div>
        <div class="review-question">
            <div class="question-text">${d.question || ''}</div>
            ${d.type === 'short_answer' ? '' : `<div class="quiz-options">${optionRows}</div>`}
            ${answerBlock}
            <div style="margin-top:.5rem;color:var(--medium-gray)">Green = correct answer. Your choices are checked.</div>
        </div>
        <div class="results-actions" style="display:flex; gap:.5rem; flex-wrap:wrap; margin-top:1rem;">
            <button class="btn" id="prevReview" ${__reviewState.index===0?'disabled':''}>Previous</button>
            <button class="btn" id="nextReview" ${__reviewState.index===total-1?'disabled':''}>Next</button>
            <button class="btn btn-secondary" id="exitReview">Back to Results</button>
            ${allowRetake ? `<button class=\"btn btn-primary\" id=\"retakeFromReview\"><i class=\"fas fa-redo\"></i> Retake Quiz</button>` : ''}
        </div>
    `;

    const prev = document.getElementById('prevReview');
    const next = document.getElementById('nextReview');
    const exit = document.getElementById('exitReview');
    const retake = document.getElementById('retakeFromReview');
    if (prev) prev.onclick = () => { if (__reviewState.index>0) { __reviewState.index--; renderReviewQuestion(); } };
    if (next) next.onclick = () => { if (__reviewState.index<total-1) { __reviewState.index++; renderReviewQuestion(); } };
    if (exit) exit.onclick = () => { __reviewState.active = false; showQuizResults(buildResultFromReview()); };
    if (retake) retake.onclick = () => { __reviewState.active = false; closeResultsModal(); if (currentQuiz?.id) startQuiz(currentQuiz.id); };
}

function buildResultFromReview() {
    // Minimal shim to return to results using existing data
    return window.__lastResult || { score: 0, passed: false, timeSpent: 0, answers: [] };
}

// Expose for debugging if needed
window.startReviewMode = startReviewMode;

// Setup modal events
function setupModalEvents() {
    // Quiz modal close
    const quizModalClose = document.getElementById('quizModalClose');
    if (quizModalClose) {
        quizModalClose.addEventListener('click', closeQuizModal);
    }
    
    // Results modal close
    const resultsModalClose = document.getElementById('resultsModalClose');
    if (resultsModalClose) {
        resultsModalClose.addEventListener('click', closeResultsModal);
    }
    
    const closeResults = document.getElementById('closeResults');
    if (closeResults) {
        closeResults.addEventListener('click', closeResultsModal);
    }
    
    // Manage tags modal close
    const manageTagsClose = document.querySelector('.manage-tags-close');
    if (manageTagsClose) {
        manageTagsClose.addEventListener('click', closeManageTagsModal);
    }
    
    // Note: Removed outside click functionality
    // Modals can only be closed with their respective X buttons
}

// Render quiz results
function renderQuizResults() {
    // Wire export button if present
    const exportBtn = document.getElementById('exportResultsBtn');
    if (exportBtn) {
        exportBtn.onclick = exportQuizResultsToCSV;
    }
    // Update summary cards
    const totalQuizzes = document.getElementById('totalQuizzes');
    const averageScore = document.getElementById('averageScore');
    const bestScore = document.getElementById('bestScore');
    
    if (totalQuizzes) {
        totalQuizzes.textContent = quizResults.length;
    }
    
    if (averageScore && quizResults.length > 0) {
        const avg = quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length;
        averageScore.textContent = Math.round(avg) + '%';
    }
    
    if (bestScore && quizResults.length > 0) {
        const best = Math.max(...quizResults.map(result => result.score));
        bestScore.textContent = best + '%';
    }
    
    // Render analytics
    const analytics = document.getElementById('resultsAnalytics');
    if (analytics) {
        const total = quizResults.length;
        const passCount = quizResults.filter(r => r.passed).length;
        const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

        // Per-quiz stats
        const byQuiz = new Map();
        for (const r of quizResults) {
            const key = r.quizId + '|' + (r.quizTitle || '');
            if (!byQuiz.has(key)) byQuiz.set(key, []);
            byQuiz.get(key).push(r);
        }
        const rows = Array.from(byQuiz.entries()).map(([key, arr]) => {
            const [id, title] = key.split('|');
            const avg = Math.round(arr.reduce((s, x) => s + (x.score || 0), 0) / arr.length);
            const pr = Math.round((arr.filter(x => x.passed).length / arr.length) * 100);
            return `<tr><td>${escapeCsv(title || id)}</td><td>${arr.length}</td><td>${avg}%</td><td>${pr}%</td></tr>`;
        }).join('');

        // Category breakdown
        const byCategory = new Map();
        for (const r of quizResults) {
            const cat = getCategoryName(r.quizId) || 'Uncategorized';
            if (!byCategory.has(cat)) byCategory.set(cat, []);
            byCategory.get(cat).push(r);
        }
        const catRows = Array.from(byCategory.entries()).map(([cat, arr]) => {
            const avg = Math.round(arr.reduce((s, x) => s + (x.score || 0), 0) / arr.length);
            const pr = Math.round((arr.filter(x => x.passed).length / arr.length) * 100);
            return `<tr><td>${escapeCsv(cat)}</td><td>${arr.length}</td><td>${avg}%</td><td>${pr}%</td></tr>`;
        }).join('');

        // Time distribution (seconds) -> histogram + bell-like smooth curve (SVG)
        const buckets = [
            { label: '0–1', min: 0, max: 60 },
            { label: '1–3', min: 60, max: 180 },
            { label: '3–5', min: 180, max: 300 },
            { label: '5–10', min: 300, max: 600 },
            { label: '10+', min: 600, max: Infinity }
        ];
        const counts = buckets.map(b => quizResults.filter(r => (r.timeSpent||0) >= b.min && (r.timeSpent||0) < b.max).length);
        const chartSvg = buildBellChartSVG(buckets, counts);

        analytics.innerHTML = `
            <div class="summary-card"><div class="summary-icon"><i class="fas fa-check"></i></div><div class="summary-content"><h3>${passRate}%</h3><p>Overall Pass Rate</p></div></div>
            <div class="summary-card"><div class="summary-icon"><i class="fas fa-list-ul"></i></div><div class="summary-content"><h3>${byQuiz.size}</h3><p>Quizzes Taken</p></div></div>
            <div class="summary-card" style="grid-column: 1 / -1;">
                <div class="summary-content" style="width:100%">
                    <h3>Stats by Quiz</h3>
                    <table class="results-table" style="margin-top:.5rem;">
                        <thead><tr><th>Quiz</th><th>Attempts</th><th>Avg Score</th><th>Pass Rate</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="4" style="text-align:center; color:var(--medium-gray)">No results yet</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
            <div class="summary-card" style="grid-column: 1 / -1;">
                <div class="summary-content" style="width:100%">
                    <h3>By Category</h3>
                    <table class="results-table" style="margin-top:.5rem;">
                        <thead><tr><th>Category</th><th>Attempts</th><th>Avg Score</th><th>Pass Rate</th></tr></thead>
                        <tbody>${catRows || '<tr><td colspan="4" style="text-align:center; color:var(--medium-gray)">No results yet</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
            <div class="summary-card" style="grid-column: 1 / -1;">
                <div class="summary-content" style="width:100%">
                    <h3>Time Distribution</h3>
                    <div style="margin-top:.5rem; width:100%; overflow-x:auto;">
                        ${chartSvg}
                    </div>
                </div>
            </div>
        `;
    }

    // Render results table
    const tableBody = document.getElementById('resultsTableBody');
    if (tableBody) {
        tableBody.innerHTML = quizResults.map(result => {
            const date = new Date(result.dateTaken);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString();
            
            return `
                <tr>
                    <td>${result.quizTitle}</td>
                    <td>${getCategoryName(result.quizId)}</td>
                    <td>
                        <span class="score-badge ${getScoreClass(result.score)}">
                            ${result.score}%
                        </span>
                    </td>
                    <td>${dateStr}</td>
                    <td>${formatTime(result.timeSpent || 0)}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="viewResultDetails('${result.id}')">
                            <i class="fas fa-eye"></i>
                            View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // Render mobile results cards
    const mobileCards = document.getElementById('resultsCardsMobile');
    if (mobileCards) {
        mobileCards.innerHTML = quizResults.map(result => {
            const date = new Date(result.dateTaken);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString();
            
            return `
                <div class="results-card-mobile">
                    <div class="card-header">
                        <h3 class="quiz-name">${result.quizTitle}</h3>
                        <div class="quiz-score">${result.score}%</div>
                    </div>
                    <div class="card-details">
                        <div class="detail-item">
                            <span class="detail-label">Category</span>
                            <span class="detail-value">${getCategoryName(result.quizId)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date Taken</span>
                            <span class="detail-value">${dateStr}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Time Taken</span>
                            <span class="detail-value">${formatTime(result.timeSpent || 0)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Completed At</span>
                            <span class="detail-value">${dateStr} ${timeStr}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-secondary" onclick="viewResultDetails('${result.id}')">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Export quiz results to CSV
function exportQuizResultsToCSV() {
    if (!Array.isArray(quizResults) || quizResults.length === 0) {
        showToast && showToast('info', 'No Results', 'There are no results to export yet.');
        return;
    }
    const headers = ['Quiz Name','Category','Score','Passed','Date Taken','Time Taken'];
    const rows = quizResults.map(r => [
        escapeCsv(r.quizTitle || ''),
        escapeCsv(getCategoryName(r.quizId) || ''),
        r.score != null ? `${r.score}%` : '',
        r.passed ? 'Yes' : 'No',
        r.dateTaken ? new Date(r.dateTaken).toLocaleString() : '',
        formatTime(r.timeSpent || 0)
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function escapeCsv(value) {
    const s = String(value ?? '');
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
}

// =============== Question Bank ===============
async function initQuestionBankUI() {
    const listEl = document.getElementById('questionBankList');
    const searchEl = document.getElementById('questionBankSearch');
    const refreshBtn = document.getElementById('refreshQuestionBank');
    if (!listEl) return; // bank UI not on this page

    if (!QUESTION_BANK_ENABLED) {
        const sec = document.getElementById('questionBankSection');
        if (sec) sec.style.display = 'none';
        // Hide any existing save-to-bank buttons
        document.querySelectorAll('.save-to-bank').forEach(b => b.style.display = 'none');
        return; // do not initialize
    }

    const load = async (query = '') => {
        try {
            listEl.innerHTML = '<div style="padding: .75rem; color: var( --medium-gray );">Loading bank...</div>';
            let items = [];
            if (window.dbService && window.dbService.isConfigured) {
                items = query ? await window.dbService.searchBankQuestions(query) : await window.dbService.getBankQuestions();
            }
            renderQuestionBank(items || []);
        } catch (e) {
            console.error('Failed to load question bank:', e);
            listEl.innerHTML = '<div style="padding: .75rem; color: var(--danger);">Failed to load question bank.</div>';
        }
    };

    const renderQuestionBank = (items) => {
        if (!items.length) {
            listEl.innerHTML = '<div style="padding:.75rem;color:var(--medium-gray)">No questions found.</div>';
            return;
        }
        listEl.innerHTML = items.map(q => {
            const title = q.title || (q.question?.slice(0, 60) + (q.question?.length > 60 ? '…' : ''));
            const meta = [q.type || '', q.category || ''].filter(Boolean).join(' • ');
            return `
                <div class="bank-item" data-id="${q.id}" style="border:1px solid var(--border-color); border-radius:8px; padding:.75rem; margin-bottom:.5rem; background:#fff;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:.5rem;">
                        <div style="min-width:0;">
                            <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(title)}</div>
                            <div style="font-size:.85rem; color:var(--medium-gray)">${escapeHtml(meta)}</div>
                        </div>
                        <div style="display:flex; gap:.5rem; flex-shrink:0;">
                            <button type="button" class="btn btn-secondary" data-action="preview">Preview</button>
                            <button type="button" class="btn btn-primary" data-action="insert">Add</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Wire actions
        listEl.querySelectorAll('.bank-item').forEach(itemEl => {
            const id = itemEl.getAttribute('data-id');
            const item = items.find(x => x.id === id);
            if (!item) return;
            const previewBtn = itemEl.querySelector('[data-action="preview"]');
            const insertBtn = itemEl.querySelector('[data-action="insert"]');
            if (previewBtn) previewBtn.onclick = () => previewBankQuestion(item);
            if (insertBtn) insertBtn.onclick = () => addQuestionFromBank(item);
        });
    };

    if (searchEl) {
        searchEl.addEventListener('input', debounce(() => load(searchEl.value.trim()), 300));
    }
    if (refreshBtn) refreshBtn.addEventListener('click', () => load(searchEl?.value?.trim() || ''));
    load();
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
}

function previewBankQuestion(item) {
    // Simple preview via toast (avoid new modal for now)
    const text = `${item.type?.replace('_',' ')} • ${item.points || 1}pt\n${item.question}`;
    if (window.showToast) showToast('info', 'Preview Question', text);
}

function addQuestionFromBank(item) {
    // Create a new question at the end and populate from bank item
    addQuestion();
    const qNum = typeof questionCounter === 'number' ? questionCounter : document.querySelectorAll('.question-item').length;
    const questionElement = document.querySelector(`[data-question="${qNum}"]`);
    if (!questionElement) return;

    // Set text
    const textarea = questionElement.querySelector(`textarea[name="question_${qNum}"]`);
    if (textarea) textarea.value = item.question || '';
    // Type
    const typeSelect = questionElement.querySelector(`select[name="questionType_${qNum}"]`);
    if (typeSelect) typeSelect.value = item.type || 'multiple_choice';
    // Points
    const pointsInput = questionElement.querySelector(`input[name="questionPoints_${qNum}"]`);
    if (pointsInput) pointsInput.value = item.points || 1;

    // Build a compatible question object for fillAnswerOptions
    const q = {
        type: item.type || 'multiple_choice',
        options: Array.isArray(item.options) ? item.options : (item.options?.options || []),
        correct: Array.isArray(item.correct) || typeof item.correct === 'number' ? item.correct : [],
        correctAnswers: Array.isArray(item.correct) ? item.correct : []
    };
    setTimeout(() => fillAnswerOptions(qNum, q), 0);
}

async function saveQuestionToBank(questionNum) {
    try {
        if (!window.dbService || !window.dbService.isConfigured) {
            showToast && showToast('error', 'Not Configured', 'Database is not configured.');
            return;
        }
        const el = document.querySelector(`[data-question="${questionNum}"]`);
        if (!el) return;
        const type = el.querySelector(`select[name="questionType_${questionNum}"]`)?.value || 'multiple_choice';
        const points = parseInt(el.querySelector(`input[name="questionPoints_${questionNum}"]`)?.value || '1', 10) || 1;
        const question = el.querySelector(`textarea[name="question_${questionNum}"]`)?.value?.trim() || '';
        let options = [];
        let correct = null;
        if (type === 'multiple_choice' || type === 'multiple_answer') {
            const inputs = el.querySelectorAll('.answer-options-container .answer-option');
            options = Array.from(inputs).map((optEl, idx) => {
                const text = optEl.querySelector('input[type="text"]')?.value || '';
                return { text };
            });
            if (type === 'multiple_choice') {
                const checked = el.querySelector(`input[name="correct_${questionNum}"]:checked`);
                correct = checked ? parseInt(checked.value, 10) : 0;
            } else {
                const checked = el.querySelectorAll(`input[name="correct_${questionNum}[]"]:checked`);
                correct = Array.from(checked).map(c => parseInt(c.value, 10));
            }
        } else if (type === 'short_answer') {
            // For short answers, use a comma-separated syntax in question text like "answer1|answer2"
            // Or leave empty to save without correct texts
            const defaultAnswers = [];
            correct = defaultAnswers;
        }
        if (!question) {
            showToast && showToast('error', 'Validation', 'Question text is required.');
            return;
        }
        const payload = { title: null, question, type, options, correct, points };
        await window.dbService.createBankQuestion(payload);
        showToast && showToast('success', 'Saved', 'Question added to bank.');
        // refresh bank list if visible
        const searchEl = document.getElementById('questionBankSearch');
        if (searchEl) {
            const q = searchEl.value?.trim() || '';
            try { const items = q ? await window.dbService.searchBankQuestions(q) : await window.dbService.getBankQuestions();
                  const listEl = document.getElementById('questionBankList');
                  if (listEl) {
                      // reuse renderer by reinitializing
                      initQuestionBankUI();
                  }
            } catch (_) {}
        }
    } catch (e) {
        console.error('Failed to save to bank:', e);
        showToast && showToast('error', 'Error', 'Failed to save question to bank.');
    }
}

// Build a simple bell-like histogram SVG (bars + smoothed curve)
function buildBellChartSVG(buckets, counts) {
    const W = 640, H = 260, Pad = 30;
    const maxCount = Math.max(1, ...counts);
    const barW = (W - Pad * 2) / counts.length;
    // Bars
    const bars = counts.map((c, i) => {
        const h = (c / maxCount) * (H - Pad * 2);
        const x = Pad + i * barW + 6;
        const y = H - Pad - h;
        const label = buckets[i]?.label ?? '';
        return `<g>
          <rect x="${x}" y="${y}" width="${barW - 12}" height="${h}" fill="#dbeafe" stroke="#60a5fa"/>
          <title>${label} min: ${c} attempt${c===1?'':'s'}</title>
        </g>`;
    }).join('');
    // Smoothed curve through midpoints
    const points = counts.map((c, i) => {
        const x = Pad + i * barW + barW / 2;
        const y = H - Pad - (c / maxCount) * (H - Pad * 2);
        return { x, y };
    });
    const path = points.length > 1 ? smoothPath(points) : '';
    const curveDots = points.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#ef4444"><title>${buckets[i]?.label ?? ''} min (curve)</title></circle>`).join('');
    // X labels
    const labels = buckets.map((b, i) => {
        const x = Pad + i * barW + barW / 2;
        return `<text x="${x}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#6b7280">${b.label} min</text>`;
    }).join('');
    // Y axis line and ticks/grid
    const ticks = buildTicks(maxCount);
    const axis = `<line x1="${Pad}" y1="${Pad}" x2="${Pad}" y2="${H - Pad}" stroke="#e5e7eb"/>` +
      ticks.map(t => {
        const y = H - Pad - (t / maxCount) * (H - Pad * 2);
        return `
          <line x1="${Pad}" y1="${y}" x2="${W - Pad}" y2="${y}" stroke="#f3f4f6" />
          <text x="${Pad - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#6b7280">${t}</text>
        `;
      }).join('');
    // Legend (bar + line)
    const legend = `
      <g transform="translate(${W - 200}, ${Pad})">
        <rect x="0" y="0" width="12" height="12" fill="#dbeafe" stroke="#60a5fa"/>
        <text x="18" y="10" font-size="11" fill="#374151">Attempts</text>
        <line x1="0" y1="22" x2="12" y2="22" stroke="#ef4444" stroke-width="2"/>
        <text x="18" y="25" font-size="11" fill="#374151">Smoothed Curve</text>
      </g>`;

    return `
<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Time distribution (histogram and smoothed curve)">
  <rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/>
  ${axis}
  ${bars}
  ${path ? `<path d="${path}" fill="none" stroke="#ef4444" stroke-width="2"/>` : ''}
  ${curveDots}
  ${legend}
  ${labels}
</svg>`;
}

function smoothPath(pts) {
    if (pts.length < 2) return '';
    // Cubic bezier through points using a simple smoothing
    const tension = 0.25;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i > 0 ? pts[i - 1] : pts[0];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
}

function buildTicks(maxVal) {
    const ticks = [];
    if (maxVal <= 5) {
        for (let i = 0; i <= maxVal; i++) ticks.push(i);
        return ticks;
    }
    const step = Math.max(1, Math.round(maxVal / 4));
    for (let v = 0; v <= maxVal; v += step) ticks.push(v);
    if (ticks[ticks.length - 1] !== maxVal) ticks.push(maxVal);
    return ticks;
}

// Get category name from quiz ID
function getCategoryName(quizId) {
    const quiz = currentQuizzes.find(q => q.id === quizId);
    return quiz ? quiz.category : 'Unknown';
}

// Get score class for styling
function getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-fair';
    return 'score-poor';
}

// View result details
function viewResultDetails(resultId) {
    const result = quizResults.find(r => r.id === resultId);
    if (result) {
        showQuizResults(result);
    }
}

// Setup quiz form
function setupQuizForm() {
    const addQuestionBtn = document.getElementById('addQuestion');
    const quizForm = document.getElementById('quizForm');
    
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', addQuestion);
    }
    
    if (quizForm) {
        quizForm.addEventListener('submit', saveQuiz);
    }

    // Initialize Question Bank UI
    initQuestionBankUI();
}

// Add question to form
function addQuestion() {
    questionCounter++;
    // console.log(`🔍 Adding question ${questionCounter}. Current questions in container:`, document.querySelectorAll('.question-item').length);
    const container = document.getElementById('questionsContainer');
    
    const questionHtml = `
        <div class="question-item" data-question="${questionCounter}">
            <div class="question-header">
                <span class="question-number">Question ${questionCounter}</span>
                <div class="question-actions">
                    <button type="button" class="save-to-bank" onclick="saveQuestionToBank(${questionCounter})" title="Save to Question Bank" style="${QUESTION_BANK_ENABLED ? '' : 'display:none;'}">
                        <i class="fas fa-database"></i>
                    </button>
                    <button type="button" class="duplicate-question" onclick="duplicateQuestion(${questionCounter})" title="Duplicate Question">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button type="button" class="remove-question" onclick="removeQuestion(${questionCounter})" title="Remove Question">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Question Type</label>
                    <select name="questionType_${questionCounter}" onchange="changeQuestionType(${questionCounter}, this.value)" required>
                        <option value="multiple_choice">Multiple Choice (Single Answer)</option>
                        <option value="multiple_answer">Multiple Answer (Multiple Correct)</option>
                        <option value="short_answer">Short Answer (Text Input)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="questionPoints_${questionCounter}">Points</label>
                    <input type="number" id="questionPoints_${questionCounter}" name="questionPoints_${questionCounter}" min="1" max="100" value="1" required>
                    <small class="form-help">Points (1-100)</small>
                </div>
            </div>
            <div class="form-group">
                <label>Question Text</label>
                <textarea name="question_${questionCounter}" required></textarea>
            </div>
            <div class="form-group">
                <label>Question Image (Optional)</label>
                <div class="image-upload-container">
                    <input type="file" name="questionImage_${questionCounter}" id="questionImage_${questionCounter}" accept="image/*" onchange="handleQuestionImageUpload(${questionCounter}, this)">
                    <label for="questionImage_${questionCounter}" class="image-upload-btn">
                        <i class="fas fa-image"></i>
                        <span>Choose Image</span>
                    </label>
                    <div class="image-preview" id="questionImagePreview_${questionCounter}" style="display: none;">
                        <img id="questionImageDisplay_${questionCounter}" src="" alt="Question Image Preview">
                        <button type="button" class="remove-image-btn" onclick="removeQuestionImage(${questionCounter})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="answer-options" id="answerOptions_${questionCounter}">
                <div class="form-group">
                    <label>Answer Options (Select one correct answer)</label>
                    <div class="answer-options-container" id="answerOptions_${questionCounter}">
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionCounter}" value="0" required>
                            <div class="option-content">
                                <input type="text" name="option_${questionCounter}_0" placeholder="Option 1" required autocomplete="off">
                                <div class="option-image-container">
                                    <input type="file" name="optionImage_${questionCounter}_0" id="optionImage_${questionCounter}_0" accept="image/*" onchange="handleOptionImageUpload(${questionCounter}, 0, this)" style="display: none;">
                                    <label for="optionImage_${questionCounter}_0" class="option-image-btn" title="Add Image">
                                        <i class="fas fa-image"></i>
                                    </label>
                                </div>
                            </div>
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionCounter}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionCounter}" value="1" required>
                            <div class="option-content">
                                <input type="text" name="option_${questionCounter}_1" placeholder="Option 2" required autocomplete="off">
                                <div class="option-image-container">
                                    <input type="file" name="optionImage_${questionCounter}_1" id="optionImage_${questionCounter}_1" accept="image/*" onchange="handleOptionImageUpload(${questionCounter}, 1, this)" style="display: none;">
                                    <label for="optionImage_${questionCounter}_1" class="option-image-btn" title="Add Image">
                                        <i class="fas fa-image"></i>
                                    </label>
                                </div>
                            </div>
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionCounter}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionCounter}" value="2" required>
                            <div class="option-content">
                                <input type="text" name="option_${questionCounter}_2" placeholder="Option 3" required autocomplete="off">
                                <div class="option-image-container">
                                    <input type="file" name="optionImage_${questionCounter}_2" id="optionImage_${questionCounter}_2" accept="image/*" onchange="handleOptionImageUpload(${questionCounter}, 2, this)" style="display: none;">
                                    <label for="optionImage_${questionCounter}_2" class="option-image-btn" title="Add Image">
                                        <i class="fas fa-image"></i>
                                    </label>
                                </div>
                            </div>
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionCounter}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionCounter}" value="3" required>
                            <div class="option-content">
                                <input type="text" name="option_${questionCounter}_3" placeholder="Option 4" required autocomplete="off">
                                <div class="option-image-container">
                                    <input type="file" name="optionImage_${questionCounter}_3" id="optionImage_${questionCounter}_3" accept="image/*" onchange="handleOptionImageUpload(${questionCounter}, 3, this)" style="display: none;">
                                    <label for="optionImage_${questionCounter}_3" class="option-image-btn" title="Add Image">
                                        <i class="fas fa-image"></i>
                                    </label>
                                </div>
                            </div>
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionCounter}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="add-option-btn" onclick="addAnswerOption(${questionCounter}, 'multiple_choice')">
                        <i class="fas fa-plus"></i> Add Option
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', questionHtml);
}

// Remove question from form
function removeQuestion(questionNum) {
    const questionElement = document.querySelector(`[data-question="${questionNum}"]`);
    if (questionElement) {
        questionElement.remove();
    }
}

// Duplicate question
function duplicateQuestion(questionNum) {
    // console.log(`🔍 Duplicating question ${questionNum}`);
    const questionElement = document.querySelector(`[data-question="${questionNum}"]`);
    if (!questionElement) {
        console.error('Question element not found');
        return;
    }
    
    // Clone the question element
    const clonedQuestion = questionElement.cloneNode(true);
    
    // Increment question counter
    questionCounter++;
    
    // Update the cloned question's data attribute and content
    clonedQuestion.setAttribute('data-question', questionCounter);
    
    // Update question number display
    const questionNumberSpan = clonedQuestion.querySelector('.question-number');
    if (questionNumberSpan) {
        questionNumberSpan.textContent = `Question ${questionCounter}`;
    }
    
    // Update all form field names and IDs to use the new question number
    const formElements = clonedQuestion.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        if (element.name) {
            element.name = element.name.replace(`_${questionNum}`, `_${questionCounter}`);
        }
        if (element.id) {
            element.id = element.id.replace(`_${questionNum}`, `_${questionCounter}`);
        }
    });
    
    // Update onclick handlers for buttons
    const buttons = clonedQuestion.querySelectorAll('button[onclick]');
    buttons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        if (onclick) {
            button.setAttribute('onclick', onclick.replace(questionNum, questionCounter));
        }
    });
    
    // Copy the selected question type from the original to the clone
    const originalQuestionTypeSelect = questionElement.querySelector('select[name^="questionType_"]');
    if (originalQuestionTypeSelect) {
        const originalType = originalQuestionTypeSelect.value;
        const clonedQuestionTypeSelect = clonedQuestion.querySelector(`select[name="questionType_${questionCounter}"]`);
        if (clonedQuestionTypeSelect) {
            clonedQuestionTypeSelect.value = originalType;
            // console.log(`🔍 Copied question type: ${originalType} to question ${questionCounter}`);
        }
    }
    
    // Copy the checked state for correct answer inputs (radio/checkboxes)
    questionElement.querySelectorAll('input[name^="correct_"]:checked').forEach(originalCorrectInput => {
        const originalValue = originalCorrectInput.value;
        const clonedCorrectInput = clonedQuestion.querySelector(`input[name^="correct_${questionCounter}"][value="${originalValue}"]`);
        if (clonedCorrectInput) {
            clonedCorrectInput.checked = true;
            // console.log(`🔍 Copied correct answer: ${originalValue} to question ${questionCounter}`);
        }
    });
    
    // Preserve the question text and options (don't clear them)
    // The content will be duplicated as-is, allowing users to edit the copy
    
    // Insert the cloned question after the original
    questionElement.insertAdjacentElement('afterend', clonedQuestion);
    
    // Show success message
    showToast('success', 'Success', 'Question duplicated successfully!');
}

// Handle question image upload
function handleQuestionImageUpload(questionNum, input) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('error', 'Error', 'Please select a valid image file.');
        input.value = '';
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Error', 'Image file size must be less than 5MB.');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(`questionImagePreview_${questionNum}`);
        const img = document.getElementById(`questionImageDisplay_${questionNum}`);
        const uploadBtn = input.previousElementSibling;
        
        // Question image upload
        
        if (preview && img) {
            img.src = e.target.result;
            preview.style.display = 'block';
            preview.classList.add('show');
            // console.log(`✅ Question image preview set for question ${questionNum}`);
        } else {
            // console.log(`❌ Missing elements for question image ${questionNum}`);
        }
        
        // Hide the upload button
        if (uploadBtn) {
            uploadBtn.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

// Remove question image
function removeQuestionImage(questionNum) {
    const input = document.getElementById(`questionImage_${questionNum}`);
    const preview = document.getElementById(`questionImagePreview_${questionNum}`);
    
    if (!input) {
        console.warn(`Question image input not found for question ${questionNum}`);
        return;
    }
    
    const uploadBtn = input.previousElementSibling;
    
    input.value = '';
    
    if (preview) {
        preview.style.display = 'none';
    }
    
    if (uploadBtn) {
        uploadBtn.style.display = 'block';
    }
}

// Handle option image upload
function handleOptionImageUpload(questionNum, optionIndex, input) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('error', 'Error', 'Please select a valid image file.');
        input.value = '';
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Error', 'Image file size must be less than 5MB.');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(`optionImagePreview_${questionNum}_${optionIndex}`);
        const img = document.getElementById(`optionImageDisplay_${questionNum}_${optionIndex}`);
        // Find upload button more reliably - look for label with matching 'for' attribute or previous sibling
        const container = input.closest('.option-image-container');
        const uploadBtn = container ? container.querySelector(`label[for="${input.id}"]`) : input.previousElementSibling;
        
        // Option image upload
        
        if (preview && img) {
            img.src = e.target.result;
            img.style.display = 'block';
            img.alt = 'Option Image';
            preview.style.display = 'block';
            preview.classList.add('show');
            preview.style.visibility = 'visible';
            preview.style.height = 'auto';
            preview.style.width = 'auto';
            preview.style.overflow = 'visible';
            preview.style.position = 'relative';
            preview.style.left = 'auto';
            // Also create remove button if it doesn't exist
            if (!preview.querySelector('.remove-option-image-btn')) {
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'remove-option-image-btn';
                removeBtn.onclick = () => removeOptionImage(questionNum, optionIndex);
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                preview.appendChild(removeBtn);
            }
            // Hide the upload button
            if (uploadBtn) {
                uploadBtn.style.display = 'none';
            }
            // console.log(`✅ Option image preview set for question ${questionNum}, option ${optionIndex}`);
        } else {
            // console.log(`❌ Missing elements for option image ${questionNum}_${optionIndex}`);
            // Create the preview container if it doesn't exist
            if (!preview && container) {
                const newPreview = document.createElement('div');
                newPreview.className = 'option-image-preview';
                newPreview.id = `optionImagePreview_${questionNum}_${optionIndex}`;
                newPreview.style.display = 'block';
                newPreview.classList.add('show');
                const newImg = document.createElement('img');
                newImg.id = `optionImageDisplay_${questionNum}_${optionIndex}`;
                newImg.src = e.target.result;
                newImg.style.display = 'block';
                newImg.alt = 'Option Image';
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'remove-option-image-btn';
                removeBtn.onclick = () => removeOptionImage(questionNum, optionIndex);
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                newPreview.appendChild(newImg);
                newPreview.appendChild(removeBtn);
                container.appendChild(newPreview);
                
                // Hide the upload button
                if (uploadBtn) {
                    uploadBtn.style.display = 'none';
                }
            }
        }
    };
    reader.readAsDataURL(file);
}

// Remove option image
function removeOptionImage(questionNum, optionIndex) {
    const input = document.getElementById(`optionImage_${questionNum}_${optionIndex}`);
    const preview = document.getElementById(`optionImagePreview_${questionNum}_${optionIndex}`);
    const img = document.getElementById(`optionImageDisplay_${questionNum}_${optionIndex}`);
    const uploadBtn = input.previousElementSibling;
    
    // Clear the file input
    if (input) {
        input.value = '';
    }
    
    // Clear the image src
    if (img) {
        img.src = '';
        img.style.display = 'none';
    }
    
    // Hide the preview container completely
    if (preview) {
        preview.style.display = 'none';
        preview.classList.remove('show');
        preview.style.visibility = 'hidden';
        preview.style.height = '0';
        preview.style.width = '0';
        preview.style.overflow = 'hidden';
        preview.style.position = 'absolute';
        preview.style.left = '-9999px';
    }
    
    // Show the upload button again
    if (uploadBtn && uploadBtn.classList.contains('option-image-btn')) {
        uploadBtn.style.display = 'block';
    }
}

// Change question type
function changeQuestionType(questionNum, questionType) {
    const answerOptions = document.getElementById(`answerOptions_${questionNum}`);
    if (!answerOptions) return;
    
    // Check if this question already has answer data - if so, we need to preserve it
    // Get existing option values before clearing
    const existingOptions = [];
    const existingCorrectAnswers = [];
    const existingOptionImages = {};
    
    // If changing type, try to preserve existing option text values
    if (questionType === 'multiple_choice' || questionType === 'multiple_answer') {
        const currentOptions = answerOptions.querySelectorAll('input[type="text"][name^="option_"]');
        currentOptions.forEach((input, idx) => {
            if (input.value.trim()) {
                existingOptions.push(input.value.trim());
                // Try to get option images if they exist
                const preview = input.closest('.answer-option')?.querySelector('.option-image-preview img');
                if (preview && preview.src) {
                    existingOptionImages[idx] = preview.src;
                }
            }
        });
        
        // Get currently selected correct answer(s)
        if (questionType === 'multiple_choice') {
            const checked = answerOptions.querySelector('input[type="radio"]:checked');
            if (checked) {
                existingCorrectAnswers.push(parseInt(checked.value));
            }
        } else {
            answerOptions.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                existingCorrectAnswers.push(parseInt(cb.value));
            });
        }
    }
    
    let optionsHtml = '';
    
    switch(questionType) {
        case 'multiple_choice':
            optionsHtml = `
                <div class="form-group">
                    <label>Answer Options (Select one correct answer)</label>
                    <div class="answer-options-container" id="answerOptions_${questionNum}">
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionNum}" value="0" required>
                            <div class="option-content">
                                <input type="text" name="option_${questionNum}_0" placeholder="Option 1" required autocomplete="off">
                                <div class="option-image-container">
                                    <input type="file" name="optionImage_${questionNum}_0" id="optionImage_${questionNum}_0" accept="image/*" onchange="handleOptionImageUpload(${questionNum}, 0, this)" style="display: none;">
                                    <label for="optionImage_${questionNum}_0" class="option-image-btn" title="Add Image">
                                        <i class="fas fa-image"></i>
                                    </label>
                                </div>
                            </div>
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionNum}" value="1" required>
                            <div class="option-content">
                                <input type="text" name="option_${questionNum}_1" placeholder="Option 2" required autocomplete="off">
                                <div class="option-image-container">
                                    <input type="file" name="optionImage_${questionNum}_1" id="optionImage_${questionNum}_1" accept="image/*" onchange="handleOptionImageUpload(${questionNum}, 1, this)" style="display: none;">
                                    <label for="optionImage_${questionNum}_1" class="option-image-btn" title="Add Image">
                                        <i class="fas fa-image"></i>
                                    </label>
                                </div>
                            </div>
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionNum}" value="2" required>
                            <div class="option-content">
                                <input type="text" name="option_${questionNum}_2" placeholder="Option 3" required autocomplete="off">
                                <div class="option-image-container">
                                    <input type="file" name="optionImage_${questionNum}_2" id="optionImage_${questionNum}_2" accept="image/*" onchange="handleOptionImageUpload(${questionNum}, 2, this)" style="display: none;">
                                    <label for="optionImage_${questionNum}_2" class="option-image-btn" title="Add Image">
                                        <i class="fas fa-image"></i>
                                    </label>
                                </div>
                            </div>
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionNum}" value="3" required>
                            <div class="option-content">
                                <input type="text" name="option_${questionNum}_3" placeholder="Option 4" required autocomplete="off">
                                <div class="option-image-container">
                                    <input type="file" name="optionImage_${questionNum}_3" id="optionImage_${questionNum}_3" accept="image/*" onchange="handleOptionImageUpload(${questionNum}, 3, this)" style="display: none;">
                                    <label for="optionImage_${questionNum}_3" class="option-image-btn" title="Add Image">
                                        <i class="fas fa-image"></i>
                                    </label>
                                </div>
                            </div>
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="add-option-btn" onclick="addAnswerOption(${questionNum}, 'multiple_choice')">
                        <i class="fas fa-plus"></i> Add Option
                    </button>
                </div>
            `;
            break;
            
        case 'multiple_answer':
            optionsHtml = `
                <div class="form-group">
                    <label>Answer Options (Select all correct answers)</label>
                    <div class="answer-options-container" id="answerOptions_${questionNum}">
                        <div class="answer-option">
                            <input type="checkbox" name="correct_${questionNum}[]" value="0">
                            <input type="text" name="option_${questionNum}_0" placeholder="Option 1" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="checkbox" name="correct_${questionNum}[]" value="1">
                            <input type="text" name="option_${questionNum}_1" placeholder="Option 2" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="checkbox" name="correct_${questionNum}[]" value="2">
                            <input type="text" name="option_${questionNum}_2" placeholder="Option 3" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="checkbox" name="correct_${questionNum}[]" value="3">
                            <input type="text" name="option_${questionNum}_3" placeholder="Option 4" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="add-option-btn" onclick="addAnswerOption(${questionNum}, 'multiple_answer')">
                        <i class="fas fa-plus"></i> Add Option
                    </button>
                </div>
            `;
            break;
            
        case 'short_answer':
            optionsHtml = `
                <div class="form-group">
                    <label>Correct Answer(s)</label>
                    <div class="short-answer-options">
                        <div class="answer-option">
                            <input type="text" name="correctAnswer_${questionNum}_0" placeholder="Correct answer 1" required>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="addShortAnswer(${questionNum})">
                                <i class="fas fa-plus"></i> Add Another Answer
                            </button>
                        </div>
                    </div>
                    <small class="form-help">Add multiple correct answers if there are different ways to answer correctly.</small>
                </div>
            `;
            break;
    }
    
    answerOptions.innerHTML = optionsHtml;
}

// Add short answer option
function addShortAnswer(questionNum) {
    const shortAnswerOptions = document.querySelector(`#answerOptions_${questionNum} .short-answer-options`);
    if (!shortAnswerOptions) return;
    
    const currentAnswers = shortAnswerOptions.querySelectorAll('.answer-option').length;
    const newAnswerHtml = `
        <div class="answer-option">
            <input type="text" name="correctAnswer_${questionNum}_${currentAnswers}" placeholder="Correct answer ${currentAnswers + 1}" required>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeShortAnswer(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    shortAnswerOptions.insertAdjacentHTML('beforeend', newAnswerHtml);
}

// Remove short answer option
function removeShortAnswer(button) {
    button.closest('.answer-option').remove();
}

// Save quiz
async function saveQuiz(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const isEditing = e.target.dataset.editingQuizId;
    
    // Use current tags from the tag management interface
    const tags = currentTags;
    
    const quizData = {
        id: isEditing || 'quiz_' + Date.now(),
        title: formData.get('quizTitle'),
        description: formData.get('quizDescription'),
        category: formData.get('quizCategory'),
        difficulty: formData.get('quizDifficulty'),
        tags: tags,
        questions: [],
        timeLimit: formData.get('quizTimeLimit') ? parseInt(formData.get('quizTimeLimit')) : null,
        allowRetake: formData.get('quizAllowRetake') ? true : false,
        passingScore: parseInt(formData.get('quizPassingScore')) || 70
    };
    
    // Extract questions
    const questionElements = document.querySelectorAll('.question-item');
    // console.log('🔍 Found question elements:', questionElements.length);
    
    // Process questions asynchronously
    for (let index = 0; index < questionElements.length; index++) {
        const element = questionElements[index];
        const questionNum = element.dataset.question;
        const questionText = formData.get(`question_${questionNum}`);
        const questionType = formData.get(`questionType_${questionNum}`);
        const questionPoints = parseInt(formData.get(`questionPoints_${questionNum}`)) || 1;
        
        // Processing question
        
        if (!questionText || !questionType) {
            // console.log(`⚠️ Skipping question ${questionNum} - missing text or type`);
            continue;
        }
        
        let questionData = {
            id: `q${index + 1}`,
            question: questionText,
            type: questionType,
            points: questionPoints,
            image: null
        };
        
        // Get question image - check if new file uploaded, otherwise preserve existing
        const questionImageInput = document.getElementById(`questionImage_${questionNum}`);
        const questionImageDisplay = document.getElementById(`questionImageDisplay_${questionNum}`);
        
        if (questionImageInput && questionImageInput.files && questionImageInput.files[0]) {
            // New image file uploaded - upload to database
            const imagePath = window.dbService.generateImagePath(quizData.id, questionNum);
            const uploadResult = await window.dbService.uploadImage(questionImageInput.files[0], imagePath);
            
            if (uploadResult.success) {
                questionData.image = uploadResult.url;
                // console.log(`🔍 Question image uploaded for question ${questionNum}:`, uploadResult.url);
            } else {
                console.error(`❌ Failed to upload question image for question ${questionNum}:`, uploadResult.error);
                showToast('error', 'Upload Error', `Failed to upload question image: ${uploadResult.error}`);
            }
        } else if (questionImageDisplay && questionImageDisplay.src && questionImageDisplay.src.trim() !== '' && questionImageDisplay.src !== 'null' && questionImageDisplay.src !== 'undefined' && !questionImageDisplay.src.includes('data:')) {
            // No new file, but existing image displayed - preserve it
            questionData.image = questionImageDisplay.src;
            // console.log(`🔍 Preserving existing question image for question ${questionNum}:`, questionImageDisplay.src);
        } else {
            // No image or invalid image - explicitly set to null
            questionData.image = null;
        }
        
        switch(questionType) {
            case 'multiple_choice':
                const correctAnswer = parseInt(formData.get(`correct_${questionNum}`));
                const options = [];
                let optionIndex = 0;
                while (true) {
                    const optionText = formData.get(`option_${questionNum}_${optionIndex}`);
                    if (!optionText) break;
                    
                    const optionData = {
                        text: optionText,
                        image: null
                    };
                    
                    // Get option image - check if new file uploaded, otherwise preserve existing
                    const optionImageInput = document.getElementById(`optionImage_${questionNum}_${optionIndex}`);
                    const optionImageDisplay = document.getElementById(`optionImageDisplay_${questionNum}_${optionIndex}`);
                    
                    if (optionImageInput && optionImageInput.files && optionImageInput.files[0]) {
                        // New image file uploaded - upload to database
                        const imagePath = window.dbService.generateImagePath(quizData.id, questionNum, optionIndex);
                        const uploadResult = await window.dbService.uploadImage(optionImageInput.files[0], imagePath);
                        
                        if (uploadResult.success) {
                            optionData.image = uploadResult.url;
                            // console.log(`🔍 Option image uploaded for question ${questionNum}, option ${optionIndex}:`, uploadResult.url);
                        } else {
                            console.error(`❌ Failed to upload option image for question ${questionNum}, option ${optionIndex}:`, uploadResult.error);
                            showToast('error', 'Upload Error', `Failed to upload option image: ${uploadResult.error}`);
                        }
                    } else if (optionImageDisplay && optionImageDisplay.src && !optionImageDisplay.src.includes('data:')) {
                        // No new file, but existing image displayed - preserve it
                        optionData.image = optionImageDisplay.src;
                        // console.log(`🔍 Preserving existing option image for question ${questionNum}, option ${optionIndex}:`, optionImageDisplay.src);
                    }
                    
                    options.push(optionData);
                    optionIndex++;
                }
                
                // Multiple Choice Question
                
                if (options.length >= 2 && !isNaN(correctAnswer) && correctAnswer >= 0 && correctAnswer < options.length) {
                    questionData.options = options;
                    questionData.correct = correctAnswer;
                    quizData.questions.push(questionData);
                    // console.log(`✅ Added multiple choice question ${questionNum}. Total questions in quizData: ${quizData.questions.length}`);
                } else {
                    // console.log(`❌ Skipped multiple choice question ${questionNum} - validation failed`);
                }
                break;
                
            case 'multiple_answer':
                const correctAnswers = formData.getAll(`correct_${questionNum}[]`).map(val => parseInt(val));
                const multiOptions = [];
                let multiOptionIndex = 0;
                while (true) {
                    const optionText = formData.get(`option_${questionNum}_${multiOptionIndex}`);
                    if (!optionText) break;
                    
                    const multiOptionData = {
                        text: optionText,
                        image: null
                    };
                    
                    // Get option image - check if new file uploaded, otherwise preserve existing
                    const optionImageInput = document.getElementById(`optionImage_${questionNum}_${multiOptionIndex}`);
                    const optionImageDisplay = document.getElementById(`optionImageDisplay_${questionNum}_${multiOptionIndex}`);
                    
                    if (optionImageInput && optionImageInput.files && optionImageInput.files[0]) {
                        // New image file uploaded - upload to database
                        const imagePath = window.dbService.generateImagePath(quizData.id, questionNum, multiOptionIndex);
                        const uploadResult = await window.dbService.uploadImage(optionImageInput.files[0], imagePath);
                        
                        if (uploadResult.success) {
                            multiOptionData.image = uploadResult.url;
                        } else {
                            console.error(`❌ Failed to upload option image for question ${questionNum}, option ${multiOptionIndex}:`, uploadResult.error);
                            showToast('error', 'Upload Error', `Failed to upload option image: ${uploadResult.error}`);
                        }
                    } else if (optionImageDisplay && optionImageDisplay.src && !optionImageDisplay.src.includes('data:')) {
                        // No new file, but existing image displayed - preserve it
                        multiOptionData.image = optionImageDisplay.src;
                    }
                    
                    multiOptions.push(multiOptionData);
                    multiOptionIndex++;
                }
                
                // Multiple Answer Question
                
                if (multiOptions.length >= 2 && correctAnswers.length > 0 && correctAnswers.every(val => val >= 0 && val < multiOptions.length)) {
                    questionData.options = multiOptions;
                    questionData.correct = correctAnswers;
                    quizData.questions.push(questionData);
                    // console.log(`✅ Added multiple answer question ${questionNum}. Total questions in quizData: ${quizData.questions.length}`);
                } else {
                    // console.log(`❌ Skipped multiple answer question ${questionNum} - validation failed`);
                }
                break;
                
            case 'short_answer':
                const correctAnswersText = [];
                let answerIndex = 0;
                while (true) {
                    const answer = formData.get(`correctAnswer_${questionNum}_${answerIndex}`);
                    if (!answer) break;
                    correctAnswersText.push(answer.trim());
                    answerIndex++;
                }
                
                if (correctAnswersText.length > 0) {
                    questionData.correctAnswers = correctAnswersText;
                    quizData.questions.push(questionData);
                    // console.log(`✅ Added short answer question ${questionNum}. Total questions in quizData: ${quizData.questions.length}`);
                } else {
                    // console.log(`❌ Skipped short answer question ${questionNum} - no correct answers`);
                }
                break;
        }
    }
    
    // console.log('🔍 Final quiz data questions:', quizData.questions.length);
    // console.log('🔍 Questions data:', quizData.questions);
    
    if (quizData.questions.length === 0) {
        showToast('error', 'Error', 'Please add at least one question.');
        return;
    }
    
    // Save quiz to database and localStorage
    try {
        if (window.dbService && window.dbService.isConfigured) {
            if (isEditing) {
                // Update existing quiz in database
                await window.dbService.updateQuiz(isEditing, quizData);
                // Update in local array
                const quizIndex = currentQuizzes.findIndex(q => q.id === isEditing);
                if (quizIndex !== -1) {
                    currentQuizzes[quizIndex] = quizData;
                }
                showToast('success', 'Success', 'Quiz updated successfully!');
            } else {
                // Create new quiz in database
                await window.dbService.createQuiz(quizData);
                // Add to local array
                currentQuizzes.push(quizData);
                console.log('🔍 Quiz created in database:', quizData.id);
                showToast('success', 'Success', 'Quiz created successfully!');
            }
        } else {
            // Fallback to localStorage-only if database not configured
            if (isEditing) {
                const quizIndex = currentQuizzes.findIndex(q => q.id === isEditing);
                if (quizIndex !== -1) {
                    currentQuizzes[quizIndex] = quizData;
                    showToast('success', 'Success', 'Quiz updated successfully!');
                } else {
                    showToast('error', 'Error', 'Quiz not found for updating.');
                    return;
                }
            } else {
                currentQuizzes.push(quizData);
                showToast('success', 'Success', 'Quiz created successfully!');
            }
        }
        
        // Always save to localStorage for offline access
        saveQuizData();
        console.log('🔍 Quiz data saved, current quizzes count:', currentQuizzes.length);
    } catch (error) {
        console.error('❌ Failed to save quiz:', error);
        showToast('error', 'Save Failed', 'Failed to save quiz. Please try again.');
        return;
    }
    
    // Reset form
    e.target.reset();
    document.getElementById('questionsContainer').innerHTML = '';
    questionCounter = 0;
    // console.log('🔍 Form reset - questionCounter set to 0, questions container cleared');
    delete e.target.dataset.editingQuizId;
    
    // Reset form title
    const formTitle = document.querySelector('.create-quiz-form h2');
    if (formTitle) {
        formTitle.textContent = 'Create New Quiz';
    }
    
    // Switch to available quizzes and refresh the display
    document.getElementById('availableQuizzes').click();
    renderAvailableQuizzes();
}

// Preview quiz
function previewQuiz(quizId) {
    const quiz = currentQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    // For now, just show an alert with quiz details
    alert(`Quiz Preview: ${quiz.title}\n\nDescription: ${quiz.description}\nQuestions: ${quiz.questions.length}\nTime Limit: ${quiz.timeLimit ? quiz.timeLimit + ' minutes' : 'No time limit'}\nPassing Score: ${quiz.passingScore}%`);
}

// Toast notification system - Now handled by ToastComponent
// The showToast function is provided globally by the ToastComponent

// Function to add a new answer option
function addAnswerOption(questionNum, questionType) {
    const container = document.getElementById(`answerOptions_${questionNum}`);
    if (!container) return;
    
    const existingOptions = container.querySelectorAll('.answer-option');
    const newIndex = existingOptions.length;
    
    let inputType = 'radio';
    let nameAttribute = `correct_${questionNum}`;
    if (questionType === 'multiple_answer') {
        inputType = 'checkbox';
        nameAttribute = `correct_${questionNum}[]`;
    }
    
    const newOptionHtml = `
        <div class="answer-option">
            <input type="${inputType}" name="${nameAttribute}" value="${newIndex}" ${questionType === 'multiple_choice' ? 'required' : ''}>
            <div class="option-content">
                <input type="text" name="option_${questionNum}_${newIndex}" placeholder="Option ${newIndex + 1}" required autocomplete="off">
                <div class="option-image-container">
                    <input type="file" name="optionImage_${questionNum}_${newIndex}" id="optionImage_${questionNum}_${newIndex}" accept="image/*" onchange="handleOptionImageUpload(${questionNum}, ${newIndex}, this)" style="display: none;">
                    <label for="optionImage_${questionNum}_${newIndex}" class="option-image-btn" title="Add Image">
                        <i class="fas fa-image"></i>
                    </label>
                </div>
            </div>
            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Find the "Add Option" button and insert the new option before it
    const addButton = container.parentElement.querySelector('.add-option-btn');
    if (addButton) {
        addButton.insertAdjacentHTML('beforebegin', newOptionHtml);
    } else {
        // Fallback: add to the end of the container
        container.insertAdjacentHTML('beforeend', newOptionHtml);
    }
    
    // Show remove buttons if we have more than 2 options
    if (existingOptions.length >= 2) {
        container.parentElement.querySelectorAll('.remove-option-btn').forEach(btn => {
            btn.style.display = 'inline-block';
        });
    }
}

// Function to remove an answer option
function removeAnswerOption(questionNum, button) {
    const container = document.getElementById(`answerOptions_${questionNum}`);
    if (!container) return;
    
    const optionToRemove = button.closest('.answer-option');
    // Get all options from both the container and the parent element (for dynamically added ones)
    const allOptions = [...container.querySelectorAll('.answer-option'), ...container.parentElement.querySelectorAll('.answer-option')];
    const uniqueOptions = [...new Set(allOptions)]; // Remove duplicates
    
    // Don't allow removing if we only have 2 options
    if (uniqueOptions.length <= 2) {
        showToast('warning', 'Warning', 'You must have at least 2 answer options');
        return;
    }
    
    optionToRemove.remove();
    
    // Reindex remaining options from both locations
    const remainingOptions = [...container.querySelectorAll('.answer-option'), ...container.parentElement.querySelectorAll('.answer-option')];
    const uniqueRemainingOptions = [...new Set(remainingOptions)]; // Remove duplicates
    
    uniqueRemainingOptions.forEach((option, index) => {
        const radioOrCheckbox = option.querySelector('input[type="radio"], input[type="checkbox"]');
        const textInput = option.querySelector('input[type="text"]');
        
        if (radioOrCheckbox) {
            radioOrCheckbox.value = index;
        }
        if (textInput) {
            textInput.name = `option_${questionNum}_${index}`;
            textInput.placeholder = `Option ${index + 1}`;
        }
    });
    
    // Hide remove buttons if we only have 2 options left
    if (uniqueRemainingOptions.length <= 2) {
        [...container.querySelectorAll('.remove-option-btn'), ...container.parentElement.querySelectorAll('.remove-option-btn')].forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

// Check if current user is admin
function isAdmin() {
    // Check if user is logged in and has admin role
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.role === 'Admin' || user.role === 'admin';
}

// Edit quiz function
function editQuiz(quizId) {
    const quiz = currentQuizzes.find(q => q.id === quizId);
    if (!quiz) {
        showToast('error', 'Error', 'Quiz not found.');
        return;
    }
    
    // Switch to create quiz section
    document.getElementById('createQuiz').click();
    
    // Populate the form with existing quiz data
    setTimeout(() => {
        populateEditForm(quiz);
    }, 100);
}

// Delete quiz function
async function deleteQuiz(quizId) {
    const quiz = currentQuizzes.find(q => q.id === quizId);
    if (!quiz) {
        showToast('error', 'Error', 'Quiz not found.');
        return;
    }
    
    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete the quiz "${quiz.title}"?\n\nThis action cannot be undone and will also delete all quiz results for this quiz.`);
    
    if (confirmed) {
        try {
            // Delete from database if configured
            if (window.dbService && window.dbService.isConfigured) {
                await window.dbService.deleteQuiz(quizId);
                console.log('🗑️ Quiz deleted from database:', quizId);
            }
            
            // Remove quiz from current quizzes
            const quizIndex = currentQuizzes.findIndex(q => q.id === quizId);
            if (quizIndex !== -1) {
                currentQuizzes.splice(quizIndex, 1);
            }
            
            // Remove quiz results for this quiz
            quizResults = quizResults.filter(result => result.quizId !== quizId);
            saveQuizResults();
            
            // Save updated quiz list to localStorage
            saveQuizData();
            
            // Refresh the quiz list display
            renderAvailableQuizzes();
            
            showToast('success', 'Success', `Quiz "${quiz.title}" has been deleted successfully.`);
        } catch (error) {
            console.error('❌ Failed to delete quiz:', error);
            showToast('error', 'Delete Failed', 'Failed to delete quiz. Please try again.');
        }
    }
}

// Populate edit form with quiz data
function populateEditForm(quiz) {
    // Fill basic quiz information
    document.getElementById('quizTitle').value = quiz.title || '';
    document.getElementById('quizDescription').value = quiz.description || '';
    document.getElementById('quizCategory').value = quiz.category || '';
    document.getElementById('quizDifficulty').value = quiz.difficulty || '';
    document.getElementById('quizPassingScore').value = quiz.passingScore || 70;
    document.getElementById('quizTimeLimit').value = quiz.timeLimit || '';
    const allowRetakeInput = document.getElementById('quizAllowRetake');
    if (allowRetakeInput) allowRetakeInput.checked = quiz.allowRetake !== false;
    
    // Populate tags in the management interface
    currentTags = [...(quiz.tags || [])];
    updateTagDisplay();
    
    // Clear existing questions
    document.getElementById('questionsContainer').innerHTML = '';
    questionCounter = 0;
    
    // Add questions from the quiz
    quiz.questions.forEach((question, index) => {
        addQuestion();
        
        // Capture the current questionCounter value in a local variable to avoid closure issues
        // This ensures each setTimeout callback uses the correct question number
        const currentQuestionNum = questionCounter;
        
        // Fill question data
        const questionElement = document.querySelector(`[data-question="${currentQuestionNum}"]`);
        if (questionElement) {
            // Set question text
            const questionTextarea = questionElement.querySelector(`textarea[name="question_${currentQuestionNum}"]`);
            if (questionTextarea) {
                questionTextarea.value = question.question || '';
            }
            
            // Set question type WITHOUT triggering change event (to avoid clearing options)
            const questionTypeSelect = questionElement.querySelector(`select[name="questionType_${currentQuestionNum}"]`);
            if (questionTypeSelect) {
                questionTypeSelect.value = question.type || 'multiple_choice';
                // Don't trigger change event - we'll populate options directly via fillAnswerOptions
            }
            
            // Set question points
            const questionPointsInput = questionElement.querySelector(`input[name="questionPoints_${currentQuestionNum}"]`);
            if (questionPointsInput) {
                questionPointsInput.value = question.points || 1;
            }
            
            // Set question image if it exists
            if (question.image) {
                const questionImagePreview = questionElement.querySelector(`#questionImagePreview_${currentQuestionNum}`);
                const questionImageDisplay = questionElement.querySelector(`#questionImageDisplay_${currentQuestionNum}`);
                if (questionImagePreview && questionImageDisplay) {
                    questionImageDisplay.src = question.image;
                    questionImagePreview.style.display = 'block';
                }
            }
            
            // Fill answer options directly (fillAnswerOptions will handle clearing and repopulating)
            // Use setTimeout to ensure DOM is ready after addQuestion()
            // Capture currentQuestionNum in closure to avoid all timeouts using the final value
            setTimeout(() => {
                console.log(`🔍 Filling answer options for question ${currentQuestionNum}:`, question);
                fillAnswerOptions(currentQuestionNum, question);
            }, 50);
        }
    });
    
    // Update form title to indicate editing
    const formTitle = document.querySelector('.create-quiz-form h2');
    if (formTitle) {
        formTitle.textContent = `Edit Quiz: ${quiz.title}`;
    }
    
    // Store the quiz ID for saving
    document.getElementById('quizForm').dataset.editingQuizId = quiz.id;
    
    showToast('info', 'Edit Mode', 'Quiz loaded for editing. Make your changes and click "Save Quiz" to update.');
}

// Fill answer options for a question
function fillAnswerOptions(questionNum, question) {
    const answerOptionsContainer = document.getElementById(`answerOptions_${questionNum}`);
    if (!answerOptionsContainer) {
        console.error(`❌ Answer options container not found for question ${questionNum}`);
        return;
    }
    
    console.log(`🔍 Filling answer options for question ${questionNum}, type: ${question.type}, correct:`, question.correct, 'correctAnswers:', question.correctAnswers);
    console.log(`🔍 Answer options container found:`, answerOptionsContainer);
    console.log(`🔍 Container innerHTML before clearing:`, answerOptionsContainer.innerHTML);
    
    // Clear existing options
    answerOptionsContainer.innerHTML = '';
    console.log(`🔍 Container innerHTML after clearing:`, answerOptionsContainer.innerHTML);
    
    if (question.type === 'multiple_choice' || question.type === 'multiple_answer') {
        // Add options
        question.options.forEach((option, index) => {
            const inputType = question.type === 'multiple_choice' ? 'radio' : 'checkbox';
            const nameAttribute = question.type === 'multiple_choice' ? `correct_${questionNum}` : `correct_${questionNum}[]`;
            
            const optionText = typeof option === 'string' ? option : option.text || '';
            // More robust check: ensure option.image exists, is not null, not undefined, and not empty string
            const hasValidImage = typeof option === 'object' && option && option.image && 
                                  typeof option.image === 'string' && 
                                  option.image.trim() !== '' && 
                                  option.image !== 'null' && 
                                  option.image !== 'undefined';
            const optionImage = hasValidImage ? option.image : null;
            
            const optionHtml = `
                <div class="answer-option">
                    <input type="${inputType}" name="${nameAttribute}" value="${index}" ${question.type === 'multiple_choice' ? 'required' : ''}>
                    <div class="option-content">
                        <input type="text" name="option_${questionNum}_${index}" placeholder="Option ${index + 1}" value="${optionText}" required autocomplete="off">
                        <div class="option-image-container">
                            <input type="file" name="optionImage_${questionNum}_${index}" id="optionImage_${questionNum}_${index}" accept="image/*" onchange="handleOptionImageUpload(${questionNum}, ${index}, this)" style="display: none;">
                            <label for="optionImage_${questionNum}_${index}" class="option-image-btn" title="Add Image">
                                <i class="fas fa-image"></i>
                            </label>
                            ${optionImage ? `<div class="option-image-preview" id="optionImagePreview_${questionNum}_${index}" style="display: block;"><img id="optionImageDisplay_${questionNum}_${index}" src="${optionImage}" alt="Option Image"><button type="button" class="remove-option-image-btn" onclick="removeOptionImage(${questionNum}, ${index})"><i class="fas fa-times"></i></button></div>` : ''}
                        </div>
                    </div>
                    <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: ${question.options.length > 2 ? 'inline-block' : 'none'}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            answerOptionsContainer.insertAdjacentHTML('beforeend', optionHtml);
        });
        
        // Set correct answers
        if (question.type === 'multiple_choice') {
            console.log(`🔍 Setting correct answer for multiple choice question ${questionNum}:`, question.correct);
            const correctRadio = answerOptionsContainer.querySelector(`input[type="radio"][value="${question.correct}"]`);
            if (correctRadio) {
                correctRadio.checked = true;
                console.log(`✅ Set correct answer for question ${questionNum}`);
            } else {
                console.error(`❌ Could not find radio button for correct answer ${question.correct} in question ${questionNum}`);
            }
        } else if (question.type === 'multiple_answer') {
            console.log(`🔍 Setting correct answers for multiple answer question ${questionNum}:`, question.correct);
            question.correct.forEach(correctIndex => {
                const correctCheckbox = answerOptionsContainer.querySelector(`input[type="checkbox"][value="${correctIndex}"]`);
                if (correctCheckbox) {
                    correctCheckbox.checked = true;
                    console.log(`✅ Set correct answer ${correctIndex} for question ${questionNum}`);
                } else {
                    console.error(`❌ Could not find checkbox for correct answer ${correctIndex} in question ${questionNum}`);
                }
            });
        }
        
        // Add "Add Option" button
        const addButtonHtml = `
            <button type="button" class="add-option-btn" onclick="addAnswerOption(${questionNum}, '${question.type}')">
                <i class="fas fa-plus"></i> Add Option
            </button>
        `;
        answerOptionsContainer.insertAdjacentHTML('afterend', addButtonHtml);
        
    } else if (question.type === 'short_answer') {
        // Add short answer options
        console.log(`🔍 Processing short answer question ${questionNum}, correctAnswers:`, question.correctAnswers);
        if (question.correctAnswers && Array.isArray(question.correctAnswers)) {
            console.log(`🔍 Adding ${question.correctAnswers.length} correct answers for question ${questionNum}`);
            question.correctAnswers.forEach((answer, index) => {
                console.log(`🔍 Adding answer ${index + 1}: "${answer}" for question ${questionNum}`);
                const answerHtml = `
                    <div class="short-answer-option">
                        <input type="text" name="correctAnswer_${questionNum}_${index}" placeholder="Correct answer ${index + 1}" value="${answer}" required>
                        <button type="button" class="remove-answer-btn" onclick="removeShortAnswer(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                console.log(`🔍 Generated HTML for answer ${index + 1}:`, answerHtml);
                answerOptionsContainer.insertAdjacentHTML('beforeend', answerHtml);
                console.log(`✅ Inserted answer ${index + 1} into DOM`);
            });
        } else {
            console.warn(`⚠️ No correct answers found for short answer question ${questionNum}`);
        }
        
        // Add "Add Answer" button
        const addButtonHtml = `
            <button type="button" class="add-answer-btn" onclick="addShortAnswer(${questionNum})">
                <i class="fas fa-plus"></i> Add Answer
            </button>
        `;
        answerOptionsContainer.insertAdjacentHTML('afterend', addButtonHtml);
        
        // Debug: Check final container state
        console.log(`🔍 Final container innerHTML for question ${questionNum}:`, answerOptionsContainer.innerHTML);
        console.log(`🔍 Final container children count:`, answerOptionsContainer.children.length);
    }
}

// Make functions globally accessible
window.startQuiz = startQuiz;
window.previewQuiz = previewQuiz;
window.selectAnswer = selectAnswer;
window.selectMultipleAnswer = selectMultipleAnswer;
window.handleShortAnswer = handleShortAnswer;
window.removeQuestion = removeQuestion;
window.changeQuestionType = changeQuestionType;
window.addShortAnswer = addShortAnswer;
window.removeShortAnswer = removeShortAnswer;
window.addAnswerOption = addAnswerOption;
window.removeAnswerOption = removeAnswerOption;
window.editQuiz = editQuiz;
window.deleteQuiz = deleteQuiz;
window.viewResultDetails = viewResultDetails;

// Image Modal Functions
function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (modal && modalImage && imageSrc && imageSrc.trim() !== '') {
        modalImage.src = imageSrc;
        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restore scrolling
        // Clear any image source
        const modalImage = document.getElementById('modalImage');
        if (modalImage) {
            modalImage.src = '';
        }
    }
}

// Filter quizzes by tag
function filterByTag(tag) {
    const searchInput = document.getElementById('quizSearch');
    if (searchInput) {
        searchInput.value = tag;
        renderAvailableQuizzes();
    }
}

// Tag management for create quiz form
let currentTags = [];
let presetTags = ['leadership', 'management', 'communication', 'teamwork', 'training', 'skills', 'development', 'assessment', 'beginner', 'intermediate', 'advanced'];


function removeTag(tag) {
    currentTags = currentTags.filter(t => t !== tag);
    updateTagDisplay();
}

function clearAllTags() {
    currentTags = [];
    updateTagDisplay();
}

function updateTagDisplay() {
    const tagDisplay = document.getElementById('tagDisplay');
    if (tagDisplay) {
        // Show all preset tags with selection state
        tagDisplay.innerHTML = presetTags.map(tag => {
            const isSelected = currentTags.includes(tag);
            return `<span class="quiz-tag ${isSelected ? 'selected' : ''}" onclick="toggleTag('${tag}')">${tag}</span>`;
        }).join('');
    }
}

// Manage Tags Modal Functions
function openManageTagsModal() {
    const modal = document.getElementById('manageTagsModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        loadExistingTags();
    }
}

function closeManageTagsModal() {
    const modal = document.getElementById('manageTagsModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

function loadExistingTags() {
    const existingTagsList = document.getElementById('existingTagsList');
    if (existingTagsList) {
        existingTagsList.innerHTML = presetTags.map(tag => `
            <span class="existing-tag" onclick="addPresetTagToCurrent('${tag}')" title="Click to add to quiz">
                ${tag}
                <button class="remove-tag" onclick="event.stopPropagation(); removePresetTag('${tag}')" title="Remove tag">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');
    }
}

function addNewTag() {
    const input = document.getElementById('newTagInput');
    const tagName = input.value.trim();
    
    if (tagName && !presetTags.includes(tagName)) {
        presetTags.push(tagName);
        loadExistingTags();
        updateTagDisplay(); // Update the main quiz form tag box
        input.value = '';
        showToast('success', 'Tag Added', `"${tagName}" has been added to the preset tags.`);
    } else if (presetTags.includes(tagName)) {
        showToast('warning', 'Tag Exists', `"${tagName}" is already in the preset tags.`);
    }
}

function removePresetTag(tagName) {
    if (confirm(`Are you sure you want to remove "${tagName}" from the preset tags?`)) {
        presetTags = presetTags.filter(tag => tag !== tagName);
        // Also remove from current tags if it was selected
        currentTags = currentTags.filter(tag => tag !== tagName);
        loadExistingTags();
        updateTagDisplay(); // Update the main quiz form tag box
        showToast('success', 'Tag Removed', `"${tagName}" has been removed from the preset tags.`);
    }
}

function addPresetTagToCurrent(tagName) {
    if (!currentTags.includes(tagName)) {
        currentTags.push(tagName);
        updateTagDisplay();
        showToast('success', 'Tag Added', `"${tagName}" has been added to your quiz.`);
    } else {
        showToast('info', 'Tag Already Added', `"${tagName}" is already added to your quiz.`);
    }
}

function toggleTag(tagName) {
    if (currentTags.includes(tagName)) {
        // Remove tag
        currentTags = currentTags.filter(tag => tag !== tagName);
        showToast('info', 'Tag Removed', `"${tagName}" has been removed from your quiz.`);
    } else {
        // Add tag
        currentTags.push(tagName);
        showToast('success', 'Tag Added', `"${tagName}" has been added to your quiz.`);
    }
    updateTagDisplay();
}

// Make functions globally available
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.filterByTag = filterByTag;
window.removeTag = removeTag;
window.clearAllTags = clearAllTags;
window.openManageTagsModal = openManageTagsModal;
window.closeManageTagsModal = closeManageTagsModal;
window.addNewTag = addNewTag;
window.removePresetTag = removePresetTag;
window.addPresetTagToCurrent = addPresetTagToCurrent;
window.toggleTag = toggleTag;

// Add event listeners for image modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.image-modal-close');
    
    if (modal && closeBtn) {
        // Close modal when clicking the X button
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeImageModal();
        });
        
        // Close modal when clicking outside the image
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && (modal.style.display === 'flex' || modal.style.display === 'block')) {
                closeImageModal();
            }
        });
    }
    
    // Add event listeners for manage tags modal
    const manageTagsModal = document.getElementById('manageTagsModal');
    const manageTagsCloseBtn = document.querySelector('.manage-tags-close');
    const newTagInput = document.getElementById('newTagInput');
    
    if (manageTagsModal && manageTagsCloseBtn) {
        // Close modal when clicking the X button
        manageTagsCloseBtn.addEventListener('click', closeManageTagsModal);
        
        // Close modal when clicking outside
        manageTagsModal.addEventListener('click', function(e) {
            if (e.target === manageTagsModal) {
                closeManageTagsModal();
            }
        });
    }
    
    if (newTagInput) {
        // Add tag when pressing Enter
        newTagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addNewTag();
            }
        });
    }
});

// console.log('✅ Quiz script loaded successfully');
