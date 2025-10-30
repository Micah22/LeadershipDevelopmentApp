// Database Configuration for Supabase
// This file contains the database connection and API setup

// Supabase configuration
const SUPABASE_URL = 'https://yjiqgrudlbtpghopbusz.supabase.co'; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaXFncnVkbGJ0cGdob3BidXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTgwMTcsImV4cCI6MjA3NjA5NDAxN30.q8ClHZrQzQUVqG9JCc0A_hUJkZ2WeUgL0h_KlQpZTMI'; // Replace with your Supabase anon key

// Service role key for bypassing RLS (use with caution)
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaXFncnVkbGJ0cGdob3BidXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUxODAxNywiZXhwIjoyMDc2MDk0MDE3fQ.DpwDuGo3fhsR6r3YqfPOdrBzrfjI3LK96MnVHX5Z9Pg'; // Replace with your service role key

// Database API endpoints
const API_BASE_URL = '/api'; // We'll create these as serverless functions

// Database service class
class DatabaseService {
    constructor() {
        this.supabaseUrl = SUPABASE_URL;
        this.supabaseKey = SUPABASE_ANON_KEY;
        this.serviceKey = SUPABASE_SERVICE_KEY;
        this.isConfigured = this.supabaseUrl !== 'YOUR_SUPABASE_URL';
    }

    // Generic API call method
    async apiCall(endpoint, method = 'GET', data = null) {
        if (!this.isConfigured) {
            console.error('Database not configured - no fallback available');
            throw new Error('Database not configured');
        }

        try {
            // Use service key for problematic endpoints that need to bypass RLS
            const useServiceKey = endpoint.includes('module_assignments') || endpoint.includes('unassigned_role_assignments') || endpoint.includes('quiz_assignments') || endpoint.includes('quizzes');
            const keyToUse = useServiceKey ? this.serviceKey : this.supabaseKey;
            
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${keyToUse}`,
                    'apikey': keyToUse
                }
            };

            // For POST and PATCH requests, we want to return the created/updated record
            if (method === 'POST' || method === 'PATCH') {
                options.headers['Prefer'] = 'return=representation';
            } else {
                options.headers['Prefer'] = 'return=minimal';
            }

            // Add bypass RLS header for problematic operations
            if (endpoint.includes('module_assignments') || endpoint.includes('unassigned_role_assignments') || endpoint.includes('quiz_assignments') || endpoint.includes('quizzes')) {
                options.headers['Prefer'] = 'return=representation,resolution=ignore-duplicates';
            }
            

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.supabaseUrl}/rest/v1/${endpoint}`, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Database API error details:`, {
                    status: response.status,
                    statusText: response.statusText,
                    endpoint: endpoint,
                    url: `${this.supabaseUrl}/rest/v1/${endpoint}`,
                    errorText: errorText,
                    method: method,
                    data: data
                });
                throw new Error(`Database API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            // Handle empty responses
            const text = await response.text();
            const result = text ? JSON.parse(text) : [];
            return result;
        } catch (error) {
            console.error('❌ Database API error - NO FALLBACK:', error.message);
            throw error; // Re-throw the error instead of falling back
        }
    }

    // Fallback to localStorage when database is not available
    fallbackToLocalStorage(endpoint, method, data) {
        
        try {
            if (endpoint.startsWith('users')) {
                return Promise.resolve(JSON.parse(localStorage.getItem('users') || '[]'));
            } else if (endpoint.startsWith('modules')) {
                return Promise.resolve(JSON.parse(localStorage.getItem('globalModules') || '[]'));
            } else if (endpoint.startsWith('user_progress')) {
                // Extract user ID from endpoint and get their progress
                const userId = endpoint.match(/user_id=eq\.([^&]+)/)?.[1];
                if (userId) {
                    // Find user by ID and get their progress
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const user = users.find(u => u.id === userId);
                    if (user) {
                        const userProgress = JSON.parse(localStorage.getItem(`userProgress_${user.username}`) || '{}');
                        // Convert to database format
                        const progressArray = Object.entries(userProgress).map(([moduleTitle, progress]) => ({
                            user_id: userId,
                            module_title: moduleTitle,
                            completed_tasks: progress.checklist ? progress.checklist.filter(t => t.completed).length : 0,
                            total_tasks: progress.checklist ? progress.checklist.length : 0,
                            progress_percentage: progress.checklist ? (progress.checklist.filter(t => t.completed).length / progress.checklist.length) * 100 : 0
                        }));
                        return Promise.resolve(progressArray);
                    }
                }
                return Promise.resolve([]);
            }
            return Promise.resolve([]);
        } catch (error) {
            console.error('localStorage fallback error:', error);
            return Promise.resolve([]);
        }
    }

