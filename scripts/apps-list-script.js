document.addEventListener('DOMContentLoaded', async () => {
    // If you have a global auth gate, remove this block.
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) { window.location.href = 'index.html'; return; }

    await initializePage();   // page-specific data only
    setupEventListeners();    // coming soon cards, etc.
});

// Page-specific only
async function initializePage() {
    // Populate apps list/grid for this page (no navbar/avatar/theme work here)
}

function setupEventListeners() {
    document.querySelectorAll('.app-card.coming-soon')
      .forEach(card => card.addEventListener('click', (e) => {
          e.preventDefault();
          showToast('info', 'Coming Soon', 'This application is currently in development and will be available soon!');
      }));
}

function openApp(appName) {
    if (appName === 'leadership-development') {
        window.location.href = 'user-dashboard.html';
        return;
    }
    showToast('error', 'App Not Found', 'The requested application could not be found.');
}
window.openApp = openApp;