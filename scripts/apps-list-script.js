// Apps List Script

// Toast notification function
function showToast(type, title, message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong>${title}</strong>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 5000);
}

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
    
    // Wait a bit for navbar to load first
    setTimeout(async () => {
        // Initialize the page
        await initializePage();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize theme
        initializeTheme();
    }, 200);
});

async function initializePage() {
    // Set up user info
    await updateUserInfo();
    
    // Navigation is handled by navbar.js
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
            showToast('warning', 'Database Unavailable', 'Using offline mode - some features may not be available');
        }
    } catch (error) {
        console.error('Failed to load users from database:', error);
        showToast('error', 'Database Error', `Failed to load user data: ${error.message || 'Unknown error'}`);
        
        // Fallback to localStorage
        const localUsers = localStorage.getItem('users');
        if (localUsers) {
            try {
                users = JSON.parse(localUsers);
            } catch (e) {
                console.error('Failed to parse localStorage users:', e);
            }
        }
    }
    
    const user = users.find(u => u.username === username);
    if (user) {
        // Update navbar with user info
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        
        if (userAvatar) {
            userAvatar.textContent = user.full_name ? user.full_name.charAt(0).toUpperCase() : username.charAt(0).toUpperCase();
        }
        
        if (userName) {
            userName.textContent = user.full_name || username;
        }
    }
}

function setupEventListeners() {
    // Add click handlers for coming soon cards
    const comingSoonCards = document.querySelectorAll('.app-card.coming-soon');
    comingSoonCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('info', 'Coming Soon', 'This application is currently in development and will be available soon!');
        });
    });
}

function initializeTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle if it exists
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// Function to open an app
function openApp(appName) {
    switch (appName) {
        case 'leadership-development':
            // Redirect to user dashboard (the main entry point for leadership development)
            window.location.href = 'user-dashboard.html';
            break;
        default:
            showToast('error', 'App Not Found', 'The requested application could not be found.');
            break;
    }
}

// Export functions for global access
window.openApp = openApp;