    // User operations
    async getUsers() {
        return this.apiCall('users?select=*');
    }

    async createUser(userData) {
        try {
            const result = await this.apiCall('users', 'POST', userData);
            // Also save to localStorage for compatibility
            this.syncUsersToLocalStorage();
            return result;
        } catch (error) {
            console.error('Failed to create user in database:', error);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            const result = await this.apiCall(`users?id=eq.${userId}`, 'PATCH', userData);
            // Also save to localStorage for compatibility
            this.syncUsersToLocalStorage();
            return result;
        } catch (error) {
            console.error('Failed to update user in database:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const result = await this.apiCall(`users?id=eq.${userId}`, 'DELETE');
            // Also save to localStorage for compatibility
            this.syncUsersToLocalStorage();
            return result;
        } catch (error) {
            console.error('Failed to delete user in database:', error);
            throw error;
        }
    }

    // Helper method to sync users to localStorage
    async syncUsersToLocalStorage() {
        try {
            const users = await this.getUsers();
            localStorage.setItem('users', JSON.stringify(users));
        } catch (error) {
        }
    }

    // Roles operations
    async getRoles() {
        try {
            const roles = await this.apiCall('roles?select=*');
            return roles;
        } catch (error) {
            console.error('Failed to get roles from database:', error);
            // Fallback to localStorage
            const localRoles = JSON.parse(localStorage.getItem('roles') || '[]');
            return localRoles;
        }
    }

    async updateRole(roleId, roleData) {
        try {
            // Use service key for roles updates to bypass RLS if needed
            const endpoint = `roles?role_id=eq.${roleId}`;
            console.log('Updating role via endpoint:', endpoint);
            console.log('Role data being sent:', roleData);
            
            // Make a direct API call with service key to ensure update works
            const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.serviceKey}`,
                    'apikey': this.serviceKey,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(roleData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Role update failed:', response.status, errorText);
                throw new Error(`Failed to update role: ${response.status} ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Role update response:', result);
            
            // Also sync to localStorage for compatibility
            await this.syncRolesToLocalStorage();
            return result;
        } catch (error) {
            console.error('Failed to update role in database:', error);
            throw error;
        }
    }

