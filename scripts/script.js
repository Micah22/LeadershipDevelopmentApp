// Login Page JavaScript - UPDATED TO REDIRECT ALL USERS TO DASHBOARD

// Initialize default users if localStorage is empty
function initializeUsers() {
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
        const defaultUsers = [
            {
                fullName: 'Admin User',
                username: 'admin',
                password: 'admin123',
                role: 'Admin',
                status: 'Active'
            },
            {
                fullName: 'John Smith',
                username: 'john@test.com',
                password: 'password123',
                role: 'Team Member',
                status: 'Active'
            },
            {
                fullName: 'Sarah Johnson',
                username: 'sarah@test.com',
                password: 'password123',
                role: 'Trainer',
                status: 'Active'
            },
            {
                fullName: 'Mike Davis',
                username: 'mike@test.com',
                password: 'password123',
                role: 'Assistant Supervisor',
                status: 'Active'
            },
            {
                fullName: 'Lisa Wilson',
                username: 'lisa@test.com',
                password: 'password123',
                role: 'Supervisor',
                status: 'Active'
            },
            {
                fullName: 'David Brown',
                username: 'david@test.com',
                password: 'password123',
                role: 'Director',
                status: 'Active'
            },
            {
                fullName: 'Test User',
                username: 'test@test.com',
                password: 'Admin',
                role: 'Admin',
                status: 'Active'
            },
            {
                fullName: 'Test User 456',
                username: 'test456',
                password: '123456',
                role: 'Team Member',
                status: 'Active'
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('Default users initialized');
    }
}

// Get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    if (!users) {
        initializeUsers();
        return JSON.parse(localStorage.getItem('users'));
    }
    return JSON.parse(users);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Initialize users
    initializeUsers();
    
    // Set up form submission
    setupLoginForm();
    
    // Set up register form
    setupRegisterForm();
    
    // Set up switch to register button
    setupSwitchToRegister();
    
    // Set up demo credentials button
    setupDemoCredentials();
});

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('signinForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            console.log('Login attempt:', { email, password });
            
            // Validate inputs
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Get users and attempt login
            const users = getUsers();
            console.log('Available users:', users);
            
            const user = users.find(u => u.username === email && u.password === password);
            console.log('Found user:', user);
            
            if (user) {
                // Store current user data
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', user.username);
                
                showNotification('Login successful! Redirecting to dashboard...', 'success');
                
                // Redirect ALL users to their dashboard page
                setTimeout(() => {
                    window.location.href = 'user-dashboard.html';
                }, 1000);
            } else {
                showNotification('Invalid email or password', 'error');
            }
        });
    }
}

// Setup register form
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('regFullName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            // Validate inputs
            if (!fullName || !email || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            // Check if user already exists
            const users = getUsers();
            if (users.find(u => u.username === email)) {
                showNotification('User with this email already exists', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                fullName: fullName,
                username: email,
                password: password,
                role: 'Team Member',
                status: 'Active'
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            showNotification('Registration successful! Please log in.', 'success');
            
            // Switch to login form
            switchToLogin();
        });
    }
}

// Setup switch to register button
function setupSwitchToRegister() {
    const switchBtn = document.getElementById('switchToRegisterBtn');
    
    if (switchBtn) {
        switchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            switchToRegister();
        });
    }
}

// Setup demo credentials button
function setupDemoCredentials() {
    const demoBtn = document.getElementById('demoCredentialsBtn');
    
    if (demoBtn) {
        demoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fillDemoCredentials();
        });
    }
}

// Switch to register form
function switchToRegister() {
    const loginCard = document.querySelector('.login-card');
    const registerCard = document.querySelector('.register-card');
    
    if (loginCard && registerCard) {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    }
}

// Switch to login form
function switchToLogin() {
    const loginCard = document.querySelector('.login-card');
    const registerCard = document.querySelector('.register-card');
    
    if (loginCard && registerCard) {
        registerCard.style.display = 'none';
        loginCard.style.display = 'block';
    }
}

// Fill demo credentials
function fillDemoCredentials() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField && passwordField) {
        emailField.value = 'admin';
        passwordField.value = 'admin123';
        showNotification('Demo credentials filled!', 'info');
    }
}

// Show notification
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;
    
    // Set background color based on type
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = '#28A745';
            break;
        case 'error':
            backgroundColor = '#DC3545';
            break;
        case 'warning':
            backgroundColor = '#FFC107';
            break;
        default:
            backgroundColor = '#17A2B8';
    }
    
    notification.style.backgroundColor = backgroundColor;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 1.5rem';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '3000';
    notification.style.maxWidth = '300px';
    notification.style.wordWrap = 'break-word';
    notification.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    notification.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = 
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
;
document.head.appendChild(style);
