// Roadmap Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the roadmap
    initializeRoadmap();
    
    // Set up event listeners
    setupFilterControls();
    setupProgressSlider();
    setupFormSubmission();
    
    // Animate timeline items on scroll
    setupScrollAnimations();
});

// Initialize roadmap functionality
function initializeRoadmap() {
    // Update stats based on actual timeline items
    updateStats();
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
}

// Filter Controls
function setupFilterControls() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter timeline items
            timelineItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.classList.add('hidden');
                    }, 300);
                }
            });
            
            // Update stats after filtering
            setTimeout(updateStats, 400);
        });
    });
}

// Update statistics
function updateStats() {
    const visibleItems = document.querySelectorAll('.timeline-item:not(.hidden)');
    const completed = document.querySelectorAll('.timeline-item.completed:not(.hidden)').length;
    const inProgress = document.querySelectorAll('.timeline-item.in-progress:not(.hidden)').length;
    const upcoming = document.querySelectorAll('.timeline-item.upcoming:not(.hidden)').length;
    
    // Update stat numbers with animation
    animateNumber('.stat:nth-child(1) .stat-number', visibleItems.length);
    animateNumber('.stat:nth-child(2) .stat-number', completed);
    animateNumber('.stat:nth-child(3) .stat-number', inProgress);
}

// Animate number changes
function animateNumber(selector, targetNumber) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const startNumber = parseInt(element.textContent) || 0;
    const duration = 500;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = Math.round(startNumber + (targetNumber - startNumber) * easeOutQuart);
        
        element.textContent = currentNumber;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Progress slider functionality
function setupProgressSlider() {
    const progressSlider = document.getElementById('milestoneProgress');
    const progressValue = document.getElementById('progressValue');
    
    if (progressSlider && progressValue) {
        progressSlider.addEventListener('input', function() {
            progressValue.textContent = this.value + '%';
        });
    }
}

// Form submission
function setupFormSubmission() {
    const form = document.getElementById('milestoneForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewMilestone();
        });
    }
}

// Add new milestone
function addNewMilestone() {
    const title = document.getElementById('milestoneTitle').value;
    const date = document.getElementById('milestoneDate').value;
    const description = document.getElementById('milestoneDescription').value;
    const status = document.getElementById('milestoneStatus').value;
    const tags = document.getElementById('milestoneTags').value;
    const progress = document.getElementById('milestoneProgress').value;
    
    // Create new timeline item
    const timeline = document.querySelector('.timeline');
    const newItem = createTimelineItem({
        title,
        date,
        description,
        status,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        progress: parseInt(progress)
    });
    
    // Add to timeline
    timeline.appendChild(newItem);
    
    // Close modal
    closeAddModal();
    
    // Reset form
    document.getElementById('milestoneForm').reset();
    document.getElementById('progressValue').textContent = '0%';
    
    // Show success message
    showNotification('Milestone added successfully!', 'success');
    
    // Update stats
    setTimeout(updateStats, 100);
}

// Create timeline item element
function createTimelineItem(data) {
    const item = document.createElement('div');
    item.className = `timeline-item ${data.status}`;
    item.setAttribute('data-category', data.status);
    
    // Determine icon based on status
    let icon = 'fas fa-clock';
    if (data.status === 'completed') icon = 'fas fa-check';
    else if (data.status === 'in-progress') icon = 'fas fa-cog fa-spin';
    
    // Create tags HTML
    const tagsHtml = data.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    item.innerHTML = `
        <div class="timeline-marker">
            <i class="${icon}"></i>
        </div>
        <div class="timeline-content">
            <div class="timeline-header">
                <h3>${data.title}</h3>
                <span class="timeline-date">${data.date}</span>
                <span class="status-badge ${data.status}">${data.status.replace('-', ' ')}</span>
            </div>
            <p>${data.description}</p>
            <div class="timeline-tags">
                ${tagsHtml}
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${data.progress}%"></div>
            </div>
        </div>
    `;
    
    // Add animation
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    }, 100);
    
    return item;
}

// Modal functions
function openAddModal() {
    const modal = document.getElementById('addModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('milestoneTitle').focus();
    }, 100);
}

function closeAddModal() {
    const modal = document.getElementById('addModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('addModal');
    if (e.target === modal) {
        closeAddModal();
    }
});

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#667eea'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key closes modal
    if (e.key === 'Escape') {
        closeAddModal();
    }
    
    // Ctrl/Cmd + N opens new milestone modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
    }
});

// Export functions for global access
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;

