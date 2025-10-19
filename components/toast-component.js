/**
 * Toast Notification Component
 * Handles all toast notification functionality across the application
 */
class ToastComponent {
    constructor() {
        this.container = null;
        this.toasts = new Map(); // Track active toasts
        this.defaultDuration = 5000; // 5 seconds
        this.maxToasts = 5; // Maximum number of toasts to show at once
        
        this.init();
    }

    /**
     * Initialize the toast component
     */
    init() {
        console.log('Toast component initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup the toast component
     */
    setup() {
        this.container = document.getElementById('toastContainer');
        
        if (!this.container) {
            console.error('Toast container not found! Make sure toast-component.html is included.');
            return;
        }

        console.log('Toast component initialized successfully');
        
        // Make showToast globally available
        window.showToast = (type, title, message, duration) => this.show(type, title, message, duration);
        window.removeToast = (toast) => this.remove(toast);
    }

    /**
     * Show a toast notification
     * @param {string} type - Type of toast (success, error, warning, info)
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Duration in milliseconds (optional)
     */
    show(type = 'info', title = '', message = '', duration = this.defaultDuration) {
        console.log('ToastComponent.show called with:', { type, title, message, duration });
        
        if (!this.container) {
            console.error('Toast container not available');
            return;
        }

        // Remove oldest toast if we're at the limit
        if (this.toasts.size >= this.maxToasts) {
            const oldestToast = this.toasts.keys().next().value;
            this.remove(oldestToast);
        }

        // Create toast element
        const toast = this.createToast(type, title, message, duration);
        
        // Add to container
        this.container.appendChild(toast);
        
        // Track the toast
        const toastId = Date.now() + Math.random();
        this.toasts.set(toastId, toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
            console.log('Toast animation triggered');
        }, 100);

        // Start progress bar animation
        this.startProgressBar(toast, duration);

        // Auto remove after duration
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        console.log('Toast created and added to container');
        return toast;
    }

    /**
     * Create a toast element
     * @param {string} type - Type of toast
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Duration in milliseconds
     * @returns {HTMLElement} Toast element
     */
    createToast(type, title, message, duration) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="removeToast(this.parentElement)">×</button>
            <div class="toast-progress">
                <div class="toast-progress-bar"></div>
            </div>
        `;

        return toast;
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon character
     */
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Start progress bar animation
     * @param {HTMLElement} toast - Toast element
     * @param {number} duration - Duration in milliseconds
     */
    startProgressBar(toast, duration) {
        const progressBar = toast.querySelector('.toast-progress-bar');
        if (progressBar) {
            progressBar.style.animation = `toast-progress ${duration}ms linear forwards`;
        }
    }

    /**
     * Remove a toast
     * @param {HTMLElement} toast - Toast element to remove
     */
    remove(toast) {
        if (!toast || !toast.parentNode) return;

        // Remove from tracking
        for (const [id, trackedToast] of this.toasts.entries()) {
            if (trackedToast === toast) {
                this.toasts.delete(id);
                break;
            }
        }

        // Add exit animation
        toast.classList.add('hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Remove all toasts
     */
    removeAll() {
        this.toasts.forEach(toast => this.remove(toast));
    }

    /**
     * Get active toast count
     * @returns {number} Number of active toasts
     */
    getActiveCount() {
        return this.toasts.size;
    }
}

// Initialize toast component when script loads
const toastComponent = new ToastComponent();
