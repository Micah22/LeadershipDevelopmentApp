// Roadmap Authentication System
class RoadmapAuth {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.milestones = this.loadMilestones();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    // User Management
    loadUsers() {
        const defaultUsers = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@roadmap.com',
                password: 'admin123',
                role: 'admin',
                avatar: 'A',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Manager User',
                email: 'manager@roadmap.com',
                password: 'manager123',
                role: 'manager',
                avatar: 'M',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Developer User',
                email: 'developer@roadmap.com',
                password: 'dev123',
                role: 'developer',
                avatar: 'D',
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Viewer User',
                email: 'viewer@roadmap.com',
                password: 'viewer123',
                role: 'viewer',
                avatar: 'V',
                createdAt: new Date().toISOString()
            }
        ];

        const stored = localStorage.getItem('roadmapUsers');
        return stored ? JSON.parse(stored) : defaultUsers;
    }

    saveUsers() {
        localStorage.setItem('roadmapUsers', JSON.stringify(this.users));
    }

    loadMilestones() {
        const defaultMilestones = [
            {
                id: 1,
                title: 'Project Foundation',
                date: 'Q1 2024',
                description: 'Established the core architecture and development environment. Set up version control, CI/CD pipeline, and initial project structure.',
                status: 'completed',
                tags: ['Architecture', 'Setup', 'Planning'],
                progress: 100,
                createdBy: 1,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'User Authentication',
                date: 'Q1 2024',
                description: 'Implemented secure user authentication system with JWT tokens, password hashing, and role-based access control.',
                status: 'completed',
                tags: ['Security', 'Backend', 'API'],
                progress: 100,
                createdBy: 1,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'Core Features MVP',
                date: 'Q2 2024',
                description: 'Developed the minimum viable product with essential features including user dashboard, basic CRUD operations, and data visualization.',
                status: 'completed',
                tags: ['Frontend', 'MVP', 'Features'],
                progress: 100,
                createdBy: 2,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                title: 'Advanced Analytics',
                date: 'Q2 2024',
                description: 'Building comprehensive analytics dashboard with real-time data processing, custom reports, and interactive charts.',
                status: 'in-progress',
                tags: ['Analytics', 'Dashboard', 'Data'],
                progress: 65,
                createdBy: 2,
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                title: 'Mobile App Development',
                date: 'Q3 2024',
                description: 'Creating cross-platform mobile application with React Native, implementing offline capabilities and push notifications.',
                status: 'in-progress',
                tags: ['Mobile', 'React Native', 'Offline'],
                progress: 30,
                createdBy: 3,
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                title: 'AI Integration',
                date: 'Q3 2024',
                description: 'Integrating machine learning capabilities for predictive analytics, automated insights, and intelligent recommendations.',
                status: 'upcoming',
                tags: ['AI/ML', 'Predictions', 'Automation'],
                progress: 0,
                createdBy: 1,
                createdAt: new Date().toISOString()
            }
        ];

        const stored = localStorage.getItem('roadmapMilestones');
        return stored ? JSON.parse(stored) : defaultMilestones;
    }

    saveMilestones() {
        localStorage.setItem('roadmapMilestones', JSON.stringify(this.milestones));
    }

    // Authentication
    checkAuthStatus() {
        const token = localStorage.getItem('roadmapToken');
        if (token) {
            const user = this.users.find(u => u.id === parseInt(token));
            if (user) {
                this.currentUser = user;
                this.showRoadmapApp();
                return;
            }
        }
        this.showLoginScreen();
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('roadmapToken', user.id.toString());
            this.showRoadmapApp();
            this.showNotification('Login successful!', 'success');
            return true;
        }
        return false;
    }

    register(userData) {
        const existingUser = this.users.find(u => u.email === userData.email);
        if (existingUser) {
            return false;
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            avatar: userData.name.charAt(0).toUpperCase(),
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        return true;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('roadmapToken');
        this.showLoginScreen();
        this.showNotification('Logged out successfully!', 'info');
    }

    // UI Management
    showLoginScreen() {
        document.querySelectorAll('.auth-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('roadmapApp').classList.remove('active');
    }

    showRegisterScreen() {
        document.querySelectorAll('.auth-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('registerScreen').classList.add('active');
    }

    showForgotPasswordScreen() {
        document.querySelectorAll('.auth-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('forgotPasswordScreen').classList.add('active');
    }

    showRoadmapApp() {
        document.querySelectorAll('.auth-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('roadmapApp').classList.add('active');
        
        this.updateUserInterface();
        this.loadTimeline();
        this.setupRoadmapFeatures();
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // Update user info in nav
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = this.currentUser.role;
        document.getElementById('userAvatar').textContent = this.currentUser.avatar;

        // Show/hide features based on permissions
        this.updatePermissions();
    }

    updatePermissions() {
        const role = this.currentUser.role;
        
        // Show/hide add milestone button
        const addMilestoneSection = document.getElementById('addMilestoneSection');
        if (['admin', 'manager'].includes(role)) {
            addMilestoneSection.style.display = 'block';
        } else {
            addMilestoneSection.style.display = 'none';
        }

        // Show/hide manage users link
        const manageUsersLink = document.getElementById('manageUsersLink');
        if (role === 'admin') {
            manageUsersLink.style.display = 'block';
        } else {
            manageUsersLink.style.display = 'none';
        }

        // Update profile form role field
        const profileRole = document.getElementById('profileRole');
        if (profileRole) {
            profileRole.disabled = role !== 'admin';
        }
    }

    // Timeline Management
    loadTimeline() {
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';

        this.milestones.forEach(milestone => {
            const item = this.createTimelineItem(milestone);
            timeline.appendChild(item);
        });

        this.updateStats();
    }

    createTimelineItem(milestone) {
        const item = document.createElement('div');
        item.className = `timeline-item ${milestone.status}`;
        item.setAttribute('data-category', milestone.status);
        item.setAttribute('data-id', milestone.id);

        // Determine icon based on status
        let icon = 'fas fa-clock';
        if (milestone.status === 'completed') icon = 'fas fa-check';
        else if (milestone.status === 'in-progress') icon = 'fas fa-cog fa-spin';

        // Create tags HTML
        const tagsHtml = milestone.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // Create actions HTML based on permissions
        const actionsHtml = this.createTimelineActions(milestone);

        item.innerHTML = `
            <div class="timeline-marker">
                <i class="${icon}"></i>
            </div>
            <div class="timeline-content">
                ${actionsHtml}
                <div class="timeline-header">
                    <h3>${milestone.title}</h3>
                    <span class="timeline-date">${milestone.date}</span>
                    <span class="status-badge ${milestone.status}">${milestone.status.replace('-', ' ')}</span>
                </div>
                <p>${milestone.description}</p>
                <div class="timeline-tags">
                    ${tagsHtml}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${milestone.progress}%"></div>
                </div>
            </div>
        `;

        return item;
    }

    createTimelineActions(milestone) {
        const role = this.currentUser.role;
        let actionsHtml = '';

        if (['admin', 'manager'].includes(role)) {
            actionsHtml = `
                <div class="timeline-actions">
                    <button class="action-btn" onclick="roadmapAuth.editMilestone(${milestone.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="roadmapAuth.deleteMilestone(${milestone.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        } else if (role === 'developer') {
            actionsHtml = `
                <div class="timeline-actions">
                    <button class="action-btn" onclick="roadmapAuth.updateProgress(${milestone.id})" title="Update Progress">
                        <i class="fas fa-chart-line"></i>
                    </button>
                </div>
            `;
        }

        return actionsHtml;
    }

    // Milestone Management
    addMilestone(milestoneData) {
        const newMilestone = {
            id: Date.now(),
            ...milestoneData,
            createdBy: this.currentUser.id,
            createdAt: new Date().toISOString()
        };

        this.milestones.push(newMilestone);
        this.saveMilestones();
        this.loadTimeline();
        this.showNotification('Milestone added successfully!', 'success');
    }

    editMilestone(id) {
        const milestone = this.milestones.find(m => m.id === id);
        if (!milestone) return;

        // Pre-fill form with existing data
        document.getElementById('milestoneTitle').value = milestone.title;
        document.getElementById('milestoneDate').value = milestone.date;
        document.getElementById('milestoneDescription').value = milestone.description;
        document.getElementById('milestoneStatus').value = milestone.status;
        document.getElementById('milestoneTags').value = milestone.tags.join(', ');
        document.getElementById('milestoneProgress').value = milestone.progress;
        document.getElementById('progressValue').textContent = milestone.progress + '%';

        // Change form to edit mode
        const form = document.getElementById('milestoneForm');
        form.setAttribute('data-edit-id', id);
        form.querySelector('button[type="submit"]').textContent = 'Update Milestone';

        this.openAddModal();
    }

    updateMilestone(id, milestoneData) {
        const index = this.milestones.findIndex(m => m.id === id);
        if (index !== -1) {
            this.milestones[index] = { ...this.milestones[index], ...milestoneData };
            this.saveMilestones();
            this.loadTimeline();
            this.showNotification('Milestone updated successfully!', 'success');
        }
    }

    deleteMilestone(id) {
        if (confirm('Are you sure you want to delete this milestone?')) {
            this.milestones = this.milestones.filter(m => m.id !== id);
            this.saveMilestones();
            this.loadTimeline();
            this.showNotification('Milestone deleted successfully!', 'success');
        }
    }

    updateProgress(id) {
        const milestone = this.milestones.find(m => m.id === id);
        if (!milestone) return;

        const newProgress = prompt(`Update progress for "${milestone.title}" (0-100):`, milestone.progress);
        if (newProgress !== null && !isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
            milestone.progress = parseInt(newProgress);
            if (milestone.progress === 100 && milestone.status !== 'completed') {
                milestone.status = 'completed';
            } else if (milestone.progress > 0 && milestone.status === 'upcoming') {
                milestone.status = 'in-progress';
            }
            this.saveMilestones();
            this.loadTimeline();
            this.showNotification('Progress updated successfully!', 'success');
        }
    }

    // User Management
    showUsers() {
        this.loadUsersList();
        this.openUsersModal();
    }

    loadUsersList() {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        this.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-info-detailed">
                    <div class="user-avatar-small">${user.avatar}</div>
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        <p>${user.email} • ${user.role}</p>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="edit-user" onclick="roadmapAuth.editUser(${user.id})">Edit</button>
                    ${user.id !== this.currentUser.id ? `<button class="delete-user" onclick="roadmapAuth.deleteUser(${user.id})">Delete</button>` : ''}
                </div>
            `;
            usersList.appendChild(userItem);
        });
    }

    editUser(id) {
        const user = this.users.find(u => u.id === id);
        if (!user) return;

        // Pre-fill profile form
        document.getElementById('profileName').value = user.name;
        document.getElementById('profileEmail').value = user.email;
        document.getElementById('profileRole').value = user.role;

        // Change form to edit mode
        const form = document.getElementById('profileForm');
        form.setAttribute('data-edit-id', id);

        this.closeUsersModal();
        this.openProfileModal();
    }

    deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(u => u.id !== id);
            this.saveUsers();
            this.loadUsersList();
            this.showNotification('User deleted successfully!', 'success');
        }
    }

    // Statistics
    updateStats() {
        const visibleItems = document.querySelectorAll('.timeline-item:not(.hidden)');
        const completed = document.querySelectorAll('.timeline-item.completed:not(.hidden)').length;
        const inProgress = document.querySelectorAll('.timeline-item.in-progress:not(.hidden)').length;

        this.animateNumber('#totalMilestones', visibleItems.length);
        this.animateNumber('#completedMilestones', completed);
        this.animateNumber('#inProgressMilestones', inProgress);
    }

    animateNumber(selector, targetNumber) {
        const element = document.querySelector(selector);
        if (!element) return;

        const startNumber = parseInt(element.textContent) || 0;
        const duration = 500;
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentNumber = Math.round(startNumber + (targetNumber - startNumber) * easeOutQuart);

            element.textContent = currentNumber;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }

    // Modal Management
    openAddModal() {
        const modal = document.getElementById('addModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('milestoneTitle').focus(), 100);
    }

    closeAddModal() {
        const modal = document.getElementById('addModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        document.getElementById('milestoneForm').reset();
        document.getElementById('milestoneForm').removeAttribute('data-edit-id');
        document.getElementById('progressValue').textContent = '0%';
        document.querySelector('#milestoneForm button[type="submit"]').textContent = 'Add Milestone';
    }

    openUsersModal() {
        const modal = document.getElementById('usersModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeUsersModal() {
        const modal = document.getElementById('usersModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    openProfileModal() {
        const modal = document.getElementById('profileModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeProfileModal() {
        const modal = document.getElementById('profileModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        document.getElementById('profileForm').reset();
        document.getElementById('profileForm').removeAttribute('data-edit-id');
    }

    // Event Listeners
    setupEventListeners() {
        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!this.login(email, password)) {
                document.getElementById('loginError').textContent = 'Invalid email or password';
            }
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const userData = {
                name: document.getElementById('registerName').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
                role: document.getElementById('registerRole').value
            };

            if (this.register(userData)) {
                this.showNotification('Account created successfully!', 'success');
                this.showLoginScreen();
            } else {
                document.getElementById('registerError').textContent = 'Email already exists';
            }
        });

        document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showNotification('Password reset link sent to your email!', 'info');
            this.showLoginScreen();
        });

        // Milestone form
        document.getElementById('milestoneForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = e.target.getAttribute('data-edit-id');
            
            const milestoneData = {
                title: document.getElementById('milestoneTitle').value,
                date: document.getElementById('milestoneDate').value,
                description: document.getElementById('milestoneDescription').value,
                status: document.getElementById('milestoneStatus').value,
                tags: document.getElementById('milestoneTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
                progress: parseInt(document.getElementById('milestoneProgress').value)
            };

            if (editId) {
                this.updateMilestone(parseInt(editId), milestoneData);
            } else {
                this.addMilestone(milestoneData);
            }
            
            this.closeAddModal();
        });

        // Profile form
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = e.target.getAttribute('data-edit-id');
            
            const userData = {
                name: document.getElementById('profileName').value,
                email: document.getElementById('profileEmail').value,
                role: document.getElementById('profileRole').value
            };

            if (editId) {
                const user = this.users.find(u => u.id === parseInt(editId));
                if (user) {
                    Object.assign(user, userData);
                    this.saveUsers();
                    
                    if (parseInt(editId) === this.currentUser.id) {
                        this.currentUser = user;
                        this.updateUserInterface();
                    }
                    
                    this.showNotification('Profile updated successfully!', 'success');
                }
            }
            
            this.closeProfileModal();
        });

        // Progress slider
        document.getElementById('milestoneProgress').addEventListener('input', function() {
            document.getElementById('progressValue').textContent = this.value + '%';
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAddModal();
                this.closeUsersModal();
                this.closeProfileModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAddModal();
                this.closeUsersModal();
                this.closeProfileModal();
            }
        });
    }

    setupRoadmapFeatures() {
        // Filter controls
        const filterButtons = document.querySelectorAll('.filter-btn');
        const timelineItems = document.querySelectorAll('.timeline-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                timelineItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        item.classList.remove('hidden');
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.classList.add('hidden');
                        }, 300);
                    }
                });
                
                setTimeout(() => this.updateStats(), 400);
            });
        });
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#e53e3e' : '#667eea'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global Functions
function showLogin() {
    roadmapAuth.showLoginScreen();
}

function showRegister() {
    roadmapAuth.showRegisterScreen();
}

function showForgotPassword() {
    roadmapAuth.showForgotPasswordScreen();
}

function loginDemoUser(email, password, role) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
    roadmapAuth.login(email, password);
}

function logout() {
    roadmapAuth.logout();
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    dropdown.classList.toggle('show');
}

function showProfile() {
    roadmapAuth.openProfileModal();
}

function showSettings() {
    roadmapAuth.showNotification('Settings feature coming soon!', 'info');
}

function showUsers() {
    roadmapAuth.showUsers();
}

function openAddModal() {
    roadmapAuth.openAddModal();
}

function closeAddModal() {
    roadmapAuth.closeAddModal();
}

function closeUsersModal() {
    roadmapAuth.closeUsersModal();
}

function closeProfileModal() {
    roadmapAuth.closeProfileModal();
}

function openAddUserModal() {
    roadmapAuth.showNotification('Add user feature coming soon!', 'info');
}

// Initialize the application
const roadmapAuth = new RoadmapAuth();
