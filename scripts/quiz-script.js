// Quiz System JavaScript
console.log('🔍 Loading quiz script...');

// Global variables
let currentQuizzes = [];
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizResults = [];
let questionCounter = 0;

// Sample quiz data
const sampleQuizzes = [
    {
        id: 'quiz_1',
        title: 'Leadership Fundamentals',
        description: 'Test your knowledge of basic leadership principles and practices.',
        category: 'leadership',
        difficulty: 'beginner',
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
    console.log('🔍 Quiz system initializing...');
    
    // Load data from localStorage or use sample data
    loadQuizData();
    loadQuizResults();
    
    // Setup event listeners
    setupNavigation();
    setupQuizFilters();
    setupQuizActions();
    setupModalEvents();
    setupQuizForm();
    
    // Render initial content
    renderAvailableQuizzes();
    renderQuizResults();
    
    console.log('✅ Quiz system initialized successfully');
});

// Load quiz data
function loadQuizData() {
    const savedQuizzes = localStorage.getItem('quizzes');
    if (savedQuizzes) {
        currentQuizzes = JSON.parse(savedQuizzes);
        
        // Clean up any malformed quiz data
        const originalLength = currentQuizzes.length;
        currentQuizzes = currentQuizzes.filter(quiz => {
            // Remove quizzes with null or missing essential fields
            if (!quiz.title || !quiz.category || !quiz.difficulty || 
                quiz.title === 'null' || quiz.category === 'null' || quiz.difficulty === 'null') {
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
    localStorage.setItem('quizzes', JSON.stringify(currentQuizzes));
}

// Load quiz results
function loadQuizResults() {
    const savedResults = localStorage.getItem('quizResults');
    if (savedResults) {
        quizResults = JSON.parse(savedResults);
        console.log('📊 Loaded quiz results:', quizResults.length);
    } else {
        quizResults = [];
    }
}

// Save quiz results
function saveQuizResults() {
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding content
            const targetId = this.id;
            showContentSection(targetId);
        });
    });
}

