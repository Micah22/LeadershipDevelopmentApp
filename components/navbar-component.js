/**
 * Navbar Component System
 * A reusable navbar component that can be included on any page
 * Version: 1.0
 */

class NavbarComponent {
    constructor() {
        this.isLoaded = false;
        this.currentPage = this.getCurrentPage();
        this.user = this.getCurrentUser();
        this.init();
    }

    /**
     * Initialize the navbar component
     */
    async init() {
        try {
            await this.loadNavbarHTML();
            
            // Add a small delay to ensure DOM is fully ready
            setTimeout(() => {
                this.setupEventListeners();
                this.updateNavigation();
                this.updateUserInfo();
                this.setupAppsPageStyling();
                this.isLoaded = true;
                console.log('Navbar component initialized successfully');
            }, 100);
        } catch (error) {
            console.error('Error initializing navbar component:', error);
            this.createFallbackNavbar();
        }
    }

    /**
     * Load the navbar HTML from the component file
     */
    async loadNavbarHTML() {
        const currentPath = window.location.pathname;
        const isInPages = currentPath.includes('/pages/');
        const navbarPath = isInPages ? '../components/navbar.html' : 'components/navbar.html';
        
        const response = await fetch(navbarPath);
        if (!response.ok) {
            throw new Error(`Failed to load navbar: ${response.status}`);
        }
        
        const navbarHTML = await response.text();
        
        // Find or create header element
        let headerElement = document.querySelector('header');
        if (!headerElement) {
            headerElement = document.createElement('header');
            document.body.insertBefore(headerElement, document.body.firstChild);
        }
        
        headerElement.outerHTML = navbarHTML;
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        console.log('Setting up event listeners...');
        this.setupHamburgerMenu();
        this.setupUserDropdown();
        this.setupMobileUserOptions();
        this.setupWindowResize();
        console.log('Event listeners setup complete');
    }

