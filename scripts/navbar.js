// Navbar component loader
async function loadNavbar() {
    try {
        // Determine the correct path based on current location
        const currentPath = window.location.pathname;
        const isInPages = currentPath.includes('/pages/');
        const navbarPath = isInPages ? '../components/navbar.html' : 'components/navbar.html';
        
        const response = await fetch(navbarPath);
        if (!response.ok) {
            throw new Error(`Failed to load navbar: ${response.status}`);
        }
        const navbarHTML = await response.text();
        
        // Find the header element or create one
        let headerElement = document.querySelector('header');
        if (!headerElement) {
            headerElement = document.createElement('header');
            document.body.insertBefore(headerElement, document.body.firstChild);
        }
        
        headerElement.outerHTML = navbarHTML;
        
        // Re-initialize any navbar-related functionality
        initializeNavbar();
        
        // Populate navigation with a small delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Navbar v14 - About to call updateNavigation()');
            try {
                updateNavigation();
                console.log('Navbar v14 - updateNavigation() completed successfully');
            } catch (error) {
                console.error('Navbar v14 - Error in updateNavigation():', error);
            }
        }, 100);
        
        console.log('Navbar loaded successfully');
    } catch (error) {
        console.error('Error loading navbar:', error);
        // Fallback: create a basic navbar if loading fails
        createFallbackNavbar();
    }
}

