// Example of how to integrate the database service into your existing code
// This shows how to replace localStorage calls with database calls

// BEFORE (localStorage):
/*
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}
*/

// AFTER (Database):
async function getUsers() {
    try {
        const users = await window.dbService.getUsers();
        return users;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        // Fallback to localStorage if database fails
        return JSON.parse(localStorage.getItem('users') || '[]');
    }
}

async function saveUsers(users) {
    try {
        // Save each user to database
        for (const user of users) {
            if (user.id) {
                // Update existing user
                await window.dbService.updateUser(user.id, user);
            } else {
                // Create new user
                await window.dbService.createUser(user);
            }
        }
        return true;
    } catch (error) {
        console.error('Failed to save users:', error);
        // Fallback to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        return false;
    }
}

// Example: Updating user progress
async function updateUserProgress(username, moduleTitle, taskIndex, isCompleted) {
    try {
        // Get user ID
        const users = await getUsers();
        const user = users.find(u => u.username === username);
        if (!user) throw new Error('User not found');

        // Get module ID
        const modules = await getModules();
        const module = modules.find(m => m.title === moduleTitle);
        if (!module) throw new Error('Module not found');

        // Get current progress
        const progress = await window.dbService.getUserProgress(user.id);
        const moduleProgress = progress.find(p => p.module_id === module.id);

        // Calculate new progress
        const checklist = await window.dbService.getModuleChecklist(module.id);
        const totalTasks = checklist.length;
        const completedTasks = isCompleted ? 
            (moduleProgress?.completed_tasks || 0) + 1 : 
            Math.max((moduleProgress?.completed_tasks || 0) - 1, 0);

        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Update progress in database
        await window.dbService.updateUserProgress(
            user.id,
            module.id,
            completedTasks,
            totalTasks,
            progressPercentage
        );

        console.log(`Updated progress for ${username} - ${moduleTitle}: ${completedTasks}/${totalTasks} (${progressPercentage.toFixed(1)}%)`);
        return true;

    } catch (error) {
        console.error('Failed to update user progress:', error);
        // Fallback to localStorage
        const userProgressKey = `userProgress_${username}`;
        const userProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{}');
        
        if (!userProgress[moduleTitle]) {
            userProgress[moduleTitle] = { checklist: [] };
        }
        
        userProgress[moduleTitle].checklist[taskIndex] = isCompleted;
        localStorage.setItem(userProgressKey, JSON.stringify(userProgress));
        return false;
    }
}

// Example: Loading modules with checklist
async function getModules() {
    try {
        const modules = await window.dbService.getModules();
        
        // Load checklist for each module
        for (const module of modules) {
            const checklist = await window.dbService.getModuleChecklist(module.id);
            module.checklist = checklist.map(item => item.task_text);
        }
        
        return modules;
    } catch (error) {
        console.error('Failed to fetch modules:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('globalModules') || '[]');
    }
}

// Example: File upload
async function uploadFile(moduleTitle, taskIndex, file) {
    try {
        // Get module ID
        const modules = await getModules();
        const module = modules.find(m => m.title === moduleTitle);
        if (!module) throw new Error('Module not found');

        // Get checklist item ID
        const checklist = await window.dbService.getModuleChecklist(module.id);
        const checklistItem = checklist[taskIndex];
        if (!checklistItem) throw new Error('Checklist item not found');

        // Convert file to base64
        const base64Content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // Get current user
        const username = localStorage.getItem('username');
        const users = await getUsers();
        const user = users.find(u => u.username === username);

        // Upload file to database
        await window.dbService.uploadFile(
            module.id,
            checklistItem.id,
            file.name,
            base64Content,
            file.type,
            file.size,
            user?.id
        );

        console.log(`File uploaded: ${file.name}`);
        return true;

    } catch (error) {
        console.error('Failed to upload file:', error);
        return false;
    }
}

// Example: Performance review
async function savePerformanceReview(username, moduleTitle, reviewData) {
    try {
        // Get user and module IDs
        const users = await getUsers();
        const user = users.find(u => u.username === username);
        const modules = await getModules();
        const module = modules.find(m => m.title === moduleTitle);

        if (!user || !module) throw new Error('User or module not found');

        // Save review to database
        await window.dbService.createPerformanceReview({
            user_id: user.id,
            module_id: module.id,
            overall_rating: reviewData.overallRating,
            trainer_comments: reviewData.trainerComments,
            team_member_goals: reviewData.teamMemberGoals,
            trainer_signature: reviewData.trainerSignature,
            trainee_initials: reviewData.traineeInitials,
            review_date: reviewData.reviewDate
        });

        console.log(`Performance review saved for ${username} - ${moduleTitle}`);
        return true;

    } catch (error) {
        console.error('Failed to save performance review:', error);
        return false;
    }
}

// Initialize database service when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Load database configuration
    const configScript = document.createElement('script');
    configScript.src = 'database/config.js';
    document.head.appendChild(configScript);

    configScript.onload = () => {
        console.log('Database service initialized');
        
        // Check if database is configured
        if (window.dbService.isConfigured) {
            console.log('✅ Database is configured and ready');
        } else {
            console.log('⚠️ Database not configured, using localStorage fallback');
        }
    };
});
