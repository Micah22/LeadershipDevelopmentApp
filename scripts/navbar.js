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
        
        // Initialize hamburger menu functionality
        initializeHamburgerMenu();
        
        // Debug: Check if mobile styles are applied
        setTimeout(() => {
            const userInfo = document.querySelector('.user-info');
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            console.log('User info element:', userInfo);
            console.log('User info computed style:', userInfo ? window.getComputedStyle(userInfo).display : 'not found');
            console.log('Hamburger menu element:', hamburgerMenu);
            console.log('Hamburger menu computed style:', hamburgerMenu ? window.getComputedStyle(hamburgerMenu).display : 'not found');
        }, 500);
        
        // Populate navigation with a small delay to ensure DOM is ready
        setTimeout(() => {
            try {
                updateNavigation();
            } catch (error) {
                console.error('Navbar v24 - Error in updateNavigation():', error);
            }
        }, 100);
        
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
    const username = localStorage.getItem('username');
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserRole = document.getElementById('dropdownUserRole');
    const userAvatar = document.getElementById('userAvatar');
    
    
    if (dropdownUserName && user) {
        const fullName = user.full_name || user.fullName || user.username;
        dropdownUserName.textContent = fullName;
    }
    
    if (dropdownUserRole && user?.role) {
        dropdownUserRole.textContent = user.role;
    }
    
    if (userAvatar && user) {
        const fullName = user.full_name || user.fullName || user.username;
        userAvatar.textContent = fullName.charAt(0).toUpperCase();
    } else {
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
        try {
            // Check if admin navigation has already been set
            if (window.adminNavigationSet) {
                console.log('🔍 Navbar - Admin navigation already set, skipping override');
                return;
            }
            
            const username = localStorage.getItem('username');
            const users = getUsers();
            const user = users.find(u => u.username === username);
            const navLinks = document.getElementById('navLinks');
        
        
        if (!navLinks) {
            return;
        }
        
        if (!user) {
            navLinks.innerHTML = '<a href="index.html" class="nav-link">Login</a>';
            return;
        }
        
        // Get current page to highlight active link
        const currentPage = window.location.pathname.split('/').pop();
        
        let navigationHTML = '';
        
        // Check if we're on mobile (screen width <= 768px)
        const isMobile = window.innerWidth <= 768;
        console.log('Mobile detection:', isMobile, 'Window width:', window.innerWidth);
        
        if (user.role === 'Admin') {
            navigationHTML = `
                <a href="apps-list.html" class="nav-link ${currentPage === 'apps-list.html' ? 'active' : ''}">Apps</a>
                <a href="user-dashboard.html" class="nav-link ${currentPage === 'user-dashboard.html' ? 'active' : ''}">Dashboard</a>
                <a href="user-progress.html" class="nav-link ${currentPage === 'user-progress.html' ? 'active' : ''}">My Progress</a>
                <a href="quizzes.html" class="nav-link ${currentPage === 'quizzes.html' ? 'active' : ''}">Quizzes</a>
                <a href="admin-user-overview.html" class="nav-link ${currentPage === 'admin-user-overview.html' ? 'active' : ''}">User Overview</a>
                <a href="#" class="nav-link">Resources</a>
                ${isMobile ? `
                    <div class="nav-divider"></div>
                    <a href="#" class="nav-link mobile-user-option" id="darkModeToggle">
                        <i class="fas fa-moon"></i>
                        <span>Dark Mode</span>
                    </a>
                    <a href="#" class="nav-link mobile-user-option" id="signOutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                    </a>
                ` : ''}
            `;
        } else if (user.role === 'Director') {
            navigationHTML = `
                <a href="apps-list.html" class="nav-link ${currentPage === 'apps-list.html' ? 'active' : ''}">Apps</a>
                <a href="user-dashboard.html" class="nav-link ${currentPage === 'user-dashboard.html' ? 'active' : ''}">Dashboard</a>
                <a href="user-progress.html" class="nav-link ${currentPage === 'user-progress.html' ? 'active' : ''}">My Progress</a>
                <a href="quizzes.html" class="nav-link ${currentPage === 'quizzes.html' ? 'active' : ''}">Quizzes</a>
                <a href="admin-user-overview.html" class="nav-link ${currentPage === 'admin-user-overview.html' ? 'active' : ''}">User Overview</a>
                <a href="#" class="nav-link">Resources</a>
                ${isMobile ? `
                    <div class="nav-divider"></div>
                    <a href="#" class="nav-link mobile-user-option" id="darkModeToggle">
                        <i class="fas fa-moon"></i>
                        <span>Dark Mode</span>
                    </a>
                    <a href="#" class="nav-link mobile-user-option" id="signOutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                    </a>
                ` : ''}
            `;
        } else {
            navigationHTML = `
                <a href="apps-list.html" class="nav-link ${currentPage === 'apps-list.html' ? 'active' : ''}">Apps</a>
                <a href="user-dashboard.html" class="nav-link ${currentPage === 'user-dashboard.html' ? 'active' : ''}">Dashboard</a>
                <a href="user-progress.html" class="nav-link ${currentPage === 'user-progress.html' ? 'active' : ''}">My Progress</a>
                <a href="quizzes.html" class="nav-link ${currentPage === 'quizzes.html' ? 'active' : ''}">Quizzes</a>
                <a href="admin-user-overview.html" class="nav-link ${currentPage === 'admin-user-overview.html' ? 'active' : ''}">User Overview</a>
                <a href="#" class="nav-link">Resources</a>
                ${isMobile ? `
                    <div class="nav-divider"></div>
                    <a href="#" class="nav-link mobile-user-option" id="darkModeToggle">
                        <i class="fas fa-moon"></i>
                        <span>Dark Mode</span>
                    </a>
                    <a href="#" class="nav-link mobile-user-option" id="signOutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                    </a>
                ` : ''}
            `;
        }
        
        navLinks.innerHTML = navigationHTML;
        
        // Add event listeners for mobile user options
        if (isMobile || forceMobile) {
            const darkModeToggle = document.getElementById('darkModeToggle');
            const signOutBtn = document.getElementById('signOutBtn');
            
            if (darkModeToggle) {
                darkModeToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleDarkMode();
                });
            }
            
            if (signOutBtn) {
                signOutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    signOut();
                });
            }
        }
        
        } catch (error) {
            console.error('Navbar v22 - Error in updateNavigation():', error);
        }
    }

