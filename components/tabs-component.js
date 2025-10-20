/**
 * Tabs Component
 * Reusable tabs functionality for admin pages
 */
class TabsComponent {
    constructor(options = {}) {
        this.container = null;
        this.tabs = [];
        this.activeTab = null;
        this.options = {
            sticky: true,
            showRefresh: true,
            refreshCallback: null,
            tabChangeCallback: null,
            ...options
        };
        
        this.init();
    }

    /**
     * Initialize the tabs component
     */
    init() {
        console.log('Tabs component initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup the tabs component
     */
    setup() {
        this.container = document.getElementById('tabsContainer');
        
        if (!this.container) {
            console.error('Tabs container not found! Make sure tabs-component.html is included.');
            return;
        }

        console.log('Tabs component initialized successfully');
    }

    /**
     * Create tabs from configuration
     * @param {Array} tabsConfig - Array of tab configuration objects
     */
    createTabs(tabsConfig) {
        if (!this.container) return;

        // Clear existing tabs
        this.container.innerHTML = '';
        this.tabs = [];

        // Create tabs HTML
        const tabsHTML = tabsConfig.map(tab => `
            <button class="admin-tab" id="${tab.id}" data-tab="${tab.id}">
                <i class="${tab.icon}"></i>
                ${tab.label}
            </button>
        `).join('');

        // Add refresh button if enabled
        const refreshButton = this.options.showRefresh ? `
            <button class="refresh-btn" onclick="tabsComponent.refreshData()" title="Refresh data from database">
                <i class="fas fa-sync-alt"></i>
            </button>
        ` : '';

        this.container.innerHTML = `
            <div class="admin-tabs">
                ${tabsHTML}
                ${refreshButton}
            </div>
        `;

        // Store tab configuration
        this.tabs = tabsConfig;

        // Setup event listeners
        this.setupEventListeners();

        // Set first tab as active
        if (tabsConfig.length > 0) {
            this.setActiveTab(tabsConfig[0].id);
        }
    }

    /**
     * Setup event listeners for tabs
     */
    setupEventListeners() {
        const tabButtons = this.container.querySelectorAll('.admin-tab');
        
        tabButtons.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = tab.dataset.tab;
                this.setActiveTab(tabId);
            });
        });
    }

    /**
     * Set active tab
     * @param {string} tabId - ID of the tab to activate
     */
    setActiveTab(tabId) {
        // Remove active class from all tabs
        const allTabs = this.container.querySelectorAll('.admin-tab');
        allTabs.forEach(tab => tab.classList.remove('active'));

        // Add active class to clicked tab
        const activeTab = this.container.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            this.activeTab = tabId;

            // Hide all tab content
            const allTabContents = document.querySelectorAll('.tab-content');
            allTabContents.forEach(content => content.classList.remove('active'));

            // Show the corresponding tab content
            const contentId = tabId + 'Content';
            const targetContent = document.getElementById(contentId);
            
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // Call tab change callback if provided
            if (this.options.tabChangeCallback && typeof this.options.tabChangeCallback === 'function') {
                this.options.tabChangeCallback(tabId);
            }

            console.log(`Switched to tab: ${tabId}`);
        }
    }

    /**
     * Get current active tab
     * @returns {string} Active tab ID
     */
    getActiveTab() {
        return this.activeTab;
    }

    /**
     * Add a new tab
     * @param {Object} tabConfig - Tab configuration object
     */
    addTab(tabConfig) {
        this.tabs.push(tabConfig);
        this.createTabs(this.tabs);
    }

    /**
     * Remove a tab
     * @param {string} tabId - ID of tab to remove
     */
    removeTab(tabId) {
        this.tabs = this.tabs.filter(tab => tab.id !== tabId);
        this.createTabs(this.tabs);
    }

    /**
     * Refresh data callback
     */
    refreshData() {
        if (this.options.refreshCallback && typeof this.options.refreshCallback === 'function') {
            this.options.refreshCallback();
        } else {
            console.log('Refresh callback not provided');
        }
    }

    /**
     * Update tab label
     * @param {string} tabId - ID of tab to update
     * @param {string} newLabel - New label text
     */
    updateTabLabel(tabId, newLabel) {
        const tab = this.container.querySelector(`[data-tab="${tabId}"]`);
        if (tab) {
            const icon = tab.querySelector('i');
            tab.innerHTML = `${icon.outerHTML} ${newLabel}`;
        }
    }

    /**
     * Show/hide tab
     * @param {string} tabId - ID of tab to show/hide
     * @param {boolean} visible - Whether to show or hide
     */
    setTabVisibility(tabId, visible) {
        const tab = this.container.querySelector(`[data-tab="${tabId}"]`);
        if (tab) {
            tab.style.display = visible ? 'flex' : 'none';
        }
    }
}

// Make TabsComponent globally available
window.TabsComponent = TabsComponent;

// Create global instance for easy access
let tabsComponent = null;

// Initialize tabs component when script loads
document.addEventListener('DOMContentLoaded', function() {
    if (typeof TabsComponent !== 'undefined') {
        tabsComponent = new TabsComponent();
    }
});