// Show content section
function showContentSection(sectionId) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(sectionId + 'Content');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        switch(sectionId) {
            case 'availableQuizzes':
                renderAvailableQuizzes();
                break;
            case 'quizResults':
                renderQuizResults();
                break;
            case 'createQuiz':
                // Form is already set up
                break;
        }
    }
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
function renderAvailableQuizzes() {
    const grid = document.getElementById('quizzesGrid');
    if (!grid) return;
    
    const searchTerm = document.getElementById('quizSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';
    
    // Filter quizzes
    const filteredQuizzes = currentQuizzes.filter(quiz => {
        const title = quiz.title || '';
        const description = quiz.description || '';
        const category = quiz.category || '';
        const difficulty = quiz.difficulty || '';
        
        const matchesSearch = title.toLowerCase().includes(searchTerm) ||
                            description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesDifficulty = !difficultyFilter || difficulty === difficultyFilter;
        
        return matchesSearch && matchesCategory && matchesDifficulty;
    });
    
    // Render quiz cards
    grid.innerHTML = filteredQuizzes.map(quiz => `
        <div class="quiz-card">
            <div class="quiz-header">
                <div>
                    <h3 class="quiz-title">${quiz.title}</h3>
                    <span class="quiz-category">${quiz.category}</span>
                </div>
                <span class="quiz-difficulty difficulty-${quiz.difficulty}">${quiz.difficulty}</span>
            </div>
            <p class="quiz-description">${quiz.description}</p>
            <div class="quiz-meta">
                <span><i class="fas fa-question-circle"></i> ${quiz.questions.length} questions</span>
                <span><i class="fas fa-clock"></i> ${quiz.timeLimit} min</span>
                <span><i class="fas fa-percentage"></i> ${quiz.passingScore}% to pass</span>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-primary" onclick="startQuiz('${quiz.id}')">
                    <i class="fas fa-play"></i>
                    Start Quiz
                </button>
                ${isAdmin() ? `
                <button class="btn btn-warning" onclick="editQuiz('${quiz.id}')">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="btn btn-danger" onclick="deleteQuiz('${quiz.id}')">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Start quiz
function startQuiz(quizId) {
    const quiz = currentQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    currentQuiz = quiz;
    currentQuestionIndex = 0;
    userAnswers = [];
    
    // Open quiz modal
    openQuizModal();
    renderCurrentQuestion();
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
}

// Render current question
function renderCurrentQuestion() {
    const questionContainer = document.getElementById('quizQuestion');
    const currentQuestion = document.getElementById('currentQuestion');
    
    if (!questionContainer || !currentQuestion) return;
    
    const question = currentQuiz.questions[currentQuestionIndex];
    currentQuestion.textContent = currentQuestionIndex + 1;
    
    let questionHtml = `<div class="question-text">${question.question}</div>`;
    
    // Handle different question types
    switch(question.type || 'multiple_choice') {
        case 'multiple_choice':
            questionHtml += `
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <div class="quiz-option" onclick="selectAnswer(${index})">
                            <input type="radio" name="answer" value="${index}" id="option_${index}">
                            <label for="option_${index}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'multiple_answer':
            questionHtml += `
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <div class="quiz-option" onclick="selectMultipleAnswer(${index})">
                            <input type="checkbox" name="answer" value="${index}" id="option_${index}">
                            <label for="option_${index}">${option}</label>
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
function selectAnswer(optionIndex) {
    // Remove previous selection
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    const selectedOption = document.querySelectorAll('.quiz-option')[optionIndex];
    if (selectedOption) {
        selectedOption.classList.add('selected');
        selectedOption.querySelector('input[type="radio"]').checked = true;
    }
    
    // Store answer
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update navigation buttons
    updateQuizNavigation();
}

// Select multiple answers
function selectMultipleAnswer(optionIndex) {
    const selectedOption = document.querySelectorAll('.quiz-option')[optionIndex];
    const checkbox = selectedOption.querySelector('input[type="checkbox"]');
    
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
function submitQuiz() {
    if (!currentQuiz) return;
    
    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = currentQuiz.questions.length;
    
    currentQuiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const questionType = question.type || 'multiple_choice';
        
        switch(questionType) {
            case 'multiple_choice':
                if (userAnswer === question.correct) {
                    correctAnswers++;
                }
                break;
                
            case 'multiple_answer':
                if (Array.isArray(userAnswer) && Array.isArray(question.correct)) {
                    // Check if all correct answers are selected and no incorrect ones
                    const userSet = new Set(userAnswer);
                    const correctSet = new Set(question.correct);
                    if (userSet.size === correctSet.size && [...userSet].every(val => correctSet.has(val))) {
                        correctAnswers++;
                    }
                }
                break;
                
            case 'short_answer':
                if (typeof userAnswer === 'string' && userAnswer.trim()) {
                    const userAnswerLower = userAnswer.toLowerCase().trim();
                    const correctAnswersLower = question.correctAnswers.map(ans => ans.toLowerCase().trim());
                    if (correctAnswersLower.includes(userAnswerLower)) {
                        correctAnswers++;
                    }
                }
                break;
        }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
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
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        passed: passed,
        dateTaken: new Date().toISOString(),
        completedAt: new Date().toISOString(), // For compatibility with admin overview
        answers: [...userAnswers],
        timeSpent: 0 // Could be implemented with timer
    };
    
    // Save result
    quizResults.push(result);
    saveQuizResults();
    
    // Close quiz modal
    closeQuizModal();
    
    // Show results
    showQuizResults(result);
    
    // Show success message
    showToast('success', 'Quiz Completed!', `You scored ${score}% and ${passed ? 'passed' : 'did not pass'} the quiz.`);
}

// Show quiz results
function showQuizResults(result) {
    const modal = document.getElementById('quizResultsModal');
    const content = document.getElementById('resultsContent');
    
    if (!modal || !content) return;
    
    const quiz = currentQuizzes.find(q => q.id === result.quizId);
    if (!quiz) return;
    
    content.innerHTML = `
        <div class="score-display">${result.score}%</div>
        <div class="score-text">${result.passed ? 'Congratulations! You passed!' : 'Keep studying! You can do better.'}</div>
        
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
                        userAnswerText = userAnswer !== undefined ? question.options[userAnswer] : 'Not answered';
                        correctAnswerText = question.options[question.correct];
                        break;
                        
                    case 'multiple_answer':
                        if (Array.isArray(userAnswer) && Array.isArray(question.correct)) {
                            const userSet = new Set(userAnswer);
                            const correctSet = new Set(question.correct);
                            isCorrect = userSet.size === correctSet.size && [...userSet].every(val => correctSet.has(val));
                        }
                        userAnswerText = Array.isArray(userAnswer) ? 
                            userAnswer.map(i => question.options[i]).join(', ') : 'Not answered';
                        correctAnswerText = question.correct.map(i => question.options[i]).join(', ');
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
}

// Close results modal
function closeResultsModal() {
    const modal = document.getElementById('quizResultsModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

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
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeQuizModal();
            closeResultsModal();
        }
    });
}

// Render quiz results
function renderQuizResults() {
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
                    <td>${timeStr}</td>
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
}

// Add question to form
function addQuestion() {
    questionCounter++;
    const container = document.getElementById('questionsContainer');
    
    const questionHtml = `
        <div class="question-item" data-question="${questionCounter}">
            <div class="question-header">
                <span class="question-number">Question ${questionCounter}</span>
                <div class="question-actions">
                    <button type="button" class="duplicate-question" onclick="duplicateQuestion(${questionCounter})" title="Duplicate Question">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button type="button" class="remove-question" onclick="removeQuestion(${questionCounter})" title="Remove Question">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Question Type</label>
                <select name="questionType_${questionCounter}" onchange="changeQuestionType(${questionCounter}, this.value)" required>
                    <option value="multiple_choice">Multiple Choice (Single Answer)</option>
                    <option value="multiple_answer">Multiple Answer (Multiple Correct)</option>
                    <option value="short_answer">Short Answer (Text Input)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Question Text</label>
                <textarea name="question_${questionCounter}" required></textarea>
            </div>
            <div class="answer-options" id="answerOptions_${questionCounter}">
                <div class="form-group">
                    <label>Answer Options (Select one correct answer)</label>
                    <div class="answer-options-container" id="answerOptions_${questionCounter}">
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionCounter}" value="0" required>
                            <input type="text" name="option_${questionCounter}_0" placeholder="Option 1" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionCounter}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionCounter}" value="1" required>
                            <input type="text" name="option_${questionCounter}_1" placeholder="Option 2" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionCounter}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionCounter}" value="2" required>
                            <input type="text" name="option_${questionCounter}_2" placeholder="Option 3" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionCounter}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionCounter}" value="3" required>
                            <input type="text" name="option_${questionCounter}_3" placeholder="Option 4" required autocomplete="off">
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
            console.log(`🔍 Copied question type: ${originalType} to question ${questionCounter}`);
        }
    }
    
    // Copy the checked state for correct answer inputs (radio/checkboxes)
    questionElement.querySelectorAll('input[name^="correct_"]:checked').forEach(originalCorrectInput => {
        const originalValue = originalCorrectInput.value;
        const clonedCorrectInput = clonedQuestion.querySelector(`input[name^="correct_${questionCounter}"][value="${originalValue}"]`);
        if (clonedCorrectInput) {
            clonedCorrectInput.checked = true;
            console.log(`🔍 Copied correct answer: ${originalValue} to question ${questionCounter}`);
        }
    });
    
    // Preserve the question text and options (don't clear them)
    // The content will be duplicated as-is, allowing users to edit the copy
    
    // Insert the cloned question after the original
    questionElement.insertAdjacentElement('afterend', clonedQuestion);
    
    // Show success message
    showToast('success', 'Success', 'Question duplicated successfully!');
}