    /**
     * Setup hamburger menu functionality
     */
    setupHamburgerMenu() {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const navLinks = document.getElementById('navLinks');
        
        if (!hamburgerMenu || !navLinks) {
            console.log('Hamburger menu elements not found');
            return;
        }

        // Toggle hamburger menu
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            
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
                this.closeMobileMenu();
            });
        });

        // Close menu when clicking on the close button (::before pseudo-element)
        navLinks.addEventListener('click', (e) => {
            // Check if click is on the close button area (top-left corner for right-side menu)
            const rect = navLinks.getBoundingClientRect();
            const closeButtonArea = {
                top: rect.top + 20,
                right: rect.left + 50,
                bottom: rect.top + 50,
                left: rect.left + 20
            };
            
            if (e.clientX >= closeButtonArea.left && e.clientX <= closeButtonArea.right &&
                e.clientY >= closeButtonArea.top && e.clientY <= closeButtonArea.bottom) {
                this.closeMobileMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerMenu.contains(e.target) && !navLinks.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Setup user dropdown functionality
     */
    setupUserDropdown() {
        const bind = () => {
            const userAvatar = document.getElementById('userAvatar');
            const userDropdown = document.getElementById('userDropdown');
            if (!userAvatar || !userDropdown) return false;
    
            // Prevent duplicate bindings
            if (this._avatarBound) return true;
    
            // Store bound handlers on the instance to allow cleanup
            this._handleAvatarClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            };
            this._handleDocClick = (e) => {
                if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            };
    
            userAvatar.addEventListener('click', this._handleAvatarClick);
            document.addEventListener('click', this._handleDocClick);
            this._avatarBound = true;
            return true;
        };
    
        // Try now; if not ready, retry a few times
        if (!bind()) {
            let tries = 0;
            const timer = setInterval(() => {
                if (bind() || ++tries >= 20) clearInterval(timer);
            }, 100);
        }
    
        // Re-bind if header contents change (e.g., other code updates navbar)
        if (!this._dropdownObserver) {
            const header = document.getElementById('navbar') || document.querySelector('header');
            if (header) {
                this._dropdownObserver = new MutationObserver(() => {
                    if (!document.getElementById('userAvatar') || !this._avatarBound) {
                        this._avatarBound = false;
                        bind();
                    }
                });
                this._dropdownObserver.observe(header, { childList: true, subtree: true });
            }
        }
    }

    /**
     * Setup mobile user options (Dark Mode, Settings, Sign Out)
     */
    setupMobileUserOptions() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const settingsBtn = document.getElementById('settingsBtn');
        const signOutBtn = document.getElementById('signOutBtn');

        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDarkMode();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSettings();
            });
        }

        if (signOutBtn) {
            signOutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.signOut();
            });
        }
    }

    /**
     * Setup window resize handler
     */
    setupWindowResize() {
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
            this.updateNavigation();
        });
    }

    /**
     * Update navigation based on user role and current page
     */
    updateNavigation() {
        const navLinks = document.getElementById('navLinks');
        if (!navLinks) return;

        const isMobile = window.innerWidth <= 768;
        const forceMobile = true; // For testing

        let navigationHTML = '';

        if (this.user.role === 'Admin') {
            navigationHTML = this.generateAdminNavigation(isMobile || forceMobile);
        } else if (this.user.role === 'Director') {
            navigationHTML = this.generateDirectorNavigation(isMobile || forceMobile);
        } else {
            navigationHTML = this.generateDefaultNavigation(isMobile || forceMobile);
        }

        navLinks.innerHTML = navigationHTML;
        this.setupMobileUserOptions(); // Re-setup event listeners for new elements
    }

    /**
     * Generate navigation HTML for Admin users
     */
    generateAdminNavigation(isMobile) {
        return `
            <a href="apps-list.html" class="nav-link ${this.currentPage === 'apps-list.html' ? 'active' : ''}">Apps</a>
            <a href="user-dashboard.html" class="nav-link ${this.currentPage === 'user-dashboard.html' ? 'active' : ''}">Dashboard</a>
            <a href="user-progress.html" class="nav-link ${this.currentPage === 'user-progress.html' ? 'active' : ''}">My Progress</a>
            <a href="quizzes.html" class="nav-link ${this.currentPage === 'quizzes.html' ? 'active' : ''}">Quizzes</a>
            <a href="admin-user-overview.html" class="nav-link ${this.currentPage === 'admin-user-overview.html' ? 'active' : ''}">User Overview</a>
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

    /**
     * Generate navigation HTML for Director users
     */
    generateDirectorNavigation(isMobile) {
        return this.generateAdminNavigation(isMobile); // Same as admin for now
    }

    /**
     * Generate navigation HTML for default users
     */
    generateDefaultNavigation(isMobile) {
        return this.generateAdminNavigation(isMobile); // Same as admin for now
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const navLinks = document.getElementById('navLinks');
        
        if (hamburgerMenu) hamburgerMenu.classList.remove('active', 'hidden');
        if (navLinks) navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
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

    /**
     * Sign out user
     */
    signOut() {
        localStorage.removeItem('username');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    /**
     * Open settings page
     */
    openSettings() {
        // Close the dropdown first
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.classList.remove('show');
        }

        // Navigate to standalone settings page
        window.location.href = 'settings.html';
    }

    /**
     * Get current page name
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop();
        return page || 'index.html';
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('currentUser');
            return userStr ? JSON.parse(userStr) : { role: 'User', username: 'Guest' };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return { role: 'User', username: 'Guest' };
        }
    }

    /**
     * Create fallback navbar if loading fails
     */
    createFallbackNavbar() {
        const headerElement = document.createElement('header');
        headerElement.className = 'header';
        headerElement.innerHTML = `
            <div class="header-content">
                <div class="logo">
                    <div class="logo-img">
                        <img src="../assets/CFA_CSymbol_Circle_Red_PMS.webp" alt="CFA Logo" width="40" height="40">
                    </div>
                    <span class="logo-text">CFA Bayou</span>
                </div>
                <nav class="nav-links" id="navLinks">
                    <a href="apps-list.html" class="nav-link">Apps</a>
                    <a href="user-dashboard.html" class="nav-link">Dashboard</a>
                    <a href="user-progress.html" class="nav-link">My Progress</a>
                    <a href="quizzes.html" class="nav-link">Quizzes</a>
                </nav>
            </div>
        `;
        document.body.insertBefore(headerElement, document.body.firstChild);
    }

    /**
     * Refresh navbar (public method for other scripts)
     */
    refresh() {
        this.user = this.getCurrentUser();
        this.updateNavigation();
        this.updateUserInfo();
    }

    /**
     * Update user information in the navbar
     */
    updateUserInfo() {
        try {
            // Get current user data
            const currentUser = this.getCurrentUser();
            
            // Update avatar
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) {
                const firstLetter = currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U';
                userAvatar.textContent = firstLetter;
            }
            
            // Update dropdown user name
            const dropdownUserName = document.getElementById('dropdownUserName');
            if (dropdownUserName) {
                dropdownUserName.textContent = currentUser.username || 'Guest';
            }
            
            // Update dropdown user role
            const dropdownUserRole = document.getElementById('dropdownUserRole');
            if (dropdownUserRole) {
                dropdownUserRole.textContent = currentUser.role || 'User';
            }
            
        } catch (error) {
            console.error('Error updating user info in navbar:', error);
        }
    }

    /**
     * Setup special styling for apps page
     */
    setupAppsPageStyling() {
        const currentPath = window.location.pathname;
        const isAppsPage = currentPath.includes('apps-list.html') || currentPath.includes('apps.html');
        
        if (isAppsPage) {
            const header = document.querySelector('header');
            const navLinks = document.getElementById('navLinks');
            const hamburgerMenu = document.getElementById('hamburgerMenu');
            
            if (header) {
                header.classList.add('apps-page-navbar');
            }
            
            if (navLinks) {
                navLinks.style.display = 'none';
            }
            
            if (hamburgerMenu) {
                hamburgerMenu.style.display = 'none';
            }
            
            // Keep user info visible but adjust layout
            const userInfo = document.querySelector('.user-info');
            if (userInfo) {
                userInfo.style.display = 'flex';
            }
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navbarComponent = new NavbarComponent();
});

// Make refresh method globally available
window.refreshNavbar = () => {
    if (window.navbarComponent) {
        window.navbarComponent.refresh();
    }
};
