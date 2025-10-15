// Database Configuration for Supabase
// This file contains the database connection and API setup

// Supabase configuration
const SUPABASE_URL = 'https://yjiqgrudlbtpghopbusz.supabase.co'; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaXFncnVkbGJ0cGdob3BidXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTgwMTcsImV4cCI6MjA3NjA5NDAxN30.q8ClHZrQzQUVqG9JCc0A_hUJkZ2WeUgL0h_KlQpZTMI'; // Replace with your Supabase anon key

// Database API endpoints
const API_BASE_URL = '/api'; // We'll create these as serverless functions

// Database service class
class DatabaseService {
    constructor() {
        this.supabaseUrl = SUPABASE_URL;
        this.supabaseKey = SUPABASE_ANON_KEY;
        this.isConfigured = this.supabaseUrl !== 'YOUR_SUPABASE_URL';
    }

    // Generic API call method
    async apiCall(endpoint, method = 'GET', data = null) {
        if (!this.isConfigured) {
            console.warn('Database not configured, falling back to localStorage');
            return this.fallbackToLocalStorage(endpoint, method, data);
        }

        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'apikey': this.supabaseKey,
                    'Prefer': 'return=minimal'
                }
            };

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.supabaseUrl}/rest/v1/${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`Database API error: ${response.status} ${response.statusText}`);
            }

            // Handle empty responses
            const text = await response.text();
            return text ? JSON.parse(text) : [];
        } catch (error) {
            console.warn('Database API error, using localStorage fallback:', error.message);
            return this.fallbackToLocalStorage(endpoint, method, data);
        }
    }

    // Fallback to localStorage when database is not available
    fallbackToLocalStorage(endpoint, method, data) {
        console.log('Using localStorage fallback for:', endpoint);
        
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
        return this.apiCall('users', 'POST', userData);
    }

    async updateUser(userId, userData) {
        return this.apiCall(`users?id=eq.${userId}`, 'PATCH', userData);
    }

    async deleteUser(userId) {
        return this.apiCall(`users?id=eq.${userId}`, 'DELETE');
    }

    // Module operations
    async getModules() {
        return this.apiCall('modules?select=*&status=eq.active');
    }

    async createModule(moduleData) {
        return this.apiCall('modules', 'POST', moduleData);
    }

    async updateModule(moduleId, moduleData) {
        return this.apiCall(`modules?id=eq.${moduleId}`, 'PATCH', moduleData);
    }

    async deleteModule(moduleId) {
        return this.apiCall(`modules?id=eq.${moduleId}`, 'DELETE');
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

    async updateUserProgress(userId, moduleId, completedTasks, totalTasks, progressPercentage) {
        return this.apiCall('user_progress', 'POST', {
            user_id: userId,
            module_id: moduleId,
            completed_tasks: completedTasks,
            total_tasks: totalTasks,
            progress_percentage: progressPercentage
        });
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
}

// Create global database service instance
window.dbService = new DatabaseService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseService;
}