// Change question type
function changeQuestionType(questionNum, questionType) {
    const answerOptions = document.getElementById(`answerOptions_${questionNum}`);
    if (!answerOptions) return;
    
    let optionsHtml = '';
    
    switch(questionType) {
        case 'multiple_choice':
            optionsHtml = `
                <div class="form-group">
                    <label>Answer Options (Select one correct answer)</label>
                    <div class="answer-options-container" id="answerOptions_${questionNum}">
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionNum}" value="0" required>
                            <input type="text" name="option_${questionNum}_0" placeholder="Option 1" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionNum}" value="1" required>
                            <input type="text" name="option_${questionNum}_1" placeholder="Option 2" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionNum}" value="2" required>
                            <input type="text" name="option_${questionNum}_2" placeholder="Option 3" required autocomplete="off">
                            <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="answer-option">
                            <input type="radio" name="correct_${questionNum}" value="3" required>
                            <input type="text" name="option_${questionNum}_3" placeholder="Option 4" required autocomplete="off">
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
function saveQuiz(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const isEditing = e.target.dataset.editingQuizId;
    
    const quizData = {
        id: isEditing || 'quiz_' + Date.now(),
        title: formData.get('quizTitle'),
        description: formData.get('quizDescription'),
        category: formData.get('quizCategory'),
        difficulty: formData.get('quizDifficulty'),
        questions: [],
        timeLimit: 15,
        passingScore: 70
    };
    
    // Extract questions
    const questionElements = document.querySelectorAll('.question-item');
    console.log('🔍 Found question elements:', questionElements.length);
    
    questionElements.forEach((element, index) => {
        const questionNum = element.dataset.question;
        const questionText = formData.get(`question_${questionNum}`);
        const questionType = formData.get(`questionType_${questionNum}`);
        
        console.log(`🔍 Question ${questionNum}:`, {
            text: questionText,
            type: questionType,
            element: element
        });
        
        if (!questionText || !questionType) {
            console.log(`⚠️ Skipping question ${questionNum} - missing text or type`);
            return;
        }
        
        let questionData = {
            id: `q${index + 1}`,
            question: questionText,
            type: questionType
        };
        
        switch(questionType) {
            case 'multiple_choice':
                const correctAnswer = parseInt(formData.get(`correct_${questionNum}`));
                const options = [];
                let optionIndex = 0;
                while (true) {
                    const optionText = formData.get(`option_${questionNum}_${optionIndex}`);
                    if (!optionText) break;
                    options.push(optionText);
                    optionIndex++;
                }
                
                console.log(`🔍 Multiple Choice Question ${questionNum}:`, {
                    correctAnswer,
                    options,
                    optionsLength: options.length,
                    isValid: options.length >= 2 && !isNaN(correctAnswer) && correctAnswer >= 0 && correctAnswer < options.length
                });
                
                if (options.length >= 2 && !isNaN(correctAnswer) && correctAnswer >= 0 && correctAnswer < options.length) {
                    questionData.options = options;
                    questionData.correct = correctAnswer;
                    quizData.questions.push(questionData);
                    console.log(`✅ Added multiple choice question ${questionNum}`);
                } else {
                    console.log(`❌ Skipped multiple choice question ${questionNum} - validation failed`);
                }
                break;
                
            case 'multiple_answer':
                const correctAnswers = formData.getAll(`correct_${questionNum}[]`).map(val => parseInt(val));
                const multiOptions = [];
                let multiOptionIndex = 0;
                while (true) {
                    const optionText = formData.get(`option_${questionNum}_${multiOptionIndex}`);
                    if (!optionText) break;
                    multiOptions.push(optionText);
                    multiOptionIndex++;
                }
                
                console.log(`🔍 Multiple Answer Question ${questionNum}:`, {
                    correctAnswers,
                    multiOptions,
                    optionsLength: multiOptions.length,
                    isValid: multiOptions.length >= 2 && correctAnswers.length > 0 && correctAnswers.every(val => val >= 0 && val < multiOptions.length)
                });
                
                if (multiOptions.length >= 2 && correctAnswers.length > 0 && correctAnswers.every(val => val >= 0 && val < multiOptions.length)) {
                    questionData.options = multiOptions;
                    questionData.correct = correctAnswers;
                    quizData.questions.push(questionData);
                    console.log(`✅ Added multiple answer question ${questionNum}`);
                } else {
                    console.log(`❌ Skipped multiple answer question ${questionNum} - validation failed`);
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
                }
                break;
        }
    });
    
    console.log('🔍 Final quiz data questions:', quizData.questions.length);
    console.log('🔍 Questions data:', quizData.questions);
    
    if (quizData.questions.length === 0) {
        showToast('error', 'Error', 'Please add at least one question.');
        return;
    }
    
    // Save quiz
    if (isEditing) {
        // Update existing quiz
        const quizIndex = currentQuizzes.findIndex(q => q.id === isEditing);
        if (quizIndex !== -1) {
            currentQuizzes[quizIndex] = quizData;
            showToast('success', 'Success', 'Quiz updated successfully!');
        } else {
            showToast('error', 'Error', 'Quiz not found for updating.');
            return;
        }
    } else {
        // Create new quiz
        currentQuizzes.push(quizData);
        showToast('success', 'Success', 'Quiz created successfully!');
    }
    
    saveQuizData();
    
    // Reset form
    e.target.reset();
    document.getElementById('questionsContainer').innerHTML = '';
    questionCounter = 0;
    delete e.target.dataset.editingQuizId;
    
    // Reset form title
    const formTitle = document.querySelector('.create-quiz-form h2');
    if (formTitle) {
        formTitle.textContent = 'Create New Quiz';
    }
    
    // Switch to available quizzes
    document.getElementById('availableQuizzes').click();
}

// Preview quiz
function previewQuiz(quizId) {
    const quiz = currentQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    // For now, just show an alert with quiz details
    alert(`Quiz Preview: ${quiz.title}\n\nDescription: ${quiz.description}\nQuestions: ${quiz.questions.length}\nTime Limit: ${quiz.timeLimit} minutes\nPassing Score: ${quiz.passingScore}%`);
}

// Toast notification system
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

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
            <input type="text" name="option_${questionNum}_${newIndex}" placeholder="Option ${newIndex + 1}" required autocomplete="off">
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
function deleteQuiz(quizId) {
    const quiz = currentQuizzes.find(q => q.id === quizId);
    if (!quiz) {
        showToast('error', 'Error', 'Quiz not found.');
        return;
    }
    
    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete the quiz "${quiz.title}"?\n\nThis action cannot be undone and will also delete all quiz results for this quiz.`);
    
    if (confirmed) {
        // Remove quiz from current quizzes
        const quizIndex = currentQuizzes.findIndex(q => q.id === quizId);
        if (quizIndex !== -1) {
            currentQuizzes.splice(quizIndex, 1);
            
            // Remove quiz results for this quiz
            quizResults = quizResults.filter(result => result.quizId !== quizId);
            saveQuizResults();
            
            // Save updated quiz list
            saveQuizData();
            
            // Refresh the quiz list display
            renderAvailableQuizzes();
            
            showToast('success', 'Success', `Quiz "${quiz.title}" has been deleted successfully.`);
        } else {
            showToast('error', 'Error', 'Quiz not found for deletion.');
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
    
    // Clear existing questions
    document.getElementById('questionsContainer').innerHTML = '';
    questionCounter = 0;
    
    // Add questions from the quiz
    quiz.questions.forEach((question, index) => {
        addQuestion();
        
        // Fill question data
        const questionElement = document.querySelector(`[data-question="${questionCounter}"]`);
        if (questionElement) {
            // Set question text
            const questionTextarea = questionElement.querySelector(`textarea[name="question_${questionCounter}"]`);
            if (questionTextarea) {
                questionTextarea.value = question.question || '';
            }
            
            // Set question type
            const questionTypeSelect = questionElement.querySelector(`select[name="questionType_${questionCounter}"]`);
            if (questionTypeSelect) {
                questionTypeSelect.value = question.type || 'multiple_choice';
                // Trigger change to update answer options
                questionTypeSelect.dispatchEvent(new Event('change'));
            }
            
            // Fill answer options based on type
            setTimeout(() => {
                fillAnswerOptions(questionCounter, question);
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
    if (!answerOptionsContainer) return;
    
    // Clear existing options
    answerOptionsContainer.innerHTML = '';
    
    if (question.type === 'multiple_choice' || question.type === 'multiple_answer') {
        // Add options
        question.options.forEach((option, index) => {
            const inputType = question.type === 'multiple_choice' ? 'radio' : 'checkbox';
            const nameAttribute = question.type === 'multiple_choice' ? `correct_${questionNum}` : `correct_${questionNum}[]`;
            
            const optionHtml = `
                <div class="answer-option">
                    <input type="${inputType}" name="${nameAttribute}" value="${index}" ${question.type === 'multiple_choice' ? 'required' : ''}>
                    <input type="text" name="option_${questionNum}_${index}" placeholder="Option ${index + 1}" value="${option}" required autocomplete="off">
                    <button type="button" class="remove-option-btn" onclick="removeAnswerOption(${questionNum}, this)" style="display: ${question.options.length > 2 ? 'inline-block' : 'none'}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            answerOptionsContainer.insertAdjacentHTML('beforeend', optionHtml);
        });
        
        // Set correct answers
        if (question.type === 'multiple_choice') {
            const correctRadio = answerOptionsContainer.querySelector(`input[type="radio"][value="${question.correct}"]`);
            if (correctRadio) {
                correctRadio.checked = true;
            }
        } else if (question.type === 'multiple_answer') {
            question.correct.forEach(correctIndex => {
                const correctCheckbox = answerOptionsContainer.querySelector(`input[type="checkbox"][value="${correctIndex}"]`);
                if (correctCheckbox) {
                    correctCheckbox.checked = true;
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
        question.correctAnswers.forEach((answer, index) => {
            const answerHtml = `
                <div class="short-answer-option">
                    <input type="text" name="correctAnswer_${questionNum}_${index}" placeholder="Correct answer ${index + 1}" value="${answer}" required>
                    <button type="button" class="remove-answer-btn" onclick="removeShortAnswer(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            answerOptionsContainer.insertAdjacentHTML('beforeend', answerHtml);
        });
        
        // Add "Add Answer" button
        const addButtonHtml = `
            <button type="button" class="add-answer-btn" onclick="addShortAnswer(${questionNum})">
                <i class="fas fa-plus"></i> Add Answer
            </button>
        `;
        answerOptionsContainer.insertAdjacentHTML('afterend', addButtonHtml);
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

console.log('✅ Quiz script loaded successfully');
