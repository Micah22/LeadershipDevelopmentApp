// Notification Service - Comprehensive notification system
// Supports both in-app and browser notifications

class NotificationService {
    constructor() {
        this.permission = 'default';
        this.notifications = [];
        this.maxNotifications = 5;
        this.autoHideDelay = 5000; // 5 seconds
        this.init();
    }

    async init() {
        // Request notification permission
        await this.requestPermission();
        
        // Create notification container
        this.createNotificationContainer();
        
        // Set up notification center
        this.setupNotificationCenter();
        
        // Set up periodic checks
        this.setupPeriodicChecks();
        
        // Load existing notifications
        this.loadNotifications();
        
        // Show permission request notification if not granted
        if (this.permission !== 'granted') {
            setTimeout(() => {
                this.showInfo(
                    'Enable browser notifications to get alerts even when the app is closed.',
                    'Enable Notifications'
                );
            }, 2000);
        }
        
        // Notification Service initialized
    }

    async requestPermission() {
        if ('Notification' in window) {
            try {
        this.permission = await Notification.requestPermission();
            } catch (error) {
                console.error('Error requesting notification permission:', error);
                this.permission = 'denied';
            }
        } else {
            // Browser does not support notifications
            this.permission = 'denied';
        }
    }

    createNotificationContainer() {
        // Remove existing container if it exists
        const existingContainer = document.getElementById('notification-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create notification container
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        
        // Add mobile-specific styles
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.left = '10px';
        container.style.zIndex = '10004';
        container.style.pointerEvents = 'auto';
        
        document.body.appendChild(container);
        // console.log('Notification container created with mobile styles');
    }

    setupNotificationCenter() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeNotificationCenter());
        } else {
            this.initializeNotificationCenter();
        }
        
        // Also try to initialize after a delay for mobile devices
        setTimeout(() => {
            this.initializeNotificationCenter();
        }, 1000);
    }

    initializeNotificationCenter() {
        const bellButton = document.getElementById('notificationBell');
        const notificationCenter = document.getElementById('notificationCenter');
        const clearAllBtn = document.getElementById('clearAllNotifications');
        const badge = document.getElementById('notificationBadge');

        if (!bellButton || !notificationCenter) {
            // console.log('Notification center elements not found, retrying...');
            setTimeout(() => this.initializeNotificationCenter(), 100);
            return;
        }

        // Set up bell button click handler (desktop and mobile)
        bellButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // console.log('Bell button clicked');
            this.toggleNotificationCenter();
        });
        
        // Add touch event for mobile
        bellButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // console.log('Bell button touched');
            this.toggleNotificationCenter();
        });
        
        // Add touchend event for better mobile compatibility
        bellButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // console.log('Bell button touch ended');
            this.toggleNotificationCenter();
        });
        
        // Add pointer events for modern mobile browsers
        bellButton.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') {
                e.preventDefault();
                e.stopPropagation();
                // console.log('Bell button pointer down (touch)');
                this.toggleNotificationCenter();
            }
        });

        // Set up clear all button
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.clearAllNotifications();
            });
            
            clearAllBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.clearAllNotifications();
            });
        }

        // Set up mark all as read button
        const markAllAsReadBtn = document.getElementById('markAllAsRead');
        if (markAllAsReadBtn) {
            markAllAsReadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.markAllAsRead();
            });
            
            markAllAsReadBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.markAllAsRead();
            });
        }

        // Prevent clicks inside notification center from closing it
        notificationCenter.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Prevent touch events inside notification center from closing it
        notificationCenter.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        });

        // Close notification center when clicking outside
        document.addEventListener('click', (e) => {
            // Only close if clicking outside both the bell button and notification center
            if (!notificationCenter.contains(e.target) && !bellButton.contains(e.target)) {
                this.hideNotificationCenter();
            }
        });
        
        // Close notification center when touching outside (mobile)
        document.addEventListener('touchstart', (e) => {
            // Only close if touching outside both the bell button and notification center
            if (!notificationCenter.contains(e.target) && !bellButton.contains(e.target)) {
                this.hideNotificationCenter();
            }
        });

        // Update notification center content
        this.updateNotificationCenter();
        
        // console.log('Notification center initialized');
    }

    toggleNotificationCenter() {
        // console.log('toggleNotificationCenter called');
        const notificationCenter = document.getElementById('notificationCenter');
        if (!notificationCenter) {
            // console.log('Notification center not found');
            return;
        }

        if (notificationCenter.classList.contains('show')) {
            // Hiding notification center
            this.hideNotificationCenter();
        } else {
            // Showing notification center
            this.showNotificationCenter();
        }
    }

    showNotificationCenter() {
        const notificationCenter = document.getElementById('notificationCenter');
        if (!notificationCenter) {
            // console.log('Notification center element not found');
            return;
        }

        notificationCenter.classList.add('show');
        this.updateNotificationCenter();
    }

    hideNotificationCenter() {
        const notificationCenter = document.getElementById('notificationCenter');
        if (!notificationCenter) return;

        notificationCenter.classList.remove('show');
    }

    updateNotificationCenter() {
        const content = document.getElementById('notificationCenterContent');
        const badge = document.getElementById('notificationBadge');
        
        if (!content) return;

        // Clear existing content
        content.innerHTML = '';

        // Show all notifications in bell menu (dismissed just means hidden from screen)
        if (this.notifications.length === 0) {
            content.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
        } else {
            // Show notifications in order (newest first - they're already added to beginning of array)
            this.notifications.forEach(notification => {
                const notificationElement = this.createNotificationCenterItem(notification);
                content.appendChild(notificationElement);
            });
        }

        // Update badge with unread count only
        if (badge) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount;
            
            if (unreadCount > 0) {
                badge.classList.add('show');
                if (unreadCount > 9) {
                    badge.textContent = '9+';
                }
            } else {
                badge.classList.remove('show');
            }
        }
    }

    createNotificationCenterItem(notification) {
        const item = document.createElement('div');
        item.className = `notification-center-item ${notification.type} ${notification.read ? 'read' : 'unread'}`;
        
        const timeAgo = this.getTimeAgo(notification.timestamp);
        
        item.innerHTML = `
            <div class="notification-center-item-icon">
                <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
            </div>
            <div class="notification-center-item-content" onclick="notificationService.markAsRead(${notification.id})">
                <div class="notification-center-item-title">${notification.title}</div>
                <div class="notification-center-item-message">${notification.message}</div>
                <div class="notification-center-item-time">${timeAgo}</div>
            </div>
            <div class="notification-center-item-actions">
                ${!notification.read ? `<button class="mark-read-btn" onclick="notificationService.markAsRead(${notification.id})" title="Mark as read">
                    <i class="fas fa-check"></i>
                </button>` : ''}
                <button class="notification-center-item-close" onclick="notificationService.removeNotificationFromCenter(${notification.id})" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        return item;
    }

    removeNotificationFromCenter(id) {
        this.closeNotification(id);
        this.updateNotificationCenter();
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationCenter();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.saveNotifications();
        this.updateNotificationCenter();
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }
    }

    setupPeriodicChecks() {
        // Check for deadline warnings every hour
        setInterval(() => {
            this.checkDeadlineWarnings();
        }, 60 * 60 * 1000); // 1 hour

        // Check for progress reminders every 6 hours
        setInterval(() => {
            this.checkProgressReminders();
        }, 6 * 60 * 60 * 1000); // 6 hours

        // Check for system updates every 12 hours
        setInterval(() => {
            this.checkSystemUpdates();
        }, 12 * 60 * 60 * 1000); // 12 hours
    }

    // Main notification method
    showNotification(type, title, message, options = {}) {
        const notification = {
            id: Date.now() + Math.random(),
            type,
            title,
            message,
            timestamp: new Date(),
            read: false,
            ...options
        };

        // Add to notifications array
        this.notifications.unshift(notification);
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }

        // Show in-app notification
        this.showInAppNotification(notification);

        // Show browser notification if permission granted
        if (this.permission === 'granted') {
            this.showBrowserNotification(notification);
        }

        // Store in localStorage for persistence
        this.saveNotifications();

        // Update notification center
        this.updateNotificationCenter();

        return notification;
    }

    isMobile() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    showInAppNotification(notification) {
        // Use the existing toast system instead of custom notifications
        if (typeof window.showToast === 'function') {
            try {
                window.showToast(notification.type, notification.title, notification.message, this.autoHideDelay);
            } catch (error) {
                console.error('Error calling showToast:', error);
                this.showCustomNotification(notification);
            }
        } else {
            // Fallback to custom notification if toast system not available
            this.showCustomNotification(notification);
        }
    }
    
    showCustomNotification(notification) {
        // Ensure container exists
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.position = 'fixed';
            container.style.top = '10px';
            container.style.left = '10px';
            container.style.right = '10px';
            container.style.zIndex = '99999';
            container.style.pointerEvents = 'auto';
            document.body.appendChild(container);
        }

        // Creating simple notification element
        const notificationElement = document.createElement('div');
        notificationElement.id = `notification-${notification.id}`;
        
        // Apply all styles directly - no CSS classes
        notificationElement.style.position = 'relative';
        notificationElement.style.width = '100%';
        notificationElement.style.marginBottom = '10px';
        notificationElement.style.background = 'white';
        notificationElement.style.border = '3px solid #d32f2f';
        notificationElement.style.borderRadius = '8px';
        notificationElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        notificationElement.style.padding = '15px';
        notificationElement.style.boxSizing = 'border-box';
        notificationElement.style.display = 'flex';
        notificationElement.style.alignItems = 'center';
        notificationElement.style.justifyContent = 'space-between';
        notificationElement.style.opacity = '1';
        notificationElement.style.visibility = 'visible';
        notificationElement.style.transform = 'translateX(0)';
        
        // Simple content - no complex HTML
        notificationElement.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${notification.title}</div>
                <div style="color: #666; font-size: 14px;">${notification.message}</div>
            </div>
            <button onclick="notificationService.dismissNotification(${notification.id})" style="background: none; border: none; color: #666; font-size: 18px; cursor: pointer; margin-left: 10px;">×</button>
        `;

        container.appendChild(notificationElement);

        // Auto-hide after delay (but keep in bell menu)
        setTimeout(() => {
            this.dismissNotification(notification.id);
        }, this.autoHideDelay);
    }

    showBrowserNotification(notification) {
        if (this.permission !== 'granted') return;

        const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/assets/CFA_CSymbol_Circle_Red_PMS.webp',
            badge: '/assets/CFA_CSymbol_Circle_Red_PMS.webp',
            tag: notification.id,
            requireInteraction: notification.type === 'deadline' || notification.type === 'assignment'
        });

        // Auto-close browser notification
        setTimeout(() => {
            browserNotification.close();
        }, this.autoHideDelay);
    }

    dismissNotification(id) {
        // Only hide the in-screen notification, keep in bell menu
        const notificationElement = document.getElementById(`notification-${id}`);
        if (notificationElement) {
            notificationElement.classList.add('hide');
            setTimeout(() => {
                notificationElement.remove();
            }, 300);
        }

        // Don't mark as dismissed - keep in bell menu for manual clearing
        // Just update the notification center to reflect current state
        this.updateNotificationCenter();
    }

    closeNotification(id) {
        const notificationElement = document.getElementById(`notification-${id}`);
        if (notificationElement) {
            notificationElement.classList.add('hide');
            setTimeout(() => {
                notificationElement.remove();
            }, 300);
        }

        // Permanently remove from notifications array
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        
        // Update notification center
        this.updateNotificationCenter();
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle',
            'error': 'fa-exclamation-circle',
            'deadline': 'fa-clock',
            'assignment': 'fa-tasks',
            'progress': 'fa-chart-line',
            'update': 'fa-sync-alt'
        };
        return icons[type] || 'fa-bell';
    }

    // Specific notification types
    showDeadlineWarning(moduleTitle, daysLeft) {
        const title = 'Deadline Warning';
        const message = `${moduleTitle} is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
        return this.showNotification('deadline', title, message, {
            priority: 'high',
            autoHideDelay: 10000
        });
    }

    showSystemUpdate(updateTitle, updateMessage) {
        const title = 'System Update';
        const message = `${updateTitle}: ${updateMessage}`;
        return this.showNotification('update', title, message, {
            priority: 'medium'
        });
    }

    showModuleAssignment(moduleTitle, assignedBy) {
        const title = 'New Module Assigned';
        const message = `You have been assigned "${moduleTitle}" by ${assignedBy}`;
        return this.showNotification('assignment', title, message, {
            priority: 'high',
            autoHideDelay: 8000
        });
    }

    showProgressReminder(progressPercentage, nextTask) {
        const title = 'Progress Reminder';
        const message = `You're ${progressPercentage}% complete. Next: ${nextTask}`;
        return this.showNotification('progress', title, message, {
            priority: 'medium'
        });
    }

    showSuccess(message, title = 'Success') {
        return this.showNotification('success', title, message);
    }

    showError(message, title = 'Error') {
        return this.showNotification('error', title, message, {
            autoHideDelay: 0 // Don't auto-hide errors
        });
    }

    showInfo(message, title = 'Information') {
        return this.showNotification('info', title, message);
    }

    showWarning(message, title = 'Warning') {
        return this.showNotification('warning', title, message);
    }

    // Check methods for periodic notifications
    checkDeadlineWarnings() {
        const username = localStorage.getItem('username');
        if (!username) return;

        const userProgress = this.getUserProgress(username);
        const leadershipPaths = this.getLeadershipPaths();
        const currentDate = new Date();

        leadershipPaths.forEach(path => {
            const pathProgress = userProgress[path.title];
            if (pathProgress && pathProgress.deadline) {
                const deadline = new Date(pathProgress.deadline);
                const daysLeft = Math.ceil((deadline - currentDate) / (1000 * 60 * 60 * 24));
                
                if (daysLeft <= 3 && daysLeft > 0) {
                    this.showDeadlineWarning(path.title, daysLeft);
                }
            }
        });
    }

    checkProgressReminders() {
        const username = localStorage.getItem('username');
        if (!username) return;

        const userProgress = this.getUserProgress(username);
        const leadershipPaths = this.getLeadershipPaths();
        const user = this.getCurrentUser();

        if (!user) return;

        let totalCompleted = 0;
        let totalTasks = 0;
        let nextTask = '';

        leadershipPaths.forEach(path => {
            if (this.isPathUnlocked(path, user.role)) {
                totalTasks += (path.checklist || []).length;
                const pathProgress = userProgress[path.title];
                
                if (pathProgress && pathProgress.checklist) {
                    const completed = pathProgress.checklist.filter(task => task === true).length;
                    totalCompleted += completed;
                    
                    // Find next incomplete task
                    if (!nextTask) {
                        const incompleteIndex = pathProgress.checklist.findIndex(task => task === false);
                        if (incompleteIndex !== -1) {
                            nextTask = path.checklist[incompleteIndex];
                        }
                    }
                }
            }
        });

        const progressPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
        
        // Show reminder if progress is low or stagnant
        if (progressPercentage < 50 || (progressPercentage > 0 && progressPercentage < 100)) {
            this.showProgressReminder(progressPercentage, nextTask || 'Complete your modules');
        }
    }

    checkSystemUpdates() {
        // Check for system updates (this would typically come from a server)
        // For now, we'll simulate occasional updates
        const lastUpdateCheck = localStorage.getItem('lastUpdateCheck');
        const now = new Date();
        
        if (!lastUpdateCheck || (now - new Date(lastUpdateCheck)) > 24 * 60 * 60 * 1000) {
            // Simulate system update
            const updates = [
                { title: 'New Training Module', message: 'Advanced Leadership Skills module is now available' },
                { title: 'UI Improvements', message: 'Enhanced user interface with better navigation' },
                { title: 'Performance Updates', message: 'Faster loading times and improved responsiveness' }
            ];
            
            const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
            this.showSystemUpdate(randomUpdate.title, randomUpdate.message);
            
            localStorage.setItem('lastUpdateCheck', now.toISOString());
        }
    }

    // Helper methods
    getUserProgress(username) {
        const userProgressKey = `userProgress_${username}`;
        const progress = localStorage.getItem(userProgressKey);
        return progress ? JSON.parse(progress) : {};
    }

    getLeadershipPaths() {
        const modules = localStorage.getItem('globalModules');
        return modules ? JSON.parse(modules) : [];
    }

    getCurrentUser() {
        const username = localStorage.getItem('username');
        const users = this.getUsers();
        return users.find(u => u.username === username);
    }

    getUsers() {
        const usersData = localStorage.getItem('users');
        return usersData ? JSON.parse(usersData) : [];
    }

    isPathUnlocked(path, userRole) {
        const roleHierarchy = {
            'Team Member': 1,
            'Trainer': 2,
            'Assistant Supervisor': 3,
            'Supervisor': 4,
            'Director': 5,
            'Admin': 6
        };
        
        const userLevel = roleHierarchy[userRole] || 1;
        const pathLevel = roleHierarchy[path.requiredRole] || 1;
        
        return userLevel >= pathLevel;
    }

    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
    }

    // Clear all notifications
    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
        
        // Update notification center
        this.updateNotificationCenter();
    }

    // Get notification history
    getNotificationHistory() {
        return this.notifications;
    }
}

// Initialize global notification service
window.notificationService = new NotificationService();

// Fallback for mobile devices - direct event handler
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const bellButton = document.getElementById('notificationBell');
        if (bellButton && !bellButton.hasAttribute('data-initialized')) {
            // console.log('Setting up fallback mobile handler');
            bellButton.setAttribute('data-initialized', 'true');
            
            // Simple fallback handler
            bellButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // console.log('Fallback bell click handler triggered');
                
                const notificationCenter = document.getElementById('notificationCenter');
                if (notificationCenter) {
                    if (notificationCenter.classList.contains('show')) {
                        notificationCenter.classList.remove('show');
                        // Fallback: hiding notification center
                    } else {
                        notificationCenter.classList.add('show');
                        // Fallback: showing notification center
                    }
                }
            });
        }
    }, 2000);
});

// Test functions removed - production ready

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationService;
}
