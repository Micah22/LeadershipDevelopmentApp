// Settings Script
// Handles all settings page functionality

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUserData = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !currentUserData) {
        alert('Please log in to access settings.');
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize the page
    await initializeSettings();
});

async function initializeSettings() {
    try {
        // Load user data
        await loadUserData();
        
        // Load saved settings
        loadSettings();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize theme
        initializeTheme();
        
        // Load system information
        loadSystemInfo();
        
    } catch (error) {
        console.error('Error initializing settings:', error);
        if (window.showToast) {
            window.showToast('error', 'Initialization Error', 'Failed to load settings page');
        }
    }
}

async function loadUserData() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Update form fields
        document.getElementById('username').value = currentUser.username || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('fullName').value = currentUser.full_name || currentUser.name || '';
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function loadSettings() {
    // Load notification settings
    const emailNotifications = localStorage.getItem('emailNotifications') !== 'false';
    const browserNotifications = localStorage.getItem('browserNotifications') !== 'false';
    const progressNotifications = localStorage.getItem('progressNotifications') !== 'false';
    const assignmentReminders = localStorage.getItem('assignmentReminders') !== 'false';
    const loginNotifications = localStorage.getItem('loginNotifications') !== 'false';
    
    document.getElementById('emailNotifications').checked = emailNotifications;
    document.getElementById('browserNotifications').checked = browserNotifications;
    document.getElementById('progressNotifications').checked = progressNotifications;
    document.getElementById('assignmentReminders').checked = assignmentReminders;
    document.getElementById('loginNotifications').checked = loginNotifications;
    
    // Load theme setting
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.getElementById('themeSelect').value = savedTheme;
    
    // Load language setting
    const savedLanguage = localStorage.getItem('language') || 'en';
    document.getElementById('languageSelect').value = savedLanguage;
    
    // Load font size setting
    const savedFontSize = localStorage.getItem('fontSize') || '16';
    document.getElementById('fontSize').value = savedFontSize;
    document.getElementById('fontSizeValue').textContent = savedFontSize + 'px';
}

function setupEventListeners() {
    // Notification settings
    document.getElementById('emailNotifications').addEventListener('change', saveNotificationSettings);
    document.getElementById('browserNotifications').addEventListener('change', saveNotificationSettings);
    document.getElementById('progressNotifications').addEventListener('change', saveNotificationSettings);
    document.getElementById('assignmentReminders').addEventListener('change', saveNotificationSettings);
    document.getElementById('loginNotifications').addEventListener('change', saveNotificationSettings);
    
    // Font size slider
    document.getElementById('fontSize').addEventListener('input', function() {
        document.getElementById('fontSizeValue').textContent = this.value + 'px';
    });
}

function saveNotificationSettings() {
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        browserNotifications: document.getElementById('browserNotifications').checked,
        progressNotifications: document.getElementById('progressNotifications').checked,
        assignmentReminders: document.getElementById('assignmentReminders').checked,
        loginNotifications: document.getElementById('loginNotifications').checked
    };
    
    // Save to localStorage
    Object.keys(settings).forEach(key => {
        localStorage.setItem(key, settings[key]);
    });
    
    if (window.showToast) {
        window.showToast('success', 'Settings Saved', 'Your notification preferences have been updated');
    }
}

function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    localStorage.setItem('theme', theme);
    
    // Apply theme immediately
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (theme === 'light') {
        document.body.classList.remove('dark-mode');
    } else if (theme === 'auto') {
        // Auto theme based on system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    if (window.showToast) {
        window.showToast('success', 'Theme Updated', `Theme changed to ${theme}`);
    }
}

function changeLanguage() {
    const language = document.getElementById('languageSelect').value;
    localStorage.setItem('language', language);
    
    if (window.showToast) {
        window.showToast('success', 'Language Updated', `Language changed to ${language}`);
    }
}