    async deleteRole(roleId) {
        try {
            // Use service key for roles deletion to bypass RLS if needed
            const endpoint = `roles?role_id=eq.${roleId}`;
            console.log('Deleting role via endpoint:', endpoint);
            
            // Make a direct API call with service key
            const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.serviceKey}`,
                    'apikey': this.serviceKey,
                    'Prefer': 'return=representation'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Role deletion failed:', response.status, errorText);
                throw new Error(`Failed to delete role: ${response.status} ${errorText}`);
            }
            
            // Also sync to localStorage for compatibility
            await this.syncRolesToLocalStorage();
            return { success: true };
        } catch (error) {
            console.error('Failed to delete role in database:', error);
            throw error;
        }
    }

    // Helper method to sync roles to localStorage
    async syncRolesToLocalStorage() {
        try {
            const roles = await this.getRoles();
            localStorage.setItem('roles', JSON.stringify(roles));
        } catch (error) {
            console.error('Failed to sync roles to localStorage:', error);
        }
    }

    // Module operations
    async getModules() {
        return this.apiCall('modules?select=*&status=eq.active');
    }

    async createModule(moduleData) {
        try {
            const result = await this.apiCall('modules', 'POST', moduleData);
            // Also save to localStorage for compatibility
            this.syncModulesToLocalStorage();
            return result;
        } catch (error) {
            console.error('Failed to create module in database:', error);
            throw error;
        }
    }

    async updateModule(moduleId, moduleData) {
        try {
            console.log('🔄 Updating module in database:', moduleId, moduleData);
            const result = await this.apiCall(`modules?id=eq.${moduleId}`, 'PATCH', moduleData);
            console.log('✅ Module update result:', result);
            // Also save to localStorage for compatibility
            this.syncModulesToLocalStorage();
            return result;
        } catch (error) {
            console.error('❌ Failed to update module in database:', error);
            throw error;
        }
    }

    async deleteModule(moduleId) {
        try {
            const result = await this.apiCall(`modules?id=eq.${moduleId}`, 'DELETE');
            // Also save to localStorage for compatibility
            this.syncModulesToLocalStorage();
            return result;
        } catch (error) {
            console.error('Failed to delete module in database:', error);
            throw error;
        }
    }

    // Helper method to sync modules to localStorage
    async syncModulesToLocalStorage() {
        try {
            const modules = await this.getModules();
            localStorage.setItem('globalModules', JSON.stringify(modules));
        } catch (error) {
        }
    }

    // Checklist operations
    async getModuleChecklist(moduleId) {
        return this.apiCall(`module_checklist?module_id=eq.${moduleId}&order=order_index`);
    }

    async createChecklistItem(moduleId, taskText, orderIndex) {
        return this.apiCall('module_checklist', 'POST', {
            module_id: moduleId,
            task_text: taskText,
            order_index: orderIndex
        });
    }

    async updateChecklistItem(itemId, taskText) {
        return this.apiCall(`module_checklist?id=eq.${itemId}`, 'PATCH', {
            task_text: taskText
        });
    }

    async deleteChecklistItem(itemId) {
        return this.apiCall(`module_checklist?id=eq.${itemId}`, 'DELETE');
    }

    // User progress operations
    async getUserProgress(userId) {
        return this.apiCall(`user_progress?user_id=eq.${userId}&select=*`);
    }

    async deleteUserProgress(userId) {
        try {
            return await this.apiCall(`user_progress?user_id=eq.${userId}`, 'DELETE');
        } catch (error) {
            console.error('Failed to delete user progress:', error);
            throw error;
        }
    }

    async updateUserProgress(userId, moduleId, completedTasks, totalTasks, progressPercentage) {
        try {
            // First try to update existing record
            const updateResult = await this.apiCall(`user_progress?user_id=eq.${userId}&module_id=eq.${moduleId}`, 'PATCH', {
                completed_tasks: completedTasks,
                total_tasks: totalTasks,
                progress_percentage: progressPercentage
            });
            
            // If update returns empty array, record doesn't exist, so insert new one
            if (!updateResult || updateResult.length === 0) {
                const insertResult = await this.apiCall('user_progress', 'POST', {
                    user_id: userId,
                    module_id: moduleId,
                    completed_tasks: completedTasks,
                    total_tasks: totalTasks,
                    progress_percentage: progressPercentage
                });
                return insertResult;
            }
            
            // Also sync to localStorage for compatibility
            this.syncUserProgressToLocalStorage(userId);
            return updateResult;
        } catch (error) {
            console.error('Failed to update user progress in database:', error);
            throw error;
        }
    }

    async updateUserProgressWithChecklist(userId, moduleId, completedTasks, totalTasks, progressPercentage, checklist) {
        try {
            const updateData = {
                completed_tasks: completedTasks,
                total_tasks: totalTasks,
                progress_percentage: progressPercentage,
                checklist: checklist
            };
            
            const updateResult = await this.apiCall(`user_progress?user_id=eq.${userId}&module_id=eq.${moduleId}`, 'PATCH', updateData);
            
            if (!updateResult || updateResult.length === 0) {
                const insertData = {
                    user_id: userId,
                    module_id: moduleId,
                    completed_tasks: completedTasks,
                    total_tasks: totalTasks,
                    progress_percentage: progressPercentage,
                    checklist: checklist
                };
                const insertResult = await this.apiCall('user_progress', 'POST', insertData);
                return insertResult;
            }
            
            return updateResult;
        } catch (error) {
            console.error('Failed to update user progress with checklist in database:', error);
            throw error;
        }
    }

    // Helper method to sync user progress to localStorage
    async syncUserProgressToLocalStorage(userId) {
        try {
            const users = await this.getUsers();
            const user = users.find(u => u.id === userId);
            if (user) {
                const progress = await this.getUserProgress(userId);
                const userProgress = {};
                
                // Convert database format to localStorage format
                progress.forEach(p => {
                    userProgress[p.module_title] = {
                        checklist: Array(p.total_tasks).fill(false).map((_, i) => i < p.completed_tasks)
                    };
                });
                
                localStorage.setItem(`userProgress_${user.username}`, JSON.stringify(userProgress));
            }
        } catch (error) {
        }
    }

    // File operations
    async getModuleFiles(moduleId, checklistItemId = null) {
        let endpoint = `module_files?module_id=eq.${moduleId}`;
        if (checklistItemId) {
            endpoint += `&checklist_item_id=eq.${checklistItemId}`;
        }
        return this.apiCall(endpoint);
    }

    async uploadFile(moduleId, checklistItemId, fileName, fileContent, fileType, fileSize, uploadedBy) {
        return this.apiCall('module_files', 'POST', {
            module_id: moduleId,
            checklist_item_id: checklistItemId,
            file_name: fileName,
            file_content: fileContent,
            file_type: fileType,
            file_size: fileSize,
            uploaded_by: uploadedBy
        });
    }

    async deleteFile(fileId) {
        return this.apiCall(`module_files?id=eq.${fileId}`, 'DELETE');
    }

    // Performance review operations
    async getPerformanceReviews(userId, moduleId = null) {
        let endpoint = `performance_reviews?user_id=eq.${userId}`;
        if (moduleId) {
            endpoint += `&module_id=eq.${moduleId}`;
        }
        return this.apiCall(endpoint);
    }

    async createPerformanceReview(reviewData) {
        return this.apiCall('performance_reviews', 'POST', reviewData);
    }

    async updatePerformanceReview(reviewId, reviewData) {
        return this.apiCall(`performance_reviews?id=eq.${reviewId}`, 'PATCH', reviewData);
    }

    // Module Assignment Methods
    async getModuleAssignments(userId = null) {
        // Join with users and modules tables to get names and titles
        // Use specific foreign key relationships to avoid ambiguity
        const endpoint = userId 
            ? `module_assignments?user_id=eq.${userId}&select=*,users!module_assignments_user_id_fkey(full_name,username),modules!inner(title)`
            : 'module_assignments?select=*,users!module_assignments_user_id_fkey(full_name,username),modules!inner(title)';
        const assignments = await this.apiCall(endpoint);
        
        // Transform the data to include user_name and module_title
        return assignments.map(assignment => ({
            ...assignment,
            user_name: assignment.users?.full_name || 'Unknown User',
            module_title: assignment.modules?.title || 'Unknown Module'
        }));
    }

    async assignModuleToUser(userId, moduleId, assignedBy = null, dueDate = null, notes = null) {
        const assignment = {
            user_id: userId,
            module_id: moduleId,
            assigned_by: assignedBy,
            due_date: dueDate,
            notes: notes,
            status: 'assigned'
        };
        return await this.apiCall('module_assignments', 'POST', assignment);
    }

    async updateModuleAssignment(assignmentId, updates) {
        return await this.apiCall(`module_assignments?id=eq.${assignmentId}`, 'PATCH', updates);
    }

    async removeModuleAssignment(assignmentId) {
        return await this.apiCall(`module_assignments?id=eq.${assignmentId}`, 'DELETE');
    }

    async getUserAssignedModules(userId) {
        const assignments = await this.getModuleAssignments(userId);
        if (!assignments || assignments.length === 0) return [];
        
        // Get module details for each assignment
        const moduleIds = assignments.map(a => a.module_id);
        const modules = await this.getModules();
        return modules.filter(module => moduleIds.includes(module.id));
    }

    // Quiz Assignment Methods
    async getQuizAssignments(userId = null) {
        // Join with users table to get user names
        // Note: quizzes are stored in localStorage, so we can't join with a quizzes table
        const endpoint = userId 
            ? `quiz_assignments?user_id=eq.${userId}&select=*,users!quiz_assignments_user_id_fkey(full_name,username)`
            : 'quiz_assignments?select=*,users!quiz_assignments_user_id_fkey(full_name,username)';
        const assignments = await this.apiCall(endpoint);
        
        // Transform the data to include user_name and quiz_title
        // Load quiz titles from database instead of localStorage
        let quizTitles = {};
        try {
            const quizzes = await this.getQuizzes(); // Get all quizzes from database
            quizzes.forEach(quiz => {
                quizTitles[quiz.id] = quiz.title;
            });
        } catch (e) {
            console.warn('Failed to load quizzes from database for titles:', e);
            // Fallback to localStorage
            try {
                const savedQuizzes = localStorage.getItem('quizzes');
                if (savedQuizzes) {
                    const quizzes = JSON.parse(savedQuizzes);
                    quizzes.forEach(quiz => {
                        quizTitles[quiz.id] = quiz.title;
                    });
                }
            } catch (e2) {
                console.warn('Failed to load quizzes from localStorage:', e2);
            }
        }
        
        // Transform the data to include user_name and quiz_title
        return assignments.map(assignment => {
            return {
                ...assignment,
                user_name: assignment.users?.full_name || 'Unknown User',
                quiz_title: quizTitles[assignment.quiz_id] || assignment.quiz_id || 'Unknown Quiz'
            };
        });
    }

    async assignQuizToUser(userId, quizId, assignedBy = null, dueDate = null, notes = null) {
        const assignment = {
            user_id: userId,
            quiz_id: quizId,
            assigned_by: assignedBy,
            due_date: dueDate,
            notes: notes,
            status: 'assigned'
        };
        return await this.apiCall('quiz_assignments', 'POST', assignment);
    }

    async updateQuizAssignment(assignmentId, updates) {
        return await this.apiCall(`quiz_assignments?id=eq.${assignmentId}`, 'PATCH', updates);
    }

    async removeQuizAssignment(assignmentId) {
        return await this.apiCall(`quiz_assignments?id=eq.${assignmentId}`, 'DELETE');
    }

    async getUserAssignedQuizzes(userId) {
        const assignments = await this.getQuizAssignments(userId);
        if (!assignments || assignments.length === 0) return [];
        
        // Get quiz details from database for each assignment
        const quizIds = assignments.map(a => a.quiz_id);
        const quizzes = await this.getQuizzes();
        return quizzes.filter(quiz => quizIds.includes(quiz.id));
    }

    // Quiz Management Methods
    async getQuizzes(status = 'active') {
        try {
            // If status is null, get all quizzes; otherwise filter by status
            const endpoint = status ? `quizzes?status=eq.${status}&select=*` : 'quizzes?select=*';
            const quizzes = await this.apiCall(endpoint);
            
            // Transform database format to quiz script format
            return quizzes.map(quiz => ({
                id: quiz.id,
                title: quiz.title,
                description: quiz.description || '',
                category: quiz.category || '',
                difficulty: quiz.difficulty || 'beginner',
                tags: quiz.tags || (Array.isArray(quiz.tags) ? quiz.tags : []),
                questions: quiz.questions || (Array.isArray(quiz.questions) ? quiz.questions : []),
                timeLimit: quiz.time_limit || quiz.timeLimit || 15,
                passingScore: quiz.passing_score || quiz.passingScore || 70,
                status: quiz.status || 'active'
            }));
        } catch (error) {
            console.error('Failed to get quizzes from database:', error);
            // Fallback to localStorage
            try {
                const savedQuizzes = localStorage.getItem('quizzes');
                if (savedQuizzes) {
                    return JSON.parse(savedQuizzes);
                }
            } catch (e) {
                console.warn('Failed to load quizzes from localStorage fallback:', e);
            }
            return [];
        }
    }

    // Question Bank Methods
    async getBankQuestions() {
        return await this.apiCall('questions_bank?select=*');
    }
    async searchBankQuestions(query = '') {
        if (!query) return this.getBankQuestions();
        const q = encodeURIComponent(`%${query}%`);
        return await this.apiCall(`questions_bank?or=(title.ilike.${q},question.ilike.${q},category.ilike.${q})`);
    }
    async createBankQuestion(q) {
        const data = {
            title: q.title || null,
            question: q.question,
            type: q.type,
            options: q.options || [],
            correct: q.correct || null,
            points: q.points || 1,
            category: q.category || null,
            tags: q.tags || []
        };
        return await this.apiCall('questions_bank', 'POST', data);
    }
    async updateBankQuestion(id, updates) {
        const data = { ...updates, updated_at: new Date().toISOString() };
        return await this.apiCall(`questions_bank?id=eq.${id}`, 'PATCH', data);
    }
    async deleteBankQuestion(id) {
        return await this.apiCall(`questions_bank?id=eq.${id}`, 'DELETE');
    }

    async getQuiz(quizId) {
        try {
            const quizzes = await this.apiCall(`quizzes?id=eq.${quizId}&select=*`);
            if (quizzes && quizzes.length > 0) {
                const quiz = quizzes[0];
                // Transform to quiz script format
                return {
                    id: quiz.id,
                    title: quiz.title,
                    description: quiz.description || '',
                    category: quiz.category || '',
                    difficulty: quiz.difficulty || 'beginner',
                    tags: quiz.tags || (Array.isArray(quiz.tags) ? quiz.tags : []),
                    questions: quiz.questions || (Array.isArray(quiz.questions) ? quiz.questions : []),
                    timeLimit: quiz.time_limit || quiz.timeLimit || 15,
                    passingScore: quiz.passing_score || quiz.passingScore || 70,
                    status: quiz.status || 'active'
                };
            }
            return null;
        } catch (error) {
            console.error('Failed to get quiz from database:', error);
            return null;
        }
    }

    async createQuiz(quizData) {
        try {
            // Get current user ID for created_by
            let createdBy = null;
            try {
                const userStr = localStorage.getItem('currentUser');
                if (userStr) {
                    const currentUser = JSON.parse(userStr);
                    const users = await this.getUsers();
                    const user = users.find(u => u.username === currentUser.username || u.email === currentUser.email);
                    if (user && user.id) {
                        createdBy = user.id;
                    }
                }
            } catch (e) {
                console.warn('Failed to get current user for quiz creation:', e);
            }
            
            const dbQuizData = {
                id: quizData.id,
                title: quizData.title,
                description: quizData.description || null,
                category: quizData.category || null,
                difficulty: quizData.difficulty || 'beginner',
                tags: quizData.tags || [],
                questions: quizData.questions || [],
                time_limit: quizData.timeLimit || quizData.time_limit || 15,
                passing_score: quizData.passingScore || quizData.passing_score || 70,
                status: quizData.status || 'active',
                created_by: createdBy
            };
            
            return await this.apiCall('quizzes', 'POST', dbQuizData);
        } catch (error) {
            console.error('Failed to create quiz in database:', error);
            throw error;
        }
    }

    async updateQuiz(quizId, quizData) {
        try {
            const dbQuizData = {
                title: quizData.title,
                description: quizData.description || null,
                category: quizData.category || null,
                difficulty: quizData.difficulty || 'beginner',
                tags: quizData.tags || [],
                questions: quizData.questions || [],
                time_limit: quizData.timeLimit || quizData.time_limit || 15,
                passing_score: quizData.passingScore || quizData.passing_score || 70,
                status: quizData.status || 'active',
                updated_at: new Date().toISOString()
            };
            
            return await this.apiCall(`quizzes?id=eq.${quizId}`, 'PATCH', dbQuizData);
        } catch (error) {
            console.error('Failed to update quiz in database:', error);
            throw error;
        }
    }

    async deleteQuiz(quizId) {
        try {
            return await this.apiCall(`quizzes?id=eq.${quizId}`, 'DELETE');
        } catch (error) {
            console.error('Failed to delete quiz from database:', error);
            throw error;
        }
    }

    // Unassigned Role Assignments Methods
    async getUnassignedRoleAssignments(userId = null) {
        const endpoint = userId 
            ? `unassigned_role_assignments?user_id=eq.${userId}`
            : 'unassigned_role_assignments';
        return await this.apiCall(endpoint);
    }

    async addUnassignedRoleAssignment(userId, moduleId, unassignedBy = null) {
        const unassignedAssignment = {
            user_id: userId,
            module_id: moduleId,
            unassigned_by: unassignedBy
        };
        return await this.apiCall('unassigned_role_assignments', 'POST', unassignedAssignment);
    }

    async removeUnassignedRoleAssignment(userId, moduleId) {
        return await this.apiCall(`unassigned_role_assignments?user_id=eq.${userId}&module_id=eq.${moduleId}`, 'DELETE');
    }

    async isModuleUnassignedForUser(userId, moduleId) {
        try {
            // If moduleId looks like a title (contains spaces), look up the UUID
            let actualModuleId = moduleId;
            if (moduleId.includes(' ') || !moduleId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                // This is a module title, not a UUID - look up the UUID
                const modules = await this.apiCall(`modules?title=eq.${encodeURIComponent(moduleId)}&select=id`);
                if (modules && modules.length > 0) {
                    actualModuleId = modules[0].id;
                } else {
                    return false;
                }
            }
            
            const unassigned = await this.apiCall(`unassigned_role_assignments?user_id=eq.${userId}&module_id=eq.${actualModuleId}`);
            return unassigned && unassigned.length > 0;
        } catch (error) {
            console.error(`Error checking unassigned module for user ${userId}, module ${moduleId}:`, error);
            return false;
        }
    }

    // Module checklist management methods
    async deleteModuleChecklist(moduleId) {
        try {
            return await this.apiCall(`module_checklist?module_id=eq.${moduleId}`, 'DELETE');
        } catch (error) {
            console.error('Failed to delete module checklist:', error);
            throw error;
        }
    }

    async createModuleChecklistItem(taskData) {
        try {
            return await this.apiCall('module_checklist', 'POST', taskData);
        } catch (error) {
            console.error('Failed to create module checklist item:', error);
            throw error;
        }
    }

    async getModuleChecklist(moduleId) {
        try {
            return await this.apiCall(`module_checklist?module_id=eq.${moduleId}&order=order_index`);
        } catch (error) {
            console.error('Failed to get module checklist:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const result = await this.apiCall('users?select=count');
            return { success: true, result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Upload image to Supabase Storage
    async uploadImage(file, path) {
        try {
            if (!this.isConfigured) {
                throw new Error('Database not configured');
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);

            // Upload to Supabase Storage using service key to bypass RLS
            const response = await fetch(`${this.supabaseUrl}/storage/v1/object/quiz-images/${path}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.serviceKey}`,
                    'apikey': this.serviceKey
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Upload failed: ${errorData.message || response.statusText}`);
            }

            // Return the public URL
            const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/quiz-images/${path}`;
            console.log('✅ Image uploaded successfully:', publicUrl);
            return { success: true, url: publicUrl };
        } catch (error) {
            console.error('❌ Image upload failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete image from Supabase Storage
    async deleteImage(path) {
        try {
            if (!this.isConfigured) {
                throw new Error('Database not configured');
            }

            const response = await fetch(`${this.supabaseUrl}/storage/v1/object/quiz-images/${path}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.serviceKey}`,
                    'apikey': this.serviceKey
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Delete failed: ${errorData.message || response.statusText}`);
            }

            console.log('✅ Image deleted successfully:', path);
            return { success: true };
        } catch (error) {
            console.error('❌ Image delete failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate unique filename for image
    generateImagePath(quizId, questionId, optionIndex = null) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const filename = optionIndex !== null 
            ? `quiz-${quizId}/question-${questionId}/option-${optionIndex}-${timestamp}-${random}.jpg`
            : `quiz-${quizId}/question-${questionId}/question-${timestamp}-${random}.jpg`;
        return filename;
    }
}

// Create global database service instance
window.dbService = new DatabaseService();

// Debug database service initialization
console.log('Database service initialized:', {
    isConfigured: window.dbService.isConfigured,
    supabaseUrl: window.dbService.supabaseUrl,
    hasAnonKey: !!window.dbService.supabaseKey,
    hasServiceKey: !!window.dbService.serviceKey
});

// Test database connection
if (window.dbService.isConfigured) {
    window.dbService.testConnection().then(result => {
        console.log('Database connection test result:', result);
    }).catch(error => {
        console.error('Database connection test failed:', error);
    });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseService;
}