// Fallback navbar creation
function createFallbackNavbar() {
    const headerElement = document.createElement('header');
    headerElement.className = 'header';
    headerElement.innerHTML = `
        <div class="header-content">
            <div class="logo">
                <div class="logo-img">
                    <img src="../assets/CFA_CSymbol_Circle_Red_PMS.webp" alt="CFA Logo" width="40" height="40">
                </div>
                <span class="logo-text">Leadership Development</span>
            </div>
            <nav class="nav-links" id="navLinks">
                <!-- Navigation will be populated by JavaScript -->
            </nav>
            <div class="user-info">
                <div class="user-avatar-container">
                    <div class="user-avatar" id="userAvatar">A</div>
                    <div class="user-dropdown" id="userDropdown">
                        <div class="dropdown-header">
                            <div class="dropdown-user-info">
                                <span class="dropdown-user-name" id="dropdownUserName">Admin</span>
                                <span class="dropdown-user-role" id="dropdownUserRole">Admin</span>
                            </div>
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" id="themeToggle">
                            <i class="fas fa-moon" id="themeIcon"></i>
                            <span id="themeText">Dark Mode</span>
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" id="signOutBtn">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Sign Out</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertBefore(headerElement, document.body.firstChild);
    initializeNavbar();
}

// Initialize navbar functionality
function initializeNavbar() {
    // Set up avatar dropdown
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    const themeToggle = document.getElementById('themeToggle');
    const signOutBtn = document.getElementById('signOutBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserRole = document.getElementById('dropdownUserRole');

    if (userAvatar && userDropdown) {
        // Toggle dropdown on avatar click
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });

        // Theme toggle functionality
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                toggleTheme();
            });
        }

        // Sign out functionality
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                signOut();
            });
        }

        // Update user info in dropdown
        updateDropdownUserInfo();
        
        // Initialize theme
        initializeTheme();
    }
}

// Theme functions
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme icon and text
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (themeIcon && themeText) {
        if (newTheme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Dark Mode';
        }
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (themeIcon && themeText) {
        if (savedTheme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Dark Mode';
        }
    }
}

// Update user info in dropdown
function updateDropdownUserInfo() {
        console.log('Navbar v14 - updateDropdownUserInfo() called - START - PAGE:', window.location.pathname);
    const username = localStorage.getItem('username');
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserRole = document.getElementById('dropdownUserRole');
    const userAvatar = document.getElementById('userAvatar');
    
        console.log('Navbar v14 - Avatar update - User:', user?.fullName, 'Role:', user?.role);
    console.log('Navbar v14 - Avatar elements found:', {
        dropdownUserName: !!dropdownUserName,
        dropdownUserRole: !!dropdownUserRole,
        userAvatar: !!userAvatar
    });
    
    if (dropdownUserName && user?.fullName) {
        dropdownUserName.textContent = user.fullName;
    }
    
    if (dropdownUserRole && user?.role) {
        dropdownUserRole.textContent = user.role;
    }
    
    if (userAvatar && user?.fullName) {
        userAvatar.textContent = user.fullName.charAt(0).toUpperCase();
        console.log('Navbar v14 - Avatar updated to:', user.fullName.charAt(0).toUpperCase());
    } else {
        console.log('Navbar v14 - Avatar NOT updated. userAvatar:', !!userAvatar, 'user.fullName:', user?.fullName);
    }
}

// Sign out function
function signOut() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = '../pages/index.html';
}

    // Update navigation based on user role
    function updateNavigation() {
        console.log('Navbar v14 - updateNavigation() function called - START - PAGE:', window.location.pathname);
        try {
            const username = localStorage.getItem('username');
            const users = getUsers();
            const user = users.find(u => u.username === username);
            const navLinks = document.getElementById('navLinks');
        
            console.log('Navbar v14 - Variables set, about to log DEBUG INFO');
            console.log('Navbar v14 - DEBUG INFO:');
            console.log('- Stored username:', username);
            console.log('- Available users:', users.map(u => ({username: u.username, role: u.role})));
            console.log('- Found user:', user);
            console.log('- User role:', user?.role);
        
        if (!navLinks) {
            return;
        }
        
        if (!user) {
            console.log('Navbar v6 - No user found, showing login link');
            navLinks.innerHTML = '<a href="index.html" class="nav-link">Login</a>';
            return;
        }
        
        // Get current page to highlight active link
        const currentPage = window.location.pathname.split('/').pop();
        
        let navigationHTML = '';
        
        if (user.role === 'Admin') {
            navigationHTML = `
                <a href="user-dashboard.html" class="nav-link ${currentPage === 'user-dashboard.html' ? 'active' : ''}">Dashboard</a>
                <a href="user-progress.html" class="nav-link ${currentPage === 'user-progress.html' ? 'active' : ''}">My Progress</a>
                <a href="admin-user-overview.html" class="nav-link ${currentPage === 'admin-user-overview.html' ? 'active' : ''}">User Overview</a>
                <a href="#" class="nav-link">Resources</a>
            `;
        } else if (user.role === 'Director') {
            navigationHTML = `
                <a href="user-dashboard.html" class="nav-link ${currentPage === 'user-dashboard.html' ? 'active' : ''}">Dashboard</a>
                <a href="user-progress.html" class="nav-link ${currentPage === 'user-progress.html' ? 'active' : ''}">My Progress</a>
                <a href="admin-user-overview.html" class="nav-link ${currentPage === 'admin-user-overview.html' ? 'active' : ''}">User Overview</a>
                <a href="#" class="nav-link">Resources</a>
            `;
        } else {
            navigationHTML = `
                <a href="user-dashboard.html" class="nav-link ${currentPage === 'user-dashboard.html' ? 'active' : ''}">Dashboard</a>
                <a href="user-progress.html" class="nav-link ${currentPage === 'user-progress.html' ? 'active' : ''}">My Progress</a>
                <a href="#" class="nav-link">Resources</a>
            `;
        }
        
            console.log('Navbar v14 - Generated navigation for role:', user.role);
        navLinks.innerHTML = navigationHTML;
        } catch (error) {
            console.error('Navbar v14 - Error in updateNavigation():', error);
        }
    }

// Get users from localStorage
function getUsers() {
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];
    console.log('Navbar v14 - getUsers() called, returning:', users.length, 'users');
    
    // If no users found, try to initialize them
    if (users.length === 0) {
        console.log('Navbar v14 - No users found, checking if we need to initialize...');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            console.log('Navbar v14 - User is logged in but no users found, this is a problem!');
        }
    }
    
    return users;
}

// Load navbar when DOM is ready (only if not already loaded)
document.addEventListener('DOMContentLoaded', function() {
    // Check if navbar is already loaded to prevent multiple loads
    if (!document.getElementById('navbar')) {
        loadNavbar();
    } else {
        console.log('Navbar already loaded, just updating user info');
        // Just update the user info without reloading
        setTimeout(() => {
            updateDropdownUserInfo();
            updateNavigation();
        }, 100);
    }
});

// Function to refresh navbar when users data becomes available
function refreshNavbar() {
    console.log('Navbar v14 - refreshNavbar() called');
    updateDropdownUserInfo();
    updateNavigation();
}

// Make refreshNavbar available globally so other scripts can call it
window.refreshNavbar = refreshNavbar;