function changeFontSize() {
    const fontSize = document.getElementById('fontSize').value;
    localStorage.setItem('fontSize', fontSize);
    
    // Apply font size
    document.documentElement.style.fontSize = fontSize + 'px';
    
    if (window.showToast) {
        window.showToast('success', 'Font Size Updated', `Font size changed to ${fontSize}px`);
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (savedTheme === 'auto') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
        }
    }
    
    // Apply saved font size
    const savedFontSize = localStorage.getItem('fontSize') || '16';
    document.documentElement.style.fontSize = savedFontSize + 'px';
}

function loadSystemInfo() {
    // Last login
    const lastLogin = localStorage.getItem('lastLogin');
    if (lastLogin) {
        document.getElementById('lastLogin').textContent = new Date(lastLogin).toLocaleString();
    } else {
        document.getElementById('lastLogin').textContent = 'Unknown';
    }
    
    // Account created (simulated)
    const accountCreated = localStorage.getItem('accountCreated');
    if (accountCreated) {
        document.getElementById('accountCreated').textContent = new Date(accountCreated).toLocaleDateString();
    } else {
        document.getElementById('accountCreated').textContent = 'Unknown';
    }
    
    // Browser info
    const browserInfo = navigator.userAgent.split(' ').pop();
    document.getElementById('browserInfo').textContent = browserInfo;
}

// Account editing functions
function editUsername() {
    const input = document.getElementById('username');
    input.readOnly = false;
    input.focus();
    input.select();
}

function editEmail() {
    const input = document.getElementById('email');
    input.readOnly = false;
    input.focus();
    input.select();
}

function editFullName() {
    const input = document.getElementById('fullName');
    input.readOnly = false;
    input.focus();
    input.select();
}

function editPassword() {
    const input = document.getElementById('password');
    input.readOnly = false;
    input.type = 'password';
    input.value = '';
    input.focus();
}

function updateAccount() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!username || !email) {
        if (window.showToast) {
            window.showToast('error', 'Validation Error', 'Username and email are required');
        }
        return;
    }
    
    // Update user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.username = username;
    currentUser.email = email;
    currentUser.full_name = fullName;
    
    if (password && password !== '••••••••') {
        // In a real app, you'd hash the password
        currentUser.password = password;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Make fields read-only again
    document.getElementById('username').readOnly = true;
    document.getElementById('email').readOnly = true;
    document.getElementById('fullName').readOnly = true;
    document.getElementById('password').readOnly = true;
    document.getElementById('password').type = 'password';
    document.getElementById('password').value = '••••••••';
    
    if (window.showToast) {
        window.showToast('success', 'Account Updated', 'Your account information has been updated');
    }
}

function resetAccountForm() {
    loadUserData();
    
    // Make fields read-only
    document.getElementById('username').readOnly = true;
    document.getElementById('email').readOnly = true;
    document.getElementById('fullName').readOnly = true;
    document.getElementById('password').readOnly = true;
    document.getElementById('password').type = 'password';
    document.getElementById('password').value = '••••••••';
    
    if (window.showToast) {
        window.showToast('info', 'Form Reset', 'Account form has been reset to original values');
    }
}

// Security functions
function setupTwoFactor() {
    if (window.showToast) {
        window.showToast('info', 'Two-Factor Authentication', '2FA setup is not yet implemented');
    }
}

function exportData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const data = {
        user: currentUser,
        settings: {
            emailNotifications: localStorage.getItem('emailNotifications'),
            browserNotifications: localStorage.getItem('browserNotifications'),
            progressNotifications: localStorage.getItem('progressNotifications'),
            assignmentReminders: localStorage.getItem('assignmentReminders'),
            loginNotifications: localStorage.getItem('loginNotifications'),
            theme: localStorage.getItem('theme'),
            language: localStorage.getItem('language'),
            fontSize: localStorage.getItem('fontSize')
        },
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${currentUser.username || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.showToast) {
        window.showToast('success', 'Data Exported', 'Your data has been downloaded');
    }
}
