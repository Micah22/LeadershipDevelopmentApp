// Standardized Navbar Generation
function generateNavbarHTML(user, activePage) {
    let navigationHTML = '';
    
    if (!user) {
        return '<a href="index.html" class="nav-link">Login</a>';
    }

    if (user.role === 'Admin') {
        navigationHTML = `
            <a href="user-dashboard.html" class="nav-link ${activePage === 'Dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="my-progress.html" class="nav-link ${activePage === 'My Progress' ? 'active' : ''}">My Progress</a>
            <a href="admin-progress.html" class="nav-link ${activePage === 'Progress Overview' ? 'active' : ''}">Progress Overview</a>
            <a href="#" class="nav-link ${activePage === 'Resources' ? 'active' : ''}">Resources</a>
        `;
    } else if (user.role === 'Director' || user.role === 'Supervisor') {
        navigationHTML = `
            <a href="user-dashboard.html" class="nav-link ${activePage === 'Dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="my-progress.html" class="nav-link ${activePage === 'My Progress' ? 'active' : ''}">My Progress</a>
            <a href="admin-progress.html" class="nav-link ${activePage === 'Progress Overview' ? 'active' : ''}">Progress Overview</a>
            <a href="#" class="nav-link ${activePage === 'Resources' ? 'active' : ''}">Resources</a>
        `;
    } else {
        navigationHTML = `
            <a href="user-dashboard.html" class="nav-link ${activePage === 'Dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="my-progress.html" class="nav-link ${activePage === 'My Progress' ? 'active' : ''}">My Progress</a>
            <a href="#" class="nav-link ${activePage === 'Resources' ? 'active' : ''}">Resources</a>
        `;
    }
    
    return navigationHTML;
}

