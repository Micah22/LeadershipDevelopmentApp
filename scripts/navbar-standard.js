// Shared Navbar Functions - STANDARDIZED STYLE
// This file contains the standardized navbar styling and functions

// Standard navbar HTML structure
function getStandardNavbarHTML(user, activePage = '') {
    let navigationHTML = '';
    
    if (user.role === 'Admin') {
        navigationHTML = `
            <a href="user-dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="user-progress.html" class="nav-link ${activePage === 'progress' ? 'active' : ''}">My Progress</a>
            <a href="quizzes.html" class="nav-link ${activePage === 'quizzes' ? 'active' : ''}">Quizzes</a>
            <a href="admin-progress.html" class="nav-link ${activePage === 'overview' ? 'active' : ''}">Progress Overview</a>
            <a href="#" class="nav-link ${activePage === 'resources' ? 'active' : ''}">Resources</a>
        `;
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = `
            <a href="user-dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="user-progress.html" class="nav-link ${activePage === 'progress' ? 'active' : ''}">My Progress</a>
            <a href="quizzes.html" class="nav-link ${activePage === 'quizzes' ? 'active' : ''}">Quizzes</a>
            <a href="admin-progress.html" class="nav-link ${activePage === 'overview' ? 'active' : ''}">Progress Overview</a>
            <a href="#" class="nav-link ${activePage === 'resources' ? 'active' : ''}">Resources</a>
        `;
    } else {
        navigationHTML = `
            <a href="user-dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="user-progress.html" class="nav-link ${activePage === 'progress' ? 'active' : ''}">My Progress</a>
            <a href="quizzes.html" class="nav-link ${activePage === 'quizzes' ? 'active' : ''}">Quizzes</a>
            <a href="#" class="nav-link ${activePage === 'resources' ? 'active' : ''}">Resources</a>
        `;
    }
    
    return navigationHTML;
}

// Standard header HTML structure
function getStandardHeaderHTML(user) {
    return `
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <div class="logo-img">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="20" fill="#E51636"/>
                            <path d="M12 16h16v2H12v-2zm0 4h16v2H12v-2zm0 4h12v2H12v-2z" fill="white"/>
                        </svg>
                    </div>
                    <span class="logo-text">Leadership Development</span>
                </div>
                <nav class="nav-links" id="navLinks">
                    <!-- Navigation will be populated by JavaScript -->
                </nav>
                <div class="user-info">
                    <div class="user-avatar" id="userAvatar">${user.fullName.charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                        <span class="user-name" id="userName">${user.fullName}</span>
                        <span class="user-role" id="userRole">${user.role}</span>
                    </div>
                    <button class="sign-out-btn" id="signOutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </header>
    `;
}

// Standard CSS variables
const STANDARD_CSS_VARS = `
:root {
    --cfa-red: #E51636;
    --navy: #002A5C;
    --light-gray: #F8F9FA;
    --medium-gray: #6C757D;
    --dark-gray: #343A40;
    --white: #FFFFFF;
    --success: #28A745;
    --warning: #FFC107;
    --danger: #DC3545;
    --info: #17A2B8;
}
`;

// Standard header CSS
const STANDARD_HEADER_CSS = `
/* Header Styles - STANDARDIZED */
.header {
    background: linear-gradient(135deg, var(--navy) 0%, #003366 100%);
    color: var(--white);
    padding: 1rem 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logo-img {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--white);
}

.nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
    flex-wrap: nowrap;
    overflow-x: auto;
}

.nav-link {
    color: var(--white);
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    white-space: nowrap;
    flex-shrink: 0;
}

.nav-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
}

.nav-link.active {
    background-color: var(--cfa-red);
    color: var(--white);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-avatar {
    width: 40px;
    height: 40px;
    background: var(--cfa-red);
    color: var(--white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
}

.user-details {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-name {
    font-weight: 600;
    font-size: 0.9rem;
}

.user-role {
    font-size: 0.8rem;
    opacity: 0.8;
}

.sign-out-btn {
    background: none;
    border: none;
    color: var(--white);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.sign-out-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }
    
    .nav-links {
        gap: 1rem;
    }
}
`;

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getStandardNavbarHTML,
        getStandardHeaderHTML,
        STANDARD_CSS_VARS,
        STANDARD_HEADER_CSS
    };
}