// Get users from localStorage
function getUsers() {
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];
    
    // If no users found, try to initialize them
    if (users.length === 0) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
        }
    }
    
    return users;
}

// Load navbar when DOM is ready (only if not already loaded)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Navbar.js - DOMContentLoaded fired');
    // Check if navbar is already loaded to prevent multiple loads
    if (!document.getElementById('navbar')) {
        console.log('Navbar.js - Loading navbar...');
        loadNavbar();
    } else {
        console.log('Navbar.js - Navbar already loaded, updating...');
        // Just update the user info without reloading
        setTimeout(() => {
            updateDropdownUserInfo();
            updateNavigation();
        }, 100);
    }
});

// Function to refresh navbar when users data becomes available
function refreshNavbar() {
    updateDropdownUserInfo();
    updateNavigation();
}

// Make refreshNavbar available globally so other scripts can call it
window.refreshNavbar = refreshNavbar;

// Hamburger Menu Functionality
function initializeHamburgerMenu() {
    console.log('Initializing hamburger menu...');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navLinks = document.getElementById('navLinks');
    
    console.log('Hamburger menu element:', hamburgerMenu);
    console.log('Nav links element:', navLinks);
    
    if (!hamburgerMenu || !navLinks) {
        console.log('Hamburger menu elements not found');
        return;
    }
    
    // Toggle hamburger menu
    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        // Hide hamburger menu when nav is open
        if (navLinks.classList.contains('active')) {
            hamburgerMenu.classList.add('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            hamburgerMenu.classList.remove('hidden');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking on nav links
    const navLinkElements = navLinks.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            hamburgerMenu.classList.remove('hidden');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking on the close button (::before pseudo-element)
    navLinks.addEventListener('click', (e) => {
        // Check if click is on the close button area (top-right corner)
        const rect = navLinks.getBoundingClientRect();
        const closeButtonArea = {
            top: rect.top + 20,
            right: rect.right - 20,
            bottom: rect.top + 50,
            left: rect.right - 50
        };
        
        if (e.clientX >= closeButtonArea.left && e.clientX <= closeButtonArea.right &&
            e.clientY >= closeButtonArea.top && e.clientY <= closeButtonArea.bottom) {
            hamburgerMenu.classList.remove('active');
            hamburgerMenu.classList.remove('hidden');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerMenu.contains(e.target) && !navLinks.contains(e.target)) {
            hamburgerMenu.classList.remove('active');
            hamburgerMenu.classList.remove('hidden');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu on window resize if screen becomes larger
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburgerMenu.classList.remove('active');
            hamburgerMenu.classList.remove('hidden');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
        // Update navigation when screen size changes
        setTimeout(() => {
            try {
                updateNavigation();
            } catch (error) {
                console.error('Navbar v24 - Error in updateNavigation() on resize:', error);
            }
        }, 100);
    });
}

// Toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    const isDarkMode = body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    }
}

// Sign out function
function signOut() {
    localStorage.removeItem('username');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
