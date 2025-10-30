// Force close image modal script
(function() {
    'use strict';
    
    // Force close any open image modal immediately
    function forceCloseImageModal() {
        const modal = document.getElementById('imageModal');
        if (modal) {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            const modalImage = document.getElementById('modalImage');
            if (modalImage) {
                modalImage.src = '';
            }
        }
    }
    
    // Run immediately
    forceCloseImageModal();
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceCloseImageModal);
    } else {
        forceCloseImageModal();
    }
    
    // Run after a short delay to catch any late-opening modals
    setTimeout(forceCloseImageModal, 100);
    setTimeout(forceCloseImageModal, 500);
    setTimeout(forceCloseImageModal, 1000);
})();
