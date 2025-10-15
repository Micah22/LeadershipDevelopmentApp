// Migration script to move localStorage data to Supabase database
// Run this script once to migrate your existing data

class DataMigration {
    constructor() {
        this.dbService = window.dbService;
    }

    // Main migration function
    async migrateAllData() {
        console.log('Starting data migration from localStorage to database...');
        
        try {
            // Migrate users
            await this.migrateUsers();
            
            // Migrate modules
            await this.migrateModules();
            
            // Migrate user progress
            await this.migrateUserProgress();
            
            console.log('✅ Data migration completed successfully!');
            
            // Optionally clear localStorage after successful migration
            // this.clearLocalStorage();
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    }

    // Migrate users from localStorage to database
    async migrateUsers() {
        console.log('Migrating users...');
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        for (const user of users) {
            try {
                // Check if user already exists
                const existingUsers = await this.dbService.getUsers();
                const userExists = existingUsers.some(u => u.username === user.username);
                
                if (!userExists) {
                    const userData = {
                        username: user.username,
                        full_name: user.fullName,
                        email: user.email || `${user.username}@company.com`,
                        password_hash: btoa(user.password), // Simple encoding - you should use proper hashing
                        role: user.role,
                        status: user.status || 'active',
                        start_date: user.startDate || new Date().toISOString().split('T')[0]
                    };
                    
                    await this.dbService.createUser(userData);
                    console.log(`✅ Migrated user: ${user.username}`);
                } else {
                    console.log(`⏭️ User already exists: ${user.username}`);
                }
            } catch (error) {
                console.error(`❌ Failed to migrate user ${user.username}:`, error);
            }
        }
    }

    // Migrate modules from localStorage to database
    async migrateModules() {
        console.log('Migrating modules...');
        
        const modules = JSON.parse(localStorage.getItem('globalModules') || '[]');
        
        for (const module of modules) {
            try {
                // Check if module already exists
                const existingModules = await this.dbService.getModules();
                const moduleExists = existingModules.some(m => m.title === module.title);
                
                if (!moduleExists) {
                    const moduleData = {
                        title: module.title,
                        description: module.description,
                        required_role: module.requiredRole,
                        difficulty: module.difficulty || 'Phase 1',
                        duration: module.duration || 1,
                        prerequisites: module.prerequisites || '',
                        author: module.author || 'Training Team',
                        version: module.version || '1.0',
                        tags: module.tags || '',
                        quality_unsatisfactory: module.qualityUnsatisfactory || '',
                        quality_average: module.qualityAverage || '',
                        quality_excellent: module.qualityExcellent || '',
                        speed_unsatisfactory: module.speedUnsatisfactory || '',
                        speed_average: module.speedAverage || '',
                        speed_excellent: module.speedExcellent || '',
                        communication_unsatisfactory: module.communicationUnsatisfactory || '',
                        communication_average: module.communicationAverage || '',
                        communication_excellent: module.communicationExcellent || '',
                        status: 'active'
                    };
                    
                    const createdModule = await this.dbService.createModule(moduleData);
                    console.log(`✅ Migrated module: ${module.title}`);
                    
                    // Migrate checklist items
                    if (module.checklist && module.checklist.length > 0) {
                        await this.migrateChecklistItems(createdModule[0].id, module.checklist);
                    }
                } else {
                    console.log(`⏭️ Module already exists: ${module.title}`);
                }
            } catch (error) {
                console.error(`❌ Failed to migrate module ${module.title}:`, error);
            }
        }
    }

    // Migrate checklist items for a module
    async migrateChecklistItems(moduleId, checklist) {
        for (let i = 0; i < checklist.length; i++) {
            try {
                await this.dbService.createChecklistItem(moduleId, checklist[i], i);
            } catch (error) {
                console.error(`❌ Failed to migrate checklist item ${i}:`, error);
            }
        }
    }

    // Migrate user progress from localStorage to database
    async migrateUserProgress() {
        console.log('Migrating user progress...');
        
        // Get all users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        for (const user of users) {
            try {
                const userProgressKey = `userProgress_${user.username}`;
                const userProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{}');
                
                // Get user ID from database
                const dbUsers = await this.dbService.getUsers();
                const dbUser = dbUsers.find(u => u.username === user.username);
                
                if (!dbUser) {
                    console.log(`⏭️ User not found in database: ${user.username}`);
                    continue;
                }
                
                // Get modules from database
                const dbModules = await this.dbService.getModules();
                
                for (const [moduleTitle, progressData] of Object.entries(userProgress)) {
                    const dbModule = dbModules.find(m => m.title === moduleTitle);
                    
                    if (!dbModule) {
                        console.log(`⏭️ Module not found in database: ${moduleTitle}`);
                        continue;
                    }
                    
                    // Calculate progress
                    let completedTasks = 0;
                    let totalTasks = 0;
                    
                    if (progressData.checklist && Array.isArray(progressData.checklist)) {
                        totalTasks = progressData.checklist.length;
                        completedTasks = progressData.checklist.filter(task => task.completed).length;
                    }
                    
                    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                    
                    try {
                        await this.dbService.updateUserProgress(
                            dbUser.id,
                            dbModule.id,
                            completedTasks,
                            totalTasks,
                            progressPercentage
                        );
                        console.log(`✅ Migrated progress for ${user.username} - ${moduleTitle}`);
                    } catch (error) {
                        console.error(`❌ Failed to migrate progress for ${user.username} - ${moduleTitle}:`, error);
                    }
                }
            } catch (error) {
                console.error(`❌ Failed to migrate progress for user ${user.username}:`, error);
            }
        }
    }

    // Clear localStorage after successful migration (optional)
    clearLocalStorage() {
        console.log('Clearing localStorage...');
        
        const keysToKeep = ['theme']; // Keep theme preference
        const allKeys = Object.keys(localStorage);
        
        for (const key of allKeys) {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        }
        
        console.log('✅ localStorage cleared');
    }

    // Verify migration success
    async verifyMigration() {
        console.log('Verifying migration...');
        
        try {
            const dbUsers = await this.dbService.getUsers();
            const dbModules = await this.dbService.getModules();
            
            console.log(`✅ Database contains ${dbUsers.length} users and ${dbModules.length} modules`);
            
            // Check user progress
            let totalProgress = 0;
            for (const user of dbUsers) {
                const progress = await this.dbService.getUserProgress(user.id);
                totalProgress += progress.length;
            }
            
            console.log(`✅ Database contains ${totalProgress} user progress records`);
            
        } catch (error) {
            console.error('❌ Verification failed:', error);
        }
    }
}

// Create global migration instance
window.dataMigration = new DataMigration();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataMigration;
}
